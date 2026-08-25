import { NextResponse } from "next/server"
import { checkVehicleAvailability } from "@/lib/booking/availability-service"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)

    const date = url.searchParams.get("date")
    const time = url.searchParams.get("time")
    const vehicleType =
      url.searchParams.get("vehicleType") ||
      "executive-mpv"

    if (!date || !time) {
      return NextResponse.json(
        {
          success: false,
          error:
            "date and time are required",
        },
        { status: 400 }
      )
    }

    const availability =
      await checkVehicleAvailability(
        vehicleType,
        date,
        time
      )

    return NextResponse.json({
      success: true,
      available:
        availability.available,
      vehicles:
        availability.vehicles,
    })
  } catch (error) {
    console.error(
      "Vehicle availability API error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to check vehicle availability",
      },
      { status: 500 }
    )
  }
}