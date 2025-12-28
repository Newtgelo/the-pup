import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ news: 0, events: 0, cafes: 0 });

  useEffect(() => {
    // ดึงจำนวนข้อมูลมาโชว์เท่ๆ
    const fetchStats = async () => {
      const { count: newsCount } = await supabase
        .from("news")
        .select("*", { count: "exact", head: true });
      const { count: eventsCount } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true });
      const { count: cafesCount } = await supabase
        .from("cafes")
        .select("*", { count: "exact", head: true });
      setStats({
        news: newsCount || 0,
        events: eventsCount || 0,
        cafes: cafesCount || 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 ภาพรวมระบบ</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* การ์ดข่าวสาร */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl">
            📰
          </div>
          <div>
            <p className="text-gray-500 text-sm font-bold">ข่าวสารทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {stats.news}
            </h2>
          </div>
        </div>

        {/* การ์ดอีเวนต์ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl">
            📅
          </div>
          <div>
            <p className="text-gray-500 text-sm font-bold">อีเวนต์ทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {stats.events}
            </h2>
          </div>
        </div>

        {/* การ์ดคาเฟ่ */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-3xl">
            ☕
          </div>
          <div>
            <p className="text-gray-500 text-sm font-bold">คาเฟ่ทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900">
              {stats.cafes}
            </h2>
          </div>
        </div>
      </div>

      <div className="mt-8 p-8 bg-gray-100 rounded-2xl text-center text-gray-400 border-2 border-dashed border-gray-200">
        <p>กราฟสถิติผู้เข้าชม หรือข้อมูลอื่นๆ จะมาในอนาคต...</p>
      </div>
    </div>
  );
};
