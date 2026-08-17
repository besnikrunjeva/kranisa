# Trip Compare MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working MVP of Trip Compare — a site where users search destination + dates + party size and see matching package-holiday offers from Kosovo/Albania travel agencies, plus an admin panel where the site owner manually enters those offers.

**Architecture:** Monorepo with `server/` (Node/Express REST API + Postgres) and `client/` (React + Vite + Tailwind SPA). Public search endpoint queries offers by destination/date-overlap/capacity. Admin routes are JWT-protected (single hardcoded admin user via env vars, no signup). Frontend calls the API directly; clicking an offer opens the agency's external link in a new tab. No booking/payment flow.

**Tech Stack:** Node.js + Express, PostgreSQL (`pg` driver, hand-written SQL, no ORM), JWT auth (`jsonwebtoken` + `bcrypt`), Vitest + Supertest for backend tests. React + Vite + Tailwind + `react-router-dom` for frontend; lightweight custom i18n context (no external i18n library) for Albanian/English.

**Spec:** `docs/superpowers/specs/2026-08-17-trip-compare-mvp-design.md`

## Global Constraints

- No booking or payment happens on the platform — offers link out to the agency (site, WhatsApp, or phone) via `external_link`, opened in a new tab.
- v1 offer data is entered manually through the admin panel only — no scraping, no agency self-serve.
- Single admin user for v1 (no public signup, no multi-user roles).
- Site supports Albanian and English via a language toggle.
- Offers whose `end_date` has passed are excluded from public search results but remain visible in the admin list.
- Package holidays only for v1 (fixed dates, not flexible/custom quotes).

---

## File Structure

```
trip-compare/
  server/
    src/
      db/
        schema.sql
        pool.js
        seed.js
        offers.js
        agencies.js
        destinations.js
      middleware/
        auth.js
      routes/
        auth.js
        offers.js
        agencies.js
        destinations.js
      validation/
        offer.js
      app.js
      index.js
    test/
      offers.search.test.js
      offers.validation.test.js
      auth.test.js
      offers.routes.test.js
      admin.offers.routes.test.js
      agencies.destinations.routes.test.js
    package.json
    .env.example
  client/
    src/
      api/
        client.js
        offers.js
        auth.js
        agencies.js
        destinations.js
      i18n/
        en.json
        sq.json
        I18nContext.jsx
      auth/
        AuthContext.jsx
        RequireAdmin.jsx
      components/
        LanguageToggle.jsx
        SearchForm.jsx
        OfferCard.jsx
        OfferList.jsx
        EmptyState.jsx
      pages/
        SearchPage.jsx
        AdminLoginPage.jsx
        AdminOffersPage.jsx
      App.jsx
      main.jsx
    index.html
    package.json
  render.yaml
  README.md
```

---

### Task 1: Backend scaffolding + health check

**Files:**
- Create: `server/package.json`
- Create: `server/src/app.js`
- Create: `server/src/index.js`
- Create: `server/.env.example`
- Test: `server/test/health.test.js`

**Interfaces:**
- Produces: `app.js` exports an Express `app` instance (default export) used by every later route/test task.

- [ ] **Step 1: Create `server/package.json`**

```json
{
  "name": "trip-compare-server",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "start": "node src/index.js",
    "dev": "node --watch src/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.12.0"
  },
  "devDependencies": {
    "supertest": "^7.0.0",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd server && npm install`

- [ ] **Step 3: Write the failing test**

```js
// server/test/health.test.js
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../src/app.js'

describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd server && npx vitest run test/health.test.js`
Expected: FAIL — `app.js` does not exist yet.

- [ ] **Step 5: Create `server/src/app.js`**

```js
import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

export default app
```

- [ ] **Step 6: Create `server/src/index.js`**

```js
import 'dotenv/config'
import app from './app.js'

const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log(`trip-compare server listening on port ${port}`)
})
```

- [ ] **Step 7: Create `server/.env.example`**

```
DATABASE_URL=postgres://localhost:5432/trip_compare
PORT=4000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=
JWT_SECRET=change-me
```

- [ ] **Step 8: Run test to verify it passes**

