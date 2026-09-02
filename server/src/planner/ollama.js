import { askLocalPlanner, CHIPS, scoreOffer } from './local-engine.js'

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'
const OLLAMA_WRITE_REPLIES = process.env.OLLAMA_WRITE_REPLIES === 'true'

// GLM (z.ai) — OpenAI-compatible. When a key is present it becomes the
// preferred provider (a paid API always writes replies); otherwise we fall
// back to local Ollama, then the scripted engine.
const GLM_API_KEY = process.env.GLM_API_KEY || ''
const GLM_MODEL = process.env.GLM_MODEL || 'glm-5.3-flash'
const GLM_BASE_URL = (process.env.GLM_BASE_URL || 'https://api.z.ai/api/paas/v4').replace(/\/$/, '')
const USE_GLM = Boolean(GLM_API_KEY)

// Unified "does the LLM write the final prose?" + provider label for `mode`.
const PROVIDER_WRITES = USE_GLM ? true : OLLAMA_WRITE_REPLIES
const PROVIDER_MODE = USE_GLM ? 'glm' : 'ollama'
const PROVIDER_MODEL = USE_GLM ? GLM_MODEL : OLLAMA_MODEL

function timeoutSignal (ms) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, cancel: () => clearTimeout(timeout) }
}

function compactOffer (offer, index) {
  return {
    rank: index + 1,
    destination: offer.destination,
    country: offer.country,
    price: offer.price,
    currency: offer.currency || '€',
    nights: offer.nights,
    board: offer.board,
    agency: offer.agency
  }
}

export async function getOllamaStatus () {
  // GLM key present → that's the provider. We assume reachable (a bad key
  // surfaces as a per-request fallback), so status stays a cheap, free check.
  if (USE_GLM) {
    return { available: true, mode: 'glm', model: GLM_MODEL, reason: null }
  }

  const { signal, cancel } = timeoutSignal(2500)
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, { signal })
    if (!response.ok) {
      return { available: false, mode: 'scripted', model: OLLAMA_MODEL, reason: `Ollama returned ${response.status}` }
    }

    const body = await response.json()
    const models = Array.isArray(body.models) ? body.models : []
    const hasModel = models.some(model => model.name === OLLAMA_MODEL || model.model === OLLAMA_MODEL)
    return {
      available: hasModel,
      mode: hasModel ? 'ollama' : 'scripted',
      model: OLLAMA_MODEL,
      reason: hasModel ? null : `Model ${OLLAMA_MODEL} is not installed`
    }
  } catch (error) {
    return {
      available: false,
      mode: 'scripted',
      model: OLLAMA_MODEL,
      reason: error.name === 'AbortError' ? 'Ollama status timed out' : error.message
    }
  } finally {
    cancel()
  }
}

const DESTINATION_PROFILES = {
  antalya: { nightlife: 7, water: 8, family: 9, quiet: 5, culture: 7, luxury: 8, budget: 6, beach: 9, city: 7, note: 'resorte, plazhe, all inclusive' },
  vlore: { nightlife: 7, water: 8, family: 7, quiet: 6, culture: 5, luxury: 5, budget: 9, beach: 8, city: 6, note: 'plazh afer, cmime te mira, promenade' },
  zakynthos: { nightlife: 8, water: 10, family: 7, quiet: 6, culture: 5, luxury: 7, budget: 6, beach: 10, city: 4, note: 'uje shume i kthjellet, beach clubs, natyre' },
  corfu: { nightlife: 7, water: 9, family: 8, quiet: 7, culture: 8, luxury: 7, budget: 6, beach: 9, city: 6, note: 'plazhe, qytet i vjeter, balanc' },
  budva: { nightlife: 9, water: 8, family: 6, quiet: 4, culture: 6, luxury: 6, budget: 7, beach: 8, city: 6, note: 'nightlife i forte, plazh, afer' },
  barcelona: { nightlife: 10, water: 6, family: 6, quiet: 3, culture: 10, luxury: 7, budget: 4, beach: 6, city: 10, note: 'qytet, kulture, restorante, nightlife' },
  budapest: { nightlife: 9, water: 2, family: 6, quiet: 5, culture: 9, luxury: 6, budget: 8, beach: 1, city: 10, note: 'qytet, nightlife, spa, cmime me te buta' },
  alberobello: { nightlife: 3, water: 5, family: 7, quiet: 9, culture: 9, luxury: 6, budget: 5, beach: 5, city: 6, note: 'qete, romantike, arkitekture unike' },
  hurghada: { nightlife: 6, water: 9, family: 8, quiet: 6, culture: 4, luxury: 8, budget: 7, beach: 10, city: 4, note: 'resorte, snorkeling, det i kthjellet' },
  bodrum: { nightlife: 9, water: 8, family: 7, quiet: 5, culture: 7, luxury: 9, budget: 5, beach: 8, city: 7, note: 'nightlife, marina, hotele premium' },
  istanbul: { nightlife: 9, water: 4, family: 6, quiet: 3, culture: 10, luxury: 7, budget: 6, beach: 2, city: 10, note: 'qytet i madh, kulture, ushqim, shopping' },
  ksamil: { nightlife: 6, water: 10, family: 7, quiet: 6, culture: 4, luxury: 5, budget: 7, beach: 10, city: 3, note: 'uje i paster, plazhe te vogla' },
  sarande: { nightlife: 8, water: 8, family: 7, quiet: 5, culture: 5, luxury: 5, budget: 8, beach: 8, city: 5, note: 'plazh, shetitore, nightlife sezonal' }
}

