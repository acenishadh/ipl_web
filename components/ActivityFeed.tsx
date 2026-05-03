'use client'

import type { PlayerLite } from '@/lib/usePlayersIndex'
import { TEAM_META, teamColor, teamLogo } from './teamMeta'

export function ActivityFeed(props: { events: string[]; playersById: Map<string, PlayerLite> }) {
  return (
    <div className="game-panel rounded-3xl border border-amber-400/10 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-white">⚡ Activity</h3>
        <span className="text-xs text-white/30">{props.events.length} events</span>
      </div>
      <div className="mt-3 max-h-[420px] space-y-2 overflow-auto pr-1">
        {props.events.length === 0 ? (
          <div className="py-8 text-center text-sm text-white/25">No events yet. Auction starts soon.</div>
        ) : null}
        {props.events.map((raw, idx) => {
          const parsed = safeJson(raw)
          const type = parsed?.type ?? 'INFO'
          const ui = formatEvent(parsed, props.playersById)
          return (
            <div
              key={idx}
              className="flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div className="min-w-0 flex-1">
                {ui ?? (
                  <div className="flex items-center gap-2">
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
                    >
                      {type}
                    </span>
                    <div className="truncate text-sm text-white/60">{raw}</div>
                  </div>
                )}
              </div>
              {parsed?.ts ? (
                <div className="shrink-0 text-[10px] text-white/25">{timeAgo(parsed.ts)}</div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function safeJson(s: string): any | null {
  try { return JSON.parse(s) } catch { return null }
}

function formatEvent(e: any, playersById: Map<string, PlayerLite>): React.ReactNode | null {
  if (!e || typeof e !== 'object') return null

  if (e.type === 'LOT_START') return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-lg">🏏</span>
      <span className="text-white/70">New player up for auction</span>
    </div>
  )
  if (e.type === 'UNSOLD') return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-lg">❌</span>
      <span className="text-white/60">Player went unsold</span>
    </div>
  )
  if (e.type === 'PAUSE') return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-lg">{e.paused ? '⏸️' : '▶️'}</span>
      <span className="text-white/60">{e.paused ? 'Auction paused' : 'Auction resumed'}</span>
    </div>
  )

  if (e.type === 'BID' || e.type === 'SOLD') {
    const teamId = String(e.teamId ?? '')
    const color = teamColor(teamId)
    const logo = teamLogo(teamId)
    const teamName = TEAM_META.find((t) => t.id === teamId)?.name ?? teamId
    const playerName = typeof e.playerId === 'string'
      ? playersById.get(e.playerId)?.name ?? e.playerId
      : 'Player'
    const amount = typeof e.amountLakh === 'number' ? `₹${e.amountLakh}L` : ''
    const isSold = e.type === 'SOLD'

    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span
          className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-bold"
          style={{ background: `${color}18`, borderColor: `${color}40`, color }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-3.5 w-3.5 object-contain" />
          ) : null}
          {teamId}
        </span>
        {isSold ? <span className="font-bold text-white">🔨 SOLD</span> : null}
        <span className="text-white/60">
          {isSold ? '' : 'bid on '}<span className="font-semibold text-white/90">{playerName}</span>
          {amount ? <> for <span className="font-mono font-bold" style={{ color }}>{amount}</span></> : null}
        </span>
      </div>
    )
  }

  return <div className="text-sm text-white/50">{JSON.stringify(e)}</div>
}

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000))
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  return `${Math.floor(m / 60)}h`
}
