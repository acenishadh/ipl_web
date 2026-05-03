import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'var(--font-inter)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-rajdhani)', 'var(--font-inter)', 'sans-serif'],
      },
      colors: {
        arcade: {
          cyan: '#22d3ee',
          pink: '#f472b6',
          purple: '#c084fc',
          green: '#34d399',
          amber: '#fcd34d',
          orange: '#fb923c',
          mint: '#5eead4',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 24px rgba(34, 211, 238, 0.35)',
        'glow-pink': '0 0 24px rgba(244, 114, 182, 0.35)',
        'panel': '0 4px 28px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      },
      animation: {
        'fade-up': 'slide-up 0.35s ease-out forwards',
      },
      keyframes: {
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
