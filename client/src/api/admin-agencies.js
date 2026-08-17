import { apiFetch } from './client.js'

export function listAdminAgencies (token) {
  return apiFetch('/api/admin/agencies', { headers: { Authorization: `Bearer ${token}` } })
}
