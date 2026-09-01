import { z } from "zod"

export const bookingSchema = z.object({
  pickup: z.string().min(2, "Pickup location is required"),
  destination: z.string().min(2, "Destination is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  passengers: z
    .number()
    .int()
    .min(1)
    .max(8),
  vehicleType: z.enum([
    "executive-sedan",
    "business-class",
    "executive-mpv",
  ]),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
  }),
})

export type ValidatedBookingInput = z.infer<typeof bookingSchema>

export const bookingUpdateSchema = z
  .object({
    pickup: z.string().min(2, "Pickup location is required").optional(),
    destination: z.string().min(2, "Destination is required").optional(),
    date: z.string().min(1, "Date is required").optional(),
    time: z.string().min(1, "Time is required").optional(),
    passengers: z.number().int().min(1).max(8).optional(),
    status: z
      .enum([
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ])
      .optional(),
  })
  .refine(
    (updates) =>
      Object.values(updates).some(
        (value) => value !== undefined
      ),
    {
      message: "No valid booking updates provided.",
    }
  )

export type ValidatedBookingUpdate = z.infer<
  typeof bookingUpdateSchema
>
