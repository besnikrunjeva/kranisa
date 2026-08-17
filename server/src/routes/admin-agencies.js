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
