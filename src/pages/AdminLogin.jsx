import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Swal from 'sweetalert2'; // ✅ ใช้ SweetAlert2 สวยกว่า

// --- Icons Components (ฝังไว้ในนี้เลยจะได้ไม่ติดปัญหา Import) ---
const IconMail = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const IconLock = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const IconEye = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
const IconEyeOff = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
);

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ✅ เพิ่ม State สลับดูรหัสผ่าน

  // เช็ค Session (Logic เดิม)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/admin/events'); // เปลี่ยนไปหน้า Events เลย (หรือ Dashboard ตามที่พี่ตั้ง)
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (error) {
      // ✅ ใช้ Swal แจ้งเตือนสวยๆ
      Swal.fire({
        icon: 'error',
        title: 'เข้าสู่ระบบไม่สำเร็จ',
        text: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        confirmButtonColor: '#FF6B00',
        confirmButtonText: 'ลองใหม่'
      });
    } else {
      // ✅ Login สำเร็จ -> แจ้งเตือนเล็กน้อยแล้วไปต่อ
      Swal.fire({
        icon: 'success',
        title: 'ยินดีต้อนรับ!',
        text: 'กำลังเข้าสู่ระบบหลังบ้าน...',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate('/admin/events');
      });
    }
  };

  return (
    // ✅ 1. พื้นหลัง Gradient สวยๆ เต็มจอ
    <div className="min-h-screen w-full bg-gradient-to-br from-[#FF6B00] to-[#E11D48] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* ✅ 2. Floating Bubbles (วงกลมลอยๆ เพิ่มมิติ) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>

      {/* ✅ 3. Glass Card (การ์ดกระจก) */}
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4 shadow-inner">
                <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md">Admin Login</h1>
            <p className="text-white/80 text-sm mt-2">เข้าสู่ระบบจัดการ The Popup Plan</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white/90 ml-1">Email Address</label>
            <div className="relative group">
                <div className="absolute left-3 top-3.5 text-white/60 group-focus-within:text-white transition">
                    <IconMail />
                </div>
                <input 
                  type="email" 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition shadow-inner"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white/90 ml-1">Password</label>
            <div className="relative group">
                <div className="absolute left-3 top-3.5 text-white/60 group-focus-within:text-white transition">
                    <IconLock />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-12 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/50 focus:bg-black/30 transition shadow-inner"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                
                {/* ✅ ปุ่มกดดูรหัสผ่าน (รูปตา) */}
                <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-white/60 hover:text-white transition cursor-pointer"
                >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-[#FF6B00] hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98] font-bold py-3.5 rounded-xl transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังตรวจสอบ...
                </span>
            ) : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-xs text-white/50">
                &copy; 2025 The Popup Plan Admin System
            </p>
        </div>

      </div>
    </div>
  );
};