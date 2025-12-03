import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// Import Icons
import { 
    IconShare, IconCheck, IconX, IconMaximize, 
    IconCalendar, IconMapPin, IconChevronRight, IconTicket,
    IconZoomIn, IconClock, IconPhone, IconUsers, IconLayout, IconBriefcase,
    IconChevronLeft, IconInbox 
} from './icons/Icons';

// Import UI Components
import { SafeImage, NotFound } from './ui/UIComponents';

// Import Data
import { SAMPLE_NEWS, SAMPLE_EVENTS, SAMPLE_CAFES } from '../data/mockData';

// --- Helper Function ---
const findItem = (data, id) => data.find(item => item.id === parseInt(id));

// ==========================================
// 1. NEWS DETAIL
// ==========================================
export const NewsDetail = ({ onTriggerToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const news = findItem(SAMPLE_NEWS, id);

  useEffect(() => {
    if (news) document.title = `${news.title} | TPP`;
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
    <>
      {/* MOBILE FLOATING CONTROLS */}
      <div className="md:hidden fixed top-[80px] left-0 right-0 px-4 z-40 flex justify-between pointer-events-none">
          <button 
            onClick={() => navigate('/#news-section')} 
            className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"
          >
            <IconChevronLeft size={24} />
          </button>

          <button 
            onClick={handleShare}
            className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"
          >
            <IconShare size={20} />
          </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative animate-fade-in">
        
        {/* DESKTOP HEADER */}
        <div className="hidden md:flex justify-between items-center mb-6">
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
        <div className="mb-8 mt-12 md:mt-0">
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
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">🎟️ อีเวนต์ที่เกี่ยวข้อง</h3>
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
  const event = findItem(SAMPLE_EVENTS, id);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false); 
  
  useEffect(() => {
    if (event) document.title = `${event.title} | TPP`;
    return () => { document.title = "The Popup Plan"; };
  }, [event]);

  if (!event) return <NotFound title="ไม่พบกิจกรรมดังกล่าว" onBack={() => navigate('/')} />;

  const handleMapClick = () => onTriggerToast("กำลังเปิดแผนที่ Google Maps...");
  
  const addToCalendar = () => {
      if (!event.start_iso || !event.end_iso) { onTriggerToast("ไม่พบข้อมูลวันเวลา"); return; }
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start_iso}/${event.end_iso}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.full_location || event.location)}`;
      window.open(url, '_blank');
      onTriggerToast("เปิด Google Calendar แล้ว"); 
  };

  const goBack = () => {
      if (location.state?.from) {
          navigate(location.state.from);
      } else {
          navigate('/#events-section'); 
      }
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
                <SafeImage src={event.image} alt="Full View" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            </div>
      )}

      {/* MOBILE FLOATING CONTROLS */}
      <div className="md:hidden fixed top-[80px] left-0 right-0 px-4 z-40 flex justify-between pointer-events-none">
          <button onClick={goBack} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90">
            <IconChevronLeft size={24} />
          </button>
          <button onClick={handleShare} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90">
            <IconShare size={20} />
          </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 pb-32 md:pb-8 relative animate-fade-in">
        
        {/* DESKTOP HEADER */}
        <div className="hidden md:flex justify-between items-center mb-6">
            <button onClick={goBack} className="group flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition"><IconChevronLeft size={24} /></div>
                <span className="font-bold text-gray-900 group-hover:text-[#FF6B00]">ย้อนกลับ</span>
            </button>
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF6B00] transition shadow-sm"><IconShare size={20}/></button>
        </div>
        
        {/* MAIN LAYOUT */}
        <div className="relative mb-12 mt-8 md:mt-0">
            
            {/* DESKTOP */}
            <div className="hidden md:flex bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[550px]">
                <div className="w-[45%] relative bg-gray-900 cursor-pointer group overflow-hidden" onClick={() => setIsLightboxOpen(true)}>
                    <div className="absolute inset-0 bg-center bg-cover blur-xl opacity-50 scale-110" style={{ backgroundImage: `url(${event.image})` }}></div>
                    <SafeImage src={event.image} alt={event.title} className="absolute inset-0 w-full h-full object-contain z-10 transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md hover:bg-black/80 transition flex items-center justify-center border border-white/10 shadow-lg z-20"><IconMaximize size={20} /></div>
                </div>
                <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center relative">
                    <div className="mb-auto">
                        <span className="inline-block px-3 py-1 rounded-lg bg-orange-50 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-3 w-fit border border-orange-100">{event.type}</span>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">{event.title}</h1>
                    </div>
                    <div className="space-y-6 my-6">
                        <div className="flex items-start gap-4 group"><div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6B00] shadow-sm border border-orange-100 group-hover:scale-110 transition flex-shrink-0"><IconCalendar size={24} /></div><div>{event.schedules ? event.schedules.map((s, i) => (<div key={i} className="mb-1"><p className="text-gray-900 font-bold text-lg">{s.date}</p><p className="text-gray-500 text-sm">เวลา {s.time}</p></div>)) : <><p className="text-gray-900 font-bold text-lg">{event.date}</p><p className="text-gray-500">{event.time}</p></>}</div></div>
                        <div onClick={handleMapClick} className="flex items-start gap-4 group cursor-pointer hover:bg-blue-50 p-3 -ml-3 rounded-xl transition"><div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 flex-shrink-0"><IconMapPin size={24} /></div><div><p className="text-gray-900 font-bold text-lg">{event.full_location || event.location}</p><p className="text-gray-500 text-sm">Bangkok, Thailand</p></div></div>
                        <div className="flex items-start gap-4 group"><div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 shadow-sm border border-green-100 flex-shrink-0"><IconTicket size={24} /></div><div><p className="text-gray-900 font-bold text-xl">{event.price} บาท</p><p className="text-gray-500 text-sm">ราคาบัตรทั้งหมด</p></div></div>
                    </div>
                    <div className="flex gap-3 mt-auto pt-8 border-t border-dashed border-gray-200">
                        <a href={event.ticket_link} target="_blank" rel="noreferrer" className="flex-1 bg-[#FF6B00] hover:bg-[#E65000] text-white py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex justify-center items-center gap-2 active:scale-95"><IconTicket size={24} /> จองบัตรเลย</a>
                        <button onClick={addToCalendar} className="flex-1 border-2 border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-gray-700 bg-white py-4 px-6 rounded-xl font-bold text-lg transition flex justify-center items-center gap-2 active:scale-95"><IconCalendar size={24} /> เพิ่มในปฏิทิน</button>
                    </div>
                </div>
            </div>
            
            {/* MOBILE */}
            <div className="md:hidden flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="relative h-[450px] bg-gray-900 overflow-hidden cursor-pointer group" onClick={() => setIsLightboxOpen(true)}>
                    <div className="absolute inset-0 bg-center bg-cover blur-xl opacity-50 transition-transform group-hover:scale-125" style={{ backgroundImage: `url(${event.image})` }}></div>
                    <div className="absolute inset-0 flex items-center justify-center p-6"><SafeImage src={event.image} alt={event.title} className="w-full h-full object-contain rounded-lg shadow-lg z-10" /></div>
                    <div className="absolute top-4 left-4 z-20"><span className="inline-block px-2 py-1 rounded-lg bg-white/90 text-[#FF6B00] text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm">{event.type}</span></div>
                    <div className="absolute top-4 right-4 bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md transition flex items-center justify-center border border-white/10 shadow-lg z-20"><IconMaximize size={20} /></div>
                </div>
                <div className="p-6 flex flex-col">
                    <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4">{event.title}</h1>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3"><IconCalendar size={18} className="mt-1 text-[#FF6B00]"/><div>{event.schedules ? event.schedules.map((s, i) => (<div key={i}><p className="text-gray-900 font-bold text-sm">{s.date}</p><p className="text-gray-500 text-xs">{s.time}</p></div>)) : <><p className="text-gray-900 font-bold text-sm">{event.date}</p><p className="text-gray-500 text-xs">{event.time}</p></>}</div></div>
                        <div onClick={handleMapClick} className="flex items-start gap-3 cursor-pointer active:opacity-60 transition"><IconMapPin size={18} className="mt-1 text-blue-500"/><p className="text-gray-900 font-bold text-sm underline decoration-dotted underline-offset-4 decoration-gray-300">{event.full_location || event.location}</p></div>
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 px-4 md:hidden z-50 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-bottom">
          <div className="flex flex-col min-w-[80px]"><span className="text-[10px] text-gray-500">ราคาเริ่มต้น</span><span className="text-[#E11D48] font-bold text-lg leading-none">{(event.price + '').split(' ')[0]}</span></div>
          <button onClick={addToCalendar} className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition"><IconCalendar size={24} /></button>
          <a href={event.ticket_link} target="_blank" rel="noreferrer" className="flex-1 bg-[#FF6B00] text-white h-12 rounded-xl font-bold text-base flex items-center justify-center shadow-lg active:scale-95 transition">จองบัตรเลย</a>
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
    const location = useLocation(); 
    const cafe = findItem(SAMPLE_CAFES, id);
    const [activeTab, setActiveTab] = useState('general');
    const [selectedImage, setSelectedImage] = useState(cafe?.image || "");
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    
    // 🔥 Touch States for Swipe
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const minSwipeDistance = 50;

    const allImages = cafe?.gallery || (cafe?.image ? [cafe.image] : []);

    useEffect(() => {
        if (cafe) document.title = `${cafe.name} | TPP`;
        return () => { document.title = "The Popup Plan"; };
    }, [cafe]);

    useEffect(() => { if (cafe) setSelectedImage(cafe.image || (cafe.gallery && cafe.gallery[0]) || ""); }, [cafe]);

    if (!cafe) return <NotFound title="ไม่พบคาเฟ่ดังกล่าว" onBack={() => navigate('/')} />;
    
    const otherCafes = SAMPLE_CAFES.filter(c => c.id !== cafe.id).slice(0, 4);
    
    const handleBooking = () => onTriggerToast("เปิดฟอร์มติดต่อเช่าสถานที่...");
    const handleMap = () => window.open(cafe.map_link || "#", '_blank');
    const handleCall = () => window.location.href = `tel:${cafe.phone || ""}`;
    const handleShare = async () => {
        const shareData = { title: cafe.name, url: window.location.href };
        try {
            if (navigator.share) await navigator.share(shareData);
            else { await navigator.clipboard.writeText(shareData.url); onTriggerToast("คัดลอกลิงก์แล้ว"); }
        } catch (err) { console.log("Error:", err); }
    };

    // 🔥 Navigation Functions
    const handlePrevImage = (e) => {
        if(e) e.stopPropagation();
        const currentIndex = allImages.indexOf(selectedImage);
        const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        setSelectedImage(allImages[newIndex]);
    };

    const handleNextImage = (e) => {
        if(e) e.stopPropagation();
        const currentIndex = allImages.indexOf(selectedImage);
        const newIndex = (currentIndex + 1) % allImages.length;
        setSelectedImage(allImages[newIndex]);
    };

    // 🔥 Swipe Handlers
    const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
    const onTouchMove = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) handleNextImage();
        if (distance < -minSwipeDistance) handlePrevImage();
    };

    // 🔥 Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLightboxOpen) return;
            if (e.key === 'ArrowLeft') handlePrevImage();
            if (e.key === 'ArrowRight') handleNextImage();
            if (e.key === 'Escape') setIsLightboxOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen, selectedImage]);

    return (
      <>
        {isLightboxOpen && (
            <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
                <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white hover:text-[#FF6B00] transition z-50 p-2"><IconX size={32} /></button>
                {allImages.length > 1 && (<button onClick={handlePrevImage} className="hidden md:flex absolute left-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-50"><IconChevronLeft size={40} /></button>)}
                
                {/* Main Image with Swipe */}
                <div className="relative w-full max-w-5xl flex items-center justify-center" onClick={(e) => e.stopPropagation()} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
                    <SafeImage src={selectedImage} alt="Full View" className="max-w-full max-h-[85vh] object-contain rounded-lg animate-fade-in select-none" />
                    {allImages.length > 1 && (<div className="md:hidden absolute bottom-[-40px] text-white/50 text-xs flex items-center gap-2"><IconChevronLeft size={12}/> ปัดเพื่อเปลี่ยนรูป <IconChevronRight size={12}/></div>)}
                </div>

                {allImages.length > 1 && (<button onClick={handleNextImage} className="hidden md:flex absolute right-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-50"><IconChevronRight size={40} /></button>)}
                {allImages.length > 1 && (<div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium">{allImages.indexOf(selectedImage) + 1} / {allImages.length}</div>)}
            </div>
        )}
        
        <div className="md:hidden fixed top-[80px] left-0 right-0 px-4 z-40 flex justify-between pointer-events-none">
            <button onClick={() => navigate('/#cafes-section')} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconChevronLeft size={24} /></button>
            <button onClick={handleShare} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconShare size={20} /></button>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 pb-24 relative animate-fade-in">
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
                        {(cafe.gallery || [cafe.image]).map((img, idx) => (<div key={idx} onClick={() => setSelectedImage(img)} className={`flex-shrink-0 snap-start w-24 h-24 md:w-auto md:h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === img ? 'border-[#FF6B00] scale-95 ring-2 ring-[#FF6B00]/30' : 'border-transparent hover:border-gray-300'}`}><SafeImage src={img} alt={`gallery-${idx}`} className="w-full h-full object-cover" /></div>))}
                    </div>
                </div>
                
                <div className="flex flex-col">
                    <div className="mb-6">
                        <span className="bg-[#FF69B4] text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3 inline-block">K-Pop Cafe</span>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{cafe.name}</h1>
                        <div className="flex items-center text-gray-500 text-sm"><IconMapPin size={16} className="mr-1"/> {cafe.location}</div>
                    </div>
                    
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
                                    <div className="bg-white p-3 rounded-xl border border-orange-100"><div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><IconUsers size={12}/> ความจุ</div><div className="font-bold text-gray-900">{cafe.capacity || "สอบถามร้าน"}</div></div>
                                    <div className="bg-white p-3 rounded-xl border border-orange-100"><div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><IconLayout size={12}/> พื้นที่</div><div className="font-bold text-gray-900">Indoor / Outdoor</div></div>
                                </div>
                                <div><p className="font-bold text-sm mb-2 text-gray-700">สิ่งอำนวยความสะดวก</p><div className="flex flex-wrap gap-2">{(cafe.facilities || ["สอบถามร้าน"]).map((fac, i) => (<span key={i} className="text-xs bg-white border border-orange-100 px-3 py-1.5 rounded-full text-gray-600">{fac}</span>))}</div></div>
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