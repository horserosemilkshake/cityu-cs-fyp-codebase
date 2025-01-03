/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  backgroundImage: {
    'hero-pattern': "url('../assets/hk_bj.jpg')",
  },
  theme: {
    extend: {
      width: {
        '128': '32rem',
        '192': '48rem',
        '256': '64rem',
      },
      keyframes: {
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' }
        },
        'blink-caret': {
          '50%': { 'border-color': 'transparent' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        typing: 'typing 3s steps(20) 1',
        marquee: 'marquee 10s linear infinite',
        'marquee-reverse': 'marquee-reverse 10s linear infinite',
      }
    }
  },
  plugins: [],
}

