/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bullish: '#22c55e',
        bearish: '#ef4444',
        'chart-bg': {
          light: '#ffffff',
          dark: '#1a1a2e',
        },
        'chart-grid': {
          light: '#e5e7eb',
          dark: '#374151',
        },
      },
    },
  },
  plugins: [],
}
