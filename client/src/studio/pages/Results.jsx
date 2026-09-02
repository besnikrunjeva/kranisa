import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Reveal } from '../components/ui.jsx'
import SearchBar from '../components/SearchBar.jsx'
import OffersExplorer from '../components/OffersExplorer.jsx'
import { SkeletonGrid, Empty } from '../components/States.jsx'
import ThingsToDo from '../components/ThingsToDo.jsx'
import { adaptOffer } from '../adapt.js'
import { searchOffers, listAllOffers } from '../../api/offers.js'

export default function Results () {
  const [params] = useSearchParams()
  const destinationId = params.get('destinationId') || ''
  const dateFrom = params.get('dateFrom') || ''
  const dateTo = params.get('dateTo') || ''

  const [offers, setOffers] = useState(null)
  const [alternatives, setAlternatives] = useState(null)

  useEffect(() => {
    setOffers(null)
    setAlternatives(null)
    const req = destinationId
      ? searchOffers({ destinationId, dateFrom, dateTo, people: 2 })
      : listAllOffers()
    let cancelled = false
    req
      .then(list => { if (!cancelled) setOffers(list.map(adaptOffer)) })
      .catch(() => { if (!cancelled) setOffers([]) })
    return () => { cancelled = true }
  }, [destinationId, dateFrom, dateTo])

  // When a dated search finds nothing, show what else is available for that
  // destination rather than a dead end (inventory is small).
  useEffect(() => {
    if (!destinationId || offers === null || offers.length > 0 || !(dateFrom && dateTo)) return
    let cancelled = false
    searchOffers({ destinationId, people: 2 })
      .then(list => { if (!cancelled) setAlternatives(list.map(adaptOffer)) })
      .catch(() => { if (!cancelled) setAlternatives([]) })
    return () => { cancelled = true }
  }, [offers, destinationId, dateFrom, dateTo])

  return (
    <main className="st-wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <Reveal index={0} style={{ maxWidth: 860, position: 'relative', zIndex: 20 }}>
        <SearchBar initialDestinationId={destinationId} initialFrom={dateFrom} initialTo={dateTo} />
      </Reveal>

      <div style={{ marginTop: 40 }}>
        {offers === null && <SkeletonGrid count={6} cols="repeat(2, 1fr)" />}

        {offers !== null && offers.length > 0 && (
          <>
            <Reveal index={1}><OffersExplorer offers={offers} /></Reveal>
            {destinationId && <ThingsToDo city={offers[0].destination} country={offers[0].country} />}
          </>
        )}

        {offers !== null && offers.length === 0 && (
          <>
            <Empty
              title="Asnjë ofertë për këto data"
              body="Provo data të tjera, ose shiko çfarë ka aktualisht për këtë destinacion më poshtë."
              cta={{ to: '/ofertat', label: 'Shiko të gjitha ofertat' }}
            />
            {alternatives && alternatives.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <h2 className="st-h2" style={{ marginBottom: 20 }}>Të disponueshme për këtë destinacion</h2>
                <OffersExplorer offers={alternatives} />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
