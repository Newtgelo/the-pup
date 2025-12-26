import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (Fixed width) */}
      <AdminSidebar />

      {/* Content Area (Dynamic) */}
      {/* ml-64 คือเว้นซ้ายไว้เท่าความกว้าง Sidebar */}
      <div className="flex-1 ml-64">
        <div className="p-8">
           {/* Outlet คือจุดที่หน้า AdminEventDashboard, CreateEvent ฯลฯ จะมาโผล่ตรงนี้ */}
           <Outlet />
        </div>
      </div>
    </div>
  );
};