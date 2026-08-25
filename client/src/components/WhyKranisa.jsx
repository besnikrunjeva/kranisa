import { useI18n } from '../i18n/I18nContext.jsx'

const INK = '#6B3A1E'
const POINT_KEYS = ['1', '2', '3', '4']

export default function WhyKranisa () {
  const { t } = useI18n()

  return (
    <div className="font-mono max-w-4xl mx-auto px-6 mt-16">
      <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-xs uppercase tracking-wide" style={{ color: INK }}>
        {POINT_KEYS.map((key, i) => (
          <span key={key} className="flex items-center gap-6">
            <span>{t(`why.point${key}`)}</span>
            {i < POINT_KEYS.length - 1 && <span className="opacity-40">/</span>}
          </span>
        ))}
      </div>
    </div>
  )
}
