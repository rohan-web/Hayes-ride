"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const router =
    useRouter()

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

      const data =
        await response.json()

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "Signup failed."
        )
      }

      const searchParams = useSearchParams()

const returnTo =
  searchParams.get("returnTo") || "/account"

router.refresh()
router.push(returnTo)

      router.refresh()
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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6">

        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-7">

          <p className="text-sm text-blue-400">
            HAYES & RIDE
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Create Account
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-4"
          >

            <input
              placeholder="Full name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              required
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3"
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
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

          <p className="mt-6 text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              href="/account/login"
              className="text-blue-400"
            >
              Sign in
            </Link>
          </p>

        </div>

      </div>
    </main>
  )
}