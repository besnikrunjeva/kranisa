import { Link } from 'react-router-dom'
import { Stars, HeartButton } from './ui.jsx'
import { offerImage } from '../data.js'

export default function OfferCard ({ offer, tag }) {
  const img = offer.image || offerImage(offer.seed)
  const verified = offer.verified || (offer.verifiedHours != null ? `${offer.verifiedHours}h më parë` : null)

  return (
    <Link to={`/oferta/${offer.id}`} className="st-card">
      <div className="st-card__media">
        <img className="st-card__img" src={img} alt={offer.destination} loading="lazy" />
        {tag && <span className="st-tag">{tag}</span>}
        <HeartButton />
      </div>

      <div className="st-card__body">
        <div className="st-card__agency">
          <span>{offer.agency}</span>
          <Stars count={offer.stars} />
        </div>

        <h3 className="st-card__title">{offer.destination}</h3>
        <p className="st-card__meta">{offer.board} · {offer.nights} netë · {offer.from}–{offer.to}</p>

        <div className="st-card__foot">
          <div>
            <div className="st-price st-num">{offer.price} {offer.currency} <small>/ personi</small></div>
            {offer.savings != null && <div className="st-save">−{offer.savings} {offer.currency} vs. direkt</div>}
          </div>
          {verified && <div className="st-verified st-num">verifikuar {verified}</div>}
        </div>
      </div>
    </Link>
  )
}
