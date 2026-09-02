import { useEffect, useState } from 'react'

// Pixel-grid "thinking" indicator: a 3×3 grid pulsing in a chevron wavefront,
// next to a shimmering status word that changes as it works — a mix of plain
// and playful, all travel-flavoured. Starts on a random word so no two waits
// feel the same. No bubble (see .pl-bubble[data-typing]); reduced motion
// freezes the grid.
const CHEVRON = Array.from({ length: 9 }, (_, i) => {
  const r = Math.floor(i / 3)
  const c = i % 3
  return (c + Math.abs(r - 1)) * 90
})

const WORDS = [
  'Po mendoj',
  'Po kërkoj',
  'Po gjurmoj ofertat',
  'Po shfletoj çmimet',
  'Po krahasoj opsionet',
  'Po peshoj alternativat',
  'Po lidh pikat',
  'Po hap hartën',
  'Po numëroj yjet',
  'Po pyes agjencitë',
  'Po zgjedh më të mirat',
  'Po ndjek erën e detit'
]

export default function LoadingState () {
  const [i, setI] = useState(() => Math.floor(Math.random() * WORDS.length))
  useEffect(() => {
    const t = setInterval(() => setI(v => (v + 1) % WORDS.length), 1700)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="pl-load" role="status">
      <span className="pl-pixgrid" aria-hidden="true">
        {CHEVRON.map((delay, idx) => (
          <span key={idx} className="pl-pix" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
      <span className="pl-load__label">{WORDS[i]}</span>
    </div>
  )
}
