import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/posts': 'http://localhost:80',
      '/comments': 'http://localhost:80',
      '/events': 'http://localhost:80',
    }
  }
})