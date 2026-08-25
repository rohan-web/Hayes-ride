export type QuoteRequest = {
  pickup: string
  destination: string
  passengers: number
  vehicleType?: string
}

export type BookingRequest = {
  pickup: string
  destination: string
  date: string
  time: string
  passengers: number
  vehicleType: string
  customer: {
    name: string
    email: string
    phone: string
  }
}

/**
 * Hayes Tool: Calculate a journey quote.
 *
 * This calls the same quote API used by the normal
 * customer booking form.
 */
export async function getQuote(
  request: QuoteRequest
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"

  const response = await fetch(
    `${baseUrl}/api/quotes`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pickup: request.pickup,
        destination: request.destination,
        passengers: request.passengers,
        vehicleType:
          request.vehicleType ||
          "executive-mpv",
      }),
      cache: "no-store",
    }
  )

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
        "Unable to calculate quote."
    )
  }

  const quote = data.quote

  if (!quote) {
    throw new Error(
      "Quote API returned no quote."
    )
  }

  return {
    amount: Number(quote.amount),
    currency: quote.currency || "GBP",
    vehicleType:
      quote.vehicleType ||
      request.vehicleType ||
      "executive-mpv",
    distanceKm: Number(
      quote.distanceKm ?? 0
    ),
    durationMinutes: Number(
      quote.durationMinutes ?? 0
    ),
    baseFare: Number(
      quote.baseFare ?? 0
    ),
    distanceFare: Number(
      quote.distanceFare ?? 0
    ),
    vehicleAdjustment: Number(
      quote.vehicleAdjustment ?? 0
    ),
    airportSurcharge: Number(
      quote.airportSurcharge ?? 0
    ),
    estimated:
      quote.estimated !== false,
  }
}
/**
 * Hayes Tool: Create a booking.
 *
 * Uses the same booking API as the normal
 * customer booking flow.
 */



export async function createBooking({
  pickup,
  destination,
  date,
  time,
  passengers,
  vehicleType,
  customer,
}: {
  pickup: string
  destination: string
  date: string
  time: string
  passengers: number
  vehicleType: string
  customer: {
    name: string
    email: string
    phone: string
  }
})


{
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000"

 const response = await fetch(
  `${baseUrl}/api/bookings`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pickup,
      destination,
      date,
      time,
      passengers,
      vehicleType,
      customer,
    }),
  }
)

const data = await response.json()

if (!response.ok || !data.success) {
  return {
    success: false,
    unavailable: true,
    error:
      data.error ||
      "The selected vehicle is not available for this date and time.",
  }
}

return {
  success: true,
  unavailable: false,
  booking: data.booking,
}



return data.booking
}

export async function getBooking(reference: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bookings/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  )

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || "Unable to retrieve booking."
    )
  }

  return data.booking
}

export async function updateBooking(
  reference: string,
  updates: {
    date?: string
    time?: string
    pickup?: string
    destination?: string
    passengers?: number
  }
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bookings/${encodeURIComponent(reference)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  )

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || "Unable to update booking."
    )
  }

  return data.booking
}

export async function cancelBooking(reference: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bookings/${encodeURIComponent(reference)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  )

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || "Unable to cancel booking."
    )
  }

  return data.booking
}


