import { useI18n } from '../i18n/I18nContext.jsx'

const INK = '#6B3A1E'
const STEP_KEYS = ['1', '2', '3']

export default function HowItWorks () {
  const { t } = useI18n()

  return (
    <div className="font-mono max-w-4xl mx-auto px-6 mt-20">
      <h2 className="font-body text-2xl sm:text-3xl font-semibold text-[#241A12] mb-10 max-w-md">
        {t('how.headline')}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-b" style={{ borderColor: INK }}>
        {STEP_KEYS.map((key, i) => (
          <div
            key={key}
            className={`px-2 py-6 sm:px-6 ${i > 0 ? 'sm:border-l border-t sm:border-t-0' : ''}`}
            style={{ borderColor: INK }}
          >
            <span className="text-3xl font-semibold" style={{ color: INK }}>{key}</span>
            <p className="font-body text-base font-semibold text-[#241A12] mt-3">{t(`how.step${key}.title`)}</p>
            <p className="font-body text-sm text-[#6B6B6B] mt-1">{t(`how.step${key}.body`)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
