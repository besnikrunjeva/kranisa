import { useLayoutEffect, useRef, useState } from 'react'

// Emil's tab technique: two identical rows stacked. The base row is muted;
// the overlay row is the accent-ink "active" styling over a filled pill,
// clipped so only the selected segment shows. Animating the clip-path gives
// a color transition that timing individual color fades can never match.
// Measured in pixels so uneven label widths stay pixel-perfect.
export default function SortControl ({ options, value, onChange }) {
  const rowRef = useRef(null)
  const btnRefs = useRef([])
  const [clip, setClip] = useState('inset(0 100% 0 0 round 999px)')

  const activeIndex = Math.max(0, options.findIndex(o => o.value === value))

  useLayoutEffect(() => {
    function measure () {
      const row = rowRef.current
      const btn = btnRefs.current[activeIndex]
      if (!row || !btn) return
      const rowW = row.offsetWidth
      const left = btn.offsetLeft
      const right = rowW - (left + btn.offsetWidth)
      setClip(`inset(0 ${right}px 0 ${left}px round 999px)`)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeIndex, options])

  return (
    <div className="st-seg" role="tablist">
      <div className="st-seg__row" ref={rowRef}>
        {options.map((o, i) => (
          <button
            key={o.value}
            ref={el => { btnRefs.current[i] = el }}
            type="button"
            role="tab"
            aria-selected={o.value === value}
            className="st-seg__btn"
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}

        <div className="st-seg__overlay" style={{ clipPath: clip }} aria-hidden="true">
          <div className="st-seg__pill" />
          {options.map(o => (
            <span key={o.value} className="st-seg__btn" tabIndex={-1}>{o.label}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
