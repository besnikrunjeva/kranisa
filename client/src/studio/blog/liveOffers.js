// The bridge that keeps blog content honest: posts reference *destinations*
// (stable — "Vlorë", "Ksamil"), never specific offers (which churn as agencies
// add/expire them). At render we pull the live current-offer inventory once,
// group it by destination, and every price/availability number on the blog is
// computed from that. Swap the seed offers for real ones and the blog updates
// itself — and it never shows a stale price.
import { useEffect, useState } from 'react'
import { listAllOffers } from '../../api/offers.js'

// Diacritic-insensitive city key so "Vlorë" in a post matches "Vlorë, Shqipëri"
// in the offer inventory regardless of accents or the trailing country.
export function cityKey (name = '') {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(',')[0]
    .trim()
    .toLowerCase()
}

function freshLabel (hours, lang) {
  if (hours == null) return null
  if (hours < 24) {
    const h = Math.max(1, Math.round(hours))
    return lang === 'en' ? `updated ${h}h ago` : `përditësuar ${h}h më parë`
  }
  const d = Math.round(hours / 24)
  return lang === 'en' ? `updated ${d}d ago` : `përditësuar ${d}d më parë`
}

function aggregate (offers) {
  const first = offers[0]
  const prices = offers.map(o => Math.round(Number(o.price_per_person))).filter(n => Number.isFinite(n))
  const freshest = offers.reduce((min, o) => {
    if (!o.updated_at) return min
    const h = (Date.now() - new Date(o.updated_at).getTime()) / 3.6e6
    return min == null ? h : Math.min(min, h)
  }, null)
  const [city, country] = (first.destination_name || '').split(', ')
  return {
    destinationId: first.destination_id,
    city: city || first.destination_name,
    country: country || '',
    count: offers.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    currency: first.currency === 'EUR' ? '€' : (first.currency || '€'),
    freshestHours: freshest
  }
}

// Fetches the live inventory once and returns a lookup keyed by city.
export function useLiveOffers () {
  const [byCity, setByCity] = useState(null)

  useEffect(() => {
    let alive = true
    listAllOffers()
      .then(list => {
        if (!alive) return
        const groups = new Map()
        for (const offer of list) {
          const key = cityKey(offer.destination_name)
          if (!key) continue
          const arr = groups.get(key) || []
          arr.push(offer)
          groups.set(key, arr)
        }
        const map = new Map()
        for (const [key, offers] of groups) map.set(key, aggregate(offers))
        setByCity(map)
      })
      .catch(() => { if (alive) setByCity(new Map()) })
    return () => { alive = false }
  }, [])

  return { byCity, loading: byCity === null }
}

// Resolve a destination name from a post to its live aggregate (or null).
export function pickDestination (byCity, name) {
  if (!byCity) return null
  return byCity.get(cityKey(name)) || null
}

export { freshLabel }
