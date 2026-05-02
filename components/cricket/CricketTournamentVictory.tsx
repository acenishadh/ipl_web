'use client'

import { teamColor, teamLogo, TEAM_META } from '@/components/teamMeta'

function topOneRuns(tb: Record<string, { teamId: string; player: string; runs: number }> | undefined) {
  if (!tb) return null
  const rows = Object.values(tb)
  if (rows.length === 0) return null
  return rows.sort((a, b) => b.runs - a.runs)[0] ?? null
}

function topOneWickets(tb: Record<string, { teamId: string; player: string; wickets: number }> | undefined) {
  if (!tb) return null
  const rows = Object.values(tb)
  if (rows.length === 0) return null
  return rows.sort((a, b) => b.wickets - a.wickets)[0] ?? null
}

export function CricketTournamentVictory(props: { league: any }) {
  const lg = props.league
  const champ = lg?.championTeamId as string | undefined
  const meta = TEAM_META.find((t) => t.id === champ)
  const c = teamColor(champ)
  const orange = topOneRuns(lg?.tournamentBatting)
  const purple = topOneWickets(lg?.tournamentBowling)

  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border p-8 text-center sm:p-12"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,214,10,0.15) 0%, rgba(10,10,24,0.95) 50%)',
        borderColor: 'rgba(255,214,10,0.35)',
        boxShadow: '0 0 60px rgba(255,214,10,0.12)',
      }}
    >
      <div className="text-6xl">🏆</div>
      <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">Champions</h2>
      {champ && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-3xl border-2"
            style={{ borderColor: `${c}60`, background: `${c}15` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={teamLogo(champ) ?? ''} alt="" className="h-16 w-16 object-contain" />
          </div>
          <div className="font-display text-4xl font-bold" style={{ color: c }}>
            {champ}
          </div>
          {meta && <p className="text-sm text-white/50">{meta.name}</p>}
        </div>
      )}
      <p className="mt-6 max-w-md text-sm text-white/50">
        Congratulations to everyone who played — what a tournament!
      </p>

      {(orange || purple) && (
        <div className="mt-8 grid w-full max-w-lg gap-4 sm:grid-cols-2">
          {orange && (
            <div
              className="rounded-2xl border px-4 py-4 text-left"
              style={{ borderColor: 'rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.08)' }}
            >
              <div className="text-xs font-bold uppercase tracking-widest text-orange-400">Orange Cap winner</div>
              <div className="mt-2 font-display text-lg font-bold text-white">{orange.player}</div>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamLogo(orange.teamId) ?? ''} alt="" className="h-4 w-4 object-contain" />
                {orange.teamId} · <span className="font-mono text-orange-300">{orange.runs} runs</span>
              </div>
            </div>
          )}
          {purple && (
            <div
              className="rounded-2xl border px-4 py-4 text-left"
              style={{ borderColor: 'rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.08)' }}
            >
              <div className="text-xs font-bold uppercase tracking-widest text-purple-400">Purple Cap winner</div>
              <div className="mt-2 font-display text-lg font-bold text-white">{purple.player}</div>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamLogo(purple.teamId) ?? ''} alt="" className="h-4 w-4 object-contain" />
                {purple.teamId} · <span className="font-mono text-purple-300">{purple.wickets} wickets</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
