export function generateBookingReference() {
  const random = Math.floor(10000 + Math.random() * 90000)

  return `HR-${random}`
}