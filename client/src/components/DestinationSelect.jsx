import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { Label, FieldGroup } from './ui/field.tsx'

export default function DestinationSelect ({ destinations, error = false, value, onChange, placeholder, label, invalid = false }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)

  // Sync the visible text to the committed selection — on mount (e.g. a
  // destination pre-filled from the results page URL) and once the
  // destinations list has finished loading. Typing itself never touches
  // `value`, so this never fights with what the user is typing.
  useEffect(() => {
    const match = destinations.find(d => d.id === value)
    setQuery(match ? match.name : '')
  }, [value, destinations])

  useEffect(() => {
    function handleOutside (e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false)
        const match = destinations.find(d => d.id === value)
        setQuery(match ? match.name : '')
      }
    }
    function handleKey (e) {
      if (e.key === 'Escape') {
        setOpen(false)
        const match = destinations.find(d => d.id === value)
        setQuery(match ? match.name : '')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [value, destinations])

  const filtered = query.trim()
    ? destinations.filter(d => d.name.toLowerCase().includes(query.trim().toLowerCase()))
    : destinations

  function pick (d) {
    onChange(d.id)
    setQuery(d.name)
    setOpen(false)
  }

  function handleKeyDown (e) {
    if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault()
      pick(filtered[0])
    }
  }

  return (
    <div ref={rootRef} className="group relative flex flex-col gap-2" data-invalid={invalid || undefined}>
      {label && <Label>{label}</Label>}
      <FieldGroup className={invalid ? 'border-destructive' : ''}>
        <input
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground/70 ${invalid ? 'text-destructive' : 'text-foreground'}`}
        />
        <Search aria-hidden className="size-4 shrink-0 text-muted-foreground/70" />
      </FieldGroup>

      {open && (
        <div
          role="listbox"
          className="menu-in origin-top absolute left-0 top-full z-20 mt-2 max-h-64 w-full min-w-56 overflow-y-auto rounded-lg border border-input bg-popover/80 p-1.5 shadow-lg backdrop-blur-xl supports-[backdrop-filter]:bg-popover/70"
        >
          {error && (
            <p className="px-3 py-2 text-sm text-destructive">{t('search.destinationsError')}</p>
          )}
          {!error && destinations.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">{t('search.destinationsLoading')}</p>
          )}
          {!error && destinations.length > 0 && filtered.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">{t('search.destinationsNoMatch')}</p>
          )}
          {filtered.map(d => (
            <button
              key={d.id}
              type="button"
              role="option"
              aria-selected={d.id === value}
              onClick={() => pick(d)}
              className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                d.id === value ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
