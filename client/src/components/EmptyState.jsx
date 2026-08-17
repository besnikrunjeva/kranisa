import { useI18n } from '../i18n/I18nContext.jsx'

export default function EmptyState () {
  const { t } = useI18n()
  return (
    <div className="text-center text-[#6B6B6B] py-16">
      {t('results.empty')}
    </div>
  )
}
