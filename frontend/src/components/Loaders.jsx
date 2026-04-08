/** Inline spinner */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4 border-[1.5px]', md: 'w-5 h-5 border-2', lg: 'w-7 h-7 border-2', xl: 'w-10 h-10 border-[3px]' }
  return (
    <div
      className={`${sizes[size]} rounded-full border-surface-700 border-t-brand-400 animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

/** Full-page loading screen */
export function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
          <span className="text-brand-400 text-xl font-display font-bold">✦</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-surface-900 rounded-full flex items-center justify-center">
          <Spinner size="sm" />
        </div>
      </div>
      <p className="text-surface-400 text-sm font-body animate-pulse-soft">Loading…</p>
    </div>
  )
}

/** Skeleton row for lists */
export function SkeletonRow({ lines = 2 }) {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-2/3 rounded" />
          {lines >= 2 && <div className="skeleton h-3 w-1/3 rounded" />}
        </div>
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
    </div>
  )
}

/** Skeleton for a card grid */
export function SkeletonCards({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

/** Inline text shimmer */
export function SkeletonText({ width = 'w-24', height = 'h-3' }) {
  return <div className={`skeleton ${width} ${height} rounded`} />
}
