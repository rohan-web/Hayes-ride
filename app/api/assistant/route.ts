import { NextResponse } from "next/server"
import { GoogleGenAI, Type, Tool } from "@google/genai"

import {
  getQuote,
  createBooking,
  getBooking,
  updateBooking,
  cancelBooking,
} from "@/lib/ai/tools"
import { searchKnowledge } from "@/lib/knowledge/knowledge-service"

import {
  getCurrentUser,
} from "@/lib/auth/session"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

/*
 * Current date in the Hayes & Ride operating timezone.
 *
 * This allows Hayes to correctly understand:
 *
 * "today"
 * "tomorrow"
 * etc.
 *
 * Example:
 *
 * 2026-08-20
 * tomorrow = 2026-08-21
 */

const currentDate = new Intl.DateTimeFormat(
  "en-CA",
  {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }
).format(new Date())

/*
 * Hayes AI system instructions.
 */

const SYSTEM_PROMPT = `
You are Hayes, the professional AI booking assistant
for Hayes & Ride, a UK chauffeur and private hire company.

CURRENT DATE:
${currentDate}

DATE RULES:

- Treat the current date above as today's date.
- If the customer says "tomorrow", calculate tomorrow
  from the current date above.
- If the customer says "today", use the current date.
- Never invent a year.
- Always convert relative dates into the correct
  YYYY-MM-DD date before calling createBooking.
- Before creating a booking, verify that the date is
  in the future unless the customer explicitly requests
  a past date for testing.

You help customers with:

- journey quotes
- vehicle selection
- bookings
- airport transfers

IMPORTANT RULES:

1. Never invent prices.

2. Never invent vehicles or availability.

3. If the customer asks for a quote and provides
   pickup, destination and passenger count,
   use getQuote.

   VEHICLE NAME MAPPING:

- "V-Class", "Mercedes V-Class", "V Class", "MPV", and "executive MPV"
  mean "executive-mpv".
- "business class" means "business-class".
- "executive sedan", "sedan", and "saloon" mean "executive-sedan".

If the customer asks for a price and provides a vehicle name,
map the customer's wording to the internal vehicleType value
before calling getQuote.

IMPORTANT:
- A price request is ALWAYS a getQuote request.
- Do NOT use searchKnowledge for live prices, fares, quotes,
  route costs, or vehicle-specific pricing.
- If pickup, destination, passengers and a recognizable vehicle
  are provided, call getQuote immediately.
- Do not answer that the price is unavailable from the knowledge base
  when the real quote system can calculate it.

4. Do not ask unnecessary questions.

5. Never create a booking merely because the customer
   describes a journey.

6. createBooking may ONLY be used after the customer
   has explicitly confirmed that they want to book.

7. AUTHENTICATION AND CUSTOMER RULES:

- A real booking requires an authenticated Hayes & Ride account.
- Never offer guest booking.
- Never claim that a booking can be completed as a guest.
- Customer name, email and phone come from the authenticated account.
- Do not ask the customer to provide name or email again when creating a booking.
- If the authenticated account has no phone number and the booking system requires one, ask only for the missing phone number.
- If the customer is not authenticated when they attempt to create a booking, do not call createBooking. Return the authentication-required flow.

8. If customer details are missing, ask for them.

9. Never invent missing customer information.

10. Keep responses concise, professional and natural.

11. If a tool returns real business data, use that
    data exactly.

12. Never change or invent a price.

13. Never change or invent a booking reference.

14. Use conversation history to remember journey
    details already provided by the customer.

15. Do not ask the customer to repeat information
    already present in the conversation.

16. If the customer confirms a quote or says "yes",
    use the previously discussed journey details.

17. Before calling createBooking, verify that all
    required booking information is available.

18. If createBooking reports that a vehicle is not
    available, do NOT say that Hayes AI is unavailable.

19. Instead clearly tell the customer that the selected
    vehicle is unavailable for the requested date/time
    and offer to check alternatives.

20. Never claim that a booking was created unless the
    createBooking tool actually succeeds.

21. For Hayes & Ride business-information questions, use searchKnowledge.
22. Never invent company information. If the knowledge search is insufficient, say so.
23. Do not use searchKnowledge for live prices, availability, bookings, status, updates or cancellations; use the appropriate tool.
`

