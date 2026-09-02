// Kranisa AI — conversation engine.
//
// HYBRID by design. Today this is a scripted, guided assistant over the real
// offer inventory: it accumulates what it learns across turns, asks the next
// useful question when it lacks signal, acknowledges answers, and offers
// tappable quick-replies — so it feels conversational without an LLM. The
// ONLY entry point the UI uses is `askPlanner()`, which returns
// { reply, matches, quickReplies, prefs }. To move to a real model later,
// replace the body of `askPlanner` and keep the same return shape.

function normalize (v = '') {
  return v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

function hasPhrase (text, phrase) {
  return new RegExp(`(^|\\W)${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\W|$)`).test(text)
}

function tokens (text) {
  return text.split(/[^a-z0-9]+/).filter(Boolean)
}

function editDistance (a, b) {
  if (a === b) return 0
  if (!a || !b) return Math.max(a.length, b.length)
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  const current = new Array(b.length + 1)
  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
    previous.splice(0, previous.length, ...current)
  }
  return previous[b.length]
}

function hasLooseWord (text, word) {
  const normalized = normalize(word)
  if (normalized.length <= 3) return hasPhrase(text, normalized)
  if (hasPhrase(text, normalized)) return true
  const distanceLimit = normalized.length <= 5 ? 1 : 2
  return tokens(text).some(token => Math.abs(token.length - normalized.length) <= distanceLimit && editDistance(token, normalized) <= distanceLimit)
}

function hasAnyLoose (text, words) {
  return words.some(word => hasLooseWord(text, word))
}

const MOODS = {
  beach: { label: 'Plazh', words: ['plazh', 'plazhi', 'plazhh', 'det', 'diell', 'beach', 'sea', 'relaks', 'bregdet', 'uj', 'uje', 'ujin'], dest: ['antalya', 'zakynthos', 'corfu', 'budva', 'sarande', 'sivota', 'bodrum', 'hurghada', 'ksamil', 'vlore', 'crete', 'krete'] },
  city: { label: 'Qytet', words: ['qytet', 'qyteti', 'city', 'kulture', 'muze', 'shopping', 'shoping', 'darke', 'urban', 'nightlife', 'najtllajf', 'party', 'klub'], dest: ['barcelona', 'budapest', 'istanbul', 'stamboll', 'alberobello', 'prague', 'prage'] },
  family: { label: 'Familje', words: ['familj', 'familje', 'famije', 'femij', 'femije', 'kids', 'child', 'prinder'], dest: ['antalya', 'corfu', 'budva', 'zakynthos', 'hurghada'] },
  escape: { label: 'Arratisje', words: ['arratis', 'romantik', 'qetesi', 'qetsi', 'i qete', 'qet', 'cift', 'couple', 'girlfriend', 'boyfriend', 'dashur'], dest: ['zakynthos', 'santorini', 'corfu', 'alberobello', 'budva'] },
  friends: { label: 'shoqëri', words: ['shoqeri', 'shoqni', 'shoqe', 'shoke', 'grup', 'djem', 'vajza', 'festa'], dest: ['budva', 'antalya', 'barcelona', 'istanbul', 'stamboll', 'bodrum', 'vlore', 'zakynthos', 'sarande', 'ksamil', 'hurghada'] }
}

function detectMood (t) {
  for (const [id, m] of Object.entries(MOODS)) if (hasAnyLoose(t, m.words)) return id
  return null
}
function detectBudget (t) {
  const nums = (t.match(/\d{3,4}/g) || []).map(Number).filter(n => n >= 100 && n <= 5000)
  if (!nums.length) return null
  if (/nen|deri|under|max|maksimum|posht/.test(t)) return Math.min(...nums)
  return Math.max(...nums)
}
function detectDestination (t, offers) {
  for (const o of offers) {
    const city = normalize(o.destination)
    const country = normalize(o.country)
    if (city && hasLooseWord(t, city)) return city
    if (country && country.length > 3 && hasLooseWord(t, country)) return country
  }
  return null
}

function parse (text, offers) {
  const t = normalize(text)
  return {
    mood: detectMood(t),
    budgetMax: detectBudget(t),
    destination: detectDestination(t, offers),
    longTrip: /(jav|week|7 net|nje jave|dy jave|gjate|gjat)/.test(t),
    surprise: /surpriz|surprise|befaso|cdo gje|cfaredo/.test(t),
    skipBudget: /s['’]?ka rendesi|ska rendesi|nuk ka rendesi|s['’]?ka problem/.test(t)
  }
}

function mergePrefs (prev, p) {
  return {
    mood: p.mood || prev.mood || null,
    budgetMax: p.budgetMax || prev.budgetMax || null,
    destination: p.destination || prev.destination || null,
    longTrip: p.longTrip || prev.longTrip || false,
    surprise: p.surprise || prev.surprise || false,
    asked: prev.asked || 0
  }
}

