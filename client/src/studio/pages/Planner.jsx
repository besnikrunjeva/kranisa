import { useEffect, useRef, useState } from 'react'
import { listAllOffers } from '../../api/offers.js'
import { askPlannerApi, getPlannerStatus } from '../../api/planner.js'
import { adaptOffer } from '../adapt.js'
import { askPlanner, STARTERS, GREETING } from '../planner/engine.js'
import RecommendationCard, { SecondaryOffer } from '../planner/RecommendationCard.jsx'
import LoadingState from '../planner/LoadingState.jsx'
import StreamingText from '../planner/StreamingText.jsx'
import ThinkingTrace from '../planner/ThinkingTrace.jsx'
import PromptBar from '../planner/PromptBar.jsx'

let uid = 0
const nextId = () => `m${++uid}`
const PLANNER_MEMORY_KEY = 'kranisa.planner.memory.v1'

function loadPlannerMemory () {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PLANNER_MEMORY_KEY) || '{}')
    const messages = Array.isArray(stored.messages)
      ? stored.messages
        .filter(message => message && (message.role === 'ai' || message.role === 'user') && typeof message.text === 'string')
        .slice(-14)
        .map(message => ({ ...message, id: nextId() }))
      : null
    return {
      messages: messages && messages.length ? messages : [{ id: nextId(), role: 'ai', text: GREETING }],
      prefs: stored.prefs && typeof stored.prefs === 'object' ? stored.prefs : {}
    }
  } catch {
    return { messages: [{ id: nextId(), role: 'ai', text: GREETING }], prefs: {} }
  }
}

function savePlannerMemory ({ messages, prefs }) {
  try {
    window.localStorage.setItem(PLANNER_MEMORY_KEY, JSON.stringify({
      prefs,
      messages: messages
        .filter(message => !message.typing)
        .slice(-14)
        .map(({ role, text, quickReplies, matches, understood, offersConsidered, elapsedMs }) =>
          ({ role, text, quickReplies, matches, understood, offersConsidered, elapsedMs }))
    }))
  } catch {
    // Local memory is a convenience, not a critical path.
  }
}

function shouldForgetMemory (text) {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return /harro|fshij|pastro|clear/.test(normalized) && /memori|kujtes|memory|chat/.test(normalized)
}

