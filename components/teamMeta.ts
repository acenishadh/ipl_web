export const TEAM_META: Array<{ id: string; name: string; logo: string; color: string }> = [
  { id: 'MI',   name: 'Mumbai Indians',         logo: '/teams/mi.png',   color: '#0ea5e9' },
  { id: 'CSK',  name: 'Chennai Super Kings',    logo: '/teams/csk.png',  color: '#f59e0b' },
  { id: 'RCB',  name: 'Royal Challengers',      logo: '/teams/rcb.png',  color: '#ef4444' },
  { id: 'KKR',  name: 'Kolkata Knight Riders',  logo: '/teams/kkr.png',  color: '#a855f7' },
  { id: 'DC',   name: 'Delhi Capitals',         logo: '/teams/dc.png',   color: '#3b82f6' },
  { id: 'PBKS', name: 'Punjab Kings',           logo: '/teams/pbks.png', color: '#f43f5e' },
  { id: 'SRH',  name: 'Sunrisers Hyderabad',    logo: '/teams/srh.png',  color: '#f97316' },
  { id: 'GT',   name: 'Gujarat Titans',         logo: '/teams/gt.png',   color: '#6366f1' },
  { id: 'LSG',  name: 'Lucknow Super Giants',   logo: '/teams/lsg.png',  color: '#06b6d4' },
  { id: 'RR',   name: 'Rajasthan Royals',       logo: '/teams/rr.png',   color: '#ec4899' },
]

export function teamLogo(teamId: string | null | undefined): string | null {
  if (!teamId) return null
  return TEAM_META.find((t) => t.id === teamId)?.logo ?? null
}

export function teamColor(teamId: string | null | undefined): string {
  return TEAM_META.find((t) => t.id === teamId)?.color ?? '#00d4ff'
}

export function teamAccent(teamId: string | null | undefined): { from: string; to: string; border: string } {
  switch (teamId) {
    case 'MI':
      return { from: 'from-sky-500/20',     to: 'to-sky-600/5',      border: 'border-sky-500/40' }
    case 'CSK':
      return { from: 'from-amber-400/25',   to: 'to-amber-500/5',    border: 'border-amber-400/50' }
    case 'RCB':
      return { from: 'from-red-500/25',     to: 'to-red-600/5',      border: 'border-red-500/50' }
    case 'KKR':
      return { from: 'from-purple-500/25',  to: 'to-violet-600/5',   border: 'border-purple-500/50' }
    case 'DC':
      return { from: 'from-blue-500/25',    to: 'to-blue-600/5',     border: 'border-blue-500/50' }
    case 'PBKS':
      return { from: 'from-rose-500/25',    to: 'to-rose-600/5',     border: 'border-rose-500/50' }
    case 'SRH':
      return { from: 'from-orange-500/25',  to: 'to-orange-600/5',   border: 'border-orange-500/50' }
    case 'GT':
      return { from: 'from-indigo-500/25',  to: 'to-indigo-600/5',   border: 'border-indigo-500/50' }
    case 'LSG':
      return { from: 'from-cyan-500/25',    to: 'to-cyan-600/5',     border: 'border-cyan-500/50' }
    case 'RR':
      return { from: 'from-pink-500/25',    to: 'to-pink-600/5',     border: 'border-pink-500/50' }
    default:
      return { from: 'from-white/5',        to: 'to-white/0',        border: 'border-white/10' }
  }
}
