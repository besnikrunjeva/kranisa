import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { cn } from '../lib/utils.js'

// Adapted from 21st.dev's "Language Selector Dropdown" (samsiavoshian2009).
// No flags: Kranisa serves Kosovo and Albania equally, and a single
// national flag for "Shqip" would read as favoring one over the other.
const LANGUAGES = [
  { code: 'sq', label: 'Shqip' },
  { code: 'en', label: 'English' }
]

export default function LanguageToggle () {
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside (e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0]

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-body text-[13px] font-semibold text-ink transition-colors hover:bg-surface-2"
      >
        <Globe className="h-3.5 w-3.5 text-muted-2" />
        <span>{current.code.toUpperCase()}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-2 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="menu-in origin-top-right absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-border bg-card/80 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-card/70">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLang(l.code); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 font-body text-[13px] text-left transition-colors',
                l.code === lang ? 'bg-surface-2 font-bold text-primary' : 'text-ink hover:bg-surface-2'
              )}
            >
              <span className="flex-1">{l.label}</span>
              {l.code === lang && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
