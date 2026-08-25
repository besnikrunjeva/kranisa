import { useI18n } from '../i18n/I18nContext.jsx'

const INK = '#6B3A1E'

export default function EmptyState () {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center text-center py-16 border" style={{ borderColor: INK }}>
      <p className="text-sm text-[#6B6B6B] max-w-xs">{t('results.empty')}</p>
    </div>
  )
}
