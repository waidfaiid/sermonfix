/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        card: '#111827',
        'card-border': '#1f2937',
        accent: '#6366f1',
        'accent-hover': '#818cf8',
        'text-primary': '#f8fafc',
        'text-secondary': '#94a3b8',
        'slider-track': '#1e293b',
        'slider-thumb': '#6366f1',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      borderRadius: {
        card: '12px',
        pill: '999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
