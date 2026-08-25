import Link from "next/link"

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-10">
          <p className="text-sm font-medium text-blue-400">
            HAYES & RIDE
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-slate-400">
            Manage bookings, vehicles and your transport operation.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Total Bookings
            </p>

            <p className="mt-3 text-3xl font-semibold">
              —
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Pending
            </p>

            <p className="mt-3 text-3xl font-semibold">
              —
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Confirmed
            </p>

            <p className="mt-3 text-3xl font-semibold">
              —
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">
              Vehicles
            </p>

            <p className="mt-3 text-3xl font-semibold">
              —
            </p>
          </div>

        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">

          <Link
            href="/admin/bookings"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-slate-600"
          >
            <h2 className="text-xl font-semibold">
              Bookings
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              View and manage customer bookings.
            </p>

            <span className="mt-5 inline-block text-sm text-blue-400">
              Manage bookings →
            </span>
          </Link>

          <Link
            href="/admin/vehicles"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-slate-600"
          >
            <h2 className="text-xl font-semibold">
              Vehicles
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Manage vehicles and availability.
            </p>

            <span className="mt-5 inline-block text-sm text-blue-400">
              Manage vehicles →
            </span>
          </Link>
          <Link
  href="/admin/pricing"
  className="rounded-2xl border border-slate-800 bg-slate-900 p-7 transition hover:border-slate-600"
>
  <h2 className="text-xl font-semibold">
    Pricing
  </h2>

  <p className="mt-2 text-sm text-slate-400">
    Manage base fares, distance rates and vehicle pricing.
  </p>

  <span className="mt-5 inline-block text-sm text-blue-400">
    Manage pricing →
  </span>
</Link>

        </div>

      </div>
    </main>
  )
}