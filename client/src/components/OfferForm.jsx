import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'

const BLANK = {
  agency_id: '', destination_id: '', start_date: '', end_date: '', nights: 7,
  price_per_person: '', currency: 'EUR', board_type: 'all-inclusive',
  star_rating: '', capacity: 2, image_url: '', external_link: ''
}

const inputClass = 'border border-[#E4E4E4] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C81E3A]'

export default function OfferForm ({ agencies, destinations, initial, onSubmit, onCancel }) {
  const { t } = useI18n()
  const [form, setForm] = useState(initial || BLANK)
  const [errors, setErrors] = useState([])

  function set (field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit (e) {
    e.preventDefault()
    try {
      await onSubmit(form)
    } catch (err) {
      setErrors(err.message.split(', '))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-white border border-[#E4E4E4] rounded-2xl p-5">
      <div className="grid grid-cols-2 gap-3">
        <select value={form.agency_id} onChange={e => set('agency_id', e.target.value)} required className={inputClass}>
          <option value="" disabled>Agjencia</option>
          {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <select value={form.destination_id} onChange={e => set('destination_id', e.target.value)} required className={inputClass}>
          <option value="" disabled>Destinacioni</option>
          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required className={inputClass} />
        <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} required className={inputClass} />
        <input type="number" placeholder="Netë" value={form.nights} onChange={e => set('nights', e.target.value)} required className={inputClass} />
        <input type="number" step="0.01" placeholder="Çmimi për person" value={form.price_per_person} onChange={e => set('price_per_person', e.target.value)} required className={inputClass} />
        <input type="text" placeholder="Valuta" value={form.currency} onChange={e => set('currency', e.target.value)} required className={inputClass} />
        <input type="text" placeholder="Lloji i pensionit" value={form.board_type} onChange={e => set('board_type', e.target.value)} required className={inputClass} />
        <input type="number" min="1" max="5" placeholder="Yje" value={form.star_rating} onChange={e => set('star_rating', e.target.value)} className={inputClass} />
        <input type="number" placeholder="Kapaciteti" value={form.capacity} onChange={e => set('capacity', e.target.value)} required className={inputClass} />
        <input type="url" placeholder="Imazhi (URL)" value={form.image_url} onChange={e => set('image_url', e.target.value)} className={inputClass} />
        <input type="url" placeholder="Lidhja e jashtme (WhatsApp/sajt)" value={form.external_link} onChange={e => set('external_link', e.target.value)} required className={`${inputClass} col-span-2`} />
      </div>

      {errors.length > 0 && (
        <ul className="text-red-600 text-sm list-disc list-inside">
          {errors.map(e => <li key={e}>{e}</li>)}
        </ul>
      )}

      <div className="flex gap-2">
        <button type="submit" className="bg-[#C81E3A] text-white rounded-lg font-bold text-sm px-5 py-2 hover:bg-[#AD1830] transition-colors">
          {t('admin.offers.add')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-[#6B6B6B] text-sm font-semibold px-5 py-2">
            {t('admin.offers.cancel')}
          </button>
        )}
      </div>
    </form>
  )
}
