'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { teamColor, teamLogo } from '@/components/teamMeta'

export function CricketTossPanel(props: {
  matchId: string
  myTeamId: string | null
  homeTeamId: string
  awayTeamId: string
  calledByTeamId: string
  call: 'HEADS' | 'TAILS' | null
  result: 'HEADS' | 'TAILS' | null
  winnerTeamId: string | null
  decision: 'BAT' | 'BOWL' | null
  onCall: (call: 'HEADS' | 'TAILS') => void
  onDecide: (d: 'BAT' | 'BOWL') => void
}) {
  const homeColor = teamColor(props.homeTeamId)
  const awayColor = teamColor(props.awayTeamId)
  const canCall = props.myTeamId && props.myTeamId === props.calledByTeamId && !props.call
  const canDecide = props.myTeamId && props.myTeamId === props.winnerTeamId && !!props.winnerTeamId && !props.decision
  const winColor = teamColor(props.winnerTeamId)
  const [flipping, setFlipping] = useState(false)
  const [flipFace, setFlipFace] = useState<'👑' | '🦅'>('👑')
  const lastCallAnimKey = useRef<string>('')
  const lastResultAnimKey = useRef<string>('')
  /** Shared timer — Phase 2 cancels Phase 1 to prevent early stop. */
  const flipTimerRef = useRef<number | null>(null)

  const iWon = !!(props.myTeamId && props.winnerTeamId && props.myTeamId === props.winnerTeamId)
  const iLost = !!(props.myTeamId && props.winnerTeamId && props.myTeamId !== props.winnerTeamId && props.result)

  const coinFace = useMemo(() => {
    if (!props.result) return null
    return props.result === 'HEADS' ? '👑' : '🦅'
  }, [props.result])

  const clearFlipTimer = () => {
    if (flipTimerRef.current !== null) {
      window.clearTimeout(flipTimerRef.current)
      flipTimerRef.current = null
    }
  }

  // Phase 1: call placed — flip while waiting for server result.
  // Skip if result is already known; Phase 2 will handle the reveal.
  useEffect(() => {
    const key = `${props.matchId}|call|${props.call ?? ''}`
    if (!props.call) return
    if (key === lastCallAnimKey.current) return
    lastCallAnimKey.current = key
    // If result already arrived in the same render, let Phase 2 handle animation
    if (props.result) return
    clearFlipTimer()
    setFlipping(true)
    flipTimerRef.current = window.setTimeout(() => {
      setFlipping(false)
      flipTimerRef.current = null
    }, 1200)
    return () => { clearFlipTimer() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.call, props.result, props.matchId])

  // Phase 2: result known — always play a full reveal animation (win OR lose).
  useEffect(() => {
    const key = `${props.matchId}|result|${props.call ?? ''}|${props.result ?? ''}`
    if (!props.result || !props.call) return
    if (key === lastResultAnimKey.current) return
    lastResultAnimKey.current = key
    // Cancel Phase 1 timer so it doesn't stop this animation early
    clearFlipTimer()
    setFlipping(true)
    flipTimerRef.current = window.setTimeout(() => {
      setFlipping(false)
      flipTimerRef.current = null
    }, 1600)
    return () => { clearFlipTimer() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.result, props.call, props.matchId])

  const prevMatchIdRef = useRef<string>('')

  // New match / rematch: reset so animations can run again.
  useEffect(() => {
    if (prevMatchIdRef.current !== props.matchId) {
      prevMatchIdRef.current = props.matchId
      lastCallAnimKey.current = ''
      lastResultAnimKey.current = ''
    }
  }, [props.matchId])

  useEffect(() => {
    if (!flipping) return
    const id = window.setInterval(() => {
      setFlipFace((p) => (p === '👑' ? '🦅' : '👑'))
    }, 80)
    return () => window.clearInterval(id)
  }, [flipping])

  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-5 sm:p-8"
      style={{
        background: 'rgba(10,10,24,0.97)',
        borderColor: iWon ? '#ffd60a55' : iLost ? 'rgba(255,255,255,0.12)' : 'rgba(255,214,10,0.2)',
        boxShadow: iWon
          ? '0 0 60px rgba(255,214,10,0.12), 0 20px 60px rgba(0,0,0,0.5)'
          : '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(255,214,10,0.4) 0%, transparent 60%)' }}
      />

      <div className="relative">
        <div className="text-center">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(255,214,10,0.1)', borderColor: 'rgba(255,214,10,0.3)', color: '#ffd60a' }}
          >
            🪙 The Toss
          </div>
          <h2
            className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl"
            style={{ textShadow: '0 0 20px rgba(255,214,10,0.2)' }}
          >
            {props.call
              ? props.winnerTeamId
                ? iWon
                  ? 'You won the toss!'
                  : iLost
                    ? 'Toss lost'
                    : 'Toss complete!'
                : 'Coin in the air…'
              : 'Make your call'}
          </h2>
        </div>

        {/* Coin flip animation */}
        <div className="mx-auto mt-5 flex items-center justify-center">
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-full border-2"
            style={{
              background: flipping
                ? 'radial-gradient(circle at 30% 30%, rgba(255,214,10,0.5) 0%, rgba(255,214,10,0.2) 40%, rgba(0,0,0,0.3) 100%)'
                : props.result
                  ? 'radial-gradient(circle at 30% 30%, rgba(255,214,10,0.4) 0%, rgba(255,214,10,0.15) 40%, rgba(0,0,0,0.25) 100%)'
                  : 'radial-gradient(circle at 30% 30%, rgba(255,214,10,0.25) 0%, rgba(255,214,10,0.08) 40%, rgba(0,0,0,0.2) 100%)',
              borderColor: flipping ? 'rgba(255,214,10,0.6)' : 'rgba(255,214,10,0.3)',
              boxShadow: flipping
                ? '0 0 40px rgba(255,214,10,0.35), 0 0 80px rgba(255,214,10,0.15)'
                : props.result
                  ? '0 0 24px rgba(255,214,10,0.2)'
                  : '0 0 20px rgba(255,214,10,0.1)',
              animation: flipping ? 'coin-flip 0.6s ease-in-out infinite' : 'none',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            <span className="text-4xl" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' }}>
              {flipping ? flipFace : (coinFace ?? '🪙')}
            </span>
          </div>
        </div>

        {/* Win / Lose banner */}
        {!flipping && (iWon || iLost) && (
          <div
            className="mx-auto mt-4 max-w-xs rounded-2xl border px-4 py-2.5 text-center"
            style={
              iWon
                ? { background: 'rgba(255,214,10,0.12)', borderColor: 'rgba(255,214,10,0.4)', color: '#ffd60a' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.5)' }
            }
          >
            <div className="font-display text-sm font-extrabold uppercase tracking-wider">
              {iWon ? '🏆 You won the toss!' : '🎲 Toss lost'}
            </div>
          </div>
        )}

        {/* Teams */}
        <div className="mx-auto mt-6 flex max-w-xs items-center justify-center gap-5">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border-2"
              style={{ background: `${homeColor}18`, borderColor: `${homeColor}50` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo(props.homeTeamId) ?? ''} alt="" className="h-12 w-12 object-contain" />
            </div>
            <span className="text-sm font-bold" style={{ color: homeColor }}>{props.homeTeamId}</span>
          </div>
          <div className="font-display text-xl font-bold text-white/25">VS</div>
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border-2"
              style={{ background: `${awayColor}18`, borderColor: `${awayColor}50` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo(props.awayTeamId) ?? ''} alt="" className="h-12 w-12 object-contain" />
            </div>
            <span className="text-sm font-bold" style={{ color: awayColor }}>{props.awayTeamId}</span>
          </div>
        </div>

        {/* Status text */}
        <div className="mt-5 text-center text-sm">
          {props.call ? (
            <div
              className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <span className="text-white/40">Called:</span>
              <span className="font-bold text-white">{props.call}</span>
              <span className="text-white/20">•</span>
              <span className="text-white/40">Result:</span>
              <span className="font-bold text-white">{props.result ?? '…'}</span>
              {props.winnerTeamId ? (
                <>
                  <span className="text-white/20">•</span>
                  <span className="font-bold" style={{ color: winColor }}>🏆 {props.winnerTeamId} won!</span>
                </>
              ) : null}
            </div>
          ) : (
            <div className="text-white/45">
              Waiting for{' '}
              <span className="font-bold" style={{ color: teamColor(props.calledByTeamId) }}>
                {props.calledByTeamId}
              </span>{' '}
              to call…
            </div>
          )}
        </div>

        {/* Call buttons */}
        <div className="mx-auto mt-5 grid max-w-sm gap-3 sm:grid-cols-2">
          {(['HEADS', 'TAILS'] as const).map((side) => (
            <button
              key={side}
              type="button"
              disabled={!canCall}
              onClick={() => props.onCall(side)}
              className="group rounded-2xl border px-5 py-4 font-bold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
              style={
                canCall
                  ? {
                      background: 'rgba(255,214,10,0.08)',
                      borderColor: 'rgba(255,214,10,0.35)',
                      color: '#ffd60a',
                    }
                  : {
                      background: 'rgba(255,255,255,0.03)',
                      borderColor: 'rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.3)',
                    }
              }
              onMouseEnter={(e) => {
                if (canCall) {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,214,10,0.15)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(255,214,10,0.25)'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'
                }
              }}
              onMouseLeave={(e) => {
                if (canCall) {
                  ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,214,10,0.08)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                }
              }}
            >
              <div className="text-2xl">{side === 'HEADS' ? '👑' : '🦅'}</div>
              <div className="mt-1.5 text-sm font-extrabold tracking-wide">{side}</div>
            </button>
          ))}
        </div>

        {/* Bat/Bowl decision */}
        <div className="mx-auto mt-3 grid max-w-sm gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!canDecide}
            onClick={() => props.onDecide('BAT')}
            className="rounded-2xl border px-5 py-4 font-bold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
            style={
              canDecide
                ? {
                    background: 'rgba(0,212,255,0.12)',
                    borderColor: 'rgba(0,212,255,0.45)',
                    color: '#67e8f9',
                    boxShadow: '0 0 20px rgba(0,212,255,0.2)',
                  }
                : {
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.25)',
                  }
            }
          >
            <div className="text-2xl">🏏</div>
            <div className="mt-1.5 text-sm font-extrabold tracking-wide">Bat first</div>
          </button>
          <button
            type="button"
            disabled={!canDecide}
            onClick={() => props.onDecide('BOWL')}
            className="rounded-2xl border px-5 py-4 font-bold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-30"
            style={
              canDecide
                ? {
                    background: 'rgba(0,255,150,0.1)',
                    borderColor: 'rgba(0,255,150,0.4)',
                    color: '#4ade80',
                    boxShadow: '0 0 20px rgba(0,255,150,0.15)',
                  }
                : {
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.25)',
                  }
            }
          >
            <div className="text-2xl">⚾</div>
            <div className="mt-1.5 text-sm font-extrabold tracking-wide">Bowl first</div>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes coin-flip {
          0%   { transform: rotateY(0deg)    translateY(0px); }
          25%  { transform: rotateY(90deg)   translateY(-10px) scaleX(0.05); }
          50%  { transform: rotateY(180deg)  translateY(-16px); }
          75%  { transform: rotateY(270deg)  translateY(-10px) scaleX(0.05); }
          100% { transform: rotateY(360deg)  translateY(0px); }
        }
      `}</style>
    </div>
  )
}
