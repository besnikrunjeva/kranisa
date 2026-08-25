import { apiFetch } from './client.js'

export function listAdminAgencies (token) {
  return apiFetch('/api/admin/agencies', { headers: { Authorization: `Bearer ${token}` } })
}

export function createAdminAgency (token, data) {
  return apiFetch('/api/admin/agencies', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  })
}
