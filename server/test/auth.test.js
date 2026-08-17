import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

const TEST_HASH = '$2b$10$grQrRvANhJE98EGRlfnTS.k3gno7RH0UpXtflEBjDSyFknwRJwzPq'

describe('POST /api/admin/login', () => {
  let app

  beforeEach(async () => {
    process.env.ADMIN_EMAIL = 'admin@example.com'
    process.env.ADMIN_PASSWORD_HASH = TEST_HASH
    process.env.JWT_SECRET = 'test-secret'
    const { buildApp } = await import('../src/app.js')
    app = buildApp()
  })

  it('returns a JWT for correct credentials', async () => {
    const res = await request(app).post('/api/admin/login').send({
      email: 'admin@example.com',
      password: 'test-password-123'
    })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    const payload = jwt.verify(res.body.token, 'test-secret')
    expect(payload.sub).toBe('admin@example.com')
  })

  it('returns 401 for wrong password', async () => {
    const res = await request(app).post('/api/admin/login').send({
      email: 'admin@example.com',
      password: 'wrong-password'
    })
    expect(res.status).toBe(401)
  })

  it('returns 401 for unknown email', async () => {
    const res = await request(app).post('/api/admin/login').send({
      email: 'someone-else@example.com',
      password: 'test-password-123'
    })
    expect(res.status).toBe(401)
  })
})
