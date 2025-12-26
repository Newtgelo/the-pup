import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { SafeImage } from '../components/ui/UIComponents';

export const AdminNewsDashboard = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]); // ✅ ใช้ชื่อ newsList ตามที่คุณต้องการ
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // เช็ค Login
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
      else fetchNews();
    });
  }, [navigate]);

  const fetchNews = async () => {
    setLoading(true);
    // ดึงข้อมูลข่าวทั้งหมด
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('id', { ascending: false });
      
    if (error) console.error(error);
    else setNewsList(data || []); // ✅ setNewsList
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("ยืนยันที่จะลบข่าวนี้?")) {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (!error) {
        setNewsList(newsList.filter(n => n.id !== id)); // ✅ อัปเดต list หลังลบ
      } else {
        alert(error.message);
      }
    }
  };

  // กรองคำค้นหา
  const filteredNews = newsList.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (n.category && n.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        {/* Header ส่วนบน (ที่คุณแก้มา) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            {/* ✅ ใช้โค้ดใหม่ของคุณตรงนี้ */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">จัดการ ข่าวสาร ทั้งหมด</h1>
                <p className="text-gray-500 text-sm mt-1">จัดการข่าวสารทั้งหมดในระบบ ({newsList.length} ข่าว)</p>
            </div>

            <button 
                onClick={() => navigate('/admin/create-news')} 
                className="bg-[#FF6B00] hover:bg-[#e65000] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
            >
                + เขียนข่าวใหม่
            </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex gap-4">
           <div className="flex-1 relative">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อข่าว..." 
                    className="w-full pl-10 border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#FF6B00] border-gray-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
           </div>
        </div>

        {/* Table แสดงผล */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-bold w-[60px]">ID</th>
                  <th className="p-4 font-bold">หัวข้อข่าว</th>
                  <th className="p-4 font-bold w-[120px]">หมวดหมู่</th>
                  <th className="p-4 font-bold w-[150px]">วันที่</th>
                  <th className="p-4 font-bold w-[200px] text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
                ) : filteredNews.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-400">ไม่พบข่าวสาร</td></tr>
                ) : (
                  filteredNews.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition group">
                      <td className="p-4 text-gray-400 text-sm">#{item.id}</td>
                      
                      {/* หัวข้อข่าว + รูปเล็ก */}
                      <td className="p-4">
                         <div className="flex items-center gap-3">
                             {item.image_url && (
                                 <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                     <SafeImage src={item.image_url} className="w-full h-full object-cover" />
                                 </div>
                             )}
                             <p className="font-bold text-gray-900 line-clamp-1">{item.title}</p>
                         </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-1 rounded-md bg-orange-50 text-[#FF6B00] text-xs font-bold border border-orange-100">
                            {item.category || "General"}
                        </span>
                      </td>

                      <td className="p-4 text-gray-500 text-sm">
                         {item.date || "-"}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                           <button 
                              onClick={() => window.open(`/news/${item.id}`, '_blank')}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 transition"
                              title="ดูหน้าเว็บจริง"
                           >
                              👁️
                           </button>
                           <button 
                              onClick={() => navigate(`/admin/edit-news/${item.id}`)}
                              className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-xs font-bold transition"
                           >
                              แก้ไข
                           </button>
                           <button 
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-bold transition"
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
          
          {/* Footer ของตาราง */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-right text-xs text-gray-400">
              แสดง {filteredNews.length} จากทั้งหมด {newsList.length} ข่าว
          </div>
        </div>
        
      </div>
    </div>
  );
};