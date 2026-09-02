import { apiFetch } from './client.js'

export function listDestinations () {
  return apiFetch('/api/destinations')
}

export function listPopularDestinations (limit = 6) {
  return apiFetch(`/api/destinations?popular=1&limit=${limit}`)
}
