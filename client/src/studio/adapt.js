// Maps a real API offer (see /api/offers/all) into the display shape the
// studio components render. Keeps the components dumb and the field-name
// coupling in one place.
import { offerImageUrl } from '../lib/offerImage.js'

const MONTHS_SQ = ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Kor', 'Gsh', 'Sht', 'Tet', 'Nën', 'Dhj']

function splitName (name) {
  const parts = (name || '').split(', ')
  return { city: parts[0] || name || '', country: parts[1] || '' }
}

function shortDate (iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getDate()} ${MONTHS_SQ[d.getMonth()]}`
}

// Honest freshness from updated_at — hours if recent, days otherwise.
export function freshness (iso) {
  if (!iso) return null
  const hrs = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3.6e6))
  if (hrs < 24) return `${hrs}h më parë`
  const days = Math.round(hrs / 24)
  return `${days} ${days === 1 ? 'ditë' : 'ditë'} më parë`
}

function prettyBoard (board) {
  return (board || '')
    .split('-').join(' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function currencySymbol (c) {
  return c === 'EUR' ? '€' : (c || '')
}

export function adaptOffer (o) {
  const { city, country } = splitName(o.destination_name)
  return {
    id: o.id,
    destinationId: o.destination_id,
    destination: city,
    country,
    agency: o.agency_name,
    agencyContact: o.agency_contact_link,
    stars: o.star_rating,
    board: prettyBoard(o.board_type),
    nights: o.nights,
    from: shortDate(o.start_date),
    to: shortDate(o.end_date),
    price: Math.round(Number(o.price_per_person)),
    currency: currencySymbol(o.currency),
    image: offerImageUrl(o),
    verified: freshness(o.updated_at),
    freshHours: o.updated_at ? Math.max(1, Math.round((Date.now() - new Date(o.updated_at).getTime()) / 3.6e6)) : 9999,
    externalLink: o.external_link,
    capacity: o.capacity,
    startISO: o.start_date,
    endISO: o.end_date,
    updatedAt: o.updated_at
  }
}
