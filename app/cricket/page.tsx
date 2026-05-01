import Link from 'next/link'

export default function CricketHomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-60 -top-20 h-[550px] w-[550px] rounded-full bg-pink-500/[0.07] blur-[120px]" />
        <div className="absolute -right-60 bottom-0 h-[500px] w-[500px] rounded-full bg-orange-500/[0.06] blur-[120px]" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-14 px-4 py-14 sm:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/40 transition-colors hover:text-white/70">
          ← Home
        </Link>

        <header className="flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-pink-400 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" />
            IPL Cricket · 3-over rooms
          </div>
          <h1
            className="font-display text-balance text-5xl font-bold leading-[1.1] text-white md:text-7xl"
            style={{ textShadow: '0 0 40px rgba(255,0,110,0.2)' }}
          >
            Head-to-head<br />
            <span style={{ color: '#fb7185', textShadow: '0 0 30px rgba(255,0,110,0.5)' }}>
              Cricket.
            </span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
            Create a room, invite friends, pick franchises, toss up, and play simultaneous
            batter vs bowler 3-over innings.
          </p>
        </header>

        <section className="grid gap-5 sm:grid-cols-2">
          <div className="neon-card-pink flex flex-col gap-5 rounded-3xl border p-7">
            <div className="text-5xl">🏟️</div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Create a room</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Host the league, invite friends with a room code, start the tournament.
              </p>
            </div>
            <Link
              href="/cricket/create"
              className="mt-auto inline-flex items-center justify-center rounded-xl py-3 text-sm font-bold text-black transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
                boxShadow: '0 0 20px rgba(244,63,94,0.35)',
              }}
            >
              Create room →
            </Link>
          </div>

          <div className="neon-card-orange flex flex-col gap-5 rounded-3xl border p-7">
            <div className="text-5xl">🎟️</div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Join a room</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Enter a room code and pick your franchise to play.
              </p>
            </div>
            <Link
              href="/cricket/join"
              className="mt-auto inline-flex items-center justify-center rounded-xl border py-3 text-sm font-bold transition-all hover:scale-105"
              style={{
                borderColor: 'rgba(249,115,22,0.5)',
                color: '#fb923c',
                background: 'rgba(249,115,22,0.1)',
              }}
            >
              Join with code →
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: '🪙', text: 'Toss to decide batting order' },
            { icon: '⚔️', text: 'Simultaneous bat & bowl picks' },
            { icon: '📊', text: 'Live points table with NRR' },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm text-white/60">{text}</span>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
