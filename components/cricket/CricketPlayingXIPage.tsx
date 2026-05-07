'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { teamColor, teamLogo } from '@/components/teamMeta'

function rolePillClass(role: string) {
  const r = String(role || 'BAT').toUpperCase()
  if (r === 'WK') return 'border-amber-400/35 bg-amber-500/20 text-amber-100'
  if (r === 'AR') return 'border-violet-400/35 bg-violet-500/20 text-violet-100'
  if (r === 'BOWL') return 'border-emerald-400/35 bg-emerald-600/20 text-emerald-100'
  return 'border-sky-400/35 bg-sky-500/20 text-sky-100'
}

function pseudoBatRating(name: string, role: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i) * (i + 3)) % 131
  const base = role === 'WK' ? 58 : role === 'BOWL' ? 52 : role === 'AR' ? 54 : 66
  return base + (h % 32)
}

export function CricketPlayingXIPage(props: {
  match: {
    matchId: string
    homeTeamId: string
    awayTeamId: string
    toss: { winnerTeamId: string | null; decision: 'BAT' | 'BOWL' | null } | null
    awaitingXI?: { homeSubmitted: boolean; awaySubmitted: boolean }
    captains?: Record<string, string>
    selectedXI?: Record<string, string[]>
  }
  myTeamId: string | null
  squads?: Record<string, Array<{ name: string; role: string; overseas: boolean }>>
  onSubmitXI?: (xi: string[], captain: string) => void
  onExit: () => void
  matchLabel?: string
}) {
  const { match, onExit, matchLabel } = props
  const teamId = props.myTeamId
  const mySquad = teamId ? (props.squads?.[teamId] ?? []) : []
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
    if (xi.length !== 0) return
    const fromServer = teamId && match.selectedXI?.[teamId] ? match.selectedXI[teamId] : null
    const fromSquad = mySquad.length >= 11 ? mySquad.slice(0, 11).map((p) => p.name) : []
    const nextXi = fromServer && fromServer.length >= 11 ? fromServer.slice(0, 11) : fromSquad
    if (nextXi.length >= 11) {
      setXi(nextXi)
      const cap = teamId && match.captains?.[teamId] ? match.captains[teamId] : ''
      setCaptain(cap && nextXi.includes(cap) ? cap : (nextXi[0] ?? ''))
    }
  }, [mySquad.join('|'), teamId, match.matchId, match.selectedXI, match.captains, xi.length])

  const overseasCount = xi.reduce((n, name) => n + (metaByName.get(name)?.overseas ? 1 : 0), 0)

  const w = match.toss?.winnerTeamId
  const d = match.toss?.decision
  const bowlingFirstTeamId =
    w && d === 'BAT'
      ? w === match.homeTeamId
        ? match.awayTeamId
        : match.homeTeamId
      : w && d === 'BOWL'
        ? w
        : null

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col bg-[#060612] pt-[max(0.5rem,env(safe-area-inset-top))]">
      {/* Top bar — mobile + desktop */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/[0.08] px-3 py-3 sm:px-6">
        <button
          type="button"
          onClick={onExit}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-lg text-white/70 sm:h-9 sm:w-auto sm:px-3 sm:py-2 sm:text-xs sm:font-bold"
          aria-label="Back"
        >
          <span className="sm:hidden">←</span>
          <span className="hidden sm:inline">← Exit</span>
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={teamLogo(match.homeTeamId) ?? ''} alt="" className="h-9 w-9 object-contain sm:h-10 sm:w-10" />
          <span className="text-[11px] font-bold text-white/35 sm:text-xs">vs</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={teamLogo(match.awayTeamId) ?? ''} alt="" className="h-9 w-9 object-contain sm:h-10 sm:w-10" />
        </div>
        <div className="max-w-[110px] text-right text-[10px] font-bold uppercase tracking-wider text-white/40 sm:max-w-none sm:text-xs">
          {matchLabel ?? 'Match'}
        </div>
      </div>

      <div className="shrink-0 border-b border-white/10 px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="font-display text-xl font-bold text-white sm:text-2xl">Select Playing XI</div>
            {bowlingFirstTeamId ? (
              <p className="mt-1 text-sm font-semibold text-emerald-400/95">{bowlingFirstTeamId} will bowl first</p>
            ) : null}
            <p className="mt-1 text-[11px] text-white/40 sm:text-xs">
              Tap bench to add or swap · Tap an XI row to remove
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (mySquad.length >= 11) {
                setXi(mySquad.slice(0, 11).map((p) => p.name))
                setCaptain(mySquad[0]?.name ?? '')
              }
            }}
            className="shrink-0 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-xs font-bold text-white/85"
          >
            ✨ Auto Select
          </button>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/[0.06] px-3 py-2.5 sm:px-6">
        <span
          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-bold ${
            xi.length === 11
              ? 'border-emerald-400/35 bg-emerald-500/14 text-emerald-200'
              : 'border-white/12 bg-white/[0.04] text-white/45'
          }`}
        >
          {xi.length === 11 ? <span aria-hidden="true">✓</span> : null}
          {xi.length}/11
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-[11px] font-bold ${
            overseasCount <= 4
              ? 'border-white/10 bg-white/[0.05] text-white/60'
              : 'border-rose-400/35 bg-rose-500/15 text-rose-200'
          }`}
        >
          <span className="text-[11px] opacity-80">🌐</span>
          {overseasCount}/4
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/55">
          Captain <span className="text-white/85">{captain || '—'}</span>
        </span>
        {alreadySubmitted || (xi.length === 11 && overseasCount <= 4 && captain) ? (
          <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/35 bg-emerald-500/14 px-3 py-1.5 text-[11px] font-bold text-emerald-200">
            ✓ Ready
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-200/90">
            Pending
          </span>
        )}
      </div>

      {/* Scrollable table — fills space between header rows and footer */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2 pt-2 [-webkit-overflow-scrolling:touch] sm:px-4">
        <div className="mx-auto max-w-5xl min-w-0 overflow-x-auto rounded-xl border border-white/10 sm:rounded-2xl">
          <div className="grid grid-cols-[22px_24px_minmax(0,1fr)_48px_38px] items-center gap-1 border-b border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-white/35 sm:grid-cols-[22px_28px_minmax(0,1fr)_64px_52px_52px_52px_52px_52px] sm:px-4">
            <span className="text-center opacity-40">⠿</span>
            <div>#</div>
            <div>Player</div>
            <div className="text-center">Role</div>
            <div className="text-center">BAT</div>
            <div className="hidden text-center sm:block">Bwl</div>
            <div className="hidden text-center sm:block">Runs</div>
            <div className="hidden text-center sm:block">Wkts</div>
            <div className="hidden text-center sm:block">Eco</div>
          </div>

          <div className="flex items-center bg-emerald-600/45 px-3 py-2.5 sm:px-4">
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-white">Playing XI</span>
          </div>
          {xi.map((name, idx) => {
            const role = String(metaByName.get(name)?.role ?? 'BAT')
            const rate = pseudoBatRating(name, role)
            return (
              <button
                key={`xi_${name}`}
                type="button"
                onClick={() => {
                  if (alreadySubmitted) return
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
                className="grid w-full grid-cols-[22px_24px_minmax(0,1fr)_48px_38px] items-center gap-1 border-t border-white/5 px-3 py-2.5 text-left text-[13px] sm:grid-cols-[22px_28px_minmax(0,1fr)_64px_52px_52px_52px_52px_52px] sm:px-4 sm:py-3 sm:text-sm"
                style={{ background: pendingBenchPick ? 'rgba(16,185,129,0.12)' : 'rgba(0,0,0,0.16)' }}
              >
                <div className="flex justify-center text-[10px] text-white/28">⋮⋮</div>
                <div className="font-mono text-[12px] text-white/50">{idx + 1}</div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">
                    {name}
                    {captain === name ? (
                      <span className="ml-1.5 rounded border border-amber-400/40 bg-amber-500/25 px-1 py-0.5 text-[9px] font-bold text-amber-100">
                        C
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-1">{badgeFor(name)}</div>
                </div>
                <div className="flex justify-center">
                  <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${rolePillClass(role)}`}>{role}</span>
                </div>
                <div className="text-center font-mono text-[12px] font-semibold tabular-nums text-sky-300/90 sm:text-sm">{rate}</div>
                <div className="hidden text-center text-white/22 sm:block">—</div>
                <div className="hidden text-center text-white/22 sm:block">—</div>
                <div className="hidden text-center text-white/22 sm:block">—</div>
                <div className="hidden text-center text-white/22 sm:block">—</div>
              </button>
            )
          })}

          <div className="flex items-center bg-white/[0.04] px-3 py-2 sm:px-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">Bench</span>
          </div>
          {mySquad
            .filter((p) => !xi.includes(p.name))
            .map((p) => {
              const disabled = alreadySubmitted || xi.length >= 11 || (p.overseas && overseasCount >= 4)
              const role = String(p.role ?? 'BAT')
              const rate = pseudoBatRating(p.name, role)
              return (
                <button
                  key={`b_${p.name}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (alreadySubmitted) return
                    if (xi.length < 11) {
                      setXi((cur) => [...cur, p.name])
                      return
                    }
                    setPendingBenchPick((cur) => (cur === p.name ? '' : p.name))
                  }}
                  className="grid w-full grid-cols-[22px_24px_minmax(0,1fr)_48px_38px] items-center gap-1 border-t border-white/5 px-3 py-2.5 text-left text-[13px] disabled:opacity-40 sm:grid-cols-[22px_28px_minmax(0,1fr)_64px_52px_52px_52px_52px_52px] sm:px-4 sm:py-3 sm:text-sm"
                  style={{ background: pendingBenchPick === p.name ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.02)' }}
                >
                  <div className="text-center text-[10px] text-white/15">·</div>
                  <div className="text-white/20">–</div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white/85">{p.name}</div>
                    <div className="mt-0.5 flex flex-wrap gap-1">{badgeFor(p.name)}</div>
                  </div>
                  <div className="flex justify-center">
                    <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${rolePillClass(role)}`}>{role}</span>
                  </div>
                  <div className="text-center font-mono text-[12px] text-sky-400/50 sm:text-sm">{rate}</div>
                  <div className="hidden text-center text-white/12 sm:block">—</div>
                  <div className="hidden text-center text-white/12 sm:block">—</div>
                  <div className="hidden text-center text-white/12 sm:block">—</div>
                  <div className="hidden text-center text-white/12 sm:block">—</div>
                </button>
              )
            })}
        </div>
      </div>

      {/* Pinned to viewport bottom via parent flex; safe-area padding on compact devices */}
      <div
        className="z-40 shrink-0 border-t border-white/10 bg-[#08081a]/98 px-3 py-3 backdrop-blur-md sm:px-6"
        style={{
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="flex w-full flex-col gap-1.5 sm:max-w-md">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/45">Captain</span>
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
            className="w-full shrink-0 rounded-2xl px-6 py-3.5 text-sm font-bold text-slate-950 disabled:opacity-40 sm:w-auto sm:min-w-[260px]"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 0 24px rgba(34,197,94,0.25)',
            }}
          >
            ✓ Confirm Playing XI
          </button>
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
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const { value, options, disabled } = props

  const computePos = () => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = Math.min(Math.max(r.width, 240), Math.min(360, window.innerWidth - 24))
    const pad = 12
    let left = r.left
    if (left + width > window.innerWidth - pad) left = Math.max(pad, window.innerWidth - width - pad)
    if (left < pad) left = pad
    const rowH = 44
    const maxH = Math.min(280, Math.floor(window.innerHeight * 0.45))
    const menuHeight = Math.min(options.length * rowH + 16, maxH)
    let top = r.bottom + 6
    if (top + menuHeight > window.innerHeight - pad) {
      top = Math.max(pad, r.top - 6 - menuHeight)
    }
    setPos({ left, top, width })
  }

  useLayoutEffect(() => {
    if (!open) return
    computePos()
    const onMove = () => computePos()
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    return () => {
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [open, options.length])

  return (
    <div className="relative z-10 w-full min-w-0">
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return
          if (!open) computePos()
          setOpen((v) => !v)
        }}
        className="flex w-full min-w-0 items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-xs font-bold text-white/85 disabled:opacity-40 sm:py-2.5"
      >
        <span className="min-w-0 flex-1 truncate">{value || 'Select captain…'}</span>
        <span className="ml-2 shrink-0 text-white/40">▾</span>
      </button>
      {open && !disabled && typeof document !== 'undefined'
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Close captain menu"
                className="fixed inset-0 z-[10000] cursor-default"
                style={{ background: 'rgba(0,0,0,0.25)' }}
                onClick={() => setOpen(false)}
              />
              <div
                className="fixed z-[10001] max-h-[min(45vh,280px)] overflow-auto rounded-2xl border border-white/10"
                style={{
                  left: pos?.left ?? 8,
                  top: pos?.top ?? 8,
                  width: pos?.width ?? 280,
                  background: 'rgba(10,10,24,0.98)',
                  boxShadow: '0 18px 60px rgba(0,0,0,0.6)',
                }}
              >
                <div className="p-2">
                  {options.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        props.onChange(n)
                        setOpen(false)
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-white/85 hover:bg-white/[0.06]"
                    >
                      <span className="min-w-0 truncate">{n}</span>
                      {n === value ? <span className="ml-2 shrink-0 text-xs text-emerald-300/80">✓</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  )
}
