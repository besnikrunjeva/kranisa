const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch (path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = body.error || (body.errors && body.errors.join(', ')) || `Request failed with status ${res.status}`
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}
