import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// 🔥 Import Supabase
import { supabase } from '../supabase';

// Import Icons
import { 
    IconShare, IconX, IconMaximize, 
    IconCalendar, IconMapPin, IconChevronRight, IconTicket,
    IconZoomIn, IconClock, IconPhone, IconUsers, IconLayout, IconBriefcase,
    IconChevronLeft
} from './icons/Icons';

// Import UI Components
import { SafeImage, NotFound } from './ui/UIComponents';

// ==========================================
// 1. NEWS DETAIL
// ==========================================
export const NewsDetail = ({ onTriggerToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State สำหรับข้อมูลจริง
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [otherNews, setOtherNews] = useState([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // 1. ดึงข่าวหลัก
      const { data, error } = await supabase.from('news').select('*').eq('id', id).single();
      
      if (error) {
          console.error('Error fetching news:', error);
          setNews(null);
      } else {
          setNews(data);
          
          // 2. ดึงข่าวอื่นๆ (เอา 2 อันที่ไม่ใช่อันปัจจุบัน)
          const { data: others } = await supabase.from('news').select('*').neq('id', id).limit(2);
          if (others) setOtherNews(others);

          // 3. ดึงอีเวนต์ที่เกี่ยวข้อง (สมมติเอามาโชว์ 2 อัน)
          const { data: relEvents } = await supabase.from('events').select('*').limit(2);
          if (relEvents) setRelatedEvents(relEvents);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">กำลังโหลดข่าว...</div>;
  if (!news) return <NotFound title="ไม่พบข่าวดังกล่าว" onBack={() => navigate('/')} />;

  const handleShare = async () => {
        const shareData = { title: news.title, url: window.location.href };
        try {
            if (navigator.share) await navigator.share(shareData);
            else { await navigator.clipboard.writeText(shareData.url); onTriggerToast("คัดลอกลิงก์แล้ว"); }
        } catch (err) { console.log("Error:", err); }
  };

  return (
    <>
      {/* MOBILE FLOATING CONTROLS */}
      <div className="md:hidden fixed top-[80px] left-0 right-0 px-4 z-40 flex justify-between pointer-events-none">
          <button onClick={() => navigate('/#news-section')} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconChevronLeft size={24} /></button>
          <button onClick={handleShare} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconShare size={20} /></button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative animate-fade-in">
        <div className="hidden md:flex justify-between items-center mb-6">
            <button onClick={() => navigate('/#news-section')} className="group flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition">
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition"><IconChevronLeft size={24} /></div>
              <span className="font-bold text-gray-900 group-hover:text-[#FF6B00]">ย้อนกลับ</span>
            </button>
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF6B00] transition shadow-sm"><IconShare size={20}/></button>
        </div>

        <div className="mb-8 mt-12 md:mt-0">
          <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
              <span className="bg-[#FF6B00] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">{news.category}</span>
              <span className="text-gray-500 flex items-center gap-1"><IconClock size={14}/> {news.date}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{news.title}</h1>
        </div>
        
        <div className="rounded-2xl overflow-hidden mb-10 shadow-lg aspect-video bg-gray-100 relative group">
          <SafeImage src={news.image_url} alt={news.title} className="w-full h-full object-cover" />
        </div>

        {/* Content (แบบง่าย) */}
        <div className="max-w-3xl mx-auto mb-16">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line text-justify font-serif">{news.content}</p>
        </div>

        <hr className="border-gray-200 mb-12" />

        {/* Related Events */}
        {relatedEvents.length > 0 && (
            <div className="mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">🎟️ อีเวนต์ที่เกี่ยวข้อง</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedEvents.map(event => (
                        <div key={event.id} onClick={() => navigate(`/event/${event.id}`)} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 cursor-pointer hover:border-[#FF6B00] hover:shadow-md transition group">
                            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"><SafeImage src={event.image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/></div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[10px] font-bold text-[#FF6B00] bg-orange-50 px-2 py-0.5 rounded-full">{event.type}</span>
                                <h4 className="font-bold text-gray-900 mt-1 line-clamp-1 group-hover:text-[#FF6B00] transition">{event.title}</h4>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><IconCalendar size={12}/> {event.date_display}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1"><IconMapPin size={12}/> {event.location_name}</p>
                            </div>
                            <div className="flex items-center justify-center text-gray-300 group-hover:text-[#FF6B00]"><IconChevronRight /></div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Other News */}
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">ข่าวสารอื่นๆ ที่น่าสนใจ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {otherNews.map(n => (
                    <div key={n.id} onClick={() => { navigate(`/news/${n.id}`); window.scrollTo(0,0); }} className="cursor-pointer group">
                        <div className="aspect-video rounded-xl overflow-hidden bg-gray-200 mb-3"><SafeImage src={n.image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/></div>
                        <h4 className="font-bold text-gray-900 leading-tight group-hover:text-[#FF6B00] transition line-clamp-2">{n.title}</h4>
                        <p className="text-xs text-gray-500 mt-2">{n.date}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </>
  );
};

// ==========================================
// 2. EVENT DETAIL
// ==========================================
export const EventDetail = ({ onTriggerToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false); 
  
  useEffect(() => {
    const fetchEvent = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        if (error) {
            console.error(error);
            setEvent(null);
        } else {
            setEvent(data);
        }
        setLoading(false);
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">กำลังโหลดอีเวนต์...</div>;
  if (!event) return <NotFound title="ไม่พบกิจกรรมดังกล่าว" onBack={() => navigate('/')} />;

  const handleMapClick = () => {
      // ถ้ามีพิกัดจริง ให้เปิด Google Maps
      if (event.lat && event.lng) {
          window.open(`https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`, '_blank');
      } else {
          onTriggerToast("กำลังเปิดแผนที่...");
      }
  };
  
  const addToCalendar = () => {
      // ใช้ start_date จาก DB
      if (!event.start_date) { onTriggerToast("ไม่พบข้อมูลวันเวลา"); return; }
      const dateStr = event.start_date.replace(/-/g, ''); // 2025-12-31 -> 20251231
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location_name)}`;
      window.open(url, '_blank');
      onTriggerToast("เปิด Google Calendar แล้ว"); 
  };

  const goBack = () => {
      if (location.state?.from) { navigate(location.state.from); } 
      else { navigate('/#events-section'); }
  };
  
  const handleShare = async () => {
    const shareData = { title: event.title, url: window.location.href };
    try {
        if (navigator.share) await navigator.share(shareData);
        else { await navigator.clipboard.writeText(shareData.url); onTriggerToast("คัดลอกลิงก์แล้ว"); }
    } catch (err) { console.log("Error:", err); }
  };

  return (
    <>
      {isLightboxOpen && (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
                <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white hover:text-[#FF6B00] transition"><IconX size={32} /></button>
                <SafeImage src={event.image_url} alt="Full View" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            </div>
      )}

      <div className="md:hidden fixed top-[80px] left-0 right-0 px-4 z-40 flex justify-between pointer-events-none">
          <button onClick={goBack} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconChevronLeft size={24} /></button>
          <button onClick={handleShare} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconShare size={20} /></button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 pb-32 md:pb-8 relative animate-fade-in">
        <div className="hidden md:flex justify-between items-center mb-6">
            <button onClick={goBack} className="group flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition"><IconChevronLeft size={24} /></div>
                <span className="font-bold text-gray-900 group-hover:text-[#FF6B00]">ย้อนกลับ</span>
            </button>
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF6B00] transition shadow-sm"><IconShare size={20}/></button>
        </div>
        
        <div className="relative mb-12 mt-8 md:mt-0">
            <div className="hidden md:flex bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[550px]">
                <div className="w-[45%] relative bg-gray-900 cursor-pointer group overflow-hidden" onClick={() => setIsLightboxOpen(true)}>
                    <div className="absolute inset-0 bg-center bg-cover blur-xl opacity-50 scale-110" style={{ backgroundImage: `url(${event.image_url})` }}></div>
                    <SafeImage src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-contain z-10 transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md hover:bg-black/80 transition flex items-center justify-center border border-white/10 shadow-lg z-20"><IconMaximize size={20} /></div>
                </div>
                <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center relative">
                    <div className="mb-auto">
                        <span className="inline-block px-3 py-1 rounded-lg bg-orange-50 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-3 w-fit border border-orange-100">{event.type}</span>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">{event.title}</h1>
                    </div>
                    <div className="space-y-6 my-6">
                        <div className="flex items-start gap-4 group"><div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6B00] shadow-sm border border-orange-100 group-hover:scale-110 transition flex-shrink-0"><IconCalendar size={24} /></div><div><p className="text-gray-900 font-bold text-lg">{event.date_display}</p><p className="text-gray-500 text-sm">วันงานแสดง</p></div></div>
                        <div onClick={handleMapClick} className="flex items-start gap-4 group cursor-pointer hover:bg-blue-50 p-3 -ml-3 rounded-xl transition"><div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 flex-shrink-0"><IconMapPin size={24} /></div><div><p className="text-gray-900 font-bold text-lg">{event.location_name}</p><p className="text-gray-500 text-sm">คลิกเพื่อดูแผนที่</p></div></div>
                        <div className="flex items-start gap-4 group"><div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 shadow-sm border border-green-100 flex-shrink-0"><IconTicket size={24} /></div><div><p className="text-gray-900 font-bold text-xl">Coming Soon</p><p className="text-gray-500 text-sm">ราคาบัตร</p></div></div>
                    </div>
                    <div className="flex gap-3 mt-auto pt-8 border-t border-dashed border-gray-200">
                        <a href="#" className="flex-1 bg-[#FF6B00] hover:bg-[#E65000] text-white py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex justify-center items-center gap-2 active:scale-95"><IconTicket size={24} /> จองบัตรเลย</a>
                        <button onClick={addToCalendar} className="flex-1 border-2 border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-gray-700 bg-white py-4 px-6 rounded-xl font-bold text-lg transition flex justify-center items-center gap-2 active:scale-95"><IconCalendar size={24} /> เพิ่มในปฏิทิน</button>
                    </div>
                </div>
            </div>
            
            <div className="md:hidden flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="relative h-[450px] bg-gray-900 overflow-hidden cursor-pointer group" onClick={() => setIsLightboxOpen(true)}>
                    <div className="absolute inset-0 bg-center bg-cover blur-xl opacity-50 transition-transform group-hover:scale-125" style={{ backgroundImage: `url(${event.image_url})` }}></div>
                    <div className="absolute inset-0 flex items-center justify-center p-6"><SafeImage src={event.image_url} alt={event.title} className="w-full h-full object-contain rounded-lg shadow-lg z-10" /></div>
                    <div className="absolute top-4 left-4 z-20"><span className="inline-block px-2 py-1 rounded-lg bg-white/90 text-[#FF6B00] text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm">{event.type}</span></div>
                    <div className="absolute top-4 right-4 bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md transition flex items-center justify-center border border-white/10 shadow-lg z-20"><IconMaximize size={20} /></div>
                </div>
                <div className="p-6 flex flex-col">
                    <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4">{event.title}</h1>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3"><IconCalendar size={18} className="mt-1 text-[#FF6B00]"/><div><p className="text-gray-900 font-bold text-sm">{event.date_display}</p></div></div>
                        <div onClick={handleMapClick} className="flex items-start gap-3 cursor-pointer active:opacity-60 transition"><IconMapPin size={18} className="mt-1 text-blue-500"/><p className="text-gray-900 font-bold text-sm underline decoration-dotted underline-offset-4 decoration-gray-300">{event.location_name}</p></div>
                        <div className="flex items-start gap-3"><IconTicket size={18} className="mt-1 text-green-600"/><p className="text-gray-900 font-bold text-sm">Coming Soon</p></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
            <div className="md:col-span-7 lg:col-span-8">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 border-l-4 border-[#FF6B00] pl-4">รายละเอียดงาน</h2>
                <div className="prose prose-sm md:prose-lg text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</div>
            </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 px-4 md:hidden z-50 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-bottom">
          <button onClick={addToCalendar} className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition"><IconCalendar size={24} /></button>
          <a href="#" className="flex-1 bg-[#FF6B00] text-white h-12 rounded-xl font-bold text-base flex items-center justify-center shadow-lg active:scale-95 transition">จองบัตรเลย</a>
      </div>
    </>
  );
};

// ==========================================
// 3. CAFE DETAIL
// ==========================================
export const CafeDetail = ({ onTriggerToast }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State ข้อมูลจริง
    const [cafe, setCafe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [otherCafes, setOtherCafes] = useState([]);

    const [activeTab, setActiveTab] = useState('general');
    const [selectedImage, setSelectedImage] = useState("");
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    
    // State สำหรับโชว์ Sticky Tabs
    const [showStickyTabs, setShowStickyTabs] = useState(false);

    // Swipe States
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    // Fetch Data
    useEffect(() => {
        const fetchCafe = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('cafes').select('*').eq('id', id).single();
            if (error) {
                console.error(error);
                setCafe(null);
            } else {
                setCafe(data);
                if (data.images && data.images.length > 0) {
                    setSelectedImage(data.images[0]);
                }
                // Fetch Other Cafes
                const { data: others } = await supabase.from('cafes').select('*').neq('id', id).limit(4);
                if (others) setOtherCafes(others);
            }
            setLoading(false);
        };
        fetchCafe();
    }, [id]);

    const allImages = cafe?.images || [];

    // Logic ดักจับการ Scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowStickyTabs(true);
            } else {
                setShowStickyTabs(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">กำลังโหลดคาเฟ่...</div>;
    if (!cafe) return <NotFound title="ไม่พบคาเฟ่ดังกล่าว" onBack={() => navigate('/')} />;
    
    // Action Handlers
    const handleBooking = () => onTriggerToast("เปิดฟอร์มติดต่อเช่าสถานที่...");
    const handleMap = () => {
         if (cafe.lat && cafe.lng) {
             window.open(`https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`, '_blank');
         } else {
             onTriggerToast("กำลังเปิดแผนที่...");
         }
    };
    const handleCall = () => window.location.href = `tel:${cafe.phone || ""}`;
    
    const handleShare = async () => {
        const shareData = { title: cafe.name, url: window.location.href };
        try {
            if (navigator.share) await navigator.share(shareData);
            else { await navigator.clipboard.writeText(shareData.url); onTriggerToast("คัดลอกลิงก์แล้ว"); }
        } catch (err) { console.log("Error:", err); }
    };

    // Navigation Logic
    const handlePrevImage = (e) => { if(e) e.stopPropagation(); const idx = allImages.indexOf(selectedImage); setSelectedImage(allImages[(idx - 1 + allImages.length) % allImages.length]); };
    const handleNextImage = (e) => { if(e) e.stopPropagation(); const idx = allImages.indexOf(selectedImage); setSelectedImage(allImages[(idx + 1) % allImages.length]); };
    const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
    const onTouchMove = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
    const onTouchEnd = () => { if (!touchStart || !touchEnd) return; const d = touchStart - touchEnd; if (d > minSwipeDistance) handleNextImage(); if (d < -minSwipeDistance) handlePrevImage(); };
    
    const goBack = () => {
        if (window.history.state && window.history.state.idx > 0) navigate(-1);
        else navigate('/#cafes-section');
    };

    return (
      <>
        {/* 🔥 STICKY HEADER TAB (One Line Layout) */}
        <div 
            className={`fixed top-16 md:top-20 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40 shadow-sm transition-transform duration-300 ${showStickyTabs ? 'translate-y-0' : '-translate-y-[200%]'}`}
        >
            <div className="max-w-6xl mx-auto px-3 md:px-6 lg:px-8 flex items-center justify-between gap-2 py-2 md:py-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button onClick={goBack} className="md:hidden flex-shrink-0 text-gray-500 hover:text-[#FF6B00]"><IconChevronLeft size={24} /></button>
                    <h3 className="font-bold text-gray-900 text-sm md:text-lg truncate leading-tight flex-1">{cafe.name}</h3>
                </div>
                <div className="flex bg-gray-100 p-0.5 rounded-lg flex-shrink-0">
                    <button 
                        onClick={() => { setActiveTab('general'); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
                        className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ลูกค้า
                    </button>
                    <button 
                        onClick={() => { setActiveTab('venue'); window.scrollTo({ top: 400, behavior: 'smooth' }); }} 
                        className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-bold transition-all flex items-center gap-1 ${activeTab === 'venue' ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <span className="hidden md:inline"><IconBriefcase size={14} /></span> ผู้จัด
                    </button>
                </div>
                <button onClick={handleShare} className="md:hidden flex-shrink-0 text-gray-400 hover:text-[#FF6B00] pl-1"><IconShare size={20} /></button>
            </div>
        </div>

        {isLightboxOpen && (
            <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
                <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white hover:text-[#FF6B00] transition z-50 p-2"><IconX size={32} /></button>
                {allImages.length > 1 && (<button onClick={handlePrevImage} className="hidden md:flex absolute left-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-50"><IconChevronLeft size={40} /></button>)}
                <div className="relative w-full max-w-5xl flex items-center justify-center" onClick={(e) => e.stopPropagation()} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                    <SafeImage src={selectedImage} alt="Full View" className="max-w-full max-h-[85vh] object-contain rounded-lg animate-fade-in select-none" />
                    {allImages.length > 1 && (<div className="md:hidden absolute bottom-[-40px] text-white/50 text-xs flex items-center gap-2"><IconChevronLeft size={12}/> ปัดเพื่อเปลี่ยนรูป <IconChevronRight size={12}/></div>)}
                </div>
                {allImages.length > 1 && (<button onClick={handleNextImage} className="hidden md:flex absolute right-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-50"><IconChevronRight size={40} /></button>)}
                {allImages.length > 1 && (<div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium">{allImages.indexOf(selectedImage) + 1} / {allImages.length}</div>)}
            </div>
        )}
        
        <div className={`md:hidden fixed top-[80px] left-0 right-0 px-4 z-40 flex justify-between pointer-events-none transition-opacity duration-300 ${showStickyTabs ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button onClick={goBack} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconChevronLeft size={24} /></button>
            <button onClick={handleShare} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconShare size={20} /></button>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 relative animate-fade-in">
            <div className="hidden md:flex justify-between items-center mb-6">
                <button onClick={() => navigate('/#cafes-section')} className="group flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition">
                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition"><IconChevronLeft size={24} /></div>
                    <span className="font-bold text-gray-900 group-hover:text-[#FF6B00]">ย้อนกลับ</span>
                </button>
                <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF6B00] transition shadow-sm"><IconShare size={20}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 mt-8 md:mt-0">
                <div>
                    <div className="rounded-2xl overflow-hidden shadow-md mb-3 h-[300px] md:h-[400px] bg-gray-100 relative group cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                        <SafeImage src={selectedImage} alt={cafe.name} className="w-full h-full object-cover transition-opacity duration-300" />
                        <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition flex items-center justify-center"><IconZoomIn size={16} color="white"/></div>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-4 md:grid md:grid-cols-6 md:gap-2 md:pb-0 scrollbar-hide snap-x">
                        {(cafe.images || []).map((img, idx) => (<div key={idx} onClick={() => setSelectedImage(img)} className={`flex-shrink-0 snap-start w-24 h-24 md:w-auto md:h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === img ? 'border-[#FF6B00] scale-95 ring-2 ring-[#FF6B00]/30' : 'border-transparent hover:border-gray-300'}`}><SafeImage src={img} alt={`gallery-${idx}`} className="w-full h-full object-cover" /></div>))}
                    </div>
                </div>
                
                <div className="flex flex-col">
                    <div className="mb-6">
                        <span className="bg-[#FF69B4] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3 inline-block">K-Pop Cafe</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{cafe.name}</h1>
                        <div className="flex items-center text-gray-500 text-sm"><IconMapPin size={16} className="mr-1"/> {cafe.location_text}</div>
                    </div>
                    
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                        <button onClick={() => setActiveTab('general')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>สำหรับลูกค้า</button>
                        <button onClick={() => setActiveTab('venue')} className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'venue' ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}><IconBriefcase size={16} /> สำหรับผู้จัด</button>
                    </div>

                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                                <div className="flex gap-4 items-start"><IconClock className="text-gray-400 mt-1" /><div><p className="font-bold text-sm">เวลาทำการ</p><p className="text-sm whitespace-pre-line text-gray-600">{cafe.opening_hours}</p></div></div>
                                <div className="flex gap-4 items-start"><div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">🏷️</div><div><p className="font-bold text-sm">ราคาเฉลี่ย</p><p className="text-sm text-[#FF6B00] font-bold">~100 - 250 บาท</p></div></div>
                            </div>
                            <div className="hidden md:flex gap-3">
                                <button onClick={handleMap} className="flex-1 bg-[#FF6B00] hover:bg-[#E65000] text-white py-3 rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-md active:scale-95"><IconMapPin size={18} /> ดูแผนที่</button>
                                <button onClick={handleCall} className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition flex justify-center items-center gap-2 active:scale-95"><IconPhone size={18} /> โทร</button>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'venue' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 space-y-5">
                                <div className="flex items-center gap-2 mb-2"><span className="w-2 h-6 bg-[#FF6B00] rounded-full"></span><h3 className="font-bold text-lg text-gray-900">ข้อมูลสถานที่จัดงาน</h3></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-orange-100"><div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><IconUsers size={12}/> ความจุ</div><div className="font-bold text-gray-900">สอบถามร้าน</div></div>
                                    <div className="bg-white p-3 rounded-xl border border-orange-100"><div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><IconLayout size={12}/> พื้นที่</div><div className="font-bold text-gray-900">Indoor / Outdoor</div></div>
                                </div>
                                <div><p className="font-bold text-sm mb-2 text-gray-700">สิ่งอำนวยความสะดวก</p><div className="flex flex-wrap gap-2">{(cafe.facilities || []).map((fac, i) => (<span key={i} className="text-xs bg-white border border-orange-100 px-3 py-1.5 rounded-full text-gray-600">{fac}</span>))}</div></div>
                            </div>
                            <div className="hidden md:flex gap-3">
                                <button onClick={handleMap} className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition flex justify-center items-center gap-2 active:scale-95"><IconMapPin size={18} /> ดูแผนที่</button>
                                <button onClick={handleBooking} className="flex-1 bg-[#1E293B] hover:bg-black text-white py-3 rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-md active:scale-95"><IconBriefcase size={18} /> สนใจจัดงานที่นี่</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 border-t border-gray-100 pt-10">
                <div className="lg:col-span-7">
                    <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${activeTab === 'venue' ? 'text-[#1E293B]' : 'text-gray-900'}`}>{activeTab === 'general' ? '📝 รายละเอียดและบรรยากาศร้าน' : '🏢 รายละเอียดพื้นที่และกฎระเบียบ'}</h2>
                    {activeTab === 'venue' && (<div className="grid grid-cols-2 gap-4 mb-8"><div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col gap-2"><div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div><div><p className="font-bold text-sm">Zone A (Indoor)</p><p className="text-xs text-gray-500">รองรับ 20-30 คน</p></div></div><div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col gap-2"><div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div><div><p className="font-bold text-sm">Zone B (Counter)</p><p className="text-xs text-gray-500">รองรับ 5-10 คน</p></div></div></div>)}
                    <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line mb-8">{cafe.description}</div>
                </div>
            </div>

            <div className="mt-16 pt-10 border-t border-gray-200">
                <h3 className="text-xl font-bold mb-6 text-gray-900">คาเฟ่แนะนำอื่นๆ</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {otherCafes.map((c) => (<div key={c.id} onClick={() => navigate(`/cafe/${c.id}`)} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition cursor-pointer"><div className="h-32 md:h-40 overflow-hidden"><SafeImage src={c.images?.[0]} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500"/></div><div className="p-3"><h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#FF6B00] transition">{c.name}</h4><div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400"><IconMapPin size={10}/> {(c.location_text || "").split(',')[0]}</div></div></div>))}
                </div>
            </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 px-4 md:hidden z-50 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-bottom">
            {activeTab === 'general' ? (
                <>
                    <button onClick={handleMap} className="flex-1 bg-[#FF6B00] text-white h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"><IconMapPin size={20} /> ดูแผนที่</button>
                    <button onClick={handleCall} className="flex-1 border border-gray-200 text-gray-700 bg-white h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition"><IconPhone size={20} /> โทร</button>
                </>
            ) : (
                <>
                    <button onClick={handleMap} className="flex-1 border border-gray-200 text-gray-700 bg-white h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition"><IconMapPin size={20} /> ดูแผนที่</button>
                    <button onClick={handleBooking} className="flex-[2] bg-[#1E293B] text-white h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"><IconBriefcase size={20} /> สนใจจัดงาน</button>
                </>
            )}
        </div>
      </>
    );
};