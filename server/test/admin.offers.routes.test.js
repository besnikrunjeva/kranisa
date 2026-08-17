import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { testPool, resetDb } from './db.setup.js'
import { createAgency } from '../src/db/agencies.js'
import { createDestination } from '../src/db/destinations.js'

process.env.JWT_SECRET = 'test-secret'
const token = jwt.sign({ sub: 'admin@example.com' }, 'test-secret')

describe('/api/admin/offers', () => {
  let app
  let agency
  let destination

  beforeEach(async () => {
    await resetDb()
    agency = await createAgency(testPool, {
      name: 'Test Agency', logo_url: null, contact_link: 'https://wa.me/38344000000', notes: null
    })
    destination = await createDestination(testPool, 'Antalya, Turkey')
    const { buildApp } = await import('../src/app.js')
    app = buildApp(testPool)
  })

  afterAll(async () => { await testPool.end() })

  const validOffer = () => ({
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

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/admin/offers')
    expect(res.status).toBe(401)
  })

  it('creates an offer with a valid token and body', async () => {
    const res = await request(app)
      .post('/api/admin/offers')
      .set('Authorization', `Bearer ${token}`)
      .send(validOffer())

    expect(res.status).toBe(201)
    expect(res.body.id).toBeDefined()
  })

  it('rejects offer creation with invalid data', async () => {
    const res = await request(app)
      .post('/api/admin/offers')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validOffer(), price_per_person: -5 })

    expect(res.status).toBe(400)
    expect(res.body.errors).toContain('price_per_person must be greater than 0')
  })

  it('lists all offers including expired ones', async () => {
    await request(app).post('/api/admin/offers').set('Authorization', `Bearer ${token}`)
      .send({ ...validOffer(), start_date: '2020-01-01', end_date: '2020-01-08' })

    const res = await request(app).get('/api/admin/offers').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('updates an offer', async () => {
    const created = await request(app).post('/api/admin/offers').set('Authorization', `Bearer ${token}`).send(validOffer())

    const res = await request(app)
      .put(`/api/admin/offers/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validOffer(), price_per_person: 399 })

    expect(res.status).toBe(200)
    expect(Number(res.body.price_per_person)).toBe(399)
  })

  it('deletes an offer', async () => {
    const created = await request(app).post('/api/admin/offers').set('Authorization', `Bearer ${token}`).send(validOffer())

    const res = await request(app)
      .delete(`/api/admin/offers/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(204)

    const list = await request(app).get('/api/admin/offers').set('Authorization', `Bearer ${token}`)
    expect(list.body).toHaveLength(0)
  })
})
