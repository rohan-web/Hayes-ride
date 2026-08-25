import { NextResponse } from "next/server"
import {
  getPricingSettings,
  updatePricingSettings,
} from "@/lib/pricing/pricing-service"

export async function GET() {
  try {
    const pricing =
      await getPricingSettings()

    return NextResponse.json({
      success: true,
      pricing,
    })
  } catch (error) {
    console.error(
      "Pricing GET error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to load pricing settings.",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const body =
      await request.json()

    const baseFare =
      Number(body.baseFare)

    const pricePerKm =
      Number(body.pricePerKm)

    const airportSurcharge =
      Number(
        body.airportSurcharge ?? 0
      )

    const vehicleAdjustments =
      body.vehicleAdjustments || {}

    if (
      !Number.isFinite(baseFare) ||
      baseFare < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid base fare.",
        },
        { status: 400 }
      )
    }

    if (
      !Number.isFinite(pricePerKm) ||
      pricePerKm < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid price per kilometer.",
        },
        { status: 400 }
      )
    }

    if (
      !Number.isFinite(
        airportSurcharge
      ) ||
      airportSurcharge < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid airport surcharge.",
        },
        { status: 400 }
      )
    }

    const pricing =
      await updatePricingSettings({
        baseFare,
        pricePerKm,
        airportSurcharge,

        vehicleAdjustments: {
          "executive-sedan":
            Number(
              vehicleAdjustments[
                "executive-sedan"
              ] ?? 0
            ),

          "business-class":
            Number(
              vehicleAdjustments[
                "business-class"
              ] ?? 10
            ),

          "executive-mpv":
            Number(
              vehicleAdjustments[
                "executive-mpv"
              ] ?? 15
            ),
        },
      })

    return NextResponse.json({
      success: true,
      pricing,
    })
  } catch (error) {
    console.error(
      "Pricing PATCH error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to update pricing settings.",
      },
      { status: 500 }
    )
  }
}