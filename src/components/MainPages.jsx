import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

// ✅ Import Supabase
import { supabase } from "../supabase";

// ✅ Import Icons
import {
  IconChevronRight, IconSort, IconFilter, IconCalendar, IconMapPin, 
  IconClock, IconChevronLeft, IconSearch, IconFilter as IconFilterOutline
} from "./icons/Icons";

// ✅ Import Components
import {
  ScrollableRow, EmptyState, SkeletonNews, SkeletonEvent, SkeletonCafe
} from "./ui/UIComponents";
import { NewsCard, EventCard, CafeCard } from "./ui/CardComponents";

// ==========================================
// 1. HOME PAGE
// ==========================================
export const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  // State
  const [newsList, setNewsList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [cafeList, setCafeList] = useState([]);

  // Filters
  const [homeNewsFilter, setHomeNewsFilter] = useState("ทั้งหมด");
  const [eventFilter, setEventFilter] = useState("ทั้งหมด");
  const [eventSort, setEventSort] = useState("upcoming");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filteredHomeEvents, setFilteredHomeEvents] = useState([]);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const { data: news } = await supabase.from("news").select("*").limit(10).order("id", { ascending: false });
      if (news) setNewsList(news);

      const today = new Date().toISOString(); // เอาเวลาปัจจุบัน
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .gte("start_date", today) // 🔥 เพิ่มบรรทัดนี้: start_date >= today
        .limit(20)
        .order("start_date", { ascending: true });
      if (events) setEventList(events);

      const { data: cafes } = await supabase.from("cafes").select("*").limit(8);
      if (cafes) setCafeList(cafes);

      setIsLoading(false);
    };
    fetchData();
  }, []);

  // 🔥 LOGIC: Scroll to ID (รอโหลดเสร็จค่อยเลื่อน)
  useEffect(() => {
    if (!isLoading && location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300); 
      }
    }
  }, [location, isLoading]);

  // Filter Logic
  useEffect(() => {
    let result = [...eventList];
    if (eventFilter !== "ทั้งหมด") {
      result = result.filter((event) => event.type === eventFilter);
    }
    const now = new Date();
    if (timeframeFilter !== "all") {
      result = result.filter((e) => {
        if (!e.start_date) return false;
        const eventDate = new Date(e.start_date);
        if (timeframeFilter === "this_month") {
          return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
        } else if (timeframeFilter === "next_month") {
          let nextMonth = now.getMonth() + 1;
          let nextYear = now.getFullYear();
          if (nextMonth > 11) { nextMonth = 0; nextYear++; }
          return eventDate.getMonth() === nextMonth && eventDate.getFullYear() === nextYear;
        }
        return true;
      });
    }
    if (eventSort === "newest") {
      result.sort((a, b) => b.id - a.id);
    } else {
      result.sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0));
    }
    setFilteredHomeEvents(result);
  }, [eventFilter, eventSort, timeframeFilter, eventList]);

  const filteredNews = newsList.filter((n) => {
    if (homeNewsFilter === "ทั้งหมด") return true;
    return n.category?.toLowerCase().trim() === homeNewsFilter.toLowerCase().trim();
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16">
      {/* HERO */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#E11D48] rounded-3xl p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden mt-6">
        <div className="relative z-10 text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">The Popup Plan</h1>
          <p className="text-white/90 text-sm md:text-base font-medium">รวมทุกอีเวนต์ K-Pop ครบ จบ ในที่เดียว</p>
        </div>
        <div className="relative z-10">
          <button onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-[#E11D48] px-5 py-2 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 transition active:scale-95">สำรวจอีเวนต์</button>
        </div>
      </div>

      {/* NEWS */}
      <section id="news-section" className="mt-8 scroll-mt-28">
        <div className="flex justify-between items-center mb-4 border-l-4 border-[#0047FF] pl-4">
          <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
          <button onClick={() => navigate("/news")} className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1">ดูทั้งหมด <IconChevronRight size={16} /></button>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {["ทั้งหมด", "K-pop", "T-pop"].map((filter) => (
            <button key={filter} onClick={() => setHomeNewsFilter(filter)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${homeNewsFilter === filter ? "bg-[#FF6B00] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>{filter}</button>
          ))}
        </div>
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x -mx-4 px-4 scroll-pl-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 md:mx-0 md:px-0 scrollbar-hide">
          {isLoading ? [...Array(4)].map((_, i) => <SkeletonNews key={i} />) : filteredNews.map((news, index) => (
            <div key={news.id} className={`flex-shrink-0 w-[85vw] sm:w-[350px] md:w-auto snap-start ${index >= 8 ? "hidden" : ""}`}>
                <NewsCard item={news} onClick={() => navigate(`/news/${news.id}`, { state: { fromHome: true } })} />
            </div>
          ))}
        </div>
      </section>

      {/* EVENTS */}
      <section id="events-section" className="scroll-mt-28">
        <div className="flex flex-col mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="border-l-4 border-[#FF6B00] pl-4"><h2 className="text-2xl font-bold text-gray-900">ตาราง Event</h2></div>
              <div className="flex items-center gap-3 md:hidden">
                <button onClick={() => setShowMobileFilters(!showMobileFilters)} className={`p-2 rounded-full transition ${showMobileFilters ? "bg-orange-100 text-[#FF6B00]" : "text-gray-500 hover:bg-gray-100"}`}><IconFilter size={20} /></button>
                <button onClick={() => navigate("/events")} className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1">ดูทั้งหมด <IconChevronRight size={16} /></button>
              </div>
            </div>
            <div className="hidden md:flex flex-1 items-center justify-end gap-3 ml-4">
              <div className="flex gap-2 shrink-0">
                <select className="pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none cursor-pointer" value={timeframeFilter} onChange={(e) => setTimeframeFilter(e.target.value)}>
                  <option value="all">ทุกช่วงเวลา</option>
                  <option value="this_month">เดือนนี้</option>
                  <option value="next_month">เดือนหน้า</option>
                </select>
                <div className="relative">
                  <select className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none cursor-pointer" value={eventSort} onChange={(e) => setEventSort(e.target.value)}>
                    <option value="upcoming">ใกล้วันงาน</option>
                    <option value="newest">ประกาศล่าสุด</option>
                  </select>
                  <div className="absolute left-2.5 top-2 text-gray-400 pointer-events-none"><IconSort size={14} /></div>
                </div>
              </div>
              <button onClick={() => navigate("/events")} className="shrink-0 text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1 ml-2"> ดูทั้งหมด <IconChevronRight size={16} /></button>
            </div>
          </div>
          <ScrollableRow className="pb-2 gap-2">{["ทั้งหมด", "Concert", "Fan Meeting", "Fansign", "Workshop", "Exhibition", "Fan Event", "Others"].map((filter) => (<button key={filter} onClick={() => setEventFilter(filter)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition ${eventFilter === filter ? "bg-[#FF6B00] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>{filter}</button>))}</ScrollableRow>
          {showMobileFilters && (<div className="md:hidden mt-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-top-2 fade-in duration-200"><div className="grid grid-cols-2 gap-3"><select className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00]" value={timeframeFilter} onChange={(e) => setTimeframeFilter(e.target.value)}><option value="all">ทุกช่วงเวลา</option><option value="this_month">เดือนนี้</option><option value="next_month">เดือนหน้า</option></select><div className="relative"><select className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none" value={eventSort} onChange={(e) => setEventSort(e.target.value)}><option value="upcoming">ใกล้วันงาน</option><option value="newest">ประกาศล่าสุด</option></select><div className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none"><IconSort size={14} /></div></div></div></div>)}
        </div>
        <ScrollableRow className="gap-4 pb-4 -mx-4 px-4 scroll-pl-4">
          {isLoading ? [...Array(5)].map((_, i) => <SkeletonEvent key={i} />) : filteredHomeEvents.length > 0 ? filteredHomeEvents.map((event) => (
            <div key={event.id} className="flex-shrink-0 w-[38vw] min-w-[140px] md:w-[220px] lg:w-[260px] snap-start h-full">
                <EventCard item={event} onClick={() => navigate(`/event/${event.id}`, { state: { fromHome: true } })} showNewBadge={eventSort === "newest"} />
            </div>
          )) : <EmptyState title="ไม่พบกิจกรรม" subtitle="ลองปรับตัวกรองดูนะ" />}
        </ScrollableRow>
      </section>

      {/* CAFES */}
      <section id="cafes-section" className="scroll-mt-28">
        <div className="flex justify-between items-center mb-6 border-l-4 border-purple-500 pl-4">
          <h2 className="text-2xl font-bold text-gray-900">แนะนำที่จัด Fancafe</h2>
          <button onClick={() => navigate("/cafes")} className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1">ดูทั้งหมด <IconChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {isLoading ? [...Array(4)].map((_, i) => <SkeletonCafe key={i} />) : cafeList.map((cafe) => (
            <CafeCard key={cafe.id} item={cafe} onClick={() => navigate(`/cafe/${cafe.id}`, { state: { fromHome: true } })} />
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
  const [resultsNews, setResultsNews] = useState([]);
  const [resultsEvents, setResultsEvents] = useState([]);
  const [resultsCafes, setResultsCafes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { setActiveSearchTab(tabParam); }, [tabParam]);
  const updateTab = (t) => { setActiveSearchTab(t); setSearchParams(prev => { prev.set('tab', t); return prev; }); }

  useEffect(() => {
    const fetchSearch = async () => {
        if (!term) { setResultsNews([]); setResultsEvents([]); setResultsCafes([]); return; }
        setIsLoading(true);
        const { data: news } = await supabase.from('news').select('*').or(`title.ilike.%${term}%,tags.ilike.%${term}%`).limit(10);
        if (news) setResultsNews(news);
        
        const { data: events } = await supabase.from('events').select('*').or(`title.ilike.%${term}%,location_name.ilike.%${term}%,tags.ilike.%${term}%`).limit(10);
        if (events) setResultsEvents(events);
        const { data: cafes } = await supabase.from('cafes').select('*').or(`name.ilike.%${term}%,location_text.ilike.%${term}%`).limit(10);
        if (cafes) setResultsCafes(cafes);
        setIsLoading(false);
    };
    const timeoutId = setTimeout(() => { fetchSearch(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [term]);

  const totalResults = resultsNews.length + resultsEvents.length + resultsCafes.length;
  
  const renderCard = (item, type) => {
    if (type === 'news') return <NewsCard key={item.id} item={item} onClick={() => navigate(`/news/${item.id}`)} />;
    if (type === 'event') return <EventCard key={item.id} item={item} onClick={() => navigate(`/event/${item.id}`)} />;
    if (type === 'cafe') return <CafeCard key={item.id} item={item} onClick={() => navigate(`/cafe/${item.id}`)} />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="py-6 border-b border-gray-100 mb-6 flex gap-2 items-center">
            {/* Search ใช้ navigate(-1) */}
            <button onClick={() => navigate(-1)}><IconChevronLeft size={24}/></button>
            <div><h1 className="text-2xl font-bold text-gray-900">{term ? `ผลการค้นหา: "${term}"` : 'ค้นหา'}</h1>{term && !isLoading && <p className="text-gray-500 text-sm">พบทั้งหมด {totalResults} รายการ</p>}</div>
        </div>
        <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
            {['all', 'news', 'events', 'cafes'].map(tab => {
                const label = tab === 'all' ? 'ทั้งหมด' : tab === 'news' ? 'ข่าวสาร' : tab === 'events' ? 'กิจกรรม' : 'คาเฟ่';
                const count = tab === 'all' ? totalResults : tab === 'news' ? resultsNews.length : tab === 'events' ? resultsEvents.length : resultsCafes.length;
                return (<button key={tab} onClick={() => updateTab(tab)} className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${activeSearchTab === tab ? 'border-[#FF6B00] text-[#FF6B00]' : 'border-transparent text-gray-500'}`}>{label} <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeSearchTab === tab ? 'bg-orange-100 text-[#FF6B00]' : 'bg-gray-100 text-gray-500'}`}>{count}</span></button>);
            })}
        </div>
        {totalResults === 0 && !isLoading ? <div className="text-center py-16 text-gray-400">ไม่พบข้อมูล</div> : (
            <div className="space-y-12">
                {(activeSearchTab === 'all' || activeSearchTab === 'news') && resultsNews.length > 0 && <section><h2 className="text-lg font-bold mb-4">ข่าวสาร</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsNews.map(item => renderCard(item, 'news'))}</div></section>}
                {(activeSearchTab === 'all' || activeSearchTab === 'events') && resultsEvents.length > 0 && <section><h2 className="text-lg font-bold mb-4">กิจกรรม</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsEvents.map(item => renderCard(item, 'event'))}</div></section>}
                {(activeSearchTab === 'all' || activeSearchTab === 'cafes') && resultsCafes.length > 0 && <section><h2 className="text-lg font-bold mb-4">คาเฟ่</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsCafes.map(item => renderCard(item, 'cafe'))}</div></section>}
            </div>
        )}
    </div>
  );
};

// ==========================================
// 3. SEE ALL PAGES (แก้ปุ่มย้อนกลับให้บังคับไปหา Section)
// ==========================================
export const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('news').select('*').order('id', { ascending: false }).then(({ data }) => { setNews(data || []); setLoading(false); }); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      {/* 🔥 แก้ตรงนี้: ย้อนกลับไปหา #news-section */}
      <div className="py-6 border-b border-gray-100 mb-6 flex gap-2 items-center"><button onClick={() => navigate('/#news-section')}><IconChevronLeft size={24}/></button><div><h1 className="text-2xl font-bold text-gray-900">ข่าวสารทั้งหมด</h1>{!loading && <p className="text-gray-500 text-sm">พบทั้งหมด {news.length} รายการ</p>}</div></div>
      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(8)].map((_, i) => <SkeletonNews key={i} />)}</div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">{news.map((item) => <NewsCard key={item.id} item={item} onClick={() => navigate(`/news/${item.id}`)} />)}</div>}
    </div>
  );
};

export const EventsPage = () => {
  const navigate = useNavigate();
  
  // Data State
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("upcoming");
  
  // Filtered Result State
  const [filteredEvents, setFilteredEvents] = useState([]);

  // 1. Fetch Data (ดึงงานที่ยังไม่หมดอายุมาทั้งหมดก่อน)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const todayISO = today.toISOString();

    const fetchEvents = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('events')
            .select('*')
            .gte("start_date", todayISO)
            .order('start_date', { ascending: true });
            
        if (data) {
            setEvents(data);
            setFilteredEvents(data); // เริ่มต้นโชว์ทั้งหมด
        }
        setLoading(false);
    }
    fetchEvents();
  }, []);

  // 2. Filtering Logic (ทำงานเมื่อมีการเปลี่ยน Filter)
  useEffect(() => {
    let result = [...events];

    // 2.1 กรองตามหมวดหมู่ (Category)
    if (categoryFilter !== "ทั้งหมด") {
        result = result.filter((event) => event.type === categoryFilter);
    }

    // 2.2 กรองตามเวลา (Timeframe)
    const now = new Date();
    if (timeframeFilter !== "all") {
        result = result.filter((e) => {
            if (!e.start_date) return false;
            const eventDate = new Date(e.start_date);
            
            if (timeframeFilter === "this_month") {
                return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
            } else if (timeframeFilter === "next_month") {
                let nextMonth = now.getMonth() + 1;
                let nextYear = now.getFullYear();
                if (nextMonth > 11) { nextMonth = 0; nextYear++; }
                return eventDate.getMonth() === nextMonth && eventDate.getFullYear() === nextYear;
            }
            return true;
        });
    }

    // 2.3 เรียงลำดับ (Sort)
    if (sortOrder === "newest") {
        // เรียงตาม ID (สมมติ ID มาก = ประกาศล่าสุด)
        result.sort((a, b) => b.id - a.id);
    } else {
        // เรียงตามวันที่จัดงาน (ใกล้วันงานขึ้นก่อน)
        result.sort((a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0));
    }

    setFilteredEvents(result);
  }, [categoryFilter, timeframeFilter, sortOrder, events]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
       {/* Header & Back Button */}
       <div className="py-6 border-b border-gray-100 mb-6 flex gap-2 items-center">
            <button onClick={() => navigate('/#events-section')}><IconChevronLeft size={24}/></button>
            <div>
                <h1 className="text-2xl font-bold text-gray-900">กิจกรรมทั้งหมด</h1>
                {!loading && <p className="text-gray-500 text-sm">พบทั้งหมด {filteredEvents.length} รายการ</p>}
            </div>
      </div>

      {/* 🔥 Filter Controls Section */}
      <div className="flex flex-col mb-8 gap-4">
        {/* Dropdowns (ขวาบน) */}
        <div className="flex justify-end gap-3">
            <select
                className="pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] cursor-pointer"
                value={timeframeFilter}
                onChange={(e) => setTimeframeFilter(e.target.value)}
            >
                <option value="all">ทุกช่วงเวลา</option>
                <option value="this_month">เดือนนี้</option>
                <option value="next_month">เดือนหน้า</option>
            </select>
            <div className="relative">
                <select
                    className="w-full pl-8 pr-8 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none cursor-pointer"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="upcoming">ใกล้วันงาน</option>
                    <option value="newest">ประกาศล่าสุด</option>
                </select>
                <div className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none">
                    <IconSort size={14} />
                </div>
            </div>
        </div>

        {/* Category Tabs (เลื่อนซ้ายขวาได้) */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {["ทั้งหมด", "Concert", "Fan Meeting", "Fansign", "Workshop", "Exhibition", "Fan Event", "Others"].map((filter) => (
              <button
                key={filter}
                onClick={() => setCategoryFilter(filter)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition flex-shrink-0 ${
                  categoryFilter === filter
                    ? "bg-[#FF6B00] text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => <SkeletonEvent key={i} />)}
           </div>
      ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
              {filteredEvents.length > 0 ? (
                  filteredEvents.map((item) => (
                      <EventCard key={item.id} item={item} onClick={() => navigate(`/event/${item.id}`)} />
                  ))
              ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">🔍</div>
                      <p className="font-medium">ไม่พบกิจกรรมในหมวดหมู่นี้</p>
                      <button onClick={() => { setCategoryFilter("ทั้งหมด"); setTimeframeFilter("all"); }} className="mt-4 text-[#FF6B00] text-sm font-bold hover:underline">
                          ล้างตัวกรอง
                      </button>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export const CafesPage = () => {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { supabase.from('cafes').select('*').order('id', { ascending: false }).then(({ data }) => { setCafes(data || []); setLoading(false); }); }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      {/* 🔥 แก้ตรงนี้: ย้อนกลับไปหา #cafes-section */}
      <div className="py-6 border-b border-gray-100 mb-6 flex gap-2 items-center"><button onClick={() => navigate('/#cafes-section')}><IconChevronLeft size={24}/></button><div><h1 className="text-2xl font-bold text-gray-900">รวมคาเฟ่จัดงาน</h1>{!loading && <p className="text-gray-500 text-sm">พบทั้งหมด {cafes.length} รายการ</p>}</div></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{cafes.map((item) => <CafeCard key={item.id} item={item} onClick={() => navigate(`/cafe/${item.id}`)} />)}</div>
    </div>
  );
};