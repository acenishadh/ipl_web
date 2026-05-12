'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createSocket, getLocalSessionId } from '@/lib/socket'
import { TeamPickerModal } from '@/components/TeamPickerModal'
import { CricketRoomHeader } from '@/components/cricket/CricketRoomHeader'
import { CricketTopBar } from '@/components/cricket/CricketTopBar'
import { CricketTossPanel } from '@/components/cricket/CricketTossPanel'
import { CricketMatchView } from '@/components/cricket/CricketMatchView'
import { CricketDevFooter, SHOW_CRICKET_DEV_UI } from '@/components/cricket/CricketDevFooter'
import { CricketLobbyRoster } from '@/components/cricket/CricketLobbyRoster'
import { CricketMatchSummary } from '@/components/cricket/CricketMatchSummary'
import { CricketSchedule } from '@/components/cricket/CricketSchedule'
import { CricketPlayoffs } from '@/components/cricket/CricketPlayoffs'
import { CricketScorecard } from '@/components/cricket/CricketScorecard'
import { CricketInningsBreakOverlay, CricketTossResultOverlay } from '@/components/cricket/CricketPhaseOverlays'
import { CricketPlayingXIPage } from '@/components/cricket/CricketPlayingXIPage'
import { CricketCapLeaderboards } from '@/components/cricket/CricketCapLeaderboards'
import { teamColor, teamLogo } from '@/components/teamMeta'
import { reactToCricketCommentary } from '@/lib/cricketMoments'
import { FlowAmbient } from '@/components/FlowAmbient'
import { ChatPanel, type ChatMessage } from '@/components/ChatPanel'
import { writeChampionsHonours } from '@/lib/championsHonoursCache'

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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [chatUnread, setChatUnread] = useState(0)
  const chatOpenRef = useRef(false)
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

  // Deep links: ?tab=dashboard (e.g. from champions page)
  useEffect(() => {
    if (search.get('tab') !== 'dashboard') return
    if (!snap?.room || snap.room.mode !== 'TOURNAMENT') return
    setActiveTab('dashboard')
  }, [search, snap?.room])

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

  // Remember last chosen team per room, and auto-restore it on refresh/rejoin.
  useEffect(() => {
    if (!effectiveRoomId) return
    if (myTeamId) {
      try { window.sessionStorage.setItem(`ipl_cricket_team_${effectiveRoomId}`, myTeamId) } catch { /* ignore */ }
      return
    }
    if (!shouldPickTeam) return
    try {
      const saved = window.sessionStorage.getItem(`ipl_cricket_team_${effectiveRoomId}`)
      if (saved) {
        setTeamPicking(true)
        socket.emit('cricket:team:select', { roomId: effectiveRoomId, teamId: saved }, (res) => {
          setTeamPicking(false)
          if (!res.ok) {
            // If saved team is taken/unavailable, fall back to picker.
            setTeamPickerOpen(true)
          }
        })
      }
    } catch {
      /* ignore */
    }
  }, [effectiveRoomId, myTeamId, shouldPickTeam, socket])

  useEffect(() => {
    chatOpenRef.current = chatOpen
    if (chatOpen) setChatUnread(0)
  }, [chatOpen])

  useEffect(() => {
    socket.on('cricket:snapshot', setSnap)
    socket.on('cricket:chat:message', (m: any) => {
      setChatMessages((prev) => [...prev, m].slice(-250))
      setChatUnread((u) => (chatOpenRef.current ? u : Math.min(99, u + 1)))
    })
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

  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setNowMs(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [])

  const showPlayingXiPage = useMemo(() => {
    const m = match
    if (!m || m.status !== 'INNINGS1' || !m.toss?.decision) return false
    if (!m.awaitingXI || !myTeamId) return false
    if (myTeamId !== m.homeTeamId && myTeamId !== m.awayTeamId) return false
    const until = m.tossRevealUntilMs
    if (until != null && nowMs < until) return false
    // Only hide XI page once the player's own team has submitted AND toss is acknowledged.
    // This prevents a spectator/host clicking Continue from prematurely hiding the XI page
    // for the player who still needs to select their squad.
    const myTeamSubmitted =
      (myTeamId === m.homeTeamId && !!m.awaitingXI.homeSubmitted) ||
      (myTeamId === m.awayTeamId && !!m.awaitingXI.awaySubmitted)
    if (myTeamSubmitted && m.tossAcknowledged) return false
    return true
  }, [match, myTeamId, nowMs])

  const matchLabelShort =
    league && typeof league.currentMatchIndex === 'number' ? `Match ${league.currentMatchIndex + 1}` : undefined

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

  // After the finals, persist honours for the champions page reload, then redirect.
  useEffect(() => {
    if (!isTournament) return
    if (snap?.room?.status !== 'FINISHED') return
    if (!league?.championTeamId) return
    writeChampionsHonours(effectiveRoomId, league)
    const effectiveCode = code ?? snap?.room?.code ?? null
    const qp = effectiveCode ? `?code=${encodeURIComponent(effectiveCode)}` : ''
    router.replace(`/cricket/champions/${effectiveRoomId}${qp}`)
  }, [isTournament, snap?.room?.status, snap?.room?.code, league, league?.championTeamId, router, effectiveRoomId, code])

  if (showPlayingXiPage && match) {
    return (
      <main className="page-shell relative flex h-[100dvh] max-h-[100dvh] min-h-0 flex-col overflow-hidden p-0">
        <FlowAmbient variant="cricket" />
        {error ? (
          <div
            className="fixed left-1/2 top-[max(0.5rem,env(safe-area-inset-top))] z-[200] max-w-lg -translate-x-1/2 px-3"
            role="alert"
          >
            <div className="rounded-xl border border-red-500/35 bg-red-950/90 px-3 py-2 text-xs text-red-200 shadow-lg backdrop-blur-sm">
              ⚠️ {error}
            </div>
          </div>
        ) : null}
        <CricketPlayingXIPage
          match={match}
          myTeamId={myTeamId}
          squads={snap?.squads}
          matchLabel={matchLabelShort}
          onSubmitXI={(xi, captain) => {
            setError(null)
            if (!myTeamId) return
            socket.emit('cricket:xi:submit', { roomId: effectiveRoomId, teamId: myTeamId, xi, captain }, (res: { ok: boolean; error?: { message: string } }) => {
              if (!res.ok) setError(res.error?.message ?? 'Could not save XI.')
            })
          }}
          onExit={() => {
            setError(null)
            socket.emit('cricket:phase:ack', { roomId: effectiveRoomId, phase: 'toss' }, () => {})
          }}
        />
      </main>
    )
  }

  const showRoomTabs = !!(isTournament || match)

  return (
    <main
      className={`page-shell relative mx-auto max-w-6xl overflow-x-hidden px-2 py-2 sm:px-4 sm:py-4 ${
        showRoomTabs ? 'pb-[calc(4.25rem+env(safe-area-inset-bottom))] sm:pb-4' : ''
      }`}
    >
      <FlowAmbient variant="cricket" />
      {/* Ball popup */}
      {ballPopup && (
        <div
          className={
            showRoomTabs
              ? 'pointer-events-none fixed left-1/2 z-50 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 px-4 max-sm:bottom-[5.35rem] sm:bottom-[max(1.25rem,env(safe-area-inset-bottom))]'
              : 'pointer-events-none fixed left-1/2 z-50 max-w-[calc(100vw-1.5rem)] bottom-[max(1.25rem,env(safe-area-inset-bottom))] -translate-x-1/2 px-4'
          }
          style={{ animation: 'slide-up 0.25s ease-out' }}
        >
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

      {/* ── TAB BAR (tablet/desktop: sticky row; phone: bottom dock) ── */}
      {showRoomTabs && (
        <>
          <div
            className="sticky top-0 z-30 mt-2 hidden backdrop-blur-md sm:block"
            style={{
              marginLeft: '-0.125rem',
              marginRight: '-0.125rem',
              paddingLeft: '0.125rem',
              paddingRight: '0.125rem',
            }}
          >
            <div
              className="hide-scrollbar flex gap-1 overflow-x-auto rounded-xl border p-1 sm:overflow-visible"
              style={{ background: 'rgba(10,10,24,0.88)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
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
          </div>

          <div
            className="fixed bottom-0 left-0 right-0 z-[90] flex gap-0.5 border-t p-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] sm:hidden"
            style={{
              background: 'rgba(6,6,18,0.94)',
              borderColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            role="tablist"
            aria-label="Room sections"
          >
            {isTournament && (
              <TabButton
                id="dashboard"
                active={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
                label="📊 Board"
                sub={`${league?.completedResults?.length ?? 0}/${league?.fixtures?.length ?? 0}`}
                variant="dock"
              />
            )}
            <TabButton
              id="match"
              active={activeTab === 'match'}
              onClick={() => setActiveTab('match')}
              label="🏏 Match"
              sub={matchIsLive ? 'LIVE' : match?.status === 'COMPLETE' ? 'Done' : 'Wait'}
              live={!!matchIsLive}
              variant="dock"
            />
            {match && (
              <TabButton
                id="scorecard"
                active={activeTab === 'scorecard'}
                onClick={() => setActiveTab('scorecard')}
                label="📋 Card"
                sub={`${match?.innings?.length ?? 0} inn`}
                variant="dock"
              />
            )}
          </div>
        </>
      )}

      {/* ── MAIN CONTENT + SIDEBAR ── */}
      <div className="mt-2 grid items-start gap-2 sm:mt-3 sm:gap-4 sm:grid-cols-[1fr_256px] lg:grid-cols-[1fr_300px]">

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
              squads={snap?.squads}
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

        {/* Right sidebar: Lobby (desktop — scrolls independently when long) */}
        <div className="hidden sm:sticky sm:top-4 sm:max-h-[min(720px,calc(100dvh-1.5rem))] sm:overflow-y-auto sm:overscroll-contain sm:pr-1 sm:block">
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

      {SHOW_CRICKET_DEV_UI && (
        <CricketDevFooter match={match} league={league} myTeamId={myTeamId} />
      )}

      {/* Floating chat bubble + drawer */}
      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className={`tap-target glass-outline fixed z-[120] flex h-[52px] w-[52px] items-center justify-center rounded-2xl border text-xl font-black text-white shadow-2xl active:scale-[0.98] sm:bottom-[max(0.9rem,env(safe-area-inset-bottom))] sm:h-14 sm:w-14 ${
          showRoomTabs ? 'max-sm:bottom-[5.15rem]' : 'bottom-[max(0.9rem,env(safe-area-inset-bottom))]'
        }`}
        style={{
          right: 'max(0.9rem, env(safe-area-inset-right, 0px))',
          background: 'linear-gradient(135deg, rgba(34,211,238,0.22) 0%, rgba(168,85,247,0.18) 55%, rgba(10,10,24,0.92) 100%)',
          borderColor: 'rgba(34,211,238,0.25)',
          backdropFilter: 'blur(10px)',
          animation: 'floaty 2.4s ease-in-out infinite',
        }}
        aria-label="Open chat"
      >
        💬
        {chatUnread > 0 ? (
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border px-1 text-[10px] font-extrabold"
            style={{ background: 'rgba(239,68,68,0.95)', borderColor: 'rgba(255,255,255,0.35)', color: '#fff' }}
          >
            {chatUnread >= 99 ? '99+' : chatUnread}
          </span>
        ) : null}
      </button>

      {chatOpen ? (
        <div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/60 p-2 backdrop-blur-[2px] sm:items-stretch sm:justify-end sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Chat"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setChatOpen(false)
          }}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl border sm:h-full sm:max-w-md sm:rounded-3xl"
            style={{ background: 'rgba(10,10,24,0.98)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="font-display text-sm font-bold text-white">💬 Chat</div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/70"
              >
                Close
              </button>
            </div>
            <div className="p-3">
              <ChatPanel
                room={snap?.room ?? null}
                mySessionId={mySessionId}
                messages={chatMessages}
                onSend={(message) => {
                  setError(null)
                  socket.emit('cricket:chat:send', { roomId: effectiveRoomId, message }, (res) => {
                    if (!res.ok) setError(res.error.message)
                  })
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TabButton({ id, active, onClick, label, sub, live, variant = 'bar' }: {
  id: string
  active: boolean
  onClick: () => void
  label: string
  sub?: string
  live?: boolean
  variant?: 'bar' | 'dock'
}) {
  const isDock = variant === 'dock'
  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={active}
      onClick={onClick}
      className={`touch-manipulation transition-all active:scale-[0.98] ${
        isDock
          ? `flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-2.5 ${
              active ? 'ring-1 ring-white/20 ring-offset-0 ring-offset-[#060612]' : ''
            }`
          : 'flex min-w-[88px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-2 text-center sm:min-w-0 sm:flex-row sm:justify-center sm:gap-2 sm:py-2.5'
      }`}
      style={
        active
          ? { background: 'rgba(255,255,255,0.10)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12)' }
          : { background: 'transparent' }
      }
    >
      <span
        className={`font-bold leading-tight ${isDock ? 'text-[11px]' : 'text-[13px] sm:text-sm'}`}
        style={{ color: active ? '#fff' : 'rgba(255,255,255,0.42)' }}
      >
        {label}
      </span>
      {sub && (
        <>
          <span
            className={`rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider sm:hidden ${
              live ? 'text-[9px]' : ''
            }`}
            style={
              live
                ? { background: 'rgba(0,255,150,0.14)', color: '#00ff9d' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.38)' }
            }
          >
            {live && <span className="mr-0.5 inline-block h-1 w-1 animate-pulse rounded-full bg-green-400 align-middle" />}
            <span className="max-w-[4.25rem] truncate">{sub}</span>
          </span>
          <span
            className="hidden rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:inline-flex sm:text-[10px]"
            style={
              live
                ? { background: 'rgba(0,255,150,0.15)', color: '#00ff9d' }
                : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }
            }
          >
            {live && <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green-400 align-middle" />}
            {sub}
          </span>
        </>
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
  match, league, myTeamId, isTournament, roomStatus, squads, commentary, oversPerMatch,
  onPhaseAck, onTossCall, onTossDecide, onPick, onSelectBowler, onSelectBatter, onProceed
}: {
  match: any; league: any; myTeamId: string | null
  isTournament: boolean; roomStatus: string | null
  squads?: Record<string, Array<{ name: string; role: string; overseas: boolean }>>
  commentary: any[]; oversPerMatch: number
  onPhaseAck: (phase: 'toss' | 'inningsBreak') => void
  onTossCall: (c: 'HEADS' | 'TAILS') => void
  onTossDecide: (d: 'BAT' | 'BOWL') => void
  onPick: (v: number) => void
  onSelectBowler: (name: string) => void
  onSelectBatter: (batterIndex: number) => void
  onProceed: () => void
}) {
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
        matchId={match.matchId}
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
    const isPlayerInMatch = myTeamId === match.homeTeamId || myTeamId === match.awayTeamId
    const matchLabel =
      league && typeof league.currentMatchIndex === 'number'
        ? `Match ${league.currentMatchIndex + 1}`
        : undefined
    return (
      <CricketTossResultOverlay
        match={match}
        matchLabel={matchLabel}
        onContinue={isPlayerInMatch ? () => onPhaseAck('toss') : undefined}
      />
    )
  }

  if (match.status === 'INNINGS2' && !match.inningsBreakAcknowledged) {
    const isPlayerInMatch = myTeamId === match.homeTeamId || myTeamId === match.awayTeamId
    return (
      <CricketInningsBreakOverlay
        match={match}
        onContinue={isPlayerInMatch ? () => onPhaseAck('inningsBreak') : undefined}
      />
    )
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
      botTeamIds={league?.botTeamIds ?? []}
      commentary={commentary}
      oversPerMatch={oversPerMatch}
      pickSeq={match?.pickSeq ?? 0}
      onPick={onPick}
      onSelectBowler={onSelectBowler}
      onSelectBatter={onSelectBatter}
    />
  )
}
