"use client"

import Image from "next/image"
import {
  useEffect,
  useRef,
  useState,
} from "react"

const services = [
  [
    "Airport transfers",
    "Reliable journeys to and from London's major airports.",
  ],
  [
    "Business travel",
    "Professional private travel for meetings, events and corporate journeys.",
  ],
  [
    "City travel",
    "Comfortable private transport across London, on your schedule.",
  ],
  [
    "Group & event travel",
    "Spacious vehicles for families, groups and special occasions.",
  ],
]

const fleet = [
  [
    "Executive Sedan",
    "1–3 passengers",
    "Up to 2 large bags",
    "A composed choice for city journeys and business travel.",
  ],
  [
    "Business Class",
    "1–4 passengers",
    "Up to 3 large bags",
    "Quiet, comfortable travel when every detail matters.",
  ],
  [
    "Executive MPV",
    "1–7 passengers",
    "Up to 6 large bags",
    "Ideal for airport transfers and group journeys.",
  ],
]

const faqs = [
  "Which airports do you cover?",
  "Can I book in advance?",
  "Can I change my booking?",
  "What vehicles are available?",
  "Can I travel with children?",
  "How does airport pickup work?",
]

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type BrowserSpeechRecognitionEvent = {
  results: ArrayLike<{
    isFinal: boolean
    [index: number]: {
      transcript: string
    }
  }>
}

type BrowserSpeechRecognitionErrorEvent = {
  error: string
  message?: string
}

type BrowserSpeechRecognition = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult:
    | ((
        event: BrowserSpeechRecognitionEvent
      ) => void)
    | null
  onerror:
    | ((
        event: BrowserSpeechRecognitionErrorEvent
      ) => void)
    | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type VoiceCapableWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: new () => BrowserSpeechRecognition
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition
  }

function Button({
  children,
  dark = false,
  onClick,
}: {
  children: React.ReactNode
  dark?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`button ${dark ? "button-dark" : ""}`}
    >
      {children}
      <span aria-hidden="true">↗</span>
    </button>
  )
}

function Header({ onAssistant }: { onAssistant: () => void }) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    let active = true
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (active && data.success) setUser(data.user || null) })
      .catch(() => { if (active) setUser(null) })
    return () => { active = false }
  }, [])

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" })
    sessionStorage.removeItem("hayes-assistant-conversation")
    sessionStorage.removeItem("hayes-assistant-session-id")
    localStorage.removeItem("hayes-assistant-conversation")
    localStorage.removeItem("hayes-assistant-session-id")
    setUser(null)
    setOpen(false)
    window.location.href = "/"
  }

  const accountLabel = user?.name?.split(" ")[0] || "My account"
  const navigation = [
    ["Services", "#services"],
    ["Airport transfers", "#airports"],
    ["Fleet", "#fleet"],
  ]

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Hayes and Ride home"><span>H</span> HAYES <i>&</i> RIDE</a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navigation.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        <button className="assistant-link" onClick={onAssistant}>Ask Hayes</button>
      </nav>
      <div className="header-actions">
        {user ? (
          <><a className="account-link" href="/account">{accountLabel}</a><button className="signout-link" onClick={signOut}>Sign out</button></>
        ) : <a className="account-link" href="/account/login?returnTo=/">Sign in</a>}
        <a className="book-link" href="#book">Book a ride <span>↗</span></a>
        <button className="menu-toggle" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navigation.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}<span>↗</span></a>)}
          <button onClick={() => { setOpen(false); onAssistant() }}>Ask Hayes <span>↗</span></button>
          {user ? <><a href="/account">{accountLabel}<span>↗</span></a><button onClick={signOut}>Sign out</button></> : <a href="/account/login?returnTo=/">Sign in<span>↗</span></a>}
          <a className="mobile-book" href="#book" onClick={() => setOpen(false)}>Book a ride <span>↗</span></a>
        </nav>
      )}
    </header>
  )
}

