import Link from "next/link"
import { getAllBookings } from "@/lib/booking/booking-management"
import { getVehicles } from "@/lib/vehicle/vehicle-service"

type DashboardBooking = {
  reference?: string
  pickup?: string
  destination?: string
  status?: string
  quote?: { amount?: number }
}

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  let bookings: DashboardBooking[] = []
  let vehicles: Awaited<ReturnType<typeof getVehicles>> = []
  let error = ""

  try {
    ;[bookings, vehicles] = await Promise.all([
      getAllBookings() as Promise<DashboardBooking[]>,
      getVehicles(),
    ])
  } catch (cause) {
    console.error("Admin overview error:", cause)
    error = "Operations data could not be loaded. Refresh to try again."
  }

  const count = (status: string) => bookings.filter((item) => item.status === status).length
  const revenue = bookings
    .filter((item) => item.status === "confirmed" || item.status === "completed")
    .reduce((sum, item) => sum + (Number(item.quote?.amount) || 0), 0)
  const recent = bookings.slice(0, 5)

  return (
    <main className="admin-content">
      <div>
        <div className="admin-dashboard-head">
          <div><p className="kicker">Daily overview</p><h1>Operations at a glance.</h1><p className="text-slate-400">Live booking and fleet data from Hayes & Ride.</p></div>
          <Link href="/admin/bookings" className="admin-primary-link">View bookings →</Link>
        </div>
        {error && <div className="admin-alert" role="alert">{error}</div>}
        <section className="admin-stats" aria-label="Operations metrics">
          {[
            ["Total bookings", bookings.length],
            ["Pending", count("pending")],
            ["Confirmed", count("confirmed")],
            ["Vehicles", vehicles.length],
          ].map(([label, value]) => <div className="admin-stat" key={label}><p>{label}</p><p>{value}</p></div>)}
        </section>
        <div className="admin-dashboard-grid">
          <section className="admin-overview-panel">
            <div className="admin-panel-head"><div><p className="kicker">Recent activity</p><h2>Latest bookings</h2></div><Link href="/admin/bookings">All bookings →</Link></div>
            {recent.length === 0 ? <div className="admin-empty">No bookings have been created yet.</div> : (
              <div className="admin-recent-list">{recent.map((booking) => (
                <Link href="/admin/bookings" key={booking.reference}>
                  <span><strong>{booking.reference}</strong><small>{booking.pickup} → {booking.destination}</small></span>
                  <span className={"status-text status-" + booking.status}>{booking.status || "pending"}</span>
                </Link>
              ))}</div>
            )}
          </section>
          <aside className="admin-overview-panel admin-summary">
            <p className="kicker">Journey status</p><h2>Current picture</h2>
            <dl>
              <div><dt>Completed</dt><dd>{count("completed")}</dd></div>
              <div><dt>Cancelled</dt><dd>{count("cancelled")}</dd></div>
              <div><dt>Active fleet</dt><dd>{vehicles.filter((vehicle) => vehicle.status === "available").length}</dd></div>
              <div><dt>Confirmed value</dt><dd>£{revenue.toFixed(2)}</dd></div>
            </dl>
          </aside>
        </div>
        <div className="admin-action-grid">
          <Link href="/admin/bookings" className="admin-action-card"><h2>Bookings</h2><p>Review journeys and update their status.</p><span>Manage bookings →</span></Link>
          <Link href="/admin/vehicles" className="admin-action-card"><h2>Vehicles</h2><p>View fleet capacity and availability.</p><span>Manage vehicles →</span></Link>
          <Link href="/admin/pricing" className="admin-action-card"><h2>Pricing</h2><p>Maintain live fare and vehicle adjustments.</p><span>Manage pricing →</span></Link>
        </div>
      </div>
    </main>
  )
}
