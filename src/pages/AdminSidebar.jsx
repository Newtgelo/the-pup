import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase'; // ✅ ต้องมีบรรทัดนี้ครับ!

export const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("Attempting to logout..."); // เช็คใน Console
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Logout สำเร็จ -> ไปหน้า Login
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout Error:", error.message);
      alert("ออกจากระบบไม่สำเร็จ: " + error.message);
    }
  };

  const menuItems = [
    { name: 'ภาพรวม', path: '/admin/dashboard', icon: '📊' },
    { name: 'จัดการข่าวสาร', path: '/admin/news', icon: '📰' },
    { name: 'จัดการอีเวนต์', path: '/admin/events', icon: '📅' },
    { name: 'จัดการคาเฟ่', path: '/admin/cafes', icon: '☕' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-[100]">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-tr from-[#FF6B00] to-[#E11D48] rounded-lg shadow-sm"></div>
        <h1 className="font-bold text-xl text-gray-800">Admin Panel</h1>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                isActive
                  ? 'bg-orange-50 text-[#FF6B00]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition font-medium cursor-pointer"
        >
          <span>🚪</span>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};