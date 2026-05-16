/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#7a96fa',
          500: '#5a6ff5',
          600: '#4352e8',
          700: '#3740d0',
          800: '#2e35a8',
          900: '#2b3285',
        },
        surface: {
          50: '#f8f9fc',
          100: '#f0f2f8',
          200: '#e4e7f0',
          300: '#ced3e4',
          400: '#9ba4bc',
          500: '#6b77a1',
          600: '#4e5a82',
          700: '#3c4668',
          800: '#252d4a',
          900: '#161c33',
          950: '#0d1120',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      }
    },
  },
  plugins: [],
}
