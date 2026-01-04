import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { IconChevronLeft, IconSort, IconMapPin, IconX } from "../icons/Icons"; // ✅ เพิ่ม IconX (กากบาท)
import { SkeletonEvent } from "../ui/UIComponents";
import { EventCard } from "../ui/CardComponents";

// Leaflet Imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Marker Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

export const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("upcoming");
  const [filteredEvents, setFilteredEvents] = useState([]);

  // State สำหรับ Mobile (List/Map Toggle)
  const [mobileViewMode, setMobileViewMode] = useState("list");
  
  // ✅ State สำหรับ Desktop (Show/Hide Map)
  const [showMapDesktop, setShowMapDesktop] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const fetchEvents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .gte("date", today)
        .order("date", { ascending: true });

      if (data) {
        setEvents(data);
        setFilteredEvents(data);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];
    if (categoryFilter !== "ทั้งหมด")
      result = result.filter((event) => event.category === categoryFilter);
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
    if (sortOrder === "newest") result.sort((a, b) => b.id - a.id);
    else result.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    setFilteredEvents(result);
  }, [categoryFilter, timeframeFilter, sortOrder, events]);

  const MapContent = () => (
    <div className="w-full h-full relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400]">
            <button className="bg-white px-4 py-2 rounded-full shadow-md border border-gray-200 text-sm font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition active:scale-95">
                <input type="checkbox" defaultChecked className="accent-[#FF6B00] w-4 h-4 cursor-pointer" />
                ค้นหาเมื่อเลื่อนแผนที่
            </button>
        </div>

        <MapContainer 
            center={[13.7563, 100.5018]} 
            zoom={11} 
            scrollWheelZoom={true} 
            className="w-full h-full"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredEvents.map((event) => (
                event.lat && event.lng ? (
                    <Marker key={event.id} position={[event.lat, event.lng]}>
                        <Popup>
                            <div className="w-48 p-1">
                                <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-gray-100 relative">
                                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover"/>
                                    <span className="absolute top-1 right-1 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-bold text-[#FF6B00]">
                                        {event.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1 line-clamp-2">{event.title}</h3>
                                <p className="text-xs text-gray-500 mb-2">
                                    📅 {event.date_display || new Date(event.date).toLocaleDateString('th-TH')}
                                </p>
                                <button 
                                    onClick={() => navigate(`/event/${event.id}`)}
                                    className="w-full bg-[#FF6B00] text-white text-xs py-2 rounded-lg font-bold hover:bg-[#e65000] transition shadow-sm"
                                >
                                    ดูรายละเอียด
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ) : null
            ))}
        </MapContainer>
    </div>
  );

  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-white">
      
      {/* ==============================================
          LEFT COLUMN: รายการ (List)
          ✅ ปรับความกว้างตามสถานะ showMapDesktop
      =============================================== */}
      <div className={`
            flex flex-col h-[calc(100vh-64px)] transition-all duration-300 ease-in-out
            ${mobileViewMode === 'map' ? 'hidden lg:flex' : 'flex'}
            ${showMapDesktop ? 'w-full lg:w-[60%] xl:w-[65%]' : 'w-full max-w-[1440px] mx-auto'} 
      `}>
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-24 lg:pb-6">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/#events-section")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                        <IconChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">กิจกรรมทั้งหมด</h1>
                        {!loading && <p className="text-sm text-gray-500">พบ {filteredEvents.length} อีเวนต์</p>}
                    </div>
                 </div>

                 {/* ✅ ปุ่ม Toggle Map (เฉพาะ Desktop) */}
                 <button 
                    onClick={() => setShowMapDesktop(!showMapDesktop)}
                    className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-700 hover:bg-black hover:text-white hover:border-black transition active:scale-95"
                 >
                    {showMapDesktop ? (
                        <>แสดงรายการแบบเต็ม <IconX size={18} /></>
                    ) : (
                        <>แสดงแผนที่ <IconMapPin size={18} /></>
                    )}
                 </button>
            </div>

            {/* Filter Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 py-2 mb-6 border-b border-gray-100">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <div className="flex gap-2">
                            <select
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-[#FF6B00] outline-none"
                                value={timeframeFilter}
                                onChange={(e) => setTimeframeFilter(e.target.value)}
                            >
                                <option value="all">📅 ทุกช่วงเวลา</option>
                                <option value="this_month">เดือนนี้</option>
                                <option value="next_month">เดือนหน้า</option>
                            </select>
                             <select
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-[#FF6B00] outline-none"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="upcoming">⚡ ใกล้วันงาน</option>
                                <option value="newest">🆕 ล่าสุด</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {["ทั้งหมด", "Concert", "Fan Meeting", "Fansign", "Workshop", "Exhibition", "Fan Event"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setCategoryFilter(filter)}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition border ${
                                    categoryFilter === filter
                                    ? "bg-[#FF6B00] text-white border-[#FF6B00]"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ✅ Grid ปรับอัตโนมัติเมื่อปิดแผนที่ */}
            {loading ? (
                <div className={`grid gap-6 ${showMapDesktop ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                    {[...Array(6)].map((_, i) => <SkeletonEvent key={i} />)}
                </div>
            ) : (
                <div className={`grid gap-6 animate-fade-in ${showMapDesktop ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((item) => (
                            <EventCard key={item.id} item={item} onClick={() => navigate(`/event/${item.id}`)} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-gray-400">
                            <div className="text-5xl mb-4">🗺️</div>
                            <p className="text-lg font-medium">ไม่พบกิจกรรมในโซนนี้</p>
                            <button onClick={() => { setCategoryFilter("ทั้งหมด"); setTimeframeFilter("all"); }} className="mt-4 text-[#FF6B00] font-bold hover:underline">
                                ล้างตัวกรองค้นหา
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* ==============================================
          RIGHT COLUMN: แผนที่ (Map)
          ✅ ซ่อนเมื่อ showMapDesktop = false
      =============================================== */}
      <div className={`
            h-[calc(100vh-64px)] lg:h-auto bg-gray-100 relative transition-all duration-300
            ${mobileViewMode === 'list' ? 'hidden' : 'block'}
            ${showMapDesktop ? 'lg:block lg:w-[40%] xl:w-[35%]' : 'lg:hidden'}
      `}>
          <MapContent />
      </div>

      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[500]">
        <button 
            onClick={() => setMobileViewMode(mobileViewMode === 'list' ? 'map' : 'list')}
            className="flex items-center gap-2 bg-[#222] text-white px-6 py-3 rounded-full shadow-2xl font-bold transition transform hover:scale-105 active:scale-95 border border-white/20"
        >
            {mobileViewMode === 'list' ? (
                <> <IconMapPin size={18} /> แผนที่ </>
            ) : (
                <> 📄 รายการ </>
            )}
        </button>
      </div>

    </div>
  );
};