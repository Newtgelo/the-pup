/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // ✅ 1. ตั้งเป็น Default (หัวข้อ, เมนู, ปุ่ม ใช้ตัวนี้) -> Noto Sans Thai (ไม่มีหัว)
        sans: ['"Noto Sans Thai"', 'sans-serif'],
        
        // ✅ 2. สร้าง class ใหม่สำหรับเนื้อหาบทความ -> Noto Sans Thai Looped (มีหัว)
        body: ['"Noto Sans Thai Looped"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // พี่น่าจะใช้อันนี้อยู่สำหรับ prose
    require('tailwind-scrollbar-hide'), // ถ้ามี
  ],
}