import { GYG_PARTNER_ID } from '../affiliates/gyg.js'

// GetYourGuide "activities" widget — location-scoped.
// The `activities` type (unlike `auto`, which region-curates) honors the
// `data-gyg-q` location query, so it shows activities for THIS destination.
// The pa.umd script (index.html) hydrates [data-gyg-widget] nodes into a
// tracked iframe. `key={query}` gives a fresh node per destination.
// - `data-gyg-cmp` (campaign) is set to the destination for per-city analytics.
export default function GygWidget ({ query, cmp, items = 4, locale = 'en-US' }) {
  if (!query) return null
  const campaign = (cmp || query)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div
      key={query}
      className="gyg-widget"
      data-gyg-href="https://widget.getyourguide.com/default/activities.frame"
      data-gyg-widget="activities"
      data-gyg-partner-id={GYG_PARTNER_ID}
      data-gyg-cmp={campaign}
      data-gyg-q={query}
      data-gyg-locale-code={locale}
      data-gyg-number-of-items={items}
    />
  )
}
