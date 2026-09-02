import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext.jsx'
import OfferList from './OfferList.jsx'
import FilterSidebar from './FilterSidebar.jsx'
import { Button } from './ui/button.tsx'

// Shared price/board-type/star-rating filtering and sorting state, used by
// both the dated search results page and the browse-everything page — the
// only difference between them is where `offers` comes from.
export function useOffersBrowser (offers) {
  const [priceRange, setPriceRange] = useState([0, 0])
  const [selectedBoardTypes, setSelectedBoardTypes] = useState(() => new Set())
  const [selectedStarRatings, setSelectedStarRatings] = useState(() => new Set())
  const [sortBy, setSortBy] = useState('price_asc')

  const priceMin = useMemo(() => (
    offers.length > 0 ? Math.floor(Math.min(...offers.map(o => Number(o.price_per_person)))) : 0
  ), [offers])
  const priceMax = useMemo(() => (
    offers.length > 0 ? Math.ceil(Math.max(...offers.map(o => Number(o.price_per_person)))) : 0
  ), [offers])

  useEffect(() => {
    setPriceRange([priceMin, priceMax])
    setSelectedBoardTypes(new Set())
    setSelectedStarRatings(new Set())
  }, [offers, priceMin, priceMax])

  const boardTypeCounts = useMemo(() => {
    const counts = {}
    for (const o of offers) counts[o.board_type] = (counts[o.board_type] || 0) + 1
    return counts
  }, [offers])

  const starRatingCounts = useMemo(() => {
    const counts = {}
    for (const o of offers) {
      if (!o.star_rating) continue
      counts[o.star_rating] = (counts[o.star_rating] || 0) + 1
    }
    return counts
  }, [offers])

  const filteredOffers = useMemo(() => {
    const result = offers.filter(o => {
      const price = Number(o.price_per_person)
      if (price < priceRange[0] || price > priceRange[1]) return false
      if (selectedBoardTypes.size > 0 && !selectedBoardTypes.has(o.board_type)) return false
      if (selectedStarRatings.size > 0 && !selectedStarRatings.has(o.star_rating)) return false
      return true
    })
    result.sort((a, b) => {
      const pa = Number(a.price_per_person)
      const pb = Number(b.price_per_person)
      return sortBy === 'price_asc' ? pa - pb : pb - pa
    })
    return result
  }, [offers, priceRange, selectedBoardTypes, selectedStarRatings, sortBy])

  function toggleBoardType (board) {
    setSelectedBoardTypes(prev => {
      const next = new Set(prev)
      if (next.has(board)) next.delete(board)
      else next.add(board)
      return next
    })
  }

  function toggleStarRating (stars) {
    setSelectedStarRatings(prev => {
      const next = new Set(prev)
      if (next.has(stars)) next.delete(stars)
      else next.add(stars)
      return next
    })
  }

  return {
    priceMin, priceMax, priceRange, setPriceRange,
    selectedBoardTypes, toggleBoardType, boardTypeCounts,
    selectedStarRatings, toggleStarRating, starRatingCounts,
    sortBy, setSortBy,
    filteredOffers
  }
}

function sidebarPropsFrom (browser) {
  return {
    priceMin: browser.priceMin,
    priceMax: browser.priceMax,
    priceRange: browser.priceRange,
    onPriceRangeChange: browser.setPriceRange,
    boardTypeCounts: browser.boardTypeCounts,
    selectedBoardTypes: browser.selectedBoardTypes,
    onToggleBoardType: browser.toggleBoardType,
    starRatingCounts: browser.starRatingCounts,
    selectedStarRatings: browser.selectedStarRatings,
    onToggleStarRating: browser.toggleStarRating
  }
}

// The mobile-filters-toggle + sort buttons row. Exported separately so a
// page that needs it to stick alongside its own title (AllOffersPage) can
// place it in its own sticky wrapper instead of nesting inside OffersGrid.
export function OffersControls ({ browser, mobileFiltersOpen, onToggleMobileFilters }) {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={mobileFiltersOpen ? 'default' : 'outline'}
        size="sm"
        className="rounded-full lg:hidden"
        onClick={onToggleMobileFilters}
      >
        <SlidersHorizontal className="w-4 h-4 mr-1.5" />
        {t('filters.toggle')}
      </Button>
      <Button
        variant={browser.sortBy === 'price_asc' ? 'default' : 'outline'}
        size="sm"
        className="rounded-full"
        onClick={() => browser.setSortBy('price_asc')}
      >
        {t('sort.cheapest')}
      </Button>
      <Button
        variant={browser.sortBy === 'price_desc' ? 'default' : 'outline'}
        size="sm"
        className="rounded-full"
        onClick={() => browser.setSortBy('price_desc')}
      >
        {t('sort.priciest')}
      </Button>
    </div>
  )
}

// Sidebar (desktop) + mobile filter panel (when toggled open) + the offer
// grid. scrollableList: when true, the grid takes up the remaining height of
// a height-constrained parent and scrolls on its own at lg+ (AllOffersPage);
// ResultsPage leaves it off and keeps normal page scrolling.
export function OffersGrid ({ browser, mobileFiltersOpen, scrollableList = false }) {
  const sidebarProps = sidebarPropsFrom(browser)
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 ${scrollableList ? 'lg:flex-1 lg:min-h-0' : ''}`}>
      <div className="hidden lg:block">
        <FilterSidebar {...sidebarProps} />
      </div>

      <div className={`flex flex-col gap-4 ${scrollableList ? 'lg:min-h-0' : ''}`}>
        {mobileFiltersOpen && (
          <div className="lg:hidden shrink-0 rounded-2xl border border-border bg-card p-5">
            <FilterSidebar {...sidebarProps} />
          </div>
        )}

        <OfferList offers={browser.filteredOffers} scrollable={scrollableList} />
      </div>
    </div>
  )
}

// Simple composition for pages that don't need the controls row to stick
// separately from anything else (ResultsPage).
export default function OffersBrowser ({ offers, scrollableList = false }) {
  const browser = useOffersBrowser(offers)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 ${scrollableList ? 'lg:flex-1 lg:min-h-0' : ''}`}>
      <div className="hidden lg:block">
        <FilterSidebar {...sidebarPropsFrom(browser)} />
      </div>

      <div className={`flex flex-col gap-4 ${scrollableList ? 'lg:min-h-0' : ''}`}>
        <div className="shrink-0">
          <OffersControls
            browser={browser}
            mobileFiltersOpen={mobileFiltersOpen}
            onToggleMobileFilters={() => setMobileFiltersOpen(v => !v)}
          />
        </div>

        {mobileFiltersOpen && (
          <div className="lg:hidden shrink-0 rounded-2xl border border-border bg-card p-5">
            <FilterSidebar {...sidebarPropsFrom(browser)} />
          </div>
        )}

        <OfferList offers={browser.filteredOffers} scrollable={scrollableList} />
      </div>
    </div>
  )
}
