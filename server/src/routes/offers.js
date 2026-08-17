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
