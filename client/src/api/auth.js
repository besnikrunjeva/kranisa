import { apiFetch } from './client.js'

export function login (email, password) {
  return apiFetch('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}
