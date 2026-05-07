'use client'

import type { AuctionSnapshot } from '@ipl-auction/contracts'
import { TEAM_META, teamColor } from './teamMeta'

export function LotHero(props: {
  auction: AuctionSnapshot | null
  nowMs: number
  isPaused?: boolean
  onBid: () => void
  nextBidAmountLakh: number | null
  bidDisabled?: boolean
  bidDisabledReason?: string
}) {
  const lot = props.auction?.lot ?? null

  if (!lot) {
    return (
      <div className="game-panel flex flex-col items-center justify-center rounded-3xl border border-violet-500/15 p-8 text-center">
        <div className="mb-3 text-5xl hero-float select-none" aria-hidden>
          ⏳
        </div>
        <div className="font-display text-lg font-bold text-white">Waiting for next player…</div>
        <p className="mt-2 text-sm text-white/50">Host will start the auction shortly — grab some water! 💧</p>
      </div>
    )
  }

  const remainingMs = props.isPaused ? Infinity : Math.max(0, lot.endsAtMs - props.nowMs)
  const remainingS = isFinite(remainingMs) ? Math.ceil(remainingMs / 1000) : 0
  const progress = props.isPaused ? 1 : Math.max(0, Math.min(1, remainingMs / 20000))
  const isUrgent = !props.isPaused && isFinite(remainingMs) && remainingS <= 5

  const leader = TEAM_META.find((t) => t.id === lot.currentBidderTeamId)
  const color = teamColor(lot.currentBidderTeamId)

  const roleEmoji: Record<string, string> = { BAT: '🏏', BOWL: '⚾', AR: '🌟', WK: '🧤' }

  return (
    <div
      className="game-panel relative overflow-hidden rounded-3xl border p-3 sm:p-5"
      style={{
        borderColor: `${color}45`,
        boxShadow: `0 0 48px ${color}18, 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Background team glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{ background: `radial-gradient(ellipse 70% 50% at 80% 0%, ${color}30 0%, transparent 65%)` }}
      />

      <div className="relative space-y-2.5 sm:space-y-4">
        {/* Row 1: Player info */}
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border text-xl sm:h-16 sm:w-16 sm:rounded-2xl"
            style={{ borderColor: `${color}40`, background: `${color}12` }}
          >
            {lot.playerImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lot.playerImageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span>{roleEmoji[lot.playerRole] ?? '🏏'}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${color}90` }}>
              NOW BIDDING
            </div>
            <div className="mt-0.5 truncate font-display text-lg font-bold text-white sm:text-2xl">
              {lot.playerName}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:mt-1 sm:gap-1.5">
              <span className="rounded-md px-2 py-0.5 text-[11px] font-bold" style={{ background: `${color}20`, color }}>
                {lot.playerRole}
              </span>
              {lot.playerCountry === 'OS' ? (
                <span
                  className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold"
                  style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
                >
                  🌍 OS
                </span>
              ) : (
                <span className="text-xs text-white/35">🇮🇳</span>
              )}
              <span className="text-xs text-white/45">Base ₹{lot.basePriceLakh}L</span>
            </div>
          </div>

          {/* Timer — top-right, always visible */}
          <div
            className="flex shrink-0 flex-col items-center rounded-xl border px-2.5 py-1.5 text-center sm:rounded-2xl sm:px-3 sm:py-2"
            style={{
              background: isUrgent ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
              borderColor: isUrgent ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)',
              minWidth: '48px',
            }}
          >
            <div className="text-[8px] font-bold uppercase tracking-widest text-white/40 sm:text-[9px]">Timer</div>
            {props.isPaused ? (
              <div className="mt-0.5 font-display text-xl font-bold sm:text-3xl" style={{ color: '#f97316' }}>⏸</div>
            ) : (
              <div
                className="mt-0.5 font-display text-xl font-bold tabular-nums sm:text-3xl"
                style={{
                  color: isUrgent ? '#ef4444' : '#fff',
                  animation: isUrgent ? 'timer-warn 0.6s ease-in-out infinite' : 'none',
                }}
              >
                {remainingS}s
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Current bid (full width on mobile) */}
        <div
          className="flex items-center justify-between rounded-xl border px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-2.5"
          style={{ background: `${color}10`, borderColor: `${color}30` }}
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${color}80` }}>Current bid</div>
            <div className="font-display text-xl font-bold tabular-nums text-white sm:text-3xl">
              ₹{lot.currentBidLakh ?? lot.basePriceLakh}L
            </div>
          </div>

          {/* Highest bidder */}
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border sm:h-10 sm:w-10"
              style={{ borderColor: `${color}35`, background: `${color}12` }}
            >
              {leader?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={leader.logo} alt="" className="h-7 w-7 object-contain" />
              ) : (
                <span className="text-base">—</span>
              )}
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-white/35">Bidder</div>
              <div className="text-sm font-bold" style={{ color: lot.currentBidderTeamId ? color : 'rgba(255,255,255,0.3)' }}>
                {lot.currentBidderTeamId ?? 'None'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={progress > 0.15 ? 'shimmer-bar h-full rounded-full transition-[width]' : 'h-full rounded-full bg-red-500 transition-[width]'}
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Row 3: Bid controls */}
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-2">
          <div
            className="min-h-[48px] flex-1 rounded-2xl border px-3 py-2.5 text-sm sm:min-h-0"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}
          >
            <span className="text-white/45">Next bid </span>
            <span className="font-mono font-bold tabular-nums text-white">
              {props.nextBidAmountLakh == null ? '—' : `₹${props.nextBidAmountLakh}L`}
            </span>
          </div>
          <button
            onClick={props.onBid}
            disabled={props.bidDisabled || props.nextBidAmountLakh == null}
            type="button"
            className="tap-target min-h-[48px] touch-manipulation rounded-2xl px-4 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:px-5"
            style={
              props.bidDisabled || props.nextBidAmountLakh == null
                ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }
                : {
                    background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
                    color: '#0f172a',
                    boxShadow: '0 0 22px rgba(34,211,238,0.55)',
                  }
            }
            title={props.bidDisabledReason}
          >
            BID 🔨
          </button>
        </div>

        {props.bidDisabledReason ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-xs text-amber-400/80">
            ⚠️ {props.bidDisabledReason}
          </div>
        ) : null}
      </div>
    </div>
  )
}
