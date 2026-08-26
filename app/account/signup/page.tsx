"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AuthShell } from "@/components/auth-shell"

function SignupForm() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/account"
  const loginHref =
    "/account/login?" +
    new URLSearchParams({ returnTo }).toString()
  const [name, setName] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [phone, setPhone] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    setLoading(true)
    setError("")

    try {
      const response =
        await fetch(
          "/api/auth/signup",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              phone,
              password,
            }),
          }
        )

   const data = await response.json()

if (!response.ok || !data.success) {
  setError(
    data.error || "Signup failed."
  )
  return
}

window.location.replace(returnTo)

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Signup failed."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Travel with us" title="Create your account" copy="Save your details and keep every journey close at hand.">
          <form onSubmit={handleSubmit} className="auth-form">

            <input
              placeholder="Full name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
              className="field-input"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              required
              className="field-input"
            />

            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              className="field-input"
            />

            <input
              type="password"
              placeholder="Password (8+ characters)"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              minLength={8}
              required
              className="field-input"
            />

            {error && (
              <p className="form-alert" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="primary-action"
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link
              href={loginHref}
              className="inline-link"
            >
              Sign in
            </Link>
          </p>

    </AuthShell>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-loading"><span className="loading-line" />Preparing secure sign up…</main>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
