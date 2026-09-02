import { Router } from 'express'
import { listDestinations, listPopularDestinations } from '../db/destinations.js'

export default function buildDestinationsRouter (pool) {
  const router = Router()

  router.get('/', async (req, res) => {
    if (req.query.popular !== undefined) {
      const limit = Math.min(parseInt(req.query.limit, 10) || 6, 24)
      const results = await listPopularDestinations(pool, limit)
      return res.json(results)
    }
    const results = await listDestinations(pool)
    res.json(results)
  })

  return router
}
