import clientPromise from "@/lib/mongodb"

export async function checkVehicleAvailability(
  vehicleType: string,
  date: string,
  time: string
) {
  const client = await clientPromise

  const db = client.db("hayesride")

  const vehicles = await db
    .collection("vehicles")
    .find({
      type: vehicleType,
      status: "available",
    })
    .toArray()

  const bookings = await db
    .collection("bookings")
    .find({
      date,
      time,
      vehicleType,
      status: {
        $in: ["pending", "confirmed"],
      },
    })
    .toArray()

  const bookedCount = bookings.length

  const availableVehicles =
    vehicles.slice(bookedCount)

  return {
    available: availableVehicles.length > 0,
    vehicles: availableVehicles,
  }
}