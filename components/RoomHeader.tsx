'use client'

import type { RoomSnapshot } from '@ipl-auction/contracts'
import { teamColor, teamLogo } from './teamMeta'

export function RoomHeader(props: {
  room: RoomSnapshot | null
  code: string | null
  mySessionId: string | null
  myTeamId?: string | null
  onStart: () => void
  onPause: (paused: boolean) => void
  onSelectTeam?: () => void
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
    <header
      className="rounded-3xl border p-3 sm:p-4"
      style={{
        background: 'rgba(10,10,24,0.9)',
        borderColor: 'rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Row 1: title + badges + select team */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="font-display text-base font-bold text-white sm:text-xl">🏏 Auction</div>
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
              onClick={props.onSelectTeam}
              className="flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-bold transition-all hover:scale-105 sm:rounded-xl sm:px-3 sm:py-1.5"
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
        <div className="mt-2 flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={props.onStart}
            className="rounded-lg px-3 py-1.5 text-xs font-bold text-black transition-all hover:scale-105 sm:rounded-xl sm:px-4 sm:text-sm"
            style={{ background: 'linear-gradient(135deg, #00ff9d 0%, #00cc7a 100%)', boxShadow: '0 0 12px rgba(0,255,150,0.3)' }}
          >
            Start
          </button>
          <button
            onClick={() => props.onPause(true)}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105 sm:rounded-xl sm:px-4 sm:text-sm"
            style={{ borderColor: 'rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.1)', color: '#fb923c' }}
          >
            Pause
          </button>
          <button
            onClick={() => props.onPause(false)}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105 sm:rounded-xl sm:px-4 sm:text-sm"
            style={{ borderColor: 'rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.08)', color: '#67e8f9' }}
          >
            Resume
          </button>
        </div>
      ) : null}
    </header>
  )
}
