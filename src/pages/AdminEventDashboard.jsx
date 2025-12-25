import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { SafeImage } from '../components/ui/UIComponents'; // ✅ Import SafeImage ให้รูปไม่พัง

// Icon (ใช้ Emoji แทนตามที่ขอ หรือถ้ามี icon ก็เปลี่ยนได้ครับ)
// import { IconSearch, ... } from '../components/icons/Icons'; 

export const AdminEventDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // เช็ค Login ก่อน
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
      else fetchEvents();
    });
  }, [navigate]);

  const fetchEvents = async () => {
    setLoading(true);
    // ดึงข้อมูลมาทั้งหมด เรียงตาม ID ล่าสุด (หรือจะเรียงตามวันที่ก็ได้)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('id', { ascending: false });
      
    if (error) console.error(error);
    else setEvents(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("ยืนยันที่จะลบอีเวนต์นี้?")) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (!error) {
        setEvents(events.filter(e => e.id !== id));
      } else {
        alert(error.message);
      }
    }
  };

  // กรองคำค้นหา
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header ส่วนบน */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการ Event ทั้งหมด</h1>
            <p className="text-gray-500 text-sm">รวมรายการกิจกรรม คอนเสิร์ต และงานต่างๆ</p>
          </div>
          <button 
            onClick={() => navigate('/admin/create-event')} 
            className="bg-[#FF6B00] hover:bg-[#e65000] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
          >
            + เพิ่มอีเวนต์ใหม่
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
           <input 
              type="text" 
              placeholder="🔍 ค้นหาชื่องาน หรือ สถานที่..." 
              className="w-full border-none outline-none text-gray-600 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>

        {/* Table แสดงผล */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-bold w-[100px]">รูป</th>
                  <th className="p-4 font-bold">ชื่องาน / สถานที่</th>
                  <th className="p-4 font-bold w-[180px]">วัน-เวลา</th>
                  <th className="p-4 font-bold w-[120px]">ประเภท</th>
                  <th className="p-4 font-bold w-[220px] text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
                ) : filteredEvents.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">ไม่พบอีเวนต์</td></tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition group">
                      {/* 1. รูปภาพ */}
                      <td className="p-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <SafeImage src={event.image_url} className="w-full h-full object-cover" />
                        </div>
                      </td>

                      {/* 2. ชื่องาน / สถานที่ */}
                      <td className="p-4">
                        <p className="font-bold text-gray-900 line-clamp-1">{event.title}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            📍 {event.location || "-"}
                        </p>
                      </td>

                      {/* 3. วัน-เวลา */}
                      <td className="p-4">
                         {/* โชว์วันที่แบบบ้านๆ ไปก่อน หรือจะใช้ฟังก์ชัน format ก็ได้ */}
                         <p className="text-[#FF6B00] font-bold text-sm">
                            {event.date} 
                         </p>
                         <p className="text-xs text-gray-400 mt-1">
                            {event.time || "ไม่ระบุเวลา"}
                         </p>
                      </td>

                      {/* 4. ประเภท */}
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                            {event.category || "Event"}
                        </span>
                      </td>

                      {/* 5. ปุ่มจัดการ (เพิ่มปุ่มดูตรงนี้!) */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                           {/* 👁️ ปุ่มดู (เปิด Tab ใหม่) */}
                           <button 
                              onClick={() => window.open(`/event/${event.id}`, '_blank')}
                              className="bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              title="ดูหน้าเว็บจริง"
                           >
                              👁️ ดู
                           </button>

                           {/* ✏️ ปุ่มแก้ไข */}
                           <button 
                              onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                           >
                              แก้ไข
                           </button>

                           {/* 🗑️ ปุ่มลบ */}
                           <button 
                              onClick={() => handleDelete(event.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                           >
                              ลบ
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
};