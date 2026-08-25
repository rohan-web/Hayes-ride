import clientPromise from "@/lib/mongodb"
import { calculateQuote } from "@/lib/pricing/quote-engine"
import { generateBookingReference } from "./reference"
import { checkVehicleAvailability } from "./availability-service"
import type { ValidatedBookingInput } from "./validation"

export async function createBooking(
  input: ValidatedBookingInput
) {
  const client = await clientPromise

  const db = client.db("hayesride")

  const availability =
    await checkVehicleAvailability(
      input.vehicleType,
      input.date,
      input.time
    )

  if (!availability.available) {
    throw new Error(
      "No vehicles available for the selected date and time"
    )
  }

  const quote = await calculateQuote({
    pickup: input.pickup,
    destination: input.destination,
    passengers: input.passengers,
    vehicleType: input.vehicleType,
  })

  const vehicle = availability.vehicles[0]

  const booking = {
    reference: generateBookingReference(),

    pickup: input.pickup,
    destination: input.destination,

    date: input.date,
    time: input.time,

    passengers: input.passengers,
    vehicleType: input.vehicleType,

    vehicleId: vehicle._id.toString(),
    vehicleName: vehicle.name,

    customer: input.customer,

    quote: {
      amount: quote.amount,
      currency: quote.currency,
    },

    status: "pending",

    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db
    .collection("bookings")
    .insertOne(booking)

  return {
    ...booking,
    id: result.insertedId.toString(),
  }
}