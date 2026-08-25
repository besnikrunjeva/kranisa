import { useI18n } from '../i18n/I18nContext.jsx'

const INK = '#6B3A1E'

function initials (name) {
  return name
    .split(/\s+/)
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function OfferCard ({ offer, isBestPrice = false }) {
  const { t } = useI18n()

  return (
    <div
      className="font-mono relative flex items-center gap-4 bg-[#FDF9F2] border rounded-none px-4 py-4"
      style={{ borderColor: INK, borderWidth: 1 }}
    >
      {isBestPrice && (
        <span
          className="absolute -top-[11px] left-4 bg-[#FDF9F2] px-1.5 text-[0.65rem] font-bold uppercase tracking-wide"
          style={{ color: INK }}
        >
          {t('offer.bestPrice')}
        </span>
      )}

      <div
        className="w-10 h-10 flex items-center justify-center font-bold text-sm shrink-0 border"
        style={{ borderColor: INK, color: INK }}
      >
        {initials(offer.agency_name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[0.68rem] uppercase tracking-wide font-bold" style={{ color: INK }}>{offer.agency_name}</div>
        <div className="text-base font-bold text-[#241A12] mt-0.5">{offer.destination_name}</div>
        <div className="text-sm text-[#6B6B6B] mt-0.5">
          {offer.board_type} · {offer.star_rating ? `${offer.star_rating}★ · ` : ''}{offer.nights} {t('offer.nights')}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-lg font-bold text-[#241A12] tabular-nums">
          {Number(offer.price_per_person).toFixed(0)} {offer.currency}
        </div>
        <div className="text-[0.68rem] text-[#6B6B6B]">{t('offer.perPerson')}</div>
        <a
          href={offer.external_link}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-2 text-xs font-bold hover:underline"
          style={{ color: INK }}
        >
          {t('offer.viewOffer')} -&gt;
        </a>
      </div>
    </div>
  )
}
