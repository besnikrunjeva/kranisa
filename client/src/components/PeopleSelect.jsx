import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'

export default function PeopleSelect ({ value, onChange }) {
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

  function step (delta) {
    // functional update — rapid successive clicks (e.g. a fast double-click)
    // would otherwise both read the same stale `value` from this closure
    onChange(prev => Math.max(1, prev + delta))
  }

  return (
    <div ref={rootRef} className="relative flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="text-left text-sm font-semibold text-[#0A0A0A] outline-none whitespace-nowrap"
      >
        {value}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-20 w-64 rounded-2xl border border-white/70 bg-white/95 backdrop-blur-xl p-4 shadow-[0_20px_45px_-15px_rgba(46,27,12,0.4)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#0A0A0A]">{t('search.people')}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => step(-1)}
                disabled={value <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0A0A0A]/20 text-[#0A0A0A] disabled:opacity-30"
              >
                &minus;
              </button>
              <span className="w-4 text-center text-sm font-semibold text-[#0A0A0A]">{value}</span>
              <button
                type="button"
                onClick={() => step(1)}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0A0A0A]/20 text-[#0A0A0A]"
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full text-right text-xs font-semibold uppercase tracking-wide text-[#905831] hover:underline"
          >
            {t('search.done')}
          </button>
        </div>
      )}
    </div>
  )
}
