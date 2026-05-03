import Link from 'next/link'

export default function CricketHomePage() {
  return (
    <main className="page-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-60 -top-20 h-[550px] w-[550px] rounded-full bg-rose-400/10 blur-[120px]" />
        <div className="absolute -right-60 bottom-0 h-[500px] w-[500px] rounded-full bg-orange-400/9 blur-[120px]" />
        <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-amber-400/6 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-12 px-1 py-10 sm:gap-14 sm:px-2 sm:py-14">
        <Link href="/" className="link-back tap-target self-start">
          ← Home
        </Link>

        <header className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-rose-400/35 bg-gradient-to-r from-rose-500/12 to-orange-500/10 px-4 py-2 text-xs font-bold tracking-widest text-rose-200 uppercase shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
            IPL Cricket · 3-over rooms
          </div>
          <h1
            className="font-display text-balance text-4xl font-bold leading-[1.1] text-white sm:text-6xl md:text-7xl"
            style={{ textShadow: '0 0 40px rgba(244,63,94,0.2)' }}
          >
            Head-to-head
            <br />
            <span className="bg-gradient-to-r from-rose-300 via-orange-300 to-amber-200 bg-clip-text text-transparent">
              Cricket.
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Create a room, invite friends, pick franchises, toss up, and play simultaneous
            batter vs bowler 3-over innings.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          <div className="neon-card-pink flex flex-col gap-5 rounded-3xl border p-6 sm:p-7">
            <div className="text-5xl hero-float select-none" aria-hidden>
              🏟️
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Create a room</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Host the league, invite friends with a room code, start the tournament.
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
              <h2 className="font-display text-2xl font-bold text-white">Join a room</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Enter a room code and pick your franchise to play.
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

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: '🪙', title: 'Fair toss', text: 'Toss for batting order' },
            { icon: '⚔️', title: 'Dual picks', text: 'Bat & bowl at the same time' },
            { icon: '📊', title: 'Live table', text: 'Points & NRR update live' },
          ].map(({ icon, title, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 shadow-panel sm:flex-col sm:items-start sm:gap-2 sm:py-4"
            >
              <span className="text-2xl sm:text-3xl">{icon}</span>
              <div>
                <div className="font-display text-xs font-bold text-orange-200/90">{title}</div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
