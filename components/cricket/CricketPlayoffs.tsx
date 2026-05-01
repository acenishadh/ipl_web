'use client'

import { teamColor, teamLogo } from '@/components/teamMeta'

type PlayoffMatch = {
  stage: string
  matchId: string
  homeTeamId: string | null
  awayTeamId: string | null
  winnerTeamId: string | null
  loserTeamId: string | null
}

const STAGE_LABELS: Record<string, string> = {
  Q1: 'Qualifier 1',
  ELIMINATOR: 'Eliminator',
  Q2: 'Qualifier 2',
  FINALS: '🏆 Finals',
}

const STAGE_NOTE: Record<string, string> = {
  Q1: 'Winner → Finals',
  ELIMINATOR: 'Loser eliminated',
  Q2: 'Winner → Finals',
  FINALS: 'Championship',
}

export function CricketPlayoffs(props: { league: any; currentMatchId?: string | null }) {
  const playoffs: PlayoffMatch[] = props.league?.playoffs ?? []
  const inPlayoffs: boolean = props.league?.inPlayoffs ?? false
  const playoffIdx: number = props.league?.currentPlayoffIndex ?? -1

  if (!inPlayoffs && playoffs.length === 0) return null

  return (
    <div
      className="rounded-2xl border p-3 sm:rounded-3xl sm:p-5"
      style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,214,10,0.15)' }}
    >
      <div className="flex items-center gap-2">
        <h3 className="font-display text-sm font-bold text-white sm:text-base">🏆 Playoffs</h3>
        {inPlayoffs && (
          <span
            className="animate-pulse rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(255,214,10,0.15)', color: '#ffd60a' }}
          >
            Live
          </span>
        )}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {playoffs.map((pm, i) => {
          const isCurrent = inPlayoffs && i === playoffIdx
          const isDone = !!pm.winnerTeamId
          const stageLabel = STAGE_LABELS[pm.stage] ?? pm.stage
          const note = STAGE_NOTE[pm.stage] ?? ''

          return (
            <PlayoffCard
              key={pm.stage}
              pm={pm}
              label={stageLabel}
              note={note}
              isCurrent={isCurrent}
              isDone={isDone}
            />
          )
        })}
      </div>

      {/* Finals champion banner */}
      {(() => {
        const finals = playoffs.find((p) => p.stage === 'FINALS')
        if (!finals?.winnerTeamId) return null
        const col = teamColor(finals.winnerTeamId)
        return (
          <div
            className="mt-4 rounded-2xl border px-4 py-3 text-center"
            style={{ background: `${col}15`, borderColor: `${col}40` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={teamLogo(finals.winnerTeamId) ?? ''} alt="" className="mx-auto mb-1 h-10 w-10 object-contain" />
            <div className="font-display text-lg font-extrabold" style={{ color: col }}>
              {finals.winnerTeamId}
            </div>
            <div className="text-xs text-white/40">🏆 IPL Champions!</div>
          </div>
        )
      })()}
    </div>
  )
}

function PlayoffCard({
  pm, label, note, isCurrent, isDone
}: {
  pm: PlayoffMatch
  label: string
  note: string
  isCurrent: boolean
  isDone: boolean
}) {
  const homeColor = teamColor(pm.homeTeamId)
  const awayColor = teamColor(pm.awayTeamId)

  return (
    <div
      className="rounded-xl border p-3"
      style={{
        background: isCurrent
          ? 'rgba(255,214,10,0.07)'
          : isDone
          ? 'rgba(0,255,150,0.04)'
          : 'rgba(255,255,255,0.02)',
        borderColor: isCurrent
          ? 'rgba(255,214,10,0.35)'
          : isDone
          ? 'rgba(0,255,150,0.2)'
          : 'rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[9px] font-bold uppercase tracking-widest sm:text-[10px]"
          style={{ color: isCurrent ? '#ffd60a' : 'rgba(255,255,255,0.4)' }}
        >
          {label}
        </span>
        <span className="text-[9px] text-white/25">{note}</span>
      </div>

      {pm.homeTeamId && pm.awayTeamId ? (
        <div className="mt-2 flex items-center gap-2">
          <TeamBadge teamId={pm.homeTeamId} isWinner={pm.winnerTeamId === pm.homeTeamId} color={homeColor} />
          <span className="text-xs text-white/25">vs</span>
          <TeamBadge teamId={pm.awayTeamId} isWinner={pm.winnerTeamId === pm.awayTeamId} color={awayColor} />
        </div>
      ) : (
        <div className="mt-2 text-xs text-white/25 italic">TBD</div>
      )}

      {isDone && pm.winnerTeamId && (
        <div
          className="mt-1.5 rounded-lg px-2 py-1 text-[9px] font-bold sm:text-[10px]"
          style={{ background: `${teamColor(pm.winnerTeamId)}15`, color: teamColor(pm.winnerTeamId) }}
        >
          ✓ {pm.winnerTeamId} advances
        </div>
      )}
      {isCurrent && !isDone && (
        <div
          className="mt-1.5 flex items-center gap-1 rounded-lg px-2 py-1 text-[9px]"
          style={{ background: 'rgba(255,214,10,0.08)', color: '#ffd60a' }}
        >
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
          In progress
        </div>
      )}
    </div>
  )
}

function TeamBadge({ teamId, isWinner, color }: { teamId: string; isWinner: boolean; color: string }) {
  return (
    <div
      className="flex flex-1 items-center gap-1 rounded-lg border px-1.5 py-1"
      style={{
        background: isWinner ? `${color}20` : 'rgba(255,255,255,0.03)',
        borderColor: isWinner ? `${color}50` : 'rgba(255,255,255,0.07)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={teamLogo(teamId) ?? ''} alt="" className="h-4 w-4 shrink-0 object-contain" />
      <span className="truncate text-[10px] font-bold" style={{ color: isWinner ? color : 'rgba(255,255,255,0.5)' }}>
        {teamId}
      </span>
      {isWinner && <span className="ml-auto shrink-0 text-[9px]">✓</span>}
    </div>
  )
}
