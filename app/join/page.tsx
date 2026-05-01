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
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 top-0 h-[450px] w-[450px] rounded-full bg-purple-500/[0.06] blur-[100px]" />
        <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-pink-500/[0.05] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-md px-4 py-12 sm:px-6">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70">
          ← Back
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-white">Join Auction Room</h1>
          <p className="mt-2 text-sm text-white/50">Enter the code your host shared.</p>
        </div>

        <div
          className="flex flex-col gap-5 rounded-3xl border p-6"
          style={{
            background: 'rgba(12,12,28,0.9)',
            borderColor: 'rgba(168,85,247,0.15)',
            boxShadow: '0 0 40px rgba(168,85,247,0.05), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Room code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="rounded-xl border px-4 py-3 text-center font-mono text-xl font-bold tracking-widest text-white placeholder:text-white/20 focus:outline-none"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
              placeholder="8KQ3ZT"
              maxLength={12}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Your name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-xl border px-4 py-3 text-sm font-medium text-white placeholder:text-white/25 focus:outline-none"
              style={inputStyle}
              onFocus={focusIn}
              onBlur={focusOut}
              placeholder="e.g. Aditi"
            />
          </label>

          <label
            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
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
            className="rounded-xl py-3 text-sm font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
              boxShadow: '0 0 25px rgba(168,85,247,0.35)',
            }}
          >
            {loading ? 'Joining…' : 'Join room →'}
          </button>
        </div>
      </div>
    </main>
  )
}
