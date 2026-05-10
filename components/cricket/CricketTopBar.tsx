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
  const overSlotCount = Math.max(6, overBalls.length)
  const freeHit = !!inn?.freeHitNext

  const emptySlotStyle = { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.15)' }

  function overCellStyle(v: string | undefined) {
    if (!v) return emptySlotStyle
    if (v === 'Wd' || v.startsWith('Wd')) {
      return { background: 'rgba(56,189,248,0.12)', borderColor: 'rgba(56,189,248,0.4)', color: '#7dd3fc' }
    }
    if (v.startsWith('Nb')) {
      return { background: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.4)', color: '#fcd34d' }
    }
    if (v.startsWith('FH')) {
      return { background: 'rgba(168,85,247,0.12)', borderColor: 'rgba(168,85,247,0.4)', color: '#d8b4fe' }
    }
    if (v === 'W' || v === 'w') {
      return { background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.45)', color: '#fca5a5' }
    }
    if (v === 'R' || v === 'r') {
      return { background: 'rgba(249,115,22,0.15)', borderColor: 'rgba(249,115,22,0.4)', color: '#fdba74' }
    }
    if (v === '4' || v === '6') {
      return { background: 'rgba(0,212,255,0.12)', borderColor: 'rgba(0,212,255,0.35)', color: '#67e8f9' }
    }
    return { background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)' }
  }

  function overCellText(v: string) {
    if (v === 'Wd') return 'Wd'
    if (v.startsWith('Nb+')) return v.replace('Nb+', 'nb+')
    if (v.startsWith('Nb')) return 'Nb'
    if (v.startsWith('FH·')) return v.replace('FH·', 'FH')
    if (v === 'W' || v === 'R') return v
    return v
  }

  function sr(runs: number, balls: number) {
    if (balls === 0) return '0.0'
    return ((runs / balls) * 100).toFixed(1)
  }

  const battingColor = inn ? teamColor(inn.battingTeamId) : null

  return (
    <div
      className="overflow-hidden rounded-2xl border sm:rounded-3xl"
      style={{
        background: 'rgba(10,10,24,0.97)',
        borderColor: battingColor ? `${battingColor}30` : 'rgba(255,255,255,0.08)',
        boxShadow: battingColor
          ? `0 6px 32px rgba(0,0,0,0.5), 0 0 0 1px ${battingColor}18, inset 0 1px 0 rgba(255,255,255,0.06)`
          : '0 6px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* ── MOBILE layout (< sm): teams row + score row ── */}
      <div className="sm:hidden">
        {/* Teams row */}
        <div className="flex items-center justify-between gap-1.5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            {home ? (
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                style={{ background: `${hColor}18`, borderColor: `${hColor}30` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamLogo(home) ?? ''} alt="" className="h-7 w-7 object-contain" />
              </div>
            ) : null}
            <div>
              <div className="text-sm font-extrabold leading-tight" style={{ color: hColor }}>
                {home ?? '—'}
              </div>
              {hMeta?.name && (
                <div className="max-w-[72px] truncate text-[9px] leading-none text-white/35">
                  {hMeta.name}
                </div>
              )}
            </div>
          </div>

          <div
            className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
          >
            VS
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-extrabold leading-tight" style={{ color: aColor }}>
                {away ?? '—'}
              </div>
              {aMeta?.name && (
                <div className="max-w-[72px] truncate text-right text-[9px] leading-none text-white/35">
                  {aMeta.name}
                </div>
              )}
            </div>
            {away ? (
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                style={{ background: `${aColor}18`, borderColor: `${aColor}30` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamLogo(away) ?? ''} alt="" className="h-7 w-7 object-contain" />
              </div>
            ) : null}
          </div>
        </div>

        {/* Score row — full width, no truncation */}
        <div
          className="border-t px-3 py-2.5 text-center"
          style={{
            borderColor: 'rgba(255,255,255,0.06)',
            background: battingColor ? `${battingColor}0c` : 'rgba(0,0,0,0.18)',
          }}
        >
          <div
            className="font-display text-xl font-extrabold tabular-nums text-white"
            style={{ textShadow: `0 0 20px ${battingColor ?? 'rgba(255,255,255,0.3)'}` }}
          >
            {props.scoreText}
          </div>
          {props.subText && (
            <div
              className="mt-1 inline-block rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
            >
              {props.subText}
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP layout (sm+): single row ── */}
      <div className="hidden sm:flex items-center justify-between gap-2 px-6 py-4">
        {/* Home team */}
        <div className="flex min-w-0 items-center gap-3">
          {home ? (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
              style={{ background: `${hColor}18`, borderColor: `${hColor}30` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo(home) ?? ''} alt="" className="h-10 w-10 object-contain" />
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="font-display text-lg font-bold" style={{ color: hColor }}>
              {home ?? '—'}
            </div>
            <div className="line-clamp-1 truncate text-xs leading-tight text-white/35">
              {hMeta?.name ?? '\u00a0'}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className="flex min-w-0 flex-1 flex-col items-center px-4 text-center">
          <div
            className="w-full px-0.5 font-display text-base font-extrabold tabular-nums text-white md:text-lg"
            style={{ textShadow: `0 0 20px ${battingColor ?? 'rgba(255,255,255,0.2)'}` }}
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
        <div className="flex min-w-0 items-center justify-end gap-3">
          <div className="min-w-0 text-right">
            <div className="font-display text-lg font-bold" style={{ color: aColor }}>
              {away ?? '—'}
            </div>
            <div className="line-clamp-1 truncate text-xs leading-tight text-white/35">
              {aMeta?.name ?? '\u00a0'}
            </div>
          </div>
          {away ? (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border"
              style={{ background: `${aColor}18`, borderColor: `${aColor}30` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo(away) ?? ''} alt="" className="h-10 w-10 object-contain" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Run rates + chase equation */}
      {inn && (props.matchStatus === 'INNINGS1' || props.matchStatus === 'INNINGS2') && (
        <div
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t px-3 py-2 sm:gap-x-5 sm:px-6"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}
        >
          {crr != null && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs">
              <span className="font-semibold text-white/45">CRR</span>
              <span className="font-display font-bold tabular-nums text-white">{crr}</span>
            </span>
          )}
          {props.matchStatus === 'INNINGS2' && props.target != null && (
            <>
              {rrr != null && runsNeeded != null && ballsLeft > 0 && (
                <span className="flex items-center gap-1 text-[10px] sm:text-xs">
                  <span className="font-semibold text-white/45">RRR</span>
                  <span className="font-display font-bold tabular-nums text-amber-300">{rrr}</span>
                </span>
              )}
              {runsNeeded != null && (
                <span className="text-[10px] font-semibold text-white/45 sm:text-xs">
                  Need{' '}
                  <span className="font-display font-extrabold tabular-nums" style={{ color: (runsNeeded <= 12) ? '#4ade80' : '#f87171' }}>
                    {runsNeeded}
                  </span>
                  {' '}off{' '}
                  <span className="font-display font-bold tabular-nums text-white">{ballsLeft}</span>
                  {' '}balls
                </span>
              )}
            </>
          )}
        </div>
      )}

      {freeHit && (
        <div
          className="border-t px-4 py-1.5 text-center text-[10px] font-bold sm:px-6"
          style={{ borderColor: 'rgba(168,85,247,0.25)', background: 'rgba(168,85,247,0.08)', color: '#e9d5ff' }}
        >
          FREE HIT — matching picks can’t dismiss you (no ball & free hit)
        </div>
      )}

      {/* Current over (6+ slots when wides / no-balls) */}
      {overBalls.length > 0 && (
        <div
          className="flex flex-wrap items-center justify-center gap-1 border-t px-2 py-2.5 sm:gap-2 sm:px-6"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="mr-0.5 w-full text-center text-[9px] font-bold uppercase tracking-widest text-white/30 sm:mr-2 sm:w-auto sm:text-left">This over</span>
          {Array.from({ length: overSlotCount }).map((_, i) => {
            const v = overBalls[i]
            const filled = v !== undefined
            const cs = filled ? overCellStyle(v) : emptySlotStyle
            return (
              <div
                key={i}
                className="flex h-8 min-w-8 max-w-[3rem] shrink-0 items-center justify-center rounded-lg border px-1 font-mono text-[10px] font-extrabold leading-tight sm:h-9 sm:min-w-9 sm:text-xs"
                style={cs}
              >
                {filled ? overCellText(v) : '·'}
              </div>
            )
          })}
        </div>
      )}

      {/* Live batters + bowler strip */}
      {inn && (strikerLive || nonStriker) && (
        <div
          className="flex items-center justify-between gap-2 border-t px-3 py-2 sm:px-6"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
        >
          {/* Batting side */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="shrink-0 text-[11px]">🏏</span>
            <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:gap-3">
              {/* Striker */}
              {strikerLive && (
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[11px] font-extrabold"
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
                <div className="flex items-center gap-1.5 opacity-55">
                  <span className="text-[10px] font-semibold text-white/55">
                    {nonStriker.name.split(' ').pop()}
                  </span>
                  <span className="font-display text-xs tabular-nums text-white/45">
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
              <span className="text-[11px]">⚾</span>
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
