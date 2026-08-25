import { NextResponse } from "next/server"
import {
  getCurrentUser,
} from "@/lib/auth/session"

export async function GET() {
  try {
    const user =
      await getCurrentUser()

    return NextResponse.json({
      success: true,
      authenticated: Boolean(user),
      user,
    })
  } catch (error) {
    console.error(
      "Auth me error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        user: null,
      },
      { status: 500 }
    )
  }
}