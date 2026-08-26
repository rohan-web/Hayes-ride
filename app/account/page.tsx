import {
  getCurrentUser,
} from "@/lib/auth/session"
import { redirect } from "next/navigation"
import LogoutButton from "@/components/logout-button"

export default async function AccountPage() {
  const user =
    await getCurrentUser()

  if (!user) {
    redirect(
      "/account/login"
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-10">

        <p className="text-sm text-blue-400">
          HAYES & RIDE
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          My Account
        </h1>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="text-xl font-semibold">
            {user.name}
          </h2>

          <p className="mt-2 text-slate-400">
            {user.email}
          </p>

          {user.phone && (
            <p className="mt-1 text-slate-400">
              {user.phone}
            </p>
          )}

         <div className="mt-6">
  <LogoutButton />
</div>

        </div>

      </div>
    </main>
  )
}