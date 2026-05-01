'use client'

import { useEffect, useMemo, useState } from 'react'

export type PlayerLite = {
  id: string
  name: string
  role: string
  country: string
  basePriceLakh: number
  setId?: string
}

export function usePlayersIndex(serverUrl: string) {
  const [players, setPlayers] = useState<PlayerLite[] | null>(null)

  useEffect(() => {
    let alive = true
    fetch(`${serverUrl.replace(/\/$/, '')}/players`)
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return
        setPlayers(Array.isArray(json) ? (json as PlayerLite[]) : [])
      })
      .catch(() => {
        if (!alive) return
        setPlayers([])
      })
    return () => {
      alive = false
    }
  }, [serverUrl])

  const byId = useMemo(() => new Map((players ?? []).map((p) => [p.id, p])), [players])
  return { players, byId }
}

