import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['team-task-manager-production-9e17.up.railway.app'],
    host: '0.0.0.0',
    port: process.env.PORT || 4173,
  },
  server: {
    host: '0.0.0.0',
  }
})