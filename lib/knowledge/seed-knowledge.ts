

import {
  createKnowledge,
} from "./knowledge-service"

const knowledge = [
  {
    title:
      "Hayes & Ride Services",

    category:
      "services",

    tags: [
      "services",
      "chauffeur",
      "airport",
      "transfers",
    ],

    content: `
Hayes & Ride provides professional private chauffeur
and executive transportation services.

Services include airport transfers, private journeys,
corporate transportation and chauffeur-driven travel.

Customers can request quotes and make bookings through
the Hayes & Ride booking system.

Hayes & Ride provides transportation for Heathrow Airport
transfers and journeys around London.
`,
  },

  {
    title:
      "Heathrow Airport Transfers",

    category:
      "airport",

    tags: [
      "heathrow",
      "airport",
      "transfer",
    ],

    content: `
Hayes & Ride provides chauffeur-driven Heathrow Airport
transfers.

Customers can provide their pickup location, destination,
travel date, time and number of passengers.

The Hayes & Ride assistant can calculate a real quote
using the company's quote system.
`,
  },

  {
    title:
      "Mercedes-Benz V-Class",

    category:
      "vehicles",

    tags: [
      "v-class",
      "executive-mpv",
      "mercedes",
      "mpv",
    ],

    content: `
The Mercedes-Benz V-Class is an Executive MPV.

Passenger capacity: 7 passengers.

Luggage capacity: 5 bags.

Features include Wi-Fi, spacious passenger accommodation
and professional chauffeur service.

The vehicle is suitable for airport transfers, families,
groups and executive travel.
`,
  },

  {
    title:
      "Mercedes-Benz E-Class",

    category:
      "vehicles",

    tags: [
      "e-class",
      "executive-sedan",
      "mercedes",
      "sedan",
    ],

    content: `
The Mercedes-Benz E-Class is an Executive Sedan.

Passenger capacity: 3 passengers.

Luggage capacity: 2 bags.

It is suitable for executive transportation and
professional chauffeur journeys.
`,
  },

  {
    title:
      "Mercedes-Benz S-Class",

    category:
      "vehicles",

    tags: [
      "s-class",
      "business-class",
      "mercedes",
      "luxury",
    ],

    content: `
The Mercedes-Benz S-Class is a Business Class vehicle.

Passenger capacity: 3 passengers.

Luggage capacity: 2 bags.

It is designed for premium executive and business travel.
`,
  },

  {
    title:
      "Booking Process",

    category:
      "bookings",

    tags: [
      "booking",
      "reservation",
      "quote",
    ],

    content: `
Customers can request a quote by providing their pickup
location, destination and passenger count.

After receiving a quote, the customer can explicitly
confirm that they want to proceed with the booking.

The Hayes & Ride assistant then collects the required
customer information and creates the booking through
the real booking system.

Bookings receive a unique Hayes & Ride booking reference.
`,
  },

  {
    title:
      "Booking Management",

    category:
      "bookings",

    tags: [
      "booking",
      "manage",
      "change",
      "cancel",
    ],

    content: `
Customers can use their Hayes & Ride booking reference
to check booking status and details.

Existing bookings can be updated when supported by the
booking system.

Customers can also cancel an existing booking through
the Hayes & Ride assistant.
`,
  },
]

async function seed() {
  for (const item of knowledge) {
    console.log(
      `Creating knowledge: ${item.title}`
    )

    await createKnowledge(item)
  }

  console.log(
    "Hayes knowledge seeded successfully."
  )
}

seed()
  .catch((error) => {
    console.error(
      "Knowledge seed failed:",
      error
    )

    process.exit(1)
  })