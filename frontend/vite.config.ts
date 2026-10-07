import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Подключает обработку React и TypeScript JSX во время запуска и сборки.
export default defineConfig({
  plugins: [react()],
})
