import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../supabase';
import Swal from "sweetalert2";

export const AdminCreateNews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // ระบบ รปภ. (ตรวจสอบล็อกอิน)
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
      } else {
        setIsAuthChecking(false);
      }
    };
    checkUser();
  }, [navigate]);

  // State ข้อมูลฟอร์ม (คงเดิม)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('K-pop');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  // ✅ ฟังก์ชันบันทึกแบบใหม่ (รับ statusType)
  const handleSave = async (statusType) => {
    // Validation
    if (!title || !content) {
        Swal.fire("แจ้งเตือน", "กรุณาใส่หัวข้อและเนื้อหาข่าว", "warning");
        return;
    }

    setLoading(true);
    
    // ✅ เตรียมข้อมูล (Auto Date + Status)
    const now = new Date();
    const dataToSave = {
        title,
        category,
        image_url: imageUrl,
        content,
        tags,
        status: statusType, // 'draft' หรือ 'published'
        created_at: now.toISOString(), // เวลาปัจจุบันเป๊ะๆ
        updated_at: now.toISOString(),
        date: now.toISOString().split('T')[0], // รองรับ field เก่า
    };

    // บันทึกลง Database
    const { error } = await supabase.from('news').insert(dataToSave);

    setLoading(false);

    if (error) {
        Swal.fire("Error", error.message, "error");
    } else {
        // แจ้งเตือนตามสถานะ
        const actionText = statusType === 'published' ? "เผยแพร่ข่าวเรียบร้อย" : "บันทึกร่างเรียบร้อย";
        
        Swal.fire({
            title: "Success",
            text: actionText,
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: statusType === 'published' ? "#FF6B00" : "#6B7280",
        }).then(() => {
            navigate('/admin/news'); 
        });
    }
  };

  if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center text-gray-400">กำลังตรวจสอบสิทธิ์...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
             <h1 className="text-3xl font-bold text-gray-900">📝 เขียนข่าวใหม่ (Admin)</h1>
             <button onClick={() => navigate('/admin/news')} className="text-gray-500 hover:text-orange-500 font-bold">Cancel</button>
        </div>
        
        {/* เปลี่ยนจาก form onSubmit เป็น div ธรรมดา เพราะเราคุมปุ่มเองแล้ว */}
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">หัวข้อข่าว</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-3" placeholder="ใส่หัวข้อข่าว..." value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">หมวดหมู่</label>
                    <select className="w-full border border-gray-300 rounded-lg p-3" value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="K-pop">K-pop</option>
                        <option value="T-pop">T-pop</option>
                        <option value="J-pop">J-pop</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">URL รูปปก</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">เนื้อหาข่าว</label>
                <div className="bg-white">
                    <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} className="h-80 mb-12" placeholder="พิมพ์เนื้อหาข่าว..." />
                </div>
            </div>

            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                 <input type="text" className="w-full border border-gray-300 rounded-lg p-3" placeholder="เช่น NewJeans, Comeback" value={tags} onChange={e => setTags(e.target.value)} />
            </div>

            {/* ✅ Action Buttons Zone (เหมือนหน้า Cafe) */}
            <div className="pt-6 flex flex-col md:flex-row gap-3 border-t border-gray-100 mt-8">
                <button 
                    type="button" 
                    onClick={() => navigate('/admin/news')} 
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                    ยกเลิก
                </button>

                <div className="flex-1"></div> {/* Spacer ดันปุ่มขวา */}

                {/* ปุ่มบันทึกร่าง */}
                <button 
                    type="button" 
                    onClick={() => handleSave('draft')} 
                    disabled={loading}
                    className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
                >
                    💾 บันทึกร่าง
                </button>

                {/* ปุ่มเผยแพร่ */}
                <button 
                    type="button" 
                    onClick={() => handleSave('published')} 
                    disabled={loading}
                    className="px-8 py-3 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-[#e65000] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2"
                >
                    🚀 เผยแพร่ทันที
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};