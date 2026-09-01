import { NextResponse } from "next/server"
import { z } from "zod"

import {
  n8nAuthErrorResponse,
  requireN8nServiceAuth,
} from "@/lib/auth/n8n-service-auth"
import {
  cancelBookingByReference,
  getBookingByReference,
  updateBookingByReference,
} from "@/lib/booking/booking-management"
import {
  bookingUpdateSchema,
} from "@/lib/booking/validation"

export const dynamic = "force-dynamic"

type Context = {
  params: Promise<{
    reference: string
  }>
}

function bookingResponse(
  booking: Record<string, unknown>
) {
  return {
    ...booking,
    id:
      typeof booking._id === "object" &&
      booking._id &&
      "toString" in booking._id
        ? String(booking._id)
        : booking.id,
  }
}

export async function GET(
  request: Request,
  context: Context
) {
  try {
    requireN8nServiceAuth(request)

    const { reference } =
      await context.params

    const booking =
      await getBookingByReference(
        reference
      )

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        booking:
          bookingResponse(booking),
      },
      {
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

    console.error(
      "n8n get booking error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to retrieve booking.",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    requireN8nServiceAuth(request)

    const { reference } =
      await context.params
    const updates =
      bookingUpdateSchema.parse(
        await request.json()
      )

    const booking =
      await updateBookingByReference(
        reference,
        updates
      )

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        booking:
          bookingResponse(booking),
      },
      {
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
            "Invalid booking updates.",
          details: error.flatten(),
        },
        { status: 400 }
      )
    }

    console.error(
      "n8n update booking error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update booking.",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: Context
) {
  try {
    requireN8nServiceAuth(request)

    const { reference } =
      await context.params

    const booking =
      await cancelBookingByReference(
        reference
      )

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        booking:
          bookingResponse(booking),
      },
      {
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

    console.error(
      "n8n cancel booking error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to cancel booking.",
      },
      { status: 500 }
    )
  }
}
