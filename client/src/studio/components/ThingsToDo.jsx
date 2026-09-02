import { Compass, ArrowUpRight } from 'lucide-react'
import { gygLink, hasGygLocation } from '../affiliates/gyg.js'
import GygWidget from './GygWidget.jsx'

// GetYourGuide "things to do" for a destination.
// - Full section (light pages): GetYourGuide's real activities widget.
// - Compact (dark Planner): a tracked link, since the light widget would
//   clash with the dark theme.
export default function ThingsToDo ({ city, country, compact = false }) {
  if (!city) return null
  const query = country ? `${city}, ${country}` : city

  if (compact) {
    const located = hasGygLocation(city)
    return (
      <div className="ttd ttd--compact">
        <a href={gygLink(city)} target="_blank" rel="sponsored noopener noreferrer" className="ttd__cta">
          <Compass size={16} className="ttd__icon" />
          <span>{located ? `Përjetime në ${city}` : 'Aktivitete & turne'} · GetYourGuide</span>
          <ArrowUpRight size={15} className="ttd__ext" />
        </a>
        <p className="ttd__disclosure">Lidhje e sponsorizuar.</p>
      </div>
    )
  }

  return (
    <section className="ttd">
      <div className="ttd__head">
        <p className="st-eyebrow">Përjetime · GetYourGuide</p>
        <h2 className="st-h2">Gjëra për të bërë në {city}</h2>
      </div>

      <GygWidget query={query} cmp={city} items={4} />
    </section>
  )
}
