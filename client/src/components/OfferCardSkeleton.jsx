import { Card } from './ui/card.tsx'
import { Skeleton } from './ui/skeleton.tsx'

export default function OfferCardSkeleton () {
  return (
    <Card className="flex flex-col overflow-hidden rounded-[18px] border-0 shadow-[0_8px_24px_rgba(51,51,51,0.08)]">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3.5 w-40" />
      </div>

      <div className="flex items-center justify-between p-4 pt-0">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    </Card>
  )
}
