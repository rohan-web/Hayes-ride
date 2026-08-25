import { NextResponse } from "next/server"
import {
  authenticateUser,
} from "@/lib/auth/auth-service"
import {
  createSession,
} from "@/lib/auth/session"

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json()

    const email =
      body.email?.trim()

    const password =
      body.password

    if (
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email and password are required.",
        },
        { status: 400 }
      )
    }

    const user =
      await authenticateUser(
        email,
        password
      )

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid email or password.",
        },
        { status: 401 }
      )
    }

    await createSession(
      user.id
    )

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error(
      "Login error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to login.",
      },
      { status: 500 }
    )
  }
}