import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@ipl-auction/contracts'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:5175'

function getSessionId(): string | null {
  if (typeof window === 'undefined') return null
  // Per-tab identity so multiple windows can join as different players.
  return window.sessionStorage.getItem('ipl_session')
}

export function getLocalSessionId(): string | null {
  return getSessionId()
}

export function setSessionId(id: string) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem('ipl_session', id)
}

function ensureSessionId(): string | null {
  if (typeof window === 'undefined') return null
  let id = getSessionId()
  if (id) return id

  // Generate a deterministic per-tab id BEFORE connecting,
  // so navigation/reconnect doesn't accidentally create a new identity.
  id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `tab_${Date.now()}_${Math.random()}`
  setSessionId(id)
  return id
}

export function createSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  const sessionId = ensureSessionId()
  const s = io(SERVER_URL, {
    transports: ['websocket'],
    auth: sessionId ? { sessionId } : {}
  })

  s.on('session:assigned', ({ sessionId: id }) => {
    setSessionId(id)
  })

  return s
}