const GUIDE_INTENTS = {
  nightlife: ['nightlife', 'najtllajf', 'party', 'club', 'klub', 'jete nate', 'nat', 'mbrëmje', 'mbremje', 'bar'],
  water: ['uje', 'uji', 'ujin', 'ujit', 'uj', 'det', 'kthjellet', 'paster', 'kalter', 'blue', 'snorkel'],
  family: ['familj', 'femij', 'kids', 'prinder', 'qete per femije'],
  quiet: ['qete', 'pa zhurme', 'relaks', 'romantik', 'pushim i qete'],
  culture: ['kulture', 'histori', 'muze', 'qytet i vjeter', 'shetitje'],
  luxury: ['lux', 'luks', 'premium', 'resort', 'komod'],
  budget: ['lir', 'lire', 'buxhet', 'cheap', 'cmim', 'ekonomik', 'shtrejt', 'shtrenjt'],
  beach: ['plazh', 'beach', 'diell', 'bregdet'],
  city: ['qytet', 'city', 'shopping', 'urban']
}

function cityKey (destination = '') {
  return destination.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
}

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
  const normalized = cityKey(word)
  if (normalized.length <= 3) return hasPhrase(text, normalized)
  if (hasPhrase(text, normalized)) return true
  const distanceLimit = normalized.length <= 5 ? 1 : 2
  return tokens(text).some(token => Math.abs(token.length - normalized.length) <= distanceLimit && editDistance(token, normalized) <= distanceLimit)
}

function detectGuideIntents (text) {
  const normalized = cityKey(text)
  return Object.entries(GUIDE_INTENTS)
    .filter(([intent, words]) => words.some(word => intent === 'budget' ? hasPhrase(normalized, cityKey(word)) : hasLooseWord(normalized, word)))
    .map(([intent]) => intent)
}

function destinationProfile (offer) {
  return DESTINATION_PROFILES[cityKey(offer.destination)] || {
    nightlife: 5,
    water: 5,
    family: 6,
    quiet: 6,
    culture: 5,
    luxury: 5,
    budget: 5,
    beach: 6,
    city: 5,
    note: 'destinacion me oferta aktive'
  }
}

function guideMatches (offers, text, prefs = {}) {
  const intents = detectGuideIntents(text)
  if (!intents.length) return []
  const byDest = new Map()

  for (const offer of offers) {
    const profile = destinationProfile(offer)
    const guideScore = intents.reduce((sum, intent) => sum + (profile[intent] || 0), 0) / intents.length
    const offerScore = scoreOffer(offer, prefs)
    const total = guideScore * 12 + offerScore
    const tags = intents.map(intent => `${intent}:${profile[intent] || 0}`)
    const current = byDest.get(`${offer.destination}, ${offer.country}`)
    const candidate = { ...offer, score: total, guideScore: guideScore * 10, offerScore, tags, profileNote: profile.note, intents }
    if (!current || candidate.score > current.score) byDest.set(`${offer.destination}, ${offer.country}`, candidate)
  }

  return Array.from(byDest.values())
    .sort((a, b) => b.score - a.score || a.price - b.price)
    .slice(0, 5)
}

