import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'

const MONTHS = {
  sq: ['Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor', 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}
const WEEKDAYS = {
  sq: ['H', 'M', 'M', 'E', 'P', 'Sh', 'D'],
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S']
}

function toISO (date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function fromISO (iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatShort (iso) {
  const d = fromISO(iso)
  if (!d) return null
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthMatrix (viewDate) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

function Month ({ viewDate, months, weekdays, todayISO, dateFrom, dateTo, onDayClick }) {
  return (
    <div className="w-full">
      <p className="text-center text-sm font-semibold text-[#0A0A0A] mb-2">
        {months[viewDate.getMonth()]} {viewDate.getFullYear()}
      </p>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {weekdays.map((w, i) => (
          <span key={i} className="text-[0.62rem] uppercase text-[#767676]">{w}</span>
        ))}
        {monthMatrix(viewDate).map((date, i) => {
          if (!date) return <span key={i} />
          const iso = toISO(date)
          const isPast = iso < todayISO
          const isStart = iso === dateFrom
          const isEnd = iso === dateTo
          const inRange = dateFrom && dateTo && iso > dateFrom && iso < dateTo
          const tinted = isStart || isEnd || inRange

          return (
            <div
              key={i}
              className={`${tinted ? 'bg-[#F6C79A]/45' : ''} ${isStart ? 'rounded-l-full' : ''} ${isEnd ? 'rounded-r-full' : ''}`}
            >
              <button
                type="button"
                disabled={isPast}
                onClick={() => onDayClick(iso)}
                className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
                  isPast
                    ? 'text-[#0A0A0A]/20 cursor-not-allowed'
                    : isStart || isEnd
                      ? 'bg-[#0A0A0A] text-white font-semibold'
                      : 'text-[#0A0A0A] hover:bg-[#F6C79A]/40'
                }`}
              >
                {date.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DateRangePicker ({ dateFrom, dateTo, onChange, placeholder, invalid = false }) {
  const { lang } = useI18n()
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => fromISO(dateFrom) || new Date())
  const rootRef = useRef(null)
  const todayISO = toISO(new Date())

  useEffect(() => {
    function handleOutside (e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    function handleKey (e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  function handleDayClick (iso) {
    if (iso < todayISO) return
    const startingFresh = !dateFrom || (dateFrom && dateTo)
    if (startingFresh) {
      onChange({ dateFrom: iso, dateTo: '' })
    } else if (iso < dateFrom) {
      onChange({ dateFrom: iso, dateTo: '' })
    } else {
      onChange({ dateFrom, dateTo: iso })
      setOpen(false)
    }
  }

  function shiftMonth (delta) {
    setViewDate(d => new Date(d.getFullYear(), d.getMonth() + delta, 1))
  }

  const nextViewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
  const label = dateFrom
    ? `${formatShort(dateFrom)} - ${dateTo ? formatShort(dateTo) : '?'}`
    : placeholder
  const months = MONTHS[lang] || MONTHS.en
  const weekdays = WEEKDAYS[lang] || WEEKDAYS.en

  return (
    <div ref={rootRef} className="relative flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`text-left text-sm font-semibold outline-none whitespace-nowrap ${dateFrom ? 'text-[#0A0A0A]' : 'text-[#0A0A0A]/40'} ${invalid ? 'text-red-600' : ''}`}
      >
        {label}
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+10px)] z-20 w-72 sm:w-[30rem] rounded-2xl border border-white/70 bg-white/95 backdrop-blur-xl p-4 shadow-[0_20px_45px_-15px_rgba(46,27,12,0.4)]">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#0A0A0A] hover:bg-[#F6C79A]/40"
              aria-label="Previous month"
            >
              &larr;
            </button>

            <div className="flex flex-1 gap-6">
              <Month
                viewDate={viewDate}
                months={months}
                weekdays={weekdays}
                todayISO={todayISO}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDayClick={handleDayClick}
              />
              <div className="hidden sm:block sm:w-full">
                <Month
                  viewDate={nextViewDate}
                  months={months}
                  weekdays={weekdays}
                  todayISO={todayISO}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  onDayClick={handleDayClick}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => shiftMonth(1)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#0A0A0A] hover:bg-[#F6C79A]/40"
              aria-label="Next month"
            >
              &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
