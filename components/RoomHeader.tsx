'use client'

import type { RoomSnapshot } from '@ipl-auction/contracts'
import { teamColor, teamLogo } from './teamMeta'
import { useEffect, useRef, useState } from 'react'

export function RoomHeader(props: {
  room: RoomSnapshot | null
  code: string | null
  mySessionId: string | null
  myTeamId?: string | null
  onStart: () => void
  onPause: (paused: boolean) => void
  onSelectTeam?: () => void
  tournamentOvers?: 5 | 10 | 15 | 20
  onTournamentOversChange?: (overs: 5 | 10 | 15 | 20) => void
  onStartTournament?: (source: 'AUCTION_RESULTS' | 'SKIP_AUCTION') => void
}) {
  const isHost = props.room && props.mySessionId && props.room.hostSessionId === props.mySessionId
  const status = props.room?.status ?? '…'
  const mode = props.room?.mode ?? 'mock'
  const color = teamColor(props.myTeamId)

  const statusColor: Record<string, string> = {
    LOBBY: '#ffd60a',
    RUNNING: '#00ff9d',
    PAUSED: '#f97316',
    FINISHED: '#a855f7',
  }

  return (
    <header className="game-panel rounded-3xl border border-cyan-500/15 p-3 sm:p-4">
      {/* Row 1: title + badges + select team */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="font-display text-base font-bold sm:text-xl">
            <span className="text-white">🏏</span>{' '}
            <span className="bg-gradient-to-r from-cyan-200 to-fuchsia-200 bg-clip-text text-transparent">Auction</span>
          </div>
          <span
            className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest sm:rounded-lg sm:px-2 sm:text-[10px]"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
          >
            {mode}
          </span>
          <span
            className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest sm:rounded-lg sm:px-2 sm:text-[10px]"
            style={{
              background: `${statusColor[status] ?? '#fff'}18`,
              color: statusColor[status] ?? '#fff',
            }}
          >
            {status}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Room code */}
          <div
            className="rounded-lg border px-2 py-1 text-xs sm:rounded-xl sm:px-3 sm:py-1.5"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <span className="text-white/40">Code: </span>
            <span className="font-mono font-bold tracking-widest text-white">
              {props.code ?? props.room?.code ?? '—'}
            </span>
          </div>

          {/* Team button — clickable only in LOBBY, display-only afterwards */}
          {props.onSelectTeam && status === 'LOBBY' ? (
            <button
              type="button"
              onClick={props.onSelectTeam}
              className="tap-target flex min-h-[40px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold touch-manipulation transition-all hover:scale-105 sm:min-h-0 sm:rounded-xl sm:px-3 sm:py-1.5"
              style={
                props.myTeamId
                  ? { borderColor: `${color}50`, background: `${color}15`, color }
                  : { borderColor: 'rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }
              }
            >
              {props.myTeamId ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={teamLogo(props.myTeamId) ?? ''} alt="" className="h-4 w-4 object-contain" />
                  <span>{props.myTeamId}</span>
                </>
              ) : (
                <>🏏 Team</>
              )}
            </button>
          ) : props.myTeamId && status !== 'LOBBY' ? (
            <div
              className="flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-bold"
              style={{ borderColor: `${color}40`, background: `${color}12`, color }}
              title="Teams are locked once the game starts"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo(props.myTeamId) ?? ''} alt="" className="h-4 w-4 object-contain" />
              <span>{props.myTeamId}</span>
              <span className="text-[9px] opacity-50">🔒</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Row 2: host controls (only shown when host) */}
      {isHost ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-2">
          <button
            type="button"
            onClick={props.onStart}
            className="tap-target min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold text-slate-950 touch-manipulation transition-all hover:scale-105 sm:min-h-0 sm:text-sm"
            style={{ background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)', boxShadow: '0 0 16px rgba(52,211,153,0.35)' }}
          >
            ▶ Start
          </button>
          <button
            type="button"
            onClick={() => props.onPause(true)}
            className="tap-target min-h-[44px] rounded-xl border border-orange-400/45 bg-orange-500/12 px-4 py-2 text-xs font-semibold text-orange-200 touch-manipulation transition-all hover:scale-105 sm:min-h-0 sm:text-sm"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={() => props.onPause(false)}
            className="tap-target min-h-[44px] rounded-xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-100 touch-manipulation transition-all hover:scale-105 sm:min-h-0 sm:text-sm"
          >
            Resume
          </button>

          {props.onStartTournament ? (
            <div className="flex flex-wrap items-center gap-2">
              <OversPickerDark
                value={props.tournamentOvers ?? 5}
                disabled={false}
                onChange={(v) => props.onTournamentOversChange?.(v)}
              />

              {status === 'LOBBY' ? (
                <button
                  type="button"
                  onClick={() => props.onStartTournament?.('SKIP_AUCTION')}
                  className="tap-target min-h-[44px] rounded-xl border border-rose-400/45 bg-rose-500/12 px-4 py-2 text-xs font-semibold text-rose-200 touch-manipulation transition-all hover:scale-105 sm:min-h-0 sm:text-sm"
                >
                  Skip auction → Tournament
                </button>
              ) : null}

              {status === 'FINISHED' ? (
                <button
                  type="button"
                  onClick={() => props.onStartTournament?.('AUCTION_RESULTS')}
                  className="tap-target min-h-[44px] rounded-xl px-4 py-2 text-xs font-bold text-slate-950 touch-manipulation transition-all hover:scale-105 sm:min-h-0 sm:text-sm"
                  style={{ background: 'linear-gradient(135deg, #fb7185 0%, #f97316 100%)', boxShadow: '0 0 16px rgba(251,113,133,0.35)' }}
                >
                  🏟️ Start tournament
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}

function OversPickerDark(props: {
  value: 5 | 10 | 15 | 20
  disabled?: boolean
  onChange: (next: 5 | 10 | 15 | 20) => void
}) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const { value, disabled } = props
  const options: Array<5 | 10 | 15 | 20> = [5, 10, 15, 20]

  const computePos = () => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = Math.max(180, r.width)
    const pad = 8
    let left = r.left
    const maxLeft = Math.max(pad, window.innerWidth - width - pad)
    left = Math.min(maxLeft, Math.max(pad, left))
    if (r.right > window.innerWidth - pad * 2) {
      left = Math.min(maxLeft, Math.max(pad, r.right - width))
    }
    const approxMenuHeight = 240
    let top = r.bottom + 8
    if (top + approxMenuHeight > window.innerHeight - pad) {
      top = Math.max(pad, r.top - 8 - approxMenuHeight)
    }
    setPos({ left, top, width })
  }

  useEffect(() => {
    if (!open) return
    computePos()
    const onMove = () => computePos()
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    return () => {
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [open])

  return (
    <div className="relative z-[120]">
      <button
        type="button"
        disabled={disabled}
        ref={btnRef}
        onClick={() => {
          if (disabled) return
          if (!open) computePos()
          setOpen((v) => !v)
        }}
        className="tap-target flex min-h-[44px] items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/80 sm:min-h-0 sm:text-sm disabled:opacity-40"
        style={{ minWidth: 110 }}
      >
        <span className="truncate">{value} ov</span>
        <span className="text-white/40">▾</span>
      </button>
      {open && !disabled ? (
        <>
          <button
            type="button"
            aria-label="Close overs menu"
            className="fixed inset-0 z-[9998] cursor-default bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed z-[9999] overflow-hidden rounded-2xl border border-white/10"
            style={{
              left: pos?.left ?? 0,
              top: pos?.top ?? 0,
              width: pos?.width ?? 180,
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
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-white/80 hover:bg-white/[0.06]"
                >
                  <span>{n} overs</span>
                  {n === value ? <span className="text-xs text-emerald-300/80">✓</span> : null}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
