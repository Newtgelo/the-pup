import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout = () => {
  // ✅ สร้าง State เก็บสถานะ: true = กางออก, false = พับเก็บ
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar: ส่ง state ไปให้มันรู้ตัวว่าต้องยืดหรือหด */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Content Area: ปรับ margin-left ตามสถานะ Sidebar */}
      {/* transition-all duration-300 ช่วยให้ตอนยืดหดดูลื่นไหล (Animation) */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <div className="p-8">
           <Outlet />
        </div>
      </div>
    </div>
  );
};