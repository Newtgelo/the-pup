import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { IconChevronLeft, IconSort } from "../icons/Icons";
import { SkeletonEvent } from "../ui/UIComponents";
import { EventCard } from "../ui/CardComponents";

export const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("upcoming");
  const [filteredEvents, setFilteredEvents] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const fetchEvents = async () => {
      setLoading(true);
      // ✅ แก้ตรงนี้: เพิ่ม .eq('status', 'published') เพื่อกรองเอาเฉพาะงานที่เผยแพร่แล้ว
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq('status', 'published') // <--- บรรทัดสำคัญที่เพิ่มเข้ามา
        .gte("date", today)
        .order("date", { ascending: true });
        
      if (data) { setEvents(data); setFilteredEvents(data); }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];
    if (categoryFilter !== "ทั้งหมด") result = result.filter((event) => event.category === categoryFilter);
    const now = new Date();
    if (timeframeFilter !== "all") {
      result = result.filter((e) => {
        if (!e.date) return false;
        const eventDate = new Date(e.date);
        if (timeframeFilter === "this_month") return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
        else if (timeframeFilter === "next_month") {
          let nextMonth = now.getMonth() + 1;
          let nextYear = now.getFullYear();
          if (nextMonth > 11) { nextMonth = 0; nextYear++; }
          return eventDate.getMonth() === nextMonth && eventDate.getFullYear() === nextYear;
        }
        return true;
      });
    }
    if (sortOrder === "newest") result.sort((a, b) => b.id - a.id);
    else result.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    setFilteredEvents(result);
  }, [categoryFilter, timeframeFilter, sortOrder, events]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      <div className="py-6 border-b border-gray-100 mb-6 flex gap-2 items-center">
        <button onClick={() => navigate("/#events-section")}><IconChevronLeft size={24} /></button>
        <div><h1 className="text-2xl font-bold text-gray-900">กิจกรรมทั้งหมด</h1>{!loading && (<p className="text-gray-500 text-sm">พบทั้งหมด {filteredEvents.length} รายการ</p>)}</div>
      </div>
      <div className="flex flex-col mb-8 gap-4">
        <div className="flex justify-end gap-3">
          <select className="pl-3 pr-8 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] cursor-pointer" value={timeframeFilter} onChange={(e) => setTimeframeFilter(e.target.value)}><option value="all">ทุกช่วงเวลา</option><option value="this_month">เดือนนี้</option><option value="next_month">เดือนหน้า</option></select>
          <div className="relative"><select className="w-full pl-8 pr-8 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 bg-white focus:outline-none focus:border-[#FF6B00] appearance-none cursor-pointer" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}><option value="upcoming">ใกล้วันงาน</option><option value="newest">ประกาศล่าสุด</option></select><div className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none"><IconSort size={14} /></div></div>
        </div>
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {["ทั้งหมด", "Concert", "Fan Meeting", "Fansign", "Workshop", "Exhibition", "Fan Event", "Others"].map((filter) => (<button key={filter} onClick={() => setCategoryFilter(filter)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition flex-shrink-0 ${categoryFilter === filter ? "bg-[#FF6B00] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>{filter}</button>))}
        </div>
      </div>
      {loading ? (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{[...Array(8)].map((_, i) => (<SkeletonEvent key={i} />))}</div>) : (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">{filteredEvents.length > 0 ? (filteredEvents.map((item) => (<EventCard key={item.id} item={item} onClick={() => navigate(`/event/${item.id}`)} />))) : (<div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-2xl">🔍</div><p className="font-medium">ไม่พบกิจกรรมในหมวดหมู่นี้</p><button onClick={() => { setCategoryFilter("ทั้งหมด"); setTimeframeFilter("all"); }} className="mt-4 text-[#FF6B00] text-sm font-bold hover:underline">ล้างตัวกรอง</button></div>)}</div>)}
    </div>
  );
};