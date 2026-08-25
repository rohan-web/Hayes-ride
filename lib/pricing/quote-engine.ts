import type { VehicleType } from "@/lib/booking/types"
import {
  getPricingSettings,
} from "./pricing-service"
import {
  calculateRoadDistance,
} from "./distance-service"

interface QuoteInput {
  pickup: string
  destination: string
  passengers: number
  vehicleType: VehicleType
}

export interface QuoteResult {
  amount: number
  currency: "GBP"
  vehicleType: VehicleType

  distanceKm: number
  durationMinutes: number

  baseFare: number
  distanceFare: number
  vehicleAdjustment: number
  airportSurcharge: number

  estimated: boolean
}

export async function calculateQuote(
  input: QuoteInput
): Promise<QuoteResult> {
  if (input.passengers < 1) {
    throw new Error(
      "Passenger count must be at least 1."
    )
  }

  const [
    pricing,
    distance,
  ] = await Promise.all([
    getPricingSettings(),

    calculateRoadDistance(
      input.pickup,
      input.destination
    ),
  ])

  const distanceFare =
    distance.distanceKm *
    pricing.pricePerKm

  const vehicleAdjustment =
    pricing.vehicleAdjustments[
      input.vehicleType
    ] ?? 0

  const isAirportJourney =
    /airport|heathrow|gatwick|stansted|luton|city airport/i.test(
      `${input.pickup} ${input.destination}`
    )

  const airportSurcharge =
    isAirportJourney
      ? pricing.airportSurcharge
      : 0

  const amount =
    pricing.baseFare +
    distanceFare +
    vehicleAdjustment +
    airportSurcharge

  return {
    amount:
      Math.round(amount * 100) / 100,

    currency: "GBP",

    vehicleType:
      input.vehicleType,

    distanceKm:
      distance.distanceKm,

    durationMinutes:
      distance.durationMinutes,

    baseFare:
      pricing.baseFare,

    distanceFare:
      Math.round(
        distanceFare * 100
      ) / 100,

    vehicleAdjustment,

    airportSurcharge,

    estimated: true,
  }
}