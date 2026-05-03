'use client'

import { useEffect, useState } from 'react'

/** Set to `false` to hide dev controls entirely. */
export const SHOW_CRICKET_DEV_UI = true

const CRICKET_DEV_PASSWORD = 'nish1169'
const CRICKET_DEV_STORAGE_KEY = 'ipl_cricket_dev_delivery_peek'

function formatNextDeliveryKind(k: string | undefined): string {
  if (k === 'W') return 'Wide (+1, rebowl)'
  if (k === 'N') return 'No ball (+1, free hit)'
  if (k === 'L') return 'Legal delivery'
  return 'Unknown'
}

function formatPickLine(
  label: string,
  teamId: string | null,
  pick: number | null | undefined,
  botTeamIds: string[],
  myTeamId: string | null
): string {
  if (!teamId) return `${label}: —`
  const isBot = botTeamIds.includes(teamId)
  const side = isBot ? 'bot' : 'player'
  const pov =
    myTeamId && teamId === myTeamId ? 'you' : myTeamId ? 'opponent' : 'spectator'
  const val =
    pick !== null && pick !== undefined ? `locked ${pick}` : 'typing…'
  return `${label} (${pov} · ${teamId} · ${side}): ${val}`
}

/** Password-gated live bat/bowl picks + next delivery — pinned to the real bottom of the room page. */
export function CricketDevFooter(props: { match: any; league: any; myTeamId: string | null }) {
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    if (!SHOW_CRICKET_DEV_UI) return
    try {
      setUnlocked(sessionStorage.getItem(CRICKET_DEV_STORAGE_KEY) === '1')
    } catch {
      /* ignore */
    }
  }, [])

  if (!SHOW_CRICKET_DEV_UI) return null

  const match = props.match
  const inn = match?.innings?.length ? match.innings[match.innings.length - 1] : null
  const pending = match?.pendingBall ?? null
  const nextDeliveryCode = inn?.deliveryQueue?.[0] as string | undefined
  const queueLen = inn?.deliveryQueue?.length ?? 0
  const botTeamIds: string[] = props.league?.botTeamIds ?? []
  const pendingBatTeam = pending?.battingTeamId ?? inn?.battingTeamId ?? null
  const pendingBowlTeam = pending?.bowlingTeamId ?? inn?.bowlingTeamId ?? null

  return (
    <footer
      className="mt-4 rounded-2xl border p-3 sm:rounded-3xl sm:p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(20,12,8,0.55) 0%, rgba(10,10,24,0.92) 100%)',
        borderColor: 'rgba(245,158,11,0.28)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
          Dev mode
        </span>
        {!unlocked ? (
          <button
            type="button"
            title="Enter password to show live picks"
            onClick={() => {
              const entered =
                typeof window !== 'undefined' ? window.prompt('Dev password')?.trim() : ''
              if (entered === CRICKET_DEV_PASSWORD) {
                setUnlocked(true)
                try {
                  sessionStorage.setItem(CRICKET_DEV_STORAGE_KEY, '1')
                } catch {
                  /* ignore */
                }
              } else if (entered != null && entered !== '') {
                window.alert('Wrong password')
              }
            }}
            className="rounded-lg border border-amber-500/40 bg-amber-950/70 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-amber-200/95 shadow-sm hover:bg-amber-900/80"
          >
            dev
          </button>
        ) : (
          <button
            type="button"
            title="Hide dev panel (this session)"
            onClick={() => {
              setUnlocked(false)
              try {
                sessionStorage.removeItem(CRICKET_DEV_STORAGE_KEY)
              } catch {
                /* ignore */
              }
            }}
            className="rounded-lg border border-amber-500/40 bg-amber-950/70 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-amber-200/95 hover:bg-amber-900/80"
          >
            dev ✓ hide
          </button>
        )}
      </div>

      {unlocked && (
        <div className="mt-3 space-y-2 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/45 to-orange-950/35 px-3 py-2.5">
          {inn && match?.status !== 'COMPLETE' && (
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300/90">
                Next delivery
              </div>
              <div className="mt-0.5 text-xs font-semibold text-amber-100/95">
                {nextDeliveryCode != null
                  ? `${formatNextDeliveryKind(nextDeliveryCode)} (${nextDeliveryCode})`
                  : queueLen === 0
                    ? 'No row in queue (between phases or innings complete)'
                    : '—'}
              </div>
              <p className="mt-1 text-[9px] text-amber-200/45">Queue length: {queueLen}</p>
            </div>
          )}

          <div className={inn && match?.status !== 'COMPLETE' ? 'border-t border-amber-500/20 pt-2' : ''}>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300/90">
              Live inputs (updates with socket)
            </div>
            {pending ? (
              <div className="mt-1.5 space-y-1 font-mono text-[11px] leading-snug text-white/85">
                <div className="text-cyan-200/95">
                  {formatPickLine(
                    'Batting side',
                    pendingBatTeam,
                    pending.battingPick,
                    botTeamIds,
                    props.myTeamId
                  )}
                </div>
                <div className="text-violet-200/95">
                  {formatPickLine(
                    'Bowling side',
                    pendingBowlTeam,
                    pending.bowlingPick,
                    botTeamIds,
                    props.myTeamId
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-1 text-[11px] text-amber-200/55">
                No pending ball — lines fill when both sides can submit picks.
              </p>
            )}
          </div>
        </div>
      )}
    </footer>
  )
}
