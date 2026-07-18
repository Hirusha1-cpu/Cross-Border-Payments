/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A1420',
          900: '#0E1B2B',
          800: '#132538',
          700: '#1B3349',
          600: '#274863',
        },
        paper: '#EDEAE2',
        gold: {
          500: '#C9A227',
          400: '#DBB94A',
          300: '#E8CE7A',
        },
        mint: {
          500: '#4FD1AE',
          600: '#33B090',
        },
        rust: '#C15B4A',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'route-grid': 'linear-gradient(90deg, rgba(201,162,39,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};