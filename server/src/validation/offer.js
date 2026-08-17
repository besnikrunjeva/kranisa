const REQUIRED_FIELDS = [
  'agency_id',
  'destination_id',
  'start_date',
  'end_date',
  'nights',
  'price_per_person',
  'currency',
  'board_type',
  'capacity',
  'external_link'
]

export function validateOfferInput (data) {
  const errors = []

  for (const field of REQUIRED_FIELDS) {
    const value = data[field]
    if (value === undefined || value === null || value === '') {
      errors.push(`${field} is required`)
    }
  }

  if (data.start_date && data.end_date) {
    if (new Date(data.end_date) <= new Date(data.start_date)) {
      errors.push('end_date must be after start_date')
    }
  }

  if (data.price_per_person !== undefined && data.price_per_person !== null) {
    if (Number(data.price_per_person) <= 0) {
      errors.push('price_per_person must be greater than 0')
    }
  }

  if (data.capacity !== undefined && data.capacity !== null) {
    if (Number(data.capacity) <= 0) {
      errors.push('capacity must be greater than 0')
    }
  }

  if (data.star_rating !== undefined && data.star_rating !== null && data.star_rating !== '') {
    const rating = Number(data.star_rating)
    if (rating < 1 || rating > 5) {
      errors.push('star_rating must be between 1 and 5')
    }
  }

  return errors
}
