import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Users, UtensilsCrossed, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { Button } from '../components/ui/button.tsx'
import { Card } from '../components/ui/card.tsx'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '../components/ui/empty.tsx'
import { getOffer } from '../api/offers.js'
import { offerImageUrl } from '../lib/offerImage.js'

function formatLong (isoDate, lang) {
  const d = new Date(isoDate)
  return d.toLocaleDateString(lang === 'sq' ? 'sq-AL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Star ({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? '#3b82f6' : 'none'} stroke="#3b82f6" strokeWidth="1.5">
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.9L6 21l1.6-7L2.2 9.2l7.1-.6L12 2z" />
    </svg>
  )
}

function DetailRow ({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-accent-foreground" />
      </div>
      <div>
        <div className="font-body text-[12px] font-semibold uppercase tracking-[0.04em] text-muted-2">{label}</div>
        <div className="font-body text-[15px] font-semibold text-ink mt-0.5">{value}</div>
      </div>
    </div>
  )
}

export default function OfferDetailPage () {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const { id } = useParams()

  const [offer, setOffer] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getOffer(id)
      .then(setOffer)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="font-body flex items-center gap-1.5 text-[13.5px] font-bold text-muted-2 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('offerDetail.back')}
        </button>

        {loading && (
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="w-full aspect-[21/9] rounded-2xl bg-surface-2" />
            <div className="h-8 w-1/3 rounded bg-surface-2" />
          </div>
        )}

        {!loading && (error || !offer) && (
          <Empty className="bg-card rounded-xl shadow-lg">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <AlertTriangle className="text-destructive" />
              </EmptyMedia>
              <EmptyTitle>{t('offerDetail.notFoundTitle')}</EmptyTitle>
              <EmptyDescription>{t('offerDetail.notFoundBody')}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild className="rounded-full">
                <Link to="/">{t('offerDetail.notFoundCta')}</Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}

        {!loading && offer && (
          <>
            <img
              src={offerImageUrl(offer)}
              alt={offer.destination_name}
              className="w-full aspect-[21/9] rounded-2xl object-cover bg-surface-2"
            />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8">
              <div className="flex flex-col gap-8">
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-body text-[13px] font-bold text-muted-2">{offer.agency_name}</span>
                    {offer.star_rating && (
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => <Star key={i} filled={i < offer.star_rating} />)}
                      </span>
                    )}
                  </div>
                  <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-ink mt-1 text-balance">
                    {offer.destination_name}
                  </h1>
                </div>

                <div>
                  <h2 className="font-heading text-lg font-semibold text-ink mb-4">{t('offerDetail.tripDetails')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <DetailRow
                      icon={CalendarDays}
                      label={t('offerDetail.dates')}
                      value={`${formatLong(offer.start_date, lang)} – ${formatLong(offer.end_date, lang)}`}
                    />
                    <DetailRow
                      icon={CalendarDays}
                      label={t('offerDetail.duration')}
                      value={`${offer.nights} ${t('offer.nights')}`}
                    />
                    <DetailRow
                      icon={UtensilsCrossed}
                      label={t('offerDetail.board')}
                      value={offer.board_type}
                    />
                    <DetailRow
                      icon={Users}
                      label={t('offerDetail.capacity')}
                      value={`${t('offerDetail.upTo')} ${offer.capacity} ${t('offerDetail.travelers')}`}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 font-body text-[13px] font-semibold text-accent-foreground bg-accent rounded-full w-fit px-4 py-2">
                  <ShieldCheck className="w-4 h-4" />
                  {t('offerDetail.verified')}
                </div>
              </div>

              <Card className="border-0 rounded-[18px] shadow-[0_8px_24px_rgba(51,51,51,0.08)] p-6 h-fit lg:sticky lg:top-8">
                <div className="font-heading text-3xl font-bold text-primary tabular-nums">
                  {Number(offer.price_per_person).toFixed(0)} {offer.currency}
                </div>
                <div className="font-body text-[13px] text-muted-2 mb-5">{t('offer.perPerson')}</div>

                <Button asChild size="lg" className="w-full rounded-full">
                  <a href={offer.external_link} target="_blank" rel="noreferrer">
                    {t('offerDetail.contactCta')}
                  </a>
                </Button>

                <p className="font-body text-[12px] text-muted-2 mt-4 leading-relaxed">
                  {t('offerDetail.contactNote')}
                </p>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
