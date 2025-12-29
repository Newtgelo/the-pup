import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

// ไอคอนลูกศรสำหรับปุ่มพับ (SVG)
const IconChevronLeft = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>
);

// รับ props isOpen และ setIsOpen มาจาก AdminLayout
export const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

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
      
      {/* ✅ ปุ่ม Toggle พับ/กาง (ลอยอยู่ตรงเส้นขอบ) */}
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
        {/* Logo Icon */}
        <div className="w-8 h-8 bg-gradient-to-tr from-[#FF6B00] to-[#E11D48] rounded-lg shadow-sm flex-shrink-0"></div>
        
        {/* Text Logo (ซ่อนเมื่อพับ) */}
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
            title={!isOpen ? item.name : ""} // Show tooltip when collapsed
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
            
            {/* Text Menu (ซ่อนเมื่อพับ) */}
            <span 
              className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isOpen ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-5 hidden'
              }`}
            >
              {item.name}
            </span>

            {/* (Optional) Tooltip ลอยข้างๆ ตอนพับ แบบสวยงาม */}
            {!isOpen && (
               <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                  {item.name}
               </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Area */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <button
          onClick={handleLogout}
          title={!isOpen ? "ออกจากระบบ" : ""}
          className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition font-medium cursor-pointer ${!isOpen ? 'justify-center' : ''}`}
        >
          <span className="flex-shrink-0">🚪</span>
          <span 
             className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
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