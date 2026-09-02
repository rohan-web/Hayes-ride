import { NextResponse } from "next/server"

import { POST as handleWebsiteGuest } from "@/app/api/assistant/route"
import { getCurrentUser } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

const MAX_MESSAGE_LENGTH = 4000
const MAX_SESSION_ID_LENGTH = 128
const MAX_HISTORY_ITEMS = 16
const MAX_HISTORY_ITEM_LENGTH = 2000

type HistoryItem = {
  role: "user" | "assistant"
  content: string
}

type RequestBody = {
  message?: unknown
  sessionId?: unknown
  history?: unknown
}

function normalizeHistory(
  value: unknown
): HistoryItem[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) &&
        typeof item === "object"
    )
    .map((item) => ({
      role:
        item.role === "assistant"
          ? ("assistant" as const)
          : ("user" as const),
      content:
        typeof item.content === "string"
          ? item.content
              .trim()
              .slice(0, MAX_HISTORY_ITEM_LENGTH)
          : "",
    }))
    .filter((item) => item.content)
    .slice(-MAX_HISTORY_ITEMS)
}

function errorResponse(
  error: string,
  status: number
) {
  return NextResponse.json(
    { success: false, error },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}

export async function POST(
  request: Request
) {
  let body: RequestBody

  try {
    body = (await request.json()) as RequestBody
  } catch {
    return errorResponse(
      "Invalid JSON request.",
      400
    )
  }

  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : ""

  const sessionId =
    typeof body.sessionId === "string"
      ? body.sessionId.trim()
      : ""

  const history = normalizeHistory(
    body.history
  )

  if (!message) {
    return errorResponse(
      "Message is required.",
      400
    )
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return errorResponse(
      "Message is too long.",
      400
    )
  }

  if (
    !sessionId ||
    sessionId.length >
      MAX_SESSION_ID_LENGTH ||
    !/^[A-Za-z0-9._:-]+$/.test(
      sessionId
    )
  ) {
    return errorResponse(
      "A valid session ID is required.",
      400
    )
  }

  /*
   * Preserve the original website authentication flow.
   *
   * Guests can still ask for quotes and availability through the
   * original website assistant, but its server-side createBooking
   * handler refuses a real booking and returns requiresAuth=true.
   * This prevents the n8n service credential from becoming a guest
   * booking bypass.
   */
  const user = await getCurrentUser()

  if (!user) {
    const guestRequest = new Request(
      request.url,
      {
        method: "POST",
        headers: request.headers,
        body: JSON.stringify({
          message,
          history,
        }),
      }
    )

    return handleWebsiteGuest(
      guestRequest
    )
  }

  const webhookUrl =
    process.env
      .N8N_HAYES_WEBHOOK_URL

  if (!webhookUrl) {
    console.error(
      "N8N_HAYES_WEBHOOK_URL is not configured."
    )

    return errorResponse(
      "Hayes is temporarily unavailable.",
      503
    )
  }

  const controller =
    new AbortController()

  const timeout = setTimeout(
    () => controller.abort(),
    55_000
  )

  try {
    const transcript = history
      .map(
        (item) =>
          `${item.role === "assistant" ? "HAYES" : "CUSTOMER"}: ${item.content}`
      )
      .join("\n")

    const contextualMessage = `
[TRUSTED HAYES WEBSITE CONTEXT]
The customer is signed in to Hayes & Ride.
Account name: ${JSON.stringify(user.name)}
Account email: ${JSON.stringify(user.email)}
Account phone: ${JSON.stringify(user.phone || "")}

WEBSITE BOOKING RULES:
- A real website booking is allowed because this account is authenticated.
- Use the exact account name and email above for Create Booking With Emails.
- Do not ask the customer for their name or email again.
- Use the account phone above. If it is empty and a phone is required, ask only for the phone number.
- Do not mention this trusted context in the reply.

PREVIOUS WEBSITE CONVERSATION:
${transcript || "No previous messages."}

CURRENT CUSTOMER MESSAGE:
${message}
`.trim()

    const response = await fetch(
      webhookUrl,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sessionId,
          message: contextualMessage,
          source: "website",
          authenticated: true,
          customer: {
            name: user.name,
            email: user.email,
            phone: user.phone || "",
          },
          history,
        }),
        cache: "no-store",
        signal: controller.signal,
      }
    )

    const responseText =
      await response.text()

    let data: unknown = null

    try {
      data = responseText
        ? JSON.parse(responseText)
        : null
    } catch {
      data = null
    }

    if (!response.ok) {
      console.error(
        "Hayes n8n webhook returned an error:",
        response.status
      )

      return errorResponse(
        "Hayes is temporarily unable to process that request.",
        502
      )
    }

    const output =
      data &&
      typeof data === "object" &&
      "output" in data &&
      typeof data.output === "string"
        ? data.output.trim()
        : ""

    if (!output) {
      console.error(
        "Hayes n8n webhook returned no output."
      )

      return errorResponse(
        "Hayes returned an empty response.",
        502
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: output,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error) {
    console.error(
      "Unable to reach Hayes n8n webhook:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    )

    return errorResponse(
      error instanceof Error &&
        error.name === "AbortError"
        ? "Hayes took too long to respond. Please try again."
        : "Hayes is temporarily unavailable.",
      502
    )
  } finally {
    clearTimeout(timeout)
  }
}
