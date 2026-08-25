interface Coordinates {
  lat: number
  lon: number
}

interface DistanceResult {
  distanceKm: number
  durationMinutes: number
}

async function geocode(
  location: string
): Promise<Coordinates> {
  const url =
    "https://nominatim.openstreetmap.org/search?" +
    new URLSearchParams({
      q: location,
      format: "json",
      limit: "1",
      countrycodes: "gb",
    })

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "HayesRideDemo/1.0",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(
      "Unable to locate journey address."
    )
  }

  const data = await response.json()

  if (!data?.length) {
    throw new Error(
      `Could not find location: ${location}`
    )
  }

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
  }
}

export async function calculateRoadDistance(
  pickup: string,
  destination: string
): Promise<DistanceResult> {
  const [from, to] = await Promise.all([
    geocode(pickup),
    geocode(destination),
  ])

  const routeUrl =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lon},${from.lat};${to.lon},${to.lat}` +
    `?overview=false`

  const response = await fetch(routeUrl, {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(
      "Unable to calculate road distance."
    )
  }

  const data = await response.json()

  const route = data?.routes?.[0]

  if (!route) {
    throw new Error(
      "No driving route found."
    )
  }

  return {
    distanceKm:
      Math.round(
        (route.distance / 1000) * 100
      ) / 100,

    durationMinutes:
      Math.round(
        route.duration / 60
      ),
  }
}