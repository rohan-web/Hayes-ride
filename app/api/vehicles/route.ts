import { NextResponse } from "next/server"
import {
  getVehicles,
  getAvailableVehicles,
} from "@/lib/vehicle/vehicle-service"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)

    const availableOnly =
      url.searchParams.get("available") === "true"

    const vehicles = availableOnly
      ? await getAvailableVehicles()
      : await getVehicles()

    return NextResponse.json({
      success: true,
      vehicles,
    })
  } catch (error) {
    console.error("Vehicles API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Unable to retrieve vehicles",
      },
      { status: 500 }
    )
  }
}