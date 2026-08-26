import {
  getCurrentUser,
} from "@/lib/auth/session"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/logout-button"
import Link from "next/link"
import { Brand } from "@/components/brand"

export default async function AccountPage() {
  const user =
    await getCurrentUser()

  if (!user) {
    redirect(
      "/account/login"
    )
  }

  return (
    <main className="account-page">
      <header className="account-header"><Brand /><Link href="/">Book a journey</Link></header>
      <div className="account-wrap">
        <p className="kicker">Your account</p>
        <h1>Welcome back, {user.name.split(" ")[0]}.</h1>
        <p className="account-lede">Your personal space for upcoming journeys and account details.</p>
        <div className="account-grid">
          <section className="account-card account-card-primary">
            <span className="card-index">01</span><h2>Ready for your next journey?</h2>
            <p>Get a clear quote and reserve your chauffeur in a few simple steps.</p>
            <Link href="/#book" className="primary-action inline-action">Book a journey</Link>
          </section>
          <section className="account-card">
            <span className="card-index">02</span><h2>Profile details</h2>
            <dl><div><dt>Name</dt><dd>{user.name}</dd></div><div><dt>Email</dt><dd>{user.email}</dd></div>{user.phone && <div><dt>Telephone</dt><dd>{user.phone}</dd></div>}</dl>
            <LogoutButton />
          </section>
        </div>
      </div>
    </main>
  )
}
