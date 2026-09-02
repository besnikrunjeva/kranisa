import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext.jsx'
import SearchForm from '../components/SearchForm.jsx'
import OfferList from '../components/OfferList.jsx'
import OfferCard from '../components/OfferCard.jsx'
import OfferCardSkeleton from '../components/OfferCardSkeleton.jsx'
import OffersBrowser from '../components/OffersBrowser.jsx'
import { Button } from '../components/ui/button.tsx'
import { ProgressBar } from '../components/ui/progress-bar.tsx'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '../components/ui/empty.tsx'
import { searchOffers } from '../api/offers.js'

export default function ResultsPage () {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const destinationId = Number(searchParams.get('destinationId')) || ''
  const dateFrom = searchParams.get('dateFrom') || ''
  const dateTo = searchParams.get('dateTo') || ''

  const [offers, setOffers] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retryKey, setRetryKey] = useState(0)
  const [alternativeOffers, setAlternativeOffers] = useState(null)
  const [alternativesLoading, setAlternativesLoading] = useState(false)

  useEffect(() => {
    if (!destinationId || !dateFrom || !dateTo) {
      setOffers(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    setAlternativeOffers(null)
    searchOffers({ destinationId, dateFrom, dateTo, people: 2 })
      .then(setOffers)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [destinationId, dateFrom, dateTo, retryKey])

  // The inventory is small enough that an exact date match often doesn't
  // exist — when it doesn't, show what's actually available for the
  // destination instead of leaving the visitor to guess dates blind.
  useEffect(() => {
    if (loading || error || offers === null || offers.length > 0) {
      setAlternativeOffers(null)
      return
    }
    let cancelled = false
    setAlternativesLoading(true)
    searchOffers({ destinationId, people: 2 })
      .then(result => { if (!cancelled) setAlternativeOffers(result) })
      .catch(() => { if (!cancelled) setAlternativeOffers([]) })
      .finally(() => { if (!cancelled) setAlternativesLoading(false) })
    return () => { cancelled = true }
  }, [offers, loading, error, destinationId])

  function handleSearch (params) {
    const query = new URLSearchParams({
      destinationId: params.destinationId,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo
    })
    navigate(`/rezultatet?${query.toString()}`)
    return Promise.resolve()
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <SearchForm
          onSearch={handleSearch}
          initialDestinationId={destinationId}
          initialDateFrom={dateFrom}
          initialDateTo={dateTo}
        />

        <div className="mt-10">
          {loading && (
            <div className="flex flex-col gap-6">
              <ProgressBar
                value={null}
                label={t('results.searching')}
                pendingLabel={t('results.searching')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
                <OfferCardSkeleton />
                <OfferCardSkeleton />
                <OfferCardSkeleton />
              </div>
            </div>
          )}

          {!loading && error && (
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
          )}

          {!loading && !error && offers !== null && offers.length > 0 && (
            <OffersBrowser offers={offers} />
          )}

          {!loading && !error && offers !== null && offers.length === 0 && (
            <div className="flex flex-col gap-6">
              <OfferList offers={offers} />

              {alternativesLoading && (
                <ProgressBar value={null} label={t('results.searching')} pendingLabel={t('results.searching')} />
              )}

              {!alternativesLoading && alternativeOffers && alternativeOffers.length > 0 && (
                <div className="flex flex-col gap-3.5">
                  <p className="font-heading text-lg font-semibold text-ink">
                    {t('results.alternativesTitle')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
                    {alternativeOffers.map(offer => (
                      <OfferCard key={offer.id} offer={offer} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
