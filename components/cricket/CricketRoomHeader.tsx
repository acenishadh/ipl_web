'use client'

import { teamColor, teamLogo } from '@/components/teamMeta'

export function CricketRoomHeader(props: {
  room: any | null
  code: string | null
  mySessionId: string | null
  myTeamId?: string | null
  onStart: () => void
  onPause: (paused: boolean) => void
  onSelectTeam?: () => void
}) {
  const isHost = props.room && props.mySessionId && props.room.hostSessionId === props.mySessionId
  const status = props.room?.status ?? '…'
  const mode = props.room?.mode ?? 'QUICK'
  const color = teamColor(props.myTeamId)

  const statusColor: Record<string, string> = {
    LOBBY: '#ffd60a',
    RUNNING: '#00ff9d',
    PAUSED: '#f97316',
    FINISHED: '#a855f7',
  }

  // Show team button if in LOBBY, or mid-game with no team (allow joining a running/paused game)
  const canPickTeam =
    props.onSelectTeam &&
    (status === 'LOBBY' || ((status === 'RUNNING' || status === 'PAUSED') && !props.myTeamId))

  return (
    <header
      className="rounded-2xl border p-2.5 sm:rounded-3xl sm:p-4"
      style={{
        background: 'linear-gradient(165deg, rgba(20,20,45,0.95) 0%, rgba(10,10,24,0.92) 100%)',
        borderColor: 'rgba(255,255,255,0.1)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Row 1: title + status badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="font-display text-sm font-bold tracking-tight text-white sm:text-base">🏟️ Live room</div>
        <span
          className="rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider sm:text-[9px]"
          style={{ background: 'rgba(255,0,110,0.12)', color: '#f472b6' }}
        >
          {props.room?.oversPerMatch ?? 5}ov
        </span>
        <span
          className="rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider sm:text-[9px]"
          style={{
            background: `${statusColor[status] ?? '#fff'}18`,
            color: statusColor[status] ?? '#fff',
          }}
        >
          {status}
        </span>
        {mode === 'TOURNAMENT' && (
          <span
            className="rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider sm:text-[9px]"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
          >
            Tournament
          </span>
        )}
      </div>

      {/* Row 2: code + team + controls */}
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:mt-2">
        {/* Room code */}
        <div
          className="rounded-lg border px-2 py-1 text-xs"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <span className="text-white/40">Code: </span>
          <span className="font-mono font-bold tracking-widest text-white">
            {props.code ?? props.room?.code ?? '—'}
          </span>
        </div>

        {/* Team button */}
        {canPickTeam ? (
          <button
            onClick={props.onSelectTeam}
            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold transition-all hover:scale-105 active:scale-95"
            style={
              props.myTeamId
                ? { borderColor: `${color}50`, background: `${color}15`, color }
                : { borderColor: 'rgba(244,63,94,0.4)', background: 'rgba(244,63,94,0.1)', color: '#fb7185' }
            }
          >
            {props.myTeamId ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={teamLogo(props.myTeamId) ?? ''} alt="" className="h-3.5 w-3.5 object-contain" />
                <span>{props.myTeamId}</span>
              </>
            ) : (
              <>🏏 Pick team</>
            )}
          </button>
        ) : props.myTeamId && !canPickTeam ? (
          <div
            className="flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold"
            style={{ borderColor: `${color}40`, background: `${color}12`, color }}
            title="Teams are locked once the game starts"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={teamLogo(props.myTeamId) ?? ''} alt="" className="h-3.5 w-3.5 object-contain" />
            <span>{props.myTeamId}</span>
            <span className="text-[8px] opacity-50">🔒</span>
          </div>
        ) : null}

        {/* Host controls */}
        {isHost && status === 'LOBBY' && (
          <button
            onClick={props.onStart}
            className="rounded-lg px-2.5 py-1 text-xs font-bold text-black transition-all hover:scale-105 active:scale-95 sm:px-3"
            style={{ background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)', boxShadow: '0 0 12px rgba(244,63,94,0.35)' }}
          >
            {mode === 'TOURNAMENT' ? 'Start Tournament →' : 'Start →'}
          </button>
        )}
        {isHost && status === 'RUNNING' && (
          <button
            onClick={() => props.onPause(true)}
            className="rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ borderColor: 'rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.1)', color: '#fb923c' }}
          >
            ⏸ Pause
          </button>
        )}
        {isHost && status === 'PAUSED' && (
          <button
            onClick={() => props.onPause(false)}
            className="rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ borderColor: 'rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.08)', color: '#67e8f9' }}
          >
            ▶ Resume
          </button>
        )}
        {!isHost && status === 'LOBBY' && (
          <div
            className="rounded-lg border px-2 py-1 text-xs text-white/35"
            style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}
          >
            Waiting for host…
          </div>
        )}
      </div>
    </header>
  )
}
