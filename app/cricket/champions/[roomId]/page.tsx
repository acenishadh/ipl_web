'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSocket, getLocalSessionId } from '@/lib/socket'
import { FlowAmbient } from '@/components/FlowAmbient'
import { CricketTournamentVictory } from '@/components/cricket/CricketTournamentVictory'

type CricketSnapshot = any

function computeManOfTournament(league: any): { teamId: string; player: string; score: number; runs: number; wickets: number } | null {
  const batRows = Object.values(league?.tournamentBatting ?? {}) as { teamId: string; player: string; runs: number }[]
  const bowlRows = Object.values(league?.tournamentBowling ?? {}) as { teamId: string; player: string; wickets: number }[]
  if (batRows.length === 0 && bowlRows.length === 0) return null

  // Simple, explainable scoring:
  // - 1 run = 1 point
  // - 1 wicket = 25 points
  // This favors impact without being overly complex.
  const m = new Map<string, { teamId: string; player: string; runs: number; wickets: number }>()
  for (const r of batRows) {
    const k = `${r.teamId}|${r.player}`
    const cur = m.get(k) ?? { teamId: r.teamId, player: r.player, runs: 0, wickets: 0 }
    cur.runs += r.runs
    m.set(k, cur)
  }
  for (const w of bowlRows) {
    const k = `${w.teamId}|${w.player}`
    const cur = m.get(k) ?? { teamId: w.teamId, player: w.player, runs: 0, wickets: 0 }
    cur.wickets += w.wickets
    m.set(k, cur)
  }

  const rows = [...m.values()].map((r) => ({ ...r, score: r.runs + r.wickets * 25 }))
  rows.sort((a, b) => b.score - a.score || b.wickets - a.wickets || b.runs - a.runs || a.player.localeCompare(b.player))
  return rows[0] ?? null
}

export default function CricketChampionsPage() {
  const params = useParams<{ roomId: string }>()
  const search = useSearchParams()
  const router = useRouter()
  const roomId = params.roomId
  const code = search.get('code')

  const socket = useMemo(() => createSocket(), [])
  const [snap, setSnap] = useState<CricketSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mySessionId = getLocalSessionId()

  useEffect(() => {
    socket.on('cricket:snapshot', setSnap)
    return () => {
      socket.disconnect()
    }
  }, [socket])

  // Join/rejoin to fetch snapshots even if user refreshes this page.
  useEffect(() => {
    setError(null)

    // If we have code, join by code (handles restored rooms).
    if (code) {
      const name = (() => {
        try { return window.sessionStorage.getItem('ipl_displayName') ?? 'Player' } catch { return 'Player' }
      })()
      socket.emit('cricket:room:join', { code, displayName: name, asSpectator: false }, (res) => {
        if (!res.ok) setError(res.error.message)
      })
      return
    }

    // Otherwise try rejoin by id (must exist in memory).
    socket.emit('cricket:room:rejoin', { roomId }, (res: any) => {
      if (!res?.ok) setError('Could not rejoin room. Open using a code link.')
    })
  }, [socket, code, roomId])

  // If this isn't finished, send user back into the room.
  useEffect(() => {
    const status = snap?.room?.status
    if (!status) return
    if (status !== 'FINISHED') {
      router.replace(`/cricket/room/${roomId}${code ? `?code=${encodeURIComponent(code)}` : ''}`)
    }
  }, [snap?.room?.status, router, roomId, code])

  const league = snap?.league ?? null
  const motm = league ? computeManOfTournament(league) : null

  return (
    <main className="page-shell relative min-h-screen overflow-hidden">
      <FlowAmbient variant="cricket" />

      <div className="relative mx-auto max-w-5xl px-2 py-8 sm:px-4 sm:py-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link href="/" className="link-back tap-target">
            ← Home
          </Link>
          <div className="text-xs text-white/35">
            {code ? (
              <span>
                Room code: <span className="font-mono font-bold tracking-widest text-white/70">{code}</span>
              </span>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            ⚠️ {error}
          </div>
        ) : null}

        {/* Finals night hero */}
        <div
          className="mb-6 overflow-hidden rounded-3xl border p-5 sm:p-7"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(255,214,10,0.20) 0%, rgba(99,102,241,0.10) 30%, rgba(10,10,24,0.96) 58%)',
            borderColor: 'rgba(255,214,10,0.28)',
            boxShadow: '0 0 90px rgba(255,214,10,0.08)',
          }}
        >
          <div className="flex flex-col items-start gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-amber-200/80">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-300" />
              Finals night
            </div>
            <div className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Champions crowned.
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-white/50">
              Trophy, caps, and season awards — everything in one place. Share a screenshot with your friends.
            </p>
          </div>
        </div>

        {/* Man of the tournament */}
        {motm ? (
          <div
            className="mb-6 overflow-hidden rounded-3xl border p-5 sm:p-6"
            style={{
              background: 'linear-gradient(145deg, rgba(99,102,241,0.15) 0%, rgba(10,10,24,0.96) 55%)',
              borderColor: 'rgba(99,102,241,0.35)',
              boxShadow: '0 0 60px rgba(99,102,241,0.08)',
            }}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-indigo-200/80">
                  ⭐ Man of the Tournament
                </div>
                <div className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                  {motm.player}
                </div>
                <div className="mt-1 text-sm text-white/55">
                  {motm.teamId} · <span className="font-mono font-bold">{motm.runs}</span> runs ·{' '}
                  <span className="font-mono font-bold">{motm.wickets}</span> wickets
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="rounded-2xl border border-indigo-400/25 bg-indigo-500/10 px-4 py-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Impact score</div>
                  <div className="mt-1 font-display text-3xl font-extrabold text-indigo-100">{motm.score}</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Champions + caps */}
        {league ? <CricketTournamentVictory league={league} /> : null}
      </div>
    </main>
  )
}

