'use client'

import { TEAM_META, teamColor, teamLogo } from '@/components/teamMeta'

function formatRunsPerOver(runs: number, balls: number) {
  if (balls <= 0) return '0.00'
  return ((runs / balls) * 6).toFixed(2)
}

export function CricketTopBar(props: {
  homeTeamId: string | null
  awayTeamId: string | null
  scoreText: string
  subText?: string
  innings?: any    // current innings for live batter display
  matchStatus?: string | null
  target?: number | null
  oversPerMatch?: number
  currentOverBalls?: string[]
}) {
  const home = props.homeTeamId
  const away = props.awayTeamId
  const hMeta = TEAM_META.find((t) => t.id === home)
  const aMeta = TEAM_META.find((t) => t.id === away)
  const hColor = teamColor(home)
  const aColor = teamColor(away)

  const inn = props.innings
  const striker: any = inn?.batters?.[inn.strikerIndex] ?? null
  const strikerLive = striker && !striker.isOut ? striker : null
  const nonStriker: any = inn?.batters?.[inn.nonStrikerIndex] ?? null
  const bowler: any = inn?.currentBowlerName
    ? inn.bowlers?.find((b: any) => b.name === inn.currentBowlerName)
    : null
  const totalBalls = (props.oversPerMatch ?? 20) * 6
  const ballsBowled = inn?.balls ?? 0
  const ballsLeft = Math.max(0, totalBalls - ballsBowled)
  const crr = inn && ballsBowled > 0 ? formatRunsPerOver(inn.runs, ballsBowled) : null
  const isChase = props.matchStatus === 'INNINGS2' && props.target != null && inn
  const runsNeeded =
    isChase && props.target != null ? Math.max(0, props.target - (inn?.runs ?? 0)) : null
  const rrr =
    isChase && runsNeeded != null && ballsLeft > 0 ? formatRunsPerOver(runsNeeded, ballsLeft) : null
  const overBalls = props.currentOverBalls ?? []

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

      {/* Run rates + chase equation */}
      {inn && (props.matchStatus === 'INNINGS1' || props.matchStatus === 'INNINGS2') && (
        <div
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t px-4 py-2 text-[10px] sm:px-6"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}
        >
          {crr != null && (
            <span className="font-mono text-white/70">
              CRR <span className="font-bold text-white">{crr}</span>
            </span>
          )}
          {props.matchStatus === 'INNINGS2' && props.target != null && (
            <>
              {rrr != null && runsNeeded != null && ballsLeft > 0 && (
                <span className="font-mono text-white/70">
                  Req <span className="font-bold text-amber-300">{rrr}</span>
                </span>
              )}
              {runsNeeded != null && (
                <span className="font-mono text-white/55">
                  Need <span className="font-bold text-white">{runsNeeded}</span> off{' '}
                  <span className="font-bold text-white">{ballsLeft}</span> balls
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Current over (6 balls) */}
      {overBalls.length > 0 && (
        <div
          className="flex items-center justify-center gap-1 border-t px-4 py-2 sm:gap-1.5 sm:px-6"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="mr-1 text-[9px] font-bold uppercase tracking-widest text-white/35">This over</span>
          {Array.from({ length: 6 }).map((_, i) => {
            const v = overBalls[i]
            const filled = v !== undefined
            return (
              <div
                key={i}
                className="flex h-7 w-7 items-center justify-center rounded-lg border font-mono text-xs font-bold sm:h-8 sm:w-8"
                style={
                  filled
                    ? v === 'W' || v === 'w'
                      ? { background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.45)', color: '#fca5a5' }
                      : v === 'R' || v === 'r'
                        ? { background: 'rgba(249,115,22,0.15)', borderColor: 'rgba(249,115,22,0.4)', color: '#fdba74' }
                        : v === '4' || v === '6'
                          ? { background: 'rgba(0,212,255,0.12)', borderColor: 'rgba(0,212,255,0.35)', color: '#67e8f9' }
                          : { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }
                    : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.15)' }
                }
              >
                {filled ? (v === 'W' ? 'W' : v === 'R' ? 'R' : v) : '·'}
              </div>
            )
          })}
        </div>
      )}

      {/* Live batters + bowler strip */}
      {inn && (strikerLive || nonStriker) && (
        <div
          className="flex items-center justify-between gap-2 border-t px-4 py-2 sm:px-6"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          {/* Batting side */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="shrink-0 text-[10px] text-white/25">🏏</span>
            <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:gap-3">
              {/* Striker */}
              {strikerLive && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-extrabold"
                    style={{ color: teamColor(inn.battingTeamId) }}
                  >
                    {strikerLive.name.split(' ').pop()}*
                  </span>
                  <span className="font-display text-xs font-bold tabular-nums text-white">
                    {strikerLive.runs}
                    <span className="text-[9px] text-white/40"> ({strikerLive.balls}b)</span>
                  </span>
                  {strikerLive.balls > 0 && (
                    <span className="hidden text-[9px] text-white/25 sm:inline">SR {sr(strikerLive.runs, strikerLive.balls)}</span>
                  )}
                </div>
              )}
              {/* Non-striker */}
              {nonStriker && nonStriker.name !== strikerLive?.name && (
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
