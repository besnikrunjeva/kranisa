import { useMemo, useState } from 'react'
import { Reveal } from './ui.jsx'
import OfferCard from './OfferCard.jsx'
import SortControl from './SortControl.jsx'
import FilterRail from './FilterRail.jsx'

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Më i lirë' },
  { value: 'price_desc', label: 'Më i shtrenjtë' },
  { value: 'fresh', label: 'Më të freskëta' }
]

function countBy (offers, key) {
  const m = new Map()
  for (const o of offers) m.set(o[key], (m.get(o[key]) || 0) + 1)
  return [...m.entries()]
}

export default function OffersExplorer ({ offers }) {
  const [sortBy, setSortBy] = useState('price_asc')
  const [selectedBoards, setSelectedBoards] = useState(() => new Set())
  const [selectedStars, setSelectedStars] = useState(() => new Set())

  const boards = useMemo(() => countBy(offers, 'board'), [offers])
  const stars = useMemo(
    () => countBy(offers, 'stars').filter(([s]) => s != null).sort((a, b) => b[0] - a[0]),
    [offers]
  )

  const shown = useMemo(() => {
    const out = offers.filter(o => {
      if (selectedBoards.size && !selectedBoards.has(o.board)) return false
      if (selectedStars.size && !selectedStars.has(o.stars)) return false
      return true
    })
    out.sort((a, b) => {
      if (sortBy === 'fresh') return (a.freshHours ?? 0) - (b.freshHours ?? 0)
      return sortBy === 'price_asc' ? a.price - b.price : b.price - a.price
    })
    return out
  }, [offers, selectedBoards, selectedStars, sortBy])

  const minPrice = Math.min(...shown.map(o => o.price))

  function toggle (setter) {
    return value => setter(prev => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 200px) 1fr', gap: 40, alignItems: 'start' }} className="st-explorer">
      <aside style={{ position: 'sticky', top: 96 }} className="st-explorer__rail">
        <FilterRail
          boards={boards}
          stars={stars}
          selectedBoards={selectedBoards}
          selectedStars={selectedStars}
          onToggleBoard={toggle(setSelectedBoards)}
          onToggleStar={toggle(setSelectedStars)}
        />
      </aside>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
          <p className="st-lede" style={{ fontSize: 14 }}>
            <strong style={{ color: 'var(--st-ink)', fontWeight: 700 }}>{shown.length}</strong> oferta të gjetura
          </p>
          <SortControl options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} />
        </div>

        <div className="st-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {shown.map((o, i) => (
            <Reveal key={o.id} index={Math.min(i, 8)} step={45}>
              <OfferCard offer={o} tag={o.price === minPrice ? 'Çmimi më i mirë' : undefined} />
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}
