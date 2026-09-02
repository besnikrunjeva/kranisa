import { useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'

// Mirrors the classic site's destination combobox behaviour, in the studio's
// editorial styling: icon on the right, loading/error/no-match states, and —
// the important bit — typing never discards the committed selection; on
// blur/escape the field reverts to the chosen destination rather than
// leaving half-typed text behind.
export default function DestinationField ({ destinations, error = false, value, onChange, placeholder, open, onOpenChange }) {
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const setOpen = onOpenChange

  // Keep the visible text in sync with the committed selection (on mount, and
  // once destinations finish loading). Typing itself never touches `value`.
  useEffect(() => {
    const match = destinations.find(d => d.id === value)
    setQuery(match ? match.name : '')
  }, [value, destinations])

  // Only listen while open — otherwise this would also fire when the user is
  // interacting with the (separate) date calendar and wrongly close it.
  useEffect(() => {
    if (!open) return
    function revert () {
      setOpen(false)
      const match = destinations.find(d => d.id === value)
      setQuery(match ? match.name : '')
    }
    function onDocClick (e) { if (rootRef.current && !rootRef.current.contains(e.target)) revert() }
    function onKey (e) { if (e.key === 'Escape') revert() }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, value, destinations, setOpen])

  const loading = destinations.length === 0 && !error
  const filtered = query.trim()
    ? destinations.filter(d => d.name.toLowerCase().includes(query.trim().toLowerCase()))
    : destinations

  function pick (d) {
    onChange(d.id)
    setQuery(d.name)
    setOpen(false)
  }

  return (
    <div ref={rootRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          className="st-search__input"
          role="combobox"
          aria-expanded={open}
          value={query}
          placeholder={placeholder}
          autoComplete="off"
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter' && filtered[0]) { e.preventDefault(); pick(filtered[0]) } }}
        />
        <Search size={16} style={{ color: 'var(--st-faint)', flexShrink: 0 }} />
      </div>

      {open && (
        <div className="st-menu menu-in" role="listbox">
          {error && <p className="st-menu__empty">Nuk u ngarkuan destinacionet</p>}
          {!error && loading && <p className="st-menu__empty">Duke ngarkuar destinacionet…</p>}
          {!error && !loading && filtered.length === 0 && <p className="st-menu__empty">Asnjë destinacion që përputhet</p>}
          {!error && filtered.map(d => (
            <button
              key={d.id}
              type="button"
              role="option"
              aria-selected={d.id === value}
              className="st-menu__item"
              data-active={d.id === value}
              onClick={() => pick(d)}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
