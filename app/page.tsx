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

        {/* ── HOW TO PLAY ── */}
        <section className="mx-auto mt-14 w-full max-w-5xl sm:mt-16">
          <div className="mb-8 text-center sm:mb-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
              How to Play
            </div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Two ways to play, endless fun.
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-white/45">
              Pick a mode and you&apos;re in — rooms last as long as your session.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* ── AUCTION MODE ── */}
            <div
              className="overflow-hidden rounded-3xl border p-5 sm:p-6"
              style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(34,211,238,0.18)' }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.25)' }}
                >
                  🔨
                </div>
                <div>
                  <div className="font-display text-base font-bold text-white sm:text-lg">Auction Mode</div>
                  <div className="text-[11px] text-cyan-300/70">2–10 players · ~40 min</div>
                </div>
              </div>

              <ol className="space-y-3.5">
                {[
                  { n: '1', icon: '🏠', title: 'Host creates a room', body: 'Click "Host auction", set overs, then share the 6-letter code with friends.' },
                  { n: '2', icon: '🎟️', title: 'Everyone joins & claims a franchise', body: 'Each player pastes the code, picks a team — remaining slots are AI-managed.' },
                  { n: '3', icon: '💰', title: 'Bid on players in real time', body: 'Each player goes under the hammer for 20 s. Tap BID to raise the price — highest bid wins them for your squad.' },
                  { n: '4', icon: '📊', title: 'Manage your ₹120 Cr purse', body: 'You must keep ₹1 Cr per remaining slot. Overseas limit: 8 per squad of 25.' },
                  { n: '5', icon: '🏆', title: 'Best squad wins!', body: 'The auction ends when all players are sold. Compare rosters and crown the best GM in the room.' },
                ].map((step) => (
                  <li key={step.n} className="flex items-start gap-3">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums"
                      style={{ background: 'rgba(34,211,238,0.15)', color: '#67e8f9', border: '1px solid rgba(34,211,238,0.25)' }}
                    >
                      {step.n}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                        <span>{step.icon}</span>
                        <span>{step.title}</span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/45">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div
                className="mt-5 rounded-2xl p-3.5"
                style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-300/60">Pro tip</div>
                <p className="mt-1 text-xs leading-relaxed text-white/50">
                  Don&apos;t blow your budget early — late rounds have hidden gems at base price!
                </p>
              </div>
            </div>

            {/* ── CRICKET MODE ── */}
            <div
              className="overflow-hidden rounded-3xl border p-5 sm:p-6"
              style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(244,114,182,0.18)' }}
            >
              <div className="mb-5 flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: 'rgba(244,114,182,0.12)', border: '1px solid rgba(244,114,182,0.25)' }}
                >
                  🏏
                </div>
                <div>
                  <div className="font-display text-base font-bold text-white sm:text-lg">Cricket Mode</div>
                  <div className="text-[11px] text-pink-300/70">PvP · PvBot · Tournament</div>
                </div>
              </div>

              <ol className="space-y-3.5">
                {[
                  { n: '1', icon: '🏟️', title: 'Create or join a cricket room', body: 'Choose Quick Match (PvP or vs Bot) or a full IPL-style Tournament with points table and playoffs.' },
                  { n: '2', icon: '🪙', title: 'Toss & pick your Playing XI', body: 'Coin flip decides who bats first. Each captain then picks 11 players and names a captain from their squad.' },
                  { n: '3', icon: '🔢', title: 'The secret-number mechanic', body: 'Every ball, batter and bowler secretly pick a number 0–6 at the same time. If they match → WICKET. If not → batter scores that many runs.' },
                  { n: '4', icon: '📋', title: 'Manage your innings', body: 'Pick who opens bowling each over. If a wicket falls, choose the next batter. All switches are yours to control.' },
                  { n: '5', icon: '🏆', title: 'Chase or defend to win', body: 'In Tournament mode, play through the group stage, semi-finals, and a grand final. Track NRR on the Points Table.' },
                ].map((step) => (
                  <li key={step.n} className="flex items-start gap-3">
                    <div
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums"
                      style={{ background: 'rgba(244,114,182,0.15)', color: '#f9a8d4', border: '1px solid rgba(244,114,182,0.25)' }}
                    >
                      {step.n}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                        <span>{step.icon}</span>
                        <span>{step.title}</span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/45">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Scoring cheat-sheet */}
              <div
                className="mt-5 rounded-2xl p-3.5"
                style={{ background: 'rgba(244,114,182,0.06)', border: '1px solid rgba(244,114,182,0.15)' }}
              >
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-pink-300/60">Scoring cheat-sheet</div>
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                  {[
                    { v: '0', label: 'Dot', color: '#94a3b8' },
                    { v: '1', label: 'Single', color: '#86efac' },
                    { v: '2', label: 'Two', color: '#86efac' },
                    { v: '3', label: 'Three', color: '#86efac' },
                    { v: '4', label: 'Four', color: '#67e8f9' },
                    { v: '6', label: 'Six', color: '#67e8f9' },
                    { v: 'W', label: 'Match!', color: '#fca5a5' },
                  ].map((s) => (
                    <div
                      key={s.v}
                      className="flex flex-col items-center justify-center gap-0.5 rounded-xl border py-2"
                      style={{ background: 'rgba(0,0,0,0.25)', borderColor: `${s.color}30` }}
                    >
                      <span className="font-display text-base font-extrabold tabular-nums" style={{ color: s.color }}>{s.v}</span>
                      <span className="text-[9px] font-semibold uppercase tracking-wide text-white/35">{s.label}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-white/35">
                  <span className="font-bold text-pink-200/60">Match =</span> batter & bowler pick the same number → wicket.
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-auto border-t border-white/[0.06] pt-10 pb-6 text-center sm:pt-12">
          <p className="site-footer-hint text-white/35">IPL Arcade · Built for watch parties &amp; league nights</p>
        </footer>
      </div>
    </main>
  )
}
