import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../supabase';

export const AdminEditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchNews = async () => {
        const { data, error } = await supabase.from('news').select('*').eq('id', id).single();
        if (data) {
            setTitle(data.title);
            setCategory(data.category);
            setImageUrl(data.image_url);
            setContent(data.content);
            setTags(data.tags || '');
        }
        setLoading(false);
    };
    fetchNews();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase
        .from('news')
        .update({ title, category, image_url: imageUrl, content, tags })
        .eq('id', id);

    setLoading(false);

    if (error) {
        alert('เกิดข้อผิดพลาด: ' + error.message);
    } else {
        // ✅ 1. เปิดหน้าข่าวที่เพิ่งแก้ ใน Tab ใหม่
        window.open(`/news/${id}`, '_blank');

        // ✅ 2. หน้าปัจจุบัน ดีดกลับไป Dashboard
        navigate('/admin/dashboard');
    }
  };

  if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูลเดิม...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">✏️ แก้ไขข่าว (Admin)</h1>
        
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

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition">
                {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
        </form>
      </div>
    </div>
  );
};