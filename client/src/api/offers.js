import { apiFetch } from './client.js'

export function searchOffers ({ destinationId, dateFrom, dateTo, people }) {
  const params = new URLSearchParams({ destinationId, people })
  if (dateFrom) params.set('dateFrom', dateFrom)
  if (dateTo) params.set('dateTo', dateTo)
  return apiFetch(`/api/offers?${params.toString()}`)
}

export function getOffer (id) {
  return apiFetch(`/api/offers/${id}`)
}

export function listAllOffers () {
  return apiFetch('/api/offers/all')
}
