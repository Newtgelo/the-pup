import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase'; // เช็ค Path ให้ถูกกับเครื่องพี่นะครับ

// Import Rich Text Editor
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Swal from "sweetalert2";

export const AdminEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const [formData, setFormData] = useState({ 
    title: '', date: '', end_date: '', date_display: '', time: '', location: '', 
    category: 'Pop-up', image_url: '', link: '', 
    description: '', ticket_price: '', tags: '' // ลบ lat, lng ออกแล้วตามที่ขอ
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) navigate('/admin/login');
        else fetchEvent();
    });
  }, [navigate, id]);

  const fetchEvent = async () => {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      
      if (error) {
          Swal.fire("Error", "ไม่พบข้อมูลอีเวนต์", "error");
      } else if (data) {
          setFormData({
              title: data.title || '',
              date: data.date ? data.date.split('T')[0] : '', 
              end_date: data.end_date ? data.end_date.split('T')[0] : '',
              date_display: data.date_display || '',
              time: data.time || '',
              location: data.location || '',
              category: data.category || 'Pop-up',
              image_url: data.image_url || '',
              link: data.link || '',
              description: data.description || '', 
              ticket_price: data.ticket_price || '',
              tags: data.tags || ''
          });
      }
  };

  // ✅ แก้จุดที่ 1: ใช้ prev (ค่าล่าสุด) เพื่อป้องกันข้อมูลหายเวลาพิมพ์
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ แก้จุดตาย (จุดที่ 2): ReactQuill ชอบส่งค่ามาทับของเก่า
  // ต้องใช้ (prev) => ... เพื่อให้มั่นใจว่าเอาข้อมูลล่าสุดมาแก้ ไม่ใช่ข้อมูลว่างเปล่า
  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalData = { 
        ...formData, 
        end_date: formData.end_date || formData.date 
    };

    const { error } = await supabase.from('events').update(finalData).eq('id', id);
    setLoading(false);
    
    if (!error) {
        Swal.fire("Success", "บันทึกเรียบร้อย", "success").then(() => navigate('/admin/events'));
    } else {
        Swal.fire("Error", error.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">✏️ แก้ไขอีเวนต์</h1>

        <form onSubmit={handleUpdate} className="space-y-4">
            <div>
                <label className="block text-sm font-bold mb-1">ชื่องาน</label>
                <input required name="title" value={formData.title} onChange={handleChange} className="w-full border rounded-lg p-3"/>
            </div>
            
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#FF6B00] w-1 h-4 rounded-full"></span><h3 className="font-bold text-[#FF6B00]">ตั้งค่าวันแสดง</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">วันเริ่ม (Start)*</label>
                        <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">วันจบ (End)</label>
                        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ข้อความแสดงวันที่</label>
                    <input name="date_display" value={formData.date_display} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white"/>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold mb-1">เวลา</label><input name="time" value={formData.time} onChange={handleChange} className="w-full border rounded-lg p-3"/></div>
                <div><label className="block text-sm font-bold mb-1">สถานที่</label><input required name="location" value={formData.location} onChange={handleChange} className="w-full border rounded-lg p-3"/></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1">ประเภท</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white">
                        <option value="Pop-up">Pop-up Store</option>
                        <option value="Concert">Concert</option>
                        <option value="Fan Meeting">Fan Meeting</option>
                        <option value="Fansign">Fansign</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Exhibition">Exhibition</option>
                        <option value="Fan Event">Fan Event</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
                <div><label className="block text-sm font-bold mb-1">ราคาบัตร</label><input name="ticket_price" value={formData.ticket_price} onChange={handleChange} className="w-full border rounded-lg p-3"/></div>
            </div>

            <div><label className="block text-sm font-bold mb-1">ลิงก์รูปโปสเตอร์</label><input name="image_url" value={formData.image_url} onChange={handleChange} className="w-full border rounded-lg p-3"/></div>
            <div><label className="block text-sm font-bold mb-1">ลิงก์จองบัตร</label><input name="link" value={formData.link} onChange={handleChange} className="w-full border rounded-lg p-3"/></div>
            
            <div>
                <label className="block text-sm font-bold mb-1">รายละเอียดงาน (Rich Text)</label>
                <div className="bg-white">
                    <ReactQuill 
                        theme="snow" 
                        value={formData.description} 
                        onChange={handleDescriptionChange} 
                        modules={modules} 
                        className="h-64 mb-12"
                    />
                </div>
            </div>

            <div><label className="block text-sm font-bold mb-1">Tags</label><input name="tags" value={formData.tags} onChange={handleChange} className="w-full border rounded-lg p-3"/></div>

            <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => navigate('/admin/events')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">ยกเลิก</button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700">บันทึกการแก้ไข</button>
            </div>
        </form>
      </div>
    </div>
  );
};