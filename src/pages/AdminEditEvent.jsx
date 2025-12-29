import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase'; 

// Import Rich Text Editor
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Swal from "sweetalert2";

export const AdminEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // ✅ เพิ่ม State เก็บ Status และ CreatedAt (เพื่อโชว์ใน Header)
  const [status, setStatus] = useState('draft'); 
  const [updatedAt, setUpdatedAt] = useState(null);

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
    description: '', ticket_price: '', tags: ''
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
          // ✅ ดึง Status และ UpdatedAt มาเก็บไว้
          setStatus(data.status || 'published');
          setUpdatedAt(data.updated_at || data.created_at);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  // ✅ ฟังก์ชันอัปเดตแบบใหม่ (รับ statusType และ isPreview)
  const handleUpdate = async (statusType, isPreview = false) => {
    // Validation ขั้นต่ำ
    if (!formData.title || !formData.date) {
        Swal.fire("แจ้งเตือน", "กรุณากรอก ชื่องาน และ วันเริ่ม", "warning");
        return;
    }

    setLoading(true);

    const now = new Date().toISOString(); // เวลาปัจจุบัน

    const finalData = { 
        ...formData, 
        end_date: formData.end_date || formData.date,
        status: statusType,  // ✅ อัปเดตสถานะตามปุ่มที่กด
        updated_at: now      // ✅ อัปเดตเวลาแก้ไขล่าสุดเสมอ
    };

    const { error } = await supabase.from('events').update(finalData).eq('id', id);
    setLoading(false);
    
    if (error) {
        Swal.fire("Error", error.message, "error");
    } else {
        if (isPreview) {
            // ✅ ถ้ากดดูตัวอย่าง -> เปิดหน้าเว็บจริง + อัปเดตสถานะในหน้าจอ
            window.open(`/event/${id}`, '_blank');
            setStatus(statusType);
            setUpdatedAt(now);
        } else {
            // ✅ ถ้ากดบันทึกปกติ -> แจ้งเตือน + กลับหน้า Dashboard
            const actionText = statusType === 'published' ? "อัปเดตข้อมูลเรียบร้อย" : "บันทึกร่างเรียบร้อย";
            Swal.fire({
                title: "Success",
                text: actionText,
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: statusType === 'published' ? "#10B981" : "#6B7280",
            }).then(() => {
                navigate('/admin/events');
            });
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* ✅ Header ใหม่: มี Status Badge + วันที่แก้ไข */}
        <div className="bg-white border-b border-gray-100 p-8 pb-4">
             <div className="flex justify-between items-start">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900">✏️ แก้ไขอีเวนต์</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        แก้ไขล่าสุด: {updatedAt ? new Date(updatedAt).toLocaleDateString('th-TH') : '-'}
                    </p>
                 </div>
                 {/* Badge */}
                 {status === 'published' ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                        🟢 ออนไลน์ (Published)
                    </span>
                 ) : (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                        ⚪ แบบร่าง (Draft)
                    </span>
                 )}
             </div>
        </div>

        {/* เปลี่ยน form เป็น div ธรรมดา เพราะเราคุมปุ่มเองด้านล่าง */}
        <div className="p-8 space-y-4">
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

            {/* ✅ ACTION BUTTONS ZONE (Sticky Footer) */}
            <div className="pt-6 flex flex-col md:flex-row items-center gap-4 sticky bottom-0 bg-white p-4 border-t border-gray-100 -mx-8 -mb-8 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                
                {/* 1. ปุ่มยกเลิก */}
                <button type="button" onClick={() => navigate('/admin/events')} className="text-gray-500 hover:text-gray-700 font-bold px-4">
                    ยกเลิก
                </button>

                <div className="flex-1"></div> {/* Spacer */}

                {/* 2. ปุ่ม Action ขวาสุด */}
                <div className="flex items-center gap-3">
                    
                    {/* ปุ่ม Preview */}
                    <button 
                        type="button" 
                        onClick={() => handleUpdate(status, true)} 
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold hover:bg-blue-100 transition whitespace-nowrap"
                    >
                        👁️ ดูตัวอย่าง
                    </button>

                    {status === 'published' ? (
                        // ✅ ถ้า Published อยู่ -> โชว์ปุ่ม "Unpublish" และ "Update"
                        <>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('draft')} 
                                disabled={loading}
                                className="px-5 py-2.5 text-red-500 border border-transparent hover:bg-red-50 rounded-xl font-bold transition text-sm whitespace-nowrap"
                            >
                                🚫 เปลี่ยนเป็นแบบร่าง
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('published')} 
                                disabled={loading}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2 whitespace-nowrap"
                            >
                                ✅ บันทึกการแก้ไข
                            </button>
                        </>
                    ) : (
                        // ⚪ ถ้า Draft อยู่ -> โชว์ปุ่ม "Save Draft" และ "Publish"
                        <>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('draft')} 
                                disabled={loading}
                                className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition shadow-sm whitespace-nowrap"
                            >
                                💾 บันทึกแบบร่าง
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('published')} 
                                disabled={loading}
                                className="px-6 py-2.5 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-[#e65000] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2 whitespace-nowrap"
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