/*
 * Gemini function tools.
 */

const tools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "getQuote",

        description:
  `Calculate the actual Hayes & Ride journey price using the real quote system.

Use this tool for ANY request involving:
- price
- cost
- fare
- quote
- journey price
- route cost

Never use searchKnowledge for live pricing.

Vehicle type mapping:
- V-Class / Mercedes V-Class / V Class / MPV -> executive-mpv
- Business Class -> business-class
- Executive Sedan / Sedan / Saloon -> executive-sedan

If pickup, destination and passenger count are provided,
use this tool immediately.`,

        parameters: {
          type: Type.OBJECT,

          properties: {
            pickup: {
              type: Type.STRING,
              description:
                "Customer pickup location.",
            },

            destination: {
              type: Type.STRING,
              description:
                "Customer destination.",
            },

            passengers: {
              type: Type.NUMBER,
              description:
                "Number of passengers.",
            },

            vehicleType: {
              type: Type.STRING,
              description:
                "Vehicle category. Use executive-mpv if the customer has not specified another vehicle.",
            },
          },

          required: [
            "pickup",
            "destination",
            "passengers",
          ],
        },
      },

      

      {
        name: "createBooking",

        description:
          "Create a real Hayes & Ride booking only after the customer explicitly confirms they want to book.",

        parameters: {
          type: Type.OBJECT,

          properties: {
            pickup: {
              type: Type.STRING,
              description:
                "Pickup location.",
            },

            destination: {
              type: Type.STRING,
              description:
                "Destination.",
            },

            date: {
              type: Type.STRING,
              description:
                "Journey date in YYYY-MM-DD format.",
            },

            time: {
              type: Type.STRING,
              description:
                "Journey time in 24-hour HH:MM format.",
            },

            passengers: {
              type: Type.NUMBER,
              description:
                "Number of passengers.",
            },

            vehicleType: {
              type: Type.STRING,
              description:
                "Vehicle category selected by the customer.",
            },

            customer: {
              type: Type.OBJECT,

              properties: {
                name: {
                  type: Type.STRING,
                  description:
                    "Customer full name.",
                },

                email: {
                  type: Type.STRING,
                  description:
                    "Customer email address.",
                },

                phone: {
                  type: Type.STRING,
                  description:
                    "Customer phone number.",
                },
              },

              required: [
                "name",
                "email",
                "phone",
              ],
            },
          },

          required: [
            "pickup",
            "destination",
            "date",
            "time",
            "passengers",
            "vehicleType",
            "customer",
          ],
        },
      },

      {
  name: "getBooking",
  description:
    "Retrieve an existing Hayes & Ride booking using its booking reference.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      reference: {
        type: Type.STRING,
        description:
          "Hayes & Ride booking reference, for example HR-12345.",
      },
    },
    required: ["reference"],
  },
},

{
  name: "updateBooking",
  description:
    "Update an existing Hayes & Ride booking after the customer requests a change.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      reference: {
        type: Type.STRING,
        description:
          "Hayes & Ride booking reference.",
      },
      date: {
        type: Type.STRING,
        description:
          "New journey date in YYYY-MM-DD format.",
      },
      time: {
        type: Type.STRING,
        description:
          "New journey time in 24-hour HH:MM format.",
      },
      pickup: {
        type: Type.STRING,
        description: "New pickup location.",
      },
      destination: {
        type: Type.STRING,
        description: "New destination.",
      },
      passengers: {
        type: Type.NUMBER,
        description: "New passenger count.",
      },
    },
    required: ["reference"],
  },
},

{
  name: "cancelBooking",
  description:
    "Cancel an existing Hayes & Ride booking after the customer explicitly asks to cancel it.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      reference: {
        type: Type.STRING,
        description:
          "Hayes & Ride booking reference.",
      },
    },
    required: ["reference"],
  },
},

    {
      name: "searchKnowledge",
      description: "Search the Hayes & Ride knowledge base for services, vehicles, luggage, airport transfers, features, policies and other company information. Do not use it for live prices, availability or booking transactions.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: { type: Type.STRING, description: "The customer's business-information question." },
        },
        required: ["query"],
      },
    },
    ],
  },
]

export async function POST(
  request: Request
) {
  try {
    const body = await request.json()

    const message =
      body.message?.trim()

    const history =
      Array.isArray(body.history)
        ? body.history
        : []

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Message is required.",
        },
        { status: 400 }
      )
    }

    /*
     * Convert frontend conversation history
     * into Gemini conversation format.
     *
     * Frontend:
     *
     * user
     * assistant
     *
     * Gemini:
     *
     * user
     * model
     */

    const contents = [
      ...history.map(
        (item: {
          role:
            | "user"
            | "assistant"

          content: string
        }) => ({
          role:
            item.role === "assistant"
              ? "model"
              : "user",

          parts: [
            {
              text: item.content,
            },
          ],
        })
      ),

      {
        role: "user" as const,

        parts: [
          {
            text: message,
          },
        ],
      },
    ]

    /*
 * =====================================================
 * DETERMINISTIC BOOKING STATUS / REFERENCE LOOKUP
 * =====================================================
 *
 * Do not waste a Gemini request for simple booking
 * reference/status questions.
 */

const wantsBookingStatus =
  /\b(status|booking status|reference|reference number|booking reference)\b/i.test(
    message
  )

if (wantsBookingStatus) {
  /*
   * Search current message + previous conversation
   * for the latest Hayes booking reference.
   */
  const conversationText = [
    ...history.map(
      (item: {
        role: "user" | "assistant"
        content: string
      }) => item.content
    ),
    message,
  ].join("\n")

  const references =
    conversationText.match(
      /\bHR-\d{5}\b/gi
    ) || []

  const reference =
    references.length > 0
      ? references[
          references.length - 1
        ].toUpperCase()
      : null

  if (!reference) {
    return NextResponse.json({
      success: true,

      message:
        "Please provide your Hayes & Ride booking reference, for example HR-12345.",
    })
  }

  const cookie =
    request.headers.get("cookie") ||
    ""

  try {
    const booking =
      await getBooking(
        reference,
        cookie
      )

    return NextResponse.json({
      success: true,

      message:
        `Your booking reference is ${booking.reference}. ` +
        `The booking is currently ${booking.status}. ` +
        `Pickup: ${booking.pickup}. ` +
        `Destination: ${booking.destination}. ` +
        `Date: ${booking.date}. ` +
        `Time: ${booking.time}.`,

      tool: "getBooking",

      booking,
    })
  } catch (error) {
    console.error(
      "Direct booking lookup error:",
      error
    )

    return NextResponse.json({
      success: true,

      message:
        `I found your booking reference ${reference}, but I couldn't retrieve its current status. Please make sure you're signed in to the account that made the booking.`,
    })
  }
}

    /*
     * First Gemini response.
     *
     * Gemini decides whether a tool is necessary.
     */

    const firstResponse =
      await ai.models.generateContent({
        model:
          "gemini-3.1-flash-lite",

        contents,

        config: {
          systemInstruction:
            SYSTEM_PROMPT,

          tools,
        },
      })

    /*
     * Get Gemini's requested function call.
     */

    const functionCall =
      firstResponse.functionCalls?.[0]

    /*
     * No tool required.
     *
     * Example:
     *
     * "Hello"
     *
     * "How can I help?"
     */

    if (!functionCall) {
      return NextResponse.json({
        success: true,

        message:
          firstResponse.text ||
          "How can I help with your journey?",
      })
    }

    /* RAG / KNOWLEDGE */
    if (functionCall.name === "searchKnowledge") {
      const args = functionCall.args as { query: string }
      const results = await searchKnowledge(args.query, 5)

      const finalResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [
          ...contents,
          {
            role: "model",
            parts: firstResponse.candidates?.[0]?.content?.parts || [],
          },
          {
            role: "user",
            parts: [{
              functionResponse: {
                name: "searchKnowledge",
                response: { results },
              },
            }],
          },
        ],
        config: {
          systemInstruction: `You are Hayes, the professional AI booking assistant for Hayes & Ride.
Answer using ONLY useful information returned by searchKnowledge.
Never invent company information, prices or availability. If results are insufficient, say the information is not currently available.
Be concise and professional.`,
          tools,
        },
      })

      return NextResponse.json({
        success: true,
        message: finalResponse.text || "I couldn't find that information in the Hayes & Ride knowledge base.",
        tool: "searchKnowledge",
        knowledge: results,
      })
    }

    /*
     * =====================================================
     * BOOKING MANAGEMENT
     * =====================================================
     *
     * Handle existing booking references BEFORE quote/booking
     * processing. This keeps status, update and cancellation
     * deterministic and prevents Hayes from treating a booking
     * reference as a new journey request.
     */

