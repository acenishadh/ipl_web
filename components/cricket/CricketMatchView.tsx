'use client'

import { teamColor, teamLogo } from '@/components/teamMeta'
import { BAT_ACTIONS, BOWL_ACTIONS } from './actionsMeta'

function BatterSelectPanel(props: {
  inn: any
  onSelectBatter: (batterIndex: number) => void
}) {
  const inn = props.inn
  const batters: any[] = inn.batters ?? []
  const btColor = teamColor(inn.battingTeamId)

  // Not out and not at non-striker (new striker replaces dismissed index; isOut clears old row)
  const available = batters
    .map((b: any, i: number) => ({ ...b, index: i }))
    .filter((b) => !b.isOut && b.index !== inn.nonStrikerIndex)

  const nonStriker = batters[inn.nonStrikerIndex]

  return (
    <div
      className="rounded-2xl border p-4 sm:rounded-3xl sm:p-5"
      style={{
        background: 'rgba(10,10,24,0.97)',
        borderColor: `${btColor}40`,
        boxShadow: `0 0 30px ${btColor}10`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl border"
          style={{ background: `${btColor}15`, borderColor: `${btColor}35` }}
        >
          <span className="text-lg">🏏</span>
        </div>
        <div>
          <div className="font-display text-sm font-bold text-white">Send Next Batsman</div>
          <div className="text-xs text-white/40">
            {inn.battingTeamId} · {inn.wickets} wicket{inn.wickets !== 1 ? 's' : ''} down
            {nonStriker && <span> · {nonStriker.name} at non-striker end</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {available.map((b) => (
          <button
            key={b.index}
            onClick={() => props.onSelectBatter(b.index)}
            className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: `${btColor}0a`, borderColor: `${btColor}30` }}
          >
            <span className="font-semibold text-white">{b.name}</span>
            <span className="text-[10px] text-white/35">
              {b.balls === 0 ? 'YTB' : `${b.runs} (${b.balls}b)`}
            </span>
          </button>
        ))}
        {available.length === 0 && (
          <p className="col-span-2 text-xs text-white/30">No batsmen available — innings ending…</p>
        )}
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

  function overs(name: string) {
    const rec = bowlers.find((b: any) => b.name === name)
    return rec ? Math.floor(rec.balls / 6) : 0
  }

  const eligible = pool.filter((n) => n !== prev && overs(n) < props.maxOversPerBowler)
  const maxedOut = pool.filter((n) => n !== prev && overs(n) >= props.maxOversPerBowler)

  return (
    <div
      className="rounded-2xl border p-4 sm:rounded-3xl sm:p-5"
      style={{
        background: 'rgba(10,10,24,0.97)',
        borderColor: `${bwColor}40`,
        boxShadow: `0 0 30px ${bwColor}10`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl border"
          style={{ background: `${bwColor}15`, borderColor: `${bwColor}35` }}
        >
          <span className="text-lg">⚾</span>
        </div>
        <div>
          <div className="font-display text-sm font-bold text-white">Select Next Bowler</div>
          <div className="text-xs text-white/40">
            {inn.bowlingTeamId} · max {props.maxOversPerBowler} overs per bowler
            {prev && <span> · {prev} cannot bowl back-to-back</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {eligible.map((name: string) => {
          const ov = overs(name)
          return (
            <button
              key={name}
              onClick={() => props.onSelectBowler(name)}
              className="flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `${bwColor}0a`, borderColor: `${bwColor}30` }}
            >
              <span className="font-semibold text-white">{name}</span>
              <span className="text-[10px] text-white/40">
                {ov}/{props.maxOversPerBowler} ov
              </span>
            </button>
          )
        })}
        {maxedOut.map((name: string) => (
          <div
            key={name}
            className="flex items-center justify-between rounded-xl border px-3 py-2.5 opacity-35"
            style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
          >
            <span className="text-white/50">{name}</span>
            <span className="text-[10px] text-white/30">quota done</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const BAT_COLORS = ['#64748b', '#22c55e', '#3b82f6', '#f59e0b', '#10b981', '#a855f7', '#00d4ff']
const BOWL_COLORS = ['#64748b', '#6366f1', '#ec4899', '#ef4444', '#06b6d4', '#f97316', '#8b5cf6']

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

  const awaitingBatter = !!(inn?.awaitingBatterSelect && props.myTeamId === inn?.battingTeamId)
  const awaitingBowler = !!(inn?.awaitingBowlerSelect && props.myTeamId === inn?.bowlingTeamId)
  const canPick = (isBatting || isBowling) && !!pending && !awaitingBowler && !awaitingBatter

  return (
    <div className="space-y-3">
      {/* ── BATTER SELECT (after a wicket) ── */}
      {awaitingBatter && inn && (
        <BatterSelectPanel
          inn={inn}
          onSelectBatter={props.onSelectBatter}
        />
      )}

      {/* ── BOWLER SELECT (when needed) ── */}
      {awaitingBowler && !awaitingBatter && (
        <BowlerSelectPanel
          inn={inn}
          onSelectBowler={props.onSelectBowler}
          maxOversPerBowler={maxOversPerBowler}
        />
      )}

      {/* ── ACTION PANEL ── */}
      <div
        key={`ball-${props.pickSeq ?? 0}-${pending?.battingPick ?? 'x'}-${pending?.bowlingPick ?? 'x'}`}
        className="rounded-2xl border p-3 sm:rounded-3xl sm:p-5"
        style={{
          background: 'rgba(10,10,24,0.95)',
          borderColor: canPick ? `${isBatting ? bColor : oColor}35` : 'rgba(255,255,255,0.07)',
          boxShadow: canPick ? `0 0 30px ${isBatting ? bColor : oColor}10` : 'none',
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
          {inn?.awaitingBatterSelect && !awaitingBatter && (
            <div className="text-xs text-white/40">⏳ Waiting for batting team to send next batter…</div>
          )}
          {inn?.awaitingBowlerSelect && !awaitingBowler && !inn?.awaitingBatterSelect && (
            <div className="text-xs text-white/40">⏳ Waiting for bowler selection…</div>
          )}
          {inn?.freeHitNext && !awaitingBowler && !awaitingBatter && (
            <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#e9d5ff' }}>
              Free hit — dismissal off same pick is disabled
            </div>
          )}
        </div>

        {/* Pick grids */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {/* Batting */}
          <PickGrid
            label="Batsman pick"
            icon="🏏"
            actions={BAT_ACTIONS}
            colors={BAT_COLORS}
            active={isBatting}
            myPick={isBatting ? myPick : undefined}
            activeColor={bColor}
            onPick={props.onPick}
          />
          {/* Bowling */}
          <PickGrid
            label="Bowler pick"
            icon="⚾"
            actions={BOWL_ACTIONS}
            colors={BOWL_COLORS}
            active={isBowling}
            myPick={isBowling ? myPick : undefined}
            activeColor={oColor}
            onPick={props.onPick}
          />
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
  label, icon, actions, colors, active, myPick, activeColor, onPick
}: {
  label: string; icon: string
  actions: { value: number; label: string }[]
  colors: string[]
  active: boolean
  myPick?: number | null
  activeColor: string
  onPick: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <span
          className="text-[10px] font-bold uppercase tracking-widest sm:text-xs"
          style={{ color: active ? activeColor : 'rgba(255,255,255,0.3)' }}
        >
          {label}
        </span>
        {active && myPick !== null && myPick !== undefined && (
          <span
            className="ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold sm:text-[10px]"
            style={{ background: 'rgba(0,255,150,0.15)', color: '#00ff9d' }}
          >
            ✓ {myPick}
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
              className="relative flex flex-col items-center gap-0.5 rounded-xl border py-2 text-center transition-all disabled:cursor-not-allowed active:scale-95"
              style={
                !active
                  ? { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', opacity: 0.4 }
                  : isSelected
                  ? { background: `${btnColor}25`, borderColor: `${btnColor}70`, boxShadow: `0 0 12px ${btnColor}30`, transform: 'scale(1.05)' }
                  : { background: `${btnColor}0a`, borderColor: `${btnColor}25` }
              }
            >
              <div
                className="font-display text-lg font-extrabold tabular-nums leading-none sm:text-2xl"
                style={{ color: active ? btnColor : 'rgba(255,255,255,0.3)' }}
              >
                {a.value}
              </div>
              <div
                className="text-[7px] font-semibold uppercase leading-tight sm:text-[9px]"
                style={{ color: active ? `${btnColor}99` : 'rgba(255,255,255,0.2)' }}
              >
                {a.label}
              </div>
              {isSelected && (
                <div className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full" style={{ background: btnColor }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
