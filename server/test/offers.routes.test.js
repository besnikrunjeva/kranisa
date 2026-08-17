import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import { testPool, resetDb } from './db.setup.js'
import { createAgency } from '../src/db/agencies.js'
import { createDestination } from '../src/db/destinations.js'
import { createOffer } from '../src/db/offers.js'

vi.mock('../src/db/pool.js', () => ({ default: undefined }))

describe('GET /api/offers', () => {
  let app
  let destination

  beforeEach(async () => {
    await resetDb()
    const agency = await createAgency(testPool, {
      name: 'Test Agency', logo_url: null, contact_link: 'https://wa.me/38344000000', notes: null
    })
    destination = await createDestination(testPool, 'Antalya, Turkey')
    await createOffer(testPool, {
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
      external_link: 'https://wa.me/38344000000'
    })

    const { buildApp } = await import('../src/app.js')
    app = buildApp(testPool)
  })

  it('returns matching offers for valid query params', async () => {
    const res = await request(app).get('/api/offers').query({
      destinationId: destination.id,
      dateFrom: '2026-08-28',
      dateTo: '2026-09-05',
      people: 2
    })

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].agency_name).toBe('Test Agency')
  })

  it('returns 400 when required query params are missing', async () => {
    const res = await request(app).get('/api/offers').query({ destinationId: destination.id })
    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })
})

describe('GET /api/destinations', () => {
  it('returns the seeded destination list', async () => {
    await resetDb()
    await createDestination(testPool, 'Antalya, Turkey')
    const { buildApp } = await import('../src/app.js')
    const app = buildApp(testPool)

    const res = await request(app).get('/api/destinations')
    expect(res.status).toBe(200)
    expect(res.body.map(d => d.name)).toContain('Antalya, Turkey')
  })
})

afterAll(async () => { await testPool.end() })
