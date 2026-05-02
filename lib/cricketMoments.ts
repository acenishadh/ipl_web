/**
 * Match feedback: vibration (where supported) and confetti for sixes / wins.
 */

function vibrateForCommentary(kind: string, text: string) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  const t = text.toLowerCase()
  try {
    if (kind === 'WICKET') navigator.vibrate([35, 40, 60])
    else if (kind === 'BOUNDARY') {
      if (t.includes('six')) navigator.vibrate([20, 15, 25, 15, 30])
      else navigator.vibrate(22)
    } else if (kind === 'RESULT' && t.includes('won')) navigator.vibrate([40, 50, 40, 50, 100])
    else if (kind === 'INFO' && t.includes('wide')) navigator.vibrate([12, 20, 12])
  } catch {
    /* ignore */
  }
}

let confettiFn: null | ((opts: Record<string, unknown>) => void) = null

async function getConfetti() {
  if (confettiFn) return confettiFn
  if (typeof window === 'undefined') return null
  try {
    const mod = await import('canvas-confetti')
    confettiFn = mod.default
    return confettiFn
  } catch {
    return null
  }
}

export async function fireMatchConfetti(intensity: 'six' | 'win') {
  const c = await getConfetti()
  if (!c) return
  if (intensity === 'six') {
    c({ particleCount: 90, spread: 68, startVelocity: 38, origin: { y: 0.68 }, colors: ['#00d4ff', '#a855f7', '#fbbf24'] })
  } else {
    c({ particleCount: 160, spread: 100, startVelocity: 45, origin: { y: 0.6 }, ticks: 220, colors: ['#ffd60a', '#f43f5e', '#00ff9d', '#60a5fa'] })
    setTimeout(() => c({ particleCount: 60, spread: 80, origin: { y: 0.7 } }), 200)
  }
}

export function reactToCricketCommentary(latest: { kind: string; text: string }) {
  vibrateForCommentary(latest.kind, latest.text)

  const t = latest.text.toLowerCase()
  if (latest.kind === 'BOUNDARY' && (t.includes('six') || t.includes('six!'))) {
    void fireMatchConfetti('six')
  }
  if (latest.kind === 'RESULT' && t.includes('won') && !t.includes('tied')) {
    void fireMatchConfetti('win')
  }
}
