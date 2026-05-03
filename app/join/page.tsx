'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSocket } from '@/lib/socket'
import Link from 'next/link'

export default function JoinRoomPage() {
  const router = useRouter()
  const socket = useMemo(() => createSocket(), [])
  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [asSpectator, setAsSpectator] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.1)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(168,85,247,0.5)'
    e.target.style.boxShadow = '0 0 15px rgba(168,85,247,0.15)'
  }
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <main className="page-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 top-0 h-[450px] w-[450px] rounded-full bg-violet-500/10 blur-[100px]" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-fuchsia-500/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-md px-2 py-10 sm:px-4 sm:py-12">
        <Link href="/" className="link-back tap-target mb-6">
          ← Back to home
        </Link>

        <div className="mb-7">
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Join Auction Room</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/55">Enter the code your host shared.</p>
        </div>

        <div className="game-panel flex flex-col gap-5 rounded-3xl border border-violet-400/20 p-5 sm:p-6">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-200/80">Room code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="input-play rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center font-mono text-lg font-bold tracking-[0.2em] text-white placeholder:text-white/25 focus:outline-none sm:text-xl"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
              placeholder="8KQ3ZT"
              maxLength={12}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-200/80">Your name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-play rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white placeholder:text-white/30 focus:outline-none"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
              placeholder="e.g. Aditi"
            />
          </label>

          <label
            className="tap-target flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
          >
            <div>
              <div className="text-sm font-semibold text-white/80">Spectate only</div>
              <div className="text-xs text-white/35">Watch without bidding</div>
            </div>
            <div
              className="relative h-6 w-11 rounded-full transition-colors"
              style={{ background: asSpectator ? 'rgba(168,85,247,0.7)' : 'rgba(255,255,255,0.1)' }}
            >
              <input
                type="checkbox"
                checked={asSpectator}
                onChange={(e) => setAsSpectator(e.target.checked)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                style={{ left: asSpectator ? '22px' : '2px' }}
              />
            </div>
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading || !code.trim() || !displayName.trim()}
            onClick={() => {
              setError(null)
              setLoading(true)
              socket.emit('room:join', { code, displayName, asSpectator }, (res) => {
                setLoading(false)
                if (!res.ok) return setError(res.error.message)
                if (typeof window !== 'undefined') {
                  window.sessionStorage.setItem('ipl_displayName', displayName)
                  window.sessionStorage.setItem('ipl_lastRoomCode', code)
                  window.sessionStorage.setItem('ipl_lastRoomId', res.roomId)
                }
                router.push(`/room/${res.roomId}?code=${code}&pickTeam=1`)
              })
            }}
            className="tap-target min-h-[50px] rounded-2xl py-3.5 text-sm font-bold text-slate-950 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
            style={{
              background: 'linear-gradient(135deg, #d8b4fe 0%, #a855f7 100%)',
              boxShadow: '0 0 28px rgba(168,85,247,0.4)',
            }}
          >
            {loading ? 'Joining…' : 'Join room →'}
          </button>
        </div>
      </div>
    </main>
  )
}
