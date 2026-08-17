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
