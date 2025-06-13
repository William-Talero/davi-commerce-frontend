// Utility functions for card validation and formatting

export const formatCardNumber = (value: string): string => {
  // Remove all non-digit characters
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")

  // Add spaces every 4 digits
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ""
  const parts = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    return parts.join(" ")
  } else {
    return v
  }
}

export const formatExpiryDate = (value: string): string => {
  // Remove all non-digit characters
  const v = value.replace(/\D/g, "")

  // Add slash after 2 digits
  if (v.length >= 2) {
    return v.substring(0, 2) + "/" + v.substring(2, 4)
  }

  return v
}

export const formatCVV = (value: string): string => {
  // Only allow digits, max 4 characters
  return value.replace(/\D/g, "").substring(0, 4)
}

export const validateCardNumber = (cardNumber: string): boolean => {
  // Remove spaces and check if it's 13-19 digits
  const cleaned = cardNumber.replace(/\s/g, "")
  return /^\d{13,19}$/.test(cleaned)
}

export const validateExpiryDate = (expiryDate: string): { isValid: boolean; message?: string } => {
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return { isValid: false, message: "Invalid format. Use MM/YY" }
  }

  const [month, year] = expiryDate.split("/").map(Number)

  if (month < 1 || month > 12) {
    return { isValid: false, message: "Invalid month" }
  }

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear() % 100 // Get last 2 digits
  const currentMonth = currentDate.getMonth() + 1

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, message: "Card has expired" }
  }

  return { isValid: true }
}

export const validateCVV = (cvv: string): boolean => {
  return /^\d{3,4}$/.test(cvv)
}

export const getCardType = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, "")

  if (/^4/.test(cleaned)) return "Visa"
  if (/^5[1-5]/.test(cleaned)) return "Mastercard"
  if (/^3[47]/.test(cleaned)) return "American Express"
  if (/^6/.test(cleaned)) return "Discover"

  return "Unknown"
}

export const maskCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, "")
  if (cleaned.length < 4) return cardNumber

  const lastFour = cleaned.slice(-4)
  const masked = "*".repeat(cleaned.length - 4)

  return formatCardNumber(masked + lastFour)
}
