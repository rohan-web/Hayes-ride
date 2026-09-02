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

      sessionStorage.removeItem(
        "hayes-assistant-session-id"
      )

      localStorage.removeItem(
        "hayes-assistant-conversation"
      )

      localStorage.removeItem(
        "hayes-assistant-session-id"
      )

      window.location.href =
        "/account/login"
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="logout-button"
    >
      Sign out
    </button>
  )
}
