import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Tauri desktop apps load locally, so larger chunks are acceptable
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split vendor libraries into separate chunks
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
})
