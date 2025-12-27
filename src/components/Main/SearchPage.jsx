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

  useEffect(() => {
    const fetchSearch = async () => {
      if (!term) { setResultsNews([]); setResultsEvents([]); setResultsCafes([]); return; }
      setIsLoading(true);
      const { data: news } = await supabase.from("news").select("*").or(`title.ilike.%${term}%,tags.ilike.%${term}%`).limit(10);
      if (news) setResultsNews(news);
      const { data: events } = await supabase.from("events").select("*").or(`title.ilike.%${term}%,location.ilike.%${term}%,tags.ilike.%${term}%`).limit(10);
      if (events) setResultsEvents(events);
      const { data: cafes } = await supabase.from("cafes").select("*").or(`name.ilike.%${term}%,location_text.ilike.%${term}%`).limit(10);
      if (cafes) setResultsCafes(cafes);
      setIsLoading(false);
    };
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
        <div><h1 className="text-2xl font-bold text-gray-900">{term ? `ผลการค้นหา: "${term}"` : "ค้นหา"}</h1>{term && !isLoading && (<p className="text-gray-500 text-sm">พบทั้งหมด {totalResults} รายการ</p>)}</div>
      </div>
      <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
        {["all", "news", "events", "cafes"].map((tab) => {
          const label = tab === "all" ? "ทั้งหมด" : tab === "news" ? "ข่าวสาร" : tab === "events" ? "กิจกรรม" : "คาเฟ่";
          const count = tab === "all" ? totalResults : tab === "news" ? resultsNews.length : tab === "events" ? resultsEvents.length : resultsCafes.length;
          return (<button key={tab} onClick={() => updateTab(tab)} className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-2 ${activeSearchTab === tab ? "border-[#FF6B00] text-[#FF6B00]" : "border-transparent text-gray-500"}`}>{label} <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeSearchTab === tab ? "bg-orange-100 text-[#FF6B00]" : "bg-gray-100 text-gray-500"}`}>{count}</span></button>);
        })}
      </div>
      {totalResults === 0 && !isLoading ? (<div className="text-center py-16 text-gray-400">ไม่พบข้อมูล</div>) : (<div className="space-y-12">{(activeSearchTab === "all" || activeSearchTab === "news") && resultsNews.length > 0 && (<section><h2 className="text-lg font-bold mb-4">ข่าวสาร</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsNews.map((item) => renderCard(item, "news"))}</div></section>)}{(activeSearchTab === "all" || activeSearchTab === "events") && resultsEvents.length > 0 && (<section><h2 className="text-lg font-bold mb-4">กิจกรรม</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsEvents.map((item) => renderCard(item, "event"))}</div></section>)}{(activeSearchTab === "all" || activeSearchTab === "cafes") && resultsCafes.length > 0 && (<section><h2 className="text-lg font-bold mb-4">คาเฟ่</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{resultsCafes.map((item) => renderCard(item, "cafe"))}</div></section>)}</div>)}
    </div>
  );
};