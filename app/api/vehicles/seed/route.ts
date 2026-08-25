import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST() {
  try {
    const client = await clientPromise

    const db = client.db("hayesride")

    const vehicles = [
      {
        name: "Mercedes-Benz E-Class",
        type: "executive-sedan",
        registration: "HR-E001",
        passengers: 3,
        luggage: 2,
        status: "available",
        features: [
          "Leather interior",
          "Wi-Fi",
          "Air conditioning",
          "Professional chauffeur",
        ],
      },
      {
        name: "Mercedes-Benz S-Class",
        type: "business-class",
        registration: "HR-S001",
        passengers: 3,
        luggage: 2,
        status: "available",
        features: [
          "Premium leather",
          "Wi-Fi",
          "Privacy glass",
          "Executive chauffeur",
        ],
      },
      {
        name: "Mercedes-Benz V-Class",
        type: "executive-mpv",
        registration: "HR-V001",
        passengers: 7,
        luggage: 5,
        status: "available",
        features: [
          "7 passenger seats",
          "Large luggage capacity",
          "Wi-Fi",
          "Professional chauffeur",
        ],
      },
    ]

    const existing = await db
      .collection("vehicles")
      .countDocuments()

    if (existing > 0) {
      return NextResponse.json({
        success: true,
        message: "Vehicles already seeded",
      })
    }

    const result = await db
      .collection("vehicles")
      .insertMany(vehicles)

    return NextResponse.json({
      success: true,
      inserted: result.insertedCount,
    })
  } catch (error) {
    console.error("Vehicle seed error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to seed vehicles",
      },
      { status: 500 }
    )
  }
}