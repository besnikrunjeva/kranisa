import { useEffect, useState } from 'react'
import { Reveal } from '../components/ui.jsx'
import OffersExplorer from '../components/OffersExplorer.jsx'
import { SkeletonGrid, Empty } from '../components/States.jsx'
import { adaptOffer } from '../adapt.js'
import { listAllOffers } from '../../api/offers.js'

export default function AllOffers () {
  const [offers, setOffers] = useState(null)

  useEffect(() => {
    listAllOffers()
      .then(list => setOffers(list.map(adaptOffer)))
      .catch(() => setOffers([]))
  }, [])

  return (
    <main className="st-wrap" style={{ paddingTop: 48, paddingBottom: 40 }}>
      <Reveal index={0} style={{ marginBottom: 32 }}>
        <p className="st-eyebrow">Katalogu i plotë</p>
        <h1 className="st-h2" style={{ marginTop: 10 }}>Të gjitha ofertat aktuale</h1>
      </Reveal>

      {offers === null && <SkeletonGrid count={6} cols="repeat(2, 1fr)" />}
      {offers !== null && offers.length === 0 && (
        <Empty title="S'ka oferta për momentin" body="Kthehu së shpejti — ofertat e reja shtohen vazhdimisht." />
      )}
      {offers !== null && offers.length > 0 && (
        <Reveal index={1}><OffersExplorer offers={offers} /></Reveal>
      )}
    </main>
  )
}
