import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { listDestinations } from '../api/destinations.js'
import DestinationSelect from './DestinationSelect.jsx'
import DateRangePicker from './DateRangePicker.jsx'
import PeopleSelect from './PeopleSelect.jsx'

export default function SearchForm ({ onSearch }) {
  const { t } = useI18n()
  const [destinations, setDestinations] = useState([])
  const [destinationId, setDestinationId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [people, setPeople] = useState(2)
  const [showErrors, setShowErrors] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listDestinations().then(setDestinations)
  }, [])

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
      await onSearch({ destinationId, dateFrom, dateTo, people })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="font-body flex flex-col sm:flex-row items-stretch bg-white border border-[#E5E5E5] rounded-2xl shadow-sm"
    >
      <div className="flex flex-1 flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[#E5E5E5] min-w-0">
        <div className="flex-[1.3] min-w-0 px-4 py-3 flex flex-col justify-center">
          <span className="text-[0.62rem] uppercase tracking-wide text-[#767676]">{t('search.destination')}</span>
          <DestinationSelect
            destinations={destinations}
            value={destinationId}
            onChange={setDestinationId}
            placeholder="-"
            invalid={showErrors && !destinationId}
          />
        </div>

        <div className="flex-[1.3] min-w-0 px-4 py-3 flex flex-col justify-center">
          <span className="text-[0.62rem] uppercase tracking-wide text-[#767676]">{t('search.dates')}</span>
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={handleDateChange}
            placeholder="dd.mm - dd.mm"
            invalid={showErrors && (!dateFrom || !dateTo)}
          />
        </div>

        <div className="flex-1 min-w-0 px-4 py-3 flex flex-col justify-center">
          <span className="text-[0.62rem] uppercase tracking-wide text-[#767676]">{t('search.people')}</span>
          <PeopleSelect value={people} onChange={setPeople} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center bg-[#0A0A0A] text-white font-medium text-sm py-3.5 px-6 hover:bg-[#241A12] disabled:opacity-60 rounded-bl-2xl rounded-br-2xl sm:rounded-bl-none sm:rounded-tr-2xl"
      >
        {loading ? t('search.loading') : t('search.submit')}
      </button>
    </form>
  )
}
