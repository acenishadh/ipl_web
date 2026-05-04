'use client'

/** Decorative blurred gradients — keep pointer-events-none on wrapper in parent. */
export function FlowAmbient(props: { variant: 'home' | 'auction' | 'cricket' }) {
  const v = props.variant
  if (v === 'home') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-60 -top-60 h-[600px] w-[600px] rounded-full bg-cyan-400/12 blur-[120px]" />
        <div className="absolute -right-60 top-1/4 h-[550px] w-[550px] rounded-full bg-violet-500/12 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full bg-fuchsia-500/9 blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-[320px] w-[320px] rounded-full bg-amber-400/8 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[280px] w-[280px] rounded-full bg-emerald-400/7 blur-[90px]" />
      </div>
    )
  }
  if (v === 'auction') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-40 top-0 h-[450px] w-[450px] rounded-full bg-cyan-400/11 blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-500/11 blur-[100px]" />
        <div className="absolute left-1/2 top-1/3 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-teal-400/6 blur-[90px]" />
      </div>
    )
  }
  /* cricket */
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-52 -top-24 h-[520px] w-[520px] rounded-full bg-rose-400/11 blur-[110px]" />
      <div className="absolute -right-48 bottom-0 h-[480px] w-[480px] rounded-full bg-orange-400/10 blur-[110px]" />
      <div className="absolute left-1/2 top-1/3 h-[340px] w-[340px] -translate-x-1/2 rounded-full bg-amber-400/7 blur-[100px]" />
    </div>
  )
}