function scoreOffer (offer, p) {
  let s = (offer.stars || 0) * 2
  s += Math.max(0, 18 - offer.price / 100)
  if (p.destination && normalize(`${offer.destination} ${offer.country}`).includes(p.destination)) s += 70
  if (p.mood && MOODS[p.mood].dest.some(k => normalize(offer.destination).includes(k))) s += 30
  if (p.budgetMax) s += offer.price <= p.budgetMax ? 28 : -24
  if (p.longTrip && offer.nights >= 6) s += 16
  if (Number.isFinite(offer.freshHours)) s += Math.max(0, 8 - offer.freshHours / 12)
  return s
}
function topMatches (offers, p) {
  const byDest = new Map()
  for (const o of offers) {
    const key = `${o.destination}, ${o.country}`
    const score = scoreOffer(o, p)
    const cur = byDest.get(key)
    if (!cur || score > cur.score) byDest.set(key, { ...o, score })
  }
  return Array.from(byDest.values()).sort((a, b) => b.score - a.score || a.price - b.price).slice(0, 3)
}
export function matchPercent (index) {
  return Math.max(78, Math.min(97, 96 - index * 4))
}
export function whyMatch (match, p = {}) {
  const r = []
  if (p.mood && MOODS[p.mood] && MOODS[p.mood].dest.some(k => normalize(match.destination).includes(k))) r.push(`shkon me ${MOODS[p.mood].label.toLowerCase()}`)
  if (p.budgetMax && match.price <= p.budgetMax) r.push('brenda buxhetit')
  if (p.longTrip && match.nights >= 6) r.push('pushim më i gjatë')
  if (!r.length) r.push('ofertë e mirë tani')
  return r.slice(0, 2).join(' · ')
}

// ── Hardwired copy — arrays so replies vary and never read robotic. ──
const ACK = {
  beach: ['Plazh — zgjedhje klasike.', 'Det e diell, e kuptova.', 'Plazh, bukur.'],
  city: ['Qytet — më pëlqen.', 'Një gjë urbane, ok.', 'Qytet, e mora.'],
  family: ['Për familjen, e kuptoj.', 'Diçka e qetë për të gjithë — ok.'],
  escape: ['Një arratisje e vogël, super.', 'Diçka të bukur e të qetë — po.'],
  budget: ['E shënova buxhetin.', 'Ok, e mbaj parasysh buxhetin.', 'U mor buxheti.']
}
const Q_MOOD = ['Çfarë kërkon më shumë këtë herë?', 'Si e ke në mendje — plazh, qytet, apo diçka për familjen?', 'Ç’lloj pushimi të bën qejfin tani?']
const Q_BUDGET = ['Sa lirshëm do ta mbash buxhetin?', 'Deri ku shkon buxheti për person?', 'Nga çmimi — sa larg do të shkosh?']
const GREETING_REPLIES = ['Përshëndetje. Çfarë lloj pushimi po kërkon?', 'Hey. Ta gjejmë bashkë — plazh, qytet, familje, apo diçka tjetër?', 'Përshëndetje. Më thuaj çfarë vibe do për udhëtimin.']
const HELP = ['Po. Më thuaj si e do udhëtimin — plazh, qytet, familje, qetësi, buxhet apo destinacion — dhe unë i lidh me ofertat reale.', 'Patjetër. Ma thuaj si po e imagjinon pushimin dhe unë të pyes vetëm çfarë mungon para se të nxjerr ofertat.']
const UNSURE = ['S’ka problem. Ta nisim lehtë: do më shumë plazh, qytet, qetësi apo diçka për familjen?', 'Ok, atëherë zgjedhim nga ndjesia. Të duhet det, qytet, relaks apo pushim familjar?']
const THANKS = ['Me kënaqësi. Kur të duash, më thuaj çfarë pushimi ke në mendje.', 'Gjithmonë. Më jep një vibe ose buxhet dhe e vazhdojmë.']
const INTRO_MATCH = ['Ja çfarë të përshtatet më mirë', 'Këto bien më së miri', 'Zgjedhjet e mia për ty', 'Nga ofertat aktuale, këto ia vlejnë']
const NO_MATCH = ['Nuk gjeta ende diçka që përputhet mirë — provo të zgjerosh buxhetin ose një stil tjetër.', 'Hmm, s’po gjej gjë të fortë për këtë. Provojmë një destinacion apo buxhet tjetër?']
const RESTART = ['Nisim nga e para. Çfarë kërkon këtë herë?', 'Ok, fillojmë përsëri — si e ke në mendje pushimin?']

export const CHIPS = {
  mood: ['Plazh', 'Qytet', 'Familje', 'Më surprizo'],
  budget: ['Nën €400', '€400–650', 'S’ka rëndësi'],
  after: ['Diçka më e lirë', 'Ndrysho stilin', 'Fillo nga e para']
}

