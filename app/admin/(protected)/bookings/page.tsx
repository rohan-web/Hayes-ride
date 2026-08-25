"use client"

import { useEffect, useState } from "react"

interface Booking {
  reference: string
  pickup: string
  destination: string
  date: string
  time: string
  passengers: number
  vehicleType: string
  vehicleName?: string
  status: string
  customer?: {
    name?: string
    email?: string
    phone?: string
  }
  quote?: {
    amount: number
    currency: string
  }
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  async function loadBookings() {
    try {
      const response = await fetch("/api/bookings")
      const data = await response.json()

      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(
    reference: string,
    status: string
  ) {
    const response = await fetch(
      `/api/bookings/${reference}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    )

    const data = await response.json()

    if (data.success) {
      await loadBookings()
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-8">
          <p className="text-sm text-blue-400">
            HAYES & RIDE
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Bookings
          </h1>

          <p className="mt-2 text-slate-400">
            Manage customer reservations.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          {loading ? (
            <div className="p-8 text-slate-400">
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-slate-400">
              No bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Reference</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>

                  {bookings.map((booking) => (

                    <tr
                      key={booking.reference}
                      className="border-b border-slate-800 last:border-0"
                    >

                      <td className="px-6 py-5 font-medium">
                        {booking.reference}
                      </td>

                      <td className="px-6 py-5">
                        <div>
                          {booking.customer?.name || "—"}
                        </div>

                        <div className="text-xs text-slate-500">
                          {booking.customer?.phone || ""}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div>{booking.pickup}</div>
                        <div className="text-slate-500">
                          → {booking.destination}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div>{booking.date}</div>
                        <div className="text-slate-500">
                          {booking.time}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {booking.vehicleName ||
                          booking.vehicleType}
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">

                        <select
                          value={booking.status}
                          onChange={(event) =>
                            updateStatus(
                              booking.reference,
                              event.target.value
                            )
                          }
                          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs"
                        >
                          <option value="pending">
                            Pending
                          </option>

                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="completed">
                            Completed
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </main>
  )
}