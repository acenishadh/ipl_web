'use client'

import type { RoomSnapshot } from '@ipl-auction/contracts'
import { TEAM_META, teamColor } from './teamMeta'

export function TeamPickerModal(props: {
  open: boolean
  room: RoomSnapshot | any | null
  title?: string
  botTeamIds?: string[]
  onPick: (teamId: string) => void
  onClose?: () => void
}) {
  if (!props.open) return null

  const botTeamIds = new Set(props.botTeamIds ?? [])
  // Teams "taken" by humans (not bots) — bots can be taken over
  const taken = new Set(
    (props.room?.participants ?? [])
      .filter((p: any) => !p.sessionId?.startsWith('bot_'))
      .map((p: any) => p.teamId)
      .filter(Boolean) as string[]
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-3xl animate-[slide-up_0.25s_ease-out] rounded-3xl border p-6 sm:p-8"
        style={{
          background: 'rgba(10,10,24,0.98)',
          borderColor: 'rgba(0,212,255,0.2)',
          boxShadow: '0 0 60px rgba(0,212,255,0.08), 0 30px 80px rgba(0,0,0,0.7)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              className="font-display text-2xl font-bold text-white sm:text-3xl"
              style={{ textShadow: '0 0 20px rgba(0,212,255,0.3)' }}
            >
              {props.title ?? 'Choose Your Franchise'}
            </h2>
            {props.room?.status === 'RUNNING' || props.room?.status === 'PAUSED' ? (
              <p className="mt-1 text-sm" style={{ color: '#fb923c' }}>
                ⚡ Game in progress — pick a 🤖 Bot team to take over from where it left off
              </p>
            ) : (
              <p className="mt-1 text-sm text-white/40">
                {taken.size} team{taken.size !== 1 ? 's' : ''} already taken
              </p>
            )}
          </div>
          {props.onClose ? (
            <button
              onClick={props.onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border text-white/50 transition-all hover:scale-110 hover:text-white"
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}
            >
              ✕
            </button>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {TEAM_META.map((t) => {
            const disabled = taken.has(t.id)
            const color = teamColor(t.id)
            return (
              <button
                key={t.id}
                disabled={disabled}
                onClick={() => props.onPick(t.id)}
                className="group flex flex-col items-center gap-3 rounded-2xl border p-3 text-center transition-all hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-30"
                style={
                  disabled
                    ? { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }
                    : {
                        background: `${color}0e`,
                        borderColor: `${color}30`,
                        boxShadow: '0 0 0 rgba(0,0,0,0)',
                      }
                }
                onMouseEnter={(e) => {
                  if (!disabled) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}60`
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${color}18, 0 8px 20px rgba(0,0,0,0.3)`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}30`
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 rgba(0,0,0,0)'
                  }
                }}
              >
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-xl"
                  style={{ background: disabled ? 'rgba(255,255,255,0.04)' : `${color}15` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.logo} alt={t.name} className="h-12 w-12 object-contain" />
                </div>
                <div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: disabled ? 'rgba(255,255,255,0.3)' : color }}
                  >
                    {t.id}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-tight text-white/35">{t.name}</div>
                </div>
                {taken.has(t.id) ? (
                  <div
                    className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}
                  >
                    Taken
                  </div>
                ) : botTeamIds.has(t.id) ? (
                  <div
                    className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
                  >
                    🤖 Bot
                  </div>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
