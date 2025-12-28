import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';

// ✅ Import Rich Text & Popup
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Swal from "sweetalert2";

export const AdminEditCafe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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
        if (!session) navigate('/admin/login'); else fetchCafe();
    });
  }, [navigate, id]);

  const fetchCafe = async () => {
      const { data, error } = await supabase.from('cafes').select('*').eq('id', id).single();
      if (error) {
          Swal.fire("Error", "ไม่พบข้อมูลคาเฟ่", "error");
          navigate('/admin/cafes');
      } else if (data) {
          setFormData({
              name: data.name || '',
              location_text: data.location_text || '',
              map_link: data.map_link || '',
              image_url: data.image_url || '',
              gallery_image_1: data.gallery_image_1 || '',
              gallery_image_2: data.gallery_image_2 || '',
              gallery_image_3: data.gallery_image_3 || '',
              gallery_image_4: data.gallery_image_4 || '',
              gallery_image_5: data.gallery_image_5 || '',
              gallery_image_6: data.gallery_image_6 || '',
              gallery_image_7: data.gallery_image_7 || '',
              gallery_image_8: data.gallery_image_8 || '',
              gallery_image_9: data.gallery_image_9 || '',
              open_time: data.open_time || '',
              price_range: data.price_range || '',
              phone: data.phone || '',
              description: data.description || '',
              capacity: data.capacity || '',
              area_type: data.area_type || '',
              facilities: data.facilities || '',
              organizer_description: data.organizer_description || '',
              status: data.status || 'draft'
          });
      }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Handle Rich Text (ใช้ prev เพื่อกันข้อมูลหาย)
  const handleDescriptionChange = (value) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleOrganizerDescriptionChange = (value) => {
    setFormData(prev => ({ ...prev, organizer_description: value }));
  };

  const handleUpdate = async (statusType) => {
    // Validation
    if (!formData.name || !formData.location_text || !formData.image_url) {
        Swal.fire("แจ้งเตือน", "กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน", "warning");
        return;
    }

    setLoading(true);
    const dataToSave = { ...formData, status: statusType };
    const { error } = await supabase.from('cafes').update(dataToSave).eq('id', id);
    setLoading(false);

    if (error) {
        Swal.fire("Error", error.message, "error");
    } else {
        // Popup Success -> กลับหน้าจัดการคาเฟ่
        Swal.fire({
            title: "Success",
            text: "บันทึกการแก้ไขเรียบร้อย",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#FF6B00",
        }).then(() => {
            navigate('/admin/cafes');
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-white border-b border-gray-100 p-8 pb-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">✏️ แก้ไขคาเฟ่/สถานที่</h1>
                <p className="text-sm text-gray-500 mt-1">ID: {id}</p>
            </div>
            <button onClick={() => navigate('/admin/cafes')} className="text-gray-500 hover:text-orange-500 font-bold">Cancel</button>
        </div>

        <div className="p-8 space-y-10">
            {/* ZONE 1: ข้อมูลทั่วไป */}
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

            {/* ZONE 2: Gallery */}
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
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* ZONE 3: ข้อมูลฝั่งลูกค้า */}
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
                    
                    {/* ✅ Rich Text 1 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">รายละเอียดร้าน / บรรยากาศ (Rich Text)</label>
                        <div className="bg-white">
                            <ReactQuill theme="snow" value={formData.description} onChange={handleDescriptionChange} modules={modules} className="h-64 mb-12" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ZONE 4: ข้อมูลฝั่งผู้จัด */}
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
                        <label className="block text-sm font-bold text-gray-700 mb-1">สิ่งอำนวยความสะดวก</label>
                        <input name="facilities" value={formData.facilities} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white" />
                    </div>

                    {/* ✅ Rich Text 2 */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">กฎระเบียบ / รายละเอียดพื้นที่ (Rich Text)</label>
                        <div className="bg-white">
                            <ReactQuill theme="snow" value={formData.organizer_description} onChange={handleOrganizerDescriptionChange} modules={modules} className="h-64 mb-12" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="pt-6 flex gap-3 sticky bottom-0 bg-white p-4 border-t border-gray-100 -mx-8 -mb-8 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
                <button type="button" onClick={() => navigate('/admin/cafes')} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200">
                    ยกเลิก
                </button>
                <button type="button" onClick={() => handleUpdate(formData.status)} disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700">
                    {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};