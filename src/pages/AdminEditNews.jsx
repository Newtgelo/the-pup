import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../supabase';
import Swal from "sweetalert2";

export const AdminEditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // State ข้อมูล
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('K-pop');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  
  // ✅ เพิ่ม State สำหรับ Status และ CreatedAt
  const [status, setStatus] = useState('draft'); 
  const [createdAt, setCreatedAt] = useState(null);

  // 1. เช็ค Auth และดึงข้อมูลข่าวเก่า
  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }
      setIsAuthChecking(false);

      const { data, error } = await supabase.from('news').select('*').eq('id', id).single();
      if (error) {
        Swal.fire("Error", "ไม่พบข้อมูลข่าว", "error");
        navigate('/admin/news');
      } else if (data) {
        setTitle(data.title || '');
        setCategory(data.category || 'K-pop');
        setImageUrl(data.image_url || '');
        setContent(data.content || '');
        setTags(data.tags || '');
        
        // ✅ ดึง Status (ถ้าไม่มีค่าจาก DB ให้ถือว่าเป็น published ของเก่า)
        setStatus(data.status || 'published');
        setCreatedAt(data.created_at);
      }
    };

    fetchData();
  }, [id, navigate]);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  // ✅ ฟังก์ชันอัปเดต (รองรับการเปลี่ยน Status)
  const handleUpdate = async (statusType, isPreview = false) => {
    if (!title || !content) {
        Swal.fire("แจ้งเตือน", "กรุณาใส่หัวข้อและเนื้อหาข่าว", "warning");
        return;
    }

    setLoading(true);
    
    const dataToUpdate = {
        title,
        category,
        image_url: imageUrl,
        content,
        tags,
        status: statusType, // อัปเดตสถานะตามปุ่มที่กด
        updated_at: new Date().toISOString(), // อัปเดตเวลาแก้ไขล่าสุด
    };

    const { error } = await supabase.from('news').update(dataToUpdate).eq('id', id);

    setLoading(false);

    if (error) {
        Swal.fire("Error", error.message, "error");
    } else {
        if (isPreview) {
            // ✅ ถ้ากดดูตัวอย่าง ให้เปิดหน้า News Detail แท็บใหม่
            window.open(`/news/${id}`, '_blank');
            // และอัปเดต State ในหน้านี้ให้ตรงกัน (เผื่อมีการเปลี่ยนสถานะ)
            setStatus(statusType);
        } else {
            // ✅ ถ้ากดบันทึกปกติ
            const actionText = statusType === 'published' ? "อัปเดตข้อมูลเรียบร้อย" : "บันทึกร่างเรียบร้อย";
            Swal.fire({
                title: "Success",
                text: actionText,
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: statusType === 'published' ? "#10B981" : "#6B7280",
            }).then(() => {
                navigate('/admin/news'); 
            });
        }
    }
  };

  if (isAuthChecking) return <div className="min-h-screen flex items-center justify-center text-gray-400">กำลังตรวจสอบสิทธิ์...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-8 pb-4">
             <h1 className="text-3xl font-bold text-gray-900">✏️ แก้ไขข่าว (Admin)</h1>
             <p className="text-sm text-gray-500 mt-1">ID: {id} • แก้ไขล่าสุด: {new Date().toLocaleDateString('th-TH')}</p>
        </div>
        
        <div className="p-8 space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">หัวข้อข่าว</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg p-3" value={title} onChange={e => setTitle(e.target.value)} />
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
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">เนื้อหาข่าว</label>
                <div className="bg-white">
                    <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} className="h-80 mb-12" />
                </div>
            </div>

            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                 <input type="text" className="w-full border border-gray-300 rounded-lg p-3" value={tags} onChange={e => setTags(e.target.value)} />
            </div>

            {/* ✅ ACTION BUTTONS ZONE (Sticky Footer เหมือน Cafe) */}
            <div className="pt-6 flex flex-col md:flex-row items-center gap-4 sticky bottom-0 bg-white p-4 border-t border-gray-100 -mx-8 -mb-8 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                
                {/* 1. ปุ่มยกเลิก */}
                <button type="button" onClick={() => navigate('/admin/news')} className="text-gray-500 hover:text-gray-700 font-bold px-4">
                    ยกเลิก
                </button>

                {/* 2. Status Badge (โชว์ตรงกลาง-ซ้าย เหมือน Cafe) */}
                <div className="flex-1 flex items-center gap-2">
                    {status === 'published' ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                            🟢 ออนไลน์ (Published)
                        </span>
                    ) : (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 flex items-center gap-1">
                            ⚪ แบบร่าง (Draft)
                        </span>
                    )}
                </div>

                {/* 3. ปุ่ม Action ขวาสุด */}
                <div className="flex items-center gap-3">
                    
                    {/* ปุ่ม Preview */}
                    <button 
                        type="button" 
                        onClick={() => handleUpdate(status, true)} 
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold hover:bg-blue-100 transition"
                    >
                        👁️ ดูตัวอย่าง
                    </button>

                    {status === 'published' ? (
                        // ✅ ถ้า Published อยู่ -> โชว์ปุ่ม "Unpublish" และ "Update"
                        <>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('draft', false)} 
                                disabled={loading}
                                className="px-5 py-2.5 text-red-500 border border-transparent hover:bg-red-50 rounded-xl font-bold transition text-sm whitespace-nowrap"
                            >
                                🚫 เปลี่ยนเป็นแบบร่าง
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('published', false)} 
                                disabled={loading}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2"
                            >
                                ✅ บันทึกการแก้ไข
                            </button>
                        </>
                    ) : (
                        // ⚪ ถ้า Draft อยู่ -> โชว์ปุ่ม "Save Draft" และ "Publish"
                        <>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('draft', false)} 
                                disabled={loading}
                                className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
                            >
                                💾 บันทึกแบบร่าง
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('published', false)} 
                                disabled={loading}
                                className="px-6 py-2.5 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-[#e65000] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2"
                            >
                                🚀 เผยแพร่ทันที
                            </button>
                        </>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};