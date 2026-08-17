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
            <p className="text-xl font-bold tracking-tight text-[#1A1A1A]">
              Kran<span className="text-[#C81E3A]">isa</span>
            </p>
            <h1 className="text-sm text-[#6B6B6B] mt-1">{t('admin.offers.title')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A]">{t('app.title')}</Link>
            <button onClick={logout} className="text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A]">{t('admin.logout')}</button>
          </div>
        </div>

        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="self-start bg-[#C81E3A] text-white rounded-lg font-bold text-sm px-5 py-2 hover:bg-[#AD1830] transition-colors"
          >
            {t('admin.offers.add')}
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
