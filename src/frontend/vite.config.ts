import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base path for GitHub Pages - uses repo name from environment or defaults to '/'
  base: process.env.GITHUB_ACTIONS ? '/FinanceViz/' : '/',
  server: {
    port: 5173,
    open: false,
  },
})