function Message ({ msg, isLast, onQuick, onReveal }) {
  // Offers + chips appear only once the reply has finished streaming.
  const [streamDone, setStreamDone] = useState(!msg.stream)

  useEffect(() => {
    if (streamDone && onReveal) onReveal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamDone])

  if (msg.role === 'user') {
    return (
      <div className="pl-msg pl-msg--me">
        <div className="pl-bubble pl-bubble--me">{msg.text}</div>
      </div>
    )
  }

  const matches = msg.matches || []
  const hero = matches[0]
  const alternatives = matches.slice(1)

  return (
    <div className="pl-msg pl-msg--ai">
      <div className="pl-ai">
        {msg.typing
          ? <LoadingState />
          : (
            <>
              {hero && (
                <ThinkingTrace understood={msg.understood} offersConsidered={msg.offersConsidered} ms={msg.elapsedMs} />
              )}
              <StreamingText text={msg.text} stream={msg.stream} onDone={() => setStreamDone(true)} />

              {hero && streamDone && (
                <div className="pl-bento" data-solo={alternatives.length === 0 || undefined}>
                  <RecommendationCard match={hero} understood={msg.understood} />
                  {alternatives.length > 0 && (
                    <div className="pl-bento__grid">
                      {alternatives.map((m, i) => (
                        <SecondaryOffer key={`${m.destination}-${m.country}`} match={m} index={i + 1} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {msg.quickReplies && isLast && streamDone && (
                <div className="pl-quick">
                  {msg.quickReplies.map(q => (
                    <button key={q} type="button" className="pl-chip pl-chip--sm" onClick={() => onQuick(q)}>{q}</button>
                  ))}
                </div>
              )}
            </>
            )}
      </div>
    </div>
  )
}

export default function Planner () {
  const initialMemoryRef = useRef(null)
  if (!initialMemoryRef.current) initialMemoryRef.current = loadPlannerMemory()

  const [offers, setOffers] = useState(null)
  const [messages, setMessages] = useState(initialMemoryRef.current.messages)
  const [prefs, setPrefs] = useState(initialMemoryRef.current.prefs)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [engineMode, setEngineMode] = useState('scripted')
  const threadRef = useRef(null)

  useEffect(() => {
    listAllOffers().then(list => setOffers(list.map(adaptOffer))).catch(() => setOffers([]))
    getPlannerStatus()
      .then(status => setEngineMode(status.mode || 'scripted'))
      .catch(() => setEngineMode('scripted'))
  }, [])

  function scrollToBottom () {
    const el = threadRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  useEffect(() => {
    savePlannerMemory({ messages, prefs })
  }, [messages, prefs])

  function resetConversation () {
    try { window.localStorage.removeItem(PLANNER_MEMORY_KEY) } catch { /* non-critical */ }
    setPrefs({})
    setInput('')
    setMessages([{ id: nextId(), role: 'ai', text: GREETING }])
  }

  async function send (raw) {
    const text = (raw ?? input).trim()
    if (!text || busy || offers === null) return

    if (shouldForgetMemory(text)) {
      resetConversation()
      setMessages([{ id: nextId(), role: 'ai', text: 'E harrova memorien e këtij plani. Nisim fresket: çfarë lloj pushimi po kërkon?' }])
      return
    }

    const userMsg = { id: nextId(), role: 'user', text }
    const typingId = nextId()
    setMessages(prev => [...prev, userMsg, { id: typingId, role: 'ai', typing: true }])
    setInput('')
    setBusy(true)

    const history = [...messages, userMsg]
      .filter(message => !message.typing)
      .slice(-8)
      .map(message => ({ role: message.role, text: message.text }))

    const t0 = performance.now()
    const result = await askPlannerApi({ text, prefs, history })
      .catch(() => askPlanner({ text, offers, prefs }))
    const elapsedMs = Math.round(performance.now() - t0)
    const { reply, matches, quickReplies, prefs: nextPrefs, mode } = result
    setEngineMode(mode || 'scripted')
    setPrefs(nextPrefs || {})
    setMessages(prev => prev.map(m => m.id === typingId
      ? {
          id: m.id,
          role: 'ai',
          text: reply,
          matches,
          understood: nextPrefs,
          quickReplies,
          offersConsidered: offers.length,
          elapsedMs,
          stream: true
        }
      : m))
    setBusy(false)
  }

  const showChips = messages.length <= 1

  return (
    <main className="pl">
      <div className="pl-glow" aria-hidden="true" />

      <section className="st-wrap pl-shell">
        {showChips && (
          <header className="pl-head">
            <p className="st-eyebrow pl-eyebrow">Kranisa AI</p>
            <h1 className="pl-title">Bisedo. <em>Kranisa gjen udhëtimin.</em></h1>
          </header>
        )}

        <div className="pl-thread" data-started={!showChips} ref={threadRef}>
          {messages.map((m, i) => (
            <Message key={m.id} msg={m} isLast={i === messages.length - 1} onQuick={send} onReveal={scrollToBottom} />
          ))}
        </div>

        <div className="pl-composer-wrap">
          {showChips && (
            <div className="pl-chips">
              {STARTERS.map(s => (
                <button key={s} type="button" className="pl-chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          <PromptBar
            value={input}
            onChange={setInput}
            onSubmit={() => send()}
            onReset={resetConversation}
            disabled={offers === null}
            busy={busy}
            engineMode={engineMode}
            placeholder={offers === null ? 'Duke lexuar ofertat…' : 'Përshkruaj pushimin që kërkon…'}
          />
          <p className="pl-foot">
            Sugjerimet vijnë nga ofertat reale të Kranisa · shtyp Enter për të dërguar
          </p>
        </div>
      </section>
    </main>
  )
}
