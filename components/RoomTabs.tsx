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
    <div className="flex items-center gap-2">
      <div
        className="flex flex-1 items-center gap-0.5 rounded-2xl border p-1 sm:gap-1"
        style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {tabs.map((id) => {
          const active = props.value === id
          const { label, icon } = TAB_META[id]
          return (
            <button
              key={id}
              onClick={() => props.onChange(id)}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl px-1.5 py-1.5 text-xs font-semibold transition-all sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm"
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(0,212,255,0.08) 100%)',
                      color: '#00d4ff',
                      boxShadow: '0 0 12px rgba(0,212,255,0.2)',
                      border: '1px solid rgba(0,212,255,0.25)',
                    }
                  : {
                      color: 'rgba(255,255,255,0.45)',
                      border: '1px solid transparent',
                    }
              }
            >
              <span className="text-sm leading-none sm:text-base">{icon}</span>
              {/* Full label on sm+, 4-char on xs */}
              <span className="hidden sm:inline">{label}</span>
              <span className="text-[10px] sm:hidden">{label.slice(0, 4)}</span>
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
