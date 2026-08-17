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
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="flex justify-between items-center py-6">
          <p className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            Kran<span className="text-[#C81E3A]">isa</span>
          </p>
          <div className="flex items-center gap-5">
            <LanguageToggle />
            <Link to="/admin/login" className="text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A]">
              Admin
            </Link>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-[0.68rem] uppercase tracking-widest text-[#C81E3A] font-bold mb-3">
            {t('hero.eyebrow')}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1A1A] leading-tight whitespace-pre-line">
            {t('hero.headline')}
          </h1>
          {lang !== 'en' && (
            <p className="text-sm text-[#6B6B6B] mt-3">{t('hero.headlineEn')}</p>
          )}
        </div>

        <SearchForm onSearch={handleSearch} />
        {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
        {offers !== null && <OfferList offers={offers} />}
      </div>
    </div>
  )
}
