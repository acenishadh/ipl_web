'use client'

import { teamColor, teamLogo } from '@/components/teamMeta'
import { BAT_ACTIONS, BOWL_ACTIONS } from './actionsMeta'

function playerInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function BatterSelectPanel(props: {
  inn: any
  onSelectBatter: (batterIndex: number) => void
}) {
  const inn = props.inn
  const batters: any[] = inn.batters ?? []
  const btColor = teamColor(inn.battingTeamId)

  const nonStriker = batters[inn.nonStrikerIndex]
  const strikerIdx = inn.strikerIndex ?? -1
  const nonStrikerIdx = inn.nonStrikerIndex ?? -1

  const rows = batters.map((b: any, i: number) => {
    const atCrease = i === strikerIdx || i === nonStrikerIdx
    const selectable = !b.isOut && !atCrease
    const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '-'
    return { ...b, index: i, atCrease, selectable, sr }
  })

  return (
    <div
      className="relative overflow-hidden rounded-2xl border sm:rounded-3xl"
      style={{
        background: 'linear-gradient(165deg, rgba(10,10,24,0.98) 0%, rgba(18,18,40,0.96) 100%)',
        borderColor: `${btColor}55`,
        boxShadow: `0 0 40px ${btColor}18, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl opacity-40"
        style={{ background: btColor }}
      />
      <div className="relative p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl shadow-lg"
              style={{
                background: `linear-gradient(145deg, ${btColor}35, ${btColor}12)`,
                borderColor: `${btColor}50`,
                boxShadow: `0 8px 24px ${btColor}22`,
              }}
            >
              🏏
            </div>
            <div>
              <div
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ borderColor: `${btColor}40`, color: btColor, background: `${btColor}12` }}
              >
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: btColor }} />
                Crease call
              </div>
              <div className="font-display mt-1 text-base font-bold tracking-tight text-white sm:text-lg">
                Who walks out next?
              </div>
              <div className="mt-0.5 max-w-md text-xs leading-snug text-white/45">
                {inn.battingTeamId} · {inn.wickets} down
                {nonStriker && (
                  <span>
                    {' '}
                    · <span className="text-white/60">{nonStriker.name.split(' ').pop()}</span> waiting at the other end
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1fr_44px_44px_52px] gap-2 bg-white/[0.03] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/35 sm:grid-cols-[1fr_44px_44px_44px_44px_52px] sm:px-4">
            <div>Batter</div>
            <div className="text-center">R</div>
            <div className="text-center">B</div>
            <div className="text-right">SR</div>
            <div className="hidden text-center sm:block">4s</div>
            <div className="hidden text-center sm:block">6s</div>
          </div>
          {rows.map((b: any) => {
            const grey = b.isOut
            const disabled = !b.selectable
            return (
              <button
                key={b.index}
                type="button"
                disabled={disabled}
                onClick={() => props.onSelectBatter(b.index)}
                className="grid w-full grid-cols-[1fr_44px_44px_52px] gap-2 border-t border-white/5 px-3 py-3 text-left text-sm disabled:opacity-50 sm:grid-cols-[1fr_44px_44px_44px_44px_52px] sm:px-4"
                style={{
                  background: b.atCrease ? `${btColor}10` : grey ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.1)',
                }}
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">
                    {b.name}
                    {b.atCrease ? <span className="ml-2 text-[10px] font-bold" style={{ color: btColor }}>{b.index === strikerIdx ? '▶' : '◆'}</span> : null}
                  </div>
                  {b.isOut ? <div className="mt-0.5 text-[10px] text-white/25">out</div> : null}
                  {!b.isOut && !b.atCrease ? <div className="mt-0.5 text-[10px] text-white/25">tap to send in</div> : null}
                </div>
                <div className="text-center font-display text-base font-extrabold tabular-nums text-white">{b.runs}</div>
                <div className="text-center text-white/45">{b.balls}</div>
                <div className="text-right font-mono text-white/45">{b.sr}</div>
                <div className="hidden text-center text-white/45 sm:block">{b.fours}</div>
                <div className="hidden text-center text-white/45 sm:block">{b.sixes}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BowlerSelectPanel(props: {
  inn: any
  onSelectBowler: (name: string) => void
  maxOversPerBowler: number
}) {
  const inn = props.inn
  const pool: string[] = inn.bowlingPool ?? []
  const bowlers: any[] = inn.bowlers ?? []
  const prev = inn.prevBowlerName
  const bwColor = teamColor(inn.bowlingTeamId)

  function oversBowled(name: string) {
    const rec = bowlers.find((b: any) => b.name === name)
    return rec ? Math.floor(rec.balls / 6) : 0
  }

  function spellStats(name: string) {
    const rec = bowlers.find((b: any) => b.name === name)
    if (!rec) return null
    return { wk: rec.wickets, runs: rec.runs, balls: rec.balls }
  }

  const eligibleSet = new Set(pool.filter((n) => n !== prev && oversBowled(n) < props.maxOversPerBowler))

  return (
    <div
      className="relative overflow-hidden rounded-2xl border sm:rounded-3xl"
      style={{
        background: 'linear-gradient(165deg, rgba(10,12,28,0.98) 0%, rgba(16,20,38,0.96) 100%)',
        borderColor: `${bwColor}55`,
        boxShadow: `0 0 40px ${bwColor}18, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      <div
        className="pointer-events-none absolute -left-12 -top-20 h-44 w-44 rounded-full blur-3xl opacity-35"
        style={{ background: bwColor }}
      />
      <div className="relative p-4 sm:p-5">
        <div className="flex flex-wrap items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-2xl"
            style={{
              background: `linear-gradient(145deg, ${bwColor}40, ${bwColor}15)`,
              borderColor: `${bwColor}50`,
              boxShadow: `0 8px 24px ${bwColor}25`,
            }}
          >
            🎯
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ borderColor: `${bwColor}40`, color: bwColor, background: `${bwColor}12` }}
            >
              New over
            </div>
            <div className="font-display mt-1 text-base font-bold tracking-tight text-white sm:text-lg">
              Arm ball — who&apos;s bowling?
            </div>
            <p className="mt-0.5 text-xs leading-snug text-white/45">
              {inn.bowlingTeamId} · up to {props.maxOversPerBowler} overs each
              {prev && (
                <>
                  {' '}
                  · <span className="text-amber-200/80">{prev.split(' ').pop()}</span> just finished — can&apos;t repeat
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-[1fr_44px_52px] gap-2 bg-white/[0.03] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/35 sm:grid-cols-[1fr_52px_44px_44px_60px] sm:px-4">
            <div>Bowler</div>
            <div className="text-center">W</div>
            <div className="text-right">Ov</div>
            <div className="hidden text-center sm:block">Ov</div>
            <div className="hidden text-center sm:block">R</div>
            <div className="hidden text-right sm:block">Econ</div>
          </div>
          {pool.map((name: string) => {
            const st = spellStats(name) ?? { wk: 0, runs: 0, balls: 0 }
            const ovTxt = `${Math.floor(st.balls / 6)}.${st.balls % 6}`
            const econ = st.balls > 0 ? ((st.runs / st.balls) * 6).toFixed(2) : '-'
            const disabled = !eligibleSet.has(name)
            const why =
              name === prev ? 'cannot bowl back-to-back' : oversBowled(name) >= props.maxOversPerBowler ? 'max overs reached' : null
            return (
              <button
                key={name}
                type="button"
                disabled={disabled}
                onClick={() => props.onSelectBowler(name)}
                className="grid w-full grid-cols-[1fr_44px_52px] gap-2 border-t border-white/5 px-3 py-3 text-left text-sm disabled:opacity-50 sm:grid-cols-[1fr_52px_44px_44px_60px] sm:px-4"
                style={{ background: !disabled ? `${bwColor}10` : 'rgba(0,0,0,0.15)' }}
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">{name}</div>
                  {why ? <div className="mt-0.5 text-[10px] text-white/25">{why}</div> : <div className="mt-0.5 text-[10px] text-white/25">tap to bowl</div>}
                </div>
                <div className="text-center font-display text-base font-extrabold tabular-nums text-white">{st.wk}</div>
                <div className="text-right font-mono text-white/50 sm:hidden">{ovTxt}</div>
                <div className="hidden text-center text-white/50 sm:block">{ovTxt}</div>
                <div className="hidden text-center text-white/50 sm:block">{st.runs}</div>
                <div className="hidden text-right font-mono text-white/50 sm:block">{econ}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const BAT_COLORS = ['#64748b', '#22c55e', '#3b82f6', '#f59e0b', '#10b981', '#a855f7', '#00d4ff']
const BOWL_COLORS = ['#64748b', '#6366f1', '#ec4899', '#ef4444', '#06b6d4', '#f97316', '#8b5cf6']

function AiTurnPlaceholder(props: { label: string; teamId: string | null }) {
  const tid = props.teamId ?? '—'
  const c = teamColor(tid)
  return (
    <div
      className="rounded-2xl border p-2.5 sm:p-3"
      style={{
        borderColor: 'rgba(255,255,255,0.06)',
        background: 'rgba(0,0,0,0.18)',
      }}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-base">🤖</span>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/35">{props.label} (AI)</div>
          <div className="text-[9px] text-white/25">
            {tid} · simmed picks
          </div>
        </div>
      </div>
      <p
        className="rounded-xl border border-dashed px-3 py-7 text-center text-xs leading-relaxed text-white/35"
        style={{ borderColor: `${c}28` }}
      >
        This side is controlled by the AI. Your shot/ball inputs show only when you&apos;re batting or bowling.
      </p>
    </div>
  )
}

const COMMENTARY_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  WICKET:   { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   text: '#fca5a5', icon: '💥' },
  BOUNDARY: { bg: 'rgba(0,212,255,0.08)',  border: 'rgba(0,212,255,0.25)',  text: '#67e8f9', icon: '🚀' },
  RESULT:   { bg: 'rgba(255,214,10,0.1)',  border: 'rgba(255,214,10,0.3)',  text: '#fbbf24', icon: '🏆' },
  INFO:     { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.6)', icon: '📌' },
  BALL:     { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.6)', icon: '🔵' },
}

export function CricketMatchView(props: {
  match: any
  league: any
  myTeamId: string | null
  /** Franchises controlled by AI — hide opponent pick UI in PvE. */
  botTeamIds?: string[]
  onPick: (v: number) => void
  onSelectBowler: (name: string) => void
  onSelectBatter: (batterIndex: number) => void
  oversPerMatch: number
  /** Server bumps this when a new ball / over begins — clears stale pick UI. */
  pickSeq?: number
  commentary?: { ts: number; text: string; kind: string }[]
}) {
  const match = props.match
  /** Active innings is always the last entry (1st or 2nd). */
  const inn = match?.innings?.length ? match.innings[match.innings.length - 1] : null
  const pending = match?.pendingBall ?? null
  const commentary = props.commentary ?? []
  const maxOversPerBowler = Math.ceil(props.oversPerMatch / 5)

  const battingTeamId = pending?.battingTeamId ?? inn?.battingTeamId ?? null
  const bowlingTeamId = pending?.bowlingTeamId ?? inn?.bowlingTeamId ?? null

  const isBatting = !!(props.myTeamId && props.myTeamId === battingTeamId)
  const isBowling = !!(props.myTeamId && props.myTeamId === bowlingTeamId)
  const myPick = isBatting ? pending?.battingPick : isBowling ? pending?.bowlingPick : null

  const oversStr = inn ? `${Math.floor(inn.balls / 6)}.${inn.balls % 6}` : '0.0'
  const scoreStr = inn ? `${inn.runs}/${inn.wickets} (${oversStr})` : '0/0'

  const strikerRow = inn?.batters?.[inn.strikerIndex]
  const strikerName = strikerRow && !strikerRow.isOut ? strikerRow.name : null
  const nonStrikerName = inn?.batters?.[inn.nonStrikerIndex]?.name ?? null
  const bowlerName = inn?.currentBowlerName ?? null

  const bColor = teamColor(battingTeamId)
  const oColor = teamColor(bowlingTeamId)

  const botTeamIds: string[] = props.botTeamIds ?? []
  const humanBattingSide = !!(inn && !botTeamIds.includes(inn.battingTeamId))
  const humanBowlingSide = !!(inn && !botTeamIds.includes(inn.bowlingTeamId))

  /** Next batsman must be chosen before the next over’s bowler when both flags are set (last-ball wicket). */
  const batterChoiceBlockingOver = !!(inn?.awaitingBatterSelect)

  const iPickBatter =
    !!inn?.awaitingBatterSelect &&
    props.myTeamId === inn?.battingTeamId &&
    humanBattingSide

  const iPickBowler =
    !!inn?.awaitingBowlerSelect &&
    !batterChoiceBlockingOver &&
    props.myTeamId === inn?.bowlingTeamId &&
    humanBowlingSide

  const canPick =
    (isBatting || isBowling) &&
    !!pending &&
    !iPickBowler &&
    !iPickBatter &&
    (isBatting ? humanBattingSide : true) &&
    (isBowling ? humanBowlingSide : true)

  const showSelectionOverlay = iPickBatter || iPickBowler

  return (
    <div className="relative space-y-3">
      {/* ── Modals: crease + new over (above everything so last-ball wicket isn’t buried) ── */}
      {showSelectionOverlay && inn && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-[2px] sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Match selection"
        >
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto sm:max-h-[90vh]">
            {iPickBatter ? (
              <BatterSelectPanel inn={inn} onSelectBatter={props.onSelectBatter} />
            ) : iPickBowler ? (
              <BowlerSelectPanel
                inn={inn}
                onSelectBowler={props.onSelectBowler}
                maxOversPerBowler={maxOversPerBowler}
              />
            ) : null}
          </div>
        </div>
      )}

      {/* ── ACTION PANEL ── */}
      <div
        key={`ball-${props.pickSeq ?? 0}-${pending?.battingPick ?? 'x'}-${pending?.bowlingPick ?? 'x'}`}
        className="relative rounded-2xl border p-3 sm:rounded-3xl sm:p-5"
        style={{
          background: 'linear-gradient(180deg, rgba(14,14,32,0.98) 0%, rgba(10,10,24,0.96) 100%)',
          borderColor: canPick ? `${isBatting ? bColor : oColor}40` : 'rgba(255,255,255,0.07)',
          boxShadow: canPick
            ? `0 0 36px ${isBatting ? bColor : oColor}14, inset 0 1px 0 rgba(255,255,255,0.05)`
            : 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Status row */}
        <div
          className="flex flex-col gap-1.5 rounded-xl border px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:rounded-2xl sm:px-4"
          style={{
            background: canPick ? `${isBatting ? bColor : oColor}10` : 'rgba(255,255,255,0.03)',
            borderColor: canPick ? `${isBatting ? bColor : oColor}30` : 'rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{isBatting ? '🏏' : isBowling ? '⚾' : '👀'}</span>
            <span
              className="font-display text-sm font-bold sm:text-base"
              style={{ color: canPick ? (isBatting ? bColor : oColor) : 'rgba(255,255,255,0.4)' }}
            >
              {canPick ? (isBatting ? 'You are Batting' : 'You are Bowling') : 'Spectating'}
            </span>
            {/* Score badge inline on mobile */}
            <span
              className="ml-auto rounded-lg border px-2 py-0.5 font-mono text-xs font-bold sm:hidden"
              style={{ background: `${bColor}15`, borderColor: `${bColor}35`, color: bColor }}
            >
              {scoreStr}
            </span>
          </div>
          {pending && (
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-2 w-2 shrink-0 animate-pulse rounded-full"
                  style={{ background: myPick !== null && myPick !== undefined ? '#00ff9d' : '#ffd60a' }}
                />
                <span className="text-xs text-white/40">
                  {myPick !== null && myPick !== undefined ? `Locked in: ${myPick}` : 'Choose your move'}
                </span>
              </div>
              {(strikerName || nonStrikerName || bowlerName) && (
                <div className="flex items-center gap-3 text-[10px] text-white/25">
                  {strikerName && <span>🏏 {strikerName}*</span>}
                  {nonStrikerName && nonStrikerName !== strikerName && <span>{nonStrikerName}</span>}
                  {bowlerName && <span>⚾ {bowlerName}</span>}
                </div>
              )}
            </div>
          )}
          {inn?.awaitingBatterSelect && humanBattingSide && !iPickBatter && (
            <div className="text-xs text-white/40">⏳ Waiting for batting team to send next batter…</div>
          )}
          {inn?.awaitingBowlerSelect && humanBowlingSide && !iPickBowler && inn?.awaitingBatterSelect && (
            <div className="text-xs text-amber-200/70">⏳ Next batsman first — then you&apos;ll choose the bowler for the new over.</div>
          )}
          {inn?.awaitingBowlerSelect && humanBowlingSide && !iPickBowler && !inn?.awaitingBatterSelect && (
            <div className="text-xs text-white/40">⏳ Waiting for bowler selection…</div>
          )}
          {inn?.freeHitNext && !iPickBowler && !iPickBatter && (
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#e9d5ff' }}>
              Free hit — same bat/bowl pick can&apos;t dismiss you (incl. after a no ball)
            </div>
          )}
        </div>

        {/* Pick grids — PvE: only show the human-controlled side’s actions */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {humanBattingSide ? (
            <PickGrid
              label="Shot card"
              hint="Pick your stroke — 0–6"
              icon="🏏"
              actions={BAT_ACTIONS}
              colors={BAT_COLORS}
              active={isBatting}
              myPick={isBatting ? myPick : undefined}
              activeColor={bColor}
              onPick={props.onPick}
            />
          ) : (
            <AiTurnPlaceholder label="Batting" teamId={battingTeamId} />
          )}
          {humanBowlingSide ? (
            <PickGrid
              label="Delivery"
              hint="Plan your ball — 0–6"
              icon="⚾"
              actions={BOWL_ACTIONS}
              colors={BOWL_COLORS}
              active={isBowling}
              myPick={isBowling ? myPick : undefined}
              activeColor={oColor}
              onPick={props.onPick}
            />
          ) : (
            <AiTurnPlaceholder label="Bowling" teamId={bowlingTeamId} />
          )}
        </div>
      </div>

      {/* ── COMMENTARY ── */}
      <div
        className="rounded-2xl border p-3 sm:rounded-3xl sm:p-5"
        style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-sm font-bold text-white">📢 Commentary</h3>
          <div className="flex items-center gap-2">
            {match?.target ? (
              <span
                className="rounded-lg border px-2 py-0.5 text-xs font-bold"
                style={{ background: 'rgba(255,214,10,0.1)', borderColor: 'rgba(255,214,10,0.3)', color: '#ffd60a' }}
              >
                🎯 Target {match.target}
              </span>
            ) : null}
            <span
              className="hidden rounded-lg border px-2 py-0.5 font-mono text-xs font-bold sm:inline"
              style={{ background: `${bColor}15`, borderColor: `${bColor}35`, color: bColor }}
            >
              {battingTeamId && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={teamLogo(battingTeamId) ?? ''} alt="" className="mr-1 inline h-3 w-3 object-contain" />
              )}
              {scoreStr}
            </span>
          </div>
        </div>

        <div className="mt-3 max-h-60 space-y-1 overflow-y-auto pr-1 sm:max-h-80">
          {commentary.length === 0 && (
            <div className="py-6 text-center text-sm text-white/25">No balls bowled yet.</div>
          )}
          {[...commentary].slice(-80).reverse().map((c) => {
            const s = COMMENTARY_STYLES[c.kind] ?? COMMENTARY_STYLES.BALL
            return (
              <div
                key={c.ts + c.text}
                className="flex items-center justify-between gap-2 rounded-xl border px-3 py-1.5"
                style={{ background: s.bg, borderColor: s.border }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 text-sm">{s.icon}</span>
                  <span className="truncate text-xs font-semibold sm:text-sm" style={{ color: s.text }}>{c.text}</span>
                </div>
                <span className="shrink-0 text-[10px] text-white/25">
                  {new Date(c.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PickGrid({
  label, hint, icon, actions, colors, active, myPick, activeColor, onPick
}: {
  label: string
  hint: string
  icon: string
  actions: { value: number; label: string }[]
  colors: string[]
  active: boolean
  myPick?: number | null
  activeColor: string
  onPick: (v: number) => void
}) {
  return (
    <div
      className="rounded-2xl border p-2.5 sm:p-3"
      style={{
        borderColor: active ? `${activeColor}28` : 'rgba(255,255,255,0.06)',
        background: active ? `linear-gradient(160deg, ${activeColor}10 0%, rgba(0,0,0,0.12) 100%)` : 'rgba(0,0,0,0.15)',
        boxShadow: active ? `inset 0 1px 0 ${activeColor}22` : undefined,
      }}
    >
      <div className="mb-2 flex flex-wrap items-end justify-between gap-1">
        <div className="flex items-center gap-2">
          <span className="text-base drop-shadow sm:text-lg">{icon}</span>
          <div>
            <div
              className="text-[10px] font-bold uppercase tracking-widest sm:text-xs"
              style={{ color: active ? activeColor : 'rgba(255,255,255,0.3)' }}
            >
              {label}
            </div>
            <div className="text-[9px] text-white/30">{hint}</div>
          </div>
        </div>
        {active && myPick !== null && myPick !== undefined && (
          <span
            className="rounded-md px-2 py-0.5 text-[9px] font-bold sm:text-[10px]"
            style={{
              background: 'rgba(0,255,150,0.14)',
              color: '#00ff9d',
              boxShadow: '0 0 12px rgba(0,255,150,0.2)',
            }}
          >
            Locked {myPick}
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
        {actions.map((a) => {
          const isSelected = active && myPick === a.value
          const btnColor = colors[a.value] ?? '#fff'
          return (
            <button
              key={a.value}
              type="button"
              disabled={!active}
              onClick={() => onPick(a.value)}
              className="group relative flex flex-col items-center gap-0.5 rounded-xl border py-2 text-center transition-all disabled:cursor-not-allowed active:scale-95"
              style={
                !active
                  ? { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', opacity: 0.4 }
                  : isSelected
                  ? {
                      background: `${btnColor}28`,
                      borderColor: `${btnColor}80`,
                      boxShadow: `0 0 16px ${btnColor}35, inset 0 0 20px ${btnColor}15`,
                      transform: 'scale(1.06)',
                    }
                  : {
                      background: `${btnColor}0c`,
                      borderColor: `${btnColor}30`,
                    }
              }
            >
              <div
                className="font-display text-lg font-extrabold tabular-nums leading-none sm:text-2xl"
                style={{ color: active ? btnColor : 'rgba(255,255,255,0.3)' }}
              >
                {a.value}
              </div>
              <div
                className="max-w-[100%] truncate px-0.5 text-[6px] font-semibold uppercase leading-tight sm:text-[8px]"
                style={{ color: active ? `${btnColor}aa` : 'rgba(255,255,255,0.2)' }}
              >
                {a.label}
              </div>
              {active && !isSelected && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition group-hover:opacity-100"
                  style={{ boxShadow: `inset 0 0 0 1px ${btnColor}40` }}
                />
              )}
              {isSelected && (
                <div className="absolute right-1 top-1 h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: btnColor }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
