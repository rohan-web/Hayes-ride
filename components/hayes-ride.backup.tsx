'use client'

import Image from 'next/image'
import { useState } from 'react'

const services = [
  ['Airport transfers', "Reliable journeys to and from London's major airports."],
  ['Business travel', 'Professional private travel for meetings, events and corporate journeys.'],
  ['City travel', 'Comfortable private transport across London, on your schedule.'],
  ['Group & event travel', 'Spacious vehicles for families, groups and special occasions.'],
]
const fleet = [
  ['Executive Sedan', '1–3 passengers', 'Up to 2 large bags', 'A composed choice for city journeys and business travel.'],
  ['Business Class', '1–4 passengers', 'Up to 3 large bags', 'Quiet, comfortable travel when every detail matters.'],
  ['Executive MPV', '1–7 passengers', 'Up to 6 large bags', 'Ideal for airport transfers and group journeys.'],
]
const faqs = ['Which airports do you cover?', 'Can I book in advance?', 'Can I change my booking?', 'What vehicles are available?', 'Can I travel with children?', 'How does airport pickup work?']

function Button({ children, dark = false, onClick }: { children: React.ReactNode; dark?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`button ${dark ? 'button-dark' : ''}`}>{children}<span aria-hidden="true">↗</span></button>
}

function Header({ onAssistant }: { onAssistant: () => void }) {
  const [open, setOpen] = useState(false)
  return <header className="site-header">
    <a className="wordmark" href="#top" aria-label="Hayes and Ride home"><span>H</span> HAYES <i>&</i> RIDE</a>
    <nav className="desktop-nav" aria-label="Primary navigation">{['Services', 'Airport Transfers', 'Our Fleet', 'How It Works', 'FAQ'].map((item, i) => <a key={item} href={`#${['services', 'airports', 'fleet', 'process', 'faq'][i]}`}>{item}</a>)}</nav>
    <div className="header-actions"><button className="assistant-link" onClick={onAssistant}>Ask Hayes</button><a className="book-link" href="#book">Book a ride <span>↗</span></a><button className="menu-toggle" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button></div>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation">{['Services', 'Airport Transfers', 'Fleet', 'How It Works', 'FAQ'].map((item, i) => <a key={item} href={`#${['services', 'airports', 'fleet', 'process', 'faq'][i]}`} onClick={() => setOpen(false)}>{item}<span>↗</span></a>)}<a className="mobile-book" href="#book" onClick={() => setOpen(false)}>Book a ride <span>↗</span></a></nav>}
  </header>
}

function BookingWidget() {
  return <form className="booking-widget" id="book" onSubmit={(e) => e.preventDefault()}>
    <label><span>From</span><input placeholder="Pickup location" /></label><label><span>To</span><input placeholder="Destination" /></label><label><span>Date</span><input type="text" placeholder="Select date" /></label><label><span>Time</span><input type="text" placeholder="Select time" /></label><label className="passenger"><span>Passengers</span><select defaultValue="1"><option>1 passenger</option><option>2 passengers</option><option>4 passengers</option><option>7 passengers</option></select></label><Button dark>Get my quote</Button>
  </form>
}

function AssistantPanel({ close }: { close: () => void }) {
  return <aside className="assistant-panel" role="dialog" aria-label="Hayes and Ride booking assistant"><div className="assistant-head"><div><span className="eyebrow">Hayes & Ride</span><strong>Booking Assistant</strong></div><button onClick={close} aria-label="Close assistant">×</button></div><div className="assistant-body"><p className="assistant-greeting">Hi. I can help you get a quote, find a suitable vehicle or make a booking.</p><div className="quick-actions"><button>Get a quote</button><button>Book a ride</button><button>Airport transfer</button><button>Manage my booking</button></div></div><div className="assistant-input"><input placeholder="Tell us what you need..." aria-label="Message the booking assistant" /><span>↗</span></div></aside>
}

