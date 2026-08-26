"use client"

export default function LogoutButton() {
  async function logout() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      )
    } finally {
      sessionStorage.removeItem(
        "hayes-assistant-conversation"
      )

      sessionStorage.removeItem(
        "hayes-resume-after-auth"
      )

      localStorage.removeItem(
        "hayes-assistant-conversation"
      )

      window.location.href =
        "/account/login"
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-xl border border-slate-700 px-5 py-3 text-sm"
    >
      Sign out
    </button>
  )
}