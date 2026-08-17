import { apiFetch } from './client.js'

export function searchOffers ({ destinationId, dateFrom, dateTo, people }) {
  const params = new URLSearchParams({ destinationId, dateFrom, dateTo, people })
  return apiFetch(`/api/offers?${params.toString()}`)
}
