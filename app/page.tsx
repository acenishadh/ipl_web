import Link from 'next/link'
import { FlowAmbient } from '@/components/FlowAmbient'

export default function HomePage() {
  return (
    <main className="page-shell relative min-h-screen overflow-hidden">
      <FlowAmbient variant="home" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mb-10 flex flex-1 flex-col justify-center sm:mb-14 lg:mb-16">
          <header className="page-enter mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-500/12 to-violet-500/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200/95 shadow-[0_0_24px_rgba(34,211,238,0.12)] sm:text-xs">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              IPL Arcade · Live rooms
            </div>
            <h1
              className="font-display text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ textShadow: '0 0 48px rgba(34,211,238,0.12)' }}
            >
              Play IPL
              <br />
              <span
                className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent"
                style={{ textShadow: '0 0 40px rgba(34,211,238,0.2)' }}
              >
                with friends.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              Live auction drafts and franchise cricket in one place. Share a code, pick a team, bid and bat in sync — no
              sign-up, no install.
            </p>
          </header>

          <section className="mx-auto mt-12 grid w-full max-w-5xl gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-5 lg:mt-16">
            <div className="neon-card-cyan flex min-h-[220px] flex-col gap-4 rounded-3xl border p-5 sm:min-h-[240px] sm:p-6">
              <div className="text-4xl hero-float select-none" aria-hidden>
                🏏
              </div>
              <div className="flex flex-1 flex-col">
                <h2 className="font-display text-lg font-bold text-white sm:text-xl">Auction</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Host a timed Mega or Mock draft. 120 Cr purse — build a squad under pressure.
                </p>
              </div>
              <Link
                href="/create"
                className="tap-target mt-auto inline-flex min-h-[48px] items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold text-slate-950 transition-transform active:scale-95 sm:min-h-0"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                  boxShadow: '0 0 24px rgba(34,211,238,0.35), 0 4px 16px rgba(0,0,0,0.3)',
                }}
              >
                Host auction →
              </Link>
            </div>

            <div className="neon-card-purple flex min-h-[220px] flex-col gap-4 rounded-3xl border p-5 sm:min-h-[240px] sm:p-6">
              <div className="text-4xl hero-float-delay select-none" aria-hidden>
                🎟️
              </div>
              <div className="flex flex-1 flex-col">
                <h2 className="font-display text-lg font-bold text-white sm:text-xl">Join draft</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Paste the code from your host, claim a franchise, and bid live.
                </p>
              </div>
              <Link
                href="/join"
                className="tap-target mt-auto inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 px-5 py-3 text-sm font-bold transition-transform active:scale-95 sm:min-h-0"
                style={{
                  borderColor: 'rgba(192,132,252,0.5)',
                  color: '#e9d5ff',
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(109,40,217,0.1) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                Join with code →
              </Link>
            </div>

            <div className="neon-card-pink flex min-h-[220px] flex-col gap-4 rounded-3xl border p-5 sm:min-h-[240px] sm:p-6">
              <div className="text-4xl hero-float select-none" aria-hidden>
                🏟️
              </div>
              <div className="flex flex-1 flex-col">
                <h2 className="font-display text-lg font-bold text-white sm:text-xl">Cricket mode</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Friendly duels or a full IPL-style season — points tables, caps, and playoffs.
                </p>
              </div>
              <Link
                href="/cricket"
                className="tap-target mt-auto inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 px-5 py-3 text-sm font-bold transition-transform active:scale-95 sm:min-h-0"
                style={{
                  borderColor: 'rgba(244,114,182,0.5)',
                  color: '#fbcfe8',
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.18) 0%, rgba(190,24,93,0.1) 100%)',
                }}
              >
                Enter cricket hub →
              </Link>
            </div>
          </section>
        </div>

        <section className="mx-auto mt-4 grid w-full max-w-5xl gap-3 border-t border-white/[0.06] pt-10 sm:grid-cols-3 sm:gap-4 sm:pt-12">
          <div className="flex items-start gap-4 rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/8 to-orange-500/5 p-5 transition-transform sm:hover:-translate-y-0.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <div className="font-display text-sm font-bold text-amber-200">Low latency</div>
              <div className="mt-1 text-xs leading-relaxed text-white/50">WebSockets keep bids and ball picks in sync.</div>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/8 to-sky-500/5 p-5 transition-transform sm:hover:-translate-y-0.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-xl shadow-inner">
              💰
            </div>
            <div>
              <div className="font-display text-sm font-bold text-cyan-200">IPL purse rules</div>
              <div className="mt-1 text-xs leading-relaxed text-white/50">Auction purses and squad limits that feel like the real thing.</div>
            </div>
          </div>

          <div className="flex items-start gap-4 rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/8 to-teal-500/5 p-5 transition-transform sm:hover:-translate-y-0.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-xl shadow-inner">
              🏆
            </div>
            <div>
              <div className="font-display text-sm font-bold text-emerald-200">Bragging rights</div>
              <div className="mt-1 text-xs leading-relaxed text-white/50">Leaderboards and finals screens worth a screenshot.</div>
            </div>
          </div>
        </section>

        <footer className="mt-auto border-t border-white/[0.06] pt-10 pb-6 text-center sm:pt-12">
          <p className="site-footer-hint text-white/35">IPL Arcade · Built for watch parties & league nights</p>
        </footer>
      </div>
    </main>
  )
}
