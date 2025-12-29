import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const IconChevronLeft = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>
);

export const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("Loading...");
  const [fullName, setFullName] = useState(""); // ✅ เพิ่ม State เก็บชื่อจริง

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "Unknown");
        // ✅ ดึงชื่อจาก Metadata มาโชว์ (ถ้าตั้งค่าไว้)
        setFullName(user.user_metadata?.full_name || "");
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
    <div 
      className={`
        bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-[100]
        transition-all duration-300 ease-in-out shadow-sm
        ${isOpen ? 'w-64' : 'w-20'} 
      `}
    >
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-9 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#FF6B00] hover:border-[#FF6B00] shadow-sm transition-all z-50 cursor-pointer"
        title={isOpen ? "ยุบเมนู" : "ขยายเมนู"}
      >
        <div className={`transition-transform duration-300 ${!isOpen ? 'rotate-180' : ''}`}>
           <IconChevronLeft />
        </div>
      </button>

      {/* Logo Area */}
      <div className={`p-6 border-b border-gray-100 flex items-center gap-3 h-[88px] ${!isOpen && 'justify-center px-2'}`}>
        <div className="w-8 h-8 bg-gradient-to-tr from-[#FF6B00] to-[#E11D48] rounded-lg shadow-sm flex-shrink-0"></div>
        <h1 
          className={`font-bold text-xl text-gray-800 whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'
          }`}
        >
          Admin Panel
        </h1>
      </div>

      {/* Menu Links */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={!isOpen ? item.name : ""}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 font-medium group relative
              ${isActive
                  ? 'bg-orange-50 text-[#FF6B00]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
              ${!isOpen ? 'justify-center' : ''} 
              `
            }
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <span 
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isOpen ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-5 hidden'
              }`}
            >
              {item.name}
            </span>
            {!isOpen && (
               <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                  {item.name}
               </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout Area */}
      <div className="border-t border-gray-100 bg-white p-3 flex flex-col gap-2">
        
        {/* ✅ ทำให้กดคลิกไปหน้า Settings ได้ */}
        <div 
           onClick={() => navigate('/admin/settings')}
           className={`flex items-center gap-3 p-2 rounded-xl bg-gray-50 border border-gray-100 transition cursor-pointer hover:bg-gray-100 hover:border-gray-300 group ${!isOpen ? 'justify-center bg-transparent border-0 p-0' : ''}`}
           title="ตั้งค่าบัญชี"
        >
           {/* Avatar */}
           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0 group-hover:scale-105 transition">
              {userEmail.charAt(0).toUpperCase()}
           </div>

           {/* Text Detail */}
           <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}`}>
              <p className="text-xs font-bold text-gray-700 truncate max-w-[120px]">
                {fullName || userEmail} {/* ✅ โชว์ชื่อก่อน ถ้าไม่มีค่อยโชว์เมล */}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span className="text-[10px] text-gray-500 uppercase font-semibold">Admin</span>
              </div>
           </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title={!isOpen ? "ออกจากระบบ" : ""}
          className={`flex items-center gap-3 px-3 py-2 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition font-medium cursor-pointer ${!isOpen ? 'justify-center' : ''}`}
        >
          <span className="flex-shrink-0">🚪</span>
          <span 
             className={`whitespace-nowrap overflow-hidden transition-all duration-300 text-sm ${
               isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'
             }`}
          >
            ออกจากระบบ
          </span>
        </button>
      </div>
    </div>
  );
};