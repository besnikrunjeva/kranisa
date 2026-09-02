import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext.jsx'
import OfferCardSkeleton from '../components/OfferCardSkeleton.jsx'
import { useOffersBrowser, OffersControls, OffersGrid } from '../components/OffersBrowser.jsx'
import { Button } from '../components/ui/button.tsx'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '../components/ui/empty.tsx'
import { listAllOffers } from '../api/offers.js'

function PageTitle ({ className = '' }) {
  const { t } = useI18n()
  return (
    <h1 className={`font-heading text-3xl font-semibold tracking-[-0.02em] text-ink text-balance ${className}`}>
      {t('allOffers.title')}
    </h1>
  )
}

// Title + controls share one sticky wrapper so they stay pinned together at
// the top as the offer grid scrolls beneath them (matters most on mobile,
// where the whole page scrolls — see OffersGrid's scrollableList for the
// lg+ behavior, where this area never needed to stick since it already sits
// outside the internally-scrolling grid).
function OffersSection ({ offers }) {
  const browser = useOffersBrowser(offers)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  return (
    <>
      <div className="sticky top-0 z-10 shrink-0 bg-bg pb-4">
        <PageTitle className="mb-4" />
        <OffersControls
          browser={browser}
          mobileFiltersOpen={mobileFiltersOpen}
          onToggleMobileFilters={() => setMobileFiltersOpen(v => !v)}
        />
      </div>

      <OffersGrid browser={browser} mobileFiltersOpen={mobileFiltersOpen} scrollableList />
    </>
  )
}

export default function AllOffersPage () {
  const { t } = useI18n()

  const [offers, setOffers] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    setLoading(true)
    setError(null)
    listAllOffers()
      .then(setOffers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [retryKey])

  return (
    <div className="min-h-screen lg:h-[calc(100vh-5.5rem)] flex flex-col lg:overflow-hidden bg-bg">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col flex-1 lg:min-h-0 w-full">
        {loading && (
          <>
            <PageTitle className="mb-8 shrink-0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
              <OfferCardSkeleton />
              <OfferCardSkeleton />
              <OfferCardSkeleton />
            </div>
          </>
        )}

        {!loading && error && (
          <>
            <PageTitle className="mb-8 shrink-0" />
            <Empty className="bg-card rounded-xl shadow-lg">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AlertTriangle className="text-destructive" />
                </EmptyMedia>
                <EmptyTitle>{t('results.errorTitle')}</EmptyTitle>
                <EmptyDescription>{error}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setRetryKey(k => k + 1)} className="rounded-full">
                  {t('results.retry')}
                </Button>
              </EmptyContent>
            </Empty>
          </>
        )}

        {!loading && !error && offers && <OffersSection offers={offers} />}
      </div>
    </div>
  )
}
