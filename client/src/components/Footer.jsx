import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'

const CONTACT_EMAIL = 'hello@kranisa.al'

export default function Footer () {
  const { t } = useI18n()

  return (
    <footer className="mt-24 border-t border-[#EBE0D0] bg-[#FAFAF8]">
      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between gap-8">
        <div className="max-w-xs">
          <p className="font-wordmark text-lg text-[#0A0A0A]">kranisa</p>
          <p className="font-body text-sm text-[#6B6B6B] mt-2">{t('footer.tagline')}</p>
        </div>

        <div className="flex gap-16">
          <div>
            <p className="font-body text-xs uppercase tracking-wide text-[#767676] mb-2">{t('footer.nav')}</p>
            <Link to="/" className="font-body block text-sm text-[#241A12] hover:opacity-70">{t('app.title')}</Link>
            <Link to="/admin/login" className="font-body block text-sm text-[#241A12] hover:opacity-70 mt-1.5">{t('nav.admin')}</Link>
          </div>
          <div>
            <p className="font-body text-xs uppercase tracking-wide text-[#767676] mb-2">{t('footer.contact')}</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-body block text-sm text-[#241A12] hover:opacity-70">{CONTACT_EMAIL}</a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-8">
        <p className="font-body text-xs text-[#9A9184]">Kranisa, {new Date().getFullYear()}. {t('footer.rights')}</p>
      </div>
    </footer>
  )
}
