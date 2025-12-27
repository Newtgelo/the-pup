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

  // State ข้อมูลฟอร์ม
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

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !content) {
        Swal.fire("แจ้งเตือน", "กรุณาใส่หัวข้อและเนื้อหาข่าว", "warning");
        return;
    }

    setLoading(true);
    
    // บันทึกลง Database
    const { error } = await supabase.from('news').insert({
        title,
        category,
        image_url: imageUrl,
        content,
        tags,
        date: new Date().toISOString().split('T')[0],
    });

    setLoading(false);

    if (error) {
        Swal.fire("Error", error.message, "error");
    } else {
        // ✅ Popup Success -> กด OK -> ไปหน้าจัดการข่าวสาร (/admin/news)
        Swal.fire({
            title: "Success",
            text: "บันทึกข่าวเรียบร้อย",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#FF6B00",
        }).then(() => {
            // 🚀 แก้ตรงนี้ครับ!
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
             {/* ปุ่ม Cancel ก็แก้ให้กลับไปหน้าจัดการข่าวสารด้วยเหมือนกัน เพื่อความเนียน */}
             <button onClick={() => navigate('/admin/news')} className="text-gray-500 hover:text-orange-500 font-bold">Cancel</button>
        </div>
        
        <form onSubmit={handleSave} className="space-y-6">
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

            <button type="submit" disabled={loading} className="w-full bg-[#FF6B00] hover:bg-[#E65000] text-white font-bold py-4 rounded-xl shadow-lg transition disabled:bg-gray-400">
                {loading ? 'กำลังบันทึก...' : 'บันทึกข่าว'}
            </button>
        </form>
      </div>
    </div>
  );
};