import { useEffect, useState } from 'react'
import { Plane } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { listDestinations } from '../api/destinations.js'
import { Button } from './ui/button.tsx'
import { Separator } from './ui/separator.tsx'
import DestinationSelect from './DestinationSelect.jsx'
import DateRangePicker from './DateRangePicker.jsx'

// The API still filters by capacity, but the field is no longer exposed in
// the UI — search no longer asks how many people are traveling.
const DEFAULT_PEOPLE = 2

export default function SearchForm ({ onSearch, initialDestinationId = '', initialDateFrom = '', initialDateTo = '' }) {
  const { t } = useI18n()
  const [destinations, setDestinations] = useState([])
  const [destinationsError, setDestinationsError] = useState(false)
  const [destinationId, setDestinationId] = useState(initialDestinationId)
  const [dateFrom, setDateFrom] = useState(initialDateFrom)
  const [dateTo, setDateTo] = useState(initialDateTo)
  const [showErrors, setShowErrors] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listDestinations()
      .then(setDestinations)
      .catch(() => setDestinationsError(true))
  }, [])

  // Lets a parent (e.g. a destination picked from PopularDestinations) push a
  // selection in after mount — typing in the field itself never touches this.
  useEffect(() => {
    if (initialDestinationId) setDestinationId(initialDestinationId)
  }, [initialDestinationId])

  function handleDateChange ({ dateFrom: from, dateTo: to }) {
    setDateFrom(from)
    setDateTo(to)
  }

  async function handleSubmit (e) {
    e.preventDefault()
    if (!destinationId || !dateFrom || !dateTo) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setLoading(true)
    try {
      await onSearch({ destinationId, dateFrom, dateTo, people: DEFAULT_PEOPLE })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="font-body w-full rounded-xl border border-border bg-card text-card-foreground flex flex-col sm:flex-row sm:items-stretch"
    >
      <div className="flex flex-1 flex-col sm:flex-row sm:items-center divide-y sm:divide-y-0 divide-border min-w-0">
        <div className="flex-1 min-w-0 px-4 py-3">
          <DestinationSelect
            destinations={destinations}
            error={destinationsError}
            value={destinationId}
            onChange={setDestinationId}
            placeholder={t('search.destinationPlaceholder')}
            label={t('search.destination')}
            invalid={showErrors && !destinationId}
          />
        </div>

        <Separator orientation="vertical" className="hidden sm:block h-auto self-stretch" />

        <div className="flex-1 min-w-0 px-4 py-3">
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={handleDateChange}
            invalid={showErrors && (!dateFrom || !dateTo)}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto h-auto px-8 rounded-none rounded-b-xl sm:rounded-bl-none sm:rounded-tr-xl sm:rounded-br-xl"
      >
        <Plane className="mr-2 h-4 w-4" />
        {loading ? t('search.loading') : t('search.submit')}
      </Button>
    </form>
  )
}
