import { Check } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext.jsx'

function Point ({ children, tone = 'primary' }) {
  return (
    <div className="flex items-center gap-3">
      <Check
        className={`h-5 w-5 shrink-0 rounded-full p-1 ${tone === 'primary' ? 'bg-primary text-primary-ink' : 'bg-secondary text-secondary-ink'}`}
      />
      <p className="font-body text-[14.5px] text-ink">{children}</p>
    </div>
  )
}

function Group ({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-base font-semibold text-ink">{title}</h3>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  )
}

// Adapted from 21st.dev's "Compare 2" (designali-in) into an honest
// Kranisa-vs-direct-agency pitch — the right column isn't a strawman, it
// lists real reasons someone might skip comparing and go straight to an
// agency they already trust.
export default function CompareSection () {
  const { t } = useI18n()

  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <p className="font-body text-[0.7rem] uppercase tracking-[0.2em] text-accent-foreground font-bold mb-3">
          {t('compare.subtitle')}
        </p>
        <h2 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-ink text-balance">
          {t('compare.title')}
        </h2>
        <p className="font-body text-[15px] text-muted-2 mt-3">
          {t('compare.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h3 className="font-heading text-xl font-bold text-ink mb-8">{t('compare.kranisa.heading')}</h3>
          <div className="flex flex-col gap-7">
            <Group title={t('compare.kranisa.group1.title')}>
              <Point>{t('compare.kranisa.group1.point1')}</Point>
              <Point>{t('compare.kranisa.group1.point2')}</Point>
              <Point>{t('compare.kranisa.group1.point3')}</Point>
            </Group>
            <Group title={t('compare.kranisa.group2.title')}>
              <Point>{t('compare.kranisa.group2.point1')}</Point>
              <Point>{t('compare.kranisa.group2.point2')}</Point>
              <Point>{t('compare.kranisa.group2.point3')}</Point>
            </Group>
            <Group title={t('compare.kranisa.group3.title')}>
              <Point>{t('compare.kranisa.group3.point1')}</Point>
              <Point>{t('compare.kranisa.group3.point2')}</Point>
            </Group>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface-2 p-8">
          <h3 className="font-heading text-xl font-bold text-ink mb-8">{t('compare.agency.heading')}</h3>
          <div className="flex flex-col gap-7">
            <Group title={t('compare.agency.group1.title')}>
              <Point tone="secondary">{t('compare.agency.group1.point1')}</Point>
              <Point tone="secondary">{t('compare.agency.group1.point2')}</Point>
            </Group>
            <Group title={t('compare.agency.group2.title')}>
              <Point tone="secondary">{t('compare.agency.group2.point1')}</Point>
              <Point tone="secondary">{t('compare.agency.group2.point2')}</Point>
            </Group>
          </div>
        </div>
      </div>
    </section>
  )
}
