'use client'

import { useEffect, useState } from 'react'
import { teamColor, teamLogo } from '@/components/teamMeta'

/**
 * Toss result + pre-match countdown. Playing XI is a separate full-page flow (`CricketPlayingXIPage`).
 */
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
  }
  /** Undefined when viewer is a spectator/non-player — no phaseAck allowed for them. */
  onContinue?: () => void
  matchLabel?: string
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
      <div className="w-full max-w-lg">
        <div
          className="w-full rounded-3xl border p-6 text-center sm:p-8"
          style={{
            background: 'rgba(12,12,28,0.98)',
            borderColor: `${winColor}50`,
            boxShadow: `0 0 60px ${winColor}20`,
          }}
        >
          <div className="text-4xl">🪙</div>
          <h2 className="mt-4 font-display text-2xl font-bold text-white">Toss result</h2>
          {props.matchLabel ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/35">{props.matchLabel}</p>
          ) : null}
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
            onContinue ? (
              <button
                type="button"
                onClick={onContinue}
                className="mt-6 w-full rounded-2xl py-4 font-display text-lg font-bold text-black transition-transform active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  boxShadow: '0 0 24px rgba(0,212,255,0.35)',
                }}
              >
                Continue
              </button>
            ) : (
              <div
                className="mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold text-white/50"
                style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
              >
                ⏳ Players are selecting their Playing XI…
              </div>
            )
          ) : null}

          <p className="mt-3 text-xs text-white/35">
            {!showStart
              ? 'Match starting…'
              : onContinue
                ? 'Pick your XI on the next screen if you are playing.'
                : 'Match will begin once both teams confirm their XI.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export function CricketInningsBreakOverlay(props: {
  match: {
    innings: Array<{ battingTeamId: string; runs: number; wickets: number; balls: number }>
    target: number | null
    inningsBreakUntilMs: number | null
  }
  /** Undefined when viewer is a spectator/non-player — no phaseAck allowed for them. */
  onContinue?: () => void
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
          onContinue ? (
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
          ) : (
            <div
              className="mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold text-white/50"
              style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
            >
              ⏳ Waiting for players to start 2nd innings…
            </div>
          )
        )}
        <p className="mt-2 text-xs text-white/35">
          {showStart
            ? onContinue
              ? 'Chase begins when you continue.'
              : 'Match resumes when a player continues.'
            : '2nd innings starting…'}
        </p>
      </div>
    </div>
  )
}
