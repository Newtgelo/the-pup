import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

// 🔥 1. Import Supabase
import { supabase } from "../supabase";

import {
  IconChevronRight,
  IconSort,
  IconFilter,
  IconCalendar,
  IconMapPin,
  IconClock,
  IconChevronLeft,
} from "./icons/Icons";

// (ลบ SAMPLE_... ออก ไม่ใช้แล้ว)
import {
  ScrollableRow,
  EmptyState,
  SafeImage,
  SkeletonNews,
  SkeletonEvent,
  SkeletonCafe,
} from "./ui/UIComponents";
import { NewsCard, EventCard, CafeCard } from "./ui/CardComponents";

// ==========================================
// 1. HOME PAGE
// ==========================================
export const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true); // เริ่มต้นเป็น true เพื่อโหลดยาวๆ

  // State สำหรับข้อมูลจริงจาก DB
  const [newsList, setNewsList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [cafeList, setCafeList] = useState([]);

  const [homeNewsFilter, setHomeNewsFilter] = useState("ทั้งหมด");
  const [eventFilter, setEventFilter] = useState("ทั้งหมด");
  const [eventSort, setEventSort] = useState("upcoming");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filteredHomeEvents, setFilteredHomeEvents] = useState([]);

  // 🔥 FETCH DATA FROM SUPABASE
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // 1. ดึงข่าว (News) - แก้ Limit เป็น 10 ตรงนี้! 👇
      const { data: news } = await supabase
        .from("news")
        .select("*")
        .limit(10) // ✅ อยากได้กี่ข่าวแก้ตรงนี้ (ใส่ 10 เพื่อให้ MMA มา)
        .order("id", { ascending: false });

      if (news) setNewsList(news);

      // 2. ดึงอีเวนต์ (Events)
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .limit(20)
        .order("start_date", { ascending: true });

      if (events) setEventList(events);

      // 3. ดึงคาเฟ่ (Cafes)
      const { data: cafes } = await supabase.from("cafes").select("*").limit(8);

      if (cafes) setCafeList(cafes);

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Logic: Scroll to ID
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  // Logic: Filter Events (ปรับให้ใช้ eventList จาก DB)
  useEffect(() => {
    let result = [...eventList]; // ใช้ข้อมูลจริงแทน SAMPLE_EVENTS

    // กรองประเภท
    if (eventFilter !== "ทั้งหมด") {
      result = result.filter((event) => event.type === eventFilter);
    }

    // กรองเวลา (Timeframe) - ปรับ Logic ให้รองรับ Date object ของ DB
    const now = new Date();
    if (timeframeFilter !== "all") {
      result = result.filter((e) => {
        if (!e.start_date) return false;
        const eventDate = new Date(e.start_date);
        if (timeframeFilter === "this_month") {
          return (
            eventDate.getMonth() === now.getMonth() &&
            eventDate.getFullYear() === now.getFullYear()
          );
        } else if (timeframeFilter === "next_month") {
          let nextMonth = now.getMonth() + 1;
          let nextYear = now.getFullYear();
          if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
          }
          return (
            eventDate.getMonth() === nextMonth &&
            eventDate.getFullYear() === nextYear
          );
        }
        return true;
      });
    }

    // เรียงลำดับ
    if (eventSort === "newest") {
      result.sort((a, b) => b.id - a.id); // เรียงตาม ID (ตัวใหม่ ID มากกว่า)
    } else {
      // เรียงตามวันที่จัดงาน
      result.sort(
        (a, b) => new Date(a.start_date || 0) - new Date(b.start_date || 0)
      );
    }

    setFilteredHomeEvents(result);
  }, [eventFilter, eventSort, timeframeFilter, eventList]);

  // Filter News (Frontend Side)
  const filteredNews = newsList.filter(
    (n) => homeNewsFilter === "ทั้งหมด" || n.category === homeNewsFilter
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16">
      {/* HERO */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#E11D48] rounded-3xl p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full blur-3xl -ml-10 -mb-10"></div>
        <div className="relative z-10 text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            The Popup Plan
          </h1>
          <p className="text-white/90 text-sm md:text-base font-medium">
            รวมทุกอีเวนต์ K-Pop ครบ จบ ในที่เดียว
          </p>
        </div>
        <div className="relative z-10">
          <button
            onClick={() => {
              document
                .getElementById("events-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-white text-[#E11D48] px-5 py-2 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 transition active:scale-95"
          >
            สำรวจอีเวนต์
          </button>
        </div>
      </div>

      {/* NEWS SECTION */}
      <section id="news-section" className="mt-8">
        <div className="flex justify-between items-center mb-4 border-l-4 border-[#0047FF] pl-4">
          <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
          <button
            onClick={() => navigate("/search?tab=news")}
            className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1"
          >
            ดูทั้งหมด <IconChevronRight size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {["ทั้งหมด", "K-pop", "T-pop"].map((filter) => (
            <button
              key={filter}
              onClick={() => setHomeNewsFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                homeNewsFilter === filter
                  ? "bg-[#FF6B00] text-white"
                  : "bg-white border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x -mx-4 px-4 scroll-pl-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:gap-6 md:overflow-visible md:pb-0 md:mx-0 md:px-0 scrollbar-hide">
          {isLoading
            ? [...Array(4)].map((_, i) => <SkeletonNews key={i} />)
            : filteredNews.map((news, index) => (
                <div
                  key={news.id}
                  className={`flex-shrink-0 w-[85vw] sm:w-[350px] md:w-auto snap-start ${
                    index >= 8 ? "hidden" : ""
                  }`}
                >
                  <NewsCard
                    item={news}
                    onClick={() => navigate(`/news/${news.id}`)}
                  />
                </div>
              ))}
        </div>
      </section>

      {/* EVENTS SECTION */}
      <section id="events-section">
        <div className="flex flex-col mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="border-l-4 border-[#0047FF] pl-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  ตาราง Event
                </h2>
              </div>
              <div className="flex items-center gap-3 md:hidden">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`p-2 rounded-full transition ${
                    showMobileFilters
                      ? "bg-orange-100 text-[#FF6B00]"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <IconFilter size={20} />
                </button>
                <button
                  onClick={() => navigate("/search?tab=events")}
                  className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1"
                >
                  ดูทั้งหมด <IconChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="hidden md:flex flex-1 items-center justify-end gap-3 ml-4">
              <div className="flex gap-2 shrink-0">
                <select
                  className="pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none"
                  value={timeframeFilter}
                  onChange={(e) => setTimeframeFilter(e.target.value)}
                >
                  <option value="all">ทุกช่วงเวลา</option>
                  <option value="this_month">เดือนนี้</option>
                  <option value="next_month">เดือนหน้า</option>
                </select>
                <div className="relative">
                  <select
                    className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none"
                    value={eventSort}
                    onChange={(e) => setEventSort(e.target.value)}
                  >
                    <option value="upcoming">ใกล้วันงาน</option>
                    <option value="newest">ประกาศล่าสุด</option>
                  </select>
                  <div className="absolute left-2.5 top-2 text-gray-400 pointer-events-none">
                    <IconSort size={14} />
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate("/search?tab=events")}
                className="shrink-0 text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1 ml-2"
              >
                ดูทั้งหมด <IconChevronRight size={16} />
              </button>
            </div>
          </div>
          <ScrollableRow className="pb-2 gap-2">
            {[
              "ทั้งหมด",
              "Concert",
              "Fan Meeting",
              "Fansign",
              "Workshop",
              "Exhibition",
              "Fan Event",
              "Others",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setEventFilter(filter)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  eventFilter === filter
                    ? "bg-[#FF6B00] text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </ScrollableRow>
          {showMobileFilters && (
            <div className="md:hidden mt-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="grid grid-cols-2 gap-3">
                <select
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00]"
                  value={timeframeFilter}
                  onChange={(e) => setTimeframeFilter(e.target.value)}
                >
                  <option value="all">ทุกช่วงเวลา</option>
                  <option value="this_month">เดือนนี้</option>
                  <option value="next_month">เดือนหน้า</option>
                </select>
                <div className="relative">
                  <select
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none"
                    value={eventSort}
                    onChange={(e) => setEventSort(e.target.value)}
                  >
                    <option value="upcoming">ใกล้วันงาน</option>
                    <option value="newest">ประกาศล่าสุด</option>
                  </select>
                  <div className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none">
                    <IconSort size={14} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ScrollableRow className="gap-4 pb-4 -mx-4 px-4 scroll-pl-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => <SkeletonEvent key={i} />)
          ) : filteredHomeEvents.length > 0 ? (
            filteredHomeEvents.map((event) => (
              <div
                key={event.id}
                className="flex-shrink-0 w-[38vw] min-w-[140px] md:w-[220px] lg:w-[260px] snap-start h-full"
              >
                <EventCard
                  item={event}
                  onClick={() => navigate(`/event/${event.id}`)}
                  showNewBadge={eventSort === "newest"}
                />
              </div>
            ))
          ) : (
            <div className="w-full">
              <EmptyState
                title="ไม่พบกิจกรรมในช่วงเวลานี้"
                subtitle="ลองปรับเปลี่ยนตัวกรอง หรือดูช่วงเวลาอื่น"
              />
            </div>
          )}
        </ScrollableRow>
      </section>

      {/* CAFES SECTION */}
      <section id="cafes-section">
        <div className="flex justify-between items-center mb-6 border-l-4 border-[#0047FF] pl-4">
          <h2 className="text-2xl font-bold text-gray-900">
            แนะนำที่จัด Fancafe
          </h2>
          <button
            onClick={() => navigate("/search?tab=cafes")}
            className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1"
          >
            ดูทั้งหมด <IconChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {isLoading
            ? [...Array(4)].map((_, i) => <SkeletonCafe key={i} />)
            : cafeList.map((cafe) => (
                <CafeCard
                  key={cafe.id}
                  item={cafe}
                  onClick={() => navigate(`/cafe/${cafe.id}`)}
                />
              ))}
        </div>
      </section>
    </div>
  );
};

// ==========================================
// 2. SEARCH PAGE (Real Database Version)
// ==========================================
export const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const term = (searchParams.get('q') || "").toLowerCase();
  const tabParam = searchParams.get('tab') || 'all';
  
  const [activeSearchTab, setActiveSearchTab] = useState(tabParam);
  const [isLoading, setIsLoading] = useState(false);

  // State เก็บผลลัพธ์จริง
  const [resultsNews, setResultsNews] = useState([]);
  const [resultsEvents, setResultsEvents] = useState([]);
  const [resultsCafes, setResultsCafes] = useState([]);

  useEffect(() => { setActiveSearchTab(tabParam); }, [tabParam]);

  const updateTab = (t) => {
    setActiveSearchTab(t);
    setSearchParams(prev => { prev.set('tab', t); return prev; });
  }

  // 🔥 FETCH SEARCH RESULTS
  useEffect(() => {
    const fetchSearch = async () => {
        if (!term) {
            setResultsNews([]); setResultsEvents([]); setResultsCafes([]);
            return;
        }
        setIsLoading(true);

        // 1. ค้นหาข่าว (จาก Title หรือ Tags)
        const { data: news } = await supabase
            .from('news')
            .select('*')
            .or(`title.ilike.%${term}%,tags.ilike.%${term}%`) // ค้นทั้งชื่อและแท็ก
            .limit(10);
        if (news) setResultsNews(news);

        // 2. ค้นหากิจกรรม
        const { data: events } = await supabase
            .from('events')
            .select('*')
            .or(`title.ilike.%${term}%,location_name.ilike.%${term}%,tags.ilike.%${term}%`) 
            .limit(10);
        if (events) setResultsEvents(events);

        // 3. ค้นหาคาเฟ่
        const { data: cafes } = await supabase
            .from('cafes')
            .select('*')
            .or(`name.ilike.%${term}%,location_text.ilike.%${term}%`)
            .limit(10);
        if (cafes) setResultsCafes(cafes);

        setIsLoading(false);
    };

    // ทำ Debounce เล็กน้อย (รอพิมพ์เสร็จ 0.5 วิ ค่อยค้นหา)
    const timeoutId = setTimeout(() => {
        fetchSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [term]);

  const totalResults = resultsNews.length + resultsEvents.length + resultsCafes.length;
  const title = term ? `ผลการค้นหา: "${term}"` : 'กรุณาพิมพ์คำค้นหา';

  // Helper Render Card
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
            {term && !isLoading && <p className="text-gray-500 text-sm mt-1">พบทั้งหมด {totalResults} รายการ</p>}
            {isLoading && <p className="text-[#FF6B00] text-sm mt-1 animate-pulse">กำลังค้นหา...</p>}
        </div>

        <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
            {['all', 'news', 'events', 'cafes'].map(tab => {
                const label = tab === 'all' ? 'ทั้งหมด' : tab === 'news' ? 'ข่าวสาร' : tab === 'events' ? 'กิจกรรม' : 'คาเฟ่';
                const count = tab === 'all' ? totalResults : tab === 'news' ? resultsNews.length : tab === 'events' ? resultsEvents.length : resultsCafes.length;
                return (<button key={tab} onClick={() => updateTab(tab)} className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap flex items-center gap-2 ${activeSearchTab === tab ? 'border-[#FF6B00] text-[#FF6B00]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>{label} <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">{count}</span></button>);
            })}
        </div>

        {totalResults === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4"><IconFilter size={32}/></div>
                <h3 className="text-lg font-bold text-gray-900">ไม่พบข้อมูลที่ค้นหา</h3>
                <p className="text-gray-500 mt-2 text-sm">ลองค้นหาด้วยคำอื่น หรือกดดูรายการทั้งหมด</p>
                <button onClick={() => { setSearchParams({}); navigate('/'); }} className="mt-6 text-[#FF6B00] font-bold text-sm hover:underline">กลับไปหน้าแรก</button>
            </div>
        ) : (
            <div className="space-y-12 animate-fade-in">
                {/* 1. NEWS RESULTS */}
                {(activeSearchTab === 'all' || activeSearchTab === 'news') && resultsNews.length > 0 && (
                    <section>
                        {activeSearchTab === 'all' && <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">📰 ข่าวสาร ({resultsNews.length})</h2>}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {resultsNews.map(item => renderCard(item, 'news'))}
                        </div>
                    </section>
                )}

                {/* 2. EVENTS RESULTS */}
                {(activeSearchTab === 'all' || activeSearchTab === 'events') && resultsEvents.length > 0 && (
                    <section>
                        {activeSearchTab === 'all' && <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 mt-8">🎟️ กิจกรรม ({resultsEvents.length})</h2>}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {resultsEvents.map(item => renderCard(item, 'event'))}
                        </div>
                    </section>
                )}

                {/* 3. CAFES RESULTS */}
                {(activeSearchTab === 'all' || activeSearchTab === 'cafes') && resultsCafes.length > 0 && (
                    <section>
                        {activeSearchTab === 'all' && <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 mt-8">☕ คาเฟ่ ({resultsCafes.length})</h2>}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {resultsCafes.map(item => renderCard(item, 'cafe'))}
                        </div>
                    </section>
                )}
            </div>
        )}
    </div>
  );
};