if ((functionCall.name as string) === "getBooking") {
  const args = functionCall.args as {
    reference: string
  }
const cookie =
  request.headers.get("cookie") ||
  ""

const booking =
  await getBooking(
    args.reference,
    cookie
  )
  

  return NextResponse.json({
    success: true,
    message:
      `Booking ${booking.reference} is currently ` +
      `${booking.status}. ` +
      `Pickup: ${booking.pickup}. ` +
      `Destination: ${booking.destination}. ` +
      `Date: ${booking.date}. ` +
      `Time: ${booking.time}.`,
    tool: "getBooking",
    booking,
  })
}

if ((functionCall.name as string) === "updateBooking") {
  const args = functionCall.args as {
    reference: string
    date?: string
    time?: string
    pickup?: string
    destination?: string
    passengers?: number
  }

  const booking = await updateBooking(
    args.reference,
    {
      date: args.date,
      time: args.time,
      pickup: args.pickup,
      destination: args.destination,
      passengers: args.passengers,
    }
  )

  return NextResponse.json({
    success: true,
    message:
      `Booking ${booking.reference} has been updated successfully.`,
    tool: "updateBooking",
    booking,
  })
}

if ((functionCall.name as string) === "cancelBooking") {
  const args = functionCall.args as {
    reference: string
  }

  const booking = await cancelBooking(
    args.reference
  )

  return NextResponse.json({
    success: true,
    message:
      `Booking ${booking.reference} has been cancelled successfully.`,
    tool: "cancelBooking",
    booking,
  })
}


/*GET QUOTE

****

*/

if (functionCall.name === "getQuote") {
  const args =
    functionCall.args as {
      pickup: string
      destination: string
      passengers: number
      vehicleType?: string
    }

  const quote = await getQuote({
    pickup: args.pickup,
    destination: args.destination,
    passengers: args.passengers,
    vehicleType:
      args.vehicleType ||
      "executive-mpv",
  })

  console.log(
    "HAYES FINAL QUOTE:",
    JSON.stringify(quote)
  )

  return NextResponse.json({
    success: true,
    message: `The estimated fare is ${
      quote.currency === "GBP" ? "£" : ""
    }${quote.amount}. Would you like to proceed with the booking?`,
    tool: "getQuote",
    quote,
  })
}

 
/*
 * =====================================================
 * CREATE BOOKING
 * =====================================================
 */

