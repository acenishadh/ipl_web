import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Decorative background orbs — large + heavily blurred so no hard edges */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-60 -top-60 h-[600px] w-[600px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        <div className="absolute -right-60 top-1/4 h-[550px] w-[550px] rounded-full bg-purple-500/[0.07] blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full bg-pink-500/[0.05] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-16 px-4 py-14 sm:px-6">
        {/* Hero */}
        <header className="flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-cyan-400 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
            IPL Games · Real-time rooms
          </div>
          <h1
            className="font-display text-balance text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl"
            style={{ textShadow: '0 0 40px rgba(0,212,255,0.2)' }}
          >
            Play IPL<br />
            <span style={{ color: '#00d4ff', textShadow: '0 0 30px rgba(0,212,255,0.6)' }}>
              with friends.
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
            Run a live IPL-style auction or play a blazing 3-over cricket match league.
            No sign-up. Just pick a franchise and go.
          </p>
        </header>

        {/* Mode cards */}
        <section className="grid gap-5 sm:grid-cols-3">
          {/* Auction */}
          <div className="neon-card-cyan flex flex-col gap-5 overflow-hidden rounded-3xl border p-6">
            <div className="text-4xl">🏏</div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Auction</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                Host a timed auction. 120Cr purse. Build your dream squad.
              </p>
            </div>
            <Link
              href="/create"
              className="mt-auto inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                boxShadow: '0 0 20px rgba(0,212,255,0.35)',
              }}
            >
              Create auction room →
            </Link>
          </div>

          {/* Join auction */}
          <div className="neon-card-purple flex flex-col gap-5 overflow-hidden rounded-3xl border p-6">
            <div className="text-4xl">🎟️</div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Join Auction</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                Enter a room code, pick your franchise, and start bidding.
              </p>
            </div>
            <Link
              href="/join"
              className="mt-auto inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor: 'rgba(168,85,247,0.5)',
                color: '#c084fc',
                background: 'rgba(168,85,247,0.1)',
              }}
            >
              Join with code →
            </Link>
          </div>

          {/* Cricket */}
          <div className="neon-card-pink flex flex-col gap-5 overflow-hidden rounded-3xl border p-6">
            <div className="text-4xl">🏟️</div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">Cricket Mode</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                3-over innings league with franchises, toss, and points table.
              </p>
            </div>
            <Link
              href="/cricket"
              className="mt-auto inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={{
                borderColor: 'rgba(255,0,110,0.5)',
                color: '#f472b6',
                background: 'rgba(255,0,110,0.1)',
              }}
            >
              Open cricket mode →
            </Link>
          </div>
        </section>

        {/* Feature pills */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div
            className="flex items-start gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,214,10,0.04)',
              borderColor: 'rgba(255,214,10,0.18)',
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ background: 'rgba(255,214,10,0.12)' }}
            >
              ⚡
            </div>
            <div>
              <div className="font-display text-sm font-bold" style={{ color: '#ffd60a' }}>Real-time</div>
              <div className="mt-1 text-xs leading-relaxed text-white/50">Live bids and picks via WebSockets.</div>
            </div>
          </div>

          <div
            className="flex items-start gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5"
            style={{
              background: 'rgba(0,212,255,0.04)',
              borderColor: 'rgba(0,212,255,0.18)',
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ background: 'rgba(0,212,255,0.12)' }}
            >
              💰
            </div>
            <div>
              <div className="font-display text-sm font-bold" style={{ color: '#00d4ff' }}>120 Cr Purse</div>
              <div className="mt-1 text-xs leading-relaxed text-white/50">Full IPL auction purse per franchise.</div>
            </div>
          </div>

          <div
            className="flex items-start gap-4 rounded-2xl border p-5 transition-all hover:-translate-y-0.5"
            style={{
              background: 'rgba(0,255,150,0.04)',
              borderColor: 'rgba(0,255,150,0.18)',
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
              style={{ background: 'rgba(0,255,150,0.12)' }}
            >
              🏆
            </div>
            <div>
              <div className="font-display text-sm font-bold" style={{ color: '#00ff9d' }}>Points Table</div>
              <div className="mt-1 text-xs leading-relaxed text-white/50">3-over league with NRR and rankings.</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
