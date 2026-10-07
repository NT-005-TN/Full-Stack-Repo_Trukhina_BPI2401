import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Подключает поддержку React и TypeScript JSX в Vite.
export default defineConfig({
  plugins: [react()],
})
