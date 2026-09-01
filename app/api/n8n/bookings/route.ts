import { NextResponse } from "next/server"
import { z } from "zod"

import {
  n8nAuthErrorResponse,
  requireN8nServiceAuth,
} from "@/lib/auth/n8n-service-auth"
import {
  createBooking,
} from "@/lib/booking/booking-service"
import {
  bookingSchema,
} from "@/lib/booking/validation"

export const dynamic = "force-dynamic"

export async function POST(
  request: Request
) {
  try {
    requireN8nServiceAuth(request)

    const input = bookingSchema.parse(
      await request.json()
    )

    const booking =
      await createBooking(input)

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    )
  } catch (error) {
    const authResponse =
      n8nAuthErrorResponse(error)

    if (authResponse) {
      return authResponse
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid booking information.",
          details: error.flatten(),
        },
        { status: 400 }
      )
    }

    if (
      error instanceof Error &&
      error.message.includes(
        "No vehicles available"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 409 }
      )
    }

    console.error(
      "n8n create booking error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to create booking.",
      },
      { status: 500 }
    )
  }
}
