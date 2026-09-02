import { useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'

// Placeholder trips — sample data + stock photos to test the card UI.
// Not wired to the API; swap for real "newest offers" data once that
// endpoint/sort exists on the backend.
const PLACEHOLDER_TRIPS = [
  { id: 'ph1', destination: 'Antalya, Turqi', agency: 'Prima Travel', board: 'All Inclusive', nights: 7, price: 459, currency: '€', image: 'https://picsum.photos/seed/antalya-kranisa/480/360' },
  { id: 'ph2', destination: 'Bodrum, Turqi', agency: 'Balkan Voyage', board: 'All Inclusive', nights: 7, price: 489, currency: '€', image: 'https://picsum.photos/seed/bodrum-kranisa/480/360' },
  { id: 'ph3', destination: 'Dubrovnik, Kroaci', agency: 'Riviera Tours', board: 'Mëngjes', nights: 5, price: 379, currency: '€', image: 'https://picsum.photos/seed/dubrovnik-kranisa/480/360' },
  { id: 'ph4', destination: 'Kretë, Greqi', agency: 'Sunny Days Travel', board: 'All Inclusive', nights: 7, price: 429, currency: '€', image: 'https://picsum.photos/seed/crete-kranisa/480/360' },
  { id: 'ph5', destination: 'Santorini, Greqi', agency: 'Blue Coast Travel', board: 'Mëngjes', nights: 4, price: 349, currency: '€', image: 'https://picsum.photos/seed/santorini-kranisa/480/360' },
  { id: 'ph6', destination: 'Hurghada, Egjipt', agency: 'Nova Travel', board: 'Ultra All Inclusive', nights: 7, price: 512, currency: '€', image: 'https://picsum.photos/seed/hurghada-kranisa/480/360' },
  { id: 'ph7', destination: 'Vlorë, Shqipëri', agency: 'Tirana Express', board: 'Vetëmëngjes', nights: 3, price: 149, currency: '€', image: 'https://picsum.photos/seed/vlore-kranisa/480/360' }
]

function HeartIcon ({ filled, className }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#3b82f6' : 'none'} stroke={filled ? '#3b82f6' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

function ChevronIcon ({ direction }) {
  const d = direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

function TripCard ({ trip }) {
  const { t } = useI18n()
  const [liked, setLiked] = useState(false)

  return (
    <div className="w-[240px] sm:w-[260px] flex-none snap-start">
      <div className="bg-surface rounded-[18px] shadow-[0_8px_24px_rgba(51,51,51,0.08)] overflow-hidden">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <img src={trip.image} alt={trip.destination} className="h-full w-full object-cover" loading="lazy" />
          <span className="absolute top-2.5 left-2.5 font-body text-[10.5px] font-extrabold uppercase tracking-[0.05em] bg-surface/90 text-[#1e3a8a] rounded-full px-2.5 py-1">
            {t('newest.badge')}
          </span>
          <button
            type="button"
            onClick={() => setLiked(v => !v)}
            aria-label="Ruaj ofertën"
            className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-surface/85 text-ink backdrop-blur-sm after:absolute after:-inset-1.5 after:content-['']"
          >
            <HeartIcon filled={liked} className={liked ? 'heart-pop' : undefined} />
          </button>
        </div>

        <div className="p-3.5">
          <div className="font-body text-[11px] font-bold text-muted-2">{trip.agency}</div>
          <div className="font-heading text-[17px] font-semibold text-ink mt-0.5 leading-tight">{trip.destination}</div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="font-body text-[12px] font-semibold text-muted-2">{trip.board} · {trip.nights} {t('offer.nights')}</span>
          </div>
          <div className="font-heading text-[15px] font-bold text-primary mt-1.5">
            {trip.price} {trip.currency} <span className="font-body text-[11px] font-semibold text-muted-2">/ {t('offer.perPerson')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewestOffers () {
  const { t } = useI18n()
  const scrollRef = useRef(null)

  function scrollBy (delta) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <div className="max-w-5xl mx-auto px-6 pt-6 lg:pt-20 pb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.01em] text-ink">{t('newest.title')}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollBy(-280)}
            aria-label="Lëviz majtas"
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink shadow-[0_2px_8px_rgba(51,51,51,0.08)] hover:bg-surface-2 after:absolute after:-inset-1.5 after:content-['']"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(280)}
            aria-label="Lëviz djathtas"
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-surface text-ink shadow-[0_2px_8px_rgba(51,51,51,0.08)] hover:bg-surface-2 after:absolute after:-inset-1.5 after:content-['']"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1"
      >
        {PLACEHOLDER_TRIPS.map(trip => <TripCard key={trip.id} trip={trip} />)}
      </div>
    </div>
  )
}
