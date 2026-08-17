import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'
import { listDestinations } from '../api/destinations.js'

export default function SearchForm ({ onSearch }) {
  const { t } = useI18n()
  const [destinations, setDestinations] = useState([])
  const [destinationId, setDestinationId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [people, setPeople] = useState(2)

  useEffect(() => {
    listDestinations().then(setDestinations)
  }, [])

  function handleSubmit (e) {
    e.preventDefault()
    onSearch({ destinationId, dateFrom, dateTo, people })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 sm:grid-cols-[1.4fr_1fr_1fr_auto] gap-2 bg-white border border-[#E4E4E4] rounded-2xl p-2.5"
    >
      <label className="bg-[#F4F4F4] rounded-lg px-3 py-2 flex flex-col">
        <span className="text-[0.62rem] uppercase tracking-wide text-[#6B6B6B]">{t('search.destination')}</span>
        <select
          value={destinationId}
          onChange={e => setDestinationId(e.target.value)}
          required
          className="bg-transparent text-sm font-semibold text-[#1A1A1A] outline-none"
        >
          <option value="" disabled>—</option>
          {destinations.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </label>

      <label className="bg-[#F4F4F4] rounded-lg px-3 py-2 flex flex-col">
        <span className="text-[0.62rem] uppercase tracking-wide text-[#6B6B6B]">{t('search.dateFrom')}</span>
        <input
          type="date"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          required
          className="bg-transparent text-sm font-semibold text-[#1A1A1A] outline-none"
        />
      </label>

      <label className="bg-[#F4F4F4] rounded-lg px-3 py-2 flex flex-col">
        <span className="text-[0.62rem] uppercase tracking-wide text-[#6B6B6B]">{t('search.dateTo')}</span>
        <input
          type="date"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          required
          className="bg-transparent text-sm font-semibold text-[#1A1A1A] outline-none"
        />
      </label>

      <label className="bg-[#F4F4F4] rounded-lg px-3 py-2 flex flex-col">
        <span className="text-[0.62rem] uppercase tracking-wide text-[#6B6B6B]">{t('search.people')}</span>
        <input
          type="number"
          min="1"
          value={people}
          onChange={e => setPeople(e.target.value)}
          required
          className="bg-transparent text-sm font-semibold text-[#1A1A1A] outline-none w-full"
        />
      </label>

      <button
        type="submit"
        className="col-span-2 sm:col-span-1 bg-[#C81E3A] text-white rounded-lg font-bold text-sm px-5 py-2 hover:bg-[#AD1830] transition-colors"
      >
        {t('search.submit')}
      </button>
    </form>
  )
}
