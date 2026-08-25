export type VehicleStatus =
  | "available"
  | "maintenance"
  | "inactive"

export type VehicleType =
  | "executive-sedan"
  | "business-class"
  | "executive-mpv"

export interface Vehicle {
  name: string
  type: VehicleType
  registration: string
  passengers: number
  luggage: number
  status: VehicleStatus
  features: string[]
}