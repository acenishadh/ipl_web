'use client'

import { teamColor, teamLogo, TEAM_META } from '@/components/teamMeta'

/** Coerce server/snapshot honours fields so UI always gets plain objects + arrays. */
export function normalizeLeagueForAwards(input: unknown): any | null {
  if (!input || typeof input !== 'object') return null
  const lg = input as Record<string, unknown>
  const batting = lg.tournamentBatting
  const bowling = lg.tournamentBowling
  const battingRec =
    batting && typeof batting === 'object' && !Array.isArray(batting) ? ({ ...batting } as Record<string, unknown>) : {}
  const bowlingRec =
    bowling && typeof bowling === 'object' && !Array.isArray(bowling) ? ({ ...bowling } as Record<string, unknown>) : {}
  return {
    ...lg,
    championTeamId: lg.championTeamId ?? undefined,
    runnerUpTeamId: lg.runnerUpTeamId ?? undefined,
    tournamentBatting: battingRec,
    tournamentBowling: bowlingRec,
    playoffs: Array.isArray(lg.playoffs) ? lg.playoffs : [],
  }
}

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

export function resolveRunnerUp(lg: any): string | null {
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
        {teamLogo(teamId) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={teamLogo(teamId) as string} alt="" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-black text-white/60">
            {String(teamId).slice(0, 2)}
          </div>
        )}
      </div>
      <div className="mt-3 font-display text-2xl font-bold sm:text-3xl" style={{ color: c }}>
        {teamId}
      </div>
      {meta && <p className="mt-1 text-xs text-white/45">{meta.name}</p>}
      <p className="mt-3 text-center text-xs leading-relaxed text-white/40">{blurb}</p>
    </div>
  )
}

function RunnerPlaceholder() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-center sm:p-6"
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Runner-up</div>
      <div className="mt-4 text-4xl opacity-40">🥈</div>
      <p className="mt-4 text-sm text-white/40">Final placement not recorded yet.</p>
    </div>
  )
}

/** At-a-glance: champion, runner-up, Orange Cap, Purple Cap (e.g. top of champions page). */
export function TournamentAwardsSummary(props: { league: any }) {
  const lg = props.league
  const champ = lg?.championTeamId as string | undefined
  const runnerRaw = resolveRunnerUp(lg)
  const runnerUp = runnerRaw && runnerRaw !== champ ? runnerRaw : null
  const orange = topOneRuns(lg?.tournamentBatting)
  const purple = topOneWickets(lg?.tournamentBowling)

  const tileBase =
    'relative overflow-hidden rounded-2xl border p-4 sm:p-5 flex flex-col min-h-[140px] sm:min-h-[152px]'

  return (
    <section className="mb-6" aria-label="Tournament awards">
      <h2 className="mb-3 font-display text-sm font-bold tracking-wide text-white/85 sm:text-base">
        Season results
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Winner */}
        <div
          className={tileBase}
          style={{
            background: champ
              ? `linear-gradient(145deg, ${teamColor(champ)}22 0%, rgba(10,10,24,0.96) 55%)`
              : 'rgba(10,10,24,0.96)',
            borderColor: champ ? `${teamColor(champ)}55` : 'rgba(255,255,255,0.1)',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">🏆 Winner</div>
          {champ ? (
            <>
              <div className="mt-3 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 sm:h-14 sm:w-14"
                  style={{ borderColor: `${teamColor(champ)}66`, background: `${teamColor(champ)}14` }}
                >
                  {teamLogo(champ) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={teamLogo(champ) as string} alt="" className="h-9 w-9 object-contain sm:h-10 sm:w-10" />
                  ) : (
                    <span className="text-sm font-black text-white/60">{String(champ).slice(0, 2)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-xl font-bold" style={{ color: teamColor(champ) }}>
                    {champ}
                  </div>
                  <div className="truncate text-xs text-white/45">{TEAM_META.find((t) => t.id === champ)?.name}</div>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-auto text-sm text-white/40">Champion will appear once the final is complete.</p>
          )}
        </div>

        {/* Runner-up */}
        <div
          className={tileBase}
          style={{
            background: runnerUp
              ? `linear-gradient(145deg, ${teamColor(runnerUp)}18 0%, rgba(10,10,24,0.96) 55%)`
              : 'rgba(10,10,24,0.96)',
            borderColor: runnerUp ? `${teamColor(runnerUp)}44` : 'rgba(255,255,255,0.1)',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">🥈 Runner-up</div>
          {runnerUp ? (
            <div className="mt-3 flex items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 sm:h-14 sm:w-14"
                style={{ borderColor: `${teamColor(runnerUp)}55`, background: `${teamColor(runnerUp)}10` }}
              >
                {teamLogo(runnerUp) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={teamLogo(runnerUp) as string} alt="" className="h-9 w-9 object-contain sm:h-10 sm:w-10" />
                ) : (
                  <span className="text-sm font-black text-white/60">{String(runnerUp).slice(0, 2)}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-xl font-bold" style={{ color: teamColor(runnerUp) }}>
                  {runnerUp}
                </div>
                <div className="truncate text-xs text-white/45">{TEAM_META.find((t) => t.id === runnerUp)?.name}</div>
              </div>
            </div>
          ) : (
            <p className="mt-auto text-sm text-white/40">Runner-up will appear once the final is recorded.</p>
          )}
        </div>

        {/* Orange Cap */}
        <div
          className={tileBase}
          style={{
            background: 'linear-gradient(145deg, rgba(249,115,22,0.16) 0%, rgba(10,10,20,0.96) 50%)',
            borderColor: 'rgba(249,115,22,0.4)',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300/90">🧢 Orange Cap</div>
          {orange ? (
            <>
              <div className="mt-2 font-display text-lg font-bold leading-tight text-white sm:text-xl">{orange.player}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/55">
                <span style={{ color: teamColor(orange.teamId) }} className="font-bold">
                  {orange.teamId}
                </span>
                <span className="font-mono font-bold text-orange-200">{orange.runs} runs</span>
              </div>
            </>
          ) : (
            <p className="mt-auto text-sm text-white/40">No batting totals yet.</p>
          )}
        </div>

        {/* Purple Cap */}
        <div
          className={tileBase}
          style={{
            background: 'linear-gradient(145deg, rgba(168,85,247,0.16) 0%, rgba(10,10,20,0.96) 50%)',
            borderColor: 'rgba(168,85,247,0.4)',
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300/90">🎩 Purple Cap</div>
          {purple ? (
            <>
              <div className="mt-2 font-display text-lg font-bold leading-tight text-white sm:text-xl">{purple.player}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/55">
                <span style={{ color: teamColor(purple.teamId) }} className="font-bold">
                  {purple.teamId}
                </span>
                <span className="font-mono font-bold text-purple-200">{purple.wickets} wickets</span>
              </div>
            </>
          ) : (
            <p className="mt-auto text-sm text-white/40">No bowling totals yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}

/** Full-screen style finals celebration: champion & runner-up podium. Caps appear in `TournamentAwardsSummary`. */
export function CricketTournamentVictory(props: { league: any }) {
  const lg = props.league
  const champ = lg?.championTeamId as string | undefined
  const runnerRaw = resolveRunnerUp(lg)
  const runnerUp = runnerRaw && runnerRaw !== champ ? runnerRaw : null

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

          {champ ? (
            <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-center sm:gap-6">
              <TeamPodium
                rank={1}
                teamId={champ}
                title="Winner"
                blurb="Your franchise lifts the trophy — champions of the tournament!"
              />
              {runnerUp ? (
                <TeamPodium
                  rank={2}
                  teamId={runnerUp}
                  title="Runner-up"
                  blurb="An outstanding run — seconds by the finest of margins."
                />
              ) : (
                <RunnerPlaceholder />
              )}
            </div>
          ) : (
            <p className="mt-8 text-sm text-white/40">Champion data will appear here once results are final.</p>
          )}
        </div>
      </div>
    </div>
  )
}
