// Turns an agency's free-text `contact_link` into a channel we can label and
// deep-link to — and, where the channel allows it (WhatsApp, email), pre-fills
// the drafted inquiry. Instagram/Messenger/Facebook DMs cannot be pre-filled
// by a link (Meta's platform forbids it), so there the "Copy" button is how the
// message travels; the deep link just opens the thread.

export function detectChannel (link = '') {
  const url = String(link).trim()
  const lower = url.toLowerCase()
  if (lower.startsWith('mailto:') || (/^[^\s/@]+@[^\s/@]+\.[^\s/@]+$/.test(url))) return 'email'
  if (lower.startsWith('tel:') || /^\+?[\d\s()-]{6,}$/.test(url)) return 'phone'
  if (lower.includes('wa.me') || lower.includes('whatsapp')) return 'whatsapp'
  if (lower.includes('ig.me') || lower.includes('instagram.')) return 'instagram'
  if (lower.includes('m.me') || lower.includes('messenger.') || lower.includes('/messages')) return 'messenger'
  if (lower.includes('facebook.') || lower.includes('fb.me') || lower.includes('fb.com')) return 'facebook'
  return 'web'
}

const LABELS = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  messenger: 'Messenger',
  facebook: 'Facebook',
  email: 'Email',
  phone: 'Telefon',
  web: 'Faqen'
}

export function channelLabel (channel) {
  return LABELS[channel] || LABELS.web
}

// Only WhatsApp and email accept a pre-filled body via a link. Everything else
// returns the link untouched — the copied message carries the text instead.
export function buildContactUrl (link = '', message = '') {
  const url = String(link).trim()
  const channel = detectChannel(url)
  const text = String(message || '').trim()

  if (channel === 'whatsapp' && text) {
    // Normalise a bare number into a wa.me link, then attach ?text= / &text=.
    let base = url
    if (!/^https?:|^whatsapp:/i.test(base)) base = `https://wa.me/${base.replace(/[^\d]/g, '')}`
    return `${base}${base.includes('?') ? '&' : '?'}text=${encodeURIComponent(text)}`
  }

  if (channel === 'email') {
    const addr = url.replace(/^mailto:/i, '').split('?')[0]
    const params = new URLSearchParams({ subject: 'Interesim për një ofertë (Kranisa)', body: text })
    return `mailto:${addr}?${params.toString()}`
  }

  if (channel === 'phone') {
    return url.startsWith('tel:') ? url : `tel:${url.replace(/[^\d+]/g, '')}`
  }

  // Bare handle/number for a social channel → make it openable.
  if (!/^https?:/i.test(url)) return `https://${url.replace(/^\/+/, '')}`
  return url
}

// The ready-to-send inquiry, built from the offer's own facts. Warm Tirana
// register, first person, no emoji. Editable by the user before sending.
export function buildDraft (match = {}) {
  const dest = match.destination || 'ofertën'
  const bits = []
  if (match.nights) bits.push(`${match.nights} netë`)
  if (match.board) bits.push(String(match.board).toLowerCase())
  if (match.price) bits.push(`nga ${match.currency || '€'}${match.price}`)
  const detail = bits.length ? ` (${bits.join(', ')})` : ''
  return `Përshëndetje! Pashë te Kranisa ofertën tuaj për ${dest}${detail}. Jam i interesuar dhe doja të dija nëse është ende e disponueshme dhe si mund ta rezervoj. Faleminderit!`
}
