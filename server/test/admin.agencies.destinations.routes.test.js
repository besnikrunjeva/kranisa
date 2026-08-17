import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { testPool, resetDb } from './db.setup.js'

process.env.JWT_SECRET = 'test-secret'
const token = jwt.sign({ sub: 'admin@example.com' }, 'test-secret')

describe('/api/admin/agencies', () => {
  let app

  beforeEach(async () => {
    await resetDb()
    const { buildApp } = await import('../src/app.js')
    app = buildApp(testPool)
  })

  it('creates and lists agencies for an authenticated admin', async () => {
    const create = await request(app)
      .post('/api/admin/agencies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Agency', contact_link: 'https://wa.me/38344000000' })

    expect(create.status).toBe(201)

    const list = await request(app).get('/api/admin/agencies').set('Authorization', `Bearer ${token}`)
    expect(list.status).toBe(200)
    expect(list.body.map(a => a.name)).toContain('Test Agency')
  })

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/admin/agencies')
    expect(res.status).toBe(401)
  })
})

describe('POST /api/admin/destinations', () => {
  it('creates a destination for an authenticated admin', async () => {
    await resetDb()
    const { buildApp } = await import('../src/app.js')
    const app = buildApp(testPool)

    const res = await request(app)
      .post('/api/admin/destinations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rhodes, Greece' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('Rhodes, Greece')
  })
})

afterAll(async () => { await testPool.end() })
