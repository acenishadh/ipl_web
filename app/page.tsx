import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="page-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-60 -top-60 h-[600px] w-[600px] rounded-full bg-cyan-400/12 blur-[120px]" />
        <div className="absolute -right-60 top-1/4 h-[550px] w-[550px] rounded-full bg-violet-500/12 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full bg-fuchsia-500/9 blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-[320px] w-[320px] rounded-full bg-amber-400/8 blur-[100px]" />
        <div className="absolute left-1/3 bottom-0 h-[280px] w-[280px] rounded-full bg-emerald-400/7 blur-[90px]" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-12 px-1 py-10 sm:gap-16 sm:px-2 sm:py-14">
        <header className="flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/35 bg-gradient-to-r from-cyan-500/15 to-violet-500/10 px-4 py-2 text-xs font-bold tracking-widest text-cyan-200 uppercase shadow-[0_0_20px_rgba(34,211,238,0.15)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            IPL Games · Real-time rooms
          </div>
          <h1
            className="font-display text-balance text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-6xl md:text-7xl"
            style={{ textShadow: '0 0 48px rgba(34,211,238,0.15)' }}
          >
            Play IPL
            <br />
            <span
              className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-300 bg-clip-text text-transparent"
              style={{ textShadow: '0 0 40px rgba(34,211,238,0.25)' }}
            >
              with friends.
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Run a live IPL-style auction or play a blazing 3-over cricket match league.
            No sign-up. Just pick a franchise and go.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          <div
            className="neon-card-cyan flex flex-col gap-5 overflow-hidden rounded-3xl border p-5 sm:p-6"
            style={{ animation: 'slide-up 0.45s ease-out both' }}
          >
            <div className="text-4xl hero-float select-none" aria-hidden>
              🏏
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Auction</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                Host a timed auction. 120Cr purse. Build your dream squad.
              </p>
            </div>
            <Link
              href="/create"
              className="tap-target mt-auto inline-flex min-h-[48px] items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold text-slate-950 transition-transform active:scale-95 sm:min-h-0"
              style={{
                background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
                boxShadow: '0 0 24px rgba(34,211,238,0.4), 0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              Create auction room →
            </Link>
          </div>

          <div
            className="neon-card-purple flex flex-col gap-5 overflow-hidden rounded-3xl border p-5 sm:p-6"
            style={{ animation: 'slide-up 0.5s ease-out 0.05s both' }}
          >
            <div className="text-4xl hero-float-delay select-none" aria-hidden>
              🎟️
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Join Auction</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                Enter a room code, pick your franchise, and start bidding.
              </p>
            </div>
            <Link
              href="/join"
              className="tap-target mt-auto inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 px-5 py-3 text-sm font-bold transition-transform active:scale-95 sm:min-h-0"
              style={{
                borderColor: 'rgba(192,132,252,0.55)',
                color: '#e9d5ff',
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(109,40,217,0.12) 100%)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              Join with code →
            </Link>
          </div>

          <div
            className="neon-card-pink flex flex-col gap-5 overflow-hidden rounded-3xl border p-5 sm:p-6"
            style={{ animation: 'slide-up 0.55s ease-out 0.1s both' }}
          >
            <div className="text-4xl hero-float select-none" aria-hidden>
              🏟️
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Cricket Mode</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                3-over innings league with franchises, toss, and points table.
              </p>
            </div>
            <Link
              href="/cricket"
              className="tap-target mt-auto inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 px-5 py-3 text-sm font-bold transition-transform active:scale-95 sm:min-h-0"
              style={{
                borderColor: 'rgba(244,114,182,0.55)',
                color: '#fbcfe8',
                background: 'linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(190,24,93,0.12) 100%)',
              }}
            >
              Open cricket mode →
            </Link>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div
            className="flex items-start gap-4 rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/8 to-orange-500/5 p-5 transition-transform sm:hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-xl shadow-inner">
              ⚡
            </div>
            <div>
              <div className="font-display text-sm font-bold text-amber-200">Real-time</div>
              <div className="mt-1 text-xs leading-relaxed text-white/55">Live bids and picks via WebSockets.</div>
            </div>
          </div>

          <div
            className="flex items-start gap-4 rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/8 to-sky-500/5 p-5 transition-transform sm:hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/15 text-xl shadow-inner">
              💰
            </div>
            <div>
              <div className="font-display text-sm font-bold text-cyan-200">120 Cr Purse</div>
              <div className="mt-1 text-xs leading-relaxed text-white/55">Full IPL auction purse per franchise.</div>
            </div>
          </div>

          <div
            className="flex items-start gap-4 rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/8 to-teal-500/5 p-5 transition-transform sm:hover:-translate-y-0.5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15 text-xl shadow-inner">
              🏆
            </div>
            <div>
              <div className="font-display text-sm font-bold text-emerald-200">Points Table</div>
              <div className="mt-1 text-xs leading-relaxed text-white/55">3-over league with NRR and rankings.</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
