import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const RETELL_CREATE_WEB_CALL_URL =
  "https://api.retellai.com/v2/create-web-call"

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX_CALLS = 5

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimits = new Map<string, RateLimitEntry>()

function getClientKey(request: NextRequest) {
  return (
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

function isRateLimited(clientKey: string) {
  const now = Date.now()
  const current = rateLimits.get(clientKey)

  if (!current || current.resetAt <= now) {
    rateLimits.set(clientKey, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })

    return false
  }

  if (current.count >= RATE_LIMIT_MAX_CALLS) {
    return true
  }

  current.count += 1
  return false
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")

  if (!origin) {
    return false
  }

  const configuredOrigins =
    process.env.RETELL_ALLOWED_ORIGINS
      ?.split(",")
      .map((value) => value.trim())
      .filter(Boolean) || []

  if (configuredOrigins.length > 0) {
    return configuredOrigins.includes(origin)
  }

  return origin === request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json(
      {
        success: false,
        error: "Voice calls are not allowed from this origin.",
      },
      { status: 403 }
    )
  }

  const apiKey = process.env.RETELL_API_KEY?.trim()
  const agentId = process.env.RETELL_AGENT_ID?.trim()

  if (!apiKey || !agentId) {
    return NextResponse.json(
      {
        success: false,
        error: "The Hayes voice demo is not configured yet.",
      },
      { status: 503 }
    )
  }

  const clientKey = getClientKey(request)

  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Too many voice demo calls. Please try again in 15 minutes.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": "900",
        },
      }
    )
  }

  try {
    const response = await fetch(
      RETELL_CREATE_WEB_CALL_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          metadata: {
            source: "hayes-ride-website",
          },
        }),
        cache: "no-store",
      }
    )

    const data = await response.json().catch(() => null)

    if (
      !response.ok ||
      !data ||
      typeof data.access_token !== "string"
    ) {
      console.error(
        "Unable to create Retell web call:",
        response.status,
        data
      )

      return NextResponse.json(
        {
          success: false,
          error:
            response.status === 402
              ? "The voice demo has no remaining call credit."
              : "The Hayes voice demo is temporarily unavailable.",
        },
        { status: response.status === 429 ? 429 : 502 }
      )
    }

    return NextResponse.json({
      success: true,
      accessToken: data.access_token,
      callId: data.call_id,
    })
  } catch (error) {
    console.error(
      "Unable to reach Retell:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          "The Hayes voice demo is temporarily unavailable.",
      },
      { status: 502 }
    )
  }
}
