'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RoomSnapshot } from '@ipl-auction/contracts'
import { teamColor, teamLogo } from './teamMeta'

export type ChatMessage = {
  roomId: string
  ts: number
  sessionId: string
  displayName: string
  teamId: string | null
  message: string
}

export function ChatPanel(props: {
  room: RoomSnapshot | null
  mySessionId: string | null
  messages: ChatMessage[]
  onSend: (message: string) => void
}) {
  const [text, setText] = useState('')
  const me = useMemo(
    () => props.room?.participants.find((p) => p.sessionId === props.mySessionId) ?? null,
    [props.room, props.mySessionId]
  )
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [props.messages.length])

  const send = () => {
    const msg = text.trim()
    if (!msg) return
    props.onSend(msg)
    setText('')
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="game-panel flex flex-col rounded-3xl border border-fuchsia-500/10 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-white">💬 Chat</h3>
        <span className="text-xs text-white/30">{props.messages.length} messages</span>
      </div>

      <div ref={listRef} className="mt-3 max-h-[min(360px,50vh)] space-y-2 overflow-auto pr-1">
        {props.messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/40">No messages yet — say hi! 👋</p>
        ) : null}
        {props.messages.map((m) => {
          const isMe = !!(props.mySessionId && m.sessionId === props.mySessionId)
          const color = teamColor(m.teamId)
          const logo = teamLogo(m.teamId)
          return (
            <div
              key={`${m.ts}:${m.sessionId}`}
              className={`flex gap-3 rounded-2xl border px-3 py-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
              style={{
                background: isMe ? `${color}10` : 'rgba(255,255,255,0.03)',
                borderColor: isMe ? `${color}30` : 'rgba(255,255,255,0.06)',
              }}
            >
              {/* Avatar */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: logo ? `${color}18` : 'rgba(255,255,255,0.06)' }}
              >
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="" className="h-6 w-6 object-contain" />
                ) : (
                  <span className="text-xs text-white/30">?</span>
                )}
              </div>

              {/* Content */}
              <div className={`min-w-0 flex-1 ${isMe ? 'text-right' : ''}`}>
                <div className={`flex flex-wrap items-center gap-1.5 ${isMe ? 'justify-end' : ''}`}>
                  <span className="text-sm font-bold text-white">{m.displayName}</span>
                  {m.teamId ? (
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{ background: `${color}18`, color }}
                    >
                      {m.teamId}
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/25">no team</span>
                  )}
                  <span className="text-[10px] text-white/25">
                    {new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div
                  className="mt-1 whitespace-pre-wrap break-words text-sm"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  {m.message}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="mt-3 flex items-center gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
          }}
          placeholder={me ? `Message as ${me.displayName}…` : 'Message…'}
          className="input-play h-auto min-h-[48px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-white/30 focus:outline-none sm:min-h-[44px]"
          enterKeyHint="send"
          autoComplete="off"
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderColor: 'rgba(255,255,255,0.1)',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(0,212,255,0.4)' }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }}
        />
        <button
          type="button"
          onClick={send}
          className="tap-target min-h-[48px] shrink-0 touch-manipulation rounded-2xl px-5 text-sm font-bold text-slate-950 transition-all hover:scale-105 active:scale-95 sm:min-h-[44px]"
          style={{ background: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)', boxShadow: '0 0 18px rgba(34,211,238,0.4)' }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
