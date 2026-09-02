import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import SearchForm from '../components/SearchForm.jsx'
import PopularDestinations from '../components/PopularDestinations.jsx'
import CompareSection from '../components/CompareSection.jsx'
import NewestOffers from '../components/NewestOffers.jsx'
import HeroGlobe from '../components/HeroGlobe.jsx'
import FAQ from '../components/FAQ.jsx'

export default function SearchPage () {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [pickedDestinationId, setPickedDestinationId] = useState('')
  const searchFormRef = useRef(null)

  function handleDestinationPick (destinationId) {
    setPickedDestinationId(destinationId)
    searchFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

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
      <div className="relative z-10">
        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-8">
          <div className="relative flex items-center gap-8 mt-16">
            <div className="relative max-w-3xl">
              <p
                className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-accent-foreground font-bold mb-5 hero-rise"
                style={{ animationDelay: '0ms' }}
              >
                {t('hero.eyebrow')}
              </p>
              <h1
                className="font-heading text-5xl sm:text-6xl font-semibold tracking-[-0.02em] text-ink leading-[1.08] text-balance hero-rise"
                style={{ animationDelay: '90ms' }}
              >
                {t('hero.headline').split('\n').map((line, i) => (
                  <span key={i} className={i > 0 ? 'block mt-1' : 'block'}>
                    {i > 0 ? <span className="text-primary italic">{line}</span> : line}
                  </span>
                ))}
              </h1>
              <p className="font-body text-[17px] font-bold text-ink/75 mt-5 max-w-md hero-rise" style={{ animationDelay: '260ms' }}>
                {t('hero.subhead')}
              </p>
              <p className="font-body text-[13px] font-semibold text-muted-2 mt-6 hero-rise" style={{ animationDelay: '440ms' }}>
                {t('hero.trust')}
              </p>
              <Link
                to="/ofertat"
                className="font-body inline-block text-[13px] font-bold text-primary hover:text-[#2563eb] mt-3 hero-rise"
                style={{ animationDelay: '560ms' }}
              >
                {t('hero.viewAllOffers')} →
              </Link>
            </div>

            <div className="hidden lg:block shrink-0 w-[420px]">
              <HeroGlobe />
            </div>
          </div>

          <div ref={searchFormRef} className="relative mt-10 pb-10 lg:pb-0 scroll-mt-24">
            <div className="lg:translate-y-14">
              <SearchForm onSearch={handleSearch} initialDestinationId={pickedDestinationId} />
            </div>
          </div>
        </div>
      </div>

      <PopularDestinations onSelect={handleDestinationPick} />

      <CompareSection />

      <NewestOffers />

      <FAQ />
    </div>
  )
}
