import { useEffect, useRef, useState } from 'react'
import { Check, Copy, MessageCircle, Send } from 'lucide-react'
import { buildContactUrl, buildDraft, channelLabel, detectChannel } from '../../lib/agencyContact.js'

// "Contact the agency" with a ready-to-send message. Kranisa drafts it; the
// human sends it. Copy works for every channel (Instagram / Messenger DMs can't
// be link-pre-filled, per Meta's platform rules); the Open button deep-links and
// pre-fills only where WhatsApp / email allow it. See lib/agencyContact.js.
//
// `draft` is optional — pass one to seed the text (e.g. a conversation-aware
// draft); otherwise it's templated from the offer. `defaultOpen` skips the
// collapsed trigger (used on the offer page, where contacting is the point).
export default function ContactAgency ({ match, draft, defaultOpen = false }) {
  const seed = (draft && draft.trim()) || buildDraft(match)
  const [open, setOpen] = useState(defaultOpen)
  const [text, setText] = useState(seed)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef(null)

  // A new offer/draft → adopt its text, unless the user is mid-edit.
  const editedRef = useRef(false)
  useEffect(() => {
    if (!editedRef.current) setText(seed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  useEffect(() => () => clearTimeout(copyTimer.current), [])

  const link = match.agencyContact
  const channel = link ? detectChannel(link) : null
  const openUrl = link ? buildContactUrl(link, text) : null
  const canPrefill = channel === 'whatsapp' || channel === 'email'

  async function copy () {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      try { document.execCommand('copy') } catch { /* clipboard unavailable */ }
      document.body.removeChild(el)
    }
    setCopied(true)
    clearTimeout(copyTimer.current)
    copyTimer.current = setTimeout(() => setCopied(false), 1600)
  }

  if (!open) {
    return (
      <button type="button" className="oc-open" onClick={() => setOpen(true)}>
        <MessageCircle size={15} strokeWidth={2.4} /> Kontakto agjencinë
      </button>
    )
  }

  return (
    <div className="oc" data-open>
      <div className="oc__top">
        <span className="oc__title">Mesazhi për {match.agency || 'agjencinë'}</span>
        <span className="oc__hint">rregulloje si të duash</span>
      </div>

      <textarea
        className="oc__draft"
        value={text}
        rows={4}
        onChange={e => { editedRef.current = true; setText(e.target.value) }}
        aria-label="Mesazhi për agjencinë"
      />

      <div className="oc__actions">
        <button type="button" className="oc__btn" data-copied={copied || undefined} onClick={copy}>
          {copied ? <Check size={15} strokeWidth={2.6} /> : <Copy size={15} strokeWidth={2.2} />}
          {copied ? 'U kopjua' : 'Kopjo mesazhin'}
        </button>

        {openUrl && (
          <a className="oc__btn oc__btn--go" href={openUrl} target="_blank" rel="noopener noreferrer">
            <Send size={14} strokeWidth={2.2} /> Hap {channelLabel(channel)}
          </a>
        )}
      </div>

      {link && !canPrefill && (
        <p className="oc__note">Kopjoje mesazhin dhe ngjite te {channelLabel(channel)} — DM-të nuk mbushen dot vetë.</p>
      )}
    </div>
  )
}
