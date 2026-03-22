import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion':   ['framer-motion'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-pdf':      ['pdf-lib']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: 'all',
    strictPort: true
  }
})
