'use client'

import { teamColor, teamLogo } from '@/components/teamMeta'

type Fixture = { matchId: string; homeTeamId: string; awayTeamId: string }
type CompletedResult = { matchId: string; winnerTeamId: string | null }

export function CricketSchedule(props: { league: any; currentMatchId?: string | null }) {
  const fixtures: Fixture[] = props.league?.fixtures ?? []
  const results: CompletedResult[] = props.league?.completedResults ?? []
  const currentIdx: number = props.league?.currentMatchIndex ?? 0
  const botTeamIds: string[] = props.league?.botTeamIds ?? []

  if (fixtures.length === 0) return null

  const resultMap = new Map<string, string | null>()
  for (const r of results) resultMap.set(r.matchId, r.winnerTeamId)

  // Group into rounds of 5 (for 10-team round robin)
  const roundSize = Math.floor((props.league?.teamsCount ?? 10) / 2)
  const rounds: Fixture[][] = []
  for (let i = 0; i < fixtures.length; i += roundSize) {
    rounds.push(fixtures.slice(i, i + roundSize))
  }

  return (
    <div
      className="rounded-2xl border p-3 sm:rounded-3xl sm:p-5"
      style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <h3 className="font-display text-sm font-bold text-white sm:text-base">📅 Schedule</h3>
      <p className="mt-0.5 text-xs text-white/35">
        {fixtures.length} group stage matches · {results.length} completed
      </p>

      <div className="mt-3 max-h-80 space-y-4 overflow-y-auto pr-1 sm:max-h-[28rem]">
        {rounds.map((round, ri) => (
          <div key={ri}>
            <div
              className="mb-1.5 text-[9px] font-bold uppercase tracking-widest sm:text-[10px]"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              Round {ri + 1}
            </div>
            <div className="space-y-1">
              {round.map((fx, fi) => {
                const globalIdx = ri * roundSize + fi
                const winner = resultMap.get(fx.matchId)
                const isDone = resultMap.has(fx.matchId)
                const isCurrent = globalIdx === currentIdx && !props.league?.inPlayoffs
                const isBotMatch = botTeamIds.includes(fx.homeTeamId) && botTeamIds.includes(fx.awayTeamId)

                return (
                  <FixtureRow
                    key={fx.matchId}
                    fx={fx}
                    winner={winner}
                    isDone={isDone}
                    isCurrent={isCurrent}
                    isBotMatch={isBotMatch}
                    label={`M${globalIdx + 1}`}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FixtureRow({
  fx, winner, isDone, isCurrent, isBotMatch, label
}: {
  fx: Fixture
  winner?: string | null
  isDone: boolean
  isCurrent: boolean
  isBotMatch: boolean
  label: string
}) {
  const hColor = teamColor(fx.homeTeamId)
  const aColor = teamColor(fx.awayTeamId)

  const homeWon = isDone && winner === fx.homeTeamId
  const awayWon = isDone && winner === fx.awayTeamId
  const tied = isDone && !winner

  return (
    <div
      className="flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-xs"
      style={{
        background: isCurrent
          ? 'rgba(0,212,255,0.06)'
          : homeWon
          ? `${hColor}06`
          : awayWon
          ? `${aColor}06`
          : 'rgba(255,255,255,0.01)',
        borderColor: isCurrent
          ? 'rgba(0,212,255,0.3)'
          : isDone
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(255,255,255,0.04)',
      }}
    >
      <span className="w-5 shrink-0 text-[9px] text-white/25">{label}</span>

      {/* Home team */}
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={teamLogo(fx.homeTeamId) ?? ''}
          alt=""
          className="h-4 w-4 shrink-0 object-contain"
          style={{ opacity: isDone && !homeWon && !tied ? 0.4 : 1 }}
        />
        <span
          className="truncate font-bold"
          style={{ color: homeWon ? hColor : isDone ? 'rgba(255,255,255,0.35)' : hColor }}
        >
          {fx.homeTeamId}
        </span>
        {homeWon && (
          <span
            className="ml-0.5 shrink-0 rounded px-1 py-0.5 text-[8px] font-extrabold uppercase"
            style={{ background: `${hColor}22`, color: hColor }}
          >
            W
          </span>
        )}
        {isDone && !homeWon && !tied && (
          <span className="ml-0.5 shrink-0 text-[8px] font-bold text-white/20">L</span>
        )}
        {tied && (
          <span className="ml-0.5 shrink-0 text-[8px] font-bold text-yellow-500/60">T</span>
        )}
      </div>

      {/* Centre divider */}
      <div className="shrink-0 px-0.5 text-center">
        {isCurrent ? (
          <span className="animate-pulse text-[9px] font-bold text-cyan-400">LIVE</span>
        ) : isDone ? (
          <span className="text-[9px] text-white/15">·</span>
        ) : (
          <span className="text-[9px] text-white/20">vs</span>
        )}
      </div>

      {/* Away team */}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
        {tied && (
          <span className="mr-0.5 shrink-0 text-[8px] font-bold text-yellow-500/60">T</span>
        )}
        {isDone && !awayWon && !tied && (
          <span className="mr-0.5 shrink-0 text-[8px] font-bold text-white/20">L</span>
        )}
        {awayWon && (
          <span
            className="mr-0.5 shrink-0 rounded px-1 py-0.5 text-[8px] font-extrabold uppercase"
            style={{ background: `${aColor}22`, color: aColor }}
          >
            W
          </span>
        )}
        <span
          className="truncate font-bold"
          style={{ color: awayWon ? aColor : isDone ? 'rgba(255,255,255,0.35)' : aColor }}
        >
          {fx.awayTeamId}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={teamLogo(fx.awayTeamId) ?? ''}
          alt=""
          className="h-4 w-4 shrink-0 object-contain"
          style={{ opacity: isDone && !awayWon && !tied ? 0.4 : 1 }}
        />
      </div>

      {isBotMatch && (
        <span className="shrink-0 text-[9px] text-white/15">🤖</span>
      )}
    </div>
  )
}
