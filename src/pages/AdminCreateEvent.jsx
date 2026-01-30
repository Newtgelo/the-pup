import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

// ✅ Import Rich Text Editor
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

// ✅ Import SweetAlert2
import Swal from "sweetalert2";

// ✅ Import Icons (ใช้สำหรับ Radio Button)
import { IconTicket, IconMapPin, IconLock, IconClock } from "../components/icons/Icons"

// ✅ 1. ตั้งค่า Tag มาตรฐานสำหรับ Event
const COMMON_TAGS = [
  "Concert", "Fan Meeting", "Exhibition",
  "Pop-up Store", "Workshop", "Fan Event",
  "Ticket", "Sold Out", "Free Entry",
  "Bangkok", "Impact Arena", "Thunder Dome", "UOB Live"
];

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

  // ✅ เพิ่ม map_link, lat, lng ใน State
  const [formData, setFormData] = useState({
    title: '', date: '', end_date: '', date_display: '', time: '', location: '', 
    category: 'Concert', image_url: '', description: '', ticket_price: '', tags: '',
    map_link: '', lat: null, lng: null,
    
    // 🆕 แยก ticket_link (ค่าจริง) กับ ticket_type (ตัวเลือก)
    ticket_link: '', 
    ticket_type: 'link' // 'link', 'walk_in', 'closed', 'tba'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleDescriptionChange = (value) => setFormData({ ...formData, description: value });

  // ✅ Logic เปลี่ยนประเภทบัตร (Auto-Fill)
  const handleTicketTypeChange = (type) => {
    let newLink = formData.ticket_link;

    if (type === 'walk_in') newLink = 'walk_in';
    else if (type === 'closed') newLink = 'closed';
    else if (type === 'tba') newLink = ''; // เคลียร์เป็นค่าว่าง
    else if (type === 'link' && (newLink === 'walk_in' || newLink === 'closed')) newLink = ''; // ถ้ากลับมาเลือก Link ให้เคลียร์ค่าเก่าทิ้ง

    setFormData({ 
        ...formData, 
        ticket_type: type, 
        ticket_link: newLink 
    });
  };

  // ✅ Logic เปลี่ยน Link (เฉพาะกรณีเลือกแบบ Link)
  const handleLinkChange = (e) => {
    setFormData({ ...formData, ticket_link: e.target.value });
  };

  // ✅ 2. ฟังก์ชันดูดพิกัดจากลิงก์ Google Maps
  const handleMapLinkChange = (e) => {
    const url = e.target.value;
    let newLat = formData.lat;
    let newLng = formData.lng;

    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);

    if (match) {
        newLat = parseFloat(match[1]);
        newLng = parseFloat(match[2]);
        console.log("📍 เจอพิกัด:", newLat, newLng);
    }

    setFormData({ 
        ...formData, 
        map_link: url, 
        lat: newLat, 
        lng: newLng 
    });
  };

  // ✅ 3. ฟังก์ชันกดปุ่มแล้วเติม Tag อัตโนมัติ
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

  // ✅ ฟังก์ชันบันทึก
  const handleSave = async (statusType) => {
    if (!formData.title || !formData.date || !formData.image_url) {
        Swal.fire("แจ้งเตือน", "กรุณากรอก ชื่องาน, วันเริ่ม และ รูปปก", "warning");
        return;
    }

    setLoading(true);

    const now = new Date().toISOString(); 
    
    // ตัด ticket_type ออกก่อนบันทึก (เพราะใน DB ไม่มี field นี้)
    // ใช้ ticket_link เป็นตัวเก็บค่าจริง
    const { ticket_type, ...dataToSave } = formData;

    const finalData = {
        ...dataToSave,
        end_date: formData.end_date || formData.date, 
        status: statusType,           
        created_at: now,              
        updated_at: now               
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

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-bold text-gray-700">ลิงก์ Google Maps (เพื่อดึงพิกัด)</label>
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
                    <label className="block text-sm font-bold text-gray-700 mb-1">ประเภท *</label>
                    <select name="category" onChange={handleChange} className="w-full border rounded-lg p-3 bg-white">
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
                <div><label className="block text-sm font-bold text-gray-700 mb-1">ราคาบัตร</label><input name="ticket_price" onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="เช่น เริ่มต้น 2,500 บาท" /></div>
            </div>

            <div><label className="block text-sm font-bold text-gray-700 mb-1">ลิงก์รูปโปสเตอร์ (URL) *</label><input required name="image_url" onChange={handleChange} className="w-full border rounded-lg p-3" /></div>
            
            {/* ✅ ส่วน Ticket Link (แบบ Smart) */}
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

                {/* ช่องกรอกลิงก์ (โชว์เฉพาะเมื่อเลือกแบบ 'link') */}
                {formData.ticket_type === 'link' && (
                    <div className="animate-fade-in">
                        <input 
                            name="ticket_link" 
                            value={formData.ticket_link} 
                            onChange={handleLinkChange} 
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#FF6B00] outline-none" 
                            placeholder="วางลิงก์เว็บจองบัตร / เพจรายละเอียด ที่นี่..." 
                            autoFocus
                        />
                    </div>
                )}
            </div>

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

            {/* ส่วน Tags */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tags (คำค้นหา)</label>
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
            
            {/* Action Buttons */}
            <div className="pt-6 flex flex-col md:flex-row gap-3 border-t border-gray-100 mt-8">
                <button 
                    type="button" 
                    onClick={() => navigate('/admin/events')} 
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                    ยกเลิก
                </button>

                <div className="flex-1"></div>

                <button 
                    type="button" 
                    onClick={() => handleSave('draft')} 
                    disabled={loading}
                    className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
                >
                    💾 บันทึกร่าง
                </button>

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