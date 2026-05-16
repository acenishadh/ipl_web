'use client'

import type { ReactNode } from 'react'
import { Fragment } from 'react'
import type { AuctionSnapshot } from '@ipl-auction/contracts'
import { TEAM_META, teamLogo } from './teamMeta'
import type { PlayerLite } from '@/lib/usePlayersIndex'

export type PoolTab = 'pending' | 'all' | 'unsold' | 'sold'

export function AuctionPoolExplorer(props: {
  open: boolean
  onClose: () => void
  auction: AuctionSnapshot | null
  tab: PoolTab
  onTab: (t: PoolTab) => void
  players: PlayerLite[] | null
}) {
  const { auction, tab, players, open, onClose, onTab } = props

  if (!open) return null

  const byId = new Map((players ?? []).map((p) => [p.id, p]))
  const soldIds = new Set<string>()
  const soldByTeam = new Map<string, string[]>()

  if (auction) {
    for (const tm of auction.teams) {
      const list: string[] = []
      for (const en of tm.squad) {
        soldIds.add(en.playerId)
        list.push(en.playerId)
      }
      soldByTeam.set(tm.teamId, list)
    }
  }

  const remainingIds = [...(auction?.remainingPlayerIds ?? [])]
  if (auction?.lot?.playerId && auction.lot.status === 'RUNNING') {
    remainingIds.unshift(auction.lot.playerId)
  }
  const unsoldIds = [...(auction?.unsoldPlayerIds ?? [])]

  const renderRow = (pid: string, extra?: ReactNode) => {
    const p = byId.get(pid)
    const name = p?.name ?? pid
    const role = p?.role ?? '—'
    const co = p?.country ?? '—'
    const pool = p?.setId ?? '—'

    return (
      <div
        key={pid}
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-white/5 px-2 py-1.5 text-xs text-white/80 sm:text-sm"
      >
        <span className="min-w-[10rem] font-semibold text-white">{name}</span>
        <span className="text-white/40">{role}</span>
        <span className="text-white/35">{co}</span>
        <span className="truncate text-[10px] text-white/25">{pool}</span>
        {extra}
      </div>
    )
  }

  const tabs: { id: PoolTab; label: string }[] = [
    { id: 'pending', label: 'Current pool (queue)' },
    { id: 'all', label: 'All players' },
    { id: 'unsold', label: 'Unsold so far' },
    { id: 'sold', label: 'Sold' }
  ]

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Player pool explorer"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-cyan-500/25 bg-[#0a0a18]/98 shadow-xl sm:rounded-3xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
          <h2 className="font-display text-sm font-bold text-white sm:text-base">📋 Pool</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-2 py-1 text-xs font-bold text-white/50 hover:bg-white/[0.05]"
          >
            Close
          </button>
        </div>

        <div className="flex flex-wrap gap-1 px-2 py-2 sm:px-3">
          {tabs.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => onTab(x.id)}
              className="rounded-xl px-3 py-1.5 text-[11px] font-bold sm:text-xs"
              style={{
                border: tab === x.id ? '1px solid rgba(0,212,255,0.45)' : '1px solid rgba(255,255,255,0.08)',
                background: tab === x.id ? 'rgba(0,212,255,0.14)' : 'rgba(255,255,255,0.03)',
                color: tab === x.id ? '#e0fafe' : 'rgba(255,255,255,0.55)'
              }}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="max-h-[calc(88vh-7rem)] overflow-y-auto px-1 pb-3 sm:px-2">
          {tab === 'pending' &&
            [...new Set(remainingIds)].map((pid) =>
              renderRow(
                pid,
                auction?.lot?.playerId === pid && auction.lot.status === 'RUNNING' ? (
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-200">
                    LIVE LOT
                  </span>
                ) : undefined
              )
            )}
          {tab === 'all' &&
            [...byId.entries()]
              .sort((a, b) => (a[1].name ?? '').localeCompare(b[1].name ?? ''))
              .map(([id, p]) => renderRow(id, soldIds.has(id) ? <span className="text-emerald-300/70">sold</span> : null))}

          {tab === 'unsold' && [...new Set(unsoldIds)].map((pid) => renderRow(pid))}

          {tab === 'sold' &&
            TEAM_META.flatMap((t) =>
              (soldByTeam.get(t.id) ?? []).map((pid) => (
                <Fragment key={`${t.id}-${pid}`}>{renderRow(pid, (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={teamLogo(t.id) ?? ''} alt="" className="inline h-3.5 w-3.5 object-contain opacity-70" />{' '}
                    <span className="font-mono text-[10px] text-white/40">{t.id}</span>
                  </>
                ))}</Fragment>
              ))
            )}

          {tab === 'pending' && new Set(remainingIds).size === 0 ? (
            <p className="px-4 pb-4 text-center text-xs text-white/35">Nobody left in auction queue.</p>
          ) : null}
          {tab === 'unsold' && new Set(unsoldIds).size === 0 ? (
            <p className="px-4 pb-4 text-center text-xs text-white/35">No unsold entries yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
