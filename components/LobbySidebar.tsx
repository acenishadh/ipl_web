'use client'

import type { AuctionSnapshot, RoomSnapshot } from '@ipl-auction/contracts'
import { teamColor, teamLogo } from './teamMeta'

export function LobbySidebar(props: {
  room: RoomSnapshot | null
  mySessionId: string | null
  auction?: AuctionSnapshot | null
}) {
  const participants = props.room?.participants ?? []

  return (
    <aside className="game-panel rounded-3xl border border-cyan-500/12 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-white">Lobby</h2>
        <div
          className="rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ background: 'rgba(0,212,255,0.12)', color: '#00d4ff' }}
        >
          {participants.length} joined
        </div>
      </div>

      <div className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2">
        {participants.map((p) => {
          const logo = teamLogo(p.teamId)
          const color = teamColor(p.teamId)
          const isMe = !!(props.mySessionId && p.sessionId === props.mySessionId)
          const isHost = props.room?.hostSessionId === p.sessionId

          // Purse remaining
          const teamData = props.auction?.teams.find((t) => t.teamId === p.teamId)
          const purseRemaining = teamData ? teamData.purseTotalLakh - teamData.purseSpentLakh : null
          const purgeCr = purseRemaining != null ? (purseRemaining / 100).toFixed(1) : null

          return (
            <div
              key={p.sessionId}
              className="flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 transition-all sm:rounded-2xl sm:px-3 sm:py-2.5"
              style={{
                background: isMe ? `${color}10` : 'rgba(255,255,255,0.03)',
                borderColor: isMe ? `${color}40` : 'rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-9 sm:w-9 sm:rounded-xl"
                  style={{ background: logo ? `${color}15` : 'rgba(255,255,255,0.05)' }}
                >
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="h-6 w-6 object-contain sm:h-7 sm:w-7" />
                  ) : (
                    <div className="text-sm text-white/20">?</div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="truncate text-xs font-bold text-white sm:text-sm">{p.displayName}</span>
                    {isHost && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(255,214,10,0.15)', color: '#ffd60a' }}
                      >
                        Host
                      </span>
                    )}
                    {isMe && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(0,255,150,0.15)', color: '#00ff9d' }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1">
                    {p.teamId ? (
                      <span className="text-[10px] font-semibold" style={{ color: `${color}cc` }}>
                        {p.teamId}
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/30">No team</span>
                    )}
                    <span className="text-[9px] text-white/20">•</span>
                    <span className="text-[9px] text-white/35">{p.role}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <div
                  className="flex h-2 w-2 rounded-full"
                  style={{ background: p.connected ? '#00ff9d' : '#ef4444' }}
                />
                {purgeCr != null && (
                  <div
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums"
                    style={{
                      background: Number(purgeCr) < 20 ? 'rgba(239,68,68,0.15)' : 'rgba(0,212,255,0.1)',
                      color: Number(purgeCr) < 20 ? '#f87171' : '#67e8f9',
                    }}
                  >
                    ₹{purgeCr}Cr
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {participants.length === 0 && (
          <div className="py-6 text-center text-sm text-white/25">Waiting for players…</div>
        )}
      </div>
    </aside>
  )
}
