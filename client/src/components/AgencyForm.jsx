import { useState } from 'react'
import { useI18n } from '../i18n/I18nContext.jsx'

const INK = '#6B3A1E'
const BLANK = { name: '', logo_url: '', contact_link: '', notes: '' }
const inputClass = 'border rounded-lg px-3 py-2 text-sm outline-none bg-white text-[#241A12]'
const inputStyle = { borderColor: '#DDD0BC' }

export default function AgencyForm ({ onSubmit, onCancel }) {
  const { t } = useI18n()
  const [form, setForm] = useState(BLANK)
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-[#FDF9F2] border p-5" style={{ borderColor: INK }}>
      <div className="grid grid-cols-2 gap-3">
        <input type="text" placeholder="Emri i agjencisë" value={form.name} onChange={e => set('name', e.target.value)} required className={`${inputClass} col-span-2`} style={inputStyle} />
        <input type="url" placeholder="Lidhja e kontaktit (WhatsApp/sajt)" value={form.contact_link} onChange={e => set('contact_link', e.target.value)} required className={`${inputClass} col-span-2`} style={inputStyle} />
        <input type="url" placeholder="Logo (URL)" value={form.logo_url} onChange={e => set('logo_url', e.target.value)} className={inputClass} style={inputStyle} />
        <input type="text" placeholder="Shënime" value={form.notes} onChange={e => set('notes', e.target.value)} className={inputClass} style={inputStyle} />
      </div>

      {errors.length > 0 && (
        <ul className="text-red-700 text-sm list-disc list-inside">
          {errors.map(e => <li key={e}>{e}</li>)}
        </ul>
      )}

      <div className="flex gap-2">
        <button type="submit" className="flex items-center gap-2 bg-[#0A0A0A] text-white rounded-full font-medium text-sm py-2 px-5 hover:bg-[#241A12] transition-colors">
          {t('admin.agencies.add')}
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
