"use client"

import { useEffect, useState } from "react"

interface Pricing {
  baseFare: number
  pricePerKm: number
  airportSurcharge: number

  vehicleAdjustments: {
    "executive-sedan": number
    "business-class": number
    "executive-mpv": number
  }
}

export default function AdminPricingPage() {
  const [pricing, setPricing] =
    useState<Pricing | null>(null)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [message, setMessage] =
    useState("")

  async function loadPricing() {
    try {
      const response =
        await fetch("/api/pricing")

      const data =
        await response.json()

      if (!data.success) {
        throw new Error(
          data.error
        )
      }

      setPricing(data.pricing)
    } catch (error) {
      console.error(error)
      setMessage(
        "Unable to load pricing."
      )
    } finally {
      setLoading(false)
    }
  }

  async function savePricing() {
    if (!pricing) return

    setSaving(true)
    setMessage("")

    try {
      const response =
        await fetch("/api/pricing", {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            pricing
          ),
        })

      const data =
        await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to save pricing."
        )
      }

      setPricing(data.pricing)

      setMessage(
        "Pricing updated successfully."
      )
    } catch (error) {
      console.error(error)

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save pricing."
      )
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    loadPricing()
  }, [])

  if (loading) {
    return (
      <main className="admin-content">
        Loading pricing...
      </main>
    )
  }

  if (!pricing) {
    return (
      <main className="admin-content">
        Unable to load pricing.
      </main>
    )
  }

  return (
    <main className="admin-content">
      <div className="admin-narrow">

        <p className="kicker">
          Fare settings
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          Pricing
        </h1>

        <p className="mt-2 text-slate-400">
          Control the pricing used by the
          website and Hayes AI.
        </p>

        <div className="mt-8 space-y-6">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-lg font-semibold">
              Distance Pricing
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">

              <label className="block">
                <span className="text-sm text-slate-400">
                  Base Fare (£)
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.baseFare}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      baseFare:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-400">
                  Price / KM (£)
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing.pricePerKm}
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      pricePerKm:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-400">
                  Airport Surcharge (£)
                </span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    pricing.airportSurcharge
                  }
                  onChange={(e) =>
                    setPricing({
                      ...pricing,
                      airportSurcharge:
                        Number(
                          e.target.value
                        ),
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                />
              </label>

            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-lg font-semibold">
              Vehicle Adjustments
            </h2>

            <div className="mt-5 space-y-4">

              {(
                [
                  [
                    "executive-sedan",
                    "Executive Sedan",
                  ],
                  [
                    "business-class",
                    "Business Class",
                  ],
                  [
                    "executive-mpv",
                    "Executive MPV",
                  ],
                ] as const
              ).map(
                ([type, label]) => (
                  <label
                    key={type}
                    className="block"
                  >
                    <span className="text-sm text-slate-400">
                      {label} (£)
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        pricing
                          .vehicleAdjustments[
                          type
                        ]
                      }
                      onChange={(e) =>
                        setPricing({
                          ...pricing,

                          vehicleAdjustments:
                            {
                              ...pricing.vehicleAdjustments,

                              [type]:
                                Number(
                                  e.target.value
                                ),
                            },
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
                    />
                  </label>
                )
              )}

            </div>
          </div>

          <button
            onClick={savePricing}
            disabled={saving}
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Pricing"}
          </button>

          {message && (
            <p className="text-sm text-slate-300">
              {message}
            </p>
          )}

        </div>

      </div>
    </main>
  )
}
