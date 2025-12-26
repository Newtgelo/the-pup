import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';

export const AdminEditCafe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', location_text: '', map_link: '', image_url: '',
    gallery_image_1: '', gallery_image_2: '', gallery_image_3: '',
  gallery_image_4: '', gallery_image_5: '', gallery_image_6: '',
  gallery_image_7: '', gallery_image_8: '', gallery_image_9: '',
    open_time: '', price_range: '', phone: '', description: '',
    capacity: '', area_type: '', facilities: '', organizer_description: '',
    status: 'draft' // Default
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) navigate('/admin/login'); else fetchCafe();
    });
  }, [navigate]);

  const fetchCafe = async () => {
      const { data, error } = await supabase.from('cafes').select('*').eq('id', id).single();
      if (error) return alert(error.message);
      if (data) setFormData(data); // Supabase map field ตรงกันอยู่แล้ว
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ฟังก์ชันอัปเดต
  const handleUpdate = async (statusType, isPreview = false) => {
    setLoading(true);
    const dataToSave = { ...formData, status: statusType };
    
    const { error } = await supabase.from('cafes').update(dataToSave).eq('id', id);
    setLoading(false);

    if (error) {
        alert("Error: " + error.message);
    } else {
        if (isPreview) {
            // ✅ Preview: เปิดแท็บใหม่ (ไม่ต้องย้ายหน้า)
            window.open(`/cafe/${id}`, '_blank');
        } else {
            // ✅ Save/Publish: กลับหน้ารายการ
            navigate('/admin/cafes');
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        
        <div className="bg-white border-b border-gray-100 p-8 pb-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">✏️ แก้ไขข้อมูลคาเฟ่</h1>
                <p className="text-sm text-gray-500 mt-1">ID: {id} | สถานะปัจจุบัน: 
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${formData.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {formData.status === 'published' ? 'เผยแพร่แล้ว' : 'ฉบับร่าง'}
                    </span>
                </p>
            </div>
        </div>

        <div className="p-8 space-y-10">
             {/* --- FORM INPUT ZONE (ใช้ชุดเดิมจาก Create Cafe ได้เลยครับ เพื่อความสั้นผมละไว้) --- */}
             
             {/* ---------------- ZONE 1: ข้อมูลทั่วไป ---------------- */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">1</span>
                    <h2 className="text-lg font-bold text-gray-900">ข้อมูลทั่วไป (General)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อร้าน / สถานที่ *</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">พิกัด (ข้อความ) *</label>
                        <input required name="location_text" value={formData.location_text} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">ลิงก์ Google Maps</label>
                        <input name="map_link" value={formData.map_link} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">รูปปก (Cover Image URL) *</label>
                        <input required name="image_url" value={formData.image_url} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
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
                            <input name="open_time" value={formData.open_time} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">ช่วงราคา</label>
                            <input name="price_range" value={formData.price_range} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียดร้าน / บรรยากาศ</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded-lg p-3 min-h-[100px] bg-white" />
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
                            <input name="capacity" value={formData.capacity} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">ประเภทพื้นที่</label>
                            <input name="area_type" value={formData.area_type} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">สิ่งอำนวยความสะดวก (คั่นด้วยคอมม่า)</label>
                        <input name="facilities" value={formData.facilities} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">กฎระเบียบ / รายละเอียดพื้นที่</label>
                        <textarea name="organizer_description" value={formData.organizer_description} onChange={handleChange} className="w-full border rounded-lg p-3 min-h-[100px] bg-white" />
                    </div>
                </div>
            </section>

            {/* ✅ ACTION BUTTONS ZONE */}
            <div className="pt-6 flex flex-col md:flex-row gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-100 -mx-8 -mb-8 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                {/* ปุ่มยกเลิก */}
                <button type="button" onClick={() => navigate('/admin/cafes')} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">
                    ยกเลิก
                </button>

                <div className="flex-1"></div>

                {/* ปุ่มบันทึกร่าง */}
                <button 
                    type="button" 
                    onClick={() => handleUpdate('draft', false)} 
                    disabled={loading}
                    className={`px-6 py-3 rounded-xl font-bold shadow-md hover:bg-opacity-90 ${formData.status === 'draft' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                    💾 บันทึกร่าง
                </button>

                {/* ปุ่ม Preview */}
                <button 
                    type="button" 
                    onClick={() => handleUpdate(formData.status, true)} // คง status เดิมแต่กดดู
                    disabled={loading}
                    className="px-6 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl font-bold hover:bg-blue-100 shadow-sm"
                >
                    👁️ ดูตัวอย่าง
                </button>

                {/* ปุ่มเผยแพร่ */}
                <button 
                    type="button" 
                    onClick={() => handleUpdate('published', false)} 
                    disabled={loading}
                    className="px-8 py-3 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-[#e65000] shadow-lg"
                >
                    {formData.status === 'published' ? '✅ อัปเดตข้อมูล' : '🚀 เผยแพร่ทันที'}
                </button>
            </div>
            
        </div>
      </div>
    </div>
  );
};