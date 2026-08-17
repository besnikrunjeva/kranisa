import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { testPool, resetDb } from './db.setup.js'
import { searchOffers, createOffer } from '../src/db/offers.js'
import { createAgency } from '../src/db/agencies.js'
import { createDestination } from '../src/db/destinations.js'

async function seedOffer (overrides = {}) {
  const agency = await createAgency(testPool, {
    name: 'Test Agency',
    logo_url: null,
    contact_link: 'https://wa.me/38344000000',
    notes: null
  })
  const destination = await createDestination(testPool, overrides.destinationName || 'Antalya, Turkey')

  const offer = await createOffer(testPool, {
    agency_id: agency.id,
    destination_id: destination.id,
    start_date: '2026-09-01',
    end_date: '2026-09-08',
    nights: 7,
    price_per_person: 499,
    currency: 'EUR',
    board_type: 'all-inclusive',
    star_rating: 4,
    capacity: 4,
    image_url: null,
    external_link: 'https://wa.me/38344000000',
    ...overrides
  })

  return { agency, destination, offer }
}

describe('searchOffers', () => {
  beforeEach(resetDb)
  afterAll(async () => { await testPool.end() })

  it('returns offers matching destination, overlapping dates, and capacity', async () => {
    const { destination } = await seedOffer()

    const results = await searchOffers(testPool, {
      destinationId: destination.id,
      dateFrom: '2026-08-28',
      dateTo: '2026-09-05',
      people: 2
    })

    expect(results).toHaveLength(1)
    expect(results[0].agency_name).toBe('Test Agency')
    expect(results[0].destination_name).toBe('Antalya, Turkey')
  })

  it('excludes offers for a different destination', async () => {
    const { destination: antalya } = await seedOffer()
    const bodrum = await createDestination(testPool, 'Bodrum, Turkey')

    const results = await searchOffers(testPool, {
      destinationId: bodrum.id,
      dateFrom: '2026-08-28',
      dateTo: '2026-09-05',
      people: 2
    })

    expect(results).toHaveLength(0)
    expect(antalya.name).toBe('Antalya, Turkey')
  })

  it('excludes offers whose dates do not overlap the requested range', async () => {
    const { destination } = await seedOffer()

    const results = await searchOffers(testPool, {
      destinationId: destination.id,
      dateFrom: '2026-10-01',
      dateTo: '2026-10-08',
      people: 2
    })

    expect(results).toHaveLength(0)
  })

  it('excludes offers whose capacity is below the requested party size', async () => {
    const { destination } = await seedOffer({ capacity: 2 })

    const results = await searchOffers(testPool, {
      destinationId: destination.id,
      dateFrom: '2026-08-28',
      dateTo: '2026-09-05',
      people: 4
    })

    expect(results).toHaveLength(0)
  })

  it('excludes offers whose end_date has already passed', async () => {
    const { destination } = await seedOffer({ start_date: '2020-01-01', end_date: '2020-01-08' })

    const results = await searchOffers(testPool, {
      destinationId: destination.id,
      dateFrom: '2019-12-25',
      dateTo: '2020-01-10',
      people: 2
    })

    expect(results).toHaveLength(0)
  })

  it('sorts results by price ascending', async () => {
    const { destination, agency } = await seedOffer({ price_per_person: 600 })
    await createOffer(testPool, {
      agency_id: agency.id,
      destination_id: destination.id,
      start_date: '2026-09-02',
      end_date: '2026-09-09',
      nights: 7,
      price_per_person: 350,
      currency: 'EUR',
      board_type: 'all-inclusive',
      star_rating: 3,
      capacity: 4,
      image_url: null,
      external_link: 'https://wa.me/38344000001'
    })

    const results = await searchOffers(testPool, {
      destinationId: destination.id,
      dateFrom: '2026-08-28',
      dateTo: '2026-09-05',
      people: 2
    })

    expect(results.map(r => Number(r.price_per_person))).toEqual([350, 600])
  })
})
