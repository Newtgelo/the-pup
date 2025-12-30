import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { SafeImage } from "../components/ui/UIComponents";
import Swal from 'sweetalert2'; // ✅ Import SweetAlert2

export const AdminEventDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ เปลี่ยน Default Filter เป็น 'all' หรือ 'upcoming' ก็ได้ ตามสะดวก
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' }); // เปลี่ยน default sort เป็นวันที่จัดงาน

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
      else fetchEvents();
    });
  }, [navigate]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*");

    if (error) console.error(error);
    else setEvents(data || []);
    setLoading(false);
  };

  // ✅ ฟังก์ชันลบแบบใหม่ (SweetAlert2)
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณต้องการลบอีเวนต์นี้ใช่ไหม? ข้อมูลจะหายไปถาวร",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { error } = await supabase.from("events").delete().eq("id", id);
        
        if (!error) {
          setEvents(events.filter((e) => e.id !== id));
          Swal.fire(
            'ลบเรียบร้อย!',
            'อีเวนต์ถูกลบออกจากระบบแล้ว',
            'success'
          );
        } else {
          Swal.fire('Error', error.message, 'error');
        }
      }
    });
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return <span className="text-gray-300 ml-1">⇅</span>;
    return sortConfig.direction === 'asc' ? <span className="text-[#FF6B00] ml-1">↑</span> : <span className="text-[#FF6B00] ml-1">↓</span>;
  };

  // ✅ Helper: หาวันที่ปัจจุบัน (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // ✅ Logic การกรอง (ปรับปรุงใหม่ รองรับ Upcoming / Past)
  const processedEvents = [...events]
    .filter((e) => {
        const lowerTerm = searchTerm.toLowerCase().trim();
        
        // 1. Search Logic
        let idToSearch = lowerTerm;
        if (lowerTerm.startsWith('ev')) {
            idToSearch = lowerTerm.replace('ev', '');
        }
        const matchesSearch = e.title.toLowerCase().includes(lowerTerm) ||
                              (e.location && e.location.toLowerCase().includes(lowerTerm)) ||
                              (idToSearch !== '' && e.id.toString().includes(idToSearch));
        
        // 2. Status & Date Filter Logic
        const status = e.status || 'published'; // ถ้าไม่มี status ให้ถือว่าเป็น published
        let matchesStatus = false;

        if (filterStatus === 'all') {
            matchesStatus = true;
        } else if (filterStatus === 'draft') {
            matchesStatus = status === 'draft';
        } else if (filterStatus === 'upcoming') {
            // Upcoming: ต้อง Published และ วันที่ >= วันนี้
            matchesStatus = status === 'published' && e.date >= today;
        } else if (filterStatus === 'past') {
            // Past: ต้อง Published และ วันที่ < วันนี้
            matchesStatus = status === 'published' && e.date < today;
        }

        return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
        const { key, direction } = sortConfig;
        let aValue = a[key];
        let bValue = b[key];

        if (key === 'updated_at' || key === 'date') {
            aValue = new Date(a[key] || a.created_at).getTime();
            bValue = new Date(b[key] || b.created_at).getTime();
        } 
        else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        else if (key === 'status') {
             aValue = a.status || 'published';
             bValue = b.status || 'published';
        }

        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });

  const formatDate = (dateString, isShort = false) => {
    if (!dateString) return null; 
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('th-TH', {
        day: 'numeric', month: isShort ? 'short' : 'long', year: '2-digit'
    });
  };

  const renderEventDate = (event) => {
    const start = formatDate(event.date, true);
    const end = formatDate(event.end_date, true);
    if (!end || start === end) return start || "-";
    return <span>{start} - {end}</span>;
  };

  // ✅ คำนวณจำนวนแต่ละ Tab
  const allCount = events.length;
  const draftCount = events.filter(e => e.status === 'draft').length;
  // Upcoming: Published + วันที่ >= วันนี้
  const upcomingCount = events.filter(e => (e.status || 'published') === 'published' && e.date >= today).length;
  // Past: Published + วันที่ < วันนี้
  const pastCount = events.filter(e => (e.status || 'published') === 'published' && e.date < today).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">จัดการ Event ทั้งหมด</h1>
            <p className="text-gray-500 text-sm mt-1">
              รวมรายการกิจกรรม คอนเสิร์ต และงานต่างๆ ({allCount} งาน)
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/create-event")}
            className="bg-[#FF6B00] hover:bg-[#e65000] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
          >
            + เพิ่มอีเวนต์ใหม่
          </button>
        </div>

        {/* ✅ TABS ใหม่: All / Upcoming / Past / Draft */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto overflow-x-auto max-w-full">
                <button 
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition whitespace-nowrap ${filterStatus === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    ทั้งหมด ({allCount})
                </button>
                <button 
                    onClick={() => setFilterStatus('upcoming')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${filterStatus === 'upcoming' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> กำลังจะถึง ({upcomingCount})
                </button>
                <button 
                    onClick={() => setFilterStatus('past')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${filterStatus === 'past' ? 'bg-white text-gray-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span> จบแล้ว ({pastCount})
                </button>
                <button 
                    onClick={() => setFilterStatus('draft')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${filterStatus === 'draft' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span> แบบร่าง ({draftCount})
                </button>
           </div>

           <div className="w-full md:w-auto relative min-w-[300px]">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input
                    type="text"
                    placeholder="ค้นหาชื่องาน หรือ รหัส (เช่น EV15)..."
                    className="w-full pl-10 border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#FF6B00] border-gray-200 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
           </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-bold w-[90px] cursor-pointer hover:bg-gray-100 transition select-none" onClick={() => requestSort('id')}>ID (EV) {getSortIcon('id')}</th>
                  <th className="p-4 font-bold w-[80px]">รูป</th>
                  <th className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition select-none" onClick={() => requestSort('title')}>ชื่องาน / สถานที่ {getSortIcon('title')}</th>
                  <th className="p-4 font-bold w-[160px] cursor-pointer hover:bg-gray-100 transition select-none" onClick={() => requestSort('date')}>วันจัดงาน {getSortIcon('date')}</th>
                  <th className="p-4 font-bold w-[120px] text-center cursor-pointer hover:bg-gray-100 transition select-none" onClick={() => requestSort('status')}>สถานะ {getSortIcon('status')}</th>
                  <th className="p-4 font-bold w-[140px] text-center cursor-pointer hover:bg-gray-100 transition select-none" onClick={() => requestSort('updated_at')}>แก้ไขล่าสุด {getSortIcon('updated_at')}</th>
                  <th className="p-4 font-bold w-[180px] text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
                ) : processedEvents.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-400">ไม่พบอีเวนต์ตามเงื่อนไข</td></tr>
                ) : (
                  processedEvents.map((event) => {
                    // ✅ เช็คว่าจบไปแล้วหรือยัง
                    const isPast = event.date < today;
                    const isDraft = event.status === 'draft';

                    return (
                        <tr key={event.id} className={`hover:bg-gray-50 transition group ${isPast && !isDraft ? 'opacity-75 bg-gray-50/50' : ''}`}>
                        
                        <td className="p-4 text-gray-400 text-sm font-medium font-mono">EV{event.id}</td>

                        <td className="p-4">
                            <div className={`w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 ${isPast ? 'grayscale' : ''}`}>
                            <SafeImage src={event.image_url} className="w-full h-full object-cover" />
                            </div>
                        </td>

                        <td className="p-4">
                            <p className={`font-bold line-clamp-1 ${isPast ? 'text-gray-600' : 'text-gray-900'}`}>{event.title}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">📍 {event.location || "-"}</p>
                        </td>

                        <td className="p-4">
                            <p className={`font-bold text-sm whitespace-nowrap ${isPast ? 'text-gray-500' : 'text-[#FF6B00]'}`}>
                                {renderEventDate(event)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{event.time || "ไม่ระบุเวลา"}</p>
                        </td>

                        {/* ✅ Badge Logic: Draft / Published / Ended */}
                        <td className="p-4 text-center">
                            {isDraft ? (
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold inline-block border border-gray-200">
                                    Draft
                                </span>
                            ) : isPast ? (
                                <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs font-bold inline-block border border-gray-300">
                                    Ended
                                </span>
                            ) : (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold inline-block border border-green-200">
                                    Published
                                </span>
                            )}
                        </td>

                        <td className="p-4 text-center">
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-bold text-gray-700">{formatDate(event.updated_at || event.created_at, true) || "-"}</span>
                                <span className="text-[10px] text-gray-400 mt-0.5">สร้าง: {formatDate(event.created_at, true) || "-"}</span>
                            </div>
                        </td>

                        <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                            <button onClick={() => window.open(`/event/${event.id}`, "_blank")} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 transition" title="ดูหน้าเว็บจริง">👁️</button>
                            <button onClick={() => navigate(`/admin/edit-event/${event.id}`)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition">แก้ไข</button>
                            
                            {/* ✅ เรียกใช้ handleDelete ใหม่ */}
                            <button onClick={() => handleDelete(event.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition">ลบ</button>
                            </div>
                        </td>
                        </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-right text-xs text-gray-400">
              แสดง {processedEvents.length} จากทั้งหมด {allCount} งาน
          </div>
        </div>
      </div>
    </div>
  );
};