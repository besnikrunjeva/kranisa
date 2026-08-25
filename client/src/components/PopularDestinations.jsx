import { useI18n } from '../i18n/I18nContext.jsx'

const INK = '#6B3A1E'
const PAPER = '#FDF9F2'

// Static for now — matches server/src/db/seed.js. Once destination browsing
// is wired to the API this can come from listDestinations() instead.
const DESTINATIONS = [
  'Antalya, Turkey',
  'Bodrum, Turkey',
  'Sharm El Sheikh, Egypt',
  'Hurghada, Egypt',
  'Rhodes, Greece',
  'Crete, Greece'
]

export default function PopularDestinations () {
  const { t } = useI18n()

  return (
    <div className="font-mono max-w-4xl mx-auto px-6 mt-14">
      <p className="text-xs uppercase tracking-wide mb-3" style={{ color: INK }}>
        {t('destinations.title')}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DESTINATIONS.map((name, i) => {
          const filled = i % 2 === 1
          return (
            <div
              key={name}
              className="px-3 py-3 border transition-colors"
              style={{
                borderColor: INK,
                background: filled ? INK : PAPER
              }}
            >
              <div
                className="text-sm"
                style={{ color: filled ? PAPER : '#241A12' }}
              >
                {name}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
