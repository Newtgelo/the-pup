import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { supabase } from "../supabase";

export const AdminDashboard = () => {
  const navigate = useNavigate(); 
  const [stats, setStats] = useState({ news: 0, events: 0, cafes: 0 });
  const [recentActivity, setRecentActivity] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // เช็ค User เพื่อเอาชื่อมาโชว์ (Optional)
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

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

      // 2. ดึงรายการล่าสุด (ดึง field สำคัญมาให้ครบ: id, status, updated_at)
      // ดึงเผื่อมาเยอะหน่อย แล้วค่อยมา sort รวมกัน
      const { data: recentNews } = await supabase.from("news").select("id, title, status, updated_at, created_at").order("updated_at", { ascending: false }).limit(6);
      const { data: recentEvents } = await supabase.from("events").select("id, title, status, updated_at, created_at").order("updated_at", { ascending: false }).limit(6);
      const { data: recentCafes } = await supabase.from("cafes").select("id, name, status, updated_at, created_at").order("updated_at", { ascending: false }).limit(6);

      // Helper: หาเวลาที่ใหม่ที่สุด (updated หรือ created)
      const getLatestDate = (item) => new Date(item.updated_at || item.created_at).getTime();

      // แปลงข้อมูลให้เป็น Format เดียวกัน
      const formatNews = (recentNews || []).map(item => ({ 
          ...item, type: 'News', prefix: 'NE', name: item.title, timestamp: getLatestDate(item), path: '/admin/edit-news' 
      }));
      const formatEvents = (recentEvents || []).map(item => ({ 
          ...item, type: 'Event', prefix: 'EV', name: item.title, timestamp: getLatestDate(item), path: '/admin/edit-event' 
      }));
      const formatCafes = (recentCafes || []).map(item => ({ 
          ...item, type: 'Cafe', prefix: 'CF', name: item.name, timestamp: getLatestDate(item), path: '/admin/edit-cafe' 
      }));

      // รวมร่าง + เรียงตามเวลาล่าสุดจริงๆ (Timestamp)
      const combined = [...formatNews, ...formatEvents, ...formatCafes]
        .sort((a, b) => b.timestamp - a.timestamp) // เรียงจากเวลาล่าสุด
        .slice(0, 8); // ตัดเอาแค่ 8 รายการ

      setRecentActivity(combined);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Helper: สี Badge ประเภท
  const getTypeBadge = (type) => {
    switch (type) {
      case 'News': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">NEWS</span>;
      case 'Event': return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold border border-orange-200">EVENT</span>;
      case 'Cafe': return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">CAFE</span>;
      default: return null;
    }
  };

  // Helper: เวลาแบบ "2 ชม. ที่แล้ว" (TimeAgo)
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
      {/* Header พร้อม Gradient เล็กๆ ด้านบน */}
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

      {/* --- SECTION 1: STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div onClick={() => navigate('/admin/news')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md hover:-translate-y-1 cursor-pointer group">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl group-hover:bg-blue-100 transition">📰</div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">ข่าวสารทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900">{stats.news}</h2>
          </div>
        </div>

        <div onClick={() => navigate('/admin/events')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md hover:-translate-y-1 cursor-pointer group">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl group-hover:bg-orange-100 transition">📅</div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">อีเวนต์ทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900">{stats.events}</h2>
          </div>
        </div>

        <div onClick={() => navigate('/admin/cafes')} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition hover:shadow-md hover:-translate-y-1 cursor-pointer group">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl group-hover:bg-purple-100 transition">☕</div>
          <div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-wide">คาเฟ่ทั้งหมด</p>
            <h2 className="text-3xl font-extrabold text-gray-900">{stats.cafes}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- SECTION 2: RECENT ACTIVITY (Feed รวมมิตร) --- */}
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
                      
                      {/* 1. ประเภท + ID */}
                      <td className="p-4 align-top">
                        <div className="flex flex-col items-start gap-1">
                            {getTypeBadge(item.type)}
                            <span className="text-[10px] font-mono text-gray-400">
                                {item.prefix}{item.id}
                            </span>
                        </div>
                      </td>

                      {/* 2. ชื่อรายการ + เวลา */}
                      <td className="p-4 align-top">
                        <div className="font-bold text-gray-800 line-clamp-1 group-hover:text-[#FF6B00] transition">
                            {item.name}
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            🕒 {timeAgo(item.timestamp)}
                        </div>
                      </td>

                      {/* 3. สถานะ (จุดสี) */}
                      <td className="p-4 text-center align-top">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50 border border-gray-100">
                            <span className={`w-2 h-2 rounded-full ${item.status === 'published' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            <span className="text-xs font-medium text-gray-600 capitalize">
                                {item.status || 'draft'}
                            </span>
                        </div>
                      </td>

                      {/* 4. ปุ่มแก้ไข */}
                      <td className="p-4 text-right align-top">
                        <button 
                          onClick={() => navigate(`${item.path}/${item.id}`)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 transition"
                          title="แก้ไข"
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
             <button onClick={() => window.location.reload()} className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                ↻ รีเฟรชข้อมูล
             </button>
          </div>
        </div>

        {/* --- SECTION 3: QUICK ACTIONS (ขวา) --- */}
        <div className="flex flex-col gap-6">
          
          {/* กล่องเมนูลัด */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <h3 className="font-bold text-lg mb-1 relative z-10">🚀 เมนูลัด (Quick Actions)</h3>
            <p className="text-white/60 text-sm mb-6 relative z-10">สร้างคอนเทนต์ใหม่ได้ง่ายๆ</p>
            
            <div className="space-y-3 relative z-10">
              <button 
                onClick={() => navigate('/admin/create-news')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/5 text-white p-3 rounded-xl flex items-center gap-3 transition group backdrop-blur-sm"
              >
                <span className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition">📰</span>
                <span className="font-bold text-sm">เขียนข่าวใหม่</span>
              </button>

              <button 
                onClick={() => navigate('/admin/create-event')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/5 text-white p-3 rounded-xl flex items-center gap-3 transition group backdrop-blur-sm"
              >
                <span className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition">📅</span>
                <span className="font-bold text-sm">เพิ่มอีเวนต์ใหม่</span>
              </button>

              <button 
                onClick={() => navigate('/admin/create-cafe')}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/5 text-white p-3 rounded-xl flex items-center gap-3 transition group backdrop-blur-sm"
              >
                <span className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-lg shadow-lg group-hover:scale-110 transition">☕</span>
                <span className="font-bold text-sm">เพิ่มคาเฟ่ใหม่</span>
              </button>
            </div>
          </div>
          
          {/* กล่อง Tips */}
          <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
             <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                    <h4 className="font-bold text-orange-800 text-sm mb-1">Admin Tips</h4>
                    <p className="text-xs text-orange-700/80 leading-relaxed">
                        คุณสามารถค้นหาข้อมูลด้วยรหัส <b>NE, EV, CF</b> ในหน้าจัดการแต่ละประเภทได้แล้วนะ!
                    </p>
                </div>
             </div>
          </div>

          {/* ปุ่มไปหน้าบ้าน */}
          <button 
            onClick={() => window.open('/', '_blank')}
            className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#FF6B00] hover:text-[#FF6B00] hover:bg-orange-50 transition font-bold text-sm flex items-center justify-center gap-2"
          >
            🌐 ไปยังหน้าเว็บไซต์หลัก
          </button>
        </div>

      </div>
    </div>
  );
};