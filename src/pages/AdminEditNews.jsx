import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../supabase';

// ✅ Import SweetAlert2
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

  // 1. เช็ค Auth และดึงข้อมูลข่าวเก่า
  useEffect(() => {
    const fetchData = async () => {
      // เช็ค Login
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }
      setIsAuthChecking(false);

      // ดึงข้อมูลข่าวตาม ID
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!title || !content) {
        Swal.fire("แจ้งเตือน", "กรุณาใส่หัวข้อและเนื้อหาข่าว", "warning");
        return;
    }

    setLoading(true);
    
    // อัปเดตข้อมูลลง Database
    const { error } = await supabase.from('news').update({
        title,
        category,
        image_url: imageUrl,
        content,
        tags,
    }).eq('id', id);

    setLoading(false);

    if (error) {
        Swal.fire("Error", error.message, "error");
    } else {
        // ✅ Popup Success -> กด OK -> ไปหน้าจัดการข่าวสาร (/admin/news)
        Swal.fire({
            title: "Success",
            text: "แก้ไขข่าวเรียบร้อย",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#FF6B00",
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
             <h1 className="text-3xl font-bold text-gray-900">✏️ แก้ไขข่าว (Admin)</h1>
             <button onClick={() => navigate('/admin/news')} className="text-gray-500 hover:text-orange-500 font-bold">Cancel</button>
        </div>
        
        <form onSubmit={handleUpdate} className="space-y-6">
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

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition disabled:bg-gray-400">
                {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
        </form>
      </div>
    </div>
  );
};