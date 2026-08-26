
import { NextResponse } from "next/server"
import { z } from "zod"

import { bookingSchema } from "@/lib/booking/validation"
import { createBooking } from "@/lib/booking/booking-service"
import { getAllBookings } from "@/lib/booking/booking-management"
import { requireUser } from "@/lib/auth/session"

export async function GET() {
  try {
    await requireUser()

    const bookings = await getAllBookings()

    return NextResponse.json({
      success: true,
      bookings,
    })
  } catch (error) {
    console.error("Get bookings error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve bookings",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    /*
     * Customer must be authenticated before creating
     * a real booking.
     */
    const user = await requireUser()

    const body = await request.json()

    const input = bookingSchema.parse(body)

    /*
     * Do NOT trust customer identity coming from
     * the browser or Gemini.
     *
     * The logged-in account is the real customer.
     */
    const booking = await createBooking({
      ...input,

      customer: {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      },
    })

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 201 }
    )
  }  catch (error) {
  console.error(
    "Booking API error:",
    error
  )

  if (
    error instanceof Error &&
    error.message ===
      "AUTHENTICATION_REQUIRED"
  ) {
    return NextResponse.json(
      {
        success: false,
        error:
          "AUTHENTICATION_REQUIRED",
      },
      {
        status: 401,
      }
    )
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Invalid booking information",
        details:
          error.flatten(),
      },
      {
        status: 400,
      }
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
      {
        status: 409,
      }
    )
  }

  return NextResponse.json(
    {
      success: false,
      error:
        "Unable to create booking",
    },
    {
      status: 500,
    }
  )
}
}
