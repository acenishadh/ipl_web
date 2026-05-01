'use client'

import { TEAM_META, teamColor, teamLogo } from './teamMeta'

export type SoldOverlayData = {
  teamId: string
  playerName: string
  amountLakh: number
}

const CONFETTI_COLORS = ['#ffd60a', '#00ff9d', '#00d4ff', '#f43f5e', '#a855f7', '#fb923c', '#f472b6', '#34d399']

export function SoldOverlay(props: { data: SoldOverlayData | null; onDone: () => void }) {
  if (!props.data) return null

  const color = teamColor(props.data.teamId)
  const meta = TEAM_META.find((t) => t.id === props.data!.teamId)
  const logo = teamLogo(props.data.teamId)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-12 sm:pt-16"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', cursor: 'pointer' }}
      onClick={props.onDone}
      role="button"
      tabIndex={0}
    >
      {/* Confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 48 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-sm opacity-0"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-12px',
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              animationName: 'confetti',
              animationDuration: `${1.4 + Math.random() * 0.8}s`,
              animationTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              animationFillMode: 'forwards',
              animationDelay: `${Math.random() * 0.4}s`,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border"
        style={{
          background: `linear-gradient(135deg, rgba(10,10,24,0.98) 0%, ${color}10 100%)`,
          borderColor: `${color}50`,
          boxShadow: `0 0 60px ${color}25, 0 30px 80px rgba(0,0,0,0.7)`,
          animation: 'sold-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        {/* Glow background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% -10%, ${color}40 0%, transparent 60%)`,
          }}
        />

        {/* Mobile: column, centered. sm+: row with space-between */}
        <div className="relative flex flex-col items-center gap-5 px-5 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-7 sm:text-left">
          <div className="flex items-center gap-4 sm:gap-5">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt=""
                className="h-14 w-14 object-contain sm:h-20 sm:w-20"
                style={{ filter: `drop-shadow(0 0 12px ${color}60)` }}
              />
            ) : null}
            <div>
              <div
                className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl"
                style={{ color, textShadow: `0 0 30px ${color}80` }}
              >
                SOLD!
              </div>
              <div className="mt-1 text-sm text-white/80 sm:text-base">
                <span className="font-bold text-white">{props.data.playerName}</span>
                <span className="text-white/50"> to </span>
                <span className="font-bold" style={{ color }}>
                  {meta?.name ?? props.data.teamId}
                </span>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col items-center rounded-2xl border px-5 py-3.5 sm:px-6 sm:py-4"
            style={{ background: `${color}12`, borderColor: `${color}35` }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: `${color}80` }}
            >
              Winning bid
            </div>
            <div
              className="mt-1 font-display text-4xl font-extrabold tabular-nums sm:text-5xl"
              style={{ color, textShadow: `0 0 20px ${color}60` }}
            >
              ₹{props.data.amountLakh}L
            </div>
            <div className="mt-0.5 text-xs text-white/40">
              ₹{(props.data.amountLakh / 100).toFixed(2)} Cr
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
