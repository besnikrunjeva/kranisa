import { apiFetch } from './client.js'

export function listDestinations () {
  return apiFetch('/api/destinations')
}
