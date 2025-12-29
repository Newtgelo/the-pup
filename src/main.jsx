import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
// ✅ 1. Import HelmetProvider
import { HelmetProvider } from 'react-helmet-async'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ 2. ครอบด้วย HelmetProvider เป็นชั้นนอกสุด (หรือข้างใน BrowserRouter ก็ได้ แต่ครอบหมดดีสุด) */}
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)