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
