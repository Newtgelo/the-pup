import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

// ✅ Import Rich Text Editor
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// ✅ Import SweetAlert2
import Swal from "sweetalert2";

export const AdminCreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  // Config Toolbar
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) navigate('/admin/login'); else setIsAuth(true);
    });
  }, [navigate]);

  const [formData, setFormData] = useState({
    title: '', date: '', end_date: '', date_display: '', time: '', location: '', 
    category: 'Pop-up', image_url: '', link: '', description: '', ticket_price: '', tags: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleDescriptionChange = (value) => setFormData({ ...formData, description: value });

  // ✅ ฟังก์ชันบันทึกแบบใหม่ (รับ statusType)
  const handleSave = async (statusType) => {
    // Validation (เช็คเฉพาะฟิลด์สำคัญ)
    if (!formData.title || !formData.date || !formData.image_url) {
        Swal.fire("แจ้งเตือน", "กรุณากรอก ชื่องาน, วันเริ่ม และ รูปปก", "warning");
        return;
    }

    setLoading(true);

    const now = new Date().toISOString(); // เวลาปัจจุบัน

    const finalData = {
        ...formData,
        end_date: formData.end_date || formData.date, // Logic เดิมของคุณ (ถ้าไม่มีวันจบ ให้ใช้วันเริ่ม)
        status: statusType,           // ✅ เพิ่ม: draft หรือ published
        created_at: now,              // ✅ เพิ่ม: วันที่สร้าง Auto
        updated_at: now               // ✅ เพิ่ม: วันที่แก้ไข Auto
    };

    const { error } = await supabase.from('events').insert([finalData]);
    setLoading(false);

    if (error) {
        Swal.fire("Error", error.message, "error");
    } else {
        const actionText = statusType === 'published' ? "เผยแพร่อีเวนต์เรียบร้อย" : "บันทึกร่างเรียบร้อย";
        
        Swal.fire({
            title: "Success",
            text: actionText,
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: statusType === 'published' ? "#FF6B00" : "#6B7280",
        }).then(() => {
            navigate('/admin/events');
        });
    }
  };

  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900">🗓️ เพิ่มอีเวนต์ใหม่</h1>
            <button onClick={() => navigate('/admin/events')} className="text-gray-500 hover:text-orange-500 font-bold">Cancel</button>
        </div>

        {/* เปลี่ยนจาก form เป็น div ธรรมดา เพื่อคุมปุ่มเอง */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่องาน *</label>
                <input required name="title" onChange={handleChange} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#FF6B00]" placeholder="เช่น PiXXiE Tales Concert" />
            </div>

            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#FF6B00] w-1 h-4 rounded-full"></span>
                    <h3 className="font-bold text-[#FF6B00]">ตั้งค่าวันแสดง (สำคัญ)</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">วันเริ่มงาน (Start) *</label>
                        <input required type="date" name="date" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">วันจบงาน (End)</label>
                        <input type="date" name="end_date" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                        <p className="text-[10px] text-gray-500 mt-1">*ถ้าจัดวันเดียว ไม่ต้องใส่ช่องนี้</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ข้อความแสดงวันที่ (พิมพ์เอง)</label>
                    <input name="date_display" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="เช่น 27-28 ก.พ. 2569" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">เวลา</label><input name="time" onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="เช่น 18:00 - 21:00 น." /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">สถานที่ *</label><input required name="location" onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="เช่น IMPACT Arena" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ประเภท *</label>
                    <select name="category" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white">
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
                <div><label className="block text-sm font-bold text-gray-700 mb-1">ราคาบัตร</label><input name="ticket_price" onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="เช่น เริ่มต้น 2,500 บาท" /></div>
            </div>

            <div><label className="block text-sm font-bold text-gray-700 mb-1">ลิงก์รูปโปสเตอร์ (URL) *</label><input required name="image_url" onChange={handleChange} className="w-full border rounded-lg p-3" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">ลิงก์จองบัตร</label><input name="link" onChange={handleChange} className="w-full border rounded-lg p-3" /></div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียดงาน (Rich Text)</label>
                <div className="bg-white">
                    <ReactQuill 
                        theme="snow"
                        value={formData.description} 
                        onChange={handleDescriptionChange}
                        modules={modules}
                        className="h-64 mb-12"
                        placeholder="ใส่รายละเอียดงานที่นี่..."
                    />
                </div>
            </div>

            <div><label className="block text-sm font-bold text-gray-700 mb-1">Tags (คำค้นหา)</label><input name="tags" onChange={handleChange} className="w-full border rounded-lg p-3" /></div>
            
            {/* ✅ Action Buttons Zone (3 ปุ่ม) */}
            <div className="pt-6 flex flex-col md:flex-row gap-3 border-t border-gray-100 mt-8">
                <button 
                    type="button" 
                    onClick={() => navigate('/admin/events')} 
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