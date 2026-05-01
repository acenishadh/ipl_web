'use client'

import { teamColor, teamLogo } from '@/components/teamMeta'

export function CricketMatchSummary(props: {
  match: any
  league: any
  awaitingProceed?: boolean
  onProceed?: () => void
}) {
  const m = props.match
  const inn1 = m?.innings?.[0] ?? null
  const inn2 = m?.innings?.[1] ?? null
  const winner = m?.winnerTeamId ?? null
  const winColor = teamColor(winner)
  const isQuick = props.league?.mode === 'QUICK' || !props.league
  const awaitingProceed = props.awaitingProceed ?? false

  const overs = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`

  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
      style={{
        background: 'rgba(10,10,24,0.95)',
        borderColor: winner ? `${winColor}35` : 'rgba(255,255,255,0.07)',
        boxShadow: winner ? `0 0 40px ${winColor}10` : 'none',
      }}
    >
      {winner ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{ background: `radial-gradient(ellipse 70% 50% at 50% -10%, ${winColor}50 0%, transparent 60%)` }}
        />
      ) : null}

      <div className="relative">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,214,10,0.1)', borderColor: 'rgba(255,214,10,0.3)', color: '#ffd60a' }}
            >
              🏆 Match Summary
            </div>
            <h2
              className="mt-3 font-display text-3xl font-extrabold sm:text-4xl"
              style={{ color: winner ? winColor : '#fff', textShadow: winner ? `0 0 20px ${winColor}50` : 'none' }}
            >
              {winner ? `${winner} won!` : 'Match tied!'}
            </h2>
            <p className="mt-1 text-xs text-white/40 sm:text-sm">
              {isQuick ? '🎉 Match complete!' : awaitingProceed ? 'Ready for next match.' : 'Match complete.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {m?.homeTeamId ? (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl border"
                style={{ background: `${teamColor(m.homeTeamId)}18`, borderColor: `${teamColor(m.homeTeamId)}35` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamLogo(m.homeTeamId) ?? ''} alt="" className="h-10 w-10 object-contain" />
              </div>
            ) : null}
            <div className="font-display text-lg font-bold text-white/30">VS</div>
            {m?.awayTeamId ? (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl border"
                style={{ background: `${teamColor(m.awayTeamId)}18`, borderColor: `${teamColor(m.awayTeamId)}35` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamLogo(m.awayTeamId) ?? ''} alt="" className="h-10 w-10 object-contain" />
              </div>
            ) : null}
          </div>
        </div>

        {/* Innings */}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            { label: 'Innings 1', inn: inn1 },
            { label: 'Innings 2', inn: inn2 },
          ].map(({ label, inn }) => {
            const inColor = inn ? teamColor(inn.battingTeamId) : '#fff'
            return (
              <div
                key={label}
                className="rounded-2xl border p-4"
                style={{
                  background: inn ? `${inColor}08` : 'rgba(255,255,255,0.03)',
                  borderColor: inn ? `${inColor}25` : 'rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: inn ? `${inColor}80` : 'rgba(255,255,255,0.3)' }}
                >
                  {label}
                </div>
                {inn ? (
                  <>
                    <div className="mt-2 flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={teamLogo(inn.battingTeamId) ?? ''} alt="" className="h-6 w-6 object-contain" />
                      <span className="font-bold" style={{ color: inColor }}>{inn.battingTeamId}</span>
                    </div>
                    <div className="mt-1 font-display text-3xl font-extrabold tabular-nums text-white">
                      {inn.runs}/{inn.wickets}
                    </div>
                    <div className="mt-0.5 text-sm text-white/40">({overs(inn.balls)} overs)</div>
                    {m?.target && label === 'Innings 2' ? (
                      <div
                        className="mt-2 rounded-lg border px-2 py-1 text-xs font-bold"
                        style={{ background: 'rgba(255,214,10,0.1)', borderColor: 'rgba(255,214,10,0.25)', color: '#fbbf24' }}
                      >
                        Target was {m.target}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="mt-2 text-sm text-white/25">—</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Proceed button */}
        {awaitingProceed && props.onProceed && (
          <div className="mt-5 flex justify-center">
            <button
              onClick={props.onProceed}
              className="relative flex items-center gap-3 overflow-hidden rounded-2xl border px-8 py-4 font-display text-base font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(99,102,241,0.15) 100%)',
                borderColor: 'rgba(0,212,255,0.4)',
                color: '#00d4ff',
                boxShadow: '0 0 30px rgba(0,212,255,0.15)',
              }}
            >
              <span className="text-lg">▶</span>
              Proceed to Next Match
            </button>
          </div>
        )}

        {/* Points table — only for tournament mode */}
        {!isQuick && (
          <div
            className="mt-4 rounded-2xl border p-3 sm:mt-5 sm:p-4"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="text-xs font-bold uppercase tracking-widest text-white/40">Points Table</div>
            <div className="mt-2 overflow-x-auto sm:mt-3">
              <table className="w-full min-w-[260px] text-xs">
                <thead>
                  <tr className="border-b text-white/30" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                    <th className="pb-2 text-left font-semibold">Team</th>
                    <th className="pb-2 text-center font-semibold">P</th>
                    <th className="pb-2 text-center font-semibold">W</th>
                    <th className="pb-2 text-center font-semibold">L</th>
                    <th className="pb-2 text-center font-semibold">Pts</th>
                    <th className="pb-2 text-right font-semibold">NRR</th>
                  </tr>
                </thead>
                <tbody>
                  {(props.league?.pointsTable ?? []).map((r: any, i: number) => {
                    const rowColor = teamColor(r.teamId)
                    const qualified = i < (props.league?.qualifyCount ?? 4)
                    return (
                      <tr key={r.teamId} style={{ background: qualified ? `${rowColor}08` : 'transparent' }}>
                        <td className="py-1">
                          <div className="flex items-center gap-1.5">
                            {qualified && <span className="text-[8px] font-bold text-green-400">{i + 1}</span>}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={teamLogo(r.teamId) ?? ''} alt="" className="h-4 w-4 object-contain sm:h-5 sm:w-5" />
                            <span className="font-bold" style={{ color: rowColor }}>{r.teamId}</span>
                          </div>
                        </td>
                        <td className="text-center text-white/55">{r.played}</td>
                        <td className="text-center text-white/55">{r.won}</td>
                        <td className="text-center text-white/55">{r.lost}</td>
                        <td className="text-center font-mono font-bold text-white">{r.points}</td>
                        <td className="text-right font-mono text-white/40">{Number(r.nrr).toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
