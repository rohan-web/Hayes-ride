import {
  createHash,
  timingSafeEqual,
} from "node:crypto"
import { NextResponse } from "next/server"

export class N8nServiceAuthError extends Error {
  constructor(
    public readonly code:
      | "N8N_SERVICE_NOT_CONFIGURED"
      | "N8N_AUTHENTICATION_REQUIRED"
  ) {
    super(code)
    this.name = "N8nServiceAuthError"
  }
}

function digestSecret(secret: string) {
  return createHash("sha256")
    .update(secret)
    .digest()
}

export function requireN8nServiceAuth(
  request: Request
) {
  const configuredSecret =
    process.env.N8N_API_SECRET

  if (!configuredSecret) {
    throw new N8nServiceAuthError(
      "N8N_SERVICE_NOT_CONFIGURED"
    )
  }

  const suppliedSecret =
    request.headers.get("x-n8n-secret")

  if (
    !suppliedSecret ||
    !timingSafeEqual(
      digestSecret(suppliedSecret),
      digestSecret(configuredSecret)
    )
  ) {
    throw new N8nServiceAuthError(
      "N8N_AUTHENTICATION_REQUIRED"
    )
  }
}

export function n8nAuthErrorResponse(
  error: unknown
) {
  if (!(error instanceof N8nServiceAuthError)) {
    return null
  }

  if (
    error.code ===
    "N8N_SERVICE_NOT_CONFIGURED"
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "N8N service authentication is not configured.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  }

  return NextResponse.json(
    {
      success: false,
      error:
        "N8N_AUTHENTICATION_REQUIRED",
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
