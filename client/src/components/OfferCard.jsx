import { useI18n } from '../i18n/I18nContext.jsx'

const MARK_COLORS = [
  { bg: '#C81E3A', text: '#FFFFFF' },
  { bg: '#1F5E4A', text: '#F4FBFA' },
  { bg: '#B8862E', text: '#FFF8EA' }
]

function initials (name) {
  return name
    .split(/\s+/)
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function OfferCard ({ offer, colorIndex = 0, isBestPrice = false }) {
  const { t } = useI18n()
  const mark = MARK_COLORS[colorIndex % MARK_COLORS.length]

  return (
    <div className="relative flex items-center gap-4 bg-white border border-[#E4E4E4] rounded-2xl px-4 py-4">
      {isBestPrice && (
        <span className="font-hand absolute -top-3 left-4 -rotate-3 bg-[#F4B942] text-[#4A3300] text-xs px-3 py-1 rounded-lg shadow-sm">
          {t('offer.bestPrice')}
        </span>
      )}

      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center font-bold text-sm shrink-0"
        style={{ background: mark.bg, color: mark.text }}
      >
        {initials(offer.agency_name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[0.68rem] uppercase tracking-wide text-[#6B6B6B] font-bold">{offer.agency_name}</div>
        <div className="font-heading text-base font-bold text-[#1A1A1A] mt-0.5">{offer.destination_name}</div>
        <div className="text-sm text-[#6B6B6B] mt-0.5">
          {offer.board_type} · {offer.star_rating ? `${offer.star_rating}★ · ` : ''}{offer.nights} {t('offer.nights')}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="font-heading text-lg font-black text-[#1A1A1A] tabular-nums">
          {Number(offer.price_per_person).toFixed(0)} {offer.currency}
        </div>
        <div className="text-[0.68rem] text-[#6B6B6B]">{t('offer.perPerson')}</div>
        <a
          href={offer.external_link}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-2 text-xs font-bold text-[#C81E3A] hover:underline"
        >
          {t('offer.viewOffer')} →
        </a>
      </div>
    </div>
  )
}
