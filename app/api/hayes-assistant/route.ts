import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const MAX_MESSAGE_LENGTH = 4000
const MAX_SESSION_ID_LENGTH = 128

type RequestBody = {
  message?: unknown
  sessionId?: unknown
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
          message,
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
