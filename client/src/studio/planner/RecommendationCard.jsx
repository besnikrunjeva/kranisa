import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { matchPercent, whyMatch } from './engine.js'
import { destinationPhoto } from '../../lib/destinationPhoto.js'
import { markImgLoaded, onImgLoad } from '../blog/markImgLoaded.js'

// A secondary offer — a compact card in the bento grid beside the main pick.
// A cover photo with the destination + price laid over it; whatever count
// exists (1–4) simply flows in the grid.
export function SecondaryOffer ({ match, index }) {
  return (
    <Link to={`/rezultatet?destinationId=${match.destinationId}`} className="pl-scard" style={{ '--i': index }}>
      <img
        className="pl-scard__img"
        src={destinationPhoto(match.destination, 360, 360)}
        alt={match.destination}
        loading="lazy"
        ref={markImgLoaded}
        onLoad={onImgLoad}
      />
      <div className="pl-scard__body">
        <span className="pl-scard__dest">{match.destination}</span>
        <span className="pl-scard__meta">{match.nights} netë · nga €{match.price}</span>
      </div>
    </Link>
  )
}

// The main pick — a large card with a cover, confidence meter and the CTA.
// Confidence is the engine's own match score; every field is real offer data.
export default function RecommendationCard ({ match, understood }) {
  const pct = matchPercent(0)
  const filled = Math.round(pct / 20) // 0..5 segments
  const level = pct >= 90 ? 'high' : pct >= 80 ? 'good' : 'fair'

  return (
    <div className="pl-rec" data-level={level}>
      <div className="pl-rec__media">
        <img
          className="pl-rec__img"
          src={destinationPhoto(match.destination, 640, 320)}
          alt={match.destination}
          loading="lazy"
          ref={markImgLoaded}
          onLoad={onImgLoad}
        />
        <span className="pl-rec__badge">Sugjerimi im për ty</span>
      </div>

      <div className="pl-rec__head">
        <div>
          <strong className="pl-rec__dest">{match.destination}</strong>
          <span className="pl-rec__country">{match.country}</span>
        </div>
        <span className="pl-rec__price">nga €{match.price}</span>
      </div>

      <div className="pl-rec__meta">{match.nights} netë · {match.board}{match.agency ? ` · ${match.agency}` : ''}</div>

      <div className="pl-rec__conf">
        <div className="pl-rec__bars" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="pl-rec__bar" data-on={i < filled} />
          ))}
        </div>
        <span className="pl-rec__pct">{pct}% përputhje</span>
        <span className="pl-rec__why">{whyMatch(match, understood)}</span>
      </div>

      <div className="pl-rec__actions">
        <Link to={`/rezultatet?destinationId=${match.destinationId}`} className="pl-rec__accept">
          <Check size={15} strokeWidth={2.6} /> Shiko ofertën
        </Link>
      </div>
    </div>
  )
}
