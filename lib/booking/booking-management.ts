import clientPromise from "@/lib/mongodb"
import type { BookingStatus } from "./types"
import type { ValidatedBookingUpdate } from "./validation"

const COLLECTION = "bookings"

function normalizeReference(reference: string) {
  return reference.trim().toUpperCase()
}

function bookingFilter(
  reference: string,
  customerEmail?: string
) {
  return {
    reference: normalizeReference(reference),
    ...(customerEmail
      ? {
          "customer.email": customerEmail,
        }
      : {}),
  }
}

export async function getAllBookings() {
  const client = await clientPromise
  const db = client.db("hayesride")

  return db
    .collection(COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray()
}

export async function getBookingByReference(
  reference: string,
  customerEmail?: string
) {
  const client = await clientPromise
  const db = client.db("hayesride")

  return db
    .collection(COLLECTION)
    .findOne(
      bookingFilter(
        reference,
        customerEmail
      )
    )
}

export async function updateBookingByReference(
  reference: string,
  updates: ValidatedBookingUpdate
) {
  const client = await clientPromise
  const db = client.db("hayesride")

  return db
    .collection(COLLECTION)
    .findOneAndUpdate(
      bookingFilter(reference),
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    )
}

export async function cancelBookingByReference(
  reference: string,
  customerEmail?: string
) {
  const client = await clientPromise
  const db = client.db("hayesride")

  return db
    .collection(COLLECTION)
    .findOneAndUpdate(
      bookingFilter(
        reference,
        customerEmail
      ),
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
}

export async function updateBookingStatus(
  reference: string,
  status: BookingStatus
) {
  return updateBookingByReference(
    reference,
    {
      status,
    }
  )
}

export async function deleteBooking(
  reference: string
) {
  const client = await clientPromise
  const db = client.db("hayesride")

  const result = await db.collection(COLLECTION).deleteOne({
    reference: normalizeReference(reference),
  })

  return result.deletedCount > 0
}
