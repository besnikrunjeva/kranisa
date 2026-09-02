import { Router } from 'express'
import { listCurrentOffers } from '../db/offers.js'
import { askPlannerWithOllamaFallback, getOllamaStatus } from '../planner/ollama.js'

const MONTHS_SQ = ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Kor', 'Gsh', 'Sht', 'Tet', 'Nen', 'Dhj']

function splitName (name) {
  const parts = (name || '').split(', ')
  return { city: parts[0] || name || '', country: parts[1] || '' }
}

function shortDate (iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getDate()} ${MONTHS_SQ[date.getMonth()]}`
}

function currencySymbol (currency) {
  return currency === 'EUR' ? '€' : (currency || '')
}

function adaptOffer (offer) {
  const { city, country } = splitName(offer.destination_name)
  return {
    id: offer.id,
    destinationId: offer.destination_id,
    destination: city,
    country,
    agency: offer.agency_name,
    stars: offer.star_rating,
    board: (offer.board_type || '').split('-').join(' '),
    nights: offer.nights,
    from: shortDate(offer.start_date),
    to: shortDate(offer.end_date),
    price: Math.round(Number(offer.price_per_person)),
    currency: currencySymbol(offer.currency),
    capacity: offer.capacity,
    startISO: offer.start_date,
    endISO: offer.end_date,
    freshHours: offer.updated_at ? Math.max(1, Math.round((Date.now() - new Date(offer.updated_at).getTime()) / 3.6e6)) : 9999
  }
}

export default function buildPlannerRouter (pool) {
  const router = Router()

  router.get('/status', async (req, res) => {
    res.json(await getOllamaStatus())
  })

  router.post('/ask', async (req, res) => {
    const text = String(req.body?.text || '').trim()
    if (!text) return res.status(400).json({ error: 'text is required' })

    const prefs = req.body?.prefs && typeof req.body.prefs === 'object' ? req.body.prefs : {}
    const history = Array.isArray(req.body?.history)
      ? req.body.history
        .filter(item => item && typeof item.text === 'string')
        .slice(-8)
        .map(item => ({
          role: item.role === 'user' ? 'user' : 'ai',
          text: item.text.slice(0, 500)
        }))
      : []
    const rows = await listCurrentOffers(pool)
    const offers = rows.map(adaptOffer)
    const result = await askPlannerWithOllamaFallback({ text, offers, prefs, history })
    res.json(result)
  })

  return router
}
