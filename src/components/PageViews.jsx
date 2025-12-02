import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Import Icons
import { 
    IconShare, IconCheck, IconX, IconMaximize, 
    IconCalendar, IconMapPin, IconChevronRight, IconTicket,
    IconZoomIn, IconClock, IconPhone, IconUsers, IconLayout, IconBriefcase,
    IconChevronLeft 
} from './icons/Icons';

// Import UI Components
import { SafeImage, NotFound } from './ui/UIComponents';

// Import Data
import { SAMPLE_NEWS, SAMPLE_EVENTS, SAMPLE_CAFES } from '../data/mockData';

// --- Helper Function ---
const findItem = (data, id) => data.find(item => item.id === parseInt(id));

// ==========================================
// 1. NEWS DETAIL (ไม่ต้องแก้ Lightbox เพราะไม่มี)
// ==========================================
export const NewsDetail = ({ onTriggerToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const news = findItem(SAMPLE_NEWS, id);

  // [NEW] Dynamic Title Logic
  useEffect(() => {
    if (news) {
      document.title = `${news.title} | TPP`;
    }
    return () => { document.title = "The Popup Plan"; };
  }, [news]);

  const relatedEvents = SAMPLE_EVENTS.filter(e => 
      e.tags?.some(tag => news?.tags?.includes(tag)) || e.type === 'Concert'
  ).slice(0, 2);

  const otherNews = SAMPLE_NEWS.filter(n => n.id !== news?.id).slice(0, 2);

  if (!news) return <NotFound title="ไม่พบข่าวดังกล่าว" onBack={() => navigate('/')} />;

  const handleShare = async () => {
        const shareData = { title: news.title, url: window.location.href };
        try {
            if (navigator.share) await navigator.share(shareData);
            else { await navigator.clipboard.writeText(shareData.url); onTriggerToast("คัดลอกลิงก์แล้ว"); }
        } catch (err) { console.log("Error:", err); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative animate-fade-in">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/#news-section')} 
            className="group flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition"
          >
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition">
                <IconChevronLeft size={24} />
            </div>
            <span className="font-bold text-gray-900 group-hover:text-[#FF6B00]">ย้อนกลับ</span>
          </button>

          <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF6B00] transition shadow-sm">
            <IconShare size={20}/>
          </button>
      </div>

      {/* HEADLINE */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
            <span className="bg-[#FF6B00] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">{news.category}</span>
            <span className="text-gray-500 flex items-center gap-1"><IconClock size={14}/> {news.date}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{news.title}</h1>
      </div>
      
      {/* MAIN IMAGE */}
      <div className="rounded-2xl overflow-hidden mb-10 shadow-lg aspect-video bg-gray-100 relative group">
        <SafeImage src={news.image} alt={news.title} className="w-full h-full object-cover" />
      </div>

      {/* CONTENT BODY */}
      <div className="space-y-8 mb-16">
          {(news.contentBlocks || []).map((block, index) => (
              <div key={index}>
                  {block.type === 'text' && (
                    <div className="max-w-3xl mx-auto">
                        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line text-justify font-serif">{block.text}</p>
                    </div>
                  )}
                  {block.type === 'image' && (
                    <figure className="my-8">
                        <div className="rounded-xl overflow-hidden shadow-sm">
                            <SafeImage src={block.src} alt={block.caption} className="w-full h-auto object-cover max-h-[600px]" />
                        </div>
                        {block.caption && <figcaption className="text-center text-sm text-gray-500 mt-3 italic">{block.caption}</figcaption>}
                    </figure>
                  )}
                  {block.type === 'youtube' && (
                     <div className="my-10 aspect-video rounded-xl overflow-hidden shadow-lg">
                        <iframe className="w-full h-full" src={block.src} title="YouTube video" allowFullScreen></iframe>
                     </div>
                  )}
              </div>
          ))}
      </div>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mb-16">
          {(news.tags || []).map((tag, i) => (
              <span key={i} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 cursor-pointer transition">#{tag}</span>
          ))}
      </div>

      <hr className="border-gray-200 mb-12" />

      {/* RELATED EVENTS */}
      {relatedEvents.length > 0 && (
          <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  🎟️ อีเวนต์ที่เกี่ยวข้อง
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedEvents.map(event => (
                      <div key={event.id} onClick={() => navigate(`/event/${event.id}`)} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 cursor-pointer hover:border-[#FF6B00] hover:shadow-md transition group">
                          <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              <SafeImage src={event.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
                          </div>
                          <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-full">{event.type}</span>
                              <h4 className="font-bold text-gray-900 mt-1 line-clamp-1 group-hover:text-[#FF6B00] transition">{event.title}</h4>
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><IconCalendar size={12}/> {event.date}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1"><IconMapPin size={12}/> {event.location}</p>
                          </div>
                          <div className="flex items-center justify-center text-gray-300 group-hover:text-[#FF6B00]">
                              <IconChevronRight />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* READ MORE */}
      <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">ข่าวสารอื่นๆ ที่น่าสนใจ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {otherNews.map(n => (
                  <div key={n.id} onClick={() => { navigate(`/news/${n.id}`); window.scrollTo(0,0); }} className="cursor-pointer group">
                      <div className="aspect-video rounded-xl overflow-hidden bg-gray-200 mb-3">
                          <SafeImage src={n.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
                      </div>
                      <h4 className="font-bold text-gray-900 leading-tight group-hover:text-[#FF6B00] transition line-clamp-2">{n.title}</h4>
                      <p className="text-xs text-gray-500 mt-2">{n.date}</p>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
};

// ==========================================
// 2. EVENT DETAIL (แก้ Lightbox ให้ลอยเหนือ Animation)
// ==========================================
export const EventDetail = ({ onTriggerToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = findItem(SAMPLE_EVENTS, id);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false); 
  
  useEffect(() => {
    if (event) {
      document.title = `${event.title} | TPP`;
    }
    return () => { document.title = "The Popup Plan"; };
  }, [event]);

  if (!event) return <NotFound title="ไม่พบกิจกรรมดังกล่าว" onBack={() => navigate('/')} />;

  const handleMapClick = () => onTriggerToast("กำลังเปิดแผนที่ Google Maps...");
  const addToCalendar = () => { onTriggerToast("เปิด Google Calendar แล้ว"); };

  const goBackToEvents = () => {
      navigate('/#events-section'); 
  };
  
  const handleShare = async () => {
    const shareData = { title: event.title, url: window.location.href };
    try {
        if (navigator.share) await navigator.share(shareData);
        else { await navigator.clipboard.writeText(shareData.url); onTriggerToast("คัดลอกลิงก์แล้ว"); }
    } catch (err) { console.log("Error:", err); }
  };

  return (
    // 🔥 ใช้ Fragment (<>...</>) หุ้มแทน เพื่อแยก Lightbox ออกจาก animate-fade-in
    <>
      {isLightboxOpen && (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
                <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white hover:text-[#FF6B00] transition"><IconX size={32} /></button>
                <SafeImage src={event.image} alt="Full View" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            </div>
      )}

      {/* ตัวเนื้อหาหลัก (ที่มี Animation) */}
      <div className="max-w-6xl mx-auto px-4 py-8 pb-32 md:pb-8 relative animate-fade-in">
        {/* HEADER BAR */}
        <div className="flex justify-between items-center mb-6">
            <button 
                onClick={goBackToEvents}
                className="group flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition"
            >
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition">
                    <IconChevronLeft size={24} />
                </div>
                <span className="font-bold text-gray-900 group-hover:text-[#FF6B00]">ย้อนกลับ</span>
            </button>

            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF6B00] transition shadow-sm">
                <IconShare size={20}/>
            </button>
        </div>
        
        {/* MAIN LAYOUT */}
        <div className="relative mb-12">
            {/* DESKTOP */}
            <div className="hidden md:flex bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 min-h-[450px]">
                <div className="w-[40%] relative bg-gray-50 cursor-pointer group" onClick={() => setIsLightboxOpen(true)}>
                <SafeImage src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute bottom-3 right-3 bg-black/50 text-white p-2 rounded-xl backdrop-blur-md hover:bg-black/70 transition flex items-center gap-2 border border-white/10 shadow-lg"><IconMaximize size={16} /><span className="text-xs font-medium">ขยายรูป</span></div>
                </div>
                <div className="flex-1 p-10 flex flex-col justify-center relative">
                <span className="inline-block px-3 py-1 rounded-lg bg-orange-50 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-3 w-fit border border-orange-100">{event.type}</span>
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">{event.title}</h1>
                <div className="space-y-5 my-6">
                    <div className="flex items-start gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6B00] shadow-sm border border-orange-100 group-hover:scale-110 transition"><IconCalendar size={20} /></div>
                        <div>
                            {event.schedules ? event.schedules.map((s, i) => (
                                <div key={i}><p className="text-gray-900 font-bold text-lg">{s.date}</p><p className="text-gray-500 text-sm">เวลา {s.time}</p></div>
                            )) : <><p className="text-gray-900 font-bold text-lg">{event.date}</p><p className="text-gray-500">{event.time}</p></>}
                        </div>
                    </div>
                    <div onClick={handleMapClick} className="flex items-start gap-4 group cursor-pointer hover:bg-blue-50 p-2 -ml-2 rounded-xl transition">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100"><IconMapPin size={20} /></div>
                        <div><p className="text-gray-900 font-bold text-lg">{event.full_location || event.location}</p><p className="text-gray-500 text-sm">Bangkok, Thailand</p></div>
                    </div>
                    <div className="flex items-start gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shadow-sm border border-green-100"><IconTicket size={20} /></div>
                        <div><p className="text-gray-900 font-bold text-xl">{event.price} บาท</p><p className="text-gray-500 text-sm">ราคาบัตรทั้งหมด</p></div>
                    </div>
                </div>
                <div className="flex gap-3 mt-auto pt-6 border-t border-dashed border-gray-200">
                    <a href={event.ticket_link} target="_blank" rel="noreferrer" className="flex-1 bg-[#FF6B00] hover:bg-[#E65000] text-white py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg flex justify-center items-center gap-2"><IconTicket size={24} /> จองบัตรเลย</a>
                    <button onClick={addToCalendar} className="flex-1 border-2 border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-gray-700 bg-white py-4 px-6 rounded-xl font-bold text-lg transition flex justify-center items-center gap-2"><IconCalendar size={24} /> เพิ่มในปฏิทิน</button>
                </div>
                </div>
            </div>
            
            {/* MOBILE */}
            <div className="md:hidden flex flex-col bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="w-full aspect-[2/3] relative cursor-pointer bg-gray-50" onClick={() => setIsLightboxOpen(true)}>
                    <SafeImage src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="p-6 flex flex-col">
                    <span className="inline-block px-2 py-1 rounded-lg bg-orange-50 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-2 w-fit border border-orange-100">{event.type}</span>
                    <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4">{event.title}</h1>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3"><IconCalendar size={18} className="mt-1 text-[#FF6B00]"/><div>{event.schedules ? event.schedules.map((s, i) => (<div key={i}><p className="text-gray-900 font-bold text-sm">{s.date}</p><p className="text-gray-500 text-xs">{s.time}</p></div>)) : <><p className="text-gray-900 font-bold text-sm">{event.date}</p><p className="text-gray-500 text-xs">{event.time}</p></>}</div></div>
                        <div className="flex items-start gap-3"><IconMapPin size={18} className="mt-1 text-blue-500"/><p className="text-gray-900 font-bold text-sm">{event.full_location || event.location}</p></div>
                        <div className="flex items-start gap-3"><IconTicket size={18} className="mt-1 text-green-600"/><p className="text-gray-900 font-bold text-sm">{event.price} บาท</p></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
            <div className="md:col-span-7 lg:col-span-8">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 border-l-4 border-[#FF6B00] pl-4">รายละเอียดงาน</h2>
                <div className="prose prose-sm md:prose-lg text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</div>
                {event.ticket_info && event.ticket_info.length > 0 && (
                <div className="mt-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-lg mb-4">ผังที่นั่งและราคา</h3>
                    <div className="space-y-2">{event.ticket_info.map((t, i) => (<div key={i} className="flex justify-between p-3 bg-white rounded-lg border border-gray-100"><span className="font-medium">{t.zone}</span><span className="text-[#FF6B00] font-bold">{t.price}</span></div>))}</div>
                </div>
                )}
            </div>
        </div>
        
        {/* Mobile Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 px-6 md:hidden z-50 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-bottom">
            <div className="flex-1"><p className="text-xs text-gray-500">ราคาเริ่มต้น</p><p className="text-[#E11D48] font-bold text-lg leading-none">{(event.price + '').split(' ')[0]}</p></div>
            <a href={event.ticket_link} target="_blank" rel="noreferrer" className="flex-1 bg-[#FF6B00] text-white py-3 rounded-xl font-bold text-center shadow-lg active:scale-95 transition">จองบัตรเลย</a>
        </div>
      </div>
    </>
  );
};

// ==========================================
// 3. CAFE DETAIL (แก้ Lightbox เช่นกัน)
// ==========================================
export const CafeDetail = ({ onTriggerToast }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const cafe = findItem(SAMPLE_CAFES, id);
    const [activeTab, setActiveTab] = useState('general');
    const [selectedImage, setSelectedImage] = useState(cafe?.image || "");
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // 🔥 1. เตรียมรูปทั้งหมดใส่ตัวแปรไว้ (กันเหนียวถ้าไม่มี gallery ให้ใช้รูปหลัก)
    const allImages = cafe?.gallery || (cafe?.image ? [cafe.image] : []);

    useEffect(() => {
        if (cafe) {
          document.title = `${cafe.name} | TPP`;
        }
        return () => { document.title = "The Popup Plan"; };
    }, [cafe]);

    // Set รูปแรกตอนโหลด
    useEffect(() => { 
        if (cafe) setSelectedImage(cafe.image || (cafe.gallery && cafe.gallery[0]) || ""); 
    }, [cafe]);

    if (!cafe) return <NotFound title="ไม่พบคาเฟ่ดังกล่าว" onBack={() => navigate('/')} />;
    
    const otherCafes = SAMPLE_CAFES.filter(c => c.id !== cafe.id).slice(0, 4);
    const handleBooking = () => onTriggerToast("กำลังเปิดฟอร์มติดต่อร้าน...");
    
    const handleShare = async () => {
        const shareData = { title: cafe.name, url: window.location.href };
        try {
            if (navigator.share) await navigator.share(shareData);
            else { await navigator.clipboard.writeText(shareData.url); onTriggerToast("คัดลอกลิงก์แล้ว"); }
        } catch (err) { console.log("Error:", err); }
    };

    // 🔥 2. ฟังก์ชันเลื่อนรูป (Loop วนกลับมาได้)
    const handlePrevImage = (e) => {
        e.stopPropagation(); // กันไม่ให้กดทะลุไปปิด Lightbox
        const currentIndex = allImages.indexOf(selectedImage);
        const newIndex = (currentIndex - 1 + allImages.length) % allImages.length; // สูตรวนลูปถอยหลัง
        setSelectedImage(allImages[newIndex]);
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        const currentIndex = allImages.indexOf(selectedImage);
        const newIndex = (currentIndex + 1) % allImages.length; // สูตรวนลูปไปหน้า
        setSelectedImage(allImages[newIndex]);
    };

    return (
      // 🔥 ใช้ Fragment หุ้ม
      <>
        {isLightboxOpen && (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
                
                {/* ปุ่มปิด (Close) */}
                <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white hover:text-[#FF6B00] transition z-50 p-2">
                    <IconX size={32} />
                </button>

                {/* 🔥 3. ปุ่มเลื่อนซ้าย (แสดงเฉพาะเมื่อมีมากกว่า 1 รูป) */}
                {allImages.length > 1 && (
                    <button 
                        onClick={handlePrevImage}
                        className="absolute left-2 md:left-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-50"
                    >
                        <IconChevronLeft size={40} />
                    </button>
                )}

                {/* รูปภาพ */}
                <SafeImage 
                    src={selectedImage} 
                    alt="Full View" 
                    className="max-w-full max-h-[85vh] object-contain rounded-lg animate-fade-in select-none" // เพิ่ม select-none กันไฮไลท์
                    onClick={(e) => e.stopPropagation()} 
                />

                {/* 🔥 4. ปุ่มเลื่อนขวา */}
                {allImages.length > 1 && (
                    <button 
                        onClick={handleNextImage}
                        className="absolute right-2 md:right-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-50"
                    >
                        <IconChevronRight size={40} />
                    </button>
                )}

                {/* (แถม) ตัวบอกจำนวนรูป เช่น 1/6 */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-4 py-1 rounded-full text-sm font-medium">
                        {allImages.indexOf(selectedImage) + 1} / {allImages.length}
                    </div>
                )}
            </div>
        )}
        
        {/* ตัวเนื้อหาหลัก (ที่มี Animation) */}
        <div className="max-w-6xl mx-auto px-4 py-8 pb-20 relative animate-fade-in">
            {/* HEADER BAR */}
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={() => navigate('/#cafes-section')}
                    className="group flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition"
                >
                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition">
                        <IconChevronLeft size={24} />
                    </div>
                    <span className="font-bold text-gray-900 group-hover:text-[#FF6B00]">ย้อนกลับ</span>
                </button>
                
                <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF6B00] transition shadow-sm">
                    <IconShare size={20}/>
                </button>
            </div>

            {/* CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                    <div className="rounded-2xl overflow-hidden shadow-md mb-3 h-[300px] md:h-[400px] bg-gray-100 relative group cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                        <SafeImage src={selectedImage} alt={cafe.name} className="w-full h-full object-cover transition-opacity duration-300" />
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1"><IconZoomIn size={12} color="white"/> แตะเพื่อขยาย</div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-6 md:gap-2 md:pb-0 scrollbar-hide snap-x">
                        {(cafe.gallery || [cafe.image]).map((img, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setSelectedImage(img)} 
                                className={`flex-shrink-0 snap-start w-24 h-24 md:w-auto md:h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === img ? 'border-[#FF6B00] scale-95 ring-2 ring-[#FF6B00]/30' : 'border-transparent hover:border-gray-300'}`}
                            >
                                <SafeImage src={img} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex flex-col">
                    <div className="mb-6">
                        <span className="bg-[#FF69B4] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3 inline-block">K-Pop Cafe</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{cafe.name}</h1>
                        <div className="flex items-center text-gray-500 text-sm"><IconMapPin size={16} className="mr-1"/> {cafe.location}</div>
                    </div>
                    
                    {/* TABS */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                        <button onClick={() => setActiveTab('general')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>สำหรับลูกค้า</button>
                        <button onClick={() => setActiveTab('venue')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'venue' ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><IconBriefcase size={16} /> สำหรับผู้จัด</button>
                    </div>

                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                                <div className="flex gap-4 items-start"><IconClock className="text-gray-400 mt-1" /><div><p className="font-bold text-sm">เวลาทำการ</p><p className="text-sm whitespace-pre-line text-gray-600">{cafe.opening_hours}</p></div></div>
                                <div className="flex gap-4 items-start"><div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">🏷️</div><div><p className="font-bold text-sm">ราคาเฉลี่ย</p><p className="text-sm text-[#FF6B00] font-bold">{cafe.price_range}</p></div></div>
                            </div>
                            <div className="flex gap-3"><a href={cafe.map_link || "#"} target="_blank" rel="noreferrer" className="flex-1 bg-[#FF6B00] hover:bg-[#E65000] text-white py-3 rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-md active:scale-95"><IconMapPin size={18} /> ดูแผนที่</a><a href={`tel:${cafe.phone || ""}`} className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition flex justify-center items-center gap-2 active:scale-95"><IconPhone size={18} /> โทร</a></div>
                        </div>
                    )}
                    
                    {activeTab === 'venue' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 space-y-5">
                                <div className="flex items-center gap-2 mb-2"><span className="w-2 h-6 bg-[#FF6B00] rounded-full"></span><h3 className="font-bold text-lg text-gray-900">ข้อมูลสถานที่จัดงาน</h3></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-orange-100"><div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><IconUsers size={12}/> ความจุ</div><div className="font-bold text-gray-900">{cafe.capacity || "สอบถามร้าน"}</div></div>
                                    <div className="bg-white p-3 rounded-xl border border-orange-100"><div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><IconLayout size={12}/> พื้นที่</div><div className="font-bold text-gray-900">Indoor / Outdoor</div></div>
                                </div>
                                <div><p className="font-bold text-sm mb-2 text-gray-700">สิ่งอำนวยความสะดวก</p><div className="flex flex-wrap gap-2">{(cafe.facilities || ["สอบถามร้าน"]).map((fac, i) => (<span key={i} className="text-xs bg-white border border-orange-100 px-3 py-1.5 rounded-full text-gray-600">{fac}</span>))}</div></div>
                            </div>
                            <button onClick={handleBooking} className="w-full bg-[#1E293B] hover:bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition active:scale-95">สนใจจัดงานที่นี่ <span className="text-gray-400 text-sm font-normal">(Contact Venue)</span></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 border-t border-gray-100 pt-10">
                <div className="lg:col-span-7"><h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center gap-2">📝 รายละเอียด</h2><div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line mb-8">{cafe.description}</div></div>
                <div className="lg:col-span-5 space-y-8">
                    {activeTab === 'general' && cafe.menu && (<div className="bg-[#FFF8F0] p-6 rounded-2xl border border-orange-100 shadow-sm"><h3 className="font-bold text-lg mb-4 text-[#8B5E3C] flex items-center gap-2">⭐ เมนูแนะนำ</h3><div className="space-y-4">{['food', 'dessert', 'drink'].map(type => cafe.menu[type] && (<div key={type}><p className="text-xs font-bold text-gray-400 uppercase mb-2">{type}</p>{cafe.menu[type].map((m, i) => (<div key={i} className="flex justify-between text-sm border-b border-orange-100 pb-1 mb-1 last:border-0"><span>{m.name}</span><span className="text-[#FF6B00] font-bold">{m.price}</span></div>))}</div>))}</div></div>)}
                </div>
            </div>

            <div className="mt-16 pt-10 border-t border-gray-200">
                <h3 className="text-xl font-bold mb-6 text-gray-900">คาเฟ่แนะนำอื่นๆ</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {otherCafes.map((c) => (<div key={c.id} onClick={() => navigate(`/cafe/${c.id}`)} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition cursor-pointer"><div className="h-32 md:h-40 overflow-hidden"><SafeImage src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/></div><div className="p-3"><h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#FF6B00] transition">{c.name}</h4><div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400"><IconMapPin size={10}/> {(c.location || "").split(',')[0]}</div></div></div>))}
                </div>
            </div>
        </div>
      </>
    );
};