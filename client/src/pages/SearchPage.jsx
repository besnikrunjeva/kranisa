import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import LanguageToggle from '../components/LanguageToggle.jsx'
import SearchForm from '../components/SearchForm.jsx'
import OfferList from '../components/OfferList.jsx'
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
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <div className="flex justify-between items-center">
          <p className="font-heading text-2xl font-black tracking-tight text-[#1A1A1A]">
            Kran<span className="ml-0.5 rounded-md bg-[#C81E3A] px-1.5 py-0.5 text-white">isa</span>
          </p>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-[#F4F4F4] px-3 py-2">
              <LanguageToggle />
            </div>
            <Link
              to="/admin/login"
              className="flex items-center gap-2 rounded-full bg-[#1A1A1A] py-2 pl-4 pr-2 text-xs font-semibold text-white"
            >
              Admin
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#1A1A1A]">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        <div className="text-center mt-10 mb-8">
          <p className="text-[0.68rem] uppercase tracking-widest text-[#C81E3A] font-bold mb-3">
            {t('hero.eyebrow')}
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-[#1A1A1A] leading-[0.95] whitespace-pre-line">
            {t('hero.headline')}
          </h1>
          {lang !== 'en' && (
            <p className="text-sm text-[#6B6B6B] mt-4">{t('hero.headlineEn')}</p>
          )}
        </div>

        <SearchForm onSearch={handleSearch} />
        {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
      </div>

      {offers !== null && (
        <div className="mt-12 rounded-t-[40px] bg-[#FAFAFA] px-6 pb-16 pt-10">
          <div className="max-w-3xl mx-auto">
            <OfferList offers={offers} />
          </div>
        </div>
      )}
    </div>
  )
}
