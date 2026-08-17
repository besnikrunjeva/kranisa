import express from 'express'
import cors from 'cors'
import defaultPool from './db/pool.js'
import buildOffersRouter from './routes/offers.js'
import buildDestinationsRouter from './routes/destinations.js'
import adminAuthRouter from './routes/auth.js'
import buildAdminOffersRouter from './routes/admin-offers.js'
import buildAdminAgenciesRouter from './routes/admin-agencies.js'
import buildAdminDestinationsRouter from './routes/admin-destinations.js'

export function buildApp (pool = defaultPool) {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api/offers', buildOffersRouter(pool))
  app.use('/api/destinations', buildDestinationsRouter(pool))
  app.use('/api/admin', adminAuthRouter)
  app.use('/api/admin/offers', buildAdminOffersRouter(pool))
  app.use('/api/admin/agencies', buildAdminAgenciesRouter(pool))
  app.use('/api/admin/destinations', buildAdminDestinationsRouter(pool))

  return app
}

const app = buildApp()

export default app
