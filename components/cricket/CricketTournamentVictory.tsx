'use client'

import { teamColor, teamLogo, TEAM_META } from '@/components/teamMeta'

function topOneRuns(tb: Record<string, { teamId: string; player: string; runs: number }> | undefined) {
  if (!tb) return null
  const rows = Object.values(tb)
  if (rows.length === 0) return null
  return rows.sort((a, b) => b.runs - a.runs || a.player.localeCompare(b.player))[0] ?? null
}

function topOneWickets(tb: Record<string, { teamId: string; player: string; wickets: number }> | undefined) {
  if (!tb) return null
  const rows = Object.values(tb)
  if (rows.length === 0) return null
  return rows.sort((a, b) => b.wickets - a.wickets || a.player.localeCompare(b.player))[0] ?? null
}

function resolveRunnerUp(lg: any): string | null {
  if (lg?.runnerUpTeamId) return lg.runnerUpTeamId as string
  const finals = (lg?.playoffs as { stage: string; loserTeamId: string | null }[] | undefined)?.find(
    (p) => p.stage === 'FINALS'
  )
  return finals?.loserTeamId ?? null
}

function TeamPodium(props: { teamId: string; title: string; rank: 1 | 2; blurb: string }) {
  const { teamId, title, rank, blurb } = props
  const c = teamColor(teamId)
  const meta = TEAM_META.find((t) => t.id === teamId)
  const isChamp = rank === 1
  return (
    <div
      className="flex flex-1 flex-col items-center rounded-2xl border p-5 sm:p-6"
      style={{
        background: isChamp
          ? `linear-gradient(160deg, ${c}18 0%, rgba(10,10,24,0.95) 55%)`
          : 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(10,10,24,0.92) 100%)',
        borderColor: isChamp ? `${c}50` : 'rgba(255,255,255,0.1)',
        boxShadow: isChamp ? `0 0 48px ${c}20` : undefined,
      }}
    >
      <div
        className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: isChamp ? c : 'rgba(255,255,255,0.35)' }}
      >
        {title}
      </div>
      <div className="text-4xl sm:text-5xl">{isChamp ? '🏆' : '🥈'}</div>
      <div
        className="mt-4 flex h-20 w-20 items-center justify-center rounded-2xl border-2 sm:h-24 sm:w-24"
        style={{ borderColor: `${c}55`, background: `${c}12` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={teamLogo(teamId) ?? ''} alt="" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
      </div>
      <div className="mt-3 font-display text-2xl font-bold sm:text-3xl" style={{ color: c }}>
        {teamId}
      </div>
      {meta && <p className="mt-1 text-xs text-white/45">{meta.name}</p>}
      <p className="mt-3 text-center text-xs leading-relaxed text-white/40">{blurb}</p>
    </div>
  )
}

/** Full-screen style finals celebration: champion, runner-up, Orange & Purple cap toppers. */
export function CricketTournamentVictory(props: { league: any }) {
  const lg = props.league
  const champ = lg?.championTeamId as string | undefined
  const runnerUp = resolveRunnerUp(lg)
  const orange = topOneRuns(lg?.tournamentBatting)
  const purple = topOneWickets(lg?.tournamentBowling)

  return (
    <div className="space-y-6">
      <div
        className="overflow-hidden rounded-2xl border text-center sm:rounded-3xl"
        style={{
          background:
            'radial-gradient(ellipse 90% 55% at 50% -30%, rgba(255,214,10,0.22) 0%, rgba(10,10,24,0.97) 45%)',
          borderColor: 'rgba(255,214,10,0.35)',
          boxShadow: '0 0 80px rgba(255,214,10,0.12)',
        }}
      >
        <div className="px-4 pb-8 pt-10 sm:px-8 sm:pb-12 sm:pt-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-amber-200/70">IPL Tournament · Final</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            Congratulations
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/50">
            What a season — from the group stage to the final, every match counted. Here’s how it ended.
          </p>

          {champ && runnerUp && champ !== runnerUp ? (
            <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-center sm:gap-6">
              <TeamPodium
                rank={1}
                teamId={champ}
                title="Winner"
                blurb="Your franchise lifts the trophy — champions of the tournament!"
              />
              <TeamPodium
                rank={2}
                teamId={runnerUp}
                title="Runner-up"
                blurb="An outstanding run — seconds by the finest of margins."
              />
            </div>
          ) : champ ? (
            <div className="mx-auto mt-10 max-w-md">
              <TeamPodium
                rank={1}
                teamId={champ}
                title="Champions"
                blurb="Congratulations — your franchise are tournament winners!"
              />
            </div>
          ) : (
            <p className="mt-8 text-sm text-white/40">Champion data will appear here once results are final.</p>
          )}
        </div>
      </div>

      {/* Orange & Purple cap — leaderboard toppers */}
      <div>
        <h2 className="mb-3 font-display text-sm font-bold text-white/80 sm:text-base">Individual honours</h2>
        <p className="mb-4 text-xs text-white/35">Orange Cap (most runs) and Purple Cap (most wickets) across the tournament.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {orange ? (
            <div
              className="relative overflow-hidden rounded-2xl border p-5 sm:p-6"
              style={{
                background: 'linear-gradient(145deg, rgba(249,115,22,0.14) 0%, rgba(10,10,20,0.96) 50%)',
                borderColor: 'rgba(249,115,22,0.45)',
                boxShadow: '0 0 40px rgba(249,115,22,0.12)',
              }}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/20 blur-2xl" />
              <div className="relative flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                <span className="text-5xl sm:mr-4">🧢</span>
                <div className="mt-3 flex-1 sm:mt-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-orange-300">Orange Cap · Top run-scorer</div>
                  <div className="mt-2 font-display text-2xl font-bold text-white">{orange.player}</div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-white/55 sm:justify-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={teamLogo(orange.teamId) ?? ''} alt="" className="h-6 w-6 object-contain" />
                    <span style={{ color: teamColor(orange.teamId) }} className="font-bold">
                      {orange.teamId}
                    </span>
                    <span className="font-mono text-lg font-bold text-orange-200">{orange.runs} runs</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl border border-dashed border-orange-500/25 bg-orange-500/5 p-6 text-center text-sm text-white/35"
            >
              No batting aggregate recorded for Orange Cap.
            </div>
          )}

          {purple ? (
            <div
              className="relative overflow-hidden rounded-2xl border p-5 sm:p-6"
              style={{
                background: 'linear-gradient(145deg, rgba(168,85,247,0.14) 0%, rgba(10,10,20,0.96) 50%)',
                borderColor: 'rgba(168,85,247,0.45)',
                boxShadow: '0 0 40px rgba(168,85,247,0.12)',
              }}
            >
              <div className="pointer-events-none absolute -left-6 -top-6 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />
              <div className="relative flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                <span className="text-5xl sm:mr-4">🎩</span>
                <div className="mt-3 flex-1 sm:mt-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-purple-300">Purple Cap · Top wicket-taker</div>
                  <div className="mt-2 font-display text-2xl font-bold text-white">{purple.player}</div>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-sm text-white/55 sm:justify-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={teamLogo(purple.teamId) ?? ''} alt="" className="h-6 w-6 object-contain" />
                    <span style={{ color: teamColor(purple.teamId) }} className="font-bold">
                      {purple.teamId}
                    </span>
                    <span className="font-mono text-lg font-bold text-purple-200">{purple.wickets} wickets</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="rounded-2xl border border-dashed border-purple-500/25 bg-purple-500/5 p-6 text-center text-sm text-white/35"
            >
              No bowling aggregate recorded for Purple Cap.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
