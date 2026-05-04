'use client'

/** Consistent title block + optional trust row for create/join flows. */
export function FormPageHero(props: {
  kicker: string
  title: string
  subtitle: string
  /** Accent for kicker pill border glow */
  accent?: 'cyan' | 'violet' | 'rose'
  trust?: string[]
}) {
  const accent = props.accent ?? 'cyan'
  const accentCls =
    accent === 'violet'
      ? 'border-violet-400/35 bg-gradient-to-r from-violet-500/14 to-fuchsia-500/10 text-violet-200 shadow-[0_0_24px_rgba(139,92,246,0.18)]'
      : accent === 'rose'
        ? 'border-rose-400/35 bg-gradient-to-r from-rose-500/14 to-orange-500/10 text-rose-100 shadow-[0_0_24px_rgba(244,63,94,0.15)]'
        : 'border-cyan-400/35 bg-gradient-to-r from-cyan-500/14 to-violet-500/10 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.15)]'

  const pulse =
    accent === 'violet' ? 'bg-violet-400 shadow-[0_0_8px_#a78bfa]' : accent === 'rose' ? 'bg-rose-400' : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'

  const trust = props.trust ?? ['No account needed', 'Live sync', 'Invite with code']

  return (
    <div className="page-enter mb-8">
      <div
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] sm:px-4 sm:py-2 sm:text-xs ${accentCls}`}
      >
        <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${pulse}`} />
        {props.kicker}
      </div>
      <h1 className="font-display mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
        {props.title}
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">{props.subtitle}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {trust.map((t) => (
          <span
            key={t}
            className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/45 sm:text-[11px]"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
