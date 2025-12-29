import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Swal from "sweetalert2";

export const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  
  // State สำหรับเปลี่ยนรหัสผ่าน
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email);
      // ดึงชื่อจาก user_metadata (ถ้ามี)
      setFullName(user.user_metadata?.full_name || "");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = {
        data: { full_name: fullName }, // อัปเดต metadata
      };

      // ถ้ามีการกรอกรหัสผ่านใหม่ ให้เพิ่มการอัปเดตรหัสผ่านด้วย
      if (newPassword) {
        if (newPassword.length < 6) {
            throw new Error("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
        }
        if (newPassword !== confirmPassword) {
            throw new Error("รหัสผ่านใหม่ไม่ตรงกัน");
        }
        updates.password = newPassword;
      }

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ!',
        text: 'ข้อมูลของคุณได้รับการอัปเดตแล้ว',
        confirmButtonColor: '#FF6B00',
        timer: 1500
      });

      // เคลียร์ช่องรหัสผ่าน
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message,
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ ตั้งค่าบัญชี</h1>
      <p className="text-gray-500 mb-8">จัดการข้อมูลส่วนตัวและความปลอดภัยของคุณ</p>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          
          {/* ส่วนข้อมูลทั่วไป */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                👤 ข้อมูลทั่วไป
            </h2>
            <div className="grid gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">อีเมล (เปลี่ยนไม่ได้)</label>
                    <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อที่แสดง (Display Name)</label>
                    <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="เช่น Admin K-Pop"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6B00] outline-none transition"
                    />
                    <p className="text-xs text-gray-400 mt-1">ชื่อนี้จะแสดงที่เมนู Sidebar ด้านซ้าย</p>
                </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* ส่วนเปลี่ยนรหัสผ่าน */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                🔒 เปลี่ยนรหัสผ่าน
            </h2>
            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 mb-4">
                <p className="text-xs text-orange-700">
                    💡 เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน
                </p>
            </div>
            
            <div className="grid gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">รหัสผ่านใหม่</label>
                    <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6B00] outline-none transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ยืนยันรหัสผ่านใหม่</label>
                    <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF6B00] outline-none transition"
                    />
                </div>
            </div>
          </div>

          <div className="pt-4">
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B00] hover:bg-[#e65000] text-white font-bold py-3.5 rounded-xl shadow-md transition transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};