import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 🔍 State สำหรับค้นหาและกรอง
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
      } else {
        setIsAuthenticated(true);
        fetchNews();
      }
    };
    checkUser();
  }, [navigate]);

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from('news')
      .select('id, title, category, date, created_at')
      .order('id', { ascending: false });
    
    if (data) setNewsList(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("แน่ใจนะว่าจะลบข่าวนี้? ลบแล้วกู้ไม่ได้นะ!")) {
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (!error) {
            alert("ลบเรียบร้อย!");
            fetchNews();
        } else {
            alert("ลบไม่สำเร็จ: " + error.message);
        }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // 🔥 ฟังก์ชันกรองข้อมูล (ทำงาน Real-time)
  const filteredNews = newsList.filter(news => {
    // 1. กรองจากชื่อข่าว (Search)
    const matchesSearch = news.title.toLowerCase().includes(searchTerm.toLowerCase());
    // 2. กรองจากหมวดหมู่ (Category)
    const matchesCategory = selectedCategory === 'All' || news.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading || !isAuthenticated) {
      return <div className="min-h-screen flex items-center justify-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header ส่วนบน */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">🛠️ Admin Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">จัดการข่าวสารทั้งหมดในระบบ ({newsList.length} ข่าว)</p>
            </div>
            
            <div className="flex gap-3">
                <button 
                    onClick={() => navigate('/admin/create-news')}
                    className="bg-[#FF6B00] text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-[#e65000] transition flex items-center gap-2"
                >
                    <span>+</span> เขียนข่าวใหม่
                </button>
                <button 
                    onClick={handleLogout}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-50 transition"
                >
                    ออกจากระบบ
                </button>
            </div>
        </div>

        {/* 🔍 ส่วน Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
                <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อข่าว..." 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <select 
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] cursor-pointer min-w-[150px]"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
            >
                <option value="All">ทุกหมวดหมู่</option>
                <option value="K-pop">K-pop</option>
                <option value="T-pop">T-pop</option>
                <option value="J-pop">J-pop</option>
                <option value="Others">Others</option>
            </select>
        </div>

        {/* ตารางแสดงผล */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="p-4 font-bold text-gray-600 w-20 hidden md:table-cell">ID</th>
                        <th className="p-4 font-bold text-gray-600">หัวข้อข่าว</th>
                        <th className="p-4 font-bold text-gray-600 w-32 hidden sm:table-cell">หมวดหมู่</th>
                        <th className="p-4 font-bold text-gray-600 w-32 hidden md:table-cell">วันที่</th>
                        <th className="p-4 font-bold text-gray-600 w-48 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredNews.length === 0 ? (
                        <tr><td colSpan="5" className="p-12 text-center text-gray-400">
                            {searchTerm ? `ไม่พบข่าวที่ชื่อว่า "${searchTerm}"` : "ยังไม่มีข่าวเลย"}
                        </td></tr>
                    ) : (
                        filteredNews.map((news) => (
                            <tr key={news.id} className="border-b border-gray-100 hover:bg-gray-50 transition group">
                                <td className="p-4 text-gray-500 hidden md:table-cell">#{news.id}</td>
                                <td className="p-4 font-medium text-gray-900">
                                    <div className="line-clamp-1">{news.title}</div>
                                    {/* Mobile Only View */}
                                    <div className="md:hidden text-xs text-gray-400 mt-1 flex gap-2">
                                        <span>{news.date}</span>
                                        <span className="text-[#FF6B00]">{news.category}</span>
                                    </div>
                                </td>
                                <td className="p-4 hidden sm:table-cell">
                                    <span className="px-2 py-1 rounded bg-orange-100 text-[#FF6B00] text-xs font-bold">{news.category}</span>
                                </td>
                                <td className="p-4 text-gray-500 text-sm hidden md:table-cell">{news.date}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <button onClick={() => window.open(`/news/${news.id}`, '_blank')} className="p-2 text-gray-400 hover:text-blue-500 transition" title="ดูหน้าเว็บจริง">
                                        👁️
                                    </button>
                                    <button onClick={() => navigate(`/admin/edit-news/${news.id}`)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition">
                                        แก้ไข
                                    </button>
                                    <button onClick={() => handleDelete(news.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition">
                                        ลบ
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        
        {/* Footer Summary */}
        <div className="mt-4 text-right text-sm text-gray-400">
             แสดง {filteredNews.length} จากทั้งหมด {newsList.length} ข่าว
        </div>
      </div>
    </div>
  );
};