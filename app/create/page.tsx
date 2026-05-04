'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSocket } from '@/lib/socket'
import Link from 'next/link'
import { FlowAmbient } from '@/components/FlowAmbient'
import { FormPageHero } from '@/components/FormPageHero'

export default function CreateRoomPage() {
  const router = useRouter()
  const socket = useMemo(() => createSocket(), [])
  const [displayName, setDisplayName] = useState('')
  const [mode, setMode] = useState<'mock' | 'mega'>('mock')
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <main className="page-shell relative min-h-screen overflow-hidden">
      <FlowAmbient variant="auction" />

      <div className="relative mx-auto max-w-md px-2 py-10 sm:px-4 sm:py-12">
        <Link href="/" className="link-back tap-target mb-2">
          ← Back to home
        </Link>

        <FormPageHero
          accent="cyan"
          kicker="Auction host"
          title="Open a new room"
          subtitle="You’ll get a shareable code instantly. Friends join from any device with the same WebSocket session magic."
          trust={['120 Cr purse', 'Live bids', 'Pick franchise next']}
        />

        <div
          className="game-panel page-enter flex flex-col gap-5 rounded-3xl border border-cyan-400/25 p-5 sm:p-6"
          style={{ animationDelay: '90ms' }}
        >
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-200/70">Your name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-play rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white placeholder:text-white/30 focus:outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.1)',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0,212,255,0.5)'
                e.target.style.boxShadow = '0 0 15px rgba(0,212,255,0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                e.target.style.boxShadow = 'none'
              }}
              placeholder="e.g. Rahul"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-200/70">Auction type</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'mock' | 'mega')}
              className="input-play rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white focus:outline-none"
            >
              <option value="mock">Mock Auction</option>
              <option value="mega">Mega Auction</option>
            </select>
          </label>

          <label
            className="tap-target flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
          >
            <div>
              <div className="text-sm font-semibold text-white/80">Public room</div>
              <div className="text-xs text-white/35">Visible in the live rooms list</div>
            </div>
            <div
              className="relative h-6 w-11 rounded-full transition-colors"
              style={{ background: isPublic ? 'rgba(0,212,255,0.7)' : 'rgba(255,255,255,0.1)' }}
            >
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div
                className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
                style={{ left: isPublic ? '22px' : '2px' }}
              />
            </div>
          </label>

          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading || !displayName.trim()}
            aria-busy={loading}
            onClick={() => {
              setError(null)
              setLoading(true)
              socket.emit('room:create', { displayName, mode, isPublic }, (res) => {
                setLoading(false)
                if (!res.ok) return setError(res.error.message)
                if (typeof window !== 'undefined') {
                  window.sessionStorage.setItem('ipl_displayName', displayName)
                  window.sessionStorage.setItem('ipl_lastRoomCode', res.code)
                  window.sessionStorage.setItem('ipl_lastRoomId', res.roomId)
                }
                router.push(`/room/${res.roomId}?code=${res.code}&pickTeam=1`)
              })
            }}
            className="tap-target relative min-h-[50px] overflow-hidden rounded-2xl py-3.5 text-sm font-bold text-slate-950 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0"
            style={{
              background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)',
              boxShadow: loading || !displayName.trim() ? 'none' : '0 0 28px rgba(34,211,238,0.45)',
            }}
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
                Creating…
              </span>
            ) : (
              'Create room →'
            )}
          </button>
        </div>

        <p className="site-footer-hint mt-8 text-center">Room persists while players are connected</p>
      </div>
    </main>
  )
}
