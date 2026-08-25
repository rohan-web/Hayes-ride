import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/session"

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/admin/login")
  }

  if (user.role !== "admin") {
    redirect("/account")
  }

  return children
}