/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#eeecff',
          100: '#d5d1ff',
          200: '#b3acff',
          300: '#8a82ff',
          400: '#6c63ff',
          500: '#5a51f5',
          600: '#473fe0',
          700: '#3730b8',
          800: '#282392',
          900: '#1a1768',
        },
        surface: {
          50:  '#f8f8fc',
          100: '#f0f0f8',
          200: '#e4e3f2',
          300: '#cccae8',
          400: '#9896c8',
          500: '#6b69a4',
          600: '#4e4c82',
          700: '#373568',
          800: '#22214a',
          900: '#131230',
          950: '#0b0a1e',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.35s ease forwards',
        'fade-in': 'fadeIn 0.25s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
