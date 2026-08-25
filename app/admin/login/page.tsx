"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6">

        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-7">

          <p className="text-sm text-blue-400">
            HAYES & RIDE
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Admin Login
          </h1>

          <form
            onSubmit={submit}
            className="mt-7 space-y-4"
          >

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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
            />

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Admin Sign in"}
            </button>

          </form>

        </div>

      </div>
    </main>
  )
}