import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { listPopularDestinations } from '../api/destinations.js'
import { DestinationCard } from './ui/destination-card.jsx'

export default function PopularDestinations ({ onSelect }) {
  const { t } = useI18n()
  const [destinations, setDestinations] = useState([])

  useEffect(() => {
    listPopularDestinations(6).then(setDestinations).catch(() => {})
  }, [])

  if (destinations.length === 0) return null

  return (
    <section className="relative z-0 max-w-6xl mx-auto px-6 pt-24 pb-4">
      <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-[-0.015em] text-ink text-balance">
        {t('destinations.title')}
      </h2>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {destinations.map((d, i) => {
          const [city, country] = d.name.split(', ')
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(d.id)}
              style={{ animationDelay: `${i * 50}ms` }}
              className="card-rise block w-full aspect-[3/4] rounded-xl border-0 bg-transparent p-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            >
              <DestinationCard
                imageUrl={`https://picsum.photos/seed/kranisa-dest-${d.id}/500/650`}
                category={country || ''}
                title={city || d.name}
              />
            </button>
          )
        })}
      </div>
    </section>
  )
}
