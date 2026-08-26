"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthShell } from "@/components/auth-shell"

export default function AdminLoginPage() {
  const router =
    useRouter()

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState("")

  async function submit(
    event: React.FormEvent
  ) {
    event.preventDefault()

    setLoading(true)
    setError("")

    try {
      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email,
              password,
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
            "Login failed."
        )
      }

      if (
        data.user?.role !==
        "admin"
      ) {
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
          }
        )

        throw new Error(
          "This account does not have admin access."
        )
      }

      router.push(
        "/admin"
      )

      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Operations" title="Admin sign in" copy="Secure access for the Hayes & Ride operations team.">
          <form onSubmit={submit} className="auth-form">

            <input
              type="email"
              placeholder="Admin email"
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
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
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
                ? "Signing in..."
                : "Sign in securely"}
            </button>

          </form>

    </AuthShell>
  )
}
