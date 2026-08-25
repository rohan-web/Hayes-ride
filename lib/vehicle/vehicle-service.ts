import clientPromise from "@/lib/mongodb"
import type { Vehicle } from "./types"

const COLLECTION = "vehicles"

export async function getVehicles() {
  const client = await clientPromise

  const db = client.db("hayesride")

  return db
    .collection(COLLECTION)
    .find({})
    .sort({ name: 1 })
    .toArray()
}

export async function getAvailableVehicles() {


  

  const client = await clientPromise

  const db = client.db("hayesride")

  return db
    .collection(COLLECTION)
    .find({
      status: "available",
    })
    .sort({ name: 1 })
    .toArray()
}

export async function createVehicle(vehicle: Vehicle) {
  const client = await clientPromise

  const db = client.db("hayesride")

  const result = await db
    .collection(COLLECTION)
    .insertOne({
      ...vehicle,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

  return {
    id: result.insertedId.toString(),
    ...vehicle,
  }
}