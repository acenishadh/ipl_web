'use client'

import { teamColor, teamLogo } from '@/components/teamMeta'

type RowR = { teamId: string; player: string; runs: number }
type RowW = { teamId: string; player: string; wickets: number }

function topRuns(tb: Record<string, RowR> | undefined, n: number): RowR[] {
  if (!tb) return []
  return Object.values(tb)
    .sort((a, b) => b.runs - a.runs || a.player.localeCompare(b.player))
    .slice(0, n)
}

function topWickets(tb: Record<string, RowW> | undefined, n: number): RowW[] {
  if (!tb) return []
  return Object.values(tb)
    .sort((a, b) => b.wickets - a.wickets || a.player.localeCompare(b.player))
    .slice(0, n)
}

export function CricketCapLeaderboards(props: { league: any }) {
  const lg = props.league
  const bat = topRuns(lg?.tournamentBatting, 5)
  const bowl = topWickets(lg?.tournamentBowling, 5)

  if (bat.length === 0 && bowl.length === 0) {
    return (
      <div
        className="rounded-2xl border p-4 text-center text-xs text-white/35"
        style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        Orange & Purple Cap stats appear after group stage matches are played.
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div
        className="rounded-2xl border p-4"
        style={{
          background: 'rgba(10,10,24,0.95)',
          borderColor: 'rgba(249,115,22,0.35)',
          boxShadow: '0 0 24px rgba(249,115,22,0.08)',
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl">🧢</span>
          <h3 className="font-display text-sm font-bold text-orange-400">Orange Cap · Runs</h3>
        </div>
        <ol className="space-y-2">
          {bat.length === 0 && <li className="text-xs text-white/30">No data yet</li>}
          {bat.map((r, i) => {
            const col = teamColor(r.teamId)
            return (
              <li
                key={`${r.teamId}-${r.player}`}
                className="flex items-center justify-between gap-2 rounded-xl border px-2 py-1.5 text-xs"
                style={{ borderColor: `${col}30`, background: `${col}08` }}
              >
                <span className="font-mono text-white/40">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamLogo(r.teamId) ?? ''} alt="" className="h-5 w-5 object-contain" />
                <span className="min-w-0 flex-1 truncate font-semibold text-white">{r.player}</span>
                <span className="font-mono font-bold tabular-nums" style={{ color: col }}>
                  {r.runs}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div
        className="rounded-2xl border p-4"
        style={{
          background: 'rgba(10,10,24,0.95)',
          borderColor: 'rgba(168,85,247,0.35)',
          boxShadow: '0 0 24px rgba(168,85,247,0.08)',
        }}
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl">🎩</span>
          <h3 className="font-display text-sm font-bold text-purple-400">Purple Cap · Wickets</h3>
        </div>
        <ol className="space-y-2">
          {bowl.length === 0 && <li className="text-xs text-white/30">No data yet</li>}
          {bowl.map((r, i) => {
            const col = teamColor(r.teamId)
            return (
              <li
                key={`${r.teamId}-${r.player}`}
                className="flex items-center justify-between gap-2 rounded-xl border px-2 py-1.5 text-xs"
                style={{ borderColor: `${col}30`, background: `${col}08` }}
              >
                <span className="font-mono text-white/40">{i + 1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamLogo(r.teamId) ?? ''} alt="" className="h-5 w-5 object-contain" />
                <span className="min-w-0 flex-1 truncate font-semibold text-white">{r.player}</span>
                <span className="font-mono font-bold tabular-nums" style={{ color: col }}>
                  {r.wickets}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
