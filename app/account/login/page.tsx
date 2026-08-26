"use client"

import { FormEvent, Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AuthShell } from "@/components/auth-shell"

function LoginForm() {
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo") || "/account"
  const signupHref =
    "/account/signup?" +
    new URLSearchParams({ returnTo }).toString()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

    const data = await response.json()

if (!response.ok || !data.success) {
  setError(
    data.error || "Invalid email or password."
  )
  return
}

window.location.replace(returnTo)
      
    } catch (error) {
      console.error(
        "Login request failed:",
        error
      )

      setError(
        "Unable to login right now. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in" copy="Access your journeys and manage upcoming bookings.">
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="form-alert" role="alert">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="field-label"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                autoComplete="email"
                className="field-input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="field-label"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                autoComplete="current-password"
                className="field-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="primary-action"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link
              href={signupHref}
              className="inline-link"
            >
              Create one
            </Link>
          </p>

    </AuthShell>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-loading"><span className="loading-line" />Preparing secure sign in…</main>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
