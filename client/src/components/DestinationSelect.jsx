import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'

export default function DestinationSelect ({ destinations, value, onChange, placeholder, invalid = false }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function handleOutside (e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function handleKey (e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const selected = destinations.find(d => d.id === value)

  return (
    <div ref={rootRef} className="relative flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`text-left text-sm font-semibold outline-none ${selected ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/40'} ${invalid ? 'text-red-600' : ''}`}
      >
        {selected ? selected.name : placeholder}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+10px)] z-20 max-h-64 w-56 overflow-y-auto rounded-2xl border border-white/70 bg-white/95 backdrop-blur-xl p-1.5 shadow-[0_20px_45px_-15px_rgba(46,27,12,0.4)]"
        >
          {destinations.length === 0 && (
            <p className="px-3 py-2 text-sm text-[#767676]">{t('search.destinationsLoading')}</p>
          )}
          {destinations.map(d => (
            <button
              key={d.id}
              type="button"
              role="option"
              aria-selected={d.id === value}
              onClick={() => { onChange(d.id); setOpen(false) }}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                d.id === value ? 'bg-[#0A0A0A] text-white' : 'text-[#0A0A0A] hover:bg-[#F6C79A]/40'
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
