"use client"

import { useEffect, useState } from "react"

interface Vehicle {
  _id: string
  name: string
  type: string
  registration: string
  passengers: number
  luggage: number
  status: string
  features: string[]
}

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function loadVehicles() {
    try {
      const response = await fetch("/api/vehicles")
      const data = await response.json()

      if (data.success) {
        setVehicles(data.vehicles)
      } else setError(data.error || "Unable to load vehicles.")
    } catch (error) {
      console.error(error)
      setError("Unable to load vehicles. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  return (
    <main className="admin-content">
      <div>

        <div className="mb-8">
          <p className="kicker">
            Fleet operations
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Vehicles
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your fleet and vehicle availability.
          </p>
        </div>

        {error && <div className="admin-alert" role="alert">{error}</div>}
        {loading ? (
          <div className="text-slate-400">
            Loading vehicles...
          </div>
        ) : (

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {vehicles.map((vehicle) => (

              <div
                key={vehicle._id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >

                <div className="flex items-start justify-between">

                  <div>
                    <h2 className="text-lg font-semibold">
                      {vehicle.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {vehicle.registration}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                    {vehicle.status}
                  </span>

                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">

                  <div className="rounded-xl bg-slate-950 p-3">
                    <p className="text-slate-500">
                      Passengers
                    </p>

                    <p className="mt-1">
                      {vehicle.passengers}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-3">
                    <p className="text-slate-500">
                      Luggage
                    </p>

                    <p className="mt-1">
                      {vehicle.luggage}
                    </p>
                  </div>

                </div>

                <div className="mt-5">

                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Features
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">

                    {vehicle.features?.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300"
                      >
                        {feature}
                      </span>
                    ))}

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
    </main>
  )
}
