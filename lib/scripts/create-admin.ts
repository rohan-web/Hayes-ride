import "dotenv/config"

import {
  hashPassword,
} from "../auth/auth-service"

import clientPromise from "../mongodb"

async function main() {
  const email =
    process.env.ADMIN_EMAIL

  const password =
    process.env.ADMIN_PASSWORD

  const name =
    process.env.ADMIN_NAME ||
    "Hayes Admin"

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD are required."
    )
  }

  if (password.length < 8) {
    throw new Error(
      "Admin password must be at least 8 characters."
    )
  }

  const client =
    await clientPromise

  const db =
    client.db("hayesride")

  const passwordHash =
    hashPassword(password)

  await db
    .collection("users")
    .updateOne(
      {
        email:
          email.toLowerCase(),
      },
      {
        $set: {
          name,
          email:
            email.toLowerCase(),
          passwordHash,
          role: "admin",
          updatedAt:
            new Date(),
        },

        $setOnInsert: {
          createdAt:
            new Date(),
        },
      },
      {
        upsert: true,
      }
    )

  console.log(
    `Admin account ready: ${email}`
  )

  await client.close()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})