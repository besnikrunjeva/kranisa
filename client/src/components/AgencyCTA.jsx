import { useI18n } from '../i18n/I18nContext.jsx'

const INK = '#6B3A1E'
const CONTACT_EMAIL = 'hello@kranisa.al'

export default function AgencyCTA () {
  const { t } = useI18n()

  return (
    <div className="max-w-4xl mx-auto px-6 mt-20">
      <div className="flex flex-col items-center text-center border px-6 py-10 sm:px-10" style={{ borderColor: INK }}>
        <div>
          <p className="font-body text-xl font-semibold text-[#241A12]">{t('agency.headline')}</p>
          <p className="font-body text-sm text-[#6B6B6B] mt-2 max-w-sm">{t('agency.body')}</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-block mt-4 bg-[#0A0A0A] text-white rounded-full font-body font-medium text-sm py-2.5 px-5 hover:bg-[#241A12] transition-colors"
          >
            {t('agency.cta')}
          </a>
        </div>
      </div>
    </div>
  )
}
