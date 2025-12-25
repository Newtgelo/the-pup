import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

export const AdminCreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) navigate('/admin/login'); else setIsAuth(true);
    });
  }, [navigate]);

  // ✅ 1. เพิ่ม end_date ใน State
  const [formData, setFormData] = useState({
    title: '', 
    date: '',         // วันเริ่ม
    end_date: '',     // วันจบ (เพิ่มใหม่)
    date_display: '', // ข้อความโชว์
    time: '', 
    location: '', 
    category: 'Pop-up', 
    image_url: '', 
    link: '', 
    description: '',
    ticket_price: '', 
    tags: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ 2. Logic ก่อนบันทึก: ถ้าไม่ใส่วันจบ ให้ถือว่าวันจบ = วันเริ่ม
    const finalData = {
        ...formData,
        end_date: formData.end_date || formData.date 
    };

    const { error } = await supabase.from('events').insert([finalData]);
    setLoading(false);
    if (!error) navigate('/admin/events'); else alert(error.message);
  };

  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">🗓️ เพิ่มอีเวนต์ใหม่</h1>
        <form onSubmit={handleSave} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">ชื่องาน *</label>
                <input required name="title" onChange={handleChange} className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#FF6B00]" placeholder="เช่น PiXXiE Tales Concert" />
            </div>

            {/* ✅ 3. โซนวันที่ (Start - End) */}
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
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">เวลา</label>
                    <input name="time" onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="เช่น 18:00 - 21:00 น." />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">สถานที่ *</label>
                    <input required name="location" onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="เช่น IMPACT Arena" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ประเภท</label>
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
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ราคาบัตร</label>
                    <input name="ticket_price" onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="เช่น เริ่มต้น 2,500 บาท" />
                </div>
            </div>

            <div><label className="block text-sm font-bold text-gray-700 mb-1">ลิงก์รูปโปสเตอร์ (URL)</label><input name="image_url" onChange={handleChange} className="w-full border rounded-lg p-3" /></div>
            <div><label className="block text-sm font-bold text-gray-700 mb-1">ลิงก์จองบัตร</label><input name="link" onChange={handleChange} className="w-full border rounded-lg p-3" /></div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียดงาน</label>
                <textarea name="description" onChange={handleChange} className="w-full border rounded-lg p-3 min-h-[150px]" placeholder="ใส่รายละเอียดงานที่นี่..." />
            </div>

            <div><label className="block text-sm font-bold text-gray-700 mb-1">Tags (คำค้นหา)</label><input name="tags" onChange={handleChange} className="w-full border rounded-lg p-3" /></div>
            
            <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => navigate('/admin/events')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">ยกเลิก</button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#FF6B00] text-white py-3 rounded-xl font-bold shadow-lg hover:bg-[#e65000]">{loading ? 'กำลังบันทึก...' : 'บันทึกอีเวนต์'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};