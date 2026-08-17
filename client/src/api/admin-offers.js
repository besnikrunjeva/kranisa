import { apiFetch } from './client.js'

function authHeaders (token) {
  return { Authorization: `Bearer ${token}` }
}

export function listAdminOffers (token) {
  return apiFetch('/api/admin/offers', { headers: authHeaders(token) })
}

export function createAdminOffer (token, data) {
  return apiFetch('/api/admin/offers', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data)
  })
}

export function updateAdminOffer (token, id, data) {
  return apiFetch(`/api/admin/offers/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data)
  })
}

export function deleteAdminOffer (token, id) {
  return apiFetch(`/api/admin/offers/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token)
  })
}
