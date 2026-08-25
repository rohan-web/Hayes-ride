import clientPromise from "@/lib/mongodb"
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto"

export type UserRole =
  | "customer"
  | "admin"

export interface AuthUser {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
}

const USERS = "users"

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")

  const hash = scryptSync(
    password,
    salt,
    64
  ).toString("hex")

  return `${salt}:${hash}`
}

export function verifyPassword(
  password: string,
  storedPassword: string
) {
  const [salt, storedHash] =
    storedPassword.split(":")

  if (!salt || !storedHash) {
    return false
  }

  const hash = scryptSync(
    password,
    salt,
    64
  ).toString("hex")

  const a = Buffer.from(
    hash,
    "hex"
  )

  const b = Buffer.from(
    storedHash,
    "hex"
  )

  if (a.length !== b.length) {
    return false
  }

  return timingSafeEqual(a, b)
}

export async function createUser(input: {
  name: string
  email: string
  password: string
  phone?: string
}) {
  const client =
    await clientPromise

  const db =
    client.db("hayesride")

  const email =
    normalizeEmail(input.email)

  const existing =
    await db
      .collection(USERS)
      .findOne({ email })

  if (existing) {
    throw new Error(
      "An account with this email already exists."
    )
  }

  const passwordHash =
    hashPassword(input.password)

  const result =
    await db
      .collection(USERS)
      .insertOne({
        name: input.name.trim(),
        email,
        phone:
          input.phone?.trim() || "",
        passwordHash,
        role: "customer",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

  return {
    id: result.insertedId.toString(),
    name: input.name.trim(),
    email,
    phone:
      input.phone?.trim() || "",
    role: "customer" as const,
  }
}

export async function authenticateUser(
  emailInput: string,
  password: string
): Promise<AuthUser | null> {
  const client =
    await clientPromise

  const db =
    client.db("hayesride")

  const email =
    normalizeEmail(emailInput)

  const user =
    await db
      .collection(USERS)
      .findOne({ email })

  if (!user) {
    return null
  }

  const valid =
    verifyPassword(
      password,
      user.passwordHash
    )

  if (!valid) {
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