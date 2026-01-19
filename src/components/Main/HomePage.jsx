import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase";
import { IconChevronRight, IconSort, IconFilter } from "../icons/Icons";
import {
  ScrollableRow,
  EmptyState,
  SkeletonNews,
  SkeletonEvent,
  SkeletonCafe,
} from "../ui/UIComponents";
import { NewsCard, EventCard, CafeCard } from "../ui/CardComponents";

export const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ รวม Loading เหลือตัวเดียว เพราะเราจะโหลดตูมเดียวตอนแรก
  const [isLoading, setIsLoading] = useState(true);

  // ✅ เปลี่ยนจากเก็บ list ย่อย เป็นเก็บ "Master List" (ก้อนใหญ่)
  const [allNewsList, setAllNewsList] = useState([]); 
  
  const [eventList, setEventList] = useState([]);
  const [cafeList, setCafeList] = useState([]);
  
  const [homeNewsFilter, setHomeNewsFilter] = useState("ทั้งหมด");
  const [eventFilter, setEventFilter] = useState("ทั้งหมด");
  const [eventSort, setEventSort] = useState("upcoming");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filteredHomeEvents, setFilteredHomeEvents] = useState([]);

  // -----------------------------------------------------------------
  // 🟢 Fetch Data (ดึงทีเดียวจบ ครบทุกอย่าง)
  // -----------------------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // 1. Get News (ดึงมาเผื่อเยอะๆ เลยครับ สัก 60 อัน เพื่อให้ครอบคลุมทุกหมวด)
      // การดึง 60 rows แป๊บเดียวครับ ไม่ต่างกับ 10 rows มาก แต่ User Experience ดีกว่าเยอะ
      const { data: news } = await supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .limit(60) // 👈 ดึงมาตุนไว้ 60 อัน
        .order("date", { ascending: false });
      
      if (news) setAllNewsList(news);

      const d = new Date();
      d.setHours(d.getHours() - 4);
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2, "0")}`;

      // 2. Get Events
      const { data: events } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .or(`end_date.gte.${today},and(end_date.is.null,date.gte.${today})`)
        .order("date", { ascending: true })
        .limit(100);

      if (events) {
        setEventList(events);
        setFilteredHomeEvents(events);
      }

      // 3. Get Cafes
      const { data: cafes } = await supabase
        .from("cafes")
        .select("*")
        .eq("status", "published")
        .limit(50);

      if (cafes) {
        const shuffledCafes = cafes.sort(() => 0.5 - Math.random());
        const selectedCafes = shuffledCafes.slice(0, 8);
        setCafeList(selectedCafes);
      }

      setIsLoading(false);
    };
    fetchData();
  }, []);

  // -----------------------------------------------------------------
  // 🟡 Logic การกรองข่าว (ทำในเครื่อง ไม่ต้องรอ Server)
  // -----------------------------------------------------------------
  // กรองจาก allNewsList ที่ตุนไว้ แล้วตัดมาแค่ 10 อัน
  const displayNews = allNewsList
    .filter(news => {
      if (homeNewsFilter === "ทั้งหมด") return true;
      // กรองตามหมวดหมู่ (Check case-insensitive)
      return news.category?.toLowerCase().trim() === homeNewsFilter.toLowerCase().trim();
    })
    .slice(0, 10); // 👈 ตัดมาโชว์แค่ 10 อัน

  // -----------------------------------------------------------------
  // 🟠 Logic Events & Scroll (เหมือนเดิม)
  // -----------------------------------------------------------------
  useEffect(() => {
    let result = [...eventList];
    if (eventFilter !== "ทั้งหมด")
      result = result.filter((event) => event.category === eventFilter);
    const now = new Date();
    if (timeframeFilter !== "all") {
      result = result.filter((e) => {
        if (!e.date) return false;
        const eventDate = new Date(e.date);
        if (timeframeFilter === "this_month")
          return (
            eventDate.getMonth() === now.getMonth() &&
            eventDate.getFullYear() === now.getFullYear()
          );
        else if (timeframeFilter === "next_month") {
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
    if (eventSort === "newest") result.sort((a, b) => b.id - a.id);
    else result.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    setFilteredHomeEvents(result);
  }, [eventFilter, eventSort, timeframeFilter, eventList]);

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

  // =================================================================
  // RENDER UI
  // =================================================================
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-16">
      
      {/* -------------------- 1. NEWS SECTION -------------------- */}
      <section id="news-section" className="mt-8 scroll-mt-28">
        <div className="flex justify-between items-center mb-4 border-l-4 border-[#0047FF] pl-4">
          <h2 className="text-2xl font-bold text-gray-900 font-sans">Latest News</h2>
          <button
            onClick={() => navigate("/news")}
            className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1 font-sans"
          >
            ดูทั้งหมด <IconChevronRight size={16} />
          </button>
        </div>

        {/* Tab News */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ทั้งหมด", "K-Pop", "T-Pop", "Global"].map((filter) => (
            <button
              key={filter}
              onClick={() => setHomeNewsFilter(filter)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium 
                transition-colors duration-200 
                ${
                  homeNewsFilter === filter
                    ? "bg-[#FF6B00] text-white"
                    : "bg-white border text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }
              `}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* News Grid */}
        <div className="flex overflow-x-auto pb-4 gap-4 snap-x -mx-4 px-4 scroll-pl-4 md:mx-0 md:px-0 scrollbar-hide">
          {isLoading ? (
             // ตอนโหลดครั้งแรก
            [...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[42vw] sm:w-[350px] md:w-[260px] lg:w-[22%] snap-start"
                >
                  <SkeletonNews />
                </div>
              ))
          ) : displayNews.length > 0 ? (
                // แสดงผลจากข้อมูลที่กรองแล้ว (ไม่ต้องรอโหลด)
                displayNews.map((news) => (
                  <div
                    key={news.id}
                    className="flex-shrink-0 w-[42vw] sm:w-[350px] md:w-[260px] lg:w-[22%] snap-start"
                  >
                    <NewsCard
                      item={news}
                      onClick={() =>
                        navigate(`/news/${news.id}`, {
                          state: { fromHome: true },
                        })
                      }
                    />
                  </div>
                ))
            ) : (
                <div className="w-full text-center py-8 text-gray-400">
                    ไม่พบข่าวในหมวดนี้
                </div>
            )}
        </div>
      </section>

      {/* -------------------- 2. EVENTS SECTION -------------------- */}
      <section id="events-section" className="scroll-mt-28">
        <div className="flex flex-col mb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="border-l-4 border-[#FF6B00] pl-4">
                <h2 className="text-2xl font-bold text-gray-900 font-sans">
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
                  onClick={() => navigate("/events")}
                  className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1 font-sans"
                >
                  ดูทั้งหมด <IconChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="hidden md:flex flex-1 items-center justify-end gap-3 ml-4">
              <div className="flex gap-2 shrink-0">
                <select
                  className="pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none cursor-pointer font-sans"
                  value={timeframeFilter}
                  onChange={(e) => setTimeframeFilter(e.target.value)}
                >
                  <option value="all">ทุกช่วงเวลา</option>
                  <option value="this_month">เดือนนี้</option>
                  <option value="next_month">เดือนหน้า</option>
                </select>
                <div className="relative">
                  <select
                    className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none cursor-pointer font-sans"
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
                onClick={() => navigate("/events")}
                className="shrink-0 text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1 ml-2 font-sans"
              >
                {" "}
                ดูทั้งหมด <IconChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <ScrollableRow className="py-2 px-2 gap-2">
            {[
              "ทั้งหมด", "Concert", "Fan Meeting", "Fansign", 
              "Workshop", "Exhibition", "Fan Event", "Others",
            ].map((filter) => (
              <button
                key={filter}
                onClick={() => setEventFilter(filter)}
                className={`
                  whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium 
                  transition-colors duration-200 
                  ${
                    eventFilter === filter
                      ? "bg-[#FF6B00] text-white"
                      : "bg-white border text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                  }
                `}
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
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[38vw] min-w-[140px] md:w-[220px] lg:w-[22%] snap-start h-full"
              >
                <SkeletonEvent />
              </div>
            ))
          ) : filteredHomeEvents.length > 0 ? (
            filteredHomeEvents.map((event) => (
              <div
                key={event.id}
                className="flex-shrink-0 w-[38vw] min-w-[140px] md:w-[220px] lg:w-[22%] snap-start h-full"
              >
                <EventCard
                  item={event}
                  onClick={() =>
                    navigate(`/event/${event.id}`, {
                      state: { fromHome: true },
                    })
                  }
                  showNewBadge={eventSort === "newest"}
                />
              </div>
            ))
          ) : (
            <EmptyState title="ไม่พบกิจกรรม" subtitle="ลองปรับตัวกรองดูนะ" />
          )}
        </ScrollableRow>
      </section>

      {/* -------------------- 3. CAFES SECTION -------------------- */}
      <div id="cafes-section" className="max-w-6xl mx-auto px-4 scroll-mt-28">
        <div className="flex justify-between items-center mb-6">
          <div className="border-l-4 border-[#5607ff] pl-4">
            <h2 className="text-2xl font-bold text-gray-900 font-sans">
              แนะนำที่จัด Fancafe
            </h2>
          </div>

          <button
            onClick={() => navigate("/cafes")}
            className="text-sm text-gray-500 hover:text-[#FF6B00] flex items-center gap-1 font-sans"
          >
            ดูทั้งหมด <IconChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {isLoading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className={i >= 6 ? "hidden lg:block" : ""}>
                  <SkeletonCafe />
                </div>
              ))
            : cafeList.map((cafe, index) => (
                <div
                  key={cafe.id}
                  className={index >= 6 ? "hidden lg:block" : ""}
                >
                  <CafeCard
                    item={cafe}
                    onClick={() =>
                      navigate(`/cafe/${cafe.id}`, {
                        state: { fromHome: true },
                      })
                    }
                  />
                </div>
              ))}
        </div>
      </div>

      {/* -------------------- 4. HERO BANNER -------------------- */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between mt-6
                   bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://res.cloudinary.com/diq1nr4jb/image/upload/v1768486173/cover_web_1_lyzyli.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-black/2 z-0"></div>

        <div className="relative z-10 text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 drop-shadow-lg font-sans">
            The Popup Plan
          </h1>
          <p className="text-white/90 text-sm md:text-base font-medium drop-shadow-sm font-sans">
            รวมทุกอีเวนต์ K-Pop ครบ จบ ในที่เดียว
          </p>
        </div>
        <div className="relative z-10">
          <button
            onClick={() => navigate("/events")}
            className="bg-white text-[#e1621d] px-5 py-2 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 transition active:scale-95 font-sans"
          >
            สำรวจอีเวนต์
          </button>
        </div>
      </div>
    </div>
  );
};