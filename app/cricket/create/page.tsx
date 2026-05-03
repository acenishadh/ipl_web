'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSocket } from '@/lib/socket'
import Link from 'next/link'

const OVERS_OPTIONS = [5, 10, 15, 20] as const
type OversOption = (typeof OVERS_OPTIONS)[number]
type CricketMode = 'QUICK' | 'TOURNAMENT'

export default function CricketCreateRoomPage() {
  const router = useRouter()
  const socket = useMemo(() => createSocket(), [])
  const [displayName, setDisplayName] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [overs, setOvers] = useState<OversOption>(5)
  const [mode, setMode] = useState<CricketMode>('QUICK')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <main className="page-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-0 h-[450px] w-[450px] rounded-full bg-rose-400/10 blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-orange-400/9 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-md px-2 py-10 sm:px-4 sm:py-12">
        <Link href="/cricket" className="link-back tap-target mb-6">
          ← Back to cricket
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Create Cricket Room</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/55">Set up your match or full tournament.</p>
        </div>

        <div className="game-panel game-panel-warm flex flex-col gap-5 rounded-2xl border border-rose-400/20 p-5 sm:rounded-3xl sm:p-6">
          {/* Your name */}
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-rose-200/75">Your name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-play rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white placeholder:text-white/30 focus:outline-none"
              style={{ transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(244,63,94,0.5)'; e.target.style.boxShadow = '0 0 15px rgba(244,63,94,0.15)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
              placeholder="e.g. Rahul"
            />
          </label>

          {/* Mode selector */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-200/75">Match type</div>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'QUICK' as const, label: '⚡ Quick Match', desc: '2 players · 1 match' },
                { id: 'TOURNAMENT' as const, label: '🏆 Tournament', desc: '10 teams · full season' },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMode(opt.id)}
                  className="flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all hover:scale-[1.02] active:scale-95"
                  style={
                    mode === opt.id
                      ? { background: 'rgba(244,63,94,0.18)', borderColor: 'rgba(244,63,94,0.55)', boxShadow: '0 0 14px rgba(244,63,94,0.2)' }
                      : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }
                  }
                >
                  <span className="text-sm font-bold" style={{ color: mode === opt.id ? '#fb7185' : 'rgba(255,255,255,0.7)' }}>
                    {opt.label}
                  </span>
                  <span className="text-[10px]" style={{ color: mode === opt.id ? 'rgba(251,113,133,0.6)' : 'rgba(255,255,255,0.3)' }}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
            {mode === 'TOURNAMENT' && (
              <div
                className="mt-2 rounded-xl border px-3 py-2 text-[10px] leading-relaxed text-white/45"
                style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.2)' }}
              >
                All 10 IPL teams compete. Invite friends to pick teams — remaining slots are filled with bots. Round-robin group stage (9 matches each), then Q1 → Eliminator → Q2 → Finals.
              </div>
            )}
          </div>

          {/* Overs selector */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-200/75">Overs per match</div>
            <div className="grid grid-cols-4 gap-2">
              {OVERS_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setOvers(n)}
                  className="flex flex-col items-center gap-0.5 rounded-xl border py-2.5 text-center transition-all hover:scale-[1.04] active:scale-95"
                  style={
                    overs === n
                      ? { background: 'rgba(244,63,94,0.2)', borderColor: 'rgba(244,63,94,0.6)', boxShadow: '0 0 14px rgba(244,63,94,0.25)' }
                      : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }
                  }
                >
                  <span className="font-display text-xl font-extrabold tabular-nums" style={{ color: overs === n ? '#fb7185' : 'rgba(255,255,255,0.5)' }}>
                    {n}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: overs === n ? 'rgba(251,113,133,0.7)' : 'rgba(255,255,255,0.25)' }}>
                    overs
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Public toggle */}
          <label
            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div>
              <div className="text-sm font-semibold text-white/80">Public room</div>
              <div className="text-xs text-white/35">Visible in live rooms list</div>
            </div>
            <div
              className="relative h-6 w-11 rounded-full transition-colors"
              style={{ background: isPublic ? 'rgba(244,63,94,0.7)' : 'rgba(255,255,255,0.1)' }}
            >
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="absolute inset-0 cursor-pointer opacity-0" />
              <div className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform" style={{ left: isPublic ? '22px' : '2px' }} />
            </div>
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
          ) : null}

          <button
            disabled={loading || !displayName.trim()}
            onClick={() => {
              setError(null)
              setLoading(true)
              socket.emit('cricket:room:create', { displayName, isPublic, overs, mode }, (res) => {
                setLoading(false)
                if (!res.ok) return setError(res.error.message)
                try {
                  window.sessionStorage.setItem('ipl_displayName', displayName)
                  window.sessionStorage.setItem('ipl_lastCricketRoomCode', res.code)
                  window.sessionStorage.setItem('ipl_lastCricketRoomId', res.roomId)
                } catch { /* ignore */ }
                router.push(`/cricket/room/${res.roomId}?code=${res.code}&pickTeam=1`)
              })
            }}
            className="tap-target min-h-[50px] rounded-2xl py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
            style={{
              background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
              boxShadow: '0 0 28px rgba(244,63,94,0.45)',
            }}
          >
            {loading ? 'Creating…' : mode === 'TOURNAMENT' ? 'Create Tournament Room →' : 'Create Quick Match →'}
          </button>
        </div>
      </div>
    </main>
  )
}