Run: `cd server && npx vitest run test/health.test.js`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
cd server && git add -A && git commit -m "feat(server): scaffold Express app with health check"
```

---

### Task 2: Database schema, connection pool, seed data

**Files:**
- Create: `server/src/db/schema.sql`
- Create: `server/src/db/pool.js`
- Create: `server/src/db/seed.js`
- Test: `server/test/db.setup.js` (test helper, not a test file itself)

**Interfaces:**
- Produces: `pool.js` exports a `pg.Pool` instance (default export) used by every later `db/*.js` module. `schema.sql` defines tables `agencies`, `destinations`, `offers` used by all later query modules.

- [ ] **Step 1: Create `server/src/db/schema.sql`**

```sql
CREATE TABLE IF NOT EXISTS agencies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  contact_link TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS offers (
  id SERIAL PRIMARY KEY,
  agency_id INTEGER NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  nights INTEGER NOT NULL,
  price_per_person NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  board_type TEXT NOT NULL,
  star_rating INTEGER,
  capacity INTEGER NOT NULL,
  image_url TEXT,
  external_link TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

- [ ] **Step 2: Create `server/src/db/pool.js`**

```js
import 'dotenv/config'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
})

export default pool
```

- [ ] **Step 3: Create `server/src/db/seed.js`**

Seeds a starter destinations list. Run manually after schema is applied.

```js
import 'dotenv/config'
import pool from './pool.js'

const destinations = [
  'Antalya, Turkey',
  'Bodrum, Turkey',
  'Sharm El Sheikh, Egypt',
  'Hurghada, Egypt',
  'Rhodes, Greece',
  'Crete, Greece'
]

async function seed () {
  for (const name of destinations) {
    await pool.query(
      'INSERT INTO destinations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [name]
    )
  }
  console.log(`Seeded ${destinations.length} destinations`)
  await pool.end()
}

seed()
```

- [ ] **Step 4: Create local test database and apply schema**

Run:
```bash
createdb trip_compare
createdb trip_compare_test
psql trip_compare -f server/src/db/schema.sql
psql trip_compare_test -f server/src/db/schema.sql
```
Expected: both databases have `agencies`, `destinations`, `offers` tables (verify with `psql trip_compare -c '\dt'`).

- [ ] **Step 5: Create `server/test/db.setup.js`** (shared test helper, truncates tables between tests)

```js
import pg from 'pg'

export const testPool = new pg.Pool({
  connectionString: process.env.TEST_DATABASE_URL || 'postgres://localhost:5432/trip_compare_test'
})

export async function resetDb () {
  await testPool.query('TRUNCATE offers, agencies, destinations RESTART IDENTITY CASCADE')
}
```

- [ ] **Step 6: Run seed script against the dev database**

Run: `cd server && DATABASE_URL=postgres://localhost:5432/trip_compare node src/db/seed.js`
Expected: "Seeded 6 destinations" printed; verify with `psql trip_compare -c 'SELECT * FROM destinations'`.

- [ ] **Step 7: Commit**

```bash
cd server && git add -A && git commit -m "feat(server): add database schema, connection pool, and destination seed script"
```

---

### Task 3: Offer input validation (pure function)

**Files:**
- Create: `server/src/validation/offer.js`
- Test: `server/test/offers.validation.test.js`

**Interfaces:**
- Produces: `validateOfferInput(data)` → returns `string[]` of error messages (empty array = valid). Used by Task 6's admin offer routes.

- [ ] **Step 1: Write the failing tests**

```js
// server/test/offers.validation.test.js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npx vitest run test/offers.validation.test.js`
Expected: FAIL — `../src/validation/offer.js` does not exist.

- [ ] **Step 3: Implement `server/src/validation/offer.js`**

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npx vitest run test/offers.validation.test.js`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
cd server && git add -A && git commit -m "feat(server): add offer input validation"
```

---

### Task 4: Offer search query + integration test

**Files:**
- Create: `server/src/db/offers.js`
- Create: `server/src/db/agencies.js`
- Create: `server/src/db/destinations.js`
- Test: `server/test/offers.search.test.js`

**Interfaces:**
- Consumes: `testPool`, `resetDb` from `server/test/db.setup.js` (Task 2).
- Produces: `searchOffers(pool, { destinationId, dateFrom, dateTo, people })` → `Promise<Offer[]>`, each row shaped `{ id, agency_id, destination_id, start_date, end_date, nights, price_per_person, currency, board_type, star_rating, capacity, image_url, external_link, agency_name, agency_logo_url, agency_contact_link, destination_name }`. Used by Task 5's public route.
- Produces: `listAllOffers(pool)`, `createOffer(pool, data)`, `updateOffer(pool, id, data)`, `deleteOffer(pool, id)` — used by Task 6's admin routes.
- Produces: `createAgency(pool, data)`, `listAgencies(pool)` — used by Task 7.
- Produces: `createDestination(pool, name)`, `listDestinations(pool)` — used by Task 7.

- [ ] **Step 1: Write the failing tests**

```js
// server/test/offers.search.test.js
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
    expect(antalya.name).toBe('Antalya, Turkey') // sanity check fixture
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && TEST_DATABASE_URL=postgres://localhost:5432/trip_compare_test npx vitest run test/offers.search.test.js`
Expected: FAIL — `../src/db/offers.js` does not exist.

- [ ] **Step 3: Implement `server/src/db/agencies.js`**

```js
export async function createAgency (pool, { name, logo_url, contact_link, notes }) {
  const { rows } = await pool.query(
    `INSERT INTO agencies (name, logo_url, contact_link, notes)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, logo_url ?? null, contact_link, notes ?? null]
  )
  return rows[0]
}

export async function listAgencies (pool) {
  const { rows } = await pool.query('SELECT * FROM agencies ORDER BY name ASC')
  return rows
}
```

- [ ] **Step 4: Implement `server/src/db/destinations.js`**

```js
export async function createDestination (pool, name) {
  const { rows } = await pool.query(
    `INSERT INTO destinations (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING *`,
    [name]
  )
  return rows[0]
}

export async function listDestinations (pool) {
  const { rows } = await pool.query('SELECT * FROM destinations ORDER BY name ASC')
  return rows
}
```

- [ ] **Step 5: Implement `server/src/db/offers.js`**

```js
const OFFER_COLUMNS = `
  o.id, o.agency_id, o.destination_id, o.start_date, o.end_date, o.nights,
  o.price_per_person, o.currency, o.board_type, o.star_rating, o.capacity,
  o.image_url, o.external_link, o.created_at, o.updated_at,
  a.name AS agency_name, a.logo_url AS agency_logo_url, a.contact_link AS agency_contact_link,
  d.name AS destination_name
`

export async function searchOffers (pool, { destinationId, dateFrom, dateTo, people }) {
  const { rows } = await pool.query(
    `SELECT ${OFFER_COLUMNS}
     FROM offers o
     JOIN agencies a ON a.id = o.agency_id
     JOIN destinations d ON d.id = o.destination_id
     WHERE o.destination_id = $1
       AND o.start_date <= $2
       AND o.end_date >= $3
       AND o.capacity >= $4
       AND o.end_date >= CURRENT_DATE
     ORDER BY o.price_per_person ASC`,
    [destinationId, dateTo, dateFrom, people]
  )
  return rows
}

export async function listAllOffers (pool) {
  const { rows } = await pool.query(
    `SELECT ${OFFER_COLUMNS}
     FROM offers o
     JOIN agencies a ON a.id = o.agency_id
     JOIN destinations d ON d.id = o.destination_id
     ORDER BY o.start_date DESC`
  )
  return rows
}

export async function createOffer (pool, data) {
  const { rows } = await pool.query(
    `INSERT INTO offers
       (agency_id, destination_id, start_date, end_date, nights, price_per_person,
        currency, board_type, star_rating, capacity, image_url, external_link)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      data.agency_id, data.destination_id, data.start_date, data.end_date, data.nights,
      data.price_per_person, data.currency, data.board_type, data.star_rating ?? null,
      data.capacity, data.image_url ?? null, data.external_link
    ]
  )
  return rows[0]
}

export async function updateOffer (pool, id, data) {
  const { rows } = await pool.query(
    `UPDATE offers SET
       agency_id = $1, destination_id = $2, start_date = $3, end_date = $4, nights = $5,
       price_per_person = $6, currency = $7, board_type = $8, star_rating = $9,
       capacity = $10, image_url = $11, external_link = $12, updated_at = now()
     WHERE id = $13
     RETURNING *`,
    [
      data.agency_id, data.destination_id, data.start_date, data.end_date, data.nights,
      data.price_per_person, data.currency, data.board_type, data.star_rating ?? null,
      data.capacity, data.image_url ?? null, data.external_link, id
    ]
  )
  return rows[0]
}

export async function deleteOffer (pool, id) {
  const { rowCount } = await pool.query('DELETE FROM offers WHERE id = $1', [id])
  return rowCount > 0
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd server && TEST_DATABASE_URL=postgres://localhost:5432/trip_compare_test npx vitest run test/offers.search.test.js`
Expected: PASS (6 tests)

- [ ] **Step 7: Commit**

```bash
cd server && git add -A && git commit -m "feat(server): add offers/agencies/destinations query functions with search test coverage"
```

---

### Task 5: Public search API endpoint

**Files:**
- Create: `server/src/routes/offers.js`
- Create: `server/src/routes/destinations.js`
- Modify: `server/src/app.js`
- Test: `server/test/offers.routes.test.js`

**Interfaces:**
- Consumes: `searchOffers` (Task 4), `listDestinations` (Task 4).
- Produces: mounts `GET /api/offers` and `GET /api/destinations` on `app` — consumed by the frontend in Task 10.

- [ ] **Step 1: Write the failing tests**

```js
// server/test/offers.routes.test.js
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

  afterAll(async () => { await testPool.end() })

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && TEST_DATABASE_URL=postgres://localhost:5432/trip_compare_test npx vitest run test/offers.routes.test.js`
Expected: FAIL — `app.js` does not export `buildApp`, and `routes/offers.js`/`routes/destinations.js` don't exist yet.

- [ ] **Step 3: Refactor `server/src/app.js` to accept an injectable pool**

```js
import express from 'express'
import cors from 'cors'
import defaultPool from './db/pool.js'
import buildOffersRouter from './routes/offers.js'
import buildDestinationsRouter from './routes/destinations.js'

export function buildApp (pool = defaultPool) {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/offers', buildOffersRouter(pool))
  app.use('/api/destinations', buildDestinationsRouter(pool))

  return app
}

const app = buildApp()
export default app
```

- [ ] **Step 4: Create `server/src/routes/offers.js`**

```js
import { Router } from 'express'
import { searchOffers } from '../db/offers.js'

export default function buildOffersRouter (pool) {
  const router = Router()

  router.get('/', async (req, res) => {
    const { destinationId, dateFrom, dateTo, people } = req.query

    if (!destinationId || !dateFrom || !dateTo || !people) {
      return res.status(400).json({ error: 'destinationId, dateFrom, dateTo, and people are required' })
    }

    const results = await searchOffers(pool, {
      destinationId: Number(destinationId),
      dateFrom,
      dateTo,
      people: Number(people)
    })

    res.json(results)
  })

  return router
}
```

- [ ] **Step 5: Create `server/src/routes/destinations.js`**

```js
import { Router } from 'express'
import { listDestinations } from '../db/destinations.js'

export default function buildDestinationsRouter (pool) {
  const router = Router()

  router.get('/', async (req, res) => {
    const results = await listDestinations(pool)
    res.json(results)
  })

  return router
}
```

- [ ] **Step 6: Update `server/src/index.js` to use `buildApp`**

```js
import 'dotenv/config'
import { buildApp } from './app.js'

const app = buildApp()
const port = process.env.PORT || 4000

app.listen(port, () => {
  console.log(`trip-compare server listening on port ${port}`)
})
```

- [ ] **Step 7: Update `server/test/health.test.js` to use `buildApp`**

```js
// server/test/health.test.js
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { buildApp } from '../src/app.js'

describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const app = buildApp()
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
```

- [ ] **Step 8: Run all backend tests to verify they pass**

Run: `cd server && TEST_DATABASE_URL=postgres://localhost:5432/trip_compare_test npx vitest run`
Expected: PASS (health, validation, search, and route tests all green)

- [ ] **Step 9: Commit**

```bash
cd server && git add -A && git commit -m "feat(server): add public offers search and destinations endpoints"
```

---

### Task 6: Admin auth (login + JWT middleware)

**Files:**
- Create: `server/src/middleware/auth.js`
- Create: `server/src/routes/auth.js`
- Modify: `server/src/app.js`
- Test: `server/test/auth.test.js`

**Interfaces:**
- Produces: `requireAdmin(req, res, next)` middleware, used by Task 7's admin routes.
- Produces: mounts `POST /api/admin/login` on `app` — consumed by the frontend in Task 11.

- [ ] **Step 1: Generate a bcrypt hash for a test admin password**

Run: `cd server && node -e "import('bcrypt').then(b => b.hash('test-password-123', 10).then(console.log))"`
Copy the printed hash for use in Step 2's test and your local `.env`.

- [ ] **Step 2: Write the failing tests**

```js
// server/test/auth.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

const TEST_HASH = '$2b$10$replace.with.hash.from.step.1..................................'

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
```

- [ ] **Step 3: Replace `TEST_HASH` placeholder with the real hash from Step 1**

Edit `server/test/auth.test.js` and paste the actual bcrypt hash printed in Step 1 in place of `TEST_HASH`'s value.

- [ ] **Step 4: Run tests to verify they fail**

Run: `cd server && npx vitest run test/auth.test.js`
Expected: FAIL — `POST /api/admin/login` route does not exist (404).

- [ ] **Step 5: Create `server/src/middleware/auth.js`**

```js
import jwt from 'jsonwebtoken'

export function requireAdmin (req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'missing token' })
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'invalid or expired token' })
  }
}
```

- [ ] **Step 6: Create `server/src/routes/auth.js`**

```js
import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (email !== process.env.ADMIN_EMAIL) {
    return res.status(401).json({ error: 'invalid credentials' })
  }

  const valid = await bcrypt.compare(password || '', process.env.ADMIN_PASSWORD_HASH || '')
  if (!valid) {
    return res.status(401).json({ error: 'invalid credentials' })
  }

  const token = jwt.sign({ sub: email }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token })
})

export default router
```

- [ ] **Step 7: Mount the auth router in `server/src/app.js`**

```js
import adminAuthRouter from './routes/auth.js'
// ...alongside the other router imports

  app.use('/api/admin', adminAuthRouter)
```

(Insert this line after the `/api/destinations` mount, inside `buildApp`.)

- [ ] **Step 8: Run tests to verify they pass**

Run: `cd server && npx vitest run test/auth.test.js`
Expected: PASS (3 tests)

- [ ] **Step 9: Commit**

```bash
cd server && git add -A && git commit -m "feat(server): add admin login endpoint and JWT auth middleware"
```

---

### Task 7: Admin CRUD endpoints (offers, agencies, destinations)

**Files:**
- Create: `server/src/routes/admin-offers.js`
- Create: `server/src/routes/admin-agencies.js`
- Create: `server/src/routes/admin-destinations.js`
- Modify: `server/src/app.js`
- Modify: `server/src/routes/destinations.js` (destinations already has a public GET; admin adds POST)
- Test: `server/test/admin.offers.routes.test.js`
- Test: `server/test/admin.agencies.destinations.routes.test.js`

**Interfaces:**
- Consumes: `requireAdmin` (Task 6), `validateOfferInput` (Task 3), `createOffer`/`updateOffer`/`deleteOffer`/`listAllOffers` (Task 4), `createAgency`/`listAgencies` (Task 4), `createDestination` (Task 4).
- Produces: mounts `GET/POST/PUT/DELETE /api/admin/offers[/:id]`, `GET/POST /api/admin/agencies`, `POST /api/admin/destinations` — consumed by the frontend admin panel in Task 12.

- [ ] **Step 1: Write the failing tests for admin offers**

```js
// server/test/admin.offers.routes.test.js
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
```

- [ ] **Step 2: Write the failing tests for admin agencies/destinations**

```js
// server/test/admin.agencies.destinations.routes.test.js
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

  afterAll(async () => { await testPool.end() })

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
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd server && TEST_DATABASE_URL=postgres://localhost:5432/trip_compare_test npx vitest run test/admin.offers.routes.test.js test/admin.agencies.destinations.routes.test.js`
Expected: FAIL — admin routes don't exist yet.

- [ ] **Step 4: Create `server/src/routes/admin-offers.js`**

```js
import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import { validateOfferInput } from '../validation/offer.js'
import { listAllOffers, createOffer, updateOffer, deleteOffer } from '../db/offers.js'

export default function buildAdminOffersRouter (pool) {
  const router = Router()
  router.use(requireAdmin)

  router.get('/', async (req, res) => {
    res.json(await listAllOffers(pool))
  })

  router.post('/', async (req, res) => {
    const errors = validateOfferInput(req.body)
    if (errors.length > 0) return res.status(400).json({ errors })

    const offer = await createOffer(pool, req.body)
    res.status(201).json(offer)
  })

  router.put('/:id', async (req, res) => {
    const errors = validateOfferInput(req.body)
    if (errors.length > 0) return res.status(400).json({ errors })

    const offer = await updateOffer(pool, req.params.id, req.body)
    if (!offer) return res.status(404).json({ error: 'offer not found' })
    res.json(offer)
  })

  router.delete('/:id', async (req, res) => {
    const deleted = await deleteOffer(pool, req.params.id)
    if (!deleted) return res.status(404).json({ error: 'offer not found' })
    res.status(204).end()
  })

  return router
}
```

- [ ] **Step 5: Create `server/src/routes/admin-agencies.js`**

```js
import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import { createAgency, listAgencies } from '../db/agencies.js'

export default function buildAdminAgenciesRouter (pool) {
  const router = Router()
  router.use(requireAdmin)

  router.get('/', async (req, res) => {
    res.json(await listAgencies(pool))
  })

  router.post('/', async (req, res) => {
    const { name, logo_url, contact_link, notes } = req.body
    if (!name || !contact_link) {
      return res.status(400).json({ error: 'name and contact_link are required' })
    }
    const agency = await createAgency(pool, { name, logo_url, contact_link, notes })
    res.status(201).json(agency)
  })

  return router
}
```

- [ ] **Step 6: Create `server/src/routes/admin-destinations.js`**

```js
import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import { createDestination } from '../db/destinations.js'

export default function buildAdminDestinationsRouter (pool) {
  const router = Router()
  router.use(requireAdmin)

  router.post('/', async (req, res) => {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'name is required' })
    const destination = await createDestination(pool, name)
    res.status(201).json(destination)
  })

  return router
}
```

- [ ] **Step 7: Mount the admin routers in `server/src/app.js`**

```js
import buildAdminOffersRouter from './routes/admin-offers.js'
import buildAdminAgenciesRouter from './routes/admin-agencies.js'
import buildAdminDestinationsRouter from './routes/admin-destinations.js'
// ...alongside the other router imports

  app.use('/api/admin/offers', buildAdminOffersRouter(pool))
  app.use('/api/admin/agencies', buildAdminAgenciesRouter(pool))
  app.use('/api/admin/destinations', buildAdminDestinationsRouter(pool))
```

(Insert these three lines after the `/api/admin` auth mount, inside `buildApp`, before `return app`.)

- [ ] **Step 8: Run all backend tests to verify they pass**

Run: `cd server && TEST_DATABASE_URL=postgres://localhost:5432/trip_compare_test npx vitest run`
Expected: PASS — every backend test file green. This completes the backend.

- [ ] **Step 9: Commit**

```bash
cd server && git add -A && git commit -m "feat(server): add admin CRUD endpoints for offers, agencies, and destinations"
```

---

### Task 8: Frontend scaffolding + routing skeleton

**Files:**
- Create: `client/package.json`
- Create: `client/index.html`
- Create: `client/vite.config.js`
- Create: `client/tailwind.config.js`
- Create: `client/postcss.config.js`
- Create: `client/src/main.jsx`
- Create: `client/src/App.jsx`
- Create: `client/src/index.css`
- Create: `client/.env.example`

**Interfaces:**
- Produces: `App.jsx` with routes `/`, `/admin/login`, `/admin` (placeholder pages) — later tasks replace placeholders with real pages.

- [ ] **Step 1: Scaffold the Vite React project**

Run:
```bash
cd ~/trip-compare
npm create vite@latest client -- --template react
cd client
npm install
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 2: Configure `client/tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: []
}
```

- [ ] **Step 3: Replace `client/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Create `client/.env.example`**

```
VITE_API_URL=http://localhost:4000
```

- [ ] **Step 5: Create placeholder pages and `client/src/App.jsx`**

```jsx
// client/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function SearchPagePlaceholder () {
  return <div className="p-8">Search page (coming in Task 10)</div>
}

function AdminLoginPlaceholder () {
  return <div className="p-8">Admin login (coming in Task 11)</div>
}

function AdminOffersPlaceholder () {
  return <div className="p-8">Admin offers (coming in Task 12)</div>
}

export default function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPagePlaceholder />} />
        <Route path="/admin/login" element={<AdminLoginPlaceholder />} />
        <Route path="/admin" element={<AdminOffersPlaceholder />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 6: Verify `client/src/main.jsx` renders `App`**

```jsx
// client/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 7: Manually verify in the browser**

Run: `cd client && cp .env.example .env && npm run dev`
Open the printed local URL. Expected: navigating to `/`, `/admin/login`, and `/admin` each shows the corresponding placeholder text with no console errors.

- [ ] **Step 8: Commit**

```bash
cd client && git add -A && git commit -m "feat(client): scaffold Vite React app with Tailwind and route skeleton"
```

---

### Task 9: i18n (Albanian/English toggle)

**Files:**
- Create: `client/src/i18n/en.json`
- Create: `client/src/i18n/sq.json`
- Create: `client/src/i18n/I18nContext.jsx`
- Create: `client/src/components/LanguageToggle.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Produces: `I18nProvider` (wraps the app), `useI18n()` hook returning `{ lang, setLang, t }` where `t(key)` looks up the current-language dictionary. Used by every page/component with user-facing text from Task 10 onward.

- [ ] **Step 1: Create `client/src/i18n/en.json`**

```json
{
  "app.title": "Trip Compare",
  "search.destination": "Destination",
  "search.dateFrom": "From",
  "search.dateTo": "To",
  "search.people": "Travelers",
  "search.submit": "Search offers",
  "results.empty": "No offers found for these dates — try adjusting your dates or destination.",
  "offer.viewOffer": "View Offer",
  "offer.perPerson": "per person",
  "admin.login.email": "Email",
  "admin.login.password": "Password",
  "admin.login.submit": "Log in",
  "admin.offers.title": "Manage Offers",
  "admin.offers.add": "Add Offer"
}
```

- [ ] **Step 2: Create `client/src/i18n/sq.json`**

```json
{
  "app.title": "Trip Compare",
  "search.destination": "Destinacioni",
  "search.dateFrom": "Nga",
  "search.dateTo": "Deri",
  "search.people": "Udhëtarë",
  "search.submit": "Kërko oferta",
  "results.empty": "Nuk u gjetën oferta për këto data — provoni të ndryshoni datat ose destinacionin.",
  "offer.viewOffer": "Shiko Ofertën",
  "offer.perPerson": "për person",
  "admin.login.email": "Email",
  "admin.login.password": "Fjalëkalimi",
  "admin.login.submit": "Kyçu",
  "admin.offers.title": "Menaxho Ofertat",
  "admin.offers.add": "Shto Ofertë"
}
```

- [ ] **Step 3: Create `client/src/i18n/I18nContext.jsx`**

```jsx
import { createContext, useContext, useState } from 'react'
import en from './en.json'
import sq from './sq.json'

const DICTIONARIES = { en, sq }
const I18nContext = createContext(null)

export function I18nProvider ({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'sq')

  function changeLang (next) {
    setLang(next)
    localStorage.setItem('lang', next)
  }

  function t (key) {
    return DICTIONARIES[lang][key] || key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n () {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
```

- [ ] **Step 4: Create `client/src/components/LanguageToggle.jsx`**

```jsx
import { useI18n } from '../i18n/I18nContext.jsx'

export default function LanguageToggle () {
  const { lang, setLang } = useI18n()

  return (
    <div className="flex gap-2 text-sm">
      <button
        className={lang === 'sq' ? 'font-bold underline' : 'text-gray-500'}
        onClick={() => setLang('sq')}
      >
        SQ
      </button>
      <button
        className={lang === 'en' ? 'font-bold underline' : 'text-gray-500'}
        onClick={() => setLang('en')}
      >
        EN
      </button>
    </div>
  )
}
```

- [ ] **Step 5: Wrap the app in `I18nProvider` — update `client/src/App.jsx`**

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { I18nProvider, useI18n } from './i18n/I18nContext.jsx'
import LanguageToggle from './components/LanguageToggle.jsx'

function SearchPagePlaceholder () {
  const { t } = useI18n()
  return <div className="p-8">{t('app.title')} — search page (coming in Task 10)</div>
}

function AdminLoginPlaceholder () {
  return <div className="p-8">Admin login (coming in Task 11)</div>
}

function AdminOffersPlaceholder () {
  return <div className="p-8">Admin offers (coming in Task 12)</div>
}

export default function App () {
  return (
    <I18nProvider>
      <BrowserRouter>
        <header className="flex justify-end p-4">
          <LanguageToggle />
        </header>
        <Routes>
          <Route path="/" element={<SearchPagePlaceholder />} />
          <Route path="/admin/login" element={<AdminLoginPlaceholder />} />
          <Route path="/admin" element={<AdminOffersPlaceholder />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  )
}
```

- [ ] **Step 6: Manually verify in the browser**

Run: `cd client && npm run dev`
Expected: page shows Albanian text by default ("Kërko oferta" etc. once Task 10 lands; for now just the title text), clicking "EN"/"SQ" toggles the title text and persists across a page refresh (check `localStorage`).

- [ ] **Step 7: Commit**

```bash
cd client && git add -A && git commit -m "feat(client): add Albanian/English i18n context and language toggle"
```

---

### Task 10: Search page (form, results, offer card, empty state)

**Files:**
- Create: `client/src/api/client.js`
- Create: `client/src/api/offers.js`
- Create: `client/src/api/destinations.js`
- Create: `client/src/components/SearchForm.jsx`
- Create: `client/src/components/OfferCard.jsx`
- Create: `client/src/components/OfferList.jsx`
- Create: `client/src/components/EmptyState.jsx`
- Create: `client/src/pages/SearchPage.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Consumes: `useI18n()` (Task 9), backend `GET /api/offers` and `GET /api/destinations` (Task 5).
- Produces: `SearchPage` mounted at `/`, replacing the Task 8 placeholder.

- [ ] **Step 1: Create `client/src/api/client.js`**

```js
const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch (path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = body.error || (body.errors && body.errors.join(', ')) || `Request failed with status ${res.status}`
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}
```

- [ ] **Step 2: Create `client/src/api/offers.js`**

```js
import { apiFetch } from './client.js'

export function searchOffers ({ destinationId, dateFrom, dateTo, people }) {
  const params = new URLSearchParams({ destinationId, dateFrom, dateTo, people })
  return apiFetch(`/api/offers?${params.toString()}`)
}
```

- [ ] **Step 3: Create `client/src/api/destinations.js`**

```js
import { apiFetch } from './client.js'

export function listDestinations () {
  return apiFetch('/api/destinations')
}
```

- [ ] **Step 4: Create `client/src/components/SearchForm.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { listDestinations } from '../api/destinations.js'

export default function SearchForm ({ onSearch }) {
  const { t } = useI18n()
  const [destinations, setDestinations] = useState([])
  const [destinationId, setDestinationId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [people, setPeople] = useState(2)

  useEffect(() => {
    listDestinations().then(setDestinations)
  }, [])

  function handleSubmit (e) {
    e.preventDefault()
    onSearch({ destinationId, dateFrom, dateTo, people })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end p-4 bg-white rounded-lg shadow">
      <label className="flex flex-col text-sm">
        {t('search.destination')}
        <select
          value={destinationId}
          onChange={e => setDestinationId(e.target.value)}
          required
          className="border rounded px-3 py-2 mt-1"
        >
          <option value="" disabled>—</option>
          {destinations.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm">
        {t('search.dateFrom')}
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} required className="border rounded px-3 py-2 mt-1" />
      </label>

      <label className="flex flex-col text-sm">
        {t('search.dateTo')}
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} required className="border rounded px-3 py-2 mt-1" />
      </label>

      <label className="flex flex-col text-sm">
        {t('search.people')}
        <input type="number" min="1" value={people} onChange={e => setPeople(e.target.value)} required className="border rounded px-3 py-2 mt-1 w-24" />
      </label>

      <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-medium">
        {t('search.submit')}
      </button>
    </form>
  )
}
```

- [ ] **Step 5: Create `client/src/components/OfferCard.jsx`**

```jsx
import { useI18n } from '../i18n/I18nContext.jsx'

export default function OfferCard ({ offer }) {
  const { t } = useI18n()

  return (
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow">
      {offer.image_url && (
        <img src={offer.image_url} alt={offer.destination_name} className="w-32 h-32 object-cover rounded" />
      )}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{offer.destination_name}</h3>
            <p className="text-sm text-gray-500">{offer.agency_name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">{Number(offer.price_per_person).toFixed(2)} {offer.currency}</p>
            <p className="text-xs text-gray-500">{t('offer.perPerson')}</p>
          </div>
        </div>
        <p className="text-sm mt-2">
          {offer.start_date} → {offer.end_date} · {offer.nights} nights · {offer.board_type}
          {offer.star_rating ? ` · ${offer.star_rating}★` : ''}
        </p>
        <a
          href={offer.external_link}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium"
        >
          {t('offer.viewOffer')}
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create `client/src/components/EmptyState.jsx`**

```jsx
import { useI18n } from '../i18n/I18nContext.jsx'

export default function EmptyState () {
  const { t } = useI18n()
  return (
    <div className="p-8 text-center text-gray-500">
      {t('results.empty')}
    </div>
  )
}
```

- [ ] **Step 7: Create `client/src/components/OfferList.jsx`**

```jsx
import OfferCard from './OfferCard.jsx'
import EmptyState from './EmptyState.jsx'

export default function OfferList ({ offers }) {
  if (offers.length === 0) return <EmptyState />

  return (
    <div className="flex flex-col gap-4">
      {offers.map(offer => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  )
}
```

- [ ] **Step 8: Create `client/src/pages/SearchPage.jsx`**

```jsx
import { useState } from 'react'
import SearchForm from '../components/SearchForm.jsx'
import OfferList from '../components/OfferList.jsx'
import { searchOffers } from '../api/offers.js'

export default function SearchPage () {
  const [offers, setOffers] = useState(null)
  const [error, setError] = useState(null)

  async function handleSearch (params) {
    setError(null)
    try {
      const results = await searchOffers(params)
      setOffers(results)
    } catch (err) {
      setError(err.message)
      setOffers(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-6">
      <SearchForm onSearch={handleSearch} />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {offers !== null && <OfferList offers={offers} />}
    </div>
  )
}
```

- [ ] **Step 9: Wire `SearchPage` into `client/src/App.jsx`** (replace `SearchPagePlaceholder`)

```jsx
import SearchPage from './pages/SearchPage.jsx'
// remove the SearchPagePlaceholder function and its usage

        <Route path="/" element={<SearchPage />} />
```

- [ ] **Step 10: Manually verify in the browser**

Run: backend (`cd server && npm run dev`) and frontend (`cd client && npm run dev`) together.
Expected: destination dropdown populates from the seeded destinations; submitting a search that matches a manually-inserted test offer (insert one via `psql` using Task 4's schema) shows an `OfferCard` with correct data and a working "View Offer" link opening in a new tab; a search with no matches shows the empty state text in the current language.

- [ ] **Step 11: Apply visual design pass**

Use the 21st.dev Magic MCP to source polished component variants for the search form, offer card, and empty state, and run the `frontend-design` skill's guidance over this page before committing, so the result doesn't read as generic AI-template styling. Keep the component props/behavior from Steps 4-7 intact — this pass is visual only.

- [ ] **Step 12: Commit**

```bash
cd client && git add -A && git commit -m "feat(client): add search page with destination/date/people search and offer results"
```

---

### Task 11: Admin auth (login page + protected routing)

**Files:**
- Create: `client/src/api/auth.js`
- Create: `client/src/auth/AuthContext.jsx`
- Create: `client/src/auth/RequireAdmin.jsx`
- Create: `client/src/pages/AdminLoginPage.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Consumes: backend `POST /api/admin/login` (Task 6).
- Produces: `AuthProvider`, `useAuth()` hook returning `{ token, login, logout }`, and `RequireAdmin` wrapper component — used by Task 12's admin offers page.

- [ ] **Step 1: Create `client/src/api/auth.js`**

```js
import { apiFetch } from './client.js'

export function login (email, password) {
  return apiFetch('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}
```

- [ ] **Step 2: Create `client/src/auth/AuthContext.jsx`**

```jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider ({ children }) {
  const [token, setToken] = useState(localStorage.getItem('adminToken'))

  function login (newToken) {
    setToken(newToken)
    localStorage.setItem('adminToken', newToken)
  }

  function logout () {
    setToken(null)
    localStorage.removeItem('adminToken')
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth () {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

- [ ] **Step 3: Create `client/src/auth/RequireAdmin.jsx`**

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export default function RequireAdmin ({ children }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/admin/login" replace />
  return children
}
```

- [ ] **Step 4: Create `client/src/pages/AdminLoginPage.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { login as loginRequest } from '../api/auth.js'

export default function AdminLoginPage () {
  const { t } = useI18n()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  async function handleSubmit (e) {
    e.preventDefault()
    setError(null)
    try {
      const { token } = await loginRequest(email, password)
      login(token)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-16 p-6 bg-white rounded-lg shadow flex flex-col gap-4">
      <label className="flex flex-col text-sm">
        {t('admin.login.email')}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="border rounded px-3 py-2 mt-1" />
      </label>
      <label className="flex flex-col text-sm">
        {t('admin.login.password')}
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="border rounded px-3 py-2 mt-1" />
      </label>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-medium">
        {t('admin.login.submit')}
      </button>
    </form>
  )
}
```

- [ ] **Step 5: Wrap the app in `AuthProvider` and wire the login route — update `client/src/App.jsx`**

```jsx
import { AuthProvider } from './auth/AuthContext.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
// remove AdminLoginPlaceholder

export default function App () {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <header className="flex justify-end p-4">
            <LanguageToggle />
          </header>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminOffersPlaceholder />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  )
}
```

- [ ] **Step 6: Manually verify in the browser**

Run: backend and frontend dev servers together (create the admin user's bcrypt hash per Task 6 Step 1 and set `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH`/`JWT_SECRET` in `server/.env`).
Expected: visiting `/admin/login`, submitting correct credentials redirects to `/admin` and stores a token in `localStorage`; submitting wrong credentials shows an error message and does not redirect.

- [ ] **Step 7: Commit**

```bash
cd client && git add -A && git commit -m "feat(client): add admin login page and auth context"
```

---

### Task 12: Admin offers management UI

**Files:**
- Create: `client/src/api/admin-offers.js`
- Create: `client/src/api/admin-agencies.js`
- Create: `client/src/components/OfferForm.jsx`
- Create: `client/src/pages/AdminOffersPage.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Consumes: `useAuth()` (Task 11), backend `GET/POST/PUT/DELETE /api/admin/offers[/:id]` and `GET/POST /api/admin/agencies`, `POST /api/admin/destinations`, `GET /api/destinations` (Task 7).
- Produces: `AdminOffersPage` mounted at `/admin` behind `RequireAdmin`, replacing the Task 8 placeholder.

- [ ] **Step 1: Create `client/src/api/admin-offers.js`**

```js
import { apiFetch } from './client.js'

function authHeaders (token) {
  return { Authorization: `Bearer ${token}` }
}

export function listAdminOffers (token) {
  return apiFetch('/api/admin/offers', { headers: authHeaders(token) })
}

export function createAdminOffer (token, data) {
  return apiFetch('/api/admin/offers', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data)
  })
}

export function updateAdminOffer (token, id, data) {
  return apiFetch(`/api/admin/offers/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data)
  })
}

export function deleteAdminOffer (token, id) {
  return apiFetch(`/api/admin/offers/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token)
  })
}
```

- [ ] **Step 2: Create `client/src/api/admin-agencies.js`**

```js
import { apiFetch } from './client.js'

export function listAdminAgencies (token) {
  return apiFetch('/api/admin/agencies', { headers: { Authorization: `Bearer ${token}` } })
}
```

- [ ] **Step 3: Create `client/src/components/OfferForm.jsx`**

```jsx
import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'

const BLANK = {
  agency_id: '', destination_id: '', start_date: '', end_date: '', nights: 7,
  price_per_person: '', currency: 'EUR', board_type: 'all-inclusive',
  star_rating: '', capacity: 2, image_url: '', external_link: ''
}

export default function OfferForm ({ agencies, destinations, initial, onSubmit, onCancel }) {
  const { t } = useI18n()
  const [form, setForm] = useState(initial || BLANK)
  const [errors, setErrors] = useState([])

  function set (field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit (e) {
    e.preventDefault()
    try {
      await onSubmit(form)
    } catch (err) {
      setErrors(err.message.split(', '))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-white rounded-lg shadow">
      <div className="grid grid-cols-2 gap-3">
        <select value={form.agency_id} onChange={e => set('agency_id', e.target.value)} required className="border rounded px-3 py-2">
          <option value="" disabled>Agency</option>
          {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <select value={form.destination_id} onChange={e => set('destination_id', e.target.value)} required className="border rounded px-3 py-2">
          <option value="" disabled>Destination</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required className="border rounded px-3 py-2" />
        <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} required className="border rounded px-3 py-2" />
        <input type="number" placeholder="Nights" value={form.nights} onChange={e => set('nights', e.target.value)} required className="border rounded px-3 py-2" />
        <input type="number" step="0.01" placeholder="Price per person" value={form.price_per_person} onChange={e => set('price_per_person', e.target.value)} required className="border rounded px-3 py-2" />
        <input type="text" placeholder="Currency" value={form.currency} onChange={e => set('currency', e.target.value)} required className="border rounded px-3 py-2" />
        <input type="text" placeholder="Board type" value={form.board_type} onChange={e => set('board_type', e.target.value)} required className="border rounded px-3 py-2" />
        <input type="number" min="1" max="5" placeholder="Star rating" value={form.star_rating} onChange={e => set('star_rating', e.target.value)} className="border rounded px-3 py-2" />
        <input type="number" placeholder="Capacity" value={form.capacity} onChange={e => set('capacity', e.target.value)} required className="border rounded px-3 py-2" />
        <input type="url" placeholder="Image URL" value={form.image_url} onChange={e => set('image_url', e.target.value)} className="border rounded px-3 py-2" />
        <input type="url" placeholder="External link" value={form.external_link} onChange={e => set('external_link', e.target.value)} required className="border rounded px-3 py-2 col-span-2" />
      </div>

      {errors.length > 0 && (
        <ul className="text-red-600 text-sm list-disc list-inside">
          {errors.map(e => <li key={e}>{e}</li>)}
        </ul>
      )}

      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-medium">
          {t('admin.offers.add')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-gray-500 px-4 py-2">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Create `client/src/pages/AdminOffersPage.jsx`**

```jsx
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { listAdminOffers, createAdminOffer, updateAdminOffer, deleteAdminOffer } from '../api/admin-offers.js'
import { listAdminAgencies } from '../api/admin-agencies.js'
import { listDestinations } from '../api/destinations.js'
import OfferForm from '../components/OfferForm.jsx'

export default function AdminOffersPage () {
  const { t } = useI18n()
  const { token, logout } = useAuth()
  const [offers, setOffers] = useState([])
  const [agencies, setAgencies] = useState([])
  const [destinations, setDestinations] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  async function refresh () {
    setOffers(await listAdminOffers(token))
  }

  useEffect(() => {
    refresh()
    listAdminAgencies(token).then(setAgencies)
    listDestinations().then(setDestinations)
  }, [token])

  async function handleCreate (data) {
    await createAdminOffer(token, data)
    setShowForm(false)
    await refresh()
  }

  async function handleUpdate (data) {
    await updateAdminOffer(token, editing.id, data)
    setEditing(null)
    await refresh()
  }

  async function handleDelete (id) {
    await deleteAdminOffer(token, id)
    await refresh()
  }

  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{t('admin.offers.title')}</h1>
        <button onClick={logout} className="text-sm text-gray-500">Log out</button>
      </div>

      {!showForm && !editing && (
        <button onClick={() => setShowForm(true)} className="self-start bg-blue-600 text-white rounded px-4 py-2 font-medium">
          {t('admin.offers.add')}
        </button>
      )}

      {showForm && (
        <OfferForm agencies={agencies} destinations={destinations} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}

      {editing && (
        <OfferForm agencies={agencies} destinations={destinations} initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
      )}

      <div className="flex flex-col gap-2">
        {offers.map(offer => (
          <div key={offer.id} className="flex justify-between items-center p-3 bg-white rounded shadow">
            <div>
              <p className="font-medium">{offer.destination_name} — {offer.agency_name}</p>
              <p className="text-sm text-gray-500">
                {offer.start_date} → {offer.end_date} · {Number(offer.price_per_person).toFixed(2)} {offer.currency}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(offer)} className="text-sm text-blue-600">Edit</button>
              <button onClick={() => handleDelete(offer.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Wire `AdminOffersPage` into `client/src/App.jsx`** (replace `AdminOffersPlaceholder`, wrap in `RequireAdmin`)

```jsx
import RequireAdmin from './auth/RequireAdmin.jsx'
import AdminOffersPage from './pages/AdminOffersPage.jsx'
// remove AdminOffersPlaceholder

        <Route path="/admin" element={<RequireAdmin><AdminOffersPage /></RequireAdmin>} />
```

- [ ] **Step 6: Manually verify in the browser**

Log in at `/admin/login`, then on `/admin`: add a new offer via the form and confirm it appears in the list and in the public search results at `/`; edit an offer's price and confirm the change reflects in both places; delete an offer and confirm it disappears from both; log out and confirm `/admin` redirects back to `/admin/login`.

- [ ] **Step 7: Apply visual design pass**

Use the 21st.dev Magic MCP to source polished component variants for the offer form and admin list/table, and run the `frontend-design` skill's guidance over this page before committing. Keep the data flow and handlers from Steps 3-4 intact — this pass is visual only.

- [ ] **Step 8: Commit**

```bash
cd client && git add -A && git commit -m "feat(client): add admin offers management UI (create, edit, delete)"
```

---

### Task 13: Render deployment config

**Files:**
- Create: `render.yaml`
- Create: `README.md`

**Interfaces:**
- None — this task wires existing services to Render, it does not change application code.

- [ ] **Step 1: Create `render.yaml` at the repo root**

```yaml
databases:
  - name: trip-compare-db
    plan: free
    databaseName: trip_compare
    user: trip_compare

services:
  - type: web
    name: trip-compare-server
    runtime: node
    rootDir: server
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: trip-compare-db
          property: connectionString
      - key: ADMIN_EMAIL
        sync: false
      - key: ADMIN_PASSWORD_HASH
        sync: false
      - key: JWT_SECRET
        generateValue: true

  - type: web
    name: trip-compare-client
    runtime: static
    rootDir: client
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        value: https://trip-compare-server.onrender.com
```

- [ ] **Step 2: Create root `README.md`**

```markdown
# Trip Compare

Compare package-holiday offers from Kosovo/Albania travel agencies by destination, dates, and party size. See `docs/superpowers/specs/2026-08-17-trip-compare-mvp-design.md` for the full design.

## Local development

**Backend**
```bash
cd server
cp .env.example .env   # fill in DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, JWT_SECRET
createdb trip_compare
psql trip_compare -f src/db/schema.sql
node src/db/seed.js
npm install
npm run dev
```

**Frontend**
```bash
cd client
cp .env.example .env   # set VITE_API_URL to the backend URL
npm install
npm run dev
```

**Tests**
```bash
cd server
createdb trip_compare_test
psql trip_compare_test -f src/db/schema.sql
TEST_DATABASE_URL=postgres://localhost:5432/trip_compare_test npm test
```

## Deployment

Deployed on Render via `render.yaml` (one Postgres instance, one Node web service for the API, one static site for the frontend). Set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (a bcrypt hash) as secret env vars in the Render dashboard after the first deploy — see Task 6 Step 1 of the implementation plan for how to generate the hash.
```

- [ ] **Step 3: Verify the production build works locally**

Run: `cd client && npm run build`
Expected: build succeeds, `client/dist` is created with no errors.

- [ ] **Step 4: Commit**

```bash
git add render.yaml README.md && git commit -m "chore: add Render deployment config and project README"
```

---

## Self-Review Notes

- **Spec coverage:** search by destination/dates/people (Tasks 4-5, 10), offer card with all listed fields (Task 10), admin CRUD (Tasks 6-7, 11-12), referral link opens in new tab (Task 10 Step 5), Albanian/English toggle (Task 9), expired offers excluded from public search but visible in admin (Task 4 Step 5 `searchOffers` filters `end_date >= CURRENT_DATE`, Task 7 `listAllOffers` does not), empty state (Task 10 Step 6), validation rules (Task 3), Render hosting (Task 13). Scraping, agency self-serve, and custom quotes are explicitly out of scope and have no tasks, matching the spec.
- **Type/interface consistency:** `searchOffers(pool, {...})` (Task 4) matches its usage in Task 5's route; `validateOfferInput` (Task 3) return shape (`string[]`) matches Task 7's `res.status(400).json({ errors })` usage; frontend `apiFetch` (Task 10 Step 1) reads both `body.error` (single string, used by login/agency/destination errors) and `body.errors` (array, used by offer validation errors), joining the array with `, ` — this matches `OfferForm`'s (Task 12) `err.message.split(', ')` and `AdminLoginPage`'s (Task 11) direct `err.message` usage.
