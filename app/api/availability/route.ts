import { NextResponse } from "next/server"
import { z } from "zod"
import { checkVehicleAvailability } from "@/lib/booking/availability-service"

const availabilitySchema = z.object({
  vehicleType: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const input = availabilitySchema.parse(body)

    const result = await checkVehicleAvailability(
      input.vehicleType,
      input.date,
      input.time
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Availability API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Unable to check availability",
      },
      { status: 500 }
    )
  }
}