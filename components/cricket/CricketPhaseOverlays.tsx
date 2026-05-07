'use client'

import { useEffect, useMemo, useState } from 'react'
import { teamColor, teamLogo } from '@/components/teamMeta'

export function CricketTossResultOverlay(props: {
  match: {
    homeTeamId: string
    awayTeamId: string
    toss: {
      winnerTeamId: string | null
      decision: 'BAT' | 'BOWL' | null
    } | null
    tossRevealUntilMs: number | null
    awaitingXI?: { homeSubmitted: boolean; awaySubmitted: boolean }
    captains?: Record<string, string>
    selectedXI?: Record<string, string[]>
  }
  myTeamId: string | null
  squads?: Record<string, Array<{ name: string; role: string; overseas: boolean }>>
  onSubmitXI?: (xi: string[], captain: string) => void
  onContinue: () => void
}) {
  const { match, onContinue } = props
  const [tick, setTick] = useState(0)
  const until = match.tossRevealUntilMs
  const countdownActive = until != null && Date.now() < until

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 250)
    return () => window.clearInterval(id)
  }, [])

  void tick
  const left = until != null ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0
  const showStart = !countdownActive
  const needXi = !!match.awaitingXI
  const teamId = props.myTeamId
  const mySquad = teamId ? (props.squads?.[teamId] ?? []) : []
  const iAmPlaying = !!teamId && (teamId === match.homeTeamId || teamId === match.awayTeamId)
  const alreadySubmitted =
    !!teamId &&
    ((teamId === match.homeTeamId && match.awaitingXI?.homeSubmitted) ||
      (teamId === match.awayTeamId && match.awaitingXI?.awaySubmitted))

  const [xi, setXi] = useState<string[]>([])
  const [captain, setCaptain] = useState<string>('')
  const [pendingBenchPick, setPendingBenchPick] = useState<string>('')

  const metaByName = useMemo(() => {
    const m = new Map<string, { role?: string; overseas?: boolean }>()
    for (const p of mySquad) m.set(p.name, { role: p.role, overseas: p.overseas })
    return m
  }, [mySquad])

  const badgeFor = (name: string) => {
    const meta = metaByName.get(name)
    const isOS = !!meta?.overseas
    const isWK = String(meta?.role ?? '').toUpperCase() === 'WK'
    return (
      <>
        {isOS ? (
          <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-200/80">OS</span>
        ) : null}
        {isWK ? (
          <span className="ml-2 rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-bold text-sky-200/80">WK</span>
        ) : null}
      </>
    )
  }

  useEffect(() => {
    if (!needXi || !iAmPlaying) return
    if (xi.length !== 0) return

    // Prefer server-provided XI/captain (persists across matches).
    const fromServer = (teamId && match.selectedXI?.[teamId]) ? match.selectedXI[teamId] : null
    const fromSquad = mySquad.length >= 11 ? mySquad.slice(0, 11).map((p) => p.name) : []
    const nextXi = (fromServer && fromServer.length >= 11) ? fromServer.slice(0, 11) : fromSquad
    if (nextXi.length >= 11) {
      setXi(nextXi)
      const cap = (teamId && match.captains?.[teamId]) ? match.captains[teamId] : ''
      setCaptain(cap && nextXi.includes(cap) ? cap : (nextXi[0] ?? ''))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needXi, iAmPlaying, mySquad.join('|'), teamId, match.selectedXI, match.captains])

  const overseasCount = xi.reduce((n, name) => n + (metaByName.get(name)?.overseas ? 1 : 0), 0)

  const w = match.toss?.winnerTeamId
  const d = match.toss?.decision
  const winColor = teamColor(w)
  const battingFirst =
    w && d === 'BAT'
      ? w
      : w && d === 'BOWL'
        ? match.homeTeamId === w
          ? match.awayTeamId
          : match.homeTeamId
        : null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: 'rgba(6,6,18,0.92)', backdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-5xl">
        {/* Compact toss summary card (top) */}
        <div
          className="mb-4 w-full rounded-3xl border p-6 text-center"
          style={{
            background: 'rgba(12,12,28,0.98)',
            borderColor: `${winColor}50`,
            boxShadow: `0 0 60px ${winColor}20`,
          }}
        >
        <div className="text-4xl">🪙</div>
        <h2 className="mt-4 font-display text-2xl font-bold text-white">Toss result</h2>
        {w && (
          <div className="mt-4 flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={teamLogo(w) ?? ''} alt="" className="h-12 w-12 object-contain" />
            <div className="text-left">
              <div className="font-display text-xl font-bold" style={{ color: winColor }}>
                {w} won the toss
              </div>
              <div className="mt-1 text-sm text-white/60">
                {d === 'BAT' && 'Elected to bat first'}
                {d === 'BOWL' && 'Elected to bowl first'}
              </div>
            </div>
          </div>
        )}
        {battingFirst && (
          <p className="mt-4 text-sm text-white/50">
            <span className="font-bold text-white/80">{battingFirst}</span> will bat first
          </p>
        )}
        {!showStart && (
          <div
            className="mt-6 rounded-2xl border px-4 py-3 font-mono text-2xl font-bold tabular-nums"
            style={{ borderColor: `${winColor}40`, color: winColor }}
          >
            {left}s
          </div>
        )}
        {showStart ? (
          needXi && iAmPlaying ? (
            <>
              {/* Team sheet */}
              <div
                className="relative overflow-hidden rounded-3xl border"
                style={{
                  background: 'rgba(8,8,18,0.92)',
                  borderColor: 'rgba(255,255,255,0.08)',
                  boxShadow: '0 20px 80px rgba(0,0,0,0.55)',
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onContinue}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/70"
                    >
                      ← Exit
                    </button>
                    <div>
                      <div className="font-display text-base font-bold text-white sm:text-lg">Select Playing XI</div>
                      <div className="text-xs text-white/40">
                        Tap to move between XI and Bench · Pick a captain
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (mySquad.length >= 11) {
                        setXi(mySquad.slice(0, 11).map((p) => p.name))
                        setCaptain(mySquad[0]?.name ?? '')
                      }
                    }}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/75 transition-all active:scale-[0.98]"
                  >
                    ✨ Auto Select
                  </button>
                </div>

                {/* Chips */}
                <div className="flex flex-wrap items-center gap-2 px-5 py-3">
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200/80">
                    {xi.length}/11
                  </span>
                  <span className="rounded-full border border-amber-400/15 bg-amber-500/8 px-3 py-1 text-xs font-bold text-amber-200/70">
                    Overseas: {overseasCount}/4
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/55">
                    Captain: <span className="text-white/80">{captain || '—'}</span>
                  </span>
                  {alreadySubmitted ? (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200/80">
                      Ready
                    </span>
                  ) : (
                    <span className="rounded-full border border-amber-400/15 bg-amber-500/8 px-3 py-1 text-xs font-bold text-amber-200/70">
                      Pending
                    </span>
                  )}
                </div>

                {/* Table */}
                <div className="max-h-[62vh] overflow-auto px-2 pb-28 sm:px-3 sm:pb-24">
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    {/* Mobile: compact columns, Desktop: full columns */}
                    <div className="grid grid-cols-[32px_1fr_72px] gap-2 bg-white/[0.03] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/35 sm:grid-cols-[32px_1fr_100px_60px_60px_60px_60px_60px] sm:px-4">
                      <div>#</div>
                      <div>Player</div>
                      <div>Role</div>
                      <div className="hidden text-center sm:block">BAT</div>
                      <div className="hidden text-center sm:block">BWL</div>
                      <div className="hidden text-center sm:block">Runs</div>
                      <div className="hidden text-center sm:block">Wkts</div>
                      <div className="hidden text-center sm:block">Eco</div>
                    </div>

                    <div className="bg-emerald-500/12 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-emerald-200/80">
                      Playing XI
                    </div>
                    {xi.map((name, idx) => (
                      <button
                        key={`xi_${name}`}
                        type="button"
                        onClick={() => {
                          if (alreadySubmitted) return
                          // Swap UX:
                          // - If a bench player is armed, clicking an XI row replaces that slot.
                          // - Otherwise clicking removes the player from XI.
                          if (pendingBenchPick) {
                            const incoming = pendingBenchPick
                            const next = [...xi]
                            next[idx] = incoming
                            const nextOverseas = next.reduce((n, nm) => n + (metaByName.get(nm)?.overseas ? 1 : 0), 0)
                            if (nextOverseas > 4) return
                            setXi(Array.from(new Set(next)))
                            if (captain === name) setCaptain(incoming)
                            setPendingBenchPick('')
                            return
                          }
                          setXi((cur) => cur.filter((x) => x !== name))
                          if (captain === name) setCaptain('')
                        }}
                        className="grid w-full grid-cols-[32px_1fr_72px] gap-2 border-t border-white/5 px-3 py-3 text-left text-sm sm:grid-cols-[32px_1fr_100px_60px_60px_60px_60px_60px] sm:px-4"
                        style={{ background: pendingBenchPick ? 'rgba(16,185,129,0.08)' : 'rgba(0,0,0,0.1)' }}
                      >
                        <div className="text-white/35">{idx + 1}</div>
                        <div className="truncate font-semibold text-white">
                          {name}{' '}
                          {captain === name ? (
                            <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-200/90">
                              C
                            </span>
                          ) : null}
                          {badgeFor(name)}
                        </div>
                        <div className="text-white/35">{String(metaByName.get(name)?.role ?? '—')}</div>
                        <div className="hidden text-center text-white/25 sm:block">—</div>
                        <div className="hidden text-center text-white/25 sm:block">—</div>
                        <div className="hidden text-center text-white/25 sm:block">—</div>
                        <div className="hidden text-center text-white/25 sm:block">—</div>
                        <div className="hidden text-center text-white/25 sm:block">—</div>
                      </button>
                    ))}

                    <div className="bg-white/[0.03] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white/55">
                      Bench
                    </div>
                    {mySquad
                      .filter((p) => !xi.includes(p.name))
                      .map((p) => {
                        const disabled =
                          alreadySubmitted ||
                          xi.length >= 11 ||
                          (p.overseas && overseasCount >= 4)
                        return (
                          <button
                            key={`b_${p.name}`}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              if (alreadySubmitted) return
                              // If XI not full, add directly. If full, arm a swap pick.
                              if (xi.length < 11) {
                                setXi((cur) => [...cur, p.name])
                                return
                              }
                              setPendingBenchPick((cur) => (cur === p.name ? '' : p.name))
                            }}
                            className="grid w-full grid-cols-[32px_1fr_72px] gap-2 border-t border-white/5 px-3 py-3 text-left text-sm disabled:opacity-40 sm:grid-cols-[32px_1fr_100px_60px_60px_60px_60px_60px] sm:px-4"
                            style={{ background: pendingBenchPick === p.name ? 'rgba(56,189,248,0.08)' : 'rgba(255,255,255,0.01)' }}
                          >
                            <div className="text-white/15">•</div>
                            <div className="truncate font-semibold text-white/80">
                              {p.name}
                              {badgeFor(p.name)}
                            </div>
                            <div className="text-white/25">{String(p.role ?? '—')}</div>
                            <div className="hidden text-center text-white/15 sm:block">—</div>
                            <div className="hidden text-center text-white/15 sm:block">—</div>
                            <div className="hidden text-center text-white/15 sm:block">—</div>
                            <div className="hidden text-center text-white/15 sm:block">—</div>
                            <div className="hidden text-center text-white/15 sm:block">—</div>
                          </button>
                        )
                      })}
                  </div>
                </div>

                {/* Bottom action bar */}
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 border-t border-white/10 p-3"
                  style={{
                    background: 'linear-gradient(180deg, rgba(8,8,18,0) 0%, rgba(8,8,18,0.92) 35%, rgba(8,8,18,0.98) 100%)',
                  }}
                >
                  <div className="pointer-events-auto mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/45">Captain</span>
                      <CaptainPickerDark
                        value={captain}
                        options={xi}
                        disabled={xi.length === 0 || alreadySubmitted}
                        onChange={setCaptain}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={alreadySubmitted || xi.length !== 11 || !captain || overseasCount > 4}
                      onClick={() => props.onSubmitXI?.(xi, captain)}
                      className="w-full rounded-2xl px-6 py-3 text-sm font-bold text-slate-950 transition-transform active:scale-[0.98] disabled:opacity-40 sm:w-auto"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        boxShadow: '0 0 24px rgba(34,197,94,0.25)',
                        minWidth: '260px',
                      }}
                    >
                      ✓ Confirm Playing XI
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={onContinue}
              className="mt-6 w-full rounded-2xl py-4 font-display text-lg font-bold text-black transition-transform active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                boxShadow: '0 0 24px rgba(0,212,255,0.35)',
              }}
            >
              Start match
            </button>
          )
        ) : null}

        <p className="mt-2 text-xs text-white/35">
          {!showStart ? 'Match starting…' : needXi && iAmPlaying ? 'Pick XI for your team before play starts.' : 'Ready when you are.'}
        </p>
        </div>
      </div>
    </div>
  )
}

