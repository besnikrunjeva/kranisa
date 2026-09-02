function normalize (v = '') {
  return v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
  for (const [id, mood] of Object.entries(MOODS)) {
    if (hasAnyLoose(t, mood.words)) return id
  }
  return null
}

function detectBudget (t) {
  const nums = (t.match(/\d{3,4}/g) || []).map(Number).filter(n => n >= 100 && n <= 5000)
  if (!nums.length) return null
  if (/nen|deri|under|max|maksimum|posht/.test(t)) return Math.min(...nums)
  return Math.max(...nums)
}

function detectDestination (t, offers) {
  for (const offer of offers) {
    const city = normalize(offer.destination)
    const country = normalize(offer.country)
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

function mergePrefs (prev, parsed) {
  return {
    mood: parsed.mood || prev.mood || null,
    budgetMax: parsed.budgetMax ?? prev.budgetMax ?? null,
    destination: parsed.destination || prev.destination || null,
    longTrip: parsed.longTrip || prev.longTrip || false,
    surprise: parsed.surprise || prev.surprise || false,
    asked: prev.asked || 0
  }
}

export function scoreOffer (offer, prefs = {}) {
  let score = (offer.stars || 0) * 2
  score += Math.max(0, 18 - offer.price / 100)
  if (prefs.destination && normalize(`${offer.destination} ${offer.country}`).includes(prefs.destination)) score += 70
  if (prefs.mood && MOODS[prefs.mood].dest.some(k => normalize(offer.destination).includes(k))) score += 30
  if (prefs.budgetMax) score += offer.price <= prefs.budgetMax ? 28 : -24
  if (prefs.longTrip && offer.nights >= 6) score += 16
  if (Number.isFinite(offer.freshHours)) score += Math.max(0, 8 - offer.freshHours / 12)
  return score
}

export function topMatches (offers, prefs = {}) {
  const byDest = new Map()
  for (const offer of offers) {
    const key = `${offer.destination}, ${offer.country}`
    const score = scoreOffer(offer, prefs)
    const current = byDest.get(key)
    if (!current || score > current.score) byDest.set(key, { ...offer, score })
  }
  return Array.from(byDest.values()).sort((a, b) => b.score - a.score || a.price - b.price).slice(0, 5)
}

export function matchPercent (index) {
  return Math.max(78, Math.min(97, 96 - index * 4))
}

export function whyMatch (match, prefs = {}) {
  const reasons = []
  if (prefs.mood && MOODS[prefs.mood].dest.some(k => normalize(match.destination).includes(k))) reasons.push(`shkon me ${MOODS[prefs.mood].label.toLowerCase()}`)
  if (prefs.budgetMax && match.price <= prefs.budgetMax) reasons.push('brenda buxhetit')
  if (prefs.longTrip && match.nights >= 6) reasons.push('pushim me me shume net')
  if (!reasons.length) reasons.push('oferte e mire tani')
  return reasons.slice(0, 2).join(' · ')
}

const ACK = {
  beach: ['Plazh - zgjedhje klasike.', 'Det e diell, e kuptova.', 'Plazh, bukur.'],
  city: ['Qytet - me pelqen.', 'Nje gje urbane, ok.', 'Qytet, e mora.'],
  family: ['Per familjen, e kuptoj.', 'Dicka e qete per te gjithe - ok.'],
  escape: ['Nje arratisje e vogel, super.', 'Dicka te bukur e te qete - po.'],
  friends: ['Me shoqeri - do jete qejf.', 'Me shoket, e kuptova.'],
  budget: ['E shenova buxhetin.', 'Ok, e mbaj parasysh buxhetin.', 'U mor buxheti.']
}
const Q_MOOD = ['Cfare kerkon me shume kete here?', 'Si e ke ne mendje - plazh, qytet, apo dicka per familjen?', 'Cfare lloj pushimi te ben qejfin tani?']
const Q_BUDGET = ['Sa lirshem do ta mbash buxhetin?', 'Deri ku shkon buxheti per person?', 'Nga cmimi - sa larg do te shkosh?']
const GREETING = ['Pershendetje. Cfare lloj pushimi po kerkon?', 'Hey. Ta gjejme bashke - plazh, qytet, familje, apo dicka tjeter?', 'Pershendetje. Me thuaj cfare vibe do per udhetimin.']
const HELP = ['Po. Me thuaj si e do udhetimin - plazh, qytet, familje, qetesi, buxhet apo destinacion - dhe une i lidh me ofertat reale.', 'Patjeter. Ma thuaj si po e imagjinon pushimin dhe une te pyes vetem cfare mungon para se te nxjerr ofertat.']
const UNSURE = ['Ska problem. Ta nisim lehte: do me shume plazh, qytet, qetesi apo dicka per familjen?', 'Ok, atehere zgjedhim nga ndjesia. Te duhet det, qytet, relaks apo pushim familjar?']
const THANKS = ['Me kenaqesi. Kur te duash, me thuaj cfare pushimi ke ne mendje.', 'Gjithmone. Me jep nje vibe ose buxhet dhe e vazhdojme.']
const INTRO_MATCH = ['Ja cfare te pershtatet me mire', 'Keto bien me se miri', 'Zgjedhjet e mia per ty', 'Nga ofertat aktuale, keto ia vlejne']
const NO_MATCH = ['Nuk gjeta ende dicka qe perputhet mire - provo te zgjerosh buxhetin ose nje stil tjeter.', 'Nuk po gjej gje te forte per kete. Provojme nje destinacion apo buxhet tjeter?']
const RESTART = ['Nisim nga e para. Cfare kerkon kete here?', 'Ok, fillojme perseri - si e ke ne mendje pushimin?']

export const CHIPS = {
  mood: ['Plazh', 'Qytet', 'Familje', 'Me surprizo'],
  budget: ['Nen €400', '€400-650', 'Ska rendesi'],
  after: ['Dicka me e lire', 'Ndrysho stilin', 'Fillo nga e para']
}

function joinAck (ack, rest) {
  return ack ? `${ack} ${rest}` : rest
}

function question (prefs, which, ack) {
  const asked = (prefs.asked || 0) + 1
  const reply = which === 'mood' ? pick(Q_MOOD) : pick(Q_BUDGET)
  return { reply: joinAck(ack, reply), matches: null, quickReplies: CHIPS[which], prefs: { ...prefs, asked } }
}

function buildReply (prefs, matches) {
  if (!matches.length) return pick(NO_MATCH)
  const top = matches[0]
  const ctx = []
  if (prefs.destination) ctx.push(`per ${top.destination}`)
  else if (prefs.mood) ctx.push(MOODS[prefs.mood].label.toLowerCase())
  if (prefs.budgetMax) ctx.push(`nen €${prefs.budgetMax}`)
  const scope = ctx.length ? ` (${ctx.join(', ')})` : ''
  return `${pick(INTRO_MATCH)}${scope} - ${top.destination} bie me se miri: ${top.nights} nete, nga €${top.price}.`
}

export async function askLocalPlanner ({ text, offers, prefs = {} }) {
  const t = normalize(text)

  if (/^(hi|hey|hello|pershendetje|tung|ckemi|c'?kemi|miredita|miremengjes|mirmengjes)\W*$/.test(t)) {
    return { reply: pick(GREETING), matches: null, quickReplies: CHIPS.mood, prefs: { asked: 1 }, mode: 'scripted' }
  }
  if (/^(flm|faleminderit|thanks|thank you)\W*$/.test(t)) {
    return { reply: pick(THANKS), matches: null, quickReplies: CHIPS.mood, prefs, mode: 'scripted' }
  }
  if (/si funksionon|cfare ben|cka ben|help|ndihme|ndihmo/.test(t)) {
    return { reply: pick(HELP), matches: null, quickReplies: CHIPS.mood, prefs: { ...prefs, asked: Math.max(1, prefs.asked || 0) }, mode: 'scripted' }
  }
  if (/nuk e di|sdi|se di|not sure|surprise me|me sugjero|cfare me sugjeron/.test(t)) {
    return { reply: pick(UNSURE), matches: null, quickReplies: CHIPS.mood, prefs: { ...prefs, asked: Math.max(1, prefs.asked || 0) }, mode: 'scripted' }
  }

  if (/rifillo|fillo nga e para|fillo nga fillim|nga fillimi|reset/.test(t)) {
    return { reply: pick(RESTART), matches: null, quickReplies: CHIPS.mood, prefs: { asked: 1 }, mode: 'scripted' }
  }
  if (/ndrysho stilin|stil tjeter|dicka tjeter|diçka tjeter/.test(t)) {
    return { reply: pick(Q_MOOD), matches: null, quickReplies: CHIPS.mood, prefs: { ...prefs, mood: null, asked: prefs.asked || 0 }, mode: 'scripted' }
  }

  const parsed = parse(text, offers)
  const merged = mergePrefs(prefs, parsed)
  if (parsed.skipBudget) merged.budgetMax = 0

  if (/me lir|me e lir|dicka me e lir|diçka me e lir/.test(t)) {
    const floor = topMatches(offers, merged)[0]
    merged.budgetMax = Math.max(120, (floor ? floor.price : merged.budgetMax || 450) - 90)
  }

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
  return {
    reply: buildReply(merged, matches),
    matches,
    quickReplies: matches.length ? CHIPS.after : CHIPS.mood,
    prefs: merged,
    mode: 'scripted'
  }
}
