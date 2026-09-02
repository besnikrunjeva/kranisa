import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { pickDestination, freshLabel } from './liveOffers.js'

const T = {
  sq: { from: 'nga', offers: n => `${n} oferta aktive`, one: '1 ofertë aktive', cta: 'Shiko ofertat', none: 'Ende s’ka oferta aktive', browse: 'Shfleto të gjitha' },
  en: { from: 'from', offers: n => `${n} live offers`, one: '1 live offer', cta: 'See offers', none: 'No live offers yet', browse: 'Browse all' }
}

// A live price/availability chip for one destination. Every number comes from
// the current inventory — nothing is baked into the post. Gracefully degrades
// to a neutral browse link when a destination has no active offers.
export default function LiveOfferTag ({ name, byCity, loading, lang = 'sq' }) {
  const t = T[lang] || T.sq
  const agg = pickDestination(byCity, name)

  if (loading) {
    return <span className="bl-livetag bl-livetag--loading" aria-hidden="true" />
  }

  if (!agg || agg.minPrice == null) {
    return (
      <Link to="/ofertat" className="bl-livetag bl-livetag--empty">
        <span>{t.none}</span>
        <span className="bl-livetag__cta">{t.browse} <ArrowRight size={13} /></span>
      </Link>
    )
  }

  const fresh = freshLabel(agg.freshestHours, lang)
  return (
    <Link to={`/rezultatet?destinationId=${agg.destinationId}`} className="bl-livetag">
      <span className="bl-livetag__price">{t.from} {agg.currency}{agg.minPrice}</span>
      <span className="bl-livetag__meta">
        {agg.count === 1 ? t.one : t.offers(agg.count)}{fresh ? ` · ${fresh}` : ''}
      </span>
      <span className="bl-livetag__cta">{t.cta} <ArrowRight size={13} /></span>
    </Link>
  )
}
