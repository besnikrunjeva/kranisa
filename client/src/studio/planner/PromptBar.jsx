import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Plus, Mic, Sparkles } from 'lucide-react'

const MODE_LABEL = {
  ollama: 'Local LLM', glm: 'GLM', guide: 'Travel guide',
  planner: 'Planner', intake: 'Intake', scripted: 'Scripted'
}
const LIVE_MODES = new Set(['ollama', 'glm', 'guide', 'planner'])

// Feature-detected dictation. Returns null when the browser has no
// SpeechRecognition — we render no mic rather than a dead button.
function getRecognition () {
  const Ctor = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
  return Ctor ? new Ctor() : null
}

export default function PromptBar ({
  value, onChange, onSubmit, onReset, disabled, busy, engineMode, placeholder
}) {
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const [listening, setListening] = useState(false)
  const [micSupported, setMicSupported] = useState(false)

  useEffect(() => {
    const rec = getRecognition()
    if (!rec) return
    setMicSupported(true)
    rec.lang = 'sq-AL'
    rec.interimResults = false
    rec.onresult = e => {
      const text = Array.from(e.results).map(r => r[0].transcript).join(' ').trim()
      if (text) onChange(value ? `${value} ${text}` : text)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    return () => { try { rec.abort() } catch { /* already stopped */ } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function autoGrow () {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  function toggleMic () {
    const rec = recognitionRef.current
    if (!rec) return
    if (listening) { rec.stop(); return }
    try { rec.start(); setListening(true) } catch { setListening(false) }
  }

  function onKeyDown (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const label = MODE_LABEL[engineMode] || 'Scripted'
  const live = LIVE_MODES.has(engineMode)

  return (
    <form className="pl-promptbar" onSubmit={e => { e.preventDefault(); onSubmit() }} data-busy={busy || undefined}>
      <button type="button" className="pl-pb__icon" onClick={onReset} aria-label="Bisedë e re" title="Bisedë e re">
        <Plus size={18} strokeWidth={2.2} />
      </button>

      <textarea
        ref={textareaRef}
        className="pl-pb__input"
        rows={1}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={e => { onChange(e.target.value); autoGrow() }}
        onKeyDown={onKeyDown}
      />

      <span className="pl-modelpill" title="Motori që përgjigjet" data-live={live}>
        <Sparkles size={12} />{label}
      </span>

      {micSupported && (
        <button type="button" className="pl-pb__icon" onClick={toggleMic} data-active={listening} aria-label={listening ? 'Ndalo diktimin' : 'Fol'} title="Fol">
          <Mic size={17} strokeWidth={2.2} />
        </button>
      )}

      <button type="submit" className="pl-send" disabled={!value.trim() || busy} aria-label="Dërgo">
        <ArrowUp size={18} strokeWidth={2.4} />
      </button>
    </form>
  )
}
