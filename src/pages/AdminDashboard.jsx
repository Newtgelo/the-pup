import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { IconChevronRight, IconBriefcase } from '../components/icons/Icons'; // เช็ค path icon ดีๆ นะครับ

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // ดึงข่าวทั้งหมดมาโชว์
  const fetchNews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('news')
      .select('id, title, category, date, created_at')
      .order('id', { ascending: false }); // ข่าวใหม่สุดขึ้นก่อน
    
    if (data) setNewsList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // ฟังก์ชันลบข่าว
  const handleDelete = async (id) => {
    if (window.confirm("แน่ใจนะว่าจะลบข่าวนี้? ลบแล้วกู้ไม่ได้นะ!")) {
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (!error) {
            alert("ลบเรียบร้อย!");
            fetchNews(); // รีโหลดตารางใหม่
        } else {
            alert("ลบไม่สำเร็จ: " + error.message);
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">🛠️ Admin Dashboard</h1>
            <button 
                onClick={() => navigate('/admin/create-news')}
                className="bg-[#FF6B00] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#e65000] transition"
            >
                + เขียนข่าวใหม่
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="p-4 font-bold text-gray-600 w-20">ID</th>
                        <th className="p-4 font-bold text-gray-600">หัวข้อข่าว</th>
                        <th className="p-4 font-bold text-gray-600 w-32">หมวดหมู่</th>
                        <th className="p-4 font-bold text-gray-600 w-32">วันที่</th>
                        <th className="p-4 font-bold text-gray-600 w-48 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-400">กำลังโหลด...</td></tr>
                    ) : newsList.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-gray-400">ยังไม่มีข่าวเลย</td></tr>
                    ) : (
                        newsList.map((news) => (
                            <tr key={news.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="p-4 text-gray-500">#{news.id}</td>
                                <td className="p-4 font-medium text-gray-900">{news.title}</td>
                                <td className="p-4"><span className="px-2 py-1 rounded bg-orange-100 text-[#FF6B00] text-xs font-bold">{news.category}</span></td>
                                <td className="p-4 text-gray-500 text-sm">{news.date}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    {/* ปุ่มดู */}
                                    <button onClick={() => navigate(`/news/${news.id}`)} className="p-2 text-gray-400 hover:text-blue-500" title="ดูหน้าเว็บจริง">
                                        👁️
                                    </button>
                                    {/* ปุ่มแก้ไข */}
                                    <button onClick={() => navigate(`/admin/edit-news/${news.id}`)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition">
                                        แก้ไข
                                    </button>
                                    {/* ปุ่มลบ */}
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
      </div>
    </div>
  );
};