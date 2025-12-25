import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';

export const AdminEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // ✅ 1. เพิ่ม end_date ใน State
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
  }, [navigate]);

  const fetchEvent = async () => {
      const { data } = await supabase.from('events').select('*').eq('id', id).single();
      if (data) {
          setFormData({
              title: data.title || '',
              date: data.date || '',
              end_date: data.end_date || '', // ✅ ดึงวันจบมาใส่
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ 2. Logic ก่อนบันทึก: ถ้าไม่ใส่วันจบ ให้ถือว่าวันจบ = วันเริ่ม
    const finalData = {
        ...formData,
        end_date: formData.end_date || formData.date 
    };

    const { error } = await supabase.from('events').update(finalData).eq('id', id);
    setLoading(false);
    if (!error) navigate('/admin/events'); else alert(error.message);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">✏️ แก้ไขอีเวนต์</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
            <div><label className="block text-sm font-bold mb-1">ชื่องาน</label><input required name="title" value={formData.title} onChange={handleChange} className="w-full border rounded-lg p-3"/></div>
            
            {/* ✅ 3. โซนวันที่ (Start - End) */}
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#FF6B00] w-1 h-4 rounded-full"></span>
                    <h3 className="font-bold text-[#FF6B00]">ตั้งค่าวันแสดง</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">วันเริ่มงาน (Start)</label>
                        <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">วันจบงาน (End)</label>
                        <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white"/>
                        <p className="text-[10px] text-gray-500 mt-1">*ถ้าจัดวันเดียว ไม่ต้องใส่ช่องนี้</p>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">ข้อความแสดงวันที่ (พิมพ์เอง)</label>
                    <input name="date_display" value={formData.date_display} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" placeholder="เช่น 27-28 ก.พ. 2569"/>
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
                <label className="block text-sm font-bold mb-1">รายละเอียดงาน</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border rounded-lg p-3 min-h-[150px]" />
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