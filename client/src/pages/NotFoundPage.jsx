import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'

const INK = '#6B3A1E'

export default function NotFoundPage () {
  const { t } = useI18n()
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <p className="text-4xl font-semibold" style={{ color: INK }}>404</p>
        <p className="text-lg text-[#241A12] mt-4">{t('notFound.title')}</p>
        <p className="text-sm text-[#6B6B6B] mt-2">{t('notFound.body')}</p>
        <Link
          to="/"
          className="mt-6 bg-[#0A0A0A] text-white rounded-full font-medium text-sm py-2.5 px-5 hover:bg-[#241A12] transition-colors"
        >
          {t('notFound.cta')}
        </Link>
      </div>
    </div>
  )
}
