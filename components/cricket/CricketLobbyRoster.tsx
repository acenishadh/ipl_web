'use client'

import { teamColor, teamLogo } from '@/components/teamMeta'

export function CricketLobbyRoster(props: {
  room: any | null
  mySessionId: string | null
  /** Host-only: kick removes the player and assigns a bot to their franchise when applicable. */
  onKickPlayer?: (targetSessionId: string) => void
}) {
  const participants: any[] = props.room?.participants ?? []
  const hostSessionId: string | null = props.room?.hostSessionId ?? null
  const viewerIsHost = !!(hostSessionId && props.mySessionId && hostSessionId === props.mySessionId)

  return (
    <div
      className="rounded-3xl border p-3 sm:p-4"
      style={{
        background: 'rgba(10,10,24,0.9)',
        borderColor: 'rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-white">Players</h3>
        <div
          className="rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ background: 'rgba(244,63,94,0.12)', color: '#fb7185' }}
        >
          {participants.length} joined
        </div>
      </div>

      <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
        {participants.map((p) => {
          const isMe = !!(props.mySessionId && p.sessionId === props.mySessionId)
          const isHost = !!(hostSessionId && p.sessionId === hostSessionId)
          const isBot = p.sessionId?.startsWith('bot_')
          const showKick =
            viewerIsHost &&
            props.onKickPlayer &&
            !isBot &&
            !isHost &&
            p.sessionId !== props.mySessionId
          const color = teamColor(p.teamId)
          const logo = teamLogo(p.teamId)

          return (
            <div
              key={p.sessionId}
              className="flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2"
              style={{
                background: isMe ? `${color}10` : isBot ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.03)',
                borderColor: isMe ? `${color}35` : isBot ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: logo ? `${color}15` : 'rgba(255,255,255,0.05)' }}
                >
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="h-5 w-5 object-contain" />
                  ) : (
                    <div className="text-xs text-white/20">{isBot ? '🤖' : '?'}</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="truncate text-xs font-bold" style={{ color: isBot ? 'rgba(99,102,241,0.8)' : 'white' }}>
                      {p.displayName}
                    </span>
                    {isHost && !isBot && (
                      <span className="rounded px-1 py-0.5 text-[8px] font-bold uppercase" style={{ background: 'rgba(255,214,10,0.15)', color: '#ffd60a' }}>Host</span>
                    )}
                    {isMe && (
                      <span className="rounded px-1 py-0.5 text-[8px] font-bold uppercase" style={{ background: 'rgba(0,255,150,0.15)', color: '#00ff9d' }}>You</span>
                    )}
                  </div>
                  {p.teamId && (
                    <span className="text-[9px] font-semibold" style={{ color: `${color}cc` }}>{p.teamId}</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {showKick && (
                  <button
                    type="button"
                    onClick={() => props.onKickPlayer?.(p.sessionId)}
                    className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors hover:bg-white/10"
                    style={{ color: '#fb7185', border: '1px solid rgba(251,113,133,0.35)' }}
                  >
                    Kick
                  </button>
                )}
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: isBot ? 'rgba(99,102,241,0.6)' : p.connected ? '#00ff9d' : '#ef4444' }}
                />
              </div>
            </div>
          )
        })}

        {participants.length === 0 && (
          <div className="py-6 text-center text-sm text-white/25">Waiting for players…</div>
        )}
      </div>
    </div>
  )
}
