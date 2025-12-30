import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabase";
import { IconChevronLeft } from "../icons/Icons";
import { NewsCard, EventCard, CafeCard } from "../ui/CardComponents";

export const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const term = (searchParams.get("q") || "").toLowerCase();
  const tabParam = searchParams.get("tab") || "all";
  
  const [activeSearchTab, setActiveSearchTab] = useState(tabParam);
  const [resultsNews, setResultsNews] = useState([]);
  const [resultsEvents, setResultsEvents] = useState([]);
  const [resultsCafes, setResultsCafes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { setActiveSearchTab(tabParam); }, [tabParam]);
  const updateTab = (t) => { setActiveSearchTab(t); setSearchParams((prev) => { prev.set("tab", t); return prev; }); };

  // ✅ 1. เพิ่มฟังก์ชัน: แปลงร่างคำค้นหา (Smart Keywords)
  const generateKeywords = (input) => {
    if (!input) return [];
    
    const cleanInput = input.trim().toLowerCase();
    // สร้างคำพื้นฐานโดยตัดขีด/เว้นวรรคออก (เช่น "t-pop" -> "tpop")
    const baseWord = cleanInput.replace(/[^a-z0-9]/g, ""); 
    
    // เริ่มต้นด้วยคำที่ user พิมพ์มา
    const keywords = new Set([cleanInput]); 

    // กฎพิเศษ: ถ้าเป็นคำพวกนี้ ให้เพิ่ม variation อื่นๆ เข้าไปหาด้วย
    if (baseWord === "tpop") { keywords.add("tpop"); keywords.add("t-pop"); keywords.add("t pop"); }
    if (baseWord === "kpop") { keywords.add("kpop"); keywords.add("k-pop"); keywords.add("k pop"); }
    if (baseWord === "jpop") { keywords.add("jpop"); keywords.add("j-pop"); keywords.add("j pop"); }

    return Array.from(keywords);
  };

  // ✅ 2. เพิ่มฟังก์ชัน: สร้าง Query String สำหรับ Supabase
  // มันจะเอา keywords ทุกตัว มาจับคู่กับทุกคอลัมน์
  const buildQueryString = (columns, keywords) => {
    return keywords.map(kw => 
      columns.map(col => `${col}.ilike.%${kw}%`).join(',')
    ).join(',');
  };

  useEffect(() => {
    const fetchSearch = async () => {
      // ถ้าไม่มีคำค้นหา ให้เคลียร์ผลลัพธ์
      if (!term) { setResultsNews([]); setResultsEvents([]); setResultsCafes([]); return; }
      
      setIsLoading(true);
      
      // ✅ สร้าง Keywords ทั้งหมด (เช่น พิมพ์ "tpop" -> ได้ ["tpop", "t-pop", "t pop"])
      const keywords = generateKeywords(term);
      
      // 1. ค้นหาข่าว (News) - หาใน title, tags, content
      const newsQuery = buildQueryString(['title', 'tags', 'content'], keywords);
      const { data: news } = await supabase.from("news").select("*").or(newsQuery).limit(10);
      if (news) setResultsNews(news);

      // 2. ค้นหากิจกรรม (Events) - หาใน title, location, tags
      const eventsQuery = buildQueryString(['title', 'location', 'tags'], keywords);
      const { data: events } = await supabase.from("events").select("*").or(eventsQuery).limit(10);
      if (events) setResultsEvents(events);

      // 3. ค้นหาคาเฟ่ (Cafes) - หาใน name, location_text
      const cafesQuery = buildQueryString(['name', 'location_text'], keywords);
      const { data: cafes } = await supabase.from("cafes").select("*").or(cafesQuery).limit(10);
      if (cafes) setResultsCafes(cafes);
      
      setIsLoading(false);
    };

    // Debounce: รอให้หยุดพิมพ์ 500ms ค่อยค้นหา (ลดภาระ Database)
    const timeoutId = setTimeout(() => { fetchSearch(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [term]);

  const totalResults = resultsNews.length + resultsEvents.length + resultsCafes.length;
  const renderCard = (item, type) => {
    if (type === "news") return <NewsCard key={item.id} item={item} onClick={() => navigate(`/news/${item.id}`)} />;
    if (type === "event") return <EventCard key={item.id} item={item} onClick={() => navigate(`/event/${item.id}`)} />;
    if (type === "cafe") return <CafeCard key={item.id} item={item} onClick={() => navigate(`/cafe/${item.id}`)} />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      <div className="py-6 border-b border-gray-100 mb-6 flex gap-2 items-center">
        <button onClick={() => navigate(-1)}><IconChevronLeft size={24} /></button>
        <div>
          {/* ปรับ UI Header นิดหน่อย */}
          <h1 className="text-2xl font-bold text-gray-900">{term ? `ผลการค้นหา: "${term}"` : "ค้นหา"}</h1>
          {term && !isLoading && (<p className="text-gray-500 text-sm">พบทั้งหมด {totalResults} รายการ</p>)}
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
        {["all", "news", "events", "cafes"].map((tab) => {
          const label = tab === "all" ? "ทั้งหมด" : tab === "news" ? "ข่าวสาร" : tab === "events" ? "กิจกรรม" : "คาเฟ่";
          const count = tab === "all" ? totalResults : tab === "news" ? resultsNews.length : tab === "events" ? resultsEvents.length : resultsCafes.length;
          return (<button key={tab} onClick={() => updateTab(tab)} className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${activeSearchTab === tab ? "border-[#FF6B00] text-[#FF6B00]" : "border-transparent text-gray-500"}`}>{label} <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeSearchTab === tab ? "bg-orange-100 text-[#FF6B00]" : "bg-gray-100 text-gray-500"}`}>{count}</span></button>);
        })}
      </div>

      {totalResults === 0 && !isLoading ? (
        <div className="text-center py-16 text-gray-400">
            <p className="text-lg">ไม่พบข้อมูลสำหรับ "{term}"</p>
            <p className="text-sm mt-2">ลองใช้คำค้นหาอื่น หรือดูหมวดหมู่ยอดนิยม</p>
        </div>
      ) : (
        <div className="space-y-12">
            {(activeSearchTab === "all" || activeSearchTab === "news") && resultsNews.length > 0 && (<section><h2 className="text-lg font-bold mb-4">ข่าวสาร</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsNews.map((item) => renderCard(item, "news"))}</div></section>)}
            {(activeSearchTab === "all" || activeSearchTab === "events") && resultsEvents.length > 0 && (<section><h2 className="text-lg font-bold mb-4">กิจกรรม</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsEvents.map((item) => renderCard(item, "event"))}</div></section>)}
            {(activeSearchTab === "all" || activeSearchTab === "cafes") && resultsCafes.length > 0 && (<section><h2 className="text-lg font-bold mb-4">คาเฟ่</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsCafes.map((item) => renderCard(item, "cafe"))}</div></section>)}
        </div>
      )}
    </div>
  );
};