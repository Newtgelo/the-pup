import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ReactQuill from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css'; // import styles

import { supabase } from "../supabase";
// ⚠️ เช็คว่าไฟล์ supabase อยู่ที่ src/supabase.js หรือไม่ ถ้าชื่ออื่นให้แก้ตรงนี้

export const AdminCreateNews = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // ตัวแปรเก็บข้อมูลฟอร์ม
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('K-pop');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState(''); // เก็บ HTML
  const [tags, setTags] = useState('');

  // ตั้งค่าปุ่มเครื่องมือ (Toolbar)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image', 'video'], // 🔥 ปุ่ม Video สำหรับแปะ YouTube
      ['clean']
    ],
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !content) {
        alert("กรุณาใส่หัวข้อและเนื้อหาข่าว");
        return;
    }

    setLoading(true);
    
    // บันทึกลง Supabase
    const { error } = await supabase.from('news').insert({
        title,
        category,
        image_url: imageUrl,
        content, // บันทึกเป็น HTML
        tags,
        date: new Date().toISOString().split('T')[0], // วันที่ปัจจุบัน
    });

    setLoading(false);

    if (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
        alert('✅ บันทึกข่าวสำเร็จ!');
        navigate('/#news-section'); // กลับไปหน้าข่าว
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">📝 เขียนข่าวใหม่ (Admin)</h1>
        
        <form onSubmit={handleSave} className="space-y-6">
            {/* หัวข้อ */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">หัวข้อข่าว</label>
                <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                    placeholder="ใส่หัวข้อข่าว..."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </div>

            {/* หมวดหมู่ & รูปปก */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">หมวดหมู่</label>
                    <select 
                        className="w-full border border-gray-300 rounded-lg p-3"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="K-pop">K-pop</option>
                        <option value="T-pop">T-pop</option>
                        <option value="J-pop">J-pop</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">URL รูปปก</label>
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-lg p-3"
                        placeholder="https://..."
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                    />
                </div>
            </div>

            {/* Editor เขียนเนื้อหา */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">เนื้อหาข่าว (รองรับ YouTube)</label>
                {/* เพิ่ม bg-white ให้พื้นที่เขียน */}
                <div className="bg-white">
                    <ReactQuill 
                        theme="snow" 
                        value={content} 
                        onChange={setContent} 
                        modules={modules}
                        className="h-80 mb-12" 
                        placeholder="พิมพ์เนื้อหาข่าว หรือแปะลิงก์ YouTube ที่นี่..."
                    />
                </div>
            </div>

            {/* Tags */}
            <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                 <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg p-3"
                    placeholder="เช่น NewJeans, Comeback"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                />
            </div>

            {/* ปุ่มบันทึก */}
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#FF6B00] hover:bg-[#E65000] text-white font-bold py-4 rounded-xl shadow-lg transition disabled:bg-gray-400"
            >
                {loading ? 'กำลังบันทึก...' : 'บันทึกข่าว'}
            </button>
        </form>
      </div>
    </div>
  );
};