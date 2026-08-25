export type VehicleType =
  | "executive-sedan"
  | "business-class"
  | "executive-mpv"

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"

export interface BookingInput {
  pickup: string
  destination: string
  date: string
  time: string
  passengers: number
  vehicleType: VehicleType
  customer: {
    name: string
    email: string
    phone: string
  }
}

export interface Booking {
  reference: string
  pickup: string
  destination: string
  date: string
  time: string
  passengers: number
  vehicleType: VehicleType
  customer: {
    name: string
    email: string
    phone: string
  }
  quote: {
    amount: number
    currency: "GBP"
  }
  status: BookingStatus
  createdAt: Date
}