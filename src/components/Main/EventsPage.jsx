import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { IconChevronLeft, IconSort, IconMapPin, IconX } from "../icons/Icons";
import { SkeletonEvent } from "../ui/UIComponents";
import { EventCard } from "../ui/CardComponents";
import { motion, AnimatePresence } from "framer-motion";

// Leaflet Imports
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- 🎨 ส่วนตั้งค่าสีและไอคอน ---

const categoryColors = {
    "Concert": "#FF6B00",
    "Fan Meeting": "#E91E63",
    "Fansign": "#9C27B0",
    "Workshop": "#2196F3",
    "Exhibition": "#00BCD4",
    "Fan Event": "#4CAF50",
    "Pop-up Store": "#3F51B5",
    "Others": "#607D8B"
};

const createCategoryIcon = (category) => {
    const color = categoryColors[category] || "#FF6B00";
    return L.divIcon({
        className: "custom-marker-icon",
        html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9]
    });
};

const createHighlightIcon = () => {
    return L.divIcon({
        className: "custom-marker-icon-highlight",
        html: `<div style="background-color: #D50000; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5); transform: scale(1.1); transition: all 0.2s ease;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
    });
};

const createClusterCustomIcon = (cluster) => {
    return L.divIcon({
      html: `<div style="
        background-color: #FF6B00; 
        color: white; 
        width: 32px; 
        height: 32px; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        border-radius: 50%; 
        font-weight: bold; 
        font-size: 14px; 
        border: 3px solid white; 
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      ">${cluster.getChildCount()}</div>`,
      className: "custom-cluster-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
};

// ✅ Component ใหม่: แก้ปัญหา Map สีเทา
// ทำหน้าที่คอย "เขย่า" (invalidateSize) แผนที่เมื่อมีการกดเปิด/ปิด
const MapResizer = ({ showMapDesktop }) => {
    const map = useMap();
    useEffect(() => {
        if (showMapDesktop) {
            // รอสักนิดให้ CSS Transition ทำงานเสร็จ แล้วสั่งรีเฟรชขนาด
            setTimeout(() => {
                map.invalidateSize();
            }, 300);
        }
    }, [showMapDesktop, map]);
    return null;
};

const MapBoundsReporter = ({ setMapBounds }) => {
    const map = useMapEvents({
        moveend: () => {
            setMapBounds(map.getBounds());
        },
    });
    return null;
};

const MapAutoFit = ({ markers, searchOnMove }) => {
    const map = useMap();
    useEffect(() => {
        if (searchOnMove) return;

        if (markers.length > 0) {
            const lats = markers.map(e => e.lat);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            
            if ((maxLat - minLat) > 1.5) {
                 map.setView([13.7563, 100.5018], 11);
            } else {
                 const bounds = markers.map(event => [event.lat, event.lng]);
                 try { map.fitBounds(bounds, { padding: [50, 50] }); } catch (e) {}
            }
        }
    }, [markers, map, searchOnMove]);
    return null;
};

// Component EventsMap
const EventsMap = ({ events, hoveredEventId, onMarkerClick, mapRef, setMapBounds, searchOnMove, showMapDesktop }) => {
    return (
        <MapContainer 
            center={[13.7563, 100.5018]} 
            zoom={11} 
            scrollWheelZoom={true} 
            className="w-full h-full"
            ref={mapRef}
        >
            <TileLayer
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {/* ✅ ใส่ MapResizer เพื่อแก้ map สีเทา */}
            <MapResizer showMapDesktop={showMapDesktop} />
            
            <MapBoundsReporter setMapBounds={setMapBounds} />
            <MapAutoFit markers={events} searchOnMove={searchOnMove} />

            <MarkerClusterGroup 
                chunkedLoading
                iconCreateFunction={createClusterCustomIcon}
            >
                {events.map((event) => {
                    const isHovered = hoveredEventId === event.id;
                    return (
                        <Marker 
                            key={event.id} 
                            position={[event.lat, event.lng]}
                            icon={isHovered ? createHighlightIcon() : createCategoryIcon(event.category)}
                            zIndexOffset={isHovered ? 1000 : 0}
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                                <span className="font-bold text-sm text-gray-700">{event.title}</span>
                            </Tooltip>

                            <Popup autoPan={true} autoPanPadding={[50, 90]}>
                                <div className="w-52 p-1">
                                    <div className="aspect-video rounded-lg overflow-hidden mb-2 bg-gray-100 relative">
                                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover"/>
                                        <span className="absolute top-1 right-1 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ color: categoryColors[event.category] || "#FF6B00" }}>
                                            {event.category}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1 line-clamp-2">{event.title}</h3>
                                    <p className="text-xs text-gray-500 mb-2">
                                        📅 {event.date_display || new Date(event.date).toLocaleDateString('th-TH')}
                                    </p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onMarkerClick(event.id)}
                                            className="flex-1 bg-[#FF6B00] text-white text-xs py-2 rounded-lg font-bold hover:bg-[#e65000] transition shadow-sm"
                                        >
                                            ดูรายละเอียด
                                        </button>
                                        <a 
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${event.lat},${event.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition"
                                            title="นำทาง"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>
        </MapContainer>
    );
};

export const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("upcoming");
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [mobileViewMode, setMobileViewMode] = useState("list");
  const [showMapDesktop, setShowMapDesktop] = useState(false); // Default false ตามที่ตกลงกัน
  const [hoveredEventId, setHoveredEventId] = useState(null);

  const [searchOnMove, setSearchOnMove] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);

  const mapRef = useRef();

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
    const todayStr = now.toISOString().split('T')[0];

    if (timeframeFilter !== "all") {
      result = result.filter((e) => {
        if (!e.date) return false;
        if (timeframeFilter === "today") return e.date === todayStr;
        
        const eventDate = new Date(e.date);
        if (timeframeFilter === "this_month")
          return (eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear());
        else if (timeframeFilter === "next_month") {
          let nextMonth = now.getMonth() + 1;
          let nextYear = now.getFullYear();
          if (nextMonth > 11) { nextMonth = 0; nextYear++; }
          return (eventDate.getMonth() === nextMonth && eventDate.getFullYear() === nextYear);
        }
        return true;
      });
    }

    if (searchOnMove && mapBounds && showMapDesktop) {
        result = result.filter((e) => {
            if (!e.lat || !e.lng) return false;
            return mapBounds.contains([e.lat, e.lng]);
        });
    }

    if (sortOrder === "newest") result.sort((a, b) => b.id - a.id);
    else result.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    
    setFilteredEvents(result);
  }, [categoryFilter, timeframeFilter, sortOrder, events, searchOnMove, mapBounds, showMapDesktop]);

  const eventsWithLocation = filteredEvents.filter(e => e.lat && e.lng);

  const handleNearMe = () => {
    const map = mapRef.current;
    if (!map) return;
    
    // ถ้าแผนที่ยังไม่เปิด ให้เปิดก่อน
    if (!showMapDesktop) setShowMapDesktop(true);

    // รอแป๊บนึงให้แผนที่โหลด แล้วค่อย locate
    setTimeout(() => {
        map.locate({ setView: true, maxZoom: 14, enableHighAccuracy: true });
    }, 100);

    setTimeframeFilter("today");
    setMobileViewMode("map");
  };

  // ✅ ฟังก์ชันเคลียร์ตัวกรอง (แก้ปัญหากดแล้วไม่หาย)
  const handleClearFilters = () => {
    setCategoryFilter("ทั้งหมด");
    setTimeframeFilter("all");
    setSearchOnMove(false); // สำคัญ: ปิดโหมดค้นหาตามแผนที่ด้วย ไม่งั้นมันจะยังกรองตามพื้นที่เดิม
  };

  const containerPaddingClass = showMapDesktop 
    ? "px-6 md:px-8 lg:px-12 lg:pr-10" 
    : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  return (
    <div className="w-full h-[calc(100dvh-80px)] flex flex-col lg:flex-row bg-white overflow-hidden">
      
      {/* LEFT COLUMN: รายการ */}
      <div className={`
            flex flex-col h-full transition-all duration-300 ease-in-out
            ${mobileViewMode === 'map' ? 'hidden lg:flex' : 'flex'}
            ${showMapDesktop ? 'w-full lg:w-[60%] xl:w-[65%]' : 'w-full'}
      `}>
        
        <div className="flex-1 overflow-y-auto pb-24 lg:pb-6">
            
            <div className={`flex justify-between items-center mb-6 pt-6 bg-white z-30 relative ${containerPaddingClass}`}>
                 <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/#events-section")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                        <IconChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">กิจกรรมทั้งหมด</h1>
                        {!loading && <p className="text-sm text-gray-500">พบ {filteredEvents.length} อีเวนต์</p>}
                    </div>
                 </div>
            </div>

            <div className={`sticky top-0 bg-white z-30 py-2 mb-6 border-b border-gray-100 ${containerPaddingClass}`}>
                <div className="flex flex-col gap-4">
                    
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <select
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-[#FF6B00] outline-none"
                                value={timeframeFilter}
                                onChange={(e) => setTimeframeFilter(e.target.value)}
                            >
                                <option value="all">📅 ทุกช่วงเวลา</option>
                                <option value="today">🔥 วันนี้</option>
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

                        <button 
                            onClick={() => setShowMapDesktop(!showMapDesktop)}
                            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-700 hover:bg-black hover:text-white hover:border-black transition active:scale-95 whitespace-nowrap"
                        >
                            {showMapDesktop ? (
                                <>แสดงรายการแบบเต็ม <IconX size={18} /></>
                            ) : (
                                <>แสดงแผนที่ <IconMapPin size={18} /></>
                            )}
                        </button>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {["ทั้งหมด", "Concert", "Fan Meeting", "Fansign", "Workshop", "Exhibition", "Fan Event", "Pop-up Store", "Others"].map((filter) => (
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

            {loading ? (
                <div className={`grid gap-3 md:gap-6 ${containerPaddingClass} ${showMapDesktop ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                    {[...Array(6)].map((_, i) => <SkeletonEvent key={i} />)}
                </div>
            ) : (
                <div className={`grid gap-3 md:gap-6 ${containerPaddingClass} ${showMapDesktop ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                    <AnimatePresence mode="popLayout">
                        {filteredEvents.length > 0 ? (
                            filteredEvents.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                    transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
                                    onMouseEnter={() => setHoveredEventId(item.id)}
                                    onMouseLeave={() => setHoveredEventId(null)}
                                >
                                    <EventCard item={item} onClick={() => navigate(`/event/${item.id}`)} />
                                </motion.div>
                            ))
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                                className="col-span-full py-20 text-center text-gray-400"
                            >
                                <div className="text-5xl mb-4">🗺️</div>
                                <p className="text-lg font-medium">
                                    {searchOnMove && showMapDesktop ? "ไม่พบกิจกรรมในบริเวณแผนที่นี้" : "ไม่พบกิจกรรมในช่วงเวลานี้"}
                                </p>
                                <p className="text-sm text-gray-400">ลองเปลี่ยนตัวกรอง หรือขยายพื้นที่การค้นหา</p>
                                {/* ✅ ใช้ handleClearFilters ที่แก้แล้ว */}
                                <button onClick={handleClearFilters} className="mt-4 text-[#FF6B00] font-bold hover:underline">
                                    ล้างตัวกรองค้นหา
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
      </div>

      <div className={`
            h-full bg-white relative transition-all duration-300 p-0 lg:p-6 xl:p-8
            ${mobileViewMode === 'list' ? 'hidden' : 'block'}
            ${showMapDesktop ? 'lg:block lg:w-[40%] xl:w-[35%]' : 'lg:hidden'}
      `}>
          <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200">
            
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
                <button 
                    onClick={() => setSearchOnMove(!searchOnMove)}
                    className="bg-white px-4 py-2 rounded-full shadow-md border border-gray-200 text-sm font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition active:scale-95"
                >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${searchOnMove ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-gray-400 bg-white'}`}>
                        {searchOnMove && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    ค้นหาเมื่อเลื่อนแผนที่
                </button>
            </div>

            <div className="absolute bottom-10 right-4 z-[1000]">
                <button 
                    onClick={handleNearMe}
                    className="bg-white px-4 py-3 rounded-full shadow-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition active:scale-95 hover:text-[#FF6B00] flex items-center gap-2 font-bold"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B00]" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    ใกล้ฉัน
                </button>
            </div>

            {/* ✅ ส่ง showMapDesktop ไปให้ EventsMap เพื่อใช้ในการ Refresh Map */}
            <EventsMap 
                events={eventsWithLocation} 
                hoveredEventId={hoveredEventId}
                onMarkerClick={(id) => navigate(`/event/${id}`)}
                mapRef={mapRef}
                setMapBounds={setMapBounds}
                searchOnMove={searchOnMove}
                showMapDesktop={showMapDesktop}
            />
          </div>
      </div>

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