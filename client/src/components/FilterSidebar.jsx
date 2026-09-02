import { useI18n } from '../i18n/I18nContext.jsx'
import { Checkbox } from './ui/checkbox.tsx'
import { Slider } from './ui/slider.tsx'

export default function FilterSidebar ({
  priceMin,
  priceMax,
  priceRange,
  onPriceRangeChange,
  boardTypeCounts,
  selectedBoardTypes,
  onToggleBoardType,
  starRatingCounts,
  selectedStarRatings,
  onToggleStarRating
}) {
  const { t } = useI18n()

  return (
    <div className="flex flex-col gap-7">
      {priceMin < priceMax && (
        <div>
          <div className="font-heading text-sm font-semibold text-foreground mb-4">{t('filters.price')}</div>
          <Slider
            value={priceRange}
            onValueChange={onPriceRangeChange}
            min={priceMin}
            max={priceMax}
            step={5}
          />
          <div className="flex justify-between mt-2.5 text-xs font-semibold text-muted-foreground">
            <span>{priceRange[0]} €</span>
            <span>{priceRange[1]} €</span>
          </div>
        </div>
      )}

      {Object.keys(boardTypeCounts).length > 0 && (
        <div>
          <div className="font-heading text-sm font-semibold text-foreground mb-3">{t('filters.board')}</div>
          <div className="flex flex-col gap-3">
            {Object.entries(boardTypeCounts).map(([board, count]) => (
              <label key={board} className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                <Checkbox
                  checked={selectedBoardTypes.has(board)}
                  onCheckedChange={() => onToggleBoardType(board)}
                />
                <span className="flex-1">{board}</span>
                <span className="text-muted-foreground text-xs">{count}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {Object.keys(starRatingCounts).length > 0 && (
        <div>
          <div className="font-heading text-sm font-semibold text-foreground mb-3">{t('filters.stars')}</div>
          <div className="flex flex-col gap-3">
            {Object.entries(starRatingCounts)
              .sort((a, b) => Number(b[0]) - Number(a[0]))
              .map(([stars, count]) => (
                <label key={stars} className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer">
                  <Checkbox
                    checked={selectedStarRatings.has(Number(stars))}
                    onCheckedChange={() => onToggleStarRating(Number(stars))}
                  />
                  <span className="flex-1">{stars}★</span>
                  <span className="text-muted-foreground text-xs">{count}</span>
                </label>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
