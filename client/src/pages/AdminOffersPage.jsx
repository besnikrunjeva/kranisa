import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { listAdminOffers, createAdminOffer, updateAdminOffer, deleteAdminOffer } from '../api/admin-offers.js'
import { listAdminAgencies } from '../api/admin-agencies.js'
import { listDestinations } from '../api/destinations.js'
import OfferForm from '../components/OfferForm.jsx'

export default function AdminOffersPage () {
  const { t } = useI18n()
  const { token, logout } = useAuth()
  const [offers, setOffers] = useState([])
  const [agencies, setAgencies] = useState([])
  const [destinations, setDestinations] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  async function refresh () {
    setOffers(await listAdminOffers(token))
  }

  useEffect(() => {
    refresh()
    listAdminAgencies(token).then(setAgencies)
    listDestinations().then(setDestinations)
  }, [token])

  async function handleCreate (data) {
    await createAdminOffer(token, data)
    setShowForm(false)
    await refresh()
  }

  async function handleUpdate (data) {
    await updateAdminOffer(token, editing.id, data)
    setEditing(null)
    await refresh()
  }

  async function handleDelete (id) {
    await deleteAdminOffer(token, id)
    await refresh()
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-heading text-xl font-black tracking-tight text-[#1A1A1A]">
              Kran<span className="ml-0.5 rounded-md bg-[#C81E3A] px-1.5 py-0.5 text-white">isa</span>
            </p>
            <h1 className="text-sm text-[#6B6B6B] mt-1">{t('admin.offers.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-full bg-[#F4F4F4] px-4 py-2 text-xs font-semibold text-[#1A1A1A]">{t('app.title')}</Link>
            <button onClick={logout} className="rounded-full bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-white">{t('admin.logout')}</button>
          </div>
        </div>

        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="self-start flex items-center gap-2 bg-[#C81E3A] text-white rounded-lg font-bold text-sm py-2 pl-5 pr-2 hover:bg-[#AD1830] transition-colors"
          >
            {t('admin.offers.add')}
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1A1A1A] text-[#C81E3A]">
              &rarr;
            </span>
          </button>
        )}

        {showForm && (
          <OfferForm agencies={agencies} destinations={destinations} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        )}

        {editing && (
          <OfferForm agencies={agencies} destinations={destinations} initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        )}

        <div className="flex flex-col gap-2">
          {offers.map(offer => (
            <div key={offer.id} className="flex justify-between items-center bg-white border border-[#E4E4E4] rounded-xl px-4 py-3">
              <div>
                <p className="font-semibold text-[#1A1A1A] text-sm">{offer.destination_name} — {offer.agency_name}</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  {offer.start_date} → {offer.end_date} · {Number(offer.price_per_person).toFixed(0)} {offer.currency}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditing(offer)} className="text-xs font-semibold text-[#1F5E4A]">{t('admin.offers.edit')}</button>
                <button onClick={() => handleDelete(offer.id)} className="text-xs font-semibold text-[#C81E3A]">{t('admin.offers.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