export default function HayesRide() {
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  return <div id="top" className="hayes-site">
    <Header onAssistant={() => setAssistantOpen(true)} />
    <main>
      <section className="hero"><Image src="/images/hayes-hero.png" alt="Executive sedan on a London street at dusk" fill priority className="hero-image" /><div className="hero-shade" /><div className="hero-content"><p className="eyebrow light">Private hire · London</p><h1>Your journey.<br /><em>Handled.</em></h1><p className="hero-copy">Premium private hire and airport transfers across London, with a booking experience designed around you.</p><div className="hero-buttons"><Button dark>Book a ride</Button><a href="#quote" className="text-link light">Get a quote <span>↗</span></a></div><p className="hero-note">Airport transfers <i>·</i> City journeys <i>·</i> Business travel</p></div><div className="hero-caption">HAYES & RIDE <span>01 / 05</span></div></section>
      <BookingWidget />
      <section className="intro section-wrap"><div className="intro-copy"><p className="eyebrow">Private hire, refined</p><h2>A better way to travel through London.</h2><p>Whether you&apos;re heading to the airport, a meeting across town or home after a long journey, Hayes & Ride makes private travel simple, comfortable and dependable.</p><a href="#services" className="text-link">Discover our services <span>↗</span></a></div><div className="intro-image"><Image src="/images/hayes-fleet.png" alt="Executive MPV outside a London hotel" fill /></div></section>
      <section className="assistant-feature dark-section"><div className="section-wrap assistant-grid"><div><p className="eyebrow brass">A more considered booking experience</p><h2>Prefer to<br /><em>just ask?</em></h2><p>Tell us where you&apos;re going, when you need to travel and how many people are coming. Our booking assistant can help with your journey, quote and reservation.</p><button className="text-link light" onClick={() => setAssistantOpen(true)}>Meet the assistant <span>↗</span></button></div><div className="conversation"><div className="conversation-top"><span>Hayes & Ride</span><span className="live-dot">Available to help</span></div><div className="message customer">I need a Heathrow transfer tomorrow at 7pm for four people with luggage.</div><div className="message assistant">Absolutely. An Executive MPV would be the best fit for four passengers with luggage. I have 7:00 PM available.</div><div className="fare"><span>Estimated fare</span><strong>£78</strong></div><div className="conversation-actions"><button>Change details</button><Button dark>Confirm booking</Button></div></div></div></section>
      <section className="section-wrap services" id="services"><div className="section-heading"><div><p className="eyebrow">The right journey</p><h2>Travel for every occasion.</h2></div><p>Thoughtful private travel for the moments that matter, from the everyday to the once-in-a-lifetime.</p></div><div className="service-list">{services.map(([title, copy], i) => <article key={title} className={`service-item service-${i + 1}`}><span className="service-number">0{i + 1}</span><div><h3>{title}</h3><p>{copy}</p></div><span className="service-arrow">↗</span></article>)}</div></section>
      <section className="airport-section" id="airports"><div className="section-wrap airport-grid"><div><p className="eyebrow brass">Airport transfers</p><h2>Airport travel without the airport stress.</h2><p>Pre-book your journey, receive a clear quote and travel with confidence from pickup to arrival.</p><Button dark>Plan an airport transfer</Button></div><div className="airport-list">{['Heathrow', 'Gatwick', 'Stansted', 'Luton', 'London City'].map((a, i) => <div key={a}><span>0{i + 1}</span><strong>{a}</strong><small>London, UK</small></div>)}</div></div></section>
      <section className="section-wrap fleet" id="fleet"><div className="section-heading"><div><p className="eyebrow">The fleet</p><h2>A vehicle for every journey.</h2></div><p>Comfortable, considered and selected for the way you travel.</p></div><div className="fleet-grid">{fleet.map(([name, people, bags, copy], i) => <article className="fleet-card" key={name}><div className={`fleet-visual fleet-visual-${i + 1}`}><span>H&R</span></div><div className="fleet-card-copy"><p className="eyebrow">{people} · {bags}</p><h3>{name}</h3><p>{copy}</p><a href="#book" className="text-link">Select vehicle <span>↗</span></a></div></article>)}</div></section>
      <section className="quote-section" id="quote"><div className="quote-card"><div className="quote-route"><span>Heathrow Airport</span><b>→</b><span>Chelsea</span></div><div className="quote-meta"><span>Tomorrow<br /><strong>7:00 PM</strong></span><span>Passengers<br /><strong>4 people</strong></span><span>Vehicle<br /><strong>Executive MPV</strong></span></div><div className="quote-total"><span>Illustrative demo fare</span><strong>£78</strong><Button dark>Continue to booking</Button></div></div><div className="quote-copy"><p className="eyebrow">Clear from the start</p><h2>Know the price<br /><em>before you travel.</em></h2><p>No surprises, no guesswork. A straightforward quote for a straightforward journey.</p></div></section>
      <section className="process section-wrap" id="process"><p className="eyebrow">How it works</p><h2>Simple by design.</h2><div className="steps">{[['01', 'Tell us where you’re going.'], ['02', 'Choose the journey that suits you.'], ['03', 'Confirm and travel.']].map(([n, t]) => <div key={n}><span>{n}</span><h3>{t}</h3></div>)}</div></section>
      <section className="trust dark-section"><div className="section-wrap"><p className="eyebrow brass">A better standard</p><h2>Built around<br /><em>a better journey.</em></h2><div className="trust-list">{['Professional service', 'Clear pricing', 'Comfortable vehicles', 'Airport specialists', 'Available around the clock'].map(t => <span key={t}>— {t}</span>)}</div></div></section>
      <section className="section-wrap booking-preview"><div className="section-heading"><div><p className="eyebrow">After you book</p><h2>Your journey,<br /><em>in hand.</em></h2></div><p>A clear confirmation and easy access to the details that matter.</p></div><div className="manage-grid"><div className="confirmation"><p className="eyebrow brass">Booking confirmed</p><div className="confirm-ref">HR-19482</div><div className="confirm-route"><span>Heathrow Airport</span><b>→</b><span>Chelsea</span></div><div className="confirm-details"><span>Tomorrow<br /><strong>7:00 PM</strong></span><span>Vehicle<br /><strong>Executive MPV</strong></span><span>Fare<br /><strong>£78</strong></span></div><div className="status">● Confirmed <a href="#book">Manage booking ↗</a></div></div><div className="journey-card"><p className="eyebrow">Your journey</p><h3>Booking HR-19482</h3>{[['Pickup', 'Heathrow Airport'], ['Destination', 'Chelsea'], ['Date', 'Tomorrow'], ['Time', '7:00 PM']].map(([a, b]) => <div key={a}><span>{a}</span><strong>{b}</strong></div>)}<div className="journey-actions"><button>Change journey</button><button>Contact support</button><button>Cancel booking</button></div></div></div></section>
      <section className="faq section-wrap" id="faq"><div className="section-heading"><div><p className="eyebrow">Questions, answered</p><h2>Good to know.</h2></div><p>Can&apos;t find what you&apos;re looking for? <a href="#book">Get in touch ↗</a></p></div><div className="faq-list">{faqs.map((q, i) => <div className="faq-item" key={q}><button onClick={() => setFaqOpen(faqOpen === i ? null : i)} aria-expanded={faqOpen === i}><span>{q}</span><b>{faqOpen === i ? '−' : '+'}</b></button>{faqOpen === i && <p>We&apos;re here to make every part of your journey clear and comfortable. This demo answer will connect to the Hayes & Ride help centre in the finished experience.</p>}</div>)}</div></section>
      <section className="final-cta"><div><p className="eyebrow brass">Your next journey</p><h2>Ready when<br /><em>you are.</em></h2><p>Book your next journey with Hayes & Ride.</p><div className="hero-buttons"><Button dark>Book a ride</Button><a href="#quote" className="text-link light">Get a quote <span>↗</span></a></div></div></section>
    </main>
    <footer className="site-footer"><div className="footer-brand"><a className="wordmark" href="#top"><span>H</span> HAYES <i>&</i> RIDE</a><p>Private Hire & Airport Transfers</p><small>Demo / Portfolio Project</small></div><div className="footer-links"><div><span className="eyebrow">Explore</span><a href="#services">Services</a><a href="#airports">Airport Transfers</a><a href="#fleet">Fleet</a><a href="#process">How It Works</a><a href="#faq">FAQ</a></div><div><span className="eyebrow">Booking</span><a href="#book">Book a ride</a><a href="#quote">Get a quote</a><button onClick={() => setAssistantOpen(true)}>Booking assistant</button></div></div><div className="footer-bottom"><span>© 2026 Hayes & Ride</span><span>London, United Kingdom</span></div></footer>
    <button className="floating-assistant" onClick={() => setAssistantOpen(true)}><span className="assistant-mark">H</span><span>Ask Hayes</span><span>↗</span></button>
    {assistantOpen && <AssistantPanel close={() => setAssistantOpen(false)} />}
  </div>
}

export { HayesRide }
