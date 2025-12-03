import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

import { 
    IconChevronRight, IconSort, IconFilter, IconCalendar, IconMapPin, IconClock, IconChevronLeft
} from './icons/Icons';
import { SAMPLE_NEWS, SAMPLE_EVENTS, SAMPLE_CAFES } from '../data/mockData';
import { ScrollableRow, EmptyState, SafeImage, SkeletonNews, SkeletonEvent, SkeletonCafe } from './ui/UIComponents';

// 🔥 Import การ์ดมาใช้ (สำคัญมาก)
import { NewsCard, EventCard, CafeCard } from './ui/CardComponents';

// ==========================================
// 1. HOME PAGE
// ==========================================
export const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [isLoading, setIsLoading] = useState(false); 
  const [homeNewsFilter, setHomeNewsFilter] = useState("ทั้งหมด");
  const [eventFilter, setEventFilter] = useState("ทั้งหมด");
  const [eventSort, setEventSort] = useState("upcoming");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filteredHomeEvents, setFilteredHomeEvents] = useState(SAMPLE_EVENTS);

  // Logic: Scroll to ID from URL hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); 
      }
    }
  }, [location]);

  // Logic: Filter Events
  useEffect(() => {
    let result = [...SAMPLE_EVENTS];
    if (eventFilter !== "ทั้งหมด") result = result.filter(event => (event.tags && event.tags.includes(eventFilter)) || event.type === eventFilter);
    const mockCurrentDate = new Date(2025, 11, 1);
    if (timeframeFilter !== 'all') {
        result = result.filter(e => {
            if (!e.start_iso) return false;
            try {
                const y = parseInt(e.start_iso.substring(0, 4)); const m = parseInt(e.start_iso.substring(4, 6)) - 1; const d = parseInt(e.start_iso.substring(6, 8));
                const eventDate = new Date(y, m, d);
                if (isNaN(eventDate.getTime())) return false;
                if (timeframeFilter === 'this_month') return eventDate.getMonth() === mockCurrentDate.getMonth() && eventDate.getFullYear() === mockCurrentDate.getFullYear();
                else if (timeframeFilter === 'next_month') {
                    let nm = mockCurrentDate.getMonth() + 1; let ny = mockCurrentDate.getFullYear();
                    if (nm > 11) { nm = 0; ny++; }
                    return eventDate.getMonth() === nm && eventDate.getFullYear() === ny;
                }
            } catch (err) { return false; }
            return true;
        });
    }
    if (eventSort === 'newest') result.sort((a, b) => (b.announced_iso || '').localeCompare(a.announced_iso || ''));
    else result.sort((a, b) => (a.start_iso || '').localeCompare(b.start_iso || ''));
    setFilteredHomeEvents(result);
  }, [eventFilter, eventSort, timeframeFilter]);

  const homeNews = SAMPLE_NEWS.filter(n => homeNewsFilter === 'ทั้งหมด' || n.category === homeNewsFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16">
        
        {/* HERO */}
        <div className="bg-gradient-to-r from-[#FF6B00] to-[#E11D48] rounded-3xl p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full blur-3xl -ml-10 -mb-10"></div>
            <div className="relative z-10 text-center md:text-left mb-4 md:mb-0"><h1 className="text-2xl md:text-3xl font-extrabold mb-2">The Popup Plan</h1><p className="text-white/90 text-sm md:text-base font-medium">รวมทุกอีเวนต์ K-Pop ครบ จบ ในที่เดียว</p></div>
            <div className="relative z-10"><button onClick={() => { document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' }) }} className="bg-white text-[#E11D48] px-5 py-2 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 transition active:scale-95">สำรวจอีเวนต์</button></div>
        </div>
        
        {/* NEWS SECTION (แก้แล้ว: ใช้ NewsCard แทน code เก่า) */}
        <section id="news-section" className="mt-8">
            <div className="flex justify-between items-center mb-4 border-l-4 border-[#0047FF] pl-4"><h2 className="text-2xl font-bold text-gray-900">Latest News</h2><button onClick={() => navigate('/search?tab=news')} className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1">ดูทั้งหมด <IconChevronRight size={16}/></button></div>
            <div className="flex flex-wrap gap-2 mb-6">{["ทั้งหมด", "K-pop", "T-pop"].map(filter => (<button key={filter} onClick={() => setHomeNewsFilter(filter)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${homeNewsFilter === filter ? "bg-[#FF6B00] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>{filter}</button>))}</div>
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x -mx-4 px-4 scroll-pl-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 md:mx-0 md:px-0 scrollbar-hide">
                {isLoading ? [...Array(4)].map((_, i) => <SkeletonNews key={i} />) : homeNews.slice(0, 8).map((news, index) => (
                    // 🔥 ใช้ NewsCard ตัวใหม่ (Text อยู่ล่าง ไม่มีเงา)
                    <div key={news.id} className={`flex-shrink-0 w-[85vw] sm:w-[350px] md:w-auto snap-start ${index >= 6 ? 'md:hidden lg:block' : ''}`}>
                        <NewsCard 
                            item={news} 
                            onClick={() => navigate(`/news/${news.id}`)} 
                        />
                    </div>
                ))}
            </div>
        </section>

        {/* EVENTS SECTION (ใช้ EventCard) */}
        <section id="events-section">
            <div className="flex flex-col mb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                     <div className="flex items-center justify-between w-full md:w-auto">
                         <div className="border-l-4 border-[#0047FF] pl-4"><h2 className="text-2xl font-bold text-gray-900">ตาราง Event</h2></div>
                         <div className="flex items-center gap-3 md:hidden">
                             <button onClick={() => setShowMobileFilters(!showMobileFilters)} className={`p-2 rounded-full transition ${showMobileFilters ? 'bg-orange-100 text-[#FF6B00]' : 'text-gray-500 hover:bg-gray-100'}`}><IconFilter size={20}/></button>
                             <button onClick={() => navigate('/search?tab=events')} className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1">ดูทั้งหมด <IconChevronRight size={16}/></button>
                         </div>
                     </div>
                    <div className="hidden md:flex flex-1 items-center justify-end gap-3 ml-4">
                        <div className="flex gap-2 shrink-0">
                            <select className="pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none" value={timeframeFilter} onChange={(e) => setTimeframeFilter(e.target.value)}><option value="all">ทุกช่วงเวลา</option><option value="this_month">เดือนนี้</option><option value="next_month">เดือนหน้า</option></select>
                            <div className="relative"><select className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none" value={eventSort} onChange={(e) => setEventSort(e.target.value)}><option value="upcoming">ใกล้วันงาน</option><option value="newest">ประกาศล่าสุด</option></select><div className="absolute left-2.5 top-2 text-gray-400 pointer-events-none"><IconSort size={14} /></div></div>
                        </div>
                        <button onClick={() => navigate('/search?tab=events')} className="shrink-0 text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1 ml-2">ดูทั้งหมด <IconChevronRight size={16}/></button>
                    </div>
                </div>
                <ScrollableRow className="pb-2 gap-2">{["ทั้งหมด", "Concert", "Fan Meeting", "Fansign", "Workshop", "Exhibition", "Fan Event", "Others"].map((filter) => (<button key={filter} onClick={() => setEventFilter(filter)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition ${eventFilter === filter ? "bg-[#FF6B00] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>{filter}</button>))}</ScrollableRow>
                {showMobileFilters && (<div className="md:hidden mt-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-top-2 fade-in duration-200"><div className="grid grid-cols-2 gap-3"><select className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00]" value={timeframeFilter} onChange={(e) => setTimeframeFilter(e.target.value)}><option value="all">ทุกช่วงเวลา</option><option value="this_month">เดือนนี้</option><option value="next_month">เดือนหน้า</option></select><div className="relative"><select className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none" value={eventSort} onChange={(e) => setEventSort(e.target.value)}><option value="upcoming">ใกล้วันงาน</option><option value="newest">ประกาศล่าสุด</option></select><div className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none"><IconSort size={14} /></div></div></div></div>)}
            </div>
            
            <ScrollableRow className="gap-4 pb-4 -mx-4 px-4 scroll-pl-4">
                {isLoading ? [...Array(5)].map((_, i) => <SkeletonEvent key={i} />) : filteredHomeEvents.length > 0 ? filteredHomeEvents.map((event) => (
                    // 🔥 ใช้ EventCard
                    <div key={event.id} className="flex-shrink-0 w-[38vw] min-w-[140px] md:w-[220px] lg:w-[260px] snap-start h-full">
                        <EventCard 
                            item={event} 
                            onClick={() => navigate(`/event/${event.id}`)} 
                            showNewBadge={eventSort === 'newest'}
                        />
                    </div>
                )) : <div className="w-full"><EmptyState title="ไม่พบกิจกรรมในช่วงเวลานี้" subtitle="ลองปรับเปลี่ยนตัวกรอง หรือดูช่วงเวลาอื่น" /></div>}
            </ScrollableRow>
        </section>

        {/* CAFES SECTION (ใช้ CafeCard) */}
        <section id="cafes-section">
            <div className="flex justify-between items-center mb-6 border-l-4 border-[#0047FF] pl-4"><h2 className="text-2xl font-bold text-gray-900">แนะนำที่จัด Fancafe</h2><button onClick={() => navigate('/search?tab=cafes')} className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1">ดูทั้งหมด <IconChevronRight size={16}/></button></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {isLoading ? [...Array(4)].map((_, i) => <SkeletonCafe key={i} />) : SAMPLE_CAFES.map((cafe) => (
                    // 🔥 ใช้ CafeCard
                    <CafeCard key={cafe.id} item={cafe} onClick={() => navigate(`/cafe/${cafe.id}`)} />
                ))}
            </div>
        </section>
    </div>
  );
};

// ==========================================
// 2. SEARCH PAGE
// ==========================================
export const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const term = (searchParams.get('q') || "").toLowerCase();
  const tabParam = searchParams.get('tab') || 'all';
  
  const [activeSearchTab, setActiveSearchTab] = useState(tabParam);
  
  useEffect(() => { setActiveSearchTab(tabParam); }, [tabParam]);
  const updateTab = (t) => {
    setActiveSearchTab(t);
    setSearchParams(prev => { prev.set('tab', t); return prev; });
  }

  const resultsNews = SAMPLE_NEWS.filter(n => n.title.toLowerCase().includes(term));
  const resultsEvents = SAMPLE_EVENTS.filter(e => e.title.toLowerCase().includes(term) || (e.artist || '').toLowerCase().includes(term) || e.location.toLowerCase().includes(term));
  const resultsCafes = SAMPLE_CAFES.filter(c => c.name.toLowerCase().includes(term) || c.location.toLowerCase().includes(term));
  const totalResults = resultsNews.length + resultsEvents.length + resultsCafes.length;
  const title = term ? `ผลการค้นหา: "${term}"` : 'รายการทั้งหมด';

  // 🔥 ใช้ Component Card ที่เราสร้าง
  const renderCard = (item, type) => {
    if (type === 'news') return <NewsCard key={item.id} item={item} onClick={() => navigate(`/news/${item.id}`)} />;
    if (type === 'event') return <EventCard key={item.id} item={item} onClick={() => navigate(`/event/${item.id}`)} />;
    if (type === 'cafe') return <CafeCard key={item.id} item={item} onClick={() => navigate(`/cafe/${item.id}`)} />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="py-6 border-b border-gray-100 mb-6">
            <button onClick={() => navigate('/')} className="text-sm text-gray-500 mb-2 hover:text-[#FF6B00] flex items-center gap-1"><IconChevronLeft size={16}/> กลับหน้าหลัก</button>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {term && <p className="text-gray-500 text-sm mt-1">พบทั้งหมด {totalResults} รายการ</p>}
        </div>
        <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
            {['all', 'news', 'events', 'cafes'].map(tab => {
                const label = tab === 'all' ? 'ทั้งหมด' : tab === 'news' ? 'ข่าวสาร' : tab === 'events' ? 'กิจกรรม' : 'คาเฟ่';
                const count = tab === 'all' ? totalResults : tab === 'news' ? resultsNews.length : tab === 'events' ? resultsEvents.length : resultsCafes.length;
                return (<button key={tab} onClick={() => updateTab(tab)} className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${activeSearchTab === tab ? 'border-[#FF6B00] text-[#FF6B00]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>{label} <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">{count}</span></button>);
            })}
        </div>
        {totalResults === 0 ? <EmptyState title="ไม่พบข้อมูลที่ค้นหา" subtitle={`ลองใช้คำค้นหาอื่นแทน "${term}" ดูนะ`} onReset={() => { setSearchParams({}); }} /> : (
            <div className="space-y-12">
                {(activeSearchTab === 'all' || activeSearchTab === 'news') && resultsNews.length > 0 && (<section>{activeSearchTab === 'all' && <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">📰 ข่าวสาร ({resultsNews.length})</h2>}<div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsNews.map(item => renderCard(item, 'news'))}</div></section>)}
                {(activeSearchTab === 'all' || activeSearchTab === 'events') && resultsEvents.length > 0 && (<section>{activeSearchTab === 'all' && <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 mt-8">🎟️ กิจกรรม ({resultsEvents.length})</h2>}<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">{resultsEvents.map(item => renderCard(item, 'event'))}</div></section>)}
                {(activeSearchTab === 'all' || activeSearchTab === 'cafes') && resultsCafes.length > 0 && (<section>{activeSearchTab === 'all' && <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 mt-8">☕ คาเฟ่ ({resultsCafes.length})</h2>}<div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsCafes.map(item => renderCard(item, 'cafe'))}</div></section>)}
            </div>
        )}
    </div>
  );
};