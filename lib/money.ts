export const Lakh = (n: number) => n
export const Crore = (n: number) => n * 100 // 1 crore = 100 lakh

export function formatMoneyLakh(lakh: number) {
  if (!Number.isFinite(lakh)) return '—'
  if (lakh >= 100) return `₹${(lakh / 100).toFixed(lakh % 100 === 0 ? 0 : 2)} Cr`
  return `₹${Math.round(lakh)} L`
}

