import { useI18n } from '../i18n/I18nContext.jsx'
import OfferCard from './OfferCard.jsx'
import EmptyState from './EmptyState.jsx'

export default function OfferList ({ offers }) {
  const { t } = useI18n()

  if (offers.length === 0) return <EmptyState />

  return (
    <div className="flex flex-col gap-3 mt-8">
      <div className="flex justify-between items-baseline text-sm text-[#6B6B6B] mb-1">
        <span><strong className="text-[#241A12]">{offers.length}</strong> {t('results.count')}</span>
        <span>{t('results.sortedByPrice')}</span>
      </div>
      {offers.map((offer, index) => (
        <OfferCard key={offer.id} offer={offer} isBestPrice={index === 0} />
      ))}
    </div>
  )
}
