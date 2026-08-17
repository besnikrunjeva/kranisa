import { describe, it, expect } from 'vitest'
import { validateOfferInput } from '../src/validation/offer.js'

const validOffer = {
  agency_id: 1,
  destination_id: 1,
  start_date: '2026-09-01',
  end_date: '2026-09-08',
  nights: 7,
  price_per_person: 499.99,
  currency: 'EUR',
  board_type: 'all-inclusive',
  capacity: 4,
  external_link: 'https://wa.me/38344123456'
}

describe('validateOfferInput', () => {
  it('returns no errors for a valid offer', () => {
    expect(validateOfferInput(validOffer)).toEqual([])
  })

  it('requires agency_id, destination_id, and external_link', () => {
    const errors = validateOfferInput({ ...validOffer, agency_id: undefined, destination_id: undefined, external_link: '' })
    expect(errors).toContain('agency_id is required')
    expect(errors).toContain('destination_id is required')
    expect(errors).toContain('external_link is required')
  })

  it('requires end_date to be after start_date', () => {
    const errors = validateOfferInput({ ...validOffer, start_date: '2026-09-08', end_date: '2026-09-01' })
    expect(errors).toContain('end_date must be after start_date')
  })

  it('requires price_per_person to be greater than 0', () => {
    const errors = validateOfferInput({ ...validOffer, price_per_person: 0 })
    expect(errors).toContain('price_per_person must be greater than 0')
  })

  it('requires capacity to be greater than 0', () => {
    const errors = validateOfferInput({ ...validOffer, capacity: 0 })
    expect(errors).toContain('capacity must be greater than 0')
  })

  it('rejects star_rating outside 1-5 when provided', () => {
    const errors = validateOfferInput({ ...validOffer, star_rating: 6 })
    expect(errors).toContain('star_rating must be between 1 and 5')
  })

  it('allows star_rating to be omitted', () => {
    expect(validateOfferInput(validOffer)).toEqual([])
  })
})