function CaptainPickerDark(props: {
  value: string
  options: string[]
  disabled?: boolean
  onChange: (next: string) => void
}) {
  const [open, setOpen] = useState(false)
  const { value, options, disabled } = props
  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className="flex min-w-[220px] items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 disabled:opacity-40"
      >
        <span className="truncate">{value || 'Select captain…'}</span>
        <span className="ml-3 text-white/40">▾</span>
      </button>
      {open && !disabled ? (
        <div
          className="absolute bottom-[calc(100%+8px)] right-0 z-[80] w-[320px] overflow-hidden rounded-2xl border border-white/10"
          style={{ background: 'rgba(10,10,24,0.98)', boxShadow: '0 18px 60px rgba(0,0,0,0.6)' }}
        >
          <div className="max-h-56 overflow-auto p-2">
            {options.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { props.onChange(n); setOpen(false) }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-white/80 hover:bg-white/[0.06]"
              >
                <span className="truncate">{n}</span>
                {n === value ? <span className="text-xs text-emerald-300/80">✓</span> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function CricketInningsBreakOverlay(props: {
  match: {
    innings: Array<{ battingTeamId: string; runs: number; wickets: number; balls: number }>
    target: number | null
    inningsBreakUntilMs: number | null
  }
  onContinue: () => void
}) {
  const { match, onContinue } = props
  const [tick, setTick] = useState(0)
  const until = match.inningsBreakUntilMs
  const countdownActive = until != null && Date.now() < until

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 250)
    return () => window.clearInterval(id)
  }, [])

  void tick
  const left = until != null ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0
  const showStart = !countdownActive

  const inn1 = match.innings[0]
  const inn2 = match.innings[1]
  const chaseTeam = inn2?.battingTeamId
  const t = match.target
  const c = chaseTeam ? teamColor(chaseTeam) : '#00d4ff'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: 'rgba(6,6,18,0.92)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl border p-8 text-center"
        style={{
          background: 'rgba(12,12,28,0.98)',
          borderColor: `${c}50`,
          boxShadow: `0 0 60px ${c}18`,
        }}
      >
        <div className="text-4xl">🏏</div>
        <h2 className="mt-4 font-display text-2xl font-bold text-white">Innings break</h2>
        {inn1 && (
          <p className="mt-4 text-sm text-white/60">
            <span className="font-bold" style={{ color: teamColor(inn1.battingTeamId) }}>
              {inn1.battingTeamId}
            </span>{' '}
            {inn1.runs}/{inn1.wickets}
            <span className="text-white/40">
              {' '}
              ({Math.floor(inn1.balls / 6)}.{inn1.balls % 6})
            </span>
          </p>
        )}
        {t != null && chaseTeam && (
          <p className="mt-3 font-display text-lg font-bold" style={{ color: c }}>
            Target {t} — {chaseTeam} need {t} runs to win
          </p>
        )}
        {!showStart && (
          <div
            className="mt-6 rounded-2xl border px-4 py-3 font-mono text-2xl font-bold tabular-nums"
            style={{ borderColor: `${c}40`, color: c }}
          >
            {left}s
          </div>
        )}
        {showStart && (
          <button
            type="button"
            onClick={onContinue}
            className="mt-6 w-full rounded-2xl py-4 font-display text-lg font-bold text-black transition-transform active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
              boxShadow: '0 0 24px rgba(168,85,247,0.35)',
            }}
          >
            Start 2nd innings
          </button>
        )}
        <p className="mt-2 text-xs text-white/35">{showStart ? 'Chase begins when you continue.' : '2nd innings starting…'}</p>
      </div>
    </div>
  )
}
