/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#e8f4ff',
          100: '#c3e0ff',
          200: '#85bfff',
          300: '#4d9ef7',
          400: '#2181f0',
          500: '#0d68d8',
          600: '#0a52b0',
          700: '#083d88',
          800: '#052860',
          900: '#031640',
        },
        surface: '#f4f6f9',
        panel:   '#ffffff',
      }
    },
  },
  plugins: [],
}
