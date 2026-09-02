import { parseDate } from '@internationalized/date'
import { useI18n } from '../i18n/I18nContext.jsx'
import { JollyDateRangePicker } from './ui/date-range-picker.tsx'

export default function DateRangePicker ({ dateFrom, dateTo, onChange, invalid = false }) {
  const { t } = useI18n()

  const value = dateFrom && dateTo
    ? { start: parseDate(dateFrom), end: parseDate(dateTo) }
    : null

  function handleChange (range) {
    if (!range) return
    onChange({ dateFrom: range.start.toString(), dateTo: range.end.toString() })
  }

  return (
    <JollyDateRangePicker
      value={value}
      onChange={handleChange}
      isInvalid={invalid}
      label={t('search.dates')}
      className="w-full"
    />
  )
}
