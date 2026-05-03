'use client'

import { useMemo } from 'react'

export type TabId = 'activity' | 'chat' | 'squad' | 'settings'

const TAB_META: Record<TabId, { label: string; icon: string }> = {
  activity: { label: 'Activity', icon: '⚡' },
  chat:     { label: 'Chat',     icon: '💬' },
  squad:    { label: 'Squad',    icon: '🧑‍🤝‍🧑' },
  settings: { label: 'Settings', icon: '⚙️' },
}

export function RoomTabs(props: {
  value: TabId
  onChange: (v: TabId) => void
  rightSlot?: React.ReactNode
}) {
  const tabs = useMemo(() => (['activity', 'chat', 'squad', 'settings'] as const), [])

  return (
    <div className="flex items-center gap-2 touch-manipulation">
      <div
        className="flex flex-1 items-center gap-0.5 rounded-2xl border border-white/10 bg-white/[0.05] p-1 sm:gap-1"
      >
        {tabs.map((id) => {
          const active = props.value === id
          const { label, icon } = TAB_META[id]
          return (
            <button
              key={id}
              type="button"
              onClick={() => props.onChange(id)}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-xs font-semibold transition-all sm:min-h-0 sm:gap-1.5 sm:px-3 sm:py-2.5 sm:text-sm"
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg, rgba(34,211,238,0.22) 0%, rgba(168,85,247,0.1) 100%)',
                      color: '#67e8f9',
                      boxShadow: '0 0 14px rgba(34,211,238,0.25)',
                      border: '1px solid rgba(34,211,238,0.35)',
                    }
                  : {
                      color: 'rgba(255,255,255,0.48)',
                      border: '1px solid transparent',
                    }
              }
            >
              <span className="text-base leading-none sm:text-lg">{icon}</span>
              {/* Full label on sm+, short on xs */}
              <span className="hidden sm:inline">{label}</span>
              <span className="max-w-[3.2rem] truncate text-[10px] sm:hidden">{label}</span>
            </button>
          )
        })}
      </div>
      {/* Hide right slot on xs — it wraps and cramps the tabs */}
      {props.rightSlot ? (
        <div className="hidden shrink-0 items-center sm:flex">{props.rightSlot}</div>
      ) : null}
    </div>
  )
}
