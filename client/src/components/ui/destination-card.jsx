import * as React from 'react'
import { cn } from '@/lib/utils'

const DestinationCard = React.forwardRef(function DestinationCard (
  { className, imageUrl, category, title, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'group relative grid h-full w-full transform-gpu overflow-hidden rounded-xl border border-border shadow-sm transition-shadow duration-300 ease-in-out hover:shadow-lg',
        className
      )}
      {...props}
    >
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white transition-transform duration-500 ease-in-out group-hover:-translate-y-1">
        {category && (
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.14em] text-white/75">
            {category}
          </p>
        )}
        <h3 className="font-heading mt-1 text-xl font-semibold tracking-tight text-white text-balance">
          {title}
        </h3>
      </div>
    </div>
  )
})

export { DestinationCard }