function BookingWidget() {
  const [pickup, setPickup] = useState("")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [passengers, setPassengers] = useState("1")

  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; phone?: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const BOOKING_DRAFT_KEY = "hayes-booking-widget-draft"

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(BOOKING_DRAFT_KEY)
      if (saved) {
        const draft = JSON.parse(saved)
        setPickup(draft.pickup || "")
        setDestination(draft.destination || "")
        setDate(draft.date || "")
        setTime(draft.time || "")
        setPassengers(draft.passengers || "1")
        setQuote(draft.quote || null)
        sessionStorage.removeItem(BOOKING_DRAFT_KEY)
      }
    } catch (cause) {
      console.error("Unable to restore booking draft:", cause)
    }

    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user)
          setCustomerName(data.user.name || "")
          setCustomerEmail(data.user.email || "")
          setCustomerPhone(data.user.phone || "")
        }
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setAuthLoading(false))
  }, [])

  function saveBookingDraft() {
    sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify({
      pickup,
      destination,
      date,
      time,
      passengers,
      quote,
    }))
  }

  const [bookingLoading, setBookingLoading] =
    useState(false)

  const [bookingError, setBookingError] = useState("")

  const [booking, setBooking] = useState<{
    reference: string
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [quote, setQuote] = useState<{
    amount: number
    currency: string
    vehicleType: string
    estimatedDuration?: string
  } | null>(null)

  async function handleQuote(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setError("")
    setQuote(null)

    if (!pickup || !destination) {
      setError(
        "Please enter your pickup and destination."
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickup,
          destination,
          passengers: Number(passengers),
          vehicleType: "executive-mpv",
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to calculate your quote."
        )
      }

      setQuote(data.quote)
    } catch (error) {
      console.error("Quote error:", error)

      setError(
        error instanceof Error
          ? error.message
          : "Unable to calculate your quote."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleBooking(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    setBookingError("")

    if (!quote) {
      setBookingError(
        "Please get a quote first."
      )
      return
    }

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      setBookingError(
        "Please enter your name, email and phone number."
      )
      return
    }

    setBookingLoading(true)

    try {
      const response = await fetch(
        "/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pickup,
            destination,
            date,
            time,
            passengers: Number(passengers),
            vehicleType: quote.vehicleType,
            customer: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
            },
          }),
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to create booking."
        )
      }

      setBooking({
        reference: data.booking.reference,
      })
    } catch (error) {
      console.error("Booking error:", error)

      setBookingError(
        error instanceof Error
          ? error.message
          : "Unable to create booking."
      )
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className="booking-experience">
      <form
        className="booking-widget"
        id="book"
        onSubmit={handleQuote}
      >
        <label>
          <span>From</span>

          <input
            placeholder="Pickup location"
            value={pickup}
            onChange={(e) =>
              setPickup(e.target.value)
            }
          />
        </label>

        <label>
          <span>To</span>

          <input
            placeholder="Destination"
            value={destination}
            onChange={(e) =>
              setDestination(e.target.value)
            }
          />
        </label>

        <label>
          <span>Date</span>

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />
        </label>

        <label>
          <span>Time</span>

          <input
            type="time"
            value={time}
            onChange={(e) =>
              setTime(e.target.value)
            }
          />
        </label>

        <label className="passenger">
          <span>Passengers</span>

          <select
            value={passengers}
            onChange={(e) =>
              setPassengers(e.target.value)
            }
          >
            <option value="1">
              1 passenger
            </option>
            <option value="2">
              2 passengers
            </option>
            <option value="4">
              4 passengers
            </option>
            <option value="7">
              7 passengers
            </option>
          </select>
        </label>

        <button
          type="submit"
          style={{ marginTop: "16px" }}
        >
          {loading
            ? "Calculating..."
            : "Get my quote"}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            border: "1px solid #8b3a3a",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      {quote && (
        <div
          style={{
            marginTop: "24px",
            padding: "24px",
            border: "1px solid currentColor",
            borderRadius: "12px",
          }}
        >
          <p className="eyebrow brass">
            Your estimated fare
          </p>

          <h3
            style={{
              fontSize: "2rem",
              marginTop: "8px",
            }}
          >
            {quote.currency === "GBP"
              ? "£"
              : ""}
            {quote.amount}
          </h3>

          <p>{quote.vehicleType}</p>

          {quote.estimatedDuration && (
            <p>
              Estimated journey:{" "}
              {quote.estimatedDuration}
            </p>
          )}
          {!booking && (
            authLoading ? (
              <div className="booking-auth-state" aria-live="polite">Checking your account…</div>
            ) : currentUser ? (
              <form id="customer-details" onSubmit={handleBooking} className="customer-details-form">
                <p className="eyebrow brass">Passenger details</p>
                <h3>Complete your booking</h3>
                <p className="customer-details-note">Your account details have been added automatically. You can update the phone number for this journey.</p>
                <div className="customer-fields">
                  <label><span>Full name</span><input value={customerName} readOnly aria-readonly="true" /></label>
                  <label><span>Email address</span><input type="email" value={customerEmail} readOnly aria-readonly="true" /></label>
                  <label><span>Phone number</span><input type="tel" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} required placeholder="Add your phone number" /></label>
                  <button type="submit" disabled={bookingLoading}>{bookingLoading ? "Creating booking…" : "Confirm booking"}</button>
                </div>
                {bookingError && <p className="booking-inline-error" role="alert">{bookingError}</p>}
              </form>
            ) : (
              <div className="booking-auth-state">
                <p className="eyebrow brass">Account required</p>
                <h3>Sign in to complete your booking</h3>
                <p>Your quote is ready. Sign in or create an account and we’ll bring you back to this journey.</p>
                <div className="booking-auth-actions">
                  <a href="/account/login?returnTo=%2F%23book" onClick={saveBookingDraft}>Sign in</a>
                  <a href="/account/signup?returnTo=%2F%23book" onClick={saveBookingDraft}>Create account</a>
                </div>
              </div>
            )
          )}

{booking && (
            <div
              style={{
                marginTop: "24px",
                padding: "28px",
                border:
                  "1px solid currentColor",
                borderRadius: "12px",
              }}
            >
              <p className="eyebrow brass">
                Booking confirmed
              </p>

              <h3
                style={{
                  fontSize: "2rem",
                  marginTop: "8px",
                }}
              >
                {booking.reference}
              </h3>

              <p
                style={{
                  marginTop: "12px",
                }}
              >
                Your journey has been
                successfully booked.
              </p>

              <div
                style={{
                  marginTop: "20px",
                }}
              >
                <p>
                  <strong>From:</strong>{" "}
                  {pickup}
                </p>

                <p>
                  <strong>To:</strong>{" "}
                  {destination}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {date}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {time}
                </p>

                <p>
                  <strong>Fare:</strong>{" "}
                  {quote.currency === "GBP"
                    ? "£"
                    : ""}
                  {quote.amount}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type PublicVehicle = { _id?: string; name: string; type: string; passengers: number; luggage: number; status: string; features?: string[] }

function LiveFleet() {
  const [vehicles, setVehicles] = useState<PublicVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/vehicles")
      .then((response) => response.json())
      .then((data) => data.success ? setVehicles(data.vehicles) : setError("Fleet is temporarily unavailable."))
      .catch(() => setError("Fleet is temporarily unavailable."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="fleet-editorial" id="fleet">
      <div className="section-wrap">
        <div className="section-heading"><div><p className="eyebrow">The fleet</p><h2>Space to travel well.</h2></div><p>Live fleet details, with the capacity that matters for your journey.</p></div>
        {loading ? <div className="fleet-loading" aria-live="polite">Preparing the fleet…</div> : error ? <div className="fleet-error" role="alert">{error}</div> : vehicles.length === 0 ? <div className="fleet-empty">No vehicles are currently listed. Ask Hayes for help planning your journey.</div> : (
          <div className="fleet-showcase">
            {vehicles.map((vehicle, index) => (
              <article className="fleet-entry" key={vehicle._id || vehicle.name}>
                <div className={"fleet-photo fleet-photo-" + ((index % 2) + 1)}><span>{String(index + 1).padStart(2, "0")}</span></div>
                <div className="fleet-entry-copy">
                  <p className="eyebrow">{vehicle.type}</p><h3>{vehicle.name}</h3>
                  <div className="fleet-capacity"><span>{vehicle.passengers} passengers</span><span>{vehicle.luggage} luggage</span></div>
                  {vehicle.features && vehicle.features.length > 0 && <p>{vehicle.features.slice(0, 3).join(" · ")}</p>}
                  <a href="#book" className="text-link">Choose this class <span>↗</span></a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* =========================================================
   HAYES ASSISTANT
   ========================================================= */

function AssistantPanel({
  close,
}: {
  close: () => void
}) {
  const CHAT_KEY =
    "hayes-assistant-conversation"

  const SESSION_KEY =
    "hayes-assistant-session-id"

  const RESUME_KEY =
    "hayes-resume-after-auth"

  const initialMessage: ChatMessage = {
    role: "assistant",
    content:
      "Hi. I can help you get a quote, find a suitable vehicle or make a booking.",
  }

  const [message, setMessage] =
    useState("")

  const [messages, setMessages] =
    useState<ChatMessage[]>([])

  const [loading, setLoading] =
    useState(false)

  const [voiceSupported, setVoiceSupported] =
    useState(false)

  const [listening, setListening] =
    useState(false)

  const [voiceNotice, setVoiceNotice] =
    useState("")

  const [
    requiresAuth,
    setRequiresAuth,
  ] = useState(false)

  const [
    resumeBooking,
    setResumeBooking,
  ] = useState(false)

  /*
   * Scroll the actual assistant body,
   * instead of scrolling the whole webpage.
   */
  const bodyRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const sessionIdRef =
    useRef("")

  const recognitionRef =
    useRef<BrowserSpeechRecognition | null>(
      null
    )

  const voiceModeRef =
    useRef(false)

  useEffect(() => {
    const voiceWindow =
      window as VoiceCapableWindow

    setVoiceSupported(
      Boolean(
        voiceWindow.SpeechRecognition ||
          voiceWindow.webkitSpeechRecognition
      )
    )

    return () => {
      recognitionRef.current?.abort()
      window.speechSynthesis?.cancel()
    }
  }, [])

  function getOrCreateSessionId() {
    if (sessionIdRef.current) {
      return sessionIdRef.current
    }

    const saved =
      (
        window.localStorage.getItem(
          SESSION_KEY
        ) ||
        window.sessionStorage.getItem(
          SESSION_KEY
        )
      )?.trim()

    if (saved) {
      sessionIdRef.current = saved
      return saved
    }

    const nextSessionId =
      typeof window.crypto
        ?.randomUUID ===
      "function"
        ? window.crypto.randomUUID()
        : `web-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`

    window.localStorage.setItem(
      SESSION_KEY,
      nextSessionId
    )

    window.sessionStorage.setItem(
      SESSION_KEY,
      nextSessionId
    )

    sessionIdRef.current =
      nextSessionId

    return nextSessionId
  }

  useEffect(() => {
    const element =
      bodyRef.current

    if (!element) return

    requestAnimationFrame(() => {
      element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth",
      })
    })
  }, [
    messages,
    loading,
    requiresAuth,
    resumeBooking,
  ])

  /*
   * Restore the conversation across refreshes.
   *
   * Prefer durable localStorage, while keeping a
   * sessionStorage fallback for conversations saved
   * by the previous version.
   */
  useEffect(() => {
    try {
      getOrCreateSessionId()

      const saved =
        window.localStorage.getItem(
          CHAT_KEY
        ) ||
        window.sessionStorage.getItem(
          CHAT_KEY
        )

      if (saved) {
        const parsed =
          JSON.parse(saved)

        if (
          Array.isArray(parsed) &&
          parsed.length > 0
        ) {
          setMessages(parsed)
        } else {
          setMessages([
            initialMessage,
          ])
        }
      } else {
        setMessages([
          initialMessage,
        ])
      }
    } catch (error) {
      console.error(
        "Unable to restore Hayes conversation:",
        error
      )

      setMessages([
        initialMessage,
      ])
    }
  }, [])

  /*
   * Save the current conversation across page refreshes.
   * Logout and the New Conversation button still clear it.
   */
  useEffect(() => {
    if (!messages.length) {
      return
    }

    try {
      window.sessionStorage.setItem(
        CHAT_KEY,
        JSON.stringify(messages)
      )

      window.localStorage.setItem(
        CHAT_KEY,
        JSON.stringify(messages)
      )
    } catch (error) {
      console.error(
        "Unable to save Hayes conversation:",
        error
      )
    }
  }, [messages])

  /*
   * Customer has returned from login/signup.
   *
   * Verify that authentication really succeeded,
   * then automatically resume Hayes.
   */
  useEffect(() => {
    async function restoreAfterAuth() {
      const shouldResume =
        window.sessionStorage.getItem(
          RESUME_KEY
        )

      if (
        shouldResume !== "true"
      ) {
        return
      }

      try {
        const response =
          await fetch(
            "/api/auth/me",
            {
              cache:
                "no-store",
            }
          )

        const data =
          await response.json()

        if (
          response.ok &&
          data.success &&
          data.user
        ) {
          window.sessionStorage.removeItem(
            RESUME_KEY
          )

          setRequiresAuth(false)
          setResumeBooking(true)

          setMessages(
            (current) => [
              ...current,
              {
                role:
                  "assistant",

                content:
                  `You're signed in${data.user.name
                    ? ` as ${data.user.name}`
                    : ""
                  }. I still have your journey details. Would you like me to complete the booking now?`,
              },
            ]
          )
        }
      } catch (error) {
        console.error(
          "Unable to restore Hayes after authentication:",
          error
        )
      }
    }

    restoreAfterAuth()
  }, [])

  function clearConversation() {
    recognitionRef.current?.abort()
    window.speechSynthesis?.cancel()
    voiceModeRef.current = false
    setListening(false)

    setMessages([
      initialMessage,
    ])

    setRequiresAuth(false)
    setResumeBooking(false)

    try {
      window.sessionStorage.removeItem(
        CHAT_KEY
      )

      window.sessionStorage.removeItem(
        RESUME_KEY
      )

      window.sessionStorage.removeItem(
        SESSION_KEY
      )

      window.localStorage.removeItem(
        SESSION_KEY
      )

      sessionIdRef.current = ""
      getOrCreateSessionId()

      window.localStorage.removeItem(
        CHAT_KEY
      )
    } catch {}
  }

  async function sendMessage(
    text?: string
  ) {
    const userMessage = (
      text ?? message
    ).trim()

    if (
      !userMessage ||
      loading
    ) {
      return
    }

    setMessage("")

    const conversationHistory =
      messages.slice(-16)

    setMessages(
      (current) => [
        ...current,
        {
          role: "user",
          content:
            userMessage,
        },
      ]
    )

    setLoading(true)

    try {
      const sessionId =
        getOrCreateSessionId()

      const response =
        await fetch(
          "/api/hayes-assistant",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                message:
                  userMessage,

                sessionId,

                history:
                  conversationHistory,
              }),
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Assistant unavailable."
        )
      }

      /*
       * Backend is the source of truth
       * for authentication requirement.
       */
      const authRequired =
        data.requiresAuth === true

      setRequiresAuth(
        authRequired
      )

      /*
       * Booking succeeded or authentication
       * is no longer required.
       */
      if (!authRequired) {
        setResumeBooking(false)
      }

      setMessages(
        (current) => [
          ...current,
          {
            role:
              "assistant",

            content:
              data.message,
          },
        ]
      )

      if (
        voiceModeRef.current &&
        "speechSynthesis" in window
      ) {
        const spokenText = data.message
          .replace(
            /\[([^\]]+)\]\([^)]+\)/g,
            "$1"
          )
          .replace(/[*_`#]/g, "")
          .replace(/\s+/g, " ")
          .trim()

        if (spokenText) {
          window.speechSynthesis.cancel()

          const utterance =
            new SpeechSynthesisUtterance(
              spokenText
            )

          utterance.lang = "en-GB"
          utterance.rate = 0.96

          window.speechSynthesis.speak(
            utterance
          )
        }
      }
    } catch (error) {
      console.error(
        "Assistant error:",
        error
      )

      setMessages(
        (current) => [
          ...current,
          {
            role:
              "assistant",

            content:
              "Hayes is temporarily unable to process that request. Please try again.",
          },
        ]
      )
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault()

    sendMessage()
  }

  function toggleVoiceInput() {
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const voiceWindow =
      window as VoiceCapableWindow

    const Recognition =
      voiceWindow.SpeechRecognition ||
      voiceWindow.webkitSpeechRecognition

    if (!Recognition || loading) {
      return
    }

    window.speechSynthesis?.cancel()
    setVoiceNotice("")

    const recognition =
      new Recognition()

    let lastTranscript = ""
    let submitted = false
    let recognitionError = false

    function submitTranscript() {
      const cleanTranscript =
        lastTranscript.trim()

      if (
        submitted ||
        !cleanTranscript
      ) {
        return
      }

      submitted = true
      voiceModeRef.current = true
      setListening(false)
      setMessage("")

      void sendMessage(
        cleanTranscript
      )
    }

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang =
      navigator.language || "en-GB"

    recognition.onresult = (event) => {
      let transcript = ""
      let finalResult = false

      for (
        let index = 0;
        index < event.results.length;
        index += 1
      ) {
        transcript +=
          event.results[index][0]
            ?.transcript || ""

        finalResult =
          finalResult ||
          event.results[index].isFinal
      }

      const cleanTranscript =
        transcript.trim()

      lastTranscript =
        cleanTranscript

      setMessage(cleanTranscript)

      if (
        finalResult &&
        cleanTranscript
      ) {
        submitted = true
        voiceModeRef.current = true
        setListening(false)
        setMessage("")
        recognition.stop()

        void sendMessage(
          cleanTranscript
        )
      }
    }

    recognition.onerror = (event) => {
      recognitionError = true
      setListening(false)

      const notices: Record<
        string,
        string
      > = {
        "not-allowed":
          "Microphone permission is blocked. Allow it from the browser address bar, then try again.",
        "service-not-allowed":
          "Browser speech recognition is blocked. Please use the latest Chrome or Edge and allow microphone access.",
        "audio-capture":
          "No working microphone was found. Check your microphone and Windows input settings.",
        "no-speech":
          "I could not hear any speech. Click Mic and speak clearly, then wait a moment.",
        network:
          "The browser speech service could not connect. Check your internet connection or try Chrome/Edge.",
        aborted:
          "Listening stopped. Click Mic when you are ready to try again.",
      }

      setVoiceNotice(
        notices[event.error] ||
          `Voice recognition stopped (${event.error}). Please try again in Chrome or Edge.`
      )
    }

    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null

      if (
        !submitted &&
        lastTranscript
      ) {
        submitTranscript()
        return
      }

      if (
        !submitted &&
        !recognitionError
      ) {
        setVoiceNotice(
          "I could not hear a complete message. Click Mic, speak clearly, and wait for it to send."
        )
      }
    }

    recognitionRef.current =
      recognition

    setListening(true)
    recognition.start()
  }

  function goToLogin() {
    /*
     * Hayes knows it must resume after
     * the customer returns.
     */
    window.sessionStorage.setItem(
      RESUME_KEY,
      "true"
    )

    window.location.href =
      "/account/login?returnTo=/"
  }

  function goToSignup() {
    window.sessionStorage.setItem(
      RESUME_KEY,
      "true"
    )

    window.location.href =
      "/account/signup?returnTo=/"
  }

  function continueBooking() {
    setResumeBooking(false)

    /*
     * Don't send just "yes".
     * Give Gemini an explicit instruction,
     * so it doesn't accidentally calculate
     * the quote again.
     */
    sendMessage(
      "I am signed in. Please complete the booking now using the journey details, date, time, passenger count and vehicle already provided in this conversation. Do not recalculate the quote unless necessary."
    )
  }

  return (
    <aside
      className="assistant-panel"
      role="dialog"
      aria-label="Hayes and Ride booking assistant"
    >
      <div className="assistant-head">
        <div>
          <span className="eyebrow">
            Hayes & Ride
          </span>

          <strong>
            Booking Assistant
          </strong>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <button
            type="button"
            onClick={
              clearConversation
            }
            aria-label="Start new conversation"
            title="New conversation"
          >
            ↻
          </button>

          <button
            type="button"
            onClick={close}
            aria-label="Close assistant"
          >
            ×
          </button>
        </div>
      </div>

      {/*
       * REF GOES HERE.
       * This is the actual scrolling container.
       */}
      <div
        ref={bodyRef}
        className="assistant-body"
      >
        {messages.map(
          (
            item,
            index
          ) => (
            <div
              key={index}
              className={
                item.role ===
                "user"
                  ? "assistant-message user"
                  : "assistant-message"
              }
            >
              <p>
                {item.content}
              </p>
            </div>
          )
        )}

        {requiresAuth && (
          <div
            style={{
              marginTop:
                "12px",

              padding:
                "16px",

              border:
                "1px solid rgba(255,255,255,0.14)",

              borderRadius:
                "12px",
            }}
          >
            <p
              style={{
                marginBottom:
                  "12px",
              }}
            >
              Please sign in or
              create an account to
              complete your booking.
              Your current Hayes
              conversation will be
              preserved.
            </p>

            <div
              style={{
                display:
                  "flex",

                gap: "8px",

                flexWrap:
                  "wrap",
              }}
            >
              <button
                type="button"
                onClick={
                  goToLogin
                }
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={
                  goToSignup
                }
              >
                Create account
              </button>
            </div>
          </div>
        )}

        {/*
         * Automatically appears after
         * successful login return.
         */}
        {resumeBooking &&
          !requiresAuth && (
            <div
              style={{
                marginTop:
                  "12px",

                padding:
                  "16px",

                border:
                  "1px solid rgba(255,255,255,0.14)",

                borderRadius:
                  "12px",
              }}
            >
              <p
                style={{
                  marginBottom:
                    "12px",
                }}
              >
                You're signed in.
                Continue with the
                journey we were
                discussing?
              </p>

              <button
                type="button"
                onClick={
                  continueBooking
                }
              >
                Complete booking →
              </button>
            </div>
          )}

        {loading && (
          <div className="assistant-message">
            <p>
              Hayes is
              thinking...
            </p>
          </div>
        )}

        <div className="quick-actions">
          <button
            type="button"
            onClick={() =>
              sendMessage(
                "I need a quote for a journey."
              )
            }
          >
            Get a quote
          </button>

          <button
            type="button"
            onClick={() =>
              sendMessage(
                "I want to book a ride."
              )
            }
          >
            Book a ride
          </button>

          <button
            type="button"
            onClick={() =>
              sendMessage(
                "I need an airport transfer."
              )
            }
          >
            Airport transfer
          </button>

          <button
            type="button"
            onClick={() =>
              sendMessage(
                "I want to manage my booking."
              )
            }
          >
            Manage my booking
          </button>
        </div>
      </div>

      {voiceNotice && (
        <p
          className="voice-notice"
          role="status"
        >
          {voiceNotice}
        </p>
      )}

      <form
        className="assistant-input"
        onSubmit={
          handleSubmit
        }
      >
        <input
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          placeholder={
            listening
              ? "Listening..."
              : "Tell us what you need..."
          }
          aria-label="Message the booking assistant"
          disabled={loading}
        />

        {voiceSupported && (
          <button
            type="button"
            className={
              listening
                ? "voice-button listening"
                : "voice-button"
            }
            onClick={toggleVoiceInput}
            disabled={loading}
            aria-label={
              listening
                ? "Stop listening"
                : "Speak to Hayes"
            }
            title={
              listening
                ? "Stop listening"
                : "Speak to Hayes"
            }
          >
            {listening
              ? "Stop"
              : "Mic"}
          </button>
        )}

        <button
          type="submit"
          disabled={
            loading ||
            !message.trim()
          }
          aria-label="Send message"
        >
          ↗
        </button>
      </form>
    </aside>
  )
}
/* =========================================================
   MAIN HAYES RIDE PAGE
   ========================================================= */

export default function HayesRide() {
  const [
    assistantOpen,
    setAssistantOpen,
  ] = useState(false)

  const [faqOpen, setFaqOpen] =
    useState<number | null>(null)

    useEffect(() => {
  const shouldReopen =
    sessionStorage.getItem(
      "hayes-reopen-after-auth"
    )

  if (shouldReopen === "true") {
    sessionStorage.removeItem(
      "hayes-reopen-after-auth"
    )

    setAssistantOpen(true)
  }
}, [])

  return (
    <div
      id="top"
      className="hayes-site"
    >
      <Header
        onAssistant={() =>
          setAssistantOpen(true)
        }
      />

      <main>
        <section className="hero">
          <Image
            src="/images/hayes-hero.png"
            alt="Executive sedan on a London street at dusk"
            fill
            priority
            className="hero-image"
          />

          <div className="hero-shade" />

          <div className="hero-content">
            <p className="eyebrow light">
              Private hire · London
            </p>

            <h1>
              Your journey.
              <br />
              <em>Handled.</em>
            </h1>

            <p className="hero-copy">
              Premium private hire and
              airport transfers across
              London, with a booking
              experience designed around
              you.
            </p>

            <div className="hero-buttons">
              <Button dark onClick={() => document.getElementById("book")?.scrollIntoView({ behavior: "smooth" })}>
                Book a ride
              </Button>

              <a
                href="#book"
                className="text-link light"
              >
                Get a quote{" "}
                <span>↗</span>
              </a>
            </div>

            <p className="hero-note">
              Airport transfers <i>·</i>{" "}
              City journeys <i>·</i>{" "}
              Business travel
            </p>
          </div>

          <div className="hero-caption">
            HAYES & RIDE{" "}
            <span>01 / 05</span>
          </div>
        </section>

        <BookingWidget />
<section className="proof-strip" aria-label="Journey confidence"><div className="section-wrap">{["Clear upfront quotes","Professional private hire","London & airport coverage","Booking support"].map((item) => <span key={item}>{item}</span>)}</div></section>

        <section className="intro section-wrap">
          <div className="intro-copy">
            <p className="eyebrow">
              Private hire, refined
            </p>

            <h2>
              A better way to travel
              through London.
            </h2>

            <p>
              Whether you're heading to
              the airport, a meeting
              across town or home after a
              long journey, Hayes & Ride
              makes private travel simple,
              comfortable and dependable.
            </p>

            <a
              href="#services"
              className="text-link"
            >
              Discover our services{" "}
              <span>↗</span>
            </a>
          </div>

          <div className="intro-image">
            <Image
              src="/images/hayes-fleet.png"
              alt="Executive MPV outside a London hotel"
              fill
            />
          </div>
        </section>

        <section className="assistant-feature dark-section">
          <div className="section-wrap assistant-grid">
            <div><p className="eyebrow brass">Hayes, your booking assistant</p><h2>Travel plans,<br/><em>made conversational.</em></h2><p>Ask for a quote, find the right vehicle, check availability or continue to a real booking. Hayes keeps the journey context in this browser tab and resumes after sign-in.</p><button className="text-link light" onClick={() => setAssistantOpen(true)}>Start a conversation <span>↗</span></button></div>
            <div className="hayes-capabilities" aria-label="Hayes capabilities">
              <p className="eyebrow">What Hayes can do</p>
              {["Plan a London or airport journey","Calculate a live quote","Match passenger and luggage needs","Resume a booking after sign-in"].map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong></div>)}
              <button onClick={() => setAssistantOpen(true)}>Ask Hayes now <span>↗</span></button>
            </div>
          </div>
        </section>

        <section
          className="section-wrap services"
          id="services"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                The right journey
              </p>

              <h2>
                Travel for every
                occasion.
              </h2>
            </div>

            <p>
              Thoughtful private travel
              for the moments that matter,
              from the everyday to the
              once-in-a-lifetime.
            </p>
          </div>

          <div className="service-list">
            {services.map(
              ([title, copy], i) => (
                <article
                  key={title}
                  className={`service-item service-${
                    i + 1
                  }`}
                >
                  <span className="service-number">
                    0{i + 1}
                  </span>

                  <div>
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>

                  <span className="service-arrow">
                    ↗
                  </span>
                </article>
              )
            )}
          </div>
        </section>

        <section
          className="airport-section"
          id="airports"
        >
          <div className="section-wrap airport-grid">
            <div>
              <p className="eyebrow brass">
                Airport transfers
              </p>

              <h2>
                Airport travel without
                the airport stress.
              </h2>

              <p>
                Pre-book your journey,
                receive a clear quote and
                travel with confidence from
                pickup to arrival.
              </p>

              <Button dark onClick={() => document.getElementById("book")?.scrollIntoView({ behavior: "smooth" })}>
                Plan an airport transfer
              </Button>
            </div>

            <div className="airport-list">
              {[
                "Heathrow",
                "Gatwick",
                "Stansted",
                "Luton",
                "London City",
              ].map((a, i) => (
                <div key={a}>
                  <span>
                    0{i + 1}
                  </span>

                  <strong>{a}</strong>

                  <small>
                    London, UK
                  </small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <LiveFleet />

        <section
          className="process section-wrap"
          id="process"
        >
          <p className="eyebrow">
            How it works
          </p>

          <h2>
            Simple by design.
          </h2>

          <div className="steps">
            {[
              [
                "01",
                "Tell us where you’re going.",
              ],
              [
                "02",
                "Choose the journey that suits you.",
              ],
              [
                "03",
                "Confirm and travel.",
              ],
            ].map(([n, t]) => (
              <div key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
              </div>
            ))}
          </div>
        </section>

        <section
          className="faq section-wrap"
          id="faq"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                Questions, answered
              </p>

              <h2>
                Good to know.
              </h2>
            </div>

            <p>
              Can't find what you're
              looking for?{" "}
              <a href="#book">
                Get in touch ↗
              </a>
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((q, i) => (
              <div
                className="faq-item"
                key={q}
              >
                <button
                  onClick={() =>
                    setFaqOpen(
                      faqOpen === i
                        ? null
                        : i
                    )
                  }
                  aria-expanded={
                    faqOpen === i
                  }
                >
                  <span>{q}</span>

                  <b>
                    {faqOpen === i
                      ? "−"
                      : "+"}
                  </b>
                </button>

                {faqOpen === i && (
                  <p>
                    We're here to make
                    every part of your
                    journey clear and
                    comfortable. Our team will confirm the details that apply to your journey. Ask Hayes for immediate help before booking.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <div>
            <p className="eyebrow brass">
              Your next journey
            </p>

            <h2>
              Ready when
              <br />
              <em>you are.</em>
            </h2>

            <p>
              Book your next journey with
              Hayes & Ride.
            </p>

            <div className="hero-buttons">
              <Button dark onClick={() => document.getElementById("book")?.scrollIntoView({ behavior: "smooth" })}>
                Book a ride
              </Button>

              <a
                href="#book"
                className="text-link light"
              >
                Get a quote{" "}
                <span>↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <a
            className="wordmark"
            href="#top"
          >
            <span>H</span> HAYES{" "}
            <i>&</i> RIDE
          </a>

          <p>
            Private Hire & Airport
            Transfers
          </p>

          <small>
            Licensed private hire service
          </small>
        </div>

        <div className="footer-links">
          <div>
            <span className="eyebrow">
              Explore
            </span>

            <a href="#services">
              Services
            </a>

            <a href="#airports">
              Airport Transfers
            </a>

            <a href="#fleet">
              Fleet
            </a>

            <a href="#process">
              How It Works
            </a>

            <a href="#faq">
              FAQ
            </a>
          </div>

          <div>
            <span className="eyebrow">
              Booking
            </span>

            <a href="#book">
              Book a ride
            </a>

            <a href="#book">
              Get a quote
            </a>

            <button
              onClick={() =>
                setAssistantOpen(true)
              }
            >
              Booking assistant
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 Hayes & Ride
          </span>

          <span>
            London, United Kingdom
          </span>
        </div>
      </footer>

      <button
        className="floating-assistant"
        onClick={() =>
          setAssistantOpen(true)
        }
      >
        <span className="assistant-mark">
          H
        </span>

        <span>
          Ask Hayes
        </span>

        <span>↗</span>
      </button>

      {assistantOpen && (
        <AssistantPanel
          close={() =>
            setAssistantOpen(false)
          }
        />
      )}
    </div>
  )
}

export { HayesRide }
