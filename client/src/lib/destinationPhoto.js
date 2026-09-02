// Destination photography. Seeded offers have no real image_url yet, so we
// serve a relevant, reliable photo per destination. picsum.photos is down/
// blocked in many regions, so we use LoremFlickr (keyword-based, topical) with
// a deterministic `lock` so each destination always shows the same photo.
//
// Researched keyword per destination targets its iconic imagery; obscure
// towns fall back to a country/scene keyword so they still look right.

function ascii (s = '') {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function cityKey (name = '') {
  return ascii(name).split(',')[0].trim().toLowerCase()
}

// Deterministic small number from a string → stable photo per destination.
function lockFrom (s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return (h % 60) + 1
}

// Hand-picked keywords. Single strong tag where the city name is a good
// Flickr tag; a better scene/country tag where it isn't (ambiguous or obscure).
const KEYWORDS = {
  antalya: 'antalya',
  bodrum: 'bodrum',
  'sharm el sheikh': 'sharm-el-sheikh',
  hurghada: 'hurghada',
  rhodes: 'rhodes-greece',
  crete: 'crete',
  halkidiki: 'halkidiki',
  corfu: 'corfu',
  zakynthos: 'zakynthos',
  sivota: 'sivota',
  budva: 'budva',
  alberobello: 'alberobello',
  nice: 'nice-france',
  'vlorë': 'vlore-albania',
  vlore: 'vlore-albania',
  'shëngjin': 'albania-beach',
  shengjin: 'albania-beach',
  ksamil: 'ksamil',
  budapest: 'budapest',
  "saint julian's": 'malta-seaside',
  'saint julians': 'malta-seaside',
  prague: 'prague',
  marbella: 'marbella',
  barcelona: 'barcelona',
  dubrovnik: 'dubrovnik',
  mauritius: 'mauritius-beach',
  istanbul: 'istanbul'
}

export function destinationPhoto (name = '', w = 800, h = 600) {
  const key = cityKey(name)
  const keyword = KEYWORDS[key] || (key ? key.replace(/[^a-z0-9]+/g, '-') : 'travel')
  return `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keyword)}?lock=${lockFrom(key)}`
}
