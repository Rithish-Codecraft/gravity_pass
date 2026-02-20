import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Express API (Node.js)
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      // Flask ML Service (Python)
      '/ml': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
