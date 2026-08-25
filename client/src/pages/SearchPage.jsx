import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import AsciiTerrain from '../components/AsciiTerrain.jsx'
import SearchForm from '../components/SearchForm.jsx'
import OfferList from '../components/OfferList.jsx'
import PopularDestinations from '../components/PopularDestinations.jsx'
import HowItWorks from '../components/HowItWorks.jsx'
import WhyKranisa from '../components/WhyKranisa.jsx'
import FAQSection from '../components/FAQSection.jsx'
import AgencyCTA from '../components/AgencyCTA.jsx'
import Footer from '../components/Footer.jsx'
import { searchOffers } from '../api/offers.js'

export default function SearchPage () {
  const { t, lang } = useI18n()
  const [offers, setOffers] = useState(null)
  const [error, setError] = useState(null)

  async function handleSearch (params) {
    setError(null)
    try {
      const results = await searchOffers(params)
      setOffers(results)
    } catch (err) {
      setError(err.message)
      setOffers(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <AsciiTerrain className="fixed inset-0 z-0" />

      <div className="relative z-10">
      <div className="hero-glow relative">
        <div className="relative max-w-3xl mx-auto px-6 pt-6 pb-20">
          <div className="flex justify-between items-center">
            <p className="font-wordmark text-[1.7rem] text-[#0A0A0A]">kranisa</p>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Link
                to="/admin/login"
                className="font-body flex items-center gap-2 rounded-full bg-[#0A0A0A] py-2.5 pl-4 pr-2.5 text-[13px] font-medium uppercase tracking-[0.04em] text-white transition-colors hover:bg-[#241A12]"
              >
                {t('nav.admin')}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E0945C] text-[#0A0A0A]">
                  &rarr;
                </span>
              </Link>
            </div>
          </div>

          <div className="text-center mt-16 mb-10 -mx-6 sm:-mx-20">
            <p
              className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-[#905831] font-semibold mb-4 hero-rise"
              style={{ animationDelay: '0ms' }}
            >
              {t('hero.eyebrow')}
            </p>
            <h1
              className="font-body text-5xl sm:text-6xl font-semibold tracking-[-0.03em] text-[#0A0A0A] leading-[1.03] text-balance hero-rise"
              style={{ animationDelay: '90ms' }}
            >
              {t('hero.headline').split('\n').map((line, i) => (
                <span key={i} className={i > 0 ? 'block mt-1' : 'block'}>
                  {i > 0 ? <span className="marker-highlight">{line}</span> : line}
                </span>
              ))}
            </h1>
            {lang !== 'en' && (
              <p className="font-body text-base text-[#767676] mt-5 hero-rise" style={{ animationDelay: '260ms' }}>
                {t('hero.headlineEn')}
              </p>
            )}
          </div>

          <SearchForm onSearch={handleSearch} />
          {error && <div className="font-body text-red-600 text-sm mt-4 text-center">{error}</div>}

          <p className="font-body text-center text-[13px] text-[#767676] mt-6 hero-rise" style={{ animationDelay: '440ms' }}>
            {t('hero.trust')}
          </p>
        </div>
      </div>

      <div className="relative bg-[#FAFAF8]">
        <PopularDestinations />

        {offers !== null && (
          <div className="mt-12 px-6 pb-16 pt-10">
            <div className="max-w-3xl mx-auto">
              <OfferList offers={offers} />
            </div>
          </div>
        )}

        <HowItWorks />
        <WhyKranisa />
        <FAQSection />
        <AgencyCTA />
        <Footer />
      </div>
      </div>
    </div>
  )
}
