import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ เพิ่ม useNavigate
import { supabase } from "../supabase";

export const AdminDashboard = () => {
  const navigate = useNavigate(); // ✅ ใช้สำหรับเปลี่ยนหน้า
  const [stats, setStats] = useState({ news: 0, events: 0, cafes: 0 });
  const [recentActivity, setRecentActivity] = useState([]); // ✅ State เก็บรายการล่าสุด
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. ดึงจำนวน (Stats)
      const { count: newsCount } = await supabase.from("news").select("*", { count: "exact", head: true });
      const { count: eventsCount } = await supabase.from("events").select("*", { count: "exact", head: true });
      const { count: cafesCount } = await supabase.from("cafes").select("*", { count: "exact", head: true });

      setStats({
        news: newsCount || 0,
        events: eventsCount || 0,
        cafes: cafesCount || 0,
      });

      // 2. ดึงรายการล่าสุด (Recent Activity) - ดึงมาอย่างละ 5 ตัว แล้วค่อยมารวมกัน
      const { data: recentNews } = await supabase.from("news").select("id, title, date").order("id", { ascending: false }).limit(5);
      const { data: recentEvents } = await supabase.from("events").select("id, title, date").order("id", { ascending: false }).limit(5);
      const { data: recentCafes } = await supabase.from("cafes").select("id, name, created_at").order("id", { ascending: false }).limit(5);

      // แปลงข้อมูลให้เป็น Format เดียวกันเพื่อแสดงผล
      const formatNews = (recentNews || []).map(item => ({ ...item, type: 'News', name: item.title, date: item.date, path: '/admin/edit-news' }));
      const formatEvents = (recentEvents || []).map(item => ({ ...item, type: 'Event', name: item.title, date: item.date, path: '/admin/edit-event' }));
      const formatCafes = (recentCafes || []).map(item => ({ ...item, type: 'Cafe', name: item.name, date: item.created_at?.split('T')[0] || '-', path: '/admin/edit-cafe' }));

      // รวมร่าง + เรียงตาม ID ใหม่ (เพราะเราไม่มี field created_at กลาง ใช้ ID แทนความล่าสุดได้ระดับหนึ่ง)
      // หรือถ้าจะให้แม่นยำต้องสร้าง field created_at ในทุก table แต่ตอนนี้เอา ID ไปก่อนครับ
      const combined = [...formatNews, ...formatEvents, ...formatCafes]
        .sort((a, b) => b.id - a.id) // เรียงจาก id มากไปน้อย (ใหม่สุดอยู่บน)
        .slice(0, 10); // ตัดเอาแค่ 10 รายการล่าสุด

      setRecentActivity(combined);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Helper สำหรับเลือกสี Badge ตามประเภท
  const getTypeColor = (type) => {
    switch (type) {
      case 'News': return 'bg-blue-100 text-blue-700';
      case 'Event': return 'bg-orange-100 text-orange-700';
      case 'Cafe': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 ภาพรวมระบบ</h1>

      {/* --- SECTION 1: STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl">📰</div>
          <div>
            <p className="text-gray-500 text-sm font-bold">ข่าวสารทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900">{stats.news}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl">📅</div>
          <div>
            <p className="text-gray-500 text-sm font-bold">อีเวนต์ทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900">{stats.events}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-3xl">☕</div>
          <div>
            <p className="text-gray-500 text-sm font-bold">คาเฟ่ทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900">{stats.cafes}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- SECTION 2: RECENT ACTIVITY (ซ้าย - ใหญ่) --- */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-800">🕒 รายการที่เพิ่มล่าสุด</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">ประเภท</th>
                  <th className="p-4 font-semibold">ชื่อหัวข้อ / ร้าน</th>
                  <th className="p-4 font-semibold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="3" className="p-6 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
                ) : recentActivity.length === 0 ? (
                  <tr><td colSpan="3" className="p-6 text-center text-gray-400">ยังไม่มีข้อมูลในระบบ</td></tr>
                ) : (
                  recentActivity.map((item, idx) => (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50/80 transition">
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-gray-800 line-clamp-1">{item.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{item.date}</div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => navigate(`${item.path}/${item.id}`)}
                          className="text-sm text-gray-500 hover:text-blue-600 font-bold transition"
                        >
                          แก้ไข
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- SECTION 3: QUICK ACTIONS (ขวา - เล็ก) --- */}
        <div className="flex flex-col gap-4">
          <div className="bg-gradient-to-br from-[#1E293B] to-[#334155] rounded-2xl p-6 text-white shadow-md">
            <h3 className="font-bold text-lg mb-1">🚀 เมนูลัด (Quick Actions)</h3>
            <p className="text-white/70 text-sm mb-6">สร้างคอนเทนต์ใหม่ได้ง่ายๆ ที่นี่</p>
            
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/admin/create-news')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white p-3 rounded-xl flex items-center gap-3 transition group"
              >
                <span className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition">📰</span>
                <span className="font-bold text-sm">เขียนข่าวใหม่</span>
              </button>

              <button 
                onClick={() => navigate('/admin/create-event')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white p-3 rounded-xl flex items-center gap-3 transition group"
              >
                <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition">📅</span>
                <span className="font-bold text-sm">เพิ่มอีเวนต์ใหม่</span>
              </button>

              <button 
                onClick={() => navigate('/admin/create-cafe')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white p-3 rounded-xl flex items-center gap-3 transition group"
              >
                <span className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition">☕</span>
                <span className="font-bold text-sm">เพิ่มคาเฟ่ใหม่</span>
              </button>
            </div>
          </div>
          
          {/* กล่องเล็กๆ แสดง Tips หรือ Status เพิ่มเติม (Optional) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
             <h4 className="font-bold text-gray-800 text-sm mb-2">💡 Tips</h4>
             <p className="text-xs text-gray-500 leading-relaxed">
               ตรวจสอบข้อมูลให้ถูกต้องก่อนกด <b>"เผยแพร่"</b> เสมอ เพื่อให้หน้าบ้านแสดงผลได้สมบูรณ์ที่สุด
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};