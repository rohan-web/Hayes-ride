import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import {
  createHmac,
  randomBytes,
} from "node:crypto"
import { cookies } from "next/headers"

const COOKIE_NAME =
  "hayes_session"

const SESSION_DAYS = 7

function getSecret() {
  const secret =
    process.env.AUTH_SECRET

  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not defined in .env.local"
    )
  }

  return secret
}

function signToken(
  sessionId: string,
  expiresAt: number
) {
  const payload =
    `${sessionId}.${expiresAt}`

  const signature =
    createHmac(
      "sha256",
      getSecret()
    )
      .update(payload)
      .digest("hex")

  return `${payload}.${signature}`
}

function verifyToken(
  token: string
) {
  const parts =
    token.split(".")

  if (parts.length !== 3) {
    return null
  }

  const [
    sessionId,
    expiresString,
    signature,
  ] = parts

  const expiresAt =
    Number(expiresString)

  if (
    !sessionId ||
    !expiresAt ||
    !signature
  ) {
    return null
  }

  if (
    Date.now() >
    expiresAt
  ) {
    return null
  }

  const payload =
    `${sessionId}.${expiresAt}`

  const expected =
    createHmac(
      "sha256",
      getSecret()
    )
      .update(payload)
      .digest("hex")

  if (signature !== expected) {
    return null
  }

  return {
    sessionId,
    expiresAt,
  }
}

export async function createSession(
  userId: string
) {
  const client =
    await clientPromise

  const db =
    client.db("hayesride")

  const sessionId =
    randomBytes(32).toString("hex")

  const expiresAt =
    Date.now() +
    SESSION_DAYS *
      24 *
      60 *
      60 *
      1000

  await db
    .collection("sessions")
    .insertOne({
      sessionId,
      userId,
      expiresAt:
        new Date(expiresAt),
      createdAt:
        new Date(),
    })

  const token =
    signToken(
      sessionId,
      expiresAt
    )

  const cookieStore =
    await cookies()

  cookieStore.set(
    COOKIE_NAME,
    token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      expires:
        new Date(expiresAt),
    }
  )

  return {
    sessionId,
    expiresAt,
  }
}

export async function getCurrentUser() {
  const cookieStore =
    await cookies()

  const token =
    cookieStore.get(
      COOKIE_NAME
    )?.value

  if (!token) {
    return null
  }

  const verified =
    verifyToken(token)

  if (!verified) {
    return null
  }

  const client =
    await clientPromise

  const db =
    client.db("hayesride")

  const session =
    await db
      .collection("sessions")
      .findOne({
        sessionId:
          verified.sessionId,

        expiresAt: {
          $gt: new Date(),
        },
      })

  if (!session) {
    return null
  }

  const user =
  await db
    .collection("users")
    .findOne({
      _id: new ObjectId(session.userId),
    })

  if (!user) {
    return null
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role:
      user.role === "admin"
        ? "admin"
        : "customer",
  }
}

export async function requireUser() {
  const user =
    await getCurrentUser()

  if (!user) {
    throw new Error(
      "AUTHENTICATION_REQUIRED"
    )
  }

  return user
}

export async function requireAdmin() {
  const user =
    await getCurrentUser()

  if (!user) {
    throw new Error(
      "AUTHENTICATION_REQUIRED"
    )
  }

  if (user.role !== "admin") {
    throw new Error(
      "ADMIN_ACCESS_REQUIRED"
    )
  }

  return user
}

export async function destroySession() {
  const cookieStore =
    await cookies()

  const token =
    cookieStore.get(
      COOKIE_NAME
    )?.value

  if (token) {
    const verified =
      verifyToken(token)

    if (verified) {
      const client =
        await clientPromise

      const db =
        client.db("hayesride")

      await db
        .collection("sessions")
        .deleteOne({
          sessionId:
            verified.sessionId,
        })
    }
  }

  cookieStore.delete(
    COOKIE_NAME
  )
}