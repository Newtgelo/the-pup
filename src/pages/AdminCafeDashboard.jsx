import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { SafeImage } from '../components/ui/UIComponents';

export const AdminCafeDashboard = () => {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
      else fetchCafes();
    });
  }, [navigate]);

  const fetchCafes = async () => {
    setLoading(true);
    // ดึงข้อมูลคาเฟ่ (เรียงตาม ID ล่าสุด)
    const { data, error } = await supabase
      .from('cafes')
      .select('*')
      .order('id', { ascending: false });
      
    if (error) console.error(error);
    else setCafes(data || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("ยืนยันที่จะลบคาเฟ่นี้?")) {
      const { error } = await supabase.from('cafes').delete().eq('id', id);
      if (!error) {
        setCafes(cafes.filter(c => c.id !== id));
      } else {
        alert(error.message);
      }
    }
  };

  const filteredCafes = cafes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.location_text && c.location_text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">จัดการ คาเฟ่/สถานที่</h1>
                <p className="text-gray-500 text-sm mt-1">ร้านค้าและสถานที่จัดงานทั้งหมด ({cafes.length} แห่ง)</p>
            </div>
            <button 
                onClick={() => navigate('/admin/create-cafe')} 
                className="bg-[#FF6B00] hover:bg-[#e65000] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
            >
                + เพิ่มคาเฟ่ใหม่
            </button>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex gap-4">
           <div className="flex-1 relative">
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                <input 
                    type="text" 
                    placeholder="ค้นหาชื่อคาเฟ่ หรือ สถานที่..." 
                    className="w-full pl-10 border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-[#FF6B00] border-gray-200"
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
                  <th className="p-4 font-bold w-[80px]">รูปปก</th>
                  <th className="p-4 font-bold">ชื่อร้าน / สถานที่</th>
                  <th className="p-4 font-bold w-[200px]">รายละเอียดสังเขป</th>
                  <th className="p-4 font-bold w-[200px] text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
                ) : filteredCafes.length === 0 ? (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-400">ไม่พบข้อมูลคาเฟ่</td></tr>
                ) : (
                  filteredCafes.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                         <div className="w-16 h-12 rounded bg-gray-100 overflow-hidden border border-gray-200">
                             <SafeImage src={item.image_url} className="w-full h-full object-cover" />
                         </div>
                      </td>
                      <td className="p-4">
                         <p className="font-bold text-gray-900">{item.name}</p>
                         <p className="text-xs text-gray-500 mt-0.5">📍 {item.location_text}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                         <p className="line-clamp-2">{item.description || "-"}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                           <button onClick={() => window.open(`/cafe/${item.id}`, '_blank')} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 transition">👁️</button>
                           <button onClick={() => navigate(`/admin/edit-cafe/${item.id}`)} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-xs font-bold transition">แก้ไข</button>
                           <button onClick={() => handleDelete(item.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-bold transition">ลบ</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-right text-xs text-gray-400">
              แสดง {filteredCafes.length} จากทั้งหมด {cafes.length} แห่ง
          </div>
        </div>
      </div>
    </div>
  );
};