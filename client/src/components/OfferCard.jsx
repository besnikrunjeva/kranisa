import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { Card, CardContent, CardFooter } from './ui/card.tsx'
import { Badge } from './ui/badge.tsx'
import { offerImageUrl } from '../lib/offerImage.js'

function formatShort (isoDate) {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function Star ({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#3b82f6' : 'none'} stroke="#3b82f6" strokeWidth="1.5">
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z" />
    </svg>
  )
}

export default function OfferCard ({ offer, isBestPrice = false }) {
  const { t } = useI18n()

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-[18px] border-0 shadow-[0_8px_24px_rgba(51,51,51,0.08)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(51,51,51,0.14)]">
      <Link
        to={`/oferta/${offer.id}`}
        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img
            src={offerImageUrl(offer)}
            alt={offer.destination_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isBestPrice && (
            <Badge className="absolute top-2.5 left-2.5 rounded-full bg-primary px-2.5 py-0.5 font-body text-[10.5px] font-extrabold uppercase tracking-[0.05em] text-primary-ink border-0">
              {t('offer.bestPrice')}
            </Badge>
          )}
        </div>

        <CardContent className="p-4 pb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body text-[12px] font-bold text-muted-2">{offer.agency_name}</span>
            {offer.star_rating && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => <Star key={i} filled={i < offer.star_rating} />)}
              </span>
            )}
          </div>
          <h3 className="font-heading text-lg font-semibold text-ink mt-1 truncate">{offer.destination_name}</h3>
          <p className="font-body text-[12.5px] font-semibold text-muted-2 mt-1">
            {offer.board_type} · {offer.nights} {t('offer.nights')} · {formatShort(offer.start_date)}–{formatShort(offer.end_date)}
          </p>
        </CardContent>
      </Link>

      <CardFooter className="mt-auto flex items-center justify-between gap-2 p-4 pt-2">
        <div>
          <div className="font-heading text-lg font-bold text-primary tabular-nums leading-tight">
            {Number(offer.price_per_person).toFixed(0)} {offer.currency}
          </div>
          <div className="font-body text-[11px] text-muted-2">{t('offer.perPerson')}</div>
        </div>
        <a
          href={offer.external_link}
          target="_blank"
          rel="noreferrer"
          className="font-body text-[12.5px] font-bold text-primary-ink bg-primary hover:bg-[#2563eb] rounded-full px-3.5 py-1.5 transition-colors shrink-0"
        >
          {t('offer.viewOffer')}
        </a>
      </CardFooter>
    </Card>
  )
}
