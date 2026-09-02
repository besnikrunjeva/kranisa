import { parseDate } from '@internationalized/date'
import { CalendarDays } from 'lucide-react'
import { DateRangePicker as AriaDateRangePicker, Group, Button as AriaButton, Dialog } from 'react-aria-components'
import { Popover } from '../../components/ui/popover.tsx'
import {
  RangeCalendar, CalendarHeading, CalendarGrid, CalendarGridHeader,
  CalendarHeaderCell, CalendarGridBody, CalendarCell
} from '../../components/ui/calendar.tsx'

function formatDate (isoDate) {
  if (!isoDate) return ''
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' })
}

// A real calendar range picker (react-aria), matching what the classic site
// had — but wearing the studio's editorial look. The `.st-cal` popover
// re-declares the shadcn color tokens as indigo; because CSS custom
// properties inherit through the subtree, the portaled calendar picks them
// up and renders in the studio accent, not the classic blue.
export default function DateRangeField ({ from, to, onChange, isOpen, onOpenChange }) {
  const value = from && to ? { start: parseDate(from), end: parseDate(to) } : null
  const label = from && to ? `${formatDate(from)} - ${formatDate(to)}` : 'Zgjidh datat'

  return (
    <AriaDateRangePicker
      aria-label="Datat"
      value={value}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onChange={range => { if (range?.start && range?.end) onChange({ from: range.start.toString(), to: range.end.toString() }) }}
      className="st-dp"
    >
      <Group className="st-dp__group">
        <AriaButton className="st-dp__trigger" aria-label="Zgjidh datat">
          <span className={from && to ? 'st-dp__value' : 'st-dp__placeholder'}>{label}</span>
          <CalendarDays size={16} aria-hidden />
        </AriaButton>
      </Group>

      <Popover className="st-cal">
        <Dialog className="st-cal__dialog">
          <RangeCalendar>
            <CalendarHeading />
            <CalendarGrid>
              <CalendarGridHeader>{day => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
              <CalendarGridBody>{date => <CalendarCell date={date} />}</CalendarGridBody>
            </CalendarGrid>
          </RangeCalendar>
        </Dialog>
      </Popover>
    </AriaDateRangePicker>
  )
}
