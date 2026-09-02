import { Router } from 'express'
import { searchOffers, getOfferById, listCurrentOffers } from '../db/offers.js'

export default function buildOffersRouter (pool) {
  const router = Router()

  router.get('/', async (req, res) => {
    const { destinationId, dateFrom, dateTo, people } = req.query

    if (!destinationId || !people) {
      return res.status(400).json({ error: 'destinationId and people are required' })
    }

    const results = await searchOffers(pool, {
      destinationId: Number(destinationId),
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
      people: Number(people)
    })

    res.json(results)
  })

  router.get('/all', async (req, res) => {
    res.json(await listCurrentOffers(pool))
  })

  router.get('/:id', async (req, res) => {
    const offer = await getOfferById(pool, Number(req.params.id))
    if (!offer) return res.status(404).json({ error: 'Offer not found' })
    res.json(offer)
  })

  return router
}
