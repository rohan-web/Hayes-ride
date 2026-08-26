"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brand } from "@/components/brand"
import LogoutButton from "@/components/logout-button"
import { LayoutDashboard, CalendarRange, CarFront, BadgePoundSterling } from "lucide-react"

const links = [
  ["/admin", "Overview", LayoutDashboard],
  ["/admin/bookings", "Bookings", CalendarRange],
  ["/admin/vehicles", "Vehicles", CarFront],
  ["/admin/pricing", "Pricing", BadgePoundSterling],
] as const

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand light href="/admin" />
        <div className="admin-section-label">Operations</div>
        <nav aria-label="Admin navigation">
          {links.map(([href, label, Icon]) => (
            <Link key={href} href={href} className={pathname === href ? "active" : ""}>
              <Icon size={17} strokeWidth={1.7} />{label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-foot"><span>Administrator</span><LogoutButton /></div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar"><span>Hayes &amp; Ride</span><span className="system-status">All systems operational</span></header>
        {children}
      </div>
    </div>
  )
}