function guideTopic (match) {
  const labels = {
    nightlife: 'jete nate',
    water: 'uje te kthjellet',
    family: 'familje',
    quiet: 'pushim te qete',
    culture: 'kulture',
    luxury: 'komoditet',
    budget: 'cmim te mire',
    beach: 'plazh',
    city: 'qytet'
  }
  return (match.intents || []).map(intent => labels[intent] || intent).slice(0, 2).join(' dhe ') || 'kete kerkese'
}

function deterministicGuideReply (matches) {
  const [top, second, third] = matches
  if (!top) return ''
  const alternatives = [second, third].filter(Boolean).map(match => match.destination)
  const altText = alternatives.length ? ` Alternative te mira: ${alternatives.join(', ')}.` : ''
  return `Nga destinacionet qe kemi, ${top.destination} del me i forti per ${guideTopic(top)}. Oferta me e mire nis nga ${top.currency || '€'}${top.price} per ${top.nights} nete.${altText}`
}

function buildChatPrompt ({ text, prefs, baseReply, matches, quickReplies, history, mode }) {
  const hasMatches = Array.isArray(matches) && matches.length > 0
  return [
    'You are Kranisa — a friendly, sharp travel buddy for people from Kosovo and Albania planning a holiday.',
    'Talk like a real friend who knows travel: warm, a little witty, genuinely helpful. React to what they say before moving on.',
    'Write in natural, correct Albanian with proper diacritics (ë, ç) unless the user clearly writes in English. Casual is good; robotic is not.',
    'Remember and use what they already told you (their preferences are provided). Never re-ask something you already know.',
    'When you still need info to recommend well, ask exactly ONE natural follow-up — the single most useful thing (style, budget, dates, or who is travelling).',
    'Stay 100% grounded in the provided Kranisa offers. Never invent destinations, prices, agencies, hotels, dates, links, discounts, or availability. If nothing fits, say so honestly and suggest loosening one thing.',
    'No markdown, no lists, no emojis spam (one is fine). Keep it to 2–4 short sentences, under 90 words.',
    hasMatches
      ? 'Offers were matched below — recommend only those. Lead with the top destination, say why it fits them in a few words, and invite them to look.'
      : 'No offers to recommend yet. Do not name any destination or price. Just react and ask your one follow-up.',
    '',
    `Mode: ${mode}`,
    `Current user message: ${text}`,
    `Known preferences JSON: ${JSON.stringify(prefs || {})}`,
    `Recent chat JSON: ${JSON.stringify((history || []).slice(-8))}`,
    `Facts only (for grounding — do NOT copy this wording): ${baseReply}`,
    `Suggested quick replies JSON: ${JSON.stringify(quickReplies || [])}`,
    `Matched offers JSON: ${JSON.stringify((matches || []).map(compactOffer))}`,
    '',
    'Now write YOUR reply in your own warm, natural words — never copy the base wording above.',
    'Use correct Albanian with diacritics (ë, ç). Sound like a friend, not a form. Reply only, no preamble.'
  ].join('\n')
}

// The voice of the Planner. Register was chosen deliberately: standard
// Tirana Albanian, warm and polished, "ti" (not "ju"), no emojis, no
// Gheg/Kosovo dialect, natural phrasing (frame the OFFER, don't equate a city
// with nights). The few-shot examples anchor the tone far more than rules do.
const GLM_SYSTEM = [
  'Je Kranisa, një këshilltar udhëtimi i ngrohtë dhe profesional për njerëz nga Shqipëria dhe Kosova.',
  '',
  'Toni dhe gjuha:',
  '- Shqip standard (si në Tiranë), i ngrohtë dhe i sjellshëm — si një agjent udhëtimi i mirë, jo si tekst shkolle.',
  '- Përdor "ti" (kurrë "ju"), por mbaje të kulturuar dhe të rrjedhshëm. Pa zhargon, pa dialekt geg/kosovar.',
  '- Pa emoji. Fjali të natyrshme, jo të drejtpërdrejta si përkthim.',
  '- Kur paraqet një ofertë, fol për ofertën ("Për X ka një ofertë…"); mos e barazo qytetin me netët.',
  '- Nëse përdoruesi shkruan qartë anglisht, përgjigju në anglisht të ngrohtë e të sjellshme.',
  '',
  'Rregulla: qëndro 100% te ofertat e dhëna. Mos shpik kurrë destinacione, çmime, agjenci, hotele, data apo disponueshmëri. Pa markdown, pa lista. 2–4 fjali të shkurtra.',
  'Mos pretendo distanca apo cili vend është "më afër / më larg" — nuk i di me saktësi. Fokusohu te stili, çmimi dhe përshtatja.',
  'Kur rekomandon oferta, FILLO përgjigjen me një etiketë të fshehur [PICK: <emri i destinacionit pikërisht si te "Ofertat e përputhura", p.sh. Istanbul, jo Stambolli>], pastaj një hapësirë dhe përgjigjen tënde natyrale. Në prozë përdor emrin që të vjen natyrshëm.',
  '',
  'Shembuj toni (vetëm si stil, jo të dhëna reale):',
  '',
  'Përdoruesi: kam qejf plazh, diku më nën 400€',
  'Kranisa: [PICK: Vlorë] Shumë mirë. Për plazh nën 400€ të shkon Vlora — 3 netë me mëngjes për 199€ te EU Travel, det i pastër dhe qytet i gjallë. Po të duash pak më shumë, Zakynthos ka 5 netë all inclusive për 379€. Cila të duket më e mira?',
  '',
  'Përdoruesi: po mendoj për një pushim, s\'e di ku',
  'Kranisa: S\'ka gjë, e gjejmë bashkë. Më thuaj vetëm çfarë kërkon më shumë — det, qytet apo diçka të qetë — dhe rreth çfarë buxheti je?',
  '',
  'Përdoruesi: diçka romantike për çift',
  'Kranisa: [PICK: Zakynthos] Ide e bukur. Për një pushim çifti të rekomandoj Zakynthos — 5 netë all inclusive për 379€ te Top Tours, plazhe të qeta dhe perëndime që s\'i harron. A të tërheq?'
].join('\n')

// Per-request task + data. Persona and tone live in GLM_SYSTEM; this stays
// task-focused. Matched offers are FACTS only — GLM phrases them itself, with
// no scripted base sentence to parrot.
function buildBuddyPrompt ({ text, prefs, matches, quickReplies, history }) {
  const hasMatches = Array.isArray(matches) && matches.length > 0
  return [
    'Detyra: përgjigju si Kranisa, sipas tonit dhe shembujve në mesazhin e sistemit (shqip standard, i ngrohtë, me "ti", pa emoji, pa dialekt).',
    hasMatches
      ? 'Ke oferta të përputhura më poshtë — rekomando VETËM prej tyre. Fillo me etiketën [PICK: emri saktësisht si në JSON] për destinacionin që rekomandon të parin, pastaj përgjigjen. Thuaj shkurt pse i përshtatet, përmend çmimin/netët natyrshëm dhe ftoje ta shohë. Mund të shtosh një opsion të dytë.'
      : 'Nuk ke ende oferta për të rekomanduar — mos përmend asnjë destinacion apo çmim. Përgjigju ngrohtë dhe bëj VETËM një pyetje të natyrshme (stil, buxhet, data, ose me kë udhëton).',
    'Përdor çka të ka thënë tashmë (preferencat më poshtë) dhe mos e ripyet. Qëndro te faktet; mos shpik asgjë. 2–4 fjali të shkurtra.',
    '',
    `Mesazhi i përdoruesit: ${text}`,
    `Preferencat e njohura (JSON): ${JSON.stringify(prefs || {})}`,
    `Biseda e fundit (JSON): ${JSON.stringify((history || []).slice(-8))}`,
    `Ofertat e përputhura (fakte, formuloji vetë): ${JSON.stringify((matches || []).map(compactOffer))}`,
    `Ide për përgjigje të shpejta: ${JSON.stringify(quickReplies || [])}`,
    '',
    'Shkruaj vetëm përgjigjen tënde.'
  ].join('\n')
}

function cleanReply (reply) {
  const compact = String(reply || '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!compact) return ''
  return compact.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 4).join(' ')
}

function replyIsGrounded (reply, matches) {
  if (!Array.isArray(matches) || !matches.length) return true
  const normalized = cityKey(reply)
  return normalized.includes(cityKey(matches[0].destination))
}

function replyLooksClean (reply, matches) {
  const normalized = cityKey(reply)
  const questionCount = (reply.match(/\?/g) || []).length
  if (questionCount > 1) return false
  if (/veper|shprehje|shenjt|kjo do tjeter/.test(normalized)) return false
  if (Array.isArray(matches) && matches.length && !replyIsGrounded(reply, matches)) return false
  return true
}

async function composeWithOllama ({ text, prefs, baseReply, matches, quickReplies, history, mode }) {
  if (!OLLAMA_WRITE_REPLIES) return { reply: baseReply, pick: null }

  const { signal, cancel } = timeoutSignal(45000)
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: buildChatPrompt({ text, prefs, baseReply, matches, quickReplies, history, mode }),
        stream: false,
        options: {
          temperature: 0.45,
          top_p: 0.9,
          num_predict: 120
        }
      })
    })

    if (!response.ok) throw new Error(`Ollama returned ${response.status}`)
    const body = await response.json()
    const reply = cleanReply(body.response)
    if (!reply) throw new Error('Ollama returned an empty reply')
    if (!replyLooksClean(reply, matches)) return { reply: baseReply, pick: null }
    return { reply, pick: null }
  } finally {
    cancel()
  }
}

async function composeWithGlm ({ text, prefs, matches, quickReplies, history }) {
  const { signal, cancel } = timeoutSignal(20000)
  try {
    const response = await fetch(`${GLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GLM_API_KEY}`
      },
      signal,
      body: JSON.stringify({
        model: GLM_MODEL,
        temperature: 0.5,
        max_tokens: 400,
        // GLM-5.3 always reasons; "low" keeps it near-zero so the token budget
        // goes to the actual reply (not silent chain-of-thought) and latency
        // and cost stay down — right for a short chat reply.
        reasoning_effort: 'low',
        messages: [
          { role: 'system', content: GLM_SYSTEM },
          { role: 'user', content: buildBuddyPrompt({ text, prefs, matches, quickReplies, history }) }
        ]
      })
    })

    if (!response.ok) throw new Error(`GLM returned ${response.status}`)
    const body = await response.json()
    const raw = body?.choices?.[0]?.message?.content || ''
    // GLM tags its lead pick with the canonical destination name from the offer
    // JSON — so the card can follow its recommendation exactly, even when the
    // prose uses an Albanian exonym ("Stambolli" vs "Istanbul").
    const pickMatch = raw.match(/\[PICK:\s*([^\]]+)\]/i)
    const pick = pickMatch ? pickMatch[1].trim() : null
    const reply = cleanReply(pickMatch ? raw.replace(pickMatch[0], '') : raw)
    if (!reply) throw new Error('GLM returned an empty reply')
    // Trust GLM's reply — it's handed the exact offers and told not to invent.
    // The old replyLooksClean/grounding guard existed for weak local models and
    // wrongly rejected natural Albanian (e.g. the definite form "Vlora").
    return { reply, pick }
  } finally {
    cancel()
  }
}

// Dispatch reply composition to the active provider.
function composeReply (args) {
  return USE_GLM ? composeWithGlm(args) : composeWithOllama(args)
}

// GLM writes the prose and chooses which destination to lead with; the card
// must show THAT one. Reorder matches so the destination GLM mentions first
// becomes matches[0] — keeping card, alternatives and "things to do" in sync
// with what the buddy actually said. Diacritic-insensitive, and matches the
// definite form too ("Vlora" ~ "Vlorë") via a short stem.
const fold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function moveToFront (matches, idx) {
  if (idx <= 0) return matches
  return [matches[idx], ...matches.slice(0, idx), ...matches.slice(idx + 1)]
}

function reorderMatches (pick, reply, matches) {
  if (!Array.isArray(matches) || matches.length < 2) return matches
  // 1) Prefer GLM's explicit [PICK] tag — exact canonical name, exonym-proof.
  if (pick) {
    const pf = fold(pick)
    const idx = matches.findIndex(m => {
      const d = fold(m.destination)
      return d === pf || pf.includes(d) || d.includes(pf)
    })
    if (idx >= 0) return moveToFront(matches, idx)
  }
  // 2) Fallback: first destination the prose mentions (definite-form tolerant).
  if (!reply) return matches
  const norm = fold(reply)
  let bestIdx = -1
  let bestPos = Infinity
  matches.forEach((m, i) => {
    const dest = fold(m.destination)
    if (dest.length < 3) return
    const stem = dest.slice(0, Math.max(4, dest.length - 1))
    const pos = norm.indexOf(stem)
    if (pos !== -1 && pos < bestPos) { bestPos = pos; bestIdx = i }
  })
  return moveToFront(matches, bestIdx)
}

function isGuideQuestion (text) {
  const normalized = cityKey(text)
  const hasGuideIntent = detectGuideIntents(text).length > 0
  const asksForPlace = /vend|ven|destinacion|ku|me duhet|du ni|dua nje|dua ni|gjej|sugjero/.test(normalized)
  const comparesQuality = /tmire|t mire|te mire|me i mire|me te mire|ma i mir|ma tmire|best|better/.test(normalized)
  return /cili|cilat|kush|ku|krahaso|compare|which|where|rank/.test(normalized) || (hasGuideIntent && asksForPlace && comparesQuality)
}

async function askOllama ({ text, offers, prefs, history }) {
  const scripted = await askLocalPlanner({ text, offers, prefs })
  const guideQuestion = isGuideQuestion(text)
  const guideContext = guideQuestion ? guideMatches(offers, text, scripted.prefs || prefs || {}) : []

  if (!guideQuestion && scripted.matches === null) {
    const { reply } = await composeReply({
      text,
      prefs: scripted.prefs,
      baseReply: scripted.reply,
      matches: null,
      quickReplies: scripted.quickReplies,
      history,
      mode: 'intake'
    })
    return { ...scripted, reply, mode: PROVIDER_WRITES ? PROVIDER_MODE : 'intake', model: PROVIDER_MODEL }
  }

  const matches = guideContext.length ? guideContext : scripted.matches
  if (!matches || !matches.length) {
    // No offers to recommend yet — still let the buddy (GLM) ask the follow-up
    // naturally, instead of dropping to the raw scripted question.
    const { reply } = await composeReply({
      text,
      prefs: scripted.prefs,
      baseReply: scripted.reply,
      matches: null,
      quickReplies: scripted.quickReplies,
      history,
      mode: 'intake'
    })
    return { ...scripted, reply, mode: PROVIDER_WRITES ? PROVIDER_MODE : 'intake', model: PROVIDER_MODEL }
  }

  if (guideContext.length) {
    const baseReply = deterministicGuideReply(matches)
    const { reply, pick } = await composeReply({
      text,
      prefs: scripted.prefs,
      baseReply,
      matches,
      quickReplies: CHIPS.after,
      history,
      mode: 'guide'
    })
    return {
      ...scripted,
      reply,
      matches: reorderMatches(pick, reply, matches),
      quickReplies: CHIPS.after,
      mode: PROVIDER_WRITES ? PROVIDER_MODE : 'guide',
      taskMode: 'guide',
      model: PROVIDER_MODEL
    }
  }

  const { reply, pick } = await composeReply({
    text,
    prefs: scripted.prefs,
    baseReply: scripted.reply,
    matches,
    quickReplies: scripted.quickReplies,
    history,
    mode: 'planner'
  })
  return {
    ...scripted,
    reply,
    matches: reorderMatches(pick, reply, matches),
    mode: PROVIDER_WRITES ? PROVIDER_MODE : 'planner',
    taskMode: 'planner',
    model: PROVIDER_MODEL
  }
}

export async function askPlannerWithOllamaFallback ({ text, offers, prefs, history }) {
  try {
    return await askOllama({ text, offers, prefs, history })
  } catch (error) {
    const scripted = await askLocalPlanner({ text, offers, prefs })
    return {
      ...scripted,
      mode: 'scripted',
      fallbackReason: error.name === 'AbortError' ? 'Ollama timed out' : error.message
    }
  }
}
