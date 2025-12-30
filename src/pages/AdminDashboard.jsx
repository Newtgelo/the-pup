import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { supabase } from "../supabase";

export const AdminDashboard = () => {
  const navigate = useNavigate(); 
  const [stats, setStats] = useState({ 
    news: { total: 0, draft: 0 }, 
    events: { total: 0, draft: 0, upcoming: 0, past: 0 }, 
    cafes: { total: 0, draft: 0 } 
  });
  const [recentActivity, setRecentActivity] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];

      // --- 1. ดึงข้อมูล STATS ---
      // 1.1 News
      const { count: newsTotal } = await supabase.from("news").select("*", { count: "exact", head: true });
      const { count: newsDraft } = await supabase.from("news").select("*", { count: "exact", head: true }).eq('status', 'draft');

      // 1.2 Events
      const { count: eventsTotal } = await supabase.from("events").select("*", { count: "exact", head: true });
      const { count: eventsDraft } = await supabase.from("events").select("*", { count: "exact", head: true }).eq('status', 'draft');
      const { count: eventsUpcoming } = await supabase.from("events").select("*", { count: "exact", head: true }).gte('date', today);
      const { count: eventsPast } = await supabase.from("events").select("*", { count: "exact", head: true }).lt('date', today);

      // 1.3 Cafes
      const { count: cafesTotal } = await supabase.from("cafes").select("*", { count: "exact", head: true });
      const { count: cafesDraft } = await supabase.from("cafes").select("*", { count: "exact", head: true }).eq('status', 'draft');

      setStats({
        news: { total: newsTotal || 0, draft: newsDraft || 0 },
        events: { total: eventsTotal || 0, draft: eventsDraft || 0, upcoming: eventsUpcoming || 0, past: eventsPast || 0 },
        cafes: { total: cafesTotal || 0, draft: cafesDraft || 0 },
      });

      // --- 2. RECENT ACTIVITY ---
      const { data: recentNews } = await supabase.from("news").select("id, title, status, updated_at, created_at").order("updated_at", { ascending: false }).limit(6);
      const { data: recentEvents } = await supabase.from("events").select("id, title, status, updated_at, created_at").order("updated_at", { ascending: false }).limit(6);
      const { data: recentCafes } = await supabase.from("cafes").select("id, name, status, updated_at, created_at").order("updated_at", { ascending: false }).limit(6);

      const getLatestDate = (item) => new Date(item.updated_at || item.created_at).getTime();

      const formatNews = (recentNews || []).map(item => ({ ...item, type: 'News', prefix: 'NE', name: item.title, timestamp: getLatestDate(item), path: '/admin/edit-news' }));
      const formatEvents = (recentEvents || []).map(item => ({ ...item, type: 'Event', prefix: 'EV', name: item.title, timestamp: getLatestDate(item), path: '/admin/edit-event' }));
      const formatCafes = (recentCafes || []).map(item => ({ ...item, type: 'Cafe', prefix: 'CF', name: item.name, timestamp: getLatestDate(item), path: '/admin/edit-cafe' }));

      const combined = [...formatNews, ...formatEvents, ...formatCafes]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 8);

      setRecentActivity(combined);
      setLoading(false);
    };

    fetchData();
  }, []);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'News': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">NEWS</span>;
      case 'Event': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-200">EVENT</span>;
      case 'Cafe': return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">CAFE</span>;
      default: return null;
    }
  };

  const timeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " ปีที่แล้ว";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " เดือนที่แล้ว";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " วันที่แล้ว";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " ชม. ที่แล้ว";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " นาทีที่แล้ว";
    return "เมื่อสักครู่";
  };

  return (
    <div>
      <div className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#E11D48] mb-6 rounded-full opacity-80"></div>
      
      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 ภาพรวมระบบ</h1>
            <p className="text-gray-500 text-sm mt-1">ยินดีต้อนรับกลับ, Admin 👋 วันนี้มีอะไรอัปเดตบ้าง?</p>
        </div>
        <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">ข้อมูลล่าสุดเมื่อ</p>
            <p className="text-sm font-bold text-gray-600">{new Date().toLocaleTimeString('th-TH')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* News Card */}
        <div onClick={() => navigate('/admin/news')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 transition hover:shadow-md hover:-translate-y-1 cursor-pointer group relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition duration-500">
             <span className="text-8xl">📰</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition z-10 shrink-0">
             📰
          </div>
          <div className="z-10 w-full">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">ข่าวสารทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.news.total}</h2>
            {stats.news.draft > 0 && (
                <p className="text-xs text-red-500 font-bold mt-1 bg-red-50 px-2 py-0.5 rounded-full inline-block border border-red-100">
                   ⚠️ รอเผยแพร่ {stats.news.draft}
                </p>
            )}
          </div>
        </div>

        {/* ✅ Event Card: Compact Layout (ยัดขวา) */}
        <div onClick={() => navigate('/admin/events')} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100 flex items-center justify-between gap-2 transition hover:shadow-md hover:-translate-y-1 cursor-pointer group relative overflow-hidden ring-1 ring-orange-100">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition duration-500">
             <span className="text-8xl">📅</span>
          </div>
          
          {/* ซ้าย: ไอคอน + จำนวนรวม */}
          <div className="flex items-center gap-4 z-10">
             <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition shrink-0">
                📅
             </div>
             <div>
                <p className="text-orange-600 text-xs font-bold uppercase tracking-wide">อีเวนต์ทั้งหมด</p>
                <h2 className="text-3xl font-extrabold text-gray-900 mt-0 leading-none">{stats.events.total}</h2>
                {stats.events.draft > 0 && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ รอ {stats.events.draft}</p>
                )}
             </div>
          </div>

          {/* ขวา: Split Stats เล็กๆ */}
          <div className="z-10 bg-white/60 backdrop-blur-sm p-2 rounded-xl border border-orange-100 text-right min-w-[90px] shadow-sm">
             <div className="mb-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">กำลังมา</span>
                <span className="text-lg font-bold text-green-600 leading-none">{stats.events.upcoming}</span>
             </div>
             <div className="w-full h-px bg-gray-200 my-1"></div>
             <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">จบแล้ว</span>
                <span className="text-lg font-bold text-gray-400 leading-none">{stats.events.past}</span>
             </div>
          </div>
        </div>

        {/* Cafe Card */}
        <div onClick={() => navigate('/admin/cafes')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 transition hover:shadow-md hover:-translate-y-1 cursor-pointer group relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:scale-110 transition duration-500">
             <span className="text-8xl">☕</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition z-10 shrink-0">
             ☕
          </div>
          <div className="z-10 w-full">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">คาเฟ่ทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.cafes.total}</h2>
            {stats.cafes.draft > 0 && (
                <p className="text-xs text-red-500 font-bold mt-1 bg-red-50 px-2 py-0.5 rounded-full inline-block border border-red-100">
                   ⚠️ รอเผยแพร่ {stats.cafes.draft}
                </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ... ส่วน Recent Activity และ Quick Actions คงเดิม ... */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                ⚡ อัปเดตล่าสุด
                <span className="text-xs font-normal text-gray-400 bg-white px-2 py-0.5 rounded-full border shadow-sm">Real-time Feed</span>
            </h3>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-wider">
                  <th className="p-4 font-semibold w-[100px]">ประเภท</th>
                  <th className="p-4 font-semibold">รายการ (Title)</th>
                  <th className="p-4 font-semibold w-[100px] text-center">สถานะ</th>
                  <th className="p-4 font-semibold w-[80px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
                ) : recentActivity.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-400">ยังไม่มีข้อมูลในระบบ</td></tr>
                ) : (
                  recentActivity.map((item, idx) => (
                    <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50/80 transition group">
                      <td className="p-4 align-top">
                        <div className="flex flex-col items-start gap-1">
                            {getTypeBadge(item.type)}
                            <span className="text-[10px] font-mono text-gray-400">{item.prefix}{item.id}</span>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-bold text-gray-800 line-clamp-1 group-hover:text-[#FF6B00] transition">{item.name}</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">🕒 {timeAgo(item.timestamp)}</div>
                      </td>
                      <td className="p-4 text-center align-top">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                            <span className={`w-2 h-2 rounded-full ${item.status === 'published' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            <span className="text-xs font-medium text-gray-600 capitalize">{item.status || 'draft'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right align-top">
                        <button onClick={() => navigate(`${item.path}/${item.id}`)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 transition" title="แก้ไข">✏️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
             <button onClick={() => window.location.reload()} className="text-xs text-gray-500 hover:text-gray-700 font-medium">↻ รีเฟรชข้อมูล</button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <h3 className="font-bold text-lg mb-1 relative z-10">🚀 เมนูลัด (Quick Actions)</h3>
            <p className="text-white/60 text-sm mb-6 relative z-10">สร้างคอนเทนต์ใหม่ได้ง่ายๆ</p>
            <div className="space-y-3 relative z-10">
              <button onClick={() => navigate('/admin/create-news')} className="w-full bg-white/10 hover:bg-white/20 border border-white/5 text-white p-3 rounded-xl flex items-center gap-3 transition group backdrop-blur-sm">
                <span className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition">📰</span><span className="font-bold text-sm">เขียนข่าวใหม่</span>
              </button>
              <button onClick={() => navigate('/admin/create-event')} className="w-full bg-white/10 hover:bg-white/20 border border-white/5 text-white p-3 rounded-xl flex items-center gap-3 transition group backdrop-blur-sm">
                <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition">📅</span><span className="font-bold text-sm">เพิ่มอีเวนต์ใหม่</span>
              </button>
              <button onClick={() => navigate('/admin/create-cafe')} className="w-full bg-white/10 hover:bg-white/20 border border-white/5 text-white p-3 rounded-xl flex items-center gap-3 transition group backdrop-blur-sm">
                <span className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition">☕</span><span className="font-bold text-sm">เพิ่มคาเฟ่ใหม่</span>
              </button>
            </div>
          </div>
          
          <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
             <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                    <h4 className="font-bold text-orange-800 text-sm mb-1">Admin Tips</h4>
                    <p className="text-xs text-orange-700/80 leading-relaxed">การ์ดด้านบนจะแจ้งเตือนเมื่อมี <b>Draft</b> ค้างอยู่ อย่าลืมกดเข้าไปตรวจสอบและเผยแพร่นะครับ</p>
                </div>
             </div>
          </div>

          <button onClick={() => window.open('/', '_blank')} className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#FF6B00] hover:text-[#FF6B00] hover:bg-orange-50 transition font-bold text-sm flex items-center justify-center gap-2">🌐 ไปยังหน้าเว็บไซต์หลัก</button>
        </div>

      </div>
    </div>
  );
};