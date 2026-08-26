import { Brand } from "@/components/brand"

export function AuthShell({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children: React.ReactNode }) {
  return (
    <main className="auth-shell">
      <section className="auth-story" aria-label="Hayes and Ride">
        <Brand light />
        <div>
          <p className="kicker kicker-light">Private chauffeur service · London</p>
          <h2>Every detail,<br/><em>considered.</em></h2>
          <p>Thoughtful journeys, professional chauffeurs and clear communication from booking to arrival.</p>
        </div>
        <p className="auth-story-note">London · Airports · Nationwide</p>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form-inner">
          <Brand />
          <div className="auth-heading">
            <p className="kicker">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{copy}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
