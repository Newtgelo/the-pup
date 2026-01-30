import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabase'; 

// Import Rich Text Editor
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import Swal from "sweetalert2";

// ✅ Import Icons (สำหรับ Radio Button)
import { IconTicket, IconMapPin, IconLock, IconClock } from "../components/icons/Icons"; // แก้ path ให้ตรงกับที่แก้ไปตะกี้

// ✅ 1. เพิ่มรายการ Tag แนะนำ
const COMMON_TAGS = [
  "Concert", "Fan Meeting", "Exhibition",
  "Pop-up Store", "Workshop", "Fan Event",
  "Ticket", "Sold Out", "Free Entry",
  "Bangkok", "Impact Arena", "Thunder Dome", "UOB Live"
];

export const AdminEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State เก็บ Status และ CreatedAt
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

  // ✅ เพิ่ม map_link, lat, lng และ ticket_type ใน State
  const [formData, setFormData] = useState({ 
    title: '', date: '', end_date: '', date_display: '', time: '', location: '', 
    category: 'Concert', 
    image_url: '', 
    description: '', ticket_price: '', tags: '',
    map_link: '', lat: null, lng: null,
    
    // 🆕 Smart Ticket Logic
    ticket_link: '', 
    ticket_type: 'link' // default
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
          setStatus(data.status || 'published');
          setUpdatedAt(data.updated_at || data.created_at);

          // คำนวณ ticket_type จากข้อมูลเก่า
          let detectedType = 'link';
          const linkVal = data.ticket_link || data.link || ''; // รองรับ field เก่า 'link' ถ้ามี
          
          if (linkVal === 'walk_in') detectedType = 'walk_in';
          else if (linkVal === 'closed') detectedType = 'closed';
          else if (!linkVal) detectedType = 'tba';
          else detectedType = 'link';

          setFormData({
              title: data.title || '',
              date: data.date ? data.date.split('T')[0] : '', 
              end_date: data.end_date ? data.end_date.split('T')[0] : '',
              date_display: data.date_display || '',
              time: data.time || '',
              location: data.location || '',
              category: data.category || 'Concert',
              image_url: data.image_url || '',
              description: data.description || '', 
              ticket_price: data.ticket_price || '',
              tags: data.tags || '',
              // ✅ Map Data
              map_link: data.map_link || '',
              lat: data.lat || null,
              lng: data.lng || null,
              // ✅ Ticket Data
              ticket_link: linkVal,
              ticket_type: detectedType
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

  // ✅ Logic เปลี่ยนประเภทบัตร (Smart Ticket)
  const handleTicketTypeChange = (type) => {
    let newLink = formData.ticket_link;

    if (type === 'walk_in') newLink = 'walk_in';
    else if (type === 'closed') newLink = 'closed';
    else if (type === 'tba') newLink = '';
    else if (type === 'link' && (newLink === 'walk_in' || newLink === 'closed')) newLink = '';

    setFormData({ 
        ...formData, 
        ticket_type: type, 
        ticket_link: newLink 
    });
  };

  // ✅ Logic เปลี่ยน Link (Smart Ticket)
  const handleLinkChange = (e) => {
    setFormData({ ...formData, ticket_link: e.target.value });
  };

  // ✅ ฟังก์ชันดูดพิกัดจากลิงก์ Google Maps
  const handleMapLinkChange = (e) => {
    const url = e.target.value;
    let newLat = formData.lat;
    let newLng = formData.lng;

    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);

    if (match) {
        newLat = parseFloat(match[1]);
        newLng = parseFloat(match[2]);
    }

    setFormData({ 
        ...formData, 
        map_link: url, 
        lat: newLat, 
        lng: newLng 
    });
  };

  // ✅ ฟังก์ชันกดปุ่มแล้วเติม Tag อัตโนมัติ
  const handleAddTag = (tagToAdd) => {
    const currentTags = formData.tags || "";
    if (!currentTags) {
        setFormData({ ...formData, tags: tagToAdd });
    } else {
        const tagArray = currentTags.split(',').map(t => t.trim());
        if (!tagArray.includes(tagToAdd)) {
            setFormData({ ...formData, tags: `${currentTags}, ${tagToAdd}` });
        }
    }
  };

  // ✅ ฟังก์ชันอัปเดต
  const handleUpdate = async (statusType, isPreview = false) => {
    if (!formData.title || !formData.date) {
        Swal.fire("แจ้งเตือน", "กรุณากรอก ชื่องาน และ วันเริ่ม", "warning");
        return;
    }

    setLoading(true);

    const now = new Date().toISOString(); 
    
    // ตัด ticket_type ออกก่อนบันทึก
    const { ticket_type, ...dataToSave } = formData;

    const finalData = { 
        ...dataToSave, 
        end_date: formData.end_date || formData.date,
        status: statusType,  
        updated_at: now,
        // สำคัญ: อัปเดตทั้ง field เก่า (link) และใหม่ (ticket_link) เพื่อความชัวร์
        link: formData.ticket_link 
    };

    const { error } = await supabase.from('events').update(finalData).eq('id', id);
    setLoading(false);
    
    if (error) {
        Swal.fire("Error", error.message, "error");
    } else {
        if (isPreview) {
            window.open(`/event/${id}`, '_blank');
            setStatus(statusType);
            setUpdatedAt(now);
        } else {
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
        
        {/* Header */}
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

            {/* ✅ Google Maps Link */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold mb-1">ลิงก์ Google Maps (เพื่อดึงพิกัด)</label>
                    {formData.lat && (
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            📍 พิกัดพร้อม: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                        </span>
                    )}
                </div>
                <input 
                    name="map_link" 
                    value={formData.map_link} 
                    onChange={handleMapLinkChange}
                    className="w-full border rounded-lg p-3 bg-blue-50/50 focus:bg-white transition"
                    placeholder="วางลิงก์ Google Maps ที่ก๊อปจาก Address Bar ที่นี่..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold mb-1">ประเภท</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white">
                        <option value="Concert">Concert</option>
                        <option value="Pop-up">Pop-up Store</option>
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
            
            {/* ✅ ส่วน Ticket Link (แบบ Smart Edit) */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-3">การจองบัตร / เข้าร่วมงาน</label>
                
                {/* ตัวเลือก Radio */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <label className={`cursor-pointer p-3 rounded-lg border-2 flex items-center gap-2 transition ${formData.ticket_type === 'link' ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00]' : 'border-gray-200 bg-white text-gray-500'}`}>
                        <input type="radio" name="ticket_type" value="link" checked={formData.ticket_type === 'link'} onChange={() => handleTicketTypeChange('link')} className="hidden" />
                        <IconTicket size={18} /> <span className="text-sm font-bold">มีลิงก์จอง</span>
                    </label>

                    <label className={`cursor-pointer p-3 rounded-lg border-2 flex items-center gap-2 transition ${formData.ticket_type === 'walk_in' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 bg-white text-gray-500'}`}>
                        <input type="radio" name="ticket_type" value="walk_in" checked={formData.ticket_type === 'walk_in'} onChange={() => handleTicketTypeChange('walk_in')} className="hidden" />
                        <IconMapPin size={18} /> <span className="text-sm font-bold">Walk-in ฟรี</span>
                    </label>

                    <label className={`cursor-pointer p-3 rounded-lg border-2 flex items-center gap-2 transition ${formData.ticket_type === 'closed' ? 'border-gray-600 bg-gray-100 text-gray-700' : 'border-gray-200 bg-white text-gray-500'}`}>
                        <input type="radio" name="ticket_type" value="closed" checked={formData.ticket_type === 'closed'} onChange={() => handleTicketTypeChange('closed')} className="hidden" />
                        <IconLock size={18} /> <span className="text-sm font-bold">งานปิด</span>
                    </label>

                    <label className={`cursor-pointer p-3 rounded-lg border-2 flex items-center gap-2 transition ${formData.ticket_type === 'tba' ? 'border-yellow-400 bg-yellow-50 text-yellow-600' : 'border-gray-200 bg-white text-gray-500'}`}>
                        <input type="radio" name="ticket_type" value="tba" checked={formData.ticket_type === 'tba'} onChange={() => handleTicketTypeChange('tba')} className="hidden" />
                        <IconClock size={18} /> <span className="text-sm font-bold">รอติดตาม</span>
                    </label>
                </div>

                {/* ช่องกรอกลิงก์ */}
                {formData.ticket_type === 'link' && (
                    <div className="animate-fade-in">
                        <input 
                            name="ticket_link" 
                            value={formData.ticket_link} 
                            onChange={handleLinkChange} 
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#FF6B00] outline-none" 
                            placeholder="วางลิงก์เว็บจองบัตร / เพจรายละเอียด ที่นี่..." 
                        />
                    </div>
                )}
            </div>
            
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

            {/* ✅ ส่วน Tags */}
            <div>
                <label className="block text-sm font-bold mb-1">Tags (คำค้นหา)</label>
                <input 
                    name="tags" 
                    value={formData.tags} 
                    onChange={handleChange} 
                    className="w-full border rounded-lg p-3 mb-3" 
                    placeholder="เช่น Concert, IMPACT Arena"
                />

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-2 font-bold">เลือก Tag ที่ใช้บ่อย (กดเพื่อเพิ่ม):</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_TAGS.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => handleAddTag(tag)}
                                className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-full hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] transition active:scale-95"
                            >
                                + {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ACTION BUTTONS ZONE */}
            <div className="pt-6 flex flex-col md:flex-row items-center gap-4 sticky bottom-0 bg-white p-4 border-t border-gray-100 -mx-8 -mb-8 px-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                
                <button type="button" onClick={() => navigate('/admin/events')} className="text-gray-500 hover:text-gray-700 font-bold px-4">
                    ยกเลิก
                </button>

                <div className="flex-1"></div>

                <div className="flex items-center gap-3">
                    
                    <button 
                        type="button" 
                        onClick={() => handleUpdate(status, true)} 
                        disabled={loading}
                        className="px-5 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl font-bold hover:bg-blue-100 transition whitespace-nowrap"
                    >
                        👁️ ดูตัวอย่าง
                    </button>

                    {status === 'published' ? (
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