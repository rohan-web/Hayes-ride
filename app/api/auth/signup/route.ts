import { NextResponse } from "next/server"
import {
  createUser,
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

    const name =
      body.name?.trim()

    const email =
      body.email?.trim()

    const password =
      body.password

    const phone =
      body.phone?.trim()

    if (
      !name ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name, email and password are required.",
        },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Password must be at least 8 characters.",
        },
        { status: 400 }
      )
    }

    const user =
      await createUser({
        name,
        email,
        password,
        phone,
      })

    await createSession(
      user.id
    )

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error(
      "Signup error:",
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create account.",
      },
      { status: 400 }
    )
  }
}