import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export const AdminCreateCafe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  const [formData, setFormData] = useState({
    name: '', location_text: '', map_link: '', image_url: '',
    gallery_image_1: '', gallery_image_2: '', gallery_image_3: '',
  gallery_image_4: '', gallery_image_5: '', gallery_image_6: '',
  gallery_image_7: '', gallery_image_8: '', gallery_image_9: '',
    open_time: '', price_range: '', phone: '', description: '',
    capacity: '', area_type: '', facilities: '', organizer_description: '',
    status: 'draft' // ✅ Default เป็น draft ก่อน
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) navigate('/admin/login'); else setIsAuth(true);
    });
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ฟังก์ชันบันทึกหลัก
  const handleSave = async (statusType, isPreview = false) => {
    setLoading(true);
    
    // เตรียมข้อมูลที่จะบันทึก พร้อมระบุ status
    const dataToSave = { ...formData, status: statusType };
    
    // Insert ลง DB
    const { data, error } = await supabase.from('cafes').insert([dataToSave]).select().single();
    
    setLoading(false);

    if (error) {
        alert("Error: " + error.message);
    } else {
        if (isPreview) {
            // ✅ ถ้ากด Preview: เปิดแท็บใหม่ไปดูหน้าจริง + ย้ายหน้า Admin ไปหน้า Edit
            window.open(`/cafe/${data.id}`, '_blank');
            navigate(`/admin/edit-cafe/${data.id}`); 
        } else {
            // ✅ ถ้ากดบันทึกปกติ: กลับไปหน้ารายการ
            navigate('/admin/cafes');
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
            {/* --- (ส่วน Form Input เหมือนเดิมเป๊ะ ไม่ต้องแก้ครับ) --- */}
            {/* ผมขอละไว้ใน Code block นี้นะครับ ให้พี่ใช้ Form Input ชุดเดิมจากไฟล์ที่แล้วได้เลย */}
            {/* หรือถ้าจะก๊อปปี้ใหม่ทั้งหมด บอกผมได้ครับ เดี๋ยวผมแปะตัวเต็มให้ */}
            
            {/* ... ใส่ Code Form Input Zone 1-4 ตรงนี้ ... */}
            
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
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียดร้าน / บรรยากาศ</label>
                        <textarea name="description" onChange={handleChange} className="w-full border rounded-lg p-3 min-h-[100px] bg-white" placeholder="บรรยากาศร้านเป็นยังไง..." />
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
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">กฎระเบียบ / รายละเอียดพื้นที่</label>
                        <textarea name="organizer_description" onChange={handleChange} className="w-full border rounded-lg p-3 min-h-[100px] bg-white" placeholder="กฎการใช้เสียง การจอง..." />
                    </div>
                </div>
            </section>


            {/* ✅ ACTION BUTTONS ZONE */}
            <div className="pt-6 flex flex-col md:flex-row gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-100 -mx-8 -mb-8 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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