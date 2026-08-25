import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { listAdminOffers, createAdminOffer, updateAdminOffer, deleteAdminOffer } from '../api/admin-offers.js'
import { listAdminAgencies, createAdminAgency } from '../api/admin-agencies.js'
import { listDestinations } from '../api/destinations.js'
import OfferForm from '../components/OfferForm.jsx'
import AgencyForm from '../components/AgencyForm.jsx'

const INK = '#6B3A1E'

export default function AdminOffersPage () {
  const { t } = useI18n()
  const { token, logout } = useAuth()
  const [offers, setOffers] = useState([])
  const [agencies, setAgencies] = useState([])
  const [destinations, setDestinations] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showAgencyForm, setShowAgencyForm] = useState(false)
  const [loading, setLoading] = useState(true)

  async function refresh () {
    setOffers(await listAdminOffers(token))
  }

  async function refreshAgencies () {
    setAgencies(await listAdminAgencies(token))
  }

  useEffect(() => {
    Promise.all([
      refresh(),
      refreshAgencies(),
      listDestinations().then(setDestinations)
    ]).finally(() => setLoading(false))
  }, [token])

  async function handleCreateAgency (data) {
    await createAdminAgency(token, data)
    setShowAgencyForm(false)
    await refreshAgencies()
  }

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
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-wordmark text-xl text-[#0A0A0A]">kranisa</p>
            <h1 className="text-sm text-[#6B6B6B] mt-1">{t('admin.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-full bg-[#EFE7DA] px-4 py-2 text-xs font-semibold text-[#0A0A0A]">{t('app.title')}</Link>
            <button onClick={logout} className="rounded-full bg-[#0A0A0A] px-4 py-2 text-xs font-semibold text-white">{t('admin.logout')}</button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide" style={{ color: INK }}>[ {t('admin.agencies.title')} ]</p>

          {!showAgencyForm && (
            <button
              onClick={() => setShowAgencyForm(true)}
              className="self-start bg-[#EFE7DA] text-[#0A0A0A] rounded-full font-medium text-sm py-2 px-5 hover:bg-[#E5D9C3] transition-colors"
            >
              {t('admin.agencies.add')}
            </button>
          )}

          {showAgencyForm && (
            <AgencyForm onSubmit={handleCreateAgency} onCancel={() => setShowAgencyForm(false)} />
          )}

          <div className="flex flex-wrap gap-2">
            {agencies.map(a => (
              <span key={a.id} className="font-mono text-xs px-3 py-1.5 border text-[#241A12]" style={{ borderColor: INK }}>
                {a.name}
              </span>
            ))}
            {agencies.length === 0 && !loading && (
              <span className="text-xs text-[#6B6B6B]">{t('admin.agencies.empty')}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide" style={{ color: INK }}>[ {t('admin.offers.title')} ]</p>

          {!showForm && !editing && (
            <button
              onClick={() => setShowForm(true)}
              className="self-start bg-[#0A0A0A] text-white rounded-full font-medium text-sm py-2 px-5 hover:bg-[#241A12] transition-colors"
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

          {loading && (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-14 border animate-pulse" style={{ borderColor: '#DDD0BC' }} />
              ))}
            </div>
          )}

          {!loading && offers.length === 0 && (
            <div className="font-mono text-center text-sm text-[#6B6B6B] border py-10" style={{ borderColor: INK }}>
              [ {t('admin.offers.empty')} ]
            </div>
          )}

          {offers.map(offer => (
            <div key={offer.id} className="font-mono flex justify-between items-center bg-[#FDF9F2] border px-4 py-3" style={{ borderColor: INK }}>
              <div>
                <p className="font-semibold text-[#241A12] text-sm">{offer.destination_name} &middot; {offer.agency_name}</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  {offer.start_date} -&gt; {offer.end_date} &middot; {Number(offer.price_per_person).toFixed(0)} {offer.currency}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditing(offer)} className="text-xs font-semibold" style={{ color: INK }}>{t('admin.offers.edit')}</button>
                <button onClick={() => handleDelete(offer.id)} className="text-xs font-semibold text-red-700">{t('admin.offers.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
