import { NextResponse } from "next/server"
import { z } from "zod"
import { calculateQuote } from "@/lib/pricing/quote-engine"

const quoteSchema = z.object({
  pickup: z.string().min(2),
  destination: z.string().min(2),
  passengers: z.number().int().min(1).max(8),
  vehicleType: z.enum([
    "executive-sedan",
    "business-class",
    "executive-mpv",
  ]),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const input = quoteSchema.parse(body)

    const quote = await calculateQuote(input)

    return NextResponse.json({
      success: true,
      quote,
    })
  } catch (error) {
    console.error("Quote API error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid quote information",
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to calculate quote",
      },
      { status: 500 }
    )
  }
}