import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase';

// ✅ Import Rich Text, SweetAlert2, ImageUploader
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Swal from "sweetalert2";
import { ImageUploader } from '../components/ui/ImageUploader'; // ✅ เพิ่มตัวนี้

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
    status: 'draft',
    created_at: null 
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
              status: data.status || 'draft',
              created_at: data.created_at 
          });
      }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Handle Rich Text
  const handleDescriptionChange = (value) => {
    setFormData(prev => ({ ...prev, description: value }));
  };

  const handleOrganizerDescriptionChange = (value) => {
    setFormData(prev => ({ ...prev, organizer_description: value }));
  };

  // ✅ ฟังก์ชันอัปเดต
  const handleUpdate = async (statusType, isPreview = false) => {
    // Validation
    if (!formData.name || !formData.location_text || !formData.image_url) {
        Swal.fire("แจ้งเตือน", "กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน", "warning");
        return;
    }

    setLoading(true);

    // เตรียมข้อมูลที่จะเซฟ
    const dataToSave = { 
        ...formData, 
        status: statusType,
        updated_at: new Date().toISOString() // ✅ 1. อัปเดตเวลาแก้ไขล่าสุดเสมอ
    };

    // ✅ 2. เช็คว่าถ้าของเดิมไม่มีวันที่สร้าง (null) ให้เติมเข้าไปด้วย
    if (!formData.created_at) {
        dataToSave.created_at = new Date().toISOString();
    }

    const { error } = await supabase.from('cafes').update(dataToSave).eq('id', id);
    setLoading(false);

    if (error) {
        Swal.fire("Error", error.message, "error");
    } else {
        if (isPreview) {
            // ดูตัวอย่าง
            window.open(`/cafe/${id}`, '_blank');
        } else {
            // บันทึกเสร็จ -> กลับหน้ารวม
            const actionText = statusType === 'published' ? "ออนไลน์เรียบร้อย" : "บันทึกร่างเรียบร้อย";
            
            Swal.fire({
                title: "Success",
                text: actionText,
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: statusType === 'published' ? "#10B981" : "#6B7280",
            }).then(() => {
                navigate('/admin/cafes');
            });
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-white border-b border-gray-100 p-8 pb-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">✏️ แก้ไขคาเฟ่/สถานที่</h1>
                <p className="text-sm text-gray-500 mt-1">ID: {id} • แก้ไขล่าสุด: {new Date().toLocaleDateString('th-TH')}</p>
            </div>
            <button onClick={() => navigate('/admin/cafes')} className="text-gray-500 hover:text-orange-500 font-bold">กลับหน้ารวม</button>
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
                    
                    {/* ✅ เปลี่ยน Input URL เป็น ImageUploader */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">รูปปก (Cover Image) *</label>
                        <ImageUploader 
                            initialImage={formData.image_url} // ✅ ใส่รูปเดิม
                            onImageSelected={(url) => setFormData({ ...formData, image_url: url })}
                            folder="cafes"
                        />
                    </div>
                </div>
            </section>

            {/* ZONE 2: Gallery */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">2</span>
                    <h2 className="text-lg font-bold text-gray-900">อัลบั้มรูปภาพเพิ่มเติม (Gallery)</h2>
                </div>
                
                {/* Grid 3 แถว แถวละ 3 รูป */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-purple-50/50 p-6 rounded-xl border border-purple-100">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <div key={num} className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                            <label className="block text-xs font-bold text-gray-500 mb-2">รูปเพิ่มเติมที่ {num}</label>
                            
                            {/* ✅ เปลี่ยน Input เป็น ImageUploader (Mini Version) */}
                            <div className="transform scale-90 origin-top-left w-[110%]">
                                <ImageUploader 
                                    initialImage={formData[`gallery_image_${num}`]} // ✅ ใส่รูปเดิมของแต่ละช่อง
                                    onImageSelected={(url) => setFormData({ ...formData, [`gallery_image_${num}`]: url })}
                                    folder="cafes"
                                />
                            </div>
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

            {/* ✅ ACTION BUTTONS ZONE (INTELLIGENT UI) */}
            <div className="pt-6 flex flex-col md:flex-row items-center gap-4 sticky bottom-0 bg-white p-4 border-t border-gray-100 -mx-8 -mb-8 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                
                {/* 1. ปุ่มยกเลิก (ซ้ายสุด) */}
                <button type="button" onClick={() => navigate('/admin/cafes')} className="text-gray-500 hover:text-gray-700 font-bold px-4">
                    ยกเลิก
                </button>

                {/* 2. Status Badge (แจ้งสถานะ) */}
                <div className="flex-1 flex items-center gap-2">
                    {formData.status === 'published' ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                            🟢 ออนไลน์ (Published)
                        </span>
                    ) : (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 flex items-center gap-1">
                            ⚪ แบบร่าง (Draft)
                        </span>
                    )}
                </div>

                {/* 3. ปุ่มกลุ่มขวา (Actions) */}
                <div className="flex items-center gap-3">
                    
                    {/* ปุ่ม Preview (แสดงตลอด) */}
                    <button 
                        type="button" 
                        onClick={() => handleUpdate(formData.status, true)} 
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold hover:bg-blue-100 transition"
                    >
                        👁️ ดูตัวอย่าง
                    </button>

                    {/* แยกกรณีตาม Status */}
                    {formData.status === 'published' ? (
                        // ✅ กรณี: Published แล้ว (ปุ่มหลักเป็นสีเขียว "อัปเดต")
                        <>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('draft', false)} 
                                disabled={loading}
                                className="px-5 py-2.5 text-red-500 border border-transparent hover:bg-red-50 rounded-xl font-bold transition text-sm"
                            >
                                🚫 เปลี่ยนเป็นแบบร่าง
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('published', false)} 
                                disabled={loading}
                                className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2"
                            >
                                ✅ บันทึกการแก้ไข
                            </button>
                        </>
                    ) : (
                        // ⚪ กรณี: Draft อยู่ (ปุ่มหลักเป็นสีส้ม "เผยแพร่")
                        <>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('draft', false)} 
                                disabled={loading}
                                className="px-5 py-2.5 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
                            >
                                💾 บันทึกแบบร่าง
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleUpdate('published', false)} 
                                disabled={loading}
                                className="px-6 py-2.5 bg-[#FF6B00] text-white rounded-xl font-bold hover:bg-[#e65000] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2"
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