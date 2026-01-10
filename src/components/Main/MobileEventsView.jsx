import React, { useRef, useState, useEffect } from "react";
import { IconChevronLeft, IconMapPin } from "../icons/Icons"; 
import { SkeletonEvent } from "../ui/UIComponents";
import { EventCard } from "../ui/CardComponents";
import { AnimatePresence, motion } from "framer-motion";
import EventsMap from "./EventsMap";

// Import Components ที่แยกออกไป
import MobileEventCarousel from "./MobileEventCarousel";
import MobileToast from "./MobileToast";

// --- 📐 Helper Function (ระยะทาง) ---
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const MobileEventsView = ({
    events, loading, filteredEvents,
    categoryFilter, setCategoryFilter,
    timeframeFilter, setTimeframeFilter,
    sortOrder, setSortOrder,
    mobileViewMode, setMobileViewMode,
    hoveredEventId, setHoveredEventId,
    searchOnMove, setSearchOnMove,
    mapBounds, setMapBounds,
    mapRef, handleNearMe: originalHandleNearMe, isLocating,
    handleClearFilters, navigate, onMarkerClick,
    eventsWithLocation
}) => {
    
    const carouselRef = useRef(null);
    const [toastInfo, setToastInfo] = useState(null);
    
    // ✅ State ใหม่: ใช้เก็บ "การ์ดที่จะโชว์" โดยเฉพาะ (จะได้เรียงลำดับอิสระจาก filteredEvents)
    const [displayedEvents, setDisplayedEvents] = useState([]);
    const [visibleEventsCount, setVisibleEventsCount] = useState(0);
    
    const toastTimerRef = useRef(null);

    const isFilterActive = timeframeFilter !== 'all' || categoryFilter !== 'ทั้งหมด';

    // --- Handlers ---
    const handleMobileMarkerClick = (id) => {
        setHoveredEventId(id);
        if (mobileViewMode === 'map' && carouselRef.current) {
            const cardElement = document.getElementById(`mobile-card-${id}`);
            if (cardElement) cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    const handleSmartNearMe = () => {
        originalHandleNearMe(); 
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                let minDistance = Infinity;
                const eventsToCheck = filteredEvents.length > 0 ? filteredEvents : eventsWithLocation;
                
                eventsToCheck.forEach(evt => {
                    if (evt.lat && evt.lng) {
                        const dist = getDistanceFromLatLonInKm(userLat, userLng, parseFloat(evt.lat), parseFloat(evt.lng));
                        if (dist < minDistance) minDistance = dist;
                    }
                });

                const SEARCH_RADIUS_KM = 15;
                if (minDistance > SEARCH_RADIUS_KM) {
                    if (timeframeFilter !== 'all') {
                        setToastInfo({
                            type: 'filter_limit',
                            message: `วันนี้แถวนี้เงียบเหงา 🍃`,
                            actionLabel: 'ดูทุกช่วงเวลา',
                            onAction: () => { setTimeframeFilter('all'); setToastInfo(null); }
                        });
                    } else {
                        setToastInfo({
                            type: 'no_events',
                            message: 'ย่านนี้ไม่มีจัดงานเลย 😢',
                            actionLabel: '🚀 วาร์ปไปสยาม',
                            onAction: () => {
                                if(mapRef.current) {
                                    mapRef.current.flyTo([13.7462, 100.5347], 14, { duration: 1.5 });
                                    setToastInfo(null);
                                }
                            }
                        });
                    }
                } else {
                    setToastInfo(null);
                }
            }, (error) => console.error("Location error:", error));
        }
    };

    // --- Effects (Toast & Count Logic) ---
    useEffect(() => {
        if (mobileViewMode === 'map') {
            
            if (loading) { 
                setVisibleEventsCount(0); 
                setDisplayedEvents([]);
                setToastInfo(null);
                return; 
            }

            // -----------------------------------------------------------
            // 🟥 CASE 1: Map Bounds ยังไม่มา (เพิ่งเปิดแมพ)
            // -----------------------------------------------------------
            if (!mapBounds) {
                // แทนที่จะโชว์ filteredEvents ดิบๆ... เราจะ "เรียงตามระยะทางจากสยาม" ก่อน
                const defaultCenter = { lat: 13.7462, lng: 100.5347 }; // สยามพารากอน
                
                const sortedByDistance = [...filteredEvents].sort((a, b) => {
                    // ถ้าไม่มีพิกัด ให้ไปอยู่ท้ายๆ
                    if (!a.lat || !a.lng) return 1;
                    if (!b.lat || !b.lng) return -1;

                    const distA = getDistanceFromLatLonInKm(defaultCenter.lat, defaultCenter.lng, parseFloat(a.lat), parseFloat(a.lng));
                    const distB = getDistanceFromLatLonInKm(defaultCenter.lat, defaultCenter.lng, parseFloat(b.lat), parseFloat(b.lng));
                    
                    return distA - distB; // น้อยไปมาก (ใกล้สยามขึ้นก่อน)
                });

                setDisplayedEvents(sortedByDistance);
                setVisibleEventsCount(sortedByDistance.length);
                return;
            }

            // -----------------------------------------------------------
            // 🟩 CASE 2: Map Bounds มาแล้ว (User เลื่อนแมพ)
            // -----------------------------------------------------------
            const visibleEvents = filteredEvents.filter(evt => {
                if (!evt.lat || !evt.lng) return false;
                return mapBounds.contains([parseFloat(evt.lat), parseFloat(evt.lng)]);
            });
            
            setDisplayedEvents(visibleEvents);
            setVisibleEventsCount(visibleEvents.length);

            // Toast Logic
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

            if (visibleEvents.length === 0) {
                toastTimerRef.current = setTimeout(() => {
                    setToastInfo({
                        type: 'lost_map',
                        message: "ไม่พบกิจกรรมในบริเวณนี้ 🍃",
                        actionLabel: "กลับไปโซนจัดงาน",
                        onAction: () => {
                            if (mapRef.current) {
                                const sourceEvents = filteredEvents.length > 0 ? filteredEvents : eventsWithLocation;
                                const center = mapRef.current.getCenter();
                                let nearestEvent = null;
                                let minDistance = Infinity;

                                if (sourceEvents && sourceEvents.length > 0) {
                                    sourceEvents.forEach(e => {
                                        const lat = parseFloat(e.lat);
                                        const lng = parseFloat(e.lng);
                                        if (!isNaN(lat) && !isNaN(lng)) {
                                            const dist = getDistanceFromLatLonInKm(center.lat, center.lng, lat, lng);
                                            if (dist < minDistance) {
                                                minDistance = dist;
                                                nearestEvent = [lat, lng];
                                            }
                                        }
                                    });
                                }
                                
                                const target = nearestEvent || [13.7462, 100.5347]; 
                                mapRef.current.flyTo(target, 14, { duration: 1.5 });
                                setToastInfo(null);
                            }
                        }
                    });
                }, 800);
            } else {
                setToastInfo(prev => prev?.type === 'lost_map' ? null : prev);
            }
        }
        return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
    }, [mapBounds, mobileViewMode, filteredEvents, eventsWithLocation, loading]);


    return (
        <div className="w-full h-full relative bg-white overflow-hidden flex flex-col">
            
            {/* --- 1. LIST VIEW --- */}
            <div className={`flex flex-col h-full transition-all duration-300 ${mobileViewMode === 'map' ? 'hidden' : 'flex'}`}>
                <div className="flex-1 overflow-y-auto pb-24">
                    {/* Header List */}
                    <div className="flex justify-between items-center mb-6 pt-6 px-4 bg-white z-30 relative">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate("/#events-section")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><IconChevronLeft size={24} className="text-gray-700" /></button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">กิจกรรมทั้งหมด</h1>
                                {!loading && <p className="text-sm text-gray-500">พบ {filteredEvents.length} อีเวนต์</p>}
                            </div>
                        </div>
                        {isFilterActive && (
                            <button onClick={handleClearFilters} className="text-xs font-bold text-[#FF6B00] hover:text-[#e65000] bg-orange-50 px-3 py-1.5 rounded-full transition">ล้างตัวกรอง</button>
                        )}
                    </div>

                    {/* Filters List */}
                    <div className="sticky top-0 bg-white z-30 py-2 mb-6 border-b border-gray-100 px-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                <select className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-[#FF6B00] outline-none" value={timeframeFilter} onChange={(e) => setTimeframeFilter(e.target.value)}>
                                    <option value="all">📅 ทุกช่วงเวลา</option>
                                    <option value="today">🔥 วันนี้</option>
                                    <option value="this_month">เดือนนี้</option>
                                    <option value="next_month">เดือนหน้า</option>
                                </select>
                                <select className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:border-[#FF6B00] outline-none" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                                    <option value="upcoming">⚡ ใกล้วันงาน</option>
                                    <option value="newest">🆕 ล่าสุด</option>
                                </select>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {["ทั้งหมด", "Concert", "Fan Meeting", "Fansign", "Workshop", "Exhibition", "Fan Event", "Pop-up Store", "Others"].map((filter) => (
                                    <button key={filter} onClick={() => setCategoryFilter(filter)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition border ${categoryFilter === filter ? "bg-[#FF6B00] text-white border-[#FF6B00]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>{filter}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Card Grid */}
                    {loading ? (
                        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
                            {[...Array(6)].map((_, i) => <SkeletonEvent key={i} />)}
                        </div>
                    ) : (
                        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
                            <AnimatePresence mode="popLayout">
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((item) => (
                                        <motion.div key={item.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
                                            <EventCard item={item} onClick={() => navigate(`/event/${item.id}`)} />
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 text-center text-gray-400">
                                        <div className="text-5xl mb-4">🗺️</div>
                                        <p>{searchOnMove ? "ไม่พบกิจกรรมในบริเวณนี้" : "ไม่พบกิจกรรม"}</p>
                                        <button onClick={handleClearFilters} className="mt-4 text-[#FF6B00] font-bold hover:underline">ล้างตัวกรอง</button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Float Map Button (List View) */}
            {mobileViewMode === 'list' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50]">
                    <button onClick={() => setMobileViewMode('map')} className="flex items-center gap-2 bg-[#222] text-white px-6 py-3 rounded-full shadow-2xl font-bold transition transform hover:scale-105 active:scale-95 border border-white/20">
                        <IconMapPin size={18} /> แผนที่
                    </button>
                </div>
            )}


            {/* --- 2. MAP VIEW --- */}
            {mobileViewMode === 'map' && (
                <div className="fixed inset-0 z-[5000] bg-white flex flex-col">
                    
                    {/* Header Map */}
                    <div className="bg-white shadow-sm z-[5010] flex-shrink-0">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <button onClick={() => setMobileViewMode('list')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition">
                                <IconChevronLeft size={22} />
                            </button>
                            
                            <h1 className="text-lg font-bold text-gray-900">
                                สำรวจ Event ({visibleEventsCount})
                            </h1>
                            
                            {isFilterActive ? (
                                <button onClick={handleClearFilters} className="text-xs font-bold text-[#FF6B00] whitespace-nowrap">ล้างตัวกรอง</button>
                            ) : (<div className="w-9"></div>)}
                        </div>
                        
                        <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide bg-white/95 backdrop-blur-sm">
                            <div className="relative shrink-0">
                                <select className="appearance-none bg-gray-100 border border-transparent hover:border-gray-300 text-gray-700 text-xs font-bold py-1.5 pl-3 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" value={timeframeFilter} onChange={(e) => setTimeframeFilter(e.target.value)}>
                                    <option value="all">📅 ทุกช่วงเวลา</option>
                                    <option value="today">🔥 วันนี้</option>
                                    <option value="this_month">เดือนนี้</option>
                                    <option value="next_month">เดือนหน้า</option>
                                </select>
                            </div>
                            <div className="relative shrink-0">
                                <select className="appearance-none bg-gray-100 border border-transparent hover:border-gray-300 text-gray-700 text-xs font-bold py-1.5 pl-3 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                    {["ทั้งหมด", "Concert", "Fan Meeting", "Fansign", "Workshop", "Exhibition", "Fan Event", "Pop-up Store", "Others"].map((filter) => (
                                        <option key={filter} value={filter}>{filter === "ทั้งหมด" ? "🏷️ หมวดหมู่ทั้งหมด" : filter}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="relative flex-1 w-full h-full">
                        
                        <MobileToast 
                            toastInfo={toastInfo} 
                            setToastInfo={setToastInfo} 
                        />

                        <div className="absolute right-4 bottom-48 md:bottom-32 z-[5020] flex flex-col gap-3 items-end pointer-events-auto">
                            <button onClick={handleSmartNearMe} disabled={isLocating} className={`w-12 h-12 rounded-full bg-white shadow-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition active:scale-95 hover:text-[#FF6B00] flex items-center justify-center ${isLocating ? 'opacity-70 cursor-wait' : ''}`}>
                                {isLocating ? <span className="animate-spin">...</span> : <IconMapPin size={24} />}
                            </button>
                            <button onClick={() => setMobileViewMode('list')} className="h-12 w-12 rounded-full bg-[#222] text-white shadow-2xl flex items-center justify-center transition transform hover:scale-105 active:scale-95 border border-white/20">
                                <span className="text-2xl">📄</span> 
                            </button>
                        </div>

                        <EventsMap events={eventsWithLocation} hoveredEventId={hoveredEventId} onMarkerClick={handleMobileMarkerClick} mapRef={mapRef} setMapBounds={setMapBounds} searchOnMove={true} showMapDesktop={false} mobileViewMode={mobileViewMode} />

                        {/* ✅ ใช้ displayedEvents ที่ผ่านการคัดกรองหรือเรียงลำดับแล้ว */}
                        <MobileEventCarousel 
                            visibleEventsCount={visibleEventsCount}
                            filteredEvents={displayedEvents}
                            hoveredEventId={hoveredEventId}
                            setHoveredEventId={setHoveredEventId}
                            carouselRef={carouselRef}
                            navigate={navigate}
                        />

                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileEventsView;