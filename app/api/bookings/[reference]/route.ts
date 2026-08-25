
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import {
  requireUser,
} from "@/lib/auth/session"

type Context = {
  params: Promise<{
    reference: string
  }>
}

/*
 * GET — customer can view their own booking.
 */
export async function GET(
  request: Request,
  context: Context
) {
  try {
    const user = await requireUser()

    const { reference } = await context.params

    const client = await clientPromise
    const db = client.db("hayesride")

    const booking = await db
      .collection("bookings")
      .findOne({
        reference,
        "customer.email": user.email,
      })

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        id: booking._id.toString(),
      },
    })
  } catch (error) {
    console.error(
      "Get booking API error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve booking.",
      },
      { status: 500 }
    )
  }
}

/*
 * PATCH — ADMIN ONLY.
 *
 * Admin can update any booking.
 */
export async function PATCH(
  request: Request,
  context: Context
) {
  try {
    const user = await requireUser()

    /*
     * IMPORTANT:
     * Admin actions must use requireAdmin logic.
     */
    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin access required.",
        },
        { status: 403 }
      )
    }

    const { reference } = await context.params
    const body = await request.json()

    const allowedFields = [
      "date",
      "time",
      "pickup",
      "destination",
      "passengers",
      "status",
    ]

    const updates: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (
        body[field] !== undefined &&
        body[field] !== null
      ) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid booking updates provided.",
        },
        { status: 400 }
      )
    }

    updates.updatedAt = new Date()

    const client = await clientPromise
    const db = client.db("hayesride")

    /*
     * IMPORTANT:
     * Do NOT include customer.email here.
     *
     * The admin is allowed to update any booking.
     */
    const result = await db
      .collection("bookings")
      .findOneAndUpdate(
        {
          reference,
        },
        {
          $set: updates,
        },
        {
          returnDocument: "after",
        }
      )

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: {
        ...result,
        id: result._id.toString(),
      },
    })
  } catch (error) {
    console.error(
      "Update booking API error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update booking.",
      },
      { status: 500 }
    )
  }
}

/*
 * DELETE — customer can cancel their own booking.
 */
export async function DELETE(
  request: Request,
  context: Context
) {
  try {
    const user = await requireUser()

    const { reference } = await context.params

    const client = await clientPromise
    const db = client.db("hayesride")

    const result = await db
      .collection("bookings")
      .findOneAndUpdate(
        {
          reference,
          "customer.email": user.email,
        },
        {
          $set: {
            status: "cancelled",
            updatedAt: new Date(),
          },
        },
        {
          returnDocument: "after",
        }
      )

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Booking not found.",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: {
        ...result,
        id: result._id.toString(),
      },
    })
  } catch (error) {
    console.error(
      "Cancel booking API error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error: "Unable to cancel booking.",
      },
      { status: 500 }
    )
  }
}

