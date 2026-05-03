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
        </div>
      ) : null}
    </header>
  )
}
