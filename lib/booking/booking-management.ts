import clientPromise from "@/lib/mongodb"
import type { BookingStatus } from "./types"

const COLLECTION = "bookings"

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
  reference: string
) {
  const client = await clientPromise
  const db = client.db("hayesride")

  return db.collection(COLLECTION).findOne({
    reference,
  })
}

export async function updateBookingStatus(
  reference: string,
  status: BookingStatus
) {
  const client = await clientPromise
  const db = client.db("hayesride")

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    {
      reference,
    },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
    {
      returnDocument: "after",
    }
  )

  return result
}

export async function deleteBooking(
  reference: string
) {
  const client = await clientPromise
  const db = client.db("hayesride")

  const result = await db.collection(COLLECTION).deleteOne({
    reference,
  })

  return result.deletedCount > 0
}