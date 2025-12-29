import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { SafeImage } from '../components/ui/UIComponents';

export const AdminCafeDashboard = () => {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'published', 'draft'

  // State สำหรับการเรียงลำดับ
  const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/admin/login');
      else fetchCafes();
    });
  }, [navigate]);

  const fetchCafes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cafes')
      .select('*');
      
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

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // ✅ Logic การกรอง + การเรียงข้อมูล (เพิ่ม Search ID)
  const processedCafes = [...cafes]
    .filter(c => {
        const lowerTerm = searchTerm.toLowerCase().trim();

        // 1. กรองตาม Search (รองรับ CF+ID)
        let idToSearch = lowerTerm;
        if (lowerTerm.startsWith('cf')) {
            idToSearch = lowerTerm.replace('cf', '');
        }

        const matchesSearch = c.name.toLowerCase().includes(lowerTerm) || 
                              (c.location_text && c.location_text.toLowerCase().includes(lowerTerm)) ||
                              (idToSearch !== '' && c.id.toString().includes(idToSearch));
        
        // 2. กรองตาม Status Tab
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
        const { key, direction } = sortConfig;
        
        let aValue = a[key];
        let bValue = b[key];

        if (key === 'updated_at') {
            aValue = new Date(a.updated_at || a.created_at).getTime();
            bValue = new Date(b.updated_at || b.created_at).getTime();
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

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return <span className="text-gray-300 ml-1">⇅</span>; 
    return sortConfig.direction === 'asc' ? <span className="text-[#FF6B00] ml-1">↑</span> : <span className="text-[#FF6B00] ml-1">↓</span>;
  };

  const allCount = cafes.length;
  const publishedCount = cafes.filter(c => c.status === 'published').length;
  const draftCount = cafes.filter(c => c.status === 'draft').length;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('th-TH', {
        day: 'numeric', month: 'short', year: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">จัดการ คาเฟ่/สถานที่</h1>
                <p className="text-gray-500 text-sm mt-1">ร้านค้าและสถานที่จัดงานทั้งหมด ({allCount} แห่ง)</p>
            </div>
            <button 
                onClick={() => navigate('/admin/create-cafe')} 
                className="bg-[#FF6B00] hover:bg-[#e65000] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
            >
                + เพิ่มคาเฟ่ใหม่
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
                    placeholder="ค้นหาชื่อคาเฟ่ หรือ รหัส (เช่น CF23)..." 
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
                  
                  {/* ✅ เปลี่ยนหัวตาราง: เพิ่ม ID */}
                  <th 
                    className="p-4 font-bold w-[90px] cursor-pointer hover:bg-gray-100 transition select-none"
                    onClick={() => requestSort('id')}
                  >
                    ID (CF) {getSortIcon('id')}
                  </th>

                  <th className="p-4 font-bold w-[80px]">รูปปก</th>
                  
                  <th 
                    className="p-4 font-bold cursor-pointer hover:bg-gray-100 transition select-none"
                    onClick={() => requestSort('name')}
                  >
                    ชื่อร้าน / สถานที่ {getSortIcon('name')}
                  </th>
                  
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
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400">กำลังโหลดข้อมูล...</td></tr>
                ) : processedCafes.length === 0 ? (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-400">ไม่พบข้อมูลตามเงื่อนไข</td></tr>
                ) : (
                  processedCafes.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      
                      {/* ✅ แสดง ID เป็น CF + ตัวเลข */}
                      <td className="p-4 text-gray-400 text-sm font-medium font-mono">CF{item.id}</td>

                      <td className="p-4">
                         <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                             <SafeImage src={item.image_url} className="w-full h-full object-cover" />
                         </div>
                      </td>
                      <td className="p-4">
                         <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                         <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            📍 {item.location_text || "-"}
                         </p>
                      </td>
                      <td className="p-4 text-center">
                         {item.status === 'published' ? (
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
                                {formatDate(item.updated_at || item.created_at)}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                                สร้าง: {formatDate(item.created_at)}
                            </span>
                         </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                           <button 
                                onClick={() => window.open(`/cafe/${item.id}`, '_blank')} 
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#FF6B00] hover:bg-orange-50 transition"
                                title="ดูตัวอย่าง"
                           >
                                👁️
                           </button>
                           <button 
                                onClick={() => navigate(`/admin/edit-cafe/${item.id}`)} 
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                           >
                                แก้ไข
                           </button>
                           <button 
                                onClick={() => handleDelete(item.id)} 
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
              แสดง {processedCafes.length} จากทั้งหมด {allCount} แห่ง
          </div>
        </div>
      </div>
    </div>
  );
};