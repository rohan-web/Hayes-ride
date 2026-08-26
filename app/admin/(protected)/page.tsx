import Link from "next/link"

export default function AdminDashboard() {
  return (
    <main className="admin-content">
      <div>

        <div className="mb-10">
          <p className="kicker">
            Daily overview
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Good morning.
          </h1>

          <p className="mt-2 text-slate-400">
            A clear view of today’s transport operation.
          </p>
        </div>

        <div className="admin-stats">

          <div className="admin-stat">
            <p className="text-sm text-slate-400">
              Total Bookings
            </p>

            <p className="mt-3 text-3xl font-semibold">
              —
            </p>
          </div>

          <div className="admin-stat">
            <p className="text-sm text-slate-400">
              Pending
            </p>

            <p className="mt-3 text-3xl font-semibold">
              —
            </p>
          </div>

          <div className="admin-stat">
            <p className="text-sm text-slate-400">
              Confirmed
            </p>

            <p className="mt-3 text-3xl font-semibold">
              —
            </p>
          </div>

          <div className="admin-stat">
            <p className="text-sm text-slate-400">
              Vehicles
            </p>

            <p className="mt-3 text-3xl font-semibold">
              —
            </p>
          </div>

        </div>

        <div className="admin-action-grid">

          <Link
            href="/admin/bookings"
            className="admin-action-card"
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
            className="admin-action-card"
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
  className="admin-action-card"
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
