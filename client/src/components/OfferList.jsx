import { useI18n } from '../i18n/I18nContext.jsx'
import OfferCard from './OfferCard.jsx'
import EmptyState from './EmptyState.jsx'

function formatUpdatedTime (offers, lang) {
  const latest = offers.reduce((max, o) => {
    const t = new Date(o.updated_at).getTime()
    return t > max ? t : max
  }, 0)
  if (!latest) return null
  return new Date(latest).toLocaleTimeString(lang === 'sq' ? 'sq-AL' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// scrollable: when true, the count line stays put and only the card grid
// below it scrolls, inside a parent that constrains this component's height
// (see OffersBrowser's scrollableList prop).
export default function OfferList ({ offers, sortLabel, scrollable = false }) {
  const { t, lang } = useI18n()

  if (offers.length === 0) return <EmptyState />

  const updatedTime = formatUpdatedTime(offers, lang)
  const minPrice = Math.min(...offers.map(o => Number(o.price_per_person)))

  const grid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
      {offers.map((offer, i) => (
        <div key={offer.id} className="card-rise h-full" style={{ animationDelay: `${Math.min(i, 6) * 40}ms` }}>
          <OfferCard offer={offer} isBestPrice={Number(offer.price_per_person) === minPrice} />
        </div>
      ))}
    </div>
  )

  return (
    <div className={`flex flex-col gap-4 ${scrollable ? 'lg:h-full lg:min-h-0' : ''}`}>
      <div className="font-body flex justify-between items-baseline text-[12.5px] font-semibold text-muted-2 shrink-0">
        <span><strong className="font-heading text-ink">{offers.length}</strong> {t('results.count')}</span>
        <span>{sortLabel || t('results.sortedByPrice')}{updatedTime ? ` · ${t('results.updated')} ${updatedTime}` : ''}</span>
      </div>
      {scrollable
        ? <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:-mr-1 lg:pr-1 pb-1">{grid}</div>
        : grid}
    </div>
  )
}
