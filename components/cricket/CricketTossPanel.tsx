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

  const coinFace = useMemo(() => {
    if (!props.result) return null
    return props.result === 'HEADS' ? '👑' : '🦅'
  }, [props.result])

  // Phase 1: call placed — flip while waiting for server result (win or lose).
  useEffect(() => {
    const key = `${props.matchId}|call|${props.call ?? ''}`
    if (!props.call) return
    if (key === lastCallAnimKey.current) return
    lastCallAnimKey.current = key
    setFlipping(true)
    const stopDelay = props.result ? 400 : 1200
    const t = window.setTimeout(() => setFlipping(false), stopDelay)
    return () => window.clearTimeout(t)
  }, [props.call, props.result, props.matchId])

  // Phase 2: result known — always play a full reveal animation (caller won or lost the flip).
  useEffect(() => {
    const key = `${props.matchId}|result|${props.call ?? ''}|${props.result ?? ''}`
    if (!props.result || !props.call) return
    if (key === lastResultAnimKey.current) return
    lastResultAnimKey.current = key
    setFlipping(true)
    const t = window.setTimeout(() => setFlipping(false), 1500)
    return () => window.clearTimeout(t)
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
    // Rapid alternation while the coin is flipping.
    const id = window.setInterval(() => {
      setFlipFace((p) => (p === '👑' ? '🦅' : '👑'))
    }, 90)
    return () => window.clearInterval(id)
  }, [flipping])

  return (
    <div
      className="relative overflow-hidden rounded-3xl border p-6 sm:p-8"
      style={{
        background: 'rgba(10,10,24,0.95)',
        borderColor: 'rgba(255,214,10,0.2)',
        boxShadow: '0 0 40px rgba(255,214,10,0.06), 0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
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
            className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl"
            style={{ textShadow: '0 0 20px rgba(255,214,10,0.2)' }}
          >
            {props.call ? (props.winnerTeamId ? 'Toss complete!' : 'Toss in progress…') : 'Make your call'}
          </h2>
        </div>

        {/* Coin flip animation */}
        <div className="mx-auto mt-6 flex items-center justify-center">
          <div
            className="relative flex h-20 w-20 items-center justify-center rounded-full border"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,214,10,0.35) 0%, rgba(255,214,10,0.12) 35%, rgba(0,0,0,0.2) 100%)',
              borderColor: 'rgba(255,214,10,0.35)',
              boxShadow: '0 0 30px rgba(255,214,10,0.15)',
              transformStyle: 'preserve-3d',
              animation: flipping ? 'coin-flip 1.2s ease-in-out' : 'none',
            }}
          >
            <span className="text-3xl" style={{ filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.6))' }}>
              {flipping ? flipFace : (coinFace ?? '🪙')}
            </span>
          </div>
        </div>

        {/* Teams */}
        <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border"
              style={{ background: `${homeColor}18`, borderColor: `${homeColor}40` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo(props.homeTeamId) ?? ''} alt="" className="h-12 w-12 object-contain" />
            </div>
            <span className="text-sm font-bold" style={{ color: homeColor }}>{props.homeTeamId}</span>
          </div>
          <div className="font-display text-2xl font-bold text-white/30">VS</div>
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl border"
              style={{ background: `${awayColor}18`, borderColor: `${awayColor}40` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogo(props.awayTeamId) ?? ''} alt="" className="h-12 w-12 object-contain" />
            </div>
            <span className="text-sm font-bold" style={{ color: awayColor }}>{props.awayTeamId}</span>
          </div>
        </div>

        {/* Status text */}
        <div className="mt-6 text-center text-sm">
          {props.call ? (
            <div
              className="inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <span className="text-white/50">Called:</span>
              <span className="font-bold text-white">{props.call}</span>
              <span className="text-white/30">•</span>
              <span className="text-white/50">Result:</span>
              <span className="font-bold text-white">{props.result ?? '…'}</span>
              {props.winnerTeamId ? (
                <>
                  <span className="text-white/30">•</span>
                  <span className="font-bold" style={{ color: winColor }}>🏆 {props.winnerTeamId} won!</span>
                </>
              ) : null}
            </div>
          ) : (
            <div className="text-white/50">
              Waiting for{' '}
              <span
                className="font-bold"
                style={{ color: teamColor(props.calledByTeamId) }}
              >
                {props.calledByTeamId}
              </span>{' '}
              to call…
            </div>
          )}
        </div>

        {/* Call buttons */}
        <div className="mx-auto mt-6 grid max-w-sm gap-3 sm:grid-cols-2">
          {(['HEADS', 'TAILS'] as const).map((side) => (
            <button
              key={side}
              type="button"
              disabled={!canCall}
              onClick={() => props.onCall(side)}
              className="rounded-2xl border px-5 py-4 font-bold transition-all disabled:cursor-not-allowed disabled:opacity-30"
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
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(255,214,10,0.2)'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
              }}
            >
              <div className="text-xl">{side === 'HEADS' ? '👑' : '🦅'}</div>
              <div className="mt-1 text-sm font-bold">{side}</div>
            </button>
          ))}
        </div>

        {/* Bat/Bowl decision */}
        <div className="mx-auto mt-4 grid max-w-sm gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={!canDecide}
            onClick={() => props.onDecide('BAT')}
            className="rounded-2xl px-5 py-4 font-bold transition-all disabled:cursor-not-allowed disabled:opacity-30"
            style={
              canDecide
                ? {
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                    color: '#000',
                    boxShadow: '0 0 20px rgba(0,212,255,0.35)',
                  }
                : {
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.25)',
                  }
            }
          >
            <div className="text-xl">🏏</div>
            <div className="mt-1 text-sm font-bold">Bat first</div>
          </button>
          <button
            type="button"
            disabled={!canDecide}
            onClick={() => props.onDecide('BOWL')}
            className="rounded-2xl border px-5 py-4 font-bold transition-all disabled:cursor-not-allowed disabled:opacity-30"
            style={
              canDecide
                ? {
                    background: 'rgba(0,255,150,0.1)',
                    borderColor: 'rgba(0,255,150,0.35)',
                    color: '#00ff9d',
                  }
                : {
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.25)',
                  }
            }
          >
            <div className="text-xl">⚾</div>
            <div className="mt-1 text-sm font-bold">Bowl first</div>
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes coin-flip {
          0% { transform: rotateY(0deg) translateY(0px); }
          20% { transform: rotateY(180deg) translateY(-8px); }
          50% { transform: rotateY(540deg) translateY(-14px); }
          80% { transform: rotateY(900deg) translateY(-8px); }
          100% { transform: rotateY(1080deg) translateY(0px); }
        }
      `}</style>
    </div>
  )
}