if (functionCall.name === "createBooking") {
  /*
   * Authentication is required ONLY when Hayes
   * is actually creating a booking.
   *
   * Quotes and general questions can remain public.
   */
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({
      success: true,
      message:
        "Before I can create the booking, please sign in or create a Hayes & Ride account.",
      requiresAuth: true,
    })
  }

  const args =
    functionCall.args as {
      pickup: string
      destination: string
      date: string
      time: string
      passengers: number
      vehicleType: string

      /*
       * Gemini may still return this because it is
       * part of the function schema.
       *
       * We will NOT trust it for the real booking.
       */
      customer?: {
        name?: string
        email?: string
        phone?: string
      }
    }

  /*
   * Validate journey information.
   *
   * Customer information is NOT required here because
   * it comes from the authenticated account.
   */
  if (
    !args.pickup ||
    !args.destination ||
    !args.date ||
    !args.time ||
    !args.passengers ||
    !args.vehicleType
  ) {
    return NextResponse.json({
      success: true,
      message:
        "Before I create the booking, I need the pickup, destination, date, time, passenger count and vehicle type.",
    })
  }

  /*
   * Server-side date protection.
   *
   * Prevent booking an obviously past date.
   */
  const today =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(new Date())

  if (args.date < today) {
    return NextResponse.json({
      success: true,
      message:
        "That journey date has already passed. Please provide a future journey date.",
    })
  }

  /*
   * REAL BOOKING
   *
   * Customer identity comes from the authenticated
   * Hayes & Ride account.
   */
const cookie =
  request.headers.get("cookie") || ""

const bookingResult =
  await createBooking({
    pickup: args.pickup,
    destination: args.destination,
    date: args.date,
    time: args.time,
    passengers: args.passengers,
    vehicleType: args.vehicleType,

    customer: {
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    },

    /*
     * Pass browser authentication through
     * Hayes -> booking API.
     */
    cookie,
  })

  /*
   * Vehicle unavailable.
   *
   * This is a normal business response,
   * NOT an AI failure.
   */

  if (bookingResult.requiresAuth) {
  return NextResponse.json({
    success: true,

    requiresAuth: true,

    message:
      "Before I can complete this booking, please sign in or create a Hayes & Ride account.",
  })
}


  if (bookingResult.unavailable) {
    return NextResponse.json({
      success: true,

      message:
        `I'm sorry, the selected vehicle is not available for ${args.date} at ${args.time}. Would you like me to check other available vehicles for you?`,

      tool: "createBooking",

      unavailable: true,

      error: bookingResult.error,
    })
  }

  /*
   * REAL booking succeeded.
   */
  const booking = bookingResult.booking

  /*
   * Generate final natural-language confirmation.
   *
   * Reuse the ORIGINAL Gemini function-call parts
   * so the thought_signature remains intact.
   */
  const finalResponse =
    await ai.models.generateContent({
      model:
        "gemini-3.1-flash-lite",

      contents: [
        {
          role: "user",

          parts: [
            {
              text: message,
            },
          ],
        },

        {
          role: "model",

          parts:
            firstResponse
              .candidates?.[0]
              ?.content?.parts || [],
        },

        {
          role: "user",

          parts: [
            {
              functionResponse: {
                name:
                  "createBooking",

                response: {
                  booking,
                },
              },
            },
          ],
        },
      ],

      config: {
        systemInstruction: `
You are Hayes, the professional booking assistant
for Hayes & Ride.

The createBooking tool successfully created
a REAL Hayes & Ride booking.

Confirm the booking using ONLY the real information
returned by the tool.

Include:

- booking reference
- passenger name
- pickup
- destination
- date
- time
- vehicle
- price if returned

Never invent or modify booking information.

Never invent a booking reference.

Be concise and professional.
`,

        tools,
      },
    })

  return NextResponse.json({
    success: true,

    message:
      finalResponse.text ||
      `Your booking has been confirmed. Your reference is ${booking.reference}.`,

    tool: "createBooking",

    booking,
  })
}


    /*
     * Fallback.
     */

    return NextResponse.json({
      success: true,

      message:
        "I can help with your journey. Please tell me your pickup, destination and passenger count.",
    })
  } catch (error) {
    console.error(
      "Hayes AI error:",
      error
    )

    /*
     * Return the REAL error instead of
     * hiding everything behind:
     *
     * "Hayes AI is unavailable."
     */

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Hayes AI is currently unavailable."

    return NextResponse.json(
      {
        success: false,

        error: errorMessage,
      },

      { status: 500 }
    )
  }
}