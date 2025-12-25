import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 👇 เพิ่มก้อนนี้เข้าไปครับ
  define: {
    global: 'window',
  },
})