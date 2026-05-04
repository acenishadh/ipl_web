import Link from 'next/link'
import { FlowAmbient } from '@/components/FlowAmbient'

export default function CricketHomePage() {
  return (
    <main className="page-shell relative min-h-screen overflow-hidden">
      <FlowAmbient variant="cricket" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-12 px-1 py-10 sm:gap-14 sm:px-2 sm:py-14">
        <Link href="/" className="link-back tap-target self-start">
          ← Home
        </Link>

        <header className="page-enter flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-rose-400/35 bg-gradient-to-r from-rose-500/12 to-orange-500/10 px-4 py-2 text-xs font-bold tracking-widest text-rose-200 uppercase shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
            Cricket simulator · Rooms
          </div>
          <h1
            className="font-display text-balance text-4xl font-bold leading-[1.1] text-white sm:text-6xl md:text-7xl"
            style={{ textShadow: '0 0 40px rgba(244,63,94,0.2)' }}
          >
            Stadium energy,
            <br />
            <span className="bg-gradient-to-r from-rose-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">
              your lounge.
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Create a room, share the code, pick IPL franchises, then call the toss and battle ball-for-ball with
            mirrored picks — quick duels or a full league with playoffs.
          </p>
        </header>

        <section className="stagger-children grid gap-4 sm:grid-cols-2 sm:gap-5">
          <div className="neon-card-pink flex flex-col gap-5 rounded-3xl border p-6 sm:p-7">
            <div className="text-5xl hero-float select-none" aria-hidden>
              🏟️
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Host a room</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                You control start/pause and format — tournament or one-off. Bots fill empty franchises.
              </p>
            </div>
            <Link
              href="/cricket/create"
              className="tap-target mt-auto inline-flex min-h-[48px] items-center justify-center rounded-2xl py-3.5 text-sm font-bold text-white transition-transform active:scale-95 sm:min-h-0"
              style={{
                background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
                boxShadow: '0 0 24px rgba(244,63,94,0.45)',
              }}
            >
              Create room →
            </Link>
          </div>

          <div className="neon-card-orange flex flex-col gap-5 rounded-3xl border p-6 sm:p-7">
            <div className="text-5xl hero-float-delay select-none" aria-hidden>
              🎟️
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Join friends</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Same code + display name resumes your franchise if you reconnect mid-season.
              </p>
            </div>
            <Link
              href="/cricket/join"
              className="tap-target mt-auto inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 py-3.5 text-sm font-bold transition-transform active:scale-95 sm:min-h-0"
              style={{
                borderColor: 'rgba(251,146,60,0.55)',
                color: '#fed7aa',
                background: 'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(194,65,12,0.1) 100%)',
              }}
            >
              Join with code →
            </Link>
          </div>
        </section>

        <section className="stagger-children grid gap-3 sm:grid-cols-3">
          {[
            { icon: '🪙', title: 'Fair toss', text: 'Winner chooses bat or bowl — pressure from ball one.' },
            { icon: '⚔️', title: 'Mirror picks', text: 'Both sides lock 0–6 each delivery — pure mind games.' },
            { icon: '📊', title: 'Standings & caps', text: 'Points, NRR, Orange & Purple caps across the season.' },
          ].map(({ icon, title, text }) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-5"
            >
              <span className="text-2xl sm:text-3xl">{icon}</span>
              <div className="font-display text-xs font-bold uppercase tracking-wide text-orange-200/90">{title}</div>
              <span className="text-sm leading-snug text-white/58">{text}</span>
            </div>
          ))}
        </section>

        <footer className="border-t border-white/[0.06] pt-8 text-center">
          <p className="site-footer-hint">Tip · Pin the room code in chat so guests can rejoin anytime</p>
        </footer>
      </div>
    </main>
  )
}
