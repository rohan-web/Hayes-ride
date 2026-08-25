import clientPromise from "@/lib/mongodb"

export interface PricingSettings {
  baseFare: number
  pricePerKm: number
  airportSurcharge: number
  vehicleAdjustments: {
    "executive-sedan": number
    "business-class": number
    "executive-mpv": number
  }
  currency: "GBP"
  updatedAt?: Date
  createdAt?: Date
}

const COLLECTION = "pricing"
const SETTINGS_ID = "default"

const DEFAULT_PRICING: PricingSettings = {
  baseFare: 10,
  pricePerKm: 2,
  airportSurcharge: 0,
  vehicleAdjustments: {
    "executive-sedan": 0,
    "business-class": 10,
    "executive-mpv": 15,
  },
  currency: "GBP",
}

export async function getPricingSettings(): Promise<PricingSettings> {
  const client = await clientPromise
  const db = client.db("hayesride")

  const settings = await db
    .collection<PricingSettings & { _id: string }>(COLLECTION)
    .findOne({
      _id: SETTINGS_ID,
    })

  if (!settings) {
    await db.collection<PricingSettings & { _id: string }>(COLLECTION).insertOne({
      _id: SETTINGS_ID,
      ...DEFAULT_PRICING,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return DEFAULT_PRICING
  }

  return {
    baseFare: Number(settings.baseFare ?? DEFAULT_PRICING.baseFare),
    pricePerKm: Number(
      settings.pricePerKm ?? DEFAULT_PRICING.pricePerKm
    ),
    airportSurcharge: Number(
      settings.airportSurcharge ??
        DEFAULT_PRICING.airportSurcharge
    ),
    vehicleAdjustments: {
      "executive-sedan": Number(
        settings.vehicleAdjustments?.["executive-sedan"] ?? 0
      ),
      "business-class": Number(
        settings.vehicleAdjustments?.["business-class"] ?? 10
      ),
      "executive-mpv": Number(
        settings.vehicleAdjustments?.["executive-mpv"] ?? 15
      ),
    },
    currency: "GBP",
    updatedAt: settings.updatedAt,
  }
}

export async function updatePricingSettings(
  input: Partial<PricingSettings>
) {
  const client = await clientPromise
  const db = client.db("hayesride")

  const current = await getPricingSettings()

  const updated: PricingSettings = {
    baseFare:
      input.baseFare ?? current.baseFare,

    pricePerKm:
      input.pricePerKm ?? current.pricePerKm,

    airportSurcharge:
      input.airportSurcharge ??
      current.airportSurcharge,

    vehicleAdjustments: {
      ...current.vehicleAdjustments,
      ...(input.vehicleAdjustments || {}),
    },

    currency: "GBP",

    updatedAt: new Date(),
  }

  await db
    .collection<PricingSettings & { _id: string }>(COLLECTION)
    .updateOne(
    {
      _id: SETTINGS_ID,
    },
    {
      $set: updated,
    },
    {
      upsert: true,
    }
  )

  return updated
}