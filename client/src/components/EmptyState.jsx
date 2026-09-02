import { SearchX } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from './ui/empty.tsx'

export default function EmptyState () {
  const { t } = useI18n()
  return (
    <Empty className="bg-card rounded-xl shadow-lg">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX className="text-muted-foreground" />
        </EmptyMedia>
        <EmptyTitle>{t('results.emptyTitle')}</EmptyTitle>
        <EmptyDescription>{t('results.empty')}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
