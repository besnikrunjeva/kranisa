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
