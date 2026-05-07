/** Persist last-known finals honours locally so `/cricket/champions/...` still shows trophies after reload. */

export const CHAMPIONS_HONOURS_KEY = (roomId: string) => `ipl_champions_honours_${roomId}`

export type ChampionsHonoursPayload = {
  championTeamId: string | null
  runnerUpTeamId?: string | null
  tournamentBatting?: Record<string, { teamId: string; player: string; runs: number }>
  tournamentBowling?: Record<string, { teamId: string; player: string; wickets: number }>
  playoffs?: unknown[]
}

export function writeChampionsHonours(roomId: string, league: unknown) {
  if (!league || typeof league !== 'object') return
  const lg = league as ChampionsHonoursPayload & Record<string, unknown>
  const champ = lg.championTeamId
  if (champ == null || champ === '') return
  try {
    const batting = lg.tournamentBatting && typeof lg.tournamentBatting === 'object' && !Array.isArray(lg.tournamentBatting)
      ? { ...(lg.tournamentBatting as Record<string, { teamId: string; player: string; runs: number }>) }
      : {}
    const bowling = lg.tournamentBowling && typeof lg.tournamentBowling === 'object' && !Array.isArray(lg.tournamentBowling)
      ? { ...(lg.tournamentBowling as Record<string, { teamId: string; player: string; wickets: number }>) }
      : {}
    const payload: ChampionsHonoursPayload = {
      championTeamId: champ,
      runnerUpTeamId: lg.runnerUpTeamId ?? null,
      tournamentBatting: batting,
      tournamentBowling: bowling,
      playoffs: Array.isArray(lg.playoffs) ? lg.playoffs : [],
    }
    sessionStorage.setItem(CHAMPIONS_HONOURS_KEY(roomId), JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function readChampionsHonours(roomId: string): ChampionsHonoursPayload | null {
  try {
    const raw = sessionStorage.getItem(CHAMPIONS_HONOURS_KEY(roomId))
    if (!raw) return null
    const p = JSON.parse(raw) as ChampionsHonoursPayload
    if (!p.championTeamId) return null
    return {
      championTeamId: p.championTeamId,
      runnerUpTeamId: p.runnerUpTeamId ?? null,
      tournamentBatting: p.tournamentBatting ?? {},
      tournamentBowling: p.tournamentBowling ?? {},
      playoffs: p.playoffs ?? [],
    }
  } catch {
    return null
  }
}
