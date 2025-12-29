import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { SafeImage } from "../components/ui/UIComponents";

export const AdminEventDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State สำหรับ Filter และ Sort
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
      else fetchEvents();
    });
  }, [navigate]);

  const fetchEvents = async () => {
    setLoading(true);
    // ดึงข้อมูล events ทั้งหมด
    const { data, error } = await supabase
      .from("events")
      .select("*");

    if (error) console.error(error);
    else setEvents(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("ยืนยันที่จะลบอีเวนต์นี้?")) {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (!error) {
        setEvents(events.filter((e) => e.id !== id));
      } else {
        alert(error.message);
      }
    }
  };

  // ฟังก์ชัน Sort
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

  // Logic การกรอง + เรียงลำดับ
  const processedEvents = [...events]
    .filter((e) => {
        // 1. Search
        const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // 2. Status
        const currentStatus = e.status || 'published';
        const matchesStatus = filterStatus === 'all' || currentStatus === filterStatus;

        return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
        // 3. Sort
        const { key, direction } = sortConfig;
        let aValue = a[key];
        let bValue = b[key];

        if (key === 'updated_at') {
            aValue = new Date(a.updated_at || a.created_at || a.date).getTime();
            bValue = new Date(b.updated_at || b.created_at || b.date).getTime();
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

  // Helper แปลงวันที่
  const formatDate = (dateString, isShort = false) => {
    if (!dateString) return null; // เปลี่ยน return เป็น null เพื่อเช็คได้ง่ายขึ้น
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    
    return d.toLocaleDateString('th-TH', {
        day: 'numeric', month: isShort ? 'short' : 'long', year: '2-digit'
    });
  };

  // ✅ ฟังก์ชันช่วยแสดงช่วงวันที่ (Date Range Renderer)
  const renderEventDate = (event) => {
    const start = formatDate(event.date, true);
    const end = formatDate(event.end_date, true);

    // ถ้าไม่มีวันจบ หรือ วันจบตรงกับวันเริ่ม -> แสดงแค่วันเริ่ม
    if (!end || start === end) {
        return start || "-";
    }
    // ถ้ามีวันจบ -> แสดงแบบช่วง Start - End
    return (
        <span>
            {start} - {end}
        </span>
    );
  };

  const allCount = events.length;
  const publishedCount = events.filter(e => (e.status || 'published') === 'published').length;
  const draftCount = events.filter(e => e.status === 'draft').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              จัดการ Event ทั้งหมด
            </h1>
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

        {/* TABS + SEARCH */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto">
                <button 
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${filterStatus === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    ทั้งหมด ({allCount})
                </button>
                <button 
                    onClick={() => setFilterStatus('published')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition flex items-center gap-2 ${filterStatus === 'published' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> เผยแพร่ ({publishedCount})
                </button>
                <button 
                    onClick={() => setFilterStatus('draft')}
                    className={`px-4 py-1.5 rounded-md text-sm font-bold transition flex items-center gap-2 ${filterStatus === 'draft' ? 'bg-white text-gray-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="w-2 h-2 rounded-full bg-gray-400"></span> แบบร่าง ({draftCount})
                </button>
           </div>

           <div className="w-full md:w-auto relative min-w-[300px]">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input
                    type="text"
                    placeholder="ค้นหาชื่องาน..."
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
                  
                  <th 
                    className="p-4 font-bold w-[60px] cursor-pointer hover:bg-gray-100 transition select-none"
                    onClick={() => requestSort('id')}
                  >
                    ID {getSortIcon('id')}
                  </th>

                  <th className="p-4 font-bold w-[80px]">รูป</th>
                  
                  <th 
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition select-none"
                    onClick={() => requestSort('title')}
                  >
                    ชื่องาน / สถานที่ {getSortIcon('title')}
                  </th>

                  <th className="p-4 font-bold w-[160px]">วันจัดงาน</th>

                  <th 
                    className="p-4 font-bold w-[120px] text-center cursor-pointer hover:bg-gray-100 transition select-none"
                    onClick={() => requestSort('status')}
                  >
                    สถานะ {getSortIcon('status')}
                  </th>

                  <th 
                    className="p-4 font-bold w-[140px] text-center cursor-pointer hover:bg-gray-100 transition select-none"
                    onClick={() => requestSort('updated_at')}
                  >
                    แก้ไขล่าสุด {getSortIcon('updated_at')}
                  </th>

                  <th className="p-4 font-bold w-[180px] text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
                ) : processedEvents.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-400">ไม่พบอีเวนต์ตามเงื่อนไข</td></tr>
                ) : (
                  processedEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition group">
                      
                      <td className="p-4 text-gray-400 text-sm font-medium">#{event.id}</td>

                      <td className="p-4">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          <SafeImage
                            src={event.image_url}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-gray-900 line-clamp-1">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          📍 {event.location || "-"}
                        </p>
                      </td>

                      {/* ✅ 4. วันจัดงาน (โชว์แบบช่วงเวลา) */}
                      <td className="p-4">
                        <p className="text-[#FF6B00] font-bold text-sm whitespace-nowrap">
                          {renderEventDate(event)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {event.time || "ไม่ระบุเวลา"}
                        </p>
                      </td>

                      <td className="p-4 text-center">
                         {(event.status || 'published') === 'published' ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold inline-block border border-green-200">
                                Published
                            </span>
                         ) : (
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold inline-block border border-gray-200">
                                Draft
                            </span>
                         )}
                      </td>

                      <td className="p-4 text-center">
                         <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-gray-700">
                                {formatDate(event.updated_at || event.created_at || event.date, true) || "-"}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                                สร้าง: {formatDate(event.created_at || event.date, true) || "-"}
                            </span>
                         </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => window.open(`/event/${event.id}`, "_blank")}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 transition"
                            title="ดูหน้าเว็บจริง"
                          >
                            👁️
                          </button>

                          <button
                            onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                          >
                            แก้ไข
                          </button>

                          <button
                            onClick={() => handleDelete(event.id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
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
          
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-right text-xs text-gray-400">
              แสดง {processedEvents.length} จากทั้งหมด {allCount} งาน
          </div>
        </div>
      </div>
    </div>
  );
};