'use client'

import { createSocket, getLocalSessionId } from '@/lib/socket'
import { useMemo, useEffect, useState, useRef } from 'react'
import type { AuctionSnapshot, RoomSnapshot } from '@ipl-auction/contracts'
import { useParams, useSearchParams } from 'next/navigation'
import { TeamPickerModal } from '@/components/TeamPickerModal'
import { RoomHeader } from '@/components/RoomHeader'
import { LobbySidebar } from '@/components/LobbySidebar'
import { RoomTabs, type TabId } from '@/components/RoomTabs'
import { ActivityFeed } from '@/components/ActivityFeed'
import { LotHero } from '@/components/LotHero'
import { usePlayersIndex } from '@/lib/usePlayersIndex'
import { SoldOverlay, type SoldOverlayData } from '@/components/SoldOverlay'
import { TEAM_META, teamColor, teamLogo } from '@/components/teamMeta'
import { ChatPanel, type ChatMessage } from '@/components/ChatPanel'

export default function RoomPage() {
  const params = useParams<{ roomId: string }>()
  const search = useSearchParams()
  const roomId = params.roomId
  const code = search.get('code')

  const socket = useMemo(() => createSocket(), [])
  const [room, setRoom] = useState<RoomSnapshot | null>(null)
  const [auction, setAuction] = useState<AuctionSnapshot | null>(null)
  const [events, setEvents] = useState<string[]>([])
  const [bidAmount, setBidAmount] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())
  const [teamPickerOpen, setTeamPickerOpen] = useState(false)
  const [teamPicking, setTeamPicking] = useState(false)
  const [tab, setTab] = useState<TabId>('activity')
  const [soldOverlay, setSoldOverlay] = useState<SoldOverlayData | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [showMobileLobby, setShowMobileLobby] = useState(false)
  // Delay auto-open so socket is fully ready before team:select
  const [autoPickReady, setAutoPickReady] = useState(false)
  const autoPickTimer = useRef<number | null>(null)

  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:5175'
  const playersIndex = usePlayersIndex(serverUrl)

  useEffect(() => {
    socket.on('room:snapshot', setRoom)
    socket.on('auction:snapshot', (s) => {
      setAuction(s)
      const base = s.lot?.basePriceLakh ?? 0
      const cur = s.lot?.currentBidLakh ?? null
      setBidAmount(cur == null ? base : cur + 25)
    })
    socket.on('auction:event', (e) => {
      setEvents((prev) => [e.message, ...prev].slice(0, 40))
      const parsed = (() => { try { return JSON.parse(e.message) } catch { return null } })()
      if (parsed?.type === 'SOLD' && typeof parsed.teamId === 'string' && typeof parsed.amountLakh === 'number') {
        const playerName = typeof parsed.playerId === 'string'
          ? playersIndex.byId.get(parsed.playerId)?.name ?? parsed.playerId
          : 'Player'
        setSoldOverlay({ teamId: parsed.teamId, amountLakh: parsed.amountLakh, playerName })
        window.setTimeout(() => setSoldOverlay(null), 2200)
      }
    })
    socket.on('chat:message', (m) => {
      setChatMessages((prev) => [...prev, m].slice(-200))
    })

    socket.emit('room:rejoin', { roomId }, (res) => {
      if (!res.ok) {
        try {
          const name = window.sessionStorage.getItem('ipl_displayName') ?? ''
          const lastCode = code ?? window.sessionStorage.getItem('ipl_lastRoomCode') ?? ''
          if (name && lastCode) {
            socket.emit('room:join', { code: lastCode, displayName: name, asSpectator: false }, () => {})
          }
        } catch { /* ignore */ }
      }
    })

    const t = window.setInterval(() => setNowMs(Date.now()), 250)
    return () => {
      window.clearInterval(t)
      socket.disconnect()
    }
  }, [socket, roomId])

  const mySessionId = getLocalSessionId()
  const me = room?.participants.find((p) => p.sessionId === mySessionId) ?? null
  const shouldPickTeam = !!me && me.role === 'PLAYER' && !me.teamId

  useEffect(() => {
    if (!selectedTeamId && me?.teamId) setSelectedTeamId(me.teamId)
  }, [me?.teamId, selectedTeamId])

  // Delay auto-open by 600ms after shouldPickTeam becomes true, so socket is settled
  useEffect(() => {
    if (shouldPickTeam && !autoPickReady) {
      autoPickTimer.current = window.setTimeout(() => setAutoPickReady(true), 600)
      return () => {
        if (autoPickTimer.current) window.clearTimeout(autoPickTimer.current)
      }
    }
    if (!shouldPickTeam) setAutoPickReady(false)
  }, [shouldPickTeam, autoPickReady])

  const myTeamData = auction?.teams.find((t) => t.teamId === me?.teamId)
  const myPurseRemaining = myTeamData ? myTeamData.purseTotalLakh - myTeamData.purseSpentLakh : null

  // Only show teams that are in the lobby (have joined the room)
  const lobbyTeamIds = new Set((room?.participants ?? []).map((p) => p.teamId).filter(Boolean) as string[])
  const lobbyTeams = TEAM_META.filter((t) => lobbyTeamIds.has(t.id))

  const pickerOpen = teamPickerOpen || (autoPickReady && shouldPickTeam)

  return (
    <main className="page-shell landscape-main mx-auto max-w-6xl px-2 py-2 sm:px-5 sm:py-5">
      <SoldOverlay data={soldOverlay} onDone={() => setSoldOverlay(null)} />
      <TeamPickerModal
        open={pickerOpen}
        room={room}
        title="Choose your franchise"
        onPick={(teamId) => {
          setError(null)
          setTeamPicking(true)
          // 8s watchdog — enough for a slow server response
          const watchdog = window.setTimeout(() => {
            setTeamPicking(false)
            setError('Team selection timed out — please try again.')
          }, 8000)
          socket.emit('team:select', { roomId, teamId }, (res) => {
            window.clearTimeout(watchdog)
            setTeamPicking(false)
            if (!res.ok) setError(res.error.message)
            else { setTeamPickerOpen(false); setAutoPickReady(false) }
          })
        }}
        onClose={teamPickerOpen ? () => setTeamPickerOpen(false) : undefined}
      />

      <RoomHeader
        room={room}
        code={code}
        mySessionId={mySessionId}
        myTeamId={me?.teamId ?? null}
        onStart={() => socket.emit('room:start', { roomId }, () => {})}
        onPause={(paused) => socket.emit('room:pause', { roomId, paused }, () => {})}
        onSelectTeam={() => setTeamPickerOpen(true)}
      />

      {/* Paused banner */}
      {room?.status === 'PAUSED' && (
        <div
          className="mt-2 flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold"
          style={{ background: 'rgba(249,115,22,0.1)', borderColor: 'rgba(249,115,22,0.35)', color: '#fb923c' }}
        >
          ⏸ Auction is paused. Host will resume shortly.
        </div>
      )}

      {/* Purse bar */}
      {myPurseRemaining != null && me?.teamId && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-2xl border px-3 py-1.5"
            style={{ background: `${teamColor(me.teamId)}10`, borderColor: `${teamColor(me.teamId)}30` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={teamLogo(me.teamId) ?? ''} alt="" className="h-4 w-4 object-contain" />
            <span className="text-xs text-white/45">Purse:</span>
            <span
              className="font-display text-sm font-bold tabular-nums"
              style={{ color: myPurseRemaining < 2000 ? '#ef4444' : teamColor(me.teamId) }}
            >
              ₹{(myPurseRemaining / 100).toFixed(1)} Cr
            </span>
          </div>
          {myTeamData && (
            <div
              className="rounded-2xl border px-3 py-1.5 text-xs text-white/40"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              Squad: <span className="font-bold text-white/70">{myTeamData.squadSize}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 grid items-start gap-3 sm:grid-cols-[1fr_256px] lg:grid-cols-[1fr_320px]">
        <section className="flex min-w-0 flex-col gap-3">
          <LotHero
            auction={auction}
            nowMs={nowMs}
            isPaused={room?.status === 'PAUSED'}
            bidAmount={bidAmount}
            onInc25={() => setBidAmount((v) => v + 25)}
            onBid={() => {
              if (!auction?.lot) return
              setError(null)
              socket.emit('bid:place', { roomId, lotId: auction.lot.lotId, amountLakh: bidAmount }, (res) => {
                if (!res.ok) setError(res.error.message)
              })
            }}
            bidDisabled={!me || me.role !== 'PLAYER' || !me.teamId || room?.status === 'PAUSED'}
            bidDisabledReason={
              room?.status === 'PAUSED' ? 'Auction is paused.'
              : !me ? 'Joining…'
              : me.role !== 'PLAYER' ? 'Spectators cannot bid.'
              : !me.teamId ? 'Pick a team to bid.'
              : undefined
            }
          />

          {teamPicking ? (
            <div
              className="rounded-2xl border px-4 py-2 text-sm text-white/50"
              style={{ background: 'rgba(0,212,255,0.05)', borderColor: 'rgba(0,212,255,0.2)' }}
            >
              ⏳ Selecting team…
            </div>
          ) : null}
          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              ⚠️ {error}
            </div>
          ) : null}

          <RoomTabs
            value={tab}
            onChange={setTab}
            rightSlot={
              <div className="text-xs text-white/30">
                {playersIndex.players ? `${playersIndex.players.length} players` : '…'}
              </div>
            }
          />

          {tab === 'activity' ? <ActivityFeed events={events} playersById={playersIndex.byId} /> : null}

          {tab === 'chat' ? (
            <ChatPanel
              room={room}
              mySessionId={mySessionId}
              messages={chatMessages}
              onSend={(message) => {
                setError(null)
                socket.emit('chat:send', { roomId, message }, (res) => {
                  if (!res.ok) setError(res.error.message)
                })
              }}
            />
          ) : null}

          {tab === 'squad' ? (
            <div className="game-panel rounded-3xl border border-white/10 p-4 sm:p-5">
              <h3 className="font-display text-base font-bold text-white">🧑‍🤝‍🧑 Squad Browser</h3>

              {lobbyTeams.length === 0 ? (
                <p className="mt-6 text-center text-sm text-white/30">No teams have joined yet.</p>
              ) : (
                <div className="mt-4 grid gap-4 lg:grid-cols-[200px_1fr]">
                  {/* Team list — only lobby teams */}
                  <div className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                    {lobbyTeams.map((t) => {
                      const picked = selectedTeamId === t.id
                      const color = teamColor(t.id)
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTeamId(t.id)}
                          className="flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2 text-left transition-all hover:scale-[1.02] lg:w-full"
                          style={
                            picked
                              ? { background: `${color}15`, borderColor: `${color}45` }
                              : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }
                          }
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={t.logo} alt="" className="h-7 w-7 shrink-0 object-contain" />
                          <div className="min-w-0">
                            <div className="text-sm font-bold" style={{ color: picked ? color : 'rgba(255,255,255,0.8)' }}>
                              {t.id}
                            </div>
                            <div className="hidden truncate text-[10px] text-white/35 lg:block">{t.name}</div>
                          </div>
                          {picked && <div className="ml-auto h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />}
                        </button>
                      )
                    })}
                  </div>

                  {/* Squad panel */}
                  <div
                    className="rounded-2xl border p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                  >
                    {selectedTeamId ? (
                      <>
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={teamLogo(selectedTeamId) ?? ''} alt="" className="h-7 w-7 object-contain" />
                            <span className="font-display text-lg font-bold" style={{ color: teamColor(selectedTeamId) }}>
                              {selectedTeamId}
                            </span>
                          </div>
                          {(() => {
                            const td = auction?.teams.find((t) => t.teamId === selectedTeamId)
                            if (!td) return null
                            const remaining = td.purseTotalLakh - td.purseSpentLakh
                            return (
                              <div className="text-right">
                                <div className="text-[10px] text-white/35">Purse left</div>
                                <div
                                  className="font-display text-base font-bold tabular-nums"
                                  style={{ color: remaining < 2000 ? '#ef4444' : teamColor(selectedTeamId) }}
                                >
                                  ₹{(remaining / 100).toFixed(1)} Cr
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                        <div className="space-y-2">
                          {auction?.teams
                            .find((t) => t.teamId === selectedTeamId)
                            ?.squad.map((s) => {
                              const p = playersIndex.byId.get(s.playerId)
                              return (
                                <div
                                  key={s.playerId}
                                  className="flex items-center justify-between rounded-xl border px-3 py-2"
                                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="truncate text-sm font-bold text-white">{p?.name ?? s.playerId}</span>
                                      {p?.country === 'OS' && (
                                        <span
                                          className="shrink-0 rounded px-1 py-0.5 text-[9px] font-bold"
                                          style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
                                        >
                                          🌍 OS
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-white/40">
                                      {p ? `${p.role} • Base ₹${p.basePriceLakh}L` : '—'}
                                    </div>
                                  </div>
                                  <div
                                    className="ml-3 shrink-0 font-mono text-sm font-bold"
                                    style={{ color: teamColor(selectedTeamId) }}
                                  >
                                    ₹{s.priceLakh}L
                                  </div>
                                </div>
                              )
                            }) ?? <p className="py-4 text-center text-sm text-white/25">No players yet.</p>}
                        </div>
                      </>
                    ) : (
                      <p className="py-8 text-center text-sm text-white/25">Select a team above.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {tab === 'settings' ? (
            <div className="game-panel rounded-3xl border border-white/10 p-5">
              <h3 className="font-display text-base font-bold text-white">⚙️ Settings</h3>
              <p className="mt-2 text-sm text-white/40">
                Host can configure timer, increments, and export results (coming soon).
              </p>
            </div>
          ) : null}
        </section>

        {/* Sidebar — shown in grid on sm+ (landscape phone / tablet / desktop) */}
        <div className="hidden sm:sticky sm:top-4 sm:block">
          <LobbySidebar room={room} mySessionId={mySessionId} auction={auction} />
        </div>
      </div>

      {/* Mobile portrait-only lobby toggle (hidden on sm+) */}
      <div className="mt-3 sm:hidden">
        <button
          type="button"
          onClick={() => setShowMobileLobby((v) => !v)}
          className="tap-target mb-2.5 flex min-h-[48px] w-full touch-manipulation items-center justify-between rounded-2xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100 transition-all active:scale-[0.98]"
        >
          <span>👥 Lobby · {room?.participants.length ?? 0} players</span>
          <span className="text-xs opacity-70">{showMobileLobby ? '▲ Hide' : '▼ Show'}</span>
        </button>
        {showMobileLobby && <LobbySidebar room={room} mySessionId={mySessionId} auction={auction} />}
      </div>
    </main>
  )
}