export const STARTERS = ['Ndihmomë të zgjedh', 'Plazh nën €450 në korrik', 'Diçka për familjen', 'Më surprizo']
export const GREETING = 'Përshëndetje 👋 Të ndihmoj të zgjedhësh pushimin. Tregomë ç’kërkon — vend, stil a buxhet — ose zgjidh më poshtë dhe të pyes hap pas hapi.'

function joinAck (ack, rest) {
  return ack ? `${ack} ${rest}` : rest
}
function question (prefs, which, ack) {
  const asked = (prefs.asked || 0) + 1
  const reply = which === 'mood' ? pick(Q_MOOD) : pick(Q_BUDGET)
  return { reply: joinAck(ack, reply), matches: null, quickReplies: CHIPS[which], prefs: { ...prefs, asked } }
}
function buildReply (p, matches) {
  if (!matches.length) return pick(NO_MATCH)
  const top = matches[0]
  const ctx = []
  if (p.destination) ctx.push(`për ${top.destination}`)
  else if (p.mood) ctx.push(MOODS[p.mood].label.toLowerCase())
  if (p.budgetMax) ctx.push(`nën €${p.budgetMax}`)
  const scope = ctx.length ? ` (${ctx.join(', ')})` : ''
  return `${pick(INTRO_MATCH)}${scope} — ${top.destination} bie më së miri: ${top.nights} netë, nga €${top.price}.`
}

// ── The single seam. Swap this body for a real LLM later. ──
export async function askPlanner ({ text, offers, prefs = {} }) {
  await new Promise(r => setTimeout(r, 430 + Math.random() * 260)) // felt "thinking" latency
  const t = normalize(text)

  if (/^(hi|hey|hello|pershendetje|tung|ckemi|c'?kemi|miredita|miremengjes|mirmengjes)\W*$/.test(t)) {
    return { reply: pick(GREETING_REPLIES), matches: null, quickReplies: CHIPS.mood, prefs: { asked: 1 } }
  }
  if (/^(flm|faleminderit|thanks|thank you)\W*$/.test(t)) {
    return { reply: pick(THANKS), matches: null, quickReplies: CHIPS.mood, prefs }
  }
  if (/si funksionon|cfare ben|cka ben|help|ndihme|ndihmo/.test(t)) {
    return { reply: pick(HELP), matches: null, quickReplies: CHIPS.mood, prefs: { ...prefs, asked: Math.max(1, prefs.asked || 0) } }
  }
  if (/nuk e di|sdi|se di|not sure|surprise me|me sugjero|cfare me sugjeron/.test(t)) {
    return { reply: pick(UNSURE), matches: null, quickReplies: CHIPS.mood, prefs: { ...prefs, asked: Math.max(1, prefs.asked || 0) } }
  }

  if (/rifillo|fillo nga e para|fillo nga fillim|nga fillimi|reset/.test(t)) {
    return { reply: pick(RESTART), matches: null, quickReplies: CHIPS.mood, prefs: { asked: 1 } }
  }
  if (/ndrysho stilin|stil tjeter|diçka tjeter|dicka tjeter/.test(t)) {
    return { reply: pick(Q_MOOD), matches: null, quickReplies: CHIPS.mood, prefs: { ...prefs, mood: null, asked: (prefs.asked || 0) } }
  }

  const parsed = parse(text, offers)
  const merged = mergePrefs(prefs, parsed)
  if (parsed.skipBudget) merged.budgetMax = 0 // treat as answered (no cap)

  // "make something cheaper" refinement
  if (/me lir|me e lir|diçka me e lir|dicka me e lir/.test(t)) {
    const floor = topMatches(offers, merged)[0]
    merged.budgetMax = Math.max(120, (floor ? floor.price : merged.budgetMax || 450) - 90)
  }

  // acknowledge something new we learned this turn
  let ack = null
  if (parsed.mood && parsed.mood !== prefs.mood) ack = pick(ACK[parsed.mood])
  else if (parsed.budgetMax && parsed.budgetMax !== prefs.budgetMax) ack = pick(ACK.budget)

  const hasMood = !!merged.mood
  const hasBudget = merged.budgetMax !== null && merged.budgetMax !== undefined
  const ready = merged.surprise || !!merged.destination || (hasMood && hasBudget)

  if (!ready) {
    if (!hasMood) return question(merged, 'mood', ack)
    return question(merged, 'budget', ack)
  }

  const matches = topMatches(offers, merged)
  const reply = joinAck(hasMood || merged.budgetMax || merged.destination || merged.surprise ? null : ack, buildReply(merged, matches))
  return { reply, matches, quickReplies: matches.length ? CHIPS.after : CHIPS.mood, prefs: merged }
}
