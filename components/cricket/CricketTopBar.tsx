'use client'

import { TEAM_META, teamColor, teamLogo } from '@/components/teamMeta'

export function CricketTopBar(props: {
  homeTeamId: string | null
  awayTeamId: string | null
  scoreText: string
  subText?: string
  innings?: any    // current innings for live batter display
}) {
  const home = props.homeTeamId
  const away = props.awayTeamId
  const hMeta = TEAM_META.find((t) => t.id === home)
  const aMeta = TEAM_META.find((t) => t.id === away)
  const hColor = teamColor(home)
  const aColor = teamColor(away)

  const inn = props.innings
  const striker: any = inn?.batters?.[inn.strikerIndex] ?? null
  const nonStriker: any = inn?.batters?.[inn.nonStrikerIndex] ?? null
  const bowler: any = inn?.currentBowlerName
    ? inn.bowlers?.find((b: any) => b.name === inn.currentBowlerName)
    : null
  const showBatters = !!(striker && (inn?.status === 'INNINGS1' || inn?.status === 'INNINGS2' || inn?.balls > 0))

  function sr(runs: number, balls: number) {
    if (balls === 0) return '0.0'
    return ((runs / balls) * 100).toFixed(1)
  }

  return (
    <div
      className="overflow-hidden rounded-3xl border"
      style={{
        background: 'rgba(10,10,24,0.95)',
        borderColor: 'rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Main score row */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        {/* Home team */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {home ? (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
              style={{ background: `${hColor}18` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo(home) ?? ''} alt="" className="h-8 w-8 object-contain sm:h-10 sm:w-10" />
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="font-display text-base font-bold sm:text-lg" style={{ color: hColor }}>
              {home ?? '—'}
            </div>
            <div className="hidden truncate text-xs text-white/35 sm:block">{hMeta?.name ?? ''}</div>
          </div>
        </div>

        {/* Score */}
        <div className="flex min-w-0 flex-1 flex-col items-center px-2 text-center sm:px-4">
          <div
            className="w-full truncate font-display text-xs font-bold text-white sm:text-sm md:text-base"
            style={{ textShadow: '0 0 15px rgba(255,255,255,0.2)' }}
          >
            {props.scoreText}
          </div>
          <div
            className="mt-0.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
          >
            {props.subText ?? 'vs'}
          </div>
        </div>

        {/* Away team */}
        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          <div className="min-w-0 text-right">
            <div className="font-display text-base font-bold sm:text-lg" style={{ color: aColor }}>
              {away ?? '—'}
            </div>
            <div className="hidden truncate text-xs text-white/35 sm:block">{aMeta?.name ?? ''}</div>
          </div>
          {away ? (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
              style={{ background: `${aColor}18` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo(away) ?? ''} alt="" className="h-8 w-8 object-contain sm:h-10 sm:w-10" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Live batters + bowler strip */}
      {inn && striker && (
        <div
          className="flex items-center justify-between gap-2 border-t px-4 py-2 sm:px-6"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          {/* Batting side */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="shrink-0 text-[10px] text-white/25">🏏</span>
            <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:gap-3">
              {/* Striker */}
              {striker && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-extrabold"
                    style={{ color: teamColor(inn.battingTeamId) }}
                  >
                    {striker.name.split(' ').pop()}*
                  </span>
                  <span className="font-display text-xs font-bold tabular-nums text-white">
                    {striker.runs}
                    <span className="text-[9px] text-white/40"> ({striker.balls}b)</span>
                  </span>
                  {striker.balls > 0 && (
                    <span className="hidden text-[9px] text-white/25 sm:inline">SR {sr(striker.runs, striker.balls)}</span>
                  )}
                </div>
              )}
              {/* Non-striker */}
              {nonStriker && nonStriker.name !== striker?.name && (
                <div className="flex items-center gap-1.5 opacity-60">
                  <span className="text-[10px] font-semibold text-white/60">
                    {nonStriker.name.split(' ').pop()}
                  </span>
                  <span className="font-display text-xs tabular-nums text-white/50">
                    {nonStriker.runs}
                    <span className="text-[9px] text-white/30"> ({nonStriker.balls}b)</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bowler side */}
          {bowler && (
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="text-[10px] text-white/25">⚾</span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: teamColor(inn.bowlingTeamId) }}
              >
                {bowler.name.split(' ').pop()}
              </span>
              <span className="font-display text-[10px] tabular-nums text-white/50">
                {bowler.wickets}/{bowler.runs}
                <span className="text-white/25"> ({Math.floor(bowler.balls / 6)}.{bowler.balls % 6})</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
