'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createSocket, getLocalSessionId } from '@/lib/socket'
import { TeamPickerModal } from '@/components/TeamPickerModal'
import { CricketRoomHeader } from '@/components/cricket/CricketRoomHeader'
import { CricketTopBar } from '@/components/cricket/CricketTopBar'
import { CricketTossPanel } from '@/components/cricket/CricketTossPanel'
import { CricketMatchView } from '@/components/cricket/CricketMatchView'
import { CricketLobbyRoster } from '@/components/cricket/CricketLobbyRoster'
import { CricketMatchSummary } from '@/components/cricket/CricketMatchSummary'
import { CricketSchedule } from '@/components/cricket/CricketSchedule'
import { CricketPlayoffs } from '@/components/cricket/CricketPlayoffs'
import { CricketScorecard } from '@/components/cricket/CricketScorecard'
import { CricketInningsBreakOverlay, CricketTossResultOverlay } from '@/components/cricket/CricketPhaseOverlays'
import { CricketCapLeaderboards } from '@/components/cricket/CricketCapLeaderboards'
import { CricketTournamentVictory } from '@/components/cricket/CricketTournamentVictory'
import { teamColor, teamLogo } from '@/components/teamMeta'
import { reactToCricketCommentary } from '@/lib/cricketMoments'

type CricketSnapshot = any
type BallPopup = { text: string; kind: string } | null
type TabId = 'dashboard' | 'match' | 'scorecard'

const POPUP_STYLE: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  WICKET:   { bg: 'rgba(239,68,68,0.18)',  border: 'rgba(239,68,68,0.5)',  color: '#fca5a5', icon: '💥' },
  BOUNDARY: { bg: 'rgba(0,212,255,0.15)',  border: 'rgba(0,212,255,0.5)',  color: '#67e8f9', icon: '🚀' },
  RESULT:   { bg: 'rgba(255,214,10,0.15)', border: 'rgba(255,214,10,0.5)', color: '#fbbf24', icon: '🏆' },
  BALL:     { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.18)', color: '#e2e8f0', icon: '🔵' },
  INFO:     { bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.18)', color: '#e2e8f0', icon: '📌' },
}

export default function CricketRoomPage() {
  const params = useParams<{ roomId: string }>()
  const search = useSearchParams()
  const urlRoomId = params.roomId
  const code = search.get('code')
  const pickTeam = search.get('pickTeam') === '1'
  const router = useRouter()

  const socket = useMemo(() => createSocket(), [])
  const [snap, setSnap] = useState<CricketSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [teamPicking, setTeamPicking] = useState(false)
  const [teamPickerOpen, setTeamPickerOpen] = useState(false)
  const [effectiveRoomId, setEffectiveRoomId] = useState<string>(() => urlRoomId)
  const [ballPopup, setBallPopup] = useState<BallPopup>(null)
  const [activeTab, setActiveTab] = useState<TabId>('match')
  const [showMobileLobby, setShowMobileLobby] = useState(false)
  const [autoPickReady, setAutoPickReady] = useState(false)
  const prevCommentaryLen = useRef(0)
  const prevMatchId = useRef<string | null>(null)
  const popupTimer = useRef<number | null>(null)
  const autoPickTimer = useRef<number | null>(null)

  const mySessionId = getLocalSessionId()
  const iAmHost = snap?.room?.hostSessionId === mySessionId
  const onKickPlayer = useMemo(
    () =>
      iAmHost
        ? (targetSessionId: string) => {
            setError(null)
            socket.emit('cricket:room:kick', { roomId: effectiveRoomId, targetSessionId }, (res: { ok: boolean; error?: { message: string } }) => {
              if (!res.ok) setError(res.error?.message ?? 'Could not remove player.')
            })
          }
        : undefined,
    [iAmHost, socket, effectiveRoomId]
  )
  const me = snap?.room?.participants?.find((p: any) => p.sessionId === mySessionId) ?? null
  const myTeamId: string | null = me?.teamId ?? null
  const shouldPickTeam = !!me && me.role === 'PLAYER' && !me.teamId

  const isTournament = snap?.room?.mode === 'TOURNAMENT'
  const league = snap?.league ?? null
  const match = snap?.match ?? null
  const inPlayoffs = league?.inPlayoffs ?? false
  const matchIsLive = match && match.status !== 'COMPLETE'
  const botTeamIds: string[] = league?.botTeamIds ?? []
  const roomStatus = snap?.room?.status ?? null

  // Auto-switch to Match tab when a new match starts
  useEffect(() => {
    if (match?.matchId && match.matchId !== prevMatchId.current && match.status !== 'COMPLETE') {
      prevMatchId.current = match.matchId
      setActiveTab('match')
    }
  }, [match?.matchId, match?.status])

  // Delay auto-pick by 600ms
  useEffect(() => {
    if (shouldPickTeam && !autoPickReady) {
      autoPickTimer.current = window.setTimeout(() => setAutoPickReady(true), 600) as unknown as number
      return () => { if (autoPickTimer.current) window.clearTimeout(autoPickTimer.current) }
    }
    if (!shouldPickTeam) setAutoPickReady(false)
  }, [shouldPickTeam, autoPickReady])

  useEffect(() => {
    socket.on('cricket:snapshot', setSnap)
    return () => { socket.disconnect() }
  }, [socket])

  useEffect(() => {
    const onKicked = (p: { roomId: string }) => {
      if (p.roomId !== effectiveRoomId) return
      setError('You were removed from the room by the host.')
      try {
        window.sessionStorage.removeItem('ipl_lastCricketRoomCode')
        window.sessionStorage.removeItem('ipl_lastCricketRoomId')
      } catch {
        /* ignore */
      }
      router.push('/cricket/join')
    }
    socket.on('cricket:kicked', onKicked)
    return () => { socket.off('cricket:kicked', onKicked) }
  }, [socket, effectiveRoomId, router])

  useEffect(() => {
    try {
      const name = window.sessionStorage.getItem('ipl_displayName') ?? ''
      const lastCode = code ?? window.sessionStorage.getItem('ipl_lastCricketRoomCode') ?? ''
      if (name && lastCode) {
        socket.emit('cricket:room:join', { code: lastCode, displayName: name, asSpectator: false }, (res) => {
          if (res.ok && res.roomId && res.roomId !== effectiveRoomId) {
            setEffectiveRoomId(res.roomId)
            try { window.sessionStorage.setItem('ipl_lastCricketRoomId', res.roomId) } catch { /* ignore */ }
          }
        })
      }
    } catch { /* ignore */ }
  }, [socket, code, effectiveRoomId])

  useEffect(() => {
    const rid = snap?.room?.roomId
    if (typeof rid === 'string' && rid && rid !== effectiveRoomId) setEffectiveRoomId(rid)
  }, [snap?.room?.roomId, effectiveRoomId])

  // Ball popup + haptics / confetti on new commentary
  useEffect(() => {
    const commentary: any[] = snap?.commentary ?? []
    if (commentary.length > prevCommentaryLen.current && commentary.length > 0) {
      const latest = commentary[commentary.length - 1]
      if (latest) {
        reactToCricketCommentary({ kind: String(latest.kind ?? 'INFO'), text: String(latest.text ?? '') })
        setBallPopup({ text: latest.text, kind: latest.kind })
        if (popupTimer.current) window.clearTimeout(popupTimer.current)
        popupTimer.current = window.setTimeout(() => setBallPopup(null), 2800) as unknown as number
      }
    }
    prevCommentaryLen.current = commentary.length
  }, [snap?.commentary])

  const scoreText = (() => {
    if (!match) return isTournament ? 'Group Stage' : 'Waiting…'
    const inn = match.innings?.[match.status === 'INNINGS2' ? 1 : 0] ?? match.innings?.[match.innings.length - 1]
    if (!inn) return 'Toss'
    const overs = `${Math.floor(inn.balls / 6)}.${inn.balls % 6}`
    const target = match.target ? ` · T:${match.target}` : ''
    return `${inn.battingTeamId} ${inn.runs}/${inn.wickets} (${overs})${target}`
  })()

  const pickerOpen = teamPickerOpen || ((pickTeam || autoPickReady) && shouldPickTeam)

  return (
    <main className="mx-auto max-w-6xl px-2 py-2 sm:px-4 sm:py-4">
      {/* Ball popup */}
      {ballPopup && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4" style={{ animation: 'slide-up 0.25s ease-out' }}>
          <div
            className="flex max-w-xs items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl"
            style={{
              background: (POPUP_STYLE[ballPopup.kind] ?? POPUP_STYLE.BALL).bg,
              borderColor: (POPUP_STYLE[ballPopup.kind] ?? POPUP_STYLE.BALL).border,
              backdropFilter: 'blur(16px)',
              boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 30px ${(POPUP_STYLE[ballPopup.kind] ?? POPUP_STYLE.BALL).border}`,
            }}
          >
            <span className="text-xl">{(POPUP_STYLE[ballPopup.kind] ?? POPUP_STYLE.BALL).icon}</span>
            <span className="line-clamp-2 font-display text-sm font-bold" style={{ color: (POPUP_STYLE[ballPopup.kind] ?? POPUP_STYLE.BALL).color }}>
              {ballPopup.text}
            </span>
          </div>
        </div>
      )}

      <TeamPickerModal
        open={pickerOpen}
        room={snap?.room ?? null}
        title={isTournament ? 'Choose your franchise' : 'Pick your team'}
        botTeamIds={botTeamIds}
        onPick={(teamId) => {
          setError(null)
          setTeamPicking(true)
          const watchdog = window.setTimeout(() => { setTeamPicking(false); setError('Team selection timed out.') }, 8000)
          socket.emit('cricket:team:select', { roomId: effectiveRoomId, teamId }, (res) => {
            window.clearTimeout(watchdog)
            setTeamPicking(false)
            if (!res.ok) setError(res.error.message)
            else { setTeamPickerOpen(false); setAutoPickReady(false) }
          })
        }}
        onClose={teamPickerOpen ? () => setTeamPickerOpen(false) : undefined}
      />

      {/* ── HEADER ── */}
      <CricketRoomHeader
        room={snap?.room ?? null}
        code={code}
        mySessionId={mySessionId}
        myTeamId={myTeamId}
        onStart={() => socket.emit('cricket:league:start', { roomId: effectiveRoomId }, () => {})}
        onPause={(paused) => socket.emit('cricket:room:pause', { roomId: effectiveRoomId, paused }, () => {})}
        onSelectTeam={() => setTeamPickerOpen(true)}
      />

      {/* Status banners */}
      {roomStatus === 'PAUSED' && (
        <div
          className="mt-2 flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-bold"
          style={{ background: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.4)', color: '#fb923c' }}
        >
          <span>⏸ Game Paused — all actions frozen</span>
          <span className="font-mono text-white/40">{snap?.room?.code}</span>
        </div>
      )}
      {teamPicking && (
        <div className="mt-2 rounded-xl border px-3 py-1.5 text-xs text-white/50" style={{ background: 'rgba(244,63,94,0.05)', borderColor: 'rgba(244,63,94,0.2)' }}>
          ⏳ Selecting team…
        </div>
      )}
      {error && (
        <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400">
          ⚠️ {error}
        </div>
      )}

      {/* ── SCORE BAR ── */}
      {(() => {
        const currentInn =
          match?.innings?.length > 0 ? { ...match.innings[match.innings.length - 1], status: match.status } : null
        return (
          <div className="mt-2">
            <CricketTopBar
              homeTeamId={match?.homeTeamId ?? null}
              awayTeamId={match?.awayTeamId ?? null}
              scoreText={scoreText}
              subText={
                match?.status ??
                (isTournament
                  ? inPlayoffs
                    ? 'Playoffs'
                    : `M${(league?.currentMatchIndex ?? 0) + 1}/${league?.fixtures?.length ?? '?'}`
                  : `${snap?.room?.oversPerMatch ?? 5} overs`)
              }
              innings={currentInn}
              matchStatus={match?.status ?? null}
              target={match?.target ?? null}
              oversPerMatch={snap?.room?.oversPerMatch ?? 5}
              currentOverBalls={currentInn?.currentOverBalls ?? []}
            />
          </div>
        )
      })()}

      {/* ── TAB BAR ── (Tournament: 3 tabs; Quick Match: match + scorecard) */}
      {(isTournament || match) && (
        <div className="mt-2 flex gap-1 rounded-xl border p-1" style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,255,255,0.08)' }}>
          {isTournament && (
            <TabButton
              id="dashboard"
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              label="📊 Dashboard"
              sub={`${league?.completedResults?.length ?? 0}/${league?.fixtures?.length ?? 0} played`}
            />
          )}
          <TabButton
            id="match"
            active={activeTab === 'match'}
            onClick={() => setActiveTab('match')}
            label="🏏 Match"
            sub={matchIsLive ? 'LIVE' : match?.status === 'COMPLETE' ? 'Summary' : 'Waiting'}
            live={!!matchIsLive}
          />
          {match && (
            <TabButton
              id="scorecard"
              active={activeTab === 'scorecard'}
              onClick={() => setActiveTab('scorecard')}
              label="📋 Scorecard"
              sub={`${match?.innings?.length ?? 0} inn`}
            />
          )}
        </div>
      )}

      {/* ── MAIN CONTENT + SIDEBAR ── */}
      <div className="mt-2 grid items-start gap-2 sm:mt-3 sm:gap-3 sm:grid-cols-[1fr_256px] lg:grid-cols-[1fr_288px]">

        {/* Left: tab content */}
        <div className="min-w-0">
          {/* DASHBOARD tab */}
          {activeTab === 'dashboard' && isTournament && (
            <DashboardTab league={league} match={match} inPlayoffs={inPlayoffs} />
          )}

          {/* MATCH tab */}
          {(activeTab === 'match' || (!isTournament && activeTab !== 'scorecard')) && (
            <MatchTab
              match={match}
              league={league}
              myTeamId={myTeamId}
              isTournament={isTournament}
              roomStatus={roomStatus}
              commentary={snap?.commentary ?? []}
              oversPerMatch={snap?.room?.oversPerMatch ?? 5}
              onPhaseAck={(phase) => {
                socket.emit('cricket:phase:ack', { roomId: effectiveRoomId, phase }, () => {})
              }}
              onTossCall={(call) => socket.emit('cricket:toss:call', { roomId: effectiveRoomId, call }, () => {})}
              onTossDecide={(dec) => socket.emit('cricket:toss:decide', { roomId: effectiveRoomId, decision: dec }, () => {})}
              onPick={(value) => {
                setError(null)
                socket.emit('cricket:pick', { roomId: effectiveRoomId, value }, (res) => {
                  if (!res.ok) setError(res.error.message)
                })
              }}
              onSelectBowler={(name) => {
                socket.emit('cricket:bowler:select', { roomId: effectiveRoomId, bowlerName: name }, (res) => {
                  if (!res.ok) setError(res.error.message)
                })
              }}
              onSelectBatter={(batterIndex) => {
                socket.emit('cricket:batter:select', { roomId: effectiveRoomId, batterIndex }, (res) => {
                  if (!res.ok) setError(res.error.message)
                })
              }}
              onProceed={() => {
                socket.emit('cricket:match:proceed', { roomId: effectiveRoomId }, (res) => {
                  if (!res.ok) setError(res.error.message)
                })
              }}
            />
          )}

          {/* SCORECARD tab */}
          {activeTab === 'scorecard' && (
            <CricketScorecard match={match} />
          )}
        </div>

        {/* Right sidebar: Lobby (always visible on sm+) */}
        <div className="hidden sm:sticky sm:top-4 sm:block">
          <CricketLobbyRoster room={snap?.room ?? null} mySessionId={mySessionId} onKickPlayer={onKickPlayer} />
        </div>
      </div>

      {/* Mobile lobby toggle (visible below both tabs) */}
      <div className="mt-2 sm:hidden">
        <button
          onClick={() => setShowMobileLobby((v) => !v)}
          className="mb-2 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-[0.98]"
          style={{ background: 'rgba(244,63,94,0.08)', borderColor: 'rgba(244,63,94,0.3)', color: '#fb7185' }}
        >
          <span>👥 Players · {snap?.room?.participants?.length ?? 0}</span>
          <span className="opacity-60">{showMobileLobby ? '▲' : '▼'}</span>
        </button>
        {showMobileLobby && (
          <CricketLobbyRoster room={snap?.room ?? null} mySessionId={mySessionId} onKickPlayer={onKickPlayer} />
        )}
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TabButton({ id, active, onClick, label, sub, live }: {
  id: string; active: boolean; onClick: () => void
  label: string; sub?: string; live?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-center transition-all sm:flex-row sm:justify-center sm:gap-2 sm:py-2.5"
      style={
        active
          ? { background: 'rgba(255,255,255,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }
          : { background: 'transparent' }
      }
    >
      <span className="text-sm font-bold" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.4)' }}>{label}</span>
      {sub && (
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:text-[10px]"
          style={
            live
              ? { background: 'rgba(0,255,150,0.15)', color: '#00ff9d' }
              : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }
          }
        >
          {live && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400 align-middle" />}
          {sub}
        </span>
      )}
    </button>
  )
}

function DashboardTab({ league, match, inPlayoffs }: { league: any; match: any; inPlayoffs: boolean }) {
  if (!league) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border p-10 text-center"
        style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="text-4xl">🏟️</div>
        <h2 className="mt-3 font-display text-xl font-bold text-white">Tournament not started yet</h2>
        <p className="mt-2 text-xs text-white/40">Host will start the tournament from the Match tab.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Points table */}
      <PointsTableCard league={league} />

      <div>
        <h3 className="mb-2 font-display text-sm font-bold text-white/80">Tournament caps</h3>
        <CricketCapLeaderboards league={league} />
      </div>

      {/* Playoffs bracket */}
      {(inPlayoffs || (league?.playoffs?.length ?? 0) > 0) && (
        <CricketPlayoffs league={league} currentMatchId={match?.matchId} />
      )}

      {/* Schedule */}
      <CricketSchedule league={league} currentMatchId={match?.matchId} />
    </div>
  )
}

function PointsTableCard({ league }: { league: any }) {
  const table: any[] = [...(league?.pointsTable ?? [])].sort((a: any, b: any) => b.points - a.points || b.nrr - a.nrr)
  const qualifyCount = league?.qualifyCount ?? 4
  const total = league?.fixtures?.length ?? 0
  const done = league?.completedResults?.length ?? 0

  return (
    <div
      className="rounded-2xl border p-3 sm:rounded-3xl sm:p-5"
      style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-white sm:text-base">📊 Points Table</h3>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span>Top {qualifyCount} qualify</span>
          <span className="text-white/15">·</span>
          <span>{done}/{total} played</span>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[280px] text-xs">
          <thead>
            <tr className="border-b text-white/30" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
              <th className="pb-2 pl-1 text-left font-semibold">#</th>
              <th className="pb-2 text-left font-semibold">Team</th>
              <th className="pb-2 text-center font-semibold">P</th>
              <th className="pb-2 text-center font-semibold">W</th>
              <th className="pb-2 text-center font-semibold">L</th>
              <th className="pb-2 text-center font-semibold">T</th>
              <th className="pb-2 text-center font-semibold">Pts</th>
              <th className="pb-2 text-right font-semibold">NRR</th>
            </tr>
          </thead>
          <tbody>
            {table.map((r: any, i: number) => {
              const rowColor = teamColor(r.teamId)
              const isQualified = i < qualifyCount
              const isEliminated = !isQualified && r.played > 0
              return (
                <tr
                  key={r.teamId}
                  className="border-b"
                  style={{
                    borderColor: 'rgba(255,255,255,0.04)',
                    background: isQualified ? `${rowColor}08` : 'transparent',
                    opacity: isEliminated && r.played >= 9 ? 0.55 : 1,
                  }}
                >
                  <td className="py-2 pl-1">
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: isQualified ? '#00ff9d' : 'rgba(255,255,255,0.2)' }}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={teamLogo(r.teamId) ?? ''} alt="" className="h-5 w-5 object-contain" />
                      <span className="font-bold" style={{ color: rowColor }}>{r.teamId}</span>
                      {isQualified && i < 4 && (
                        <span className="text-[8px] text-green-400/60">Q</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 text-center text-white/50">{r.played}</td>
                  <td className="py-2 text-center text-white/50">{r.won}</td>
                  <td className="py-2 text-center text-white/50">{r.lost}</td>
                  <td className="py-2 text-center text-white/50">{r.tied}</td>
                  <td className="py-2 text-center font-mono font-bold text-white">{r.points}</td>
                  <td className="py-2 text-right font-mono text-white/40">
                    {r.nrr >= 0 ? '+' : ''}{Number(r.nrr).toFixed(3)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MatchTab({
  match, league, myTeamId, isTournament, roomStatus, commentary, oversPerMatch,
  onPhaseAck, onTossCall, onTossDecide, onPick, onSelectBowler, onSelectBatter, onProceed
}: {
  match: any; league: any; myTeamId: string | null
  isTournament: boolean; roomStatus: string | null
  commentary: any[]; oversPerMatch: number
  onPhaseAck: (phase: 'toss' | 'inningsBreak') => void
  onTossCall: (c: 'HEADS' | 'TAILS') => void
  onTossDecide: (d: 'BAT' | 'BOWL') => void
  onPick: (v: number) => void
  onSelectBowler: (name: string) => void
  onSelectBatter: (batterIndex: number) => void
  onProceed: () => void
}) {
  if (roomStatus === 'FINISHED' && !match && isTournament && league?.championTeamId) {
    return <CricketTournamentVictory league={league} />
  }

  if (roomStatus === 'FINISHED' && !match) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border p-10 text-center"
        style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,214,10,0.2)' }}
      >
        <div className="text-5xl">🏆</div>
        <h2 className="mt-3 font-display text-xl font-bold text-white">
          {isTournament ? 'Tournament Complete!' : 'Match Complete!'}
        </h2>
        <p className="mt-2 text-xs text-white/40">
          {isTournament ? 'Check the Dashboard tab for final standings and playoff results.' : 'Thanks for playing!'}
        </p>
      </div>
    )
  }

  if (!match) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border p-10 text-center"
        style={{ background: 'rgba(10,10,24,0.9)', borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="text-4xl">🏟️</div>
        <h2 className="mt-3 font-display text-xl font-bold text-white">
          {isTournament ? 'Tournament Lobby' : 'Match Lobby'}
        </h2>
        <p className="mt-2 text-xs text-white/40">
          {isTournament
            ? 'Pick your franchise (header), then the host starts the tournament. Bot teams fill remaining slots.'
            : 'Pick your team then the host starts.'}
        </p>
      </div>
    )
  }

  if (match.status === 'TOSS' && match.toss) {
    return (
      <CricketTossPanel
        myTeamId={myTeamId}
        homeTeamId={match.homeTeamId}
        awayTeamId={match.awayTeamId}
        calledByTeamId={match.toss.calledByTeamId}
        call={match.toss.call}
        result={match.toss.result}
        winnerTeamId={match.toss.winnerTeamId}
        decision={match.toss.decision}
        onCall={onTossCall}
        onDecide={onTossDecide}
      />
    )
  }

  if (match.status === 'INNINGS1' && match.toss?.decision && !match.tossAcknowledged) {
    return <CricketTossResultOverlay match={match} onContinue={() => onPhaseAck('toss')} />
  }

  if (match.status === 'INNINGS2' && !match.inningsBreakAcknowledged) {
    return <CricketInningsBreakOverlay match={match} onContinue={() => onPhaseAck('inningsBreak')} />
  }

  if (match.status === 'COMPLETE') {
    return (
      <CricketMatchSummary
        match={match}
        league={league}
        awaitingProceed={league?.awaitingProceed ?? false}
        onProceed={onProceed}
      />
    )
  }

  return (
    <CricketMatchView
      match={match}
      league={league}
      myTeamId={myTeamId}
      commentary={commentary}
      oversPerMatch={oversPerMatch}
      pickSeq={match?.pickSeq ?? 0}
      onPick={onPick}
      onSelectBowler={onSelectBowler}
      onSelectBatter={onSelectBatter}
    />
  )
}
