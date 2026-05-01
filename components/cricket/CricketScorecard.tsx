'use client'

import { useState } from 'react'
import { teamColor, teamLogo } from '@/components/teamMeta'

function sr(runs: number, balls: number) {
  if (balls === 0) return '-'
  return ((runs / balls) * 100).toFixed(1)
}

function economy(runs: number, balls: number) {
  if (balls === 0) return '-'
  return ((runs / balls) * 6).toFixed(2)
}

function oversStr(balls: number) {
  return `${Math.floor(balls / 6)}.${balls % 6}`
}

function InningsCard({ inn, isLive }: { inn: any; isLive: boolean }) {
  const [activeView, setActiveView] = useState<'batting' | 'bowling'>('batting')
  const color = teamColor(inn.battingTeamId)
  const batters: any[] = inn.batters ?? []
  const bowlers: any[] = inn.bowlers ?? []
  const fow: any[] = inn.fallOfWickets ?? []

  const strikerIdx = inn.strikerIndex ?? -1
  const nonStrikerIdx = inn.nonStrikerIndex ?? -1

  // Split batters into batted and yet-to-bat
  const battedOrBatting = batters.filter((b, i) => b.isOut || i === strikerIdx || i === nonStrikerIdx || b.balls > 0)
  const yetToBat = batters.filter((b, i) => !b.isOut && i !== strikerIdx && i !== nonStrikerIdx && b.balls === 0)

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{ background: 'rgba(10,10,24,0.97)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* Innings header */}
      <div
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{ background: `linear-gradient(135deg, ${color}18 0%, transparent 70%)`, borderBottom: 'rgba(255,255,255,0.07) 1px solid' }}
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={teamLogo(inn.battingTeamId) ?? ''} alt="" className="h-9 w-9 object-contain" />
          <div>
            <div className="font-display text-base font-extrabold" style={{ color }}>{inn.battingTeamId}</div>
            <div className="text-xs text-white/40">batting</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-extrabold tabular-nums text-white">
            {inn.runs}/{inn.wickets}
          </div>
          <div className="text-xs text-white/40">({oversStr(inn.balls)} ov)</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div
        className="flex border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        {(['batting', 'bowling'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className="flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider transition-colors"
            style={activeView === v
              ? { color, borderBottom: `2px solid ${color}` }
              : { color: 'rgba(255,255,255,0.3)', borderBottom: '2px solid transparent' }
            }
          >
            {v}
          </button>
        ))}
      </div>

      <div className="p-3 sm:p-4">
        {activeView === 'batting' ? (
          <>
            {/* Batting table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th className="pb-2 text-left font-semibold text-white/30" colSpan={2}>Batter</th>
                    <th className="pb-2 text-center font-semibold text-white/30">R</th>
                    <th className="pb-2 text-center font-semibold text-white/30">B</th>
                    <th className="pb-2 text-center font-semibold text-white/30">4s</th>
                    <th className="pb-2 text-center font-semibold text-white/30">6s</th>
                    <th className="pb-2 text-right font-semibold text-white/30">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {battedOrBatting.map((b: any, idx: number) => {
                    const isStriker = batters.indexOf(b) === strikerIdx
                    const isNonStriker = batters.indexOf(b) === nonStrikerIdx
                    const atCrease = isStriker || isNonStriker
                    return (
                      <tr
                        key={b.name}
                        className="border-b"
                        style={{ borderColor: 'rgba(255,255,255,0.04)', background: atCrease ? `${color}08` : 'transparent' }}
                      >
                        <td className="w-4 py-2 pr-1">
                          {atCrease && (
                            <span className="text-[10px] font-bold" style={{ color }}>
                              {isStriker ? '▶' : '◆'}
                            </span>
                          )}
                        </td>
                        <td className="py-2">
                          <div>
                            <span className="font-semibold text-white">{b.name}</span>
                            {b.isOut && b.dismissal && (
                              <div className="mt-0.5 text-[10px] text-white/30">{b.dismissal}</div>
                            )}
                            {!b.isOut && atCrease && (
                              <div className="mt-0.5 text-[10px]" style={{ color: `${color}80` }}>
                                {isStriker ? 'batting *' : 'non-striker'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-2 text-center font-display text-base font-extrabold tabular-nums text-white">{b.runs}</td>
                        <td className="py-2 text-center text-white/50">{b.balls}</td>
                        <td className="py-2 text-center text-white/50">{b.fours}</td>
                        <td className="py-2 text-center text-white/50">{b.sixes}</td>
                        <td className="py-2 text-right font-mono text-white/50">{sr(b.runs, b.balls)}</td>
                      </tr>
                    )
                  })}
                  {yetToBat.slice(0, 3).map((b: any) => (
                    <tr key={b.name} className="border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="py-1.5 pr-1" />
                      <td className="py-1.5 text-white/25" colSpan={6}>
                        {b.name}
                        <span className="ml-2 text-[10px] italic text-white/20">yet to bat</span>
                      </td>
                    </tr>
                  ))}
                  {yetToBat.length > 3 && (
                    <tr>
                      <td className="py-1 text-white/20" colSpan={7}>
                        …and {yetToBat.length - 3} more yet to bat
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Extras row */}
            <div
              className="mt-3 flex items-center justify-between rounded-xl border px-3 py-2 text-xs"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <span className="text-white/30">Extras</span>
              <span className="font-mono text-white/40">—</span>
            </div>

            {/* Fall of wickets */}
            {fow.length > 0 && (
              <div className="mt-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Fall of Wickets</div>
                <div className="flex flex-wrap gap-1.5">
                  {fow.map((f: any) => (
                    <div
                      key={f.wicketNum}
                      className="rounded-lg border px-2 py-1 text-[10px]"
                      style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <span className="font-bold text-white/60">{f.wicketNum}-{f.score}</span>
                      <span className="ml-1 text-white/30">({f.over})</span>
                      <span className="ml-1 text-white/20">{f.batterName.split(' ').pop()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Bowling table */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[340px] text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="pb-2 text-left font-semibold text-white/30">Bowler</th>
                  <th className="pb-2 text-center font-semibold text-white/30">O</th>
                  <th className="pb-2 text-center font-semibold text-white/30">R</th>
                  <th className="pb-2 text-center font-semibold text-white/30">W</th>
                  <th className="pb-2 text-right font-semibold text-white/30">Econ</th>
                </tr>
              </thead>
              <tbody>
                {bowlers.length === 0 && (
                  <tr>
                    <td className="py-4 text-center text-white/20" colSpan={5}>No bowlers yet</td>
                  </tr>
                )}
                {[...bowlers]
                  .sort((a: any, b: any) => b.wickets - a.wickets || a.runs - b.runs)
                  .map((bw: any) => {
                    const isCurrent = bw.name === inn.currentBowlerName
                    const bwColor = teamColor(inn.bowlingTeamId)
                    return (
                      <tr
                        key={bw.name}
                        className="border-b"
                        style={{ borderColor: 'rgba(255,255,255,0.04)', background: isCurrent ? `${bwColor}08` : 'transparent' }}
                      >
                        <td className="py-2 font-semibold text-white">
                          {bw.name}
                          {isCurrent && <span className="ml-1 text-[10px]" style={{ color: bwColor }}>●</span>}
                        </td>
                        <td className="py-2 text-center text-white/50">{oversStr(bw.balls)}</td>
                        <td className="py-2 text-center text-white/50">{bw.runs}</td>
                        <td
                          className="py-2 text-center font-display text-sm font-bold"
                          style={{ color: bw.wickets > 0 ? '#00ff9d' : 'rgba(255,255,255,0.4)' }}
                        >
                          {bw.wickets}
                        </td>
                        <td className="py-2 text-right font-mono text-white/40">
                          {economy(bw.runs, bw.balls)}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function TopPerformers({ match }: { match: any }) {
  if (!match || match.status !== 'COMPLETE') return null
  const inn1: any = match.innings?.[0]
  const inn2: any = match.innings?.[1]
  if (!inn1) return null

  function topBatters(inn: any, n = 3) {
    if (!inn) return []
    return [...(inn.batters ?? [])]
      .sort((a: any, b: any) => b.runs - a.runs)
      .slice(0, n)
  }

  function topBowlers(inn: any, n = 2) {
    if (!inn) return []
    return [...(inn.bowlers ?? [])]
      .sort((a: any, b: any) => b.wickets - a.wickets || parseFloat(economy(a.runs, a.balls) || '99') - parseFloat(economy(b.runs, b.balls) || '99'))
      .slice(0, n)
  }

  const teams = [
    { teamId: inn1.battingTeamId, batters: topBatters(inn1), bowlers: topBowlers(inn2) },
    { teamId: inn2?.battingTeamId, batters: topBatters(inn2), bowlers: topBowlers(inn1) },
  ].filter((t) => t.teamId)

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {teams.map((t) => {
        const c = teamColor(t.teamId)
        return (
          <div
            key={t.teamId}
            className="rounded-2xl border p-4"
            style={{ background: `${c}08`, borderColor: `${c}25` }}
          >
            <div className="mb-3 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo(t.teamId) ?? ''} alt="" className="h-6 w-6 object-contain" />
              <span className="font-display font-bold" style={{ color: c }}>{t.teamId}</span>
              <span className="text-[10px] text-white/30">Top Performers</span>
            </div>
            <div className="mb-2">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/30">🏏 Batting</div>
              {t.batters.map((b: any) => (
                <div key={b.name} className="flex items-center justify-between py-0.5">
                  <span className="text-xs text-white/70">{b.name}</span>
                  <span className="font-display text-sm font-bold tabular-nums text-white">
                    {b.runs} <span className="text-[10px] text-white/30">({b.balls}b)</span>
                  </span>
                </div>
              ))}
            </div>
            {t.bowlers.length > 0 && (
              <div>
                <div className="mb-1 mt-2 text-[10px] font-bold uppercase tracking-widest text-white/30">⚾ Bowling</div>
                {t.bowlers.map((bw: any) => (
                  <div key={bw.name} className="flex items-center justify-between py-0.5">
                    <span className="text-xs text-white/70">{bw.name}</span>
                    <span className="font-display text-sm font-bold tabular-nums text-white">
                      {bw.wickets}/<span className="text-white/60">{bw.runs}</span>{' '}
                      <span className="text-[10px] text-white/30">({oversStr(bw.balls)}ov)</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function CricketScorecard({ match }: { match: any }) {
  const [activeInnings, setActiveInnings] = useState(0)

  const innings: any[] = match?.innings ?? []
  if (innings.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border py-12 text-center"
        style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div>
          <div className="text-3xl">📋</div>
          <div className="mt-2 text-sm text-white/30">No innings data yet</div>
        </div>
      </div>
    )
  }

  const isComplete = match?.status === 'COMPLETE'
  const isLive = match?.status === 'INNINGS1' || match?.status === 'INNINGS2'

  return (
    <div className="space-y-3">
      {/* Innings selector */}
      {innings.length > 1 && (
        <div
          className="flex gap-1 rounded-xl border p-1"
          style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          {innings.map((inn: any, i: number) => {
            const c = teamColor(inn.battingTeamId)
            return (
              <button
                key={i}
                onClick={() => setActiveInnings(i)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 transition-all"
                style={activeInnings === i
                  ? { background: 'rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }
                  : {}
                }
              >
                <span className="text-xs font-bold" style={{ color: activeInnings === i ? c : 'rgba(255,255,255,0.35)' }}>
                  {i + 1}st Innings — {inn.battingTeamId}
                </span>
                <span
                  className="rounded px-1.5 py-0.5 font-mono text-[10px]"
                  style={{ background: `${c}15`, color: c }}
                >
                  {inn.runs}/{inn.wickets}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Active innings card */}
      {innings[activeInnings] && (
        <InningsCard
          inn={innings[activeInnings]}
          isLive={isLive && activeInnings === innings.length - 1}
        />
      )}

      {/* Post-match top performers */}
      {isComplete && <TopPerformers match={match} />}
    </div>
  )
}
