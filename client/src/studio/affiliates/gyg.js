// GetYourGuide affiliate integration — all tracking lives here.
//
// ▶▶ YOUR PARTNER ID ◀◀  (8% commission)
export const GYG_PARTNER_ID = 'XL9UH9W'

// Network mode (only if GetYourGuide onboarded you via Partnerize/Impact/CJ
// and gave a tracking *link* wrapper instead of a partner_id).
export const GYG_MODE = 'direct' // 'direct' | 'network'
export const GYG_NETWORK_TEMPLATE = '' // use {URL} for the encoded destination

// ── Why a location MAP and not a search query ──
// GetYourGuide has NO working search-by-query deep link — `/s/?q=Vlore` just
// falls back to IP-geolocated homepage results. The only reliable per-city
// link is its location page: `/<slug>-l<id>/`. Those ids can't be guessed, so
// we keep a curated map. A city NOT in the map falls back to a general
// tracked GetYourGuide link (still earns via the affiliate cookie) and the UI
// adjusts its wording so it never claims a location it can't deliver.
//
// To ADD a destination: search it on getyourguide.com, open its city page, and
// copy the slug from the address bar (e.g. .../barcelona-l45/ → 'barcelona-l45').
// Key is the ASCII, lower-cased destination name.
export const GYG_LOCATIONS = {
  barcelona: 'barcelona-l45'
  // antalya: 'antalya-lXXXX',
  // istanbul: 'istanbul-lXXXX',
  // budapest: 'budapest-lXXXX',
  // ... add more as you confirm them
}

let warned = false
function warnOnce () {
  if (!warned && !GYG_PARTNER_ID && GYG_MODE === 'direct' && import.meta.env?.DEV) {
    warned = true
    // eslint-disable-next-line no-console
    console.warn('[Kranisa] GetYourGuide GYG_PARTNER_ID is empty — affiliate clicks are NOT attributed.')
  }
}

function ascii (s = '') {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}
function key (city) {
  return ascii(city).toLowerCase().trim()
}

function track (url) {
  if (GYG_MODE === 'network' && GYG_NETWORK_TEMPLATE) {
    return GYG_NETWORK_TEMPLATE.replace('{URL}', encodeURIComponent(url))
  }
  if (!GYG_PARTNER_ID) return url
  return url + (url.includes('?') ? '&' : '?') + `partner_id=${encodeURIComponent(GYG_PARTNER_ID)}`
}

// True when we have a real GetYourGuide city page for this destination.
export function hasGygLocation (city) {
  return !!GYG_LOCATIONS[key(city)]
}

// Tracked link: the city's GetYourGuide page when we have it, otherwise a
// general (still tracked) GetYourGuide link.
export function gygLink (city) {
  warnOnce()
  const slug = GYG_LOCATIONS[key(city)]
  const url = slug ? `https://www.getyourguide.com/${slug}/` : 'https://www.getyourguide.com/'
  return track(url)
}
