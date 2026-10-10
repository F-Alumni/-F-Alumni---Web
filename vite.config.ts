import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      '@/components': path.resolve(import.meta.dirname, './src/components'),
      '@/features': path.resolve(import.meta.dirname, './src/features'),
      '@/pages': path.resolve(import.meta.dirname, './src/pages'),
      '@/services': path.resolve(import.meta.dirname, './src/services'),
      '@/types': path.resolve(import.meta.dirname, './src/types'),
      '@/lib': path.resolve(import.meta.dirname, './src/lib'),
      '@/hooks': path.resolve(import.meta.dirname, './src/hooks'),
      '@/stores': path.resolve(import.meta.dirname, './src/stores'),
      '@/constants': path.resolve(import.meta.dirname, './src/constants'),
    },
  },
})
