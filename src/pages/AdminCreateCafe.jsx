import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

// ✅ 1. Import Rich Text & SweetAlert2
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Swal from "sweetalert2";

export const AdminCreateCafe = () => {
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

  const [formData, setFormData] = useState({
    name: '', location_text: '', map_link: '', image_url: '',
    gallery_image_1: '', gallery_image_2: '', gallery_image_3: '',
    gallery_image_4: '', gallery_image_5: '', gallery_image_6: '',
    gallery_image_7: '', gallery_image_8: '', gallery_image_9: '',
    open_time: '', price_range: '', phone: '', 
    description: '', // Rich Text 1
    capacity: '', area_type: '', facilities: '', 
    organizer_description: '', // Rich Text 2
    status: 'draft' 
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) navigate('/admin/login'); else setIsAuth(true);
    });
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Handle Rich Text 1 (Customer Description)
  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
  };

  // ✅ Handle Rich Text 2 (Organizer Description)
  const handleOrganizerDescriptionChange = (value) => {
    setFormData({ ...formData, organizer_description: value });
  };

  // ฟังก์ชันบันทึกหลัก
  const handleSave = async (statusType, isPreview = false) => {
    // Validation เบื้องต้น
    if (!formData.name || !formData.location_text || !formData.image_url) {
        Swal.fire("แจ้งเตือน", "กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน", "warning");
        return;
    }

    setLoading(true);
    
    // ✅ เพิ่ม created_at: new Date() เพื่อให้มีเวลาบันทึกลงฐานข้อมูลแน่นอน
    const dataToSave = { 
        ...formData, 
        status: statusType,
        created_at: new Date().toISOString() // 🔥 เพิ่มบรรทัดนี้ครับ
    };
    
    // Insert ลง DB
    const { data, error } = await supabase.from('cafes').insert([dataToSave]).select().single();
    
    setLoading(false);

    if (error) {
        Swal.fire("Error", error.message, "error");
    } else {
        if (isPreview) {
            // ✅ ถ้ากด Preview: เปิดหน้าจริงดู + เด้งไปหน้า Edit Cafe
            window.open(`/cafe/${data.id}`, '_blank');
            navigate(`/admin/edit-cafe/${data.id}`); 
        } else {
            // ✅ ถ้ากดบันทึก/เผยแพร่: Popup Success -> กลับหน้ารวม
            Swal.fire({
                title: "Success",
                text: statusType === 'published' ? "เผยแพร่คาเฟ่เรียบร้อย" : "บันทึกร่างเรียบร้อย",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#FF6B00",
            }).then(() => {
                navigate('/admin/cafes');
            });
        }
    }
  };

  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        
        <div className="bg-white border-b border-gray-100 p-8 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">☕ เพิ่มคาเฟ่/สถานที่ใหม่</h1>
            <p className="text-sm text-gray-500 mt-1">สร้างเนื้อหาใหม่ (เริ่มต้นเป็นแบบร่าง)</p>
        </div>

        <div className="p-8 space-y-10">
            
             {/* ---------------- ZONE 1: ข้อมูลทั่วไป ---------------- */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</span>
                    <h2 className="text-lg font-bold text-gray-900">ข้อมูลทั่วไป (General)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อร้าน / สถานที่ *</label>
                        <input required name="name" onChange={handleChange} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น Rolling Roasters" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">พิกัด (ข้อความ) *</label>
                        <input required name="location_text" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="เช่น เอกมัย, กรุงเทพฯ" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">ลิงก์ Google Maps</label>
                        <input name="map_link" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="https://goo.gl/maps/..." />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">รูปปก (Cover Image URL) *</label>
                        <input required name="image_url" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="https://..." />
                    </div>
                </div>
            </section>

            {/* ---------------- ZONE 2: Gallery ---------------- */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">2</span>
                    <h2 className="text-lg font-bold text-gray-900">อัลบั้มรูปภาพเพิ่มเติม (Gallery)</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-purple-50/50 p-6 rounded-xl border border-purple-100">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <div key={num}>
                            <label className="block text-xs font-bold text-gray-500 mb-1">รูปเพิ่มเติมที่ {num}</label>
                            <input 
                                name={`gallery_image_${num}`} 
                                value={formData[`gallery_image_${num}`]} 
                                onChange={handleChange} 
                                className="w-full border rounded-lg p-2 text-sm bg-white" 
                                placeholder={`URL รูปเพิ่มเติมที่ ${num}`} 
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* ---------------- ZONE 3: ข้อมูลฝั่งลูกค้า ---------------- */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">3</span>
                    <h2 className="text-lg font-bold text-gray-900">ข้อมูลสำหรับลูกค้า (Customer)</h2>
                </div>
                <div className="space-y-4 bg-orange-50/50 p-6 rounded-xl border border-orange-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">เวลาทำการ</label>
                            <input name="open_time" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="09:00 - 18:00 น." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">ช่วงราคา</label>
                            <input name="price_range" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="~100 - 250 บาท" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                            <input name="phone" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="089-xxx-xxxx" />
                        </div>
                    </div>
                    
                    {/* ✅ เปลี่ยน Textarea เป็น Rich Text (description) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียดร้าน / บรรยากาศ (Rich Text)</label>
                        <div className="bg-white">
                            <ReactQuill 
                                theme="snow"
                                value={formData.description} 
                                onChange={handleDescriptionChange}
                                modules={modules}
                                className="h-64 mb-12"
                                placeholder="บรรยากาศร้านเป็นยังไง..."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------- ZONE 4: ข้อมูลฝั่งผู้จัด ---------------- */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">4</span>
                    <h2 className="text-lg font-bold text-gray-900">ข้อมูลสำหรับผู้จัด (Organizer)</h2>
                </div>
                <div className="space-y-4 bg-green-50/50 p-6 rounded-xl border border-green-100">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">ความจุ (คน)</label>
                            <input name="capacity" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="เช่น 50 คน หรือ สอบถามร้าน" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">ประเภทพื้นที่</label>
                            <input name="area_type" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="เช่น Indoor / Outdoor" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">สิ่งอำนวยความสะดวก (คั่นด้วยคอมม่า)</label>
                        <input name="facilities" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="เช่น ที่จอดรถ, Wifi, Pet Friendly, อาหารคาวหวาน" />
                    </div>

                    {/* ✅ เปลี่ยน Textarea เป็น Rich Text (organizer_description) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">กฎระเบียบ / รายละเอียดพื้นที่ (Rich Text)</label>
                        <div className="bg-white">
                            <ReactQuill 
                                theme="snow"
                                value={formData.organizer_description} 
                                onChange={handleOrganizerDescriptionChange}
                                modules={modules}
                                className="h-64 mb-12"
                                placeholder="กฎการใช้เสียง การจอง..."
                            />
                        </div>
                    </div>
                </div>
            </section>


            {/* ✅ ACTION BUTTONS ZONE */}
            <div className="pt-6 flex flex-col md:flex-row gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-100 -mx-8 -mb-8 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                {/* ปุ่มยกเลิก */}
                <button type="button" onClick={() => navigate('/admin/cafes')} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">
                    ยกเลิก
                </button>

                <div className="flex-1"></div> {/* Spacer ดันปุ่มขวา */}

                {/* ปุ่มบันทึกร่าง */}
                <button 
                    type="button" 
                    onClick={() => handleSave('draft', false)} 
                    disabled={loading}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 shadow-md"
                >
                    💾 บันทึกร่าง
                </button>

                {/* ปุ่ม Preview */}
                <button 
                    type="button" 
                    onClick={() => handleSave('draft', true)} 
                    disabled={loading}
                    className="px-6 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl font-bold hover:bg-blue-100 shadow-sm"
                >
                    👁️ ดูตัวอย่าง
                </button>

                {/* ปุ่มเผยแพร่ */}
                <button 
                    type="button" 
                    onClick={() => handleSave('published', false)} 
                    disabled={loading}
                    className="px-8 py-3 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-[#e65000] shadow-lg"
                >
                    🚀 เผยแพร่ทันที
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};