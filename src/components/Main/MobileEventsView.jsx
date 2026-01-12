import React, { useRef, useState, useEffect } from "react";
// ✅ Import Icons
import { IconChevronLeft, IconMapPin, IconTarget, IconList } from "../icons/Icons"; 
import { SkeletonEvent } from "../ui/UIComponents";
import { EventCard } from "../ui/CardComponents";
import { AnimatePresence, motion } from "framer-motion";
import EventsMap from "./EventsMap";
import MobileEventCarousel from "./MobileEventCarousel";
import MobileToast from "./MobileToast";

// --- 📐 Helper Function ---
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
    const [displayedEvents, setDisplayedEvents] = useState([]);
    const [visibleEventsCount, setVisibleEventsCount] = useState(0);
    const toastTimerRef = useRef(null);
    const isFilterActive = timeframeFilter !== 'all' || categoryFilter !== 'ทั้งหมด';

    // ✅ NEW STATE: สถานะกำลังค้นหา (Loading Overlay)
    const [isSearching, setIsSearching] = useState(false);

    const clickedMarkerIdRef = useRef(null);
    const isProgrammaticMoveRef = useRef(false);
    const isProgrammaticScrollRef = useRef(false);

    // --- Logic 1: Handle Marker Click ---
    const handleMobileMarkerClick = (id) => {
        const clickedEvent = eventsWithLocation.find(e => e.id === id);
        if (!clickedEvent) return;

        clickedMarkerIdRef.current = id;
        isProgrammaticScrollRef.current = true;
        setHoveredEventId(id);

        const sortedEvents = [...eventsWithLocation].sort((a, b) => {
            if (a.id === id) return -1;
            if (b.id === id) return 1;
            const distA = getDistanceFromLatLonInKm(parseFloat(clickedEvent.lat), parseFloat(clickedEvent.lng), parseFloat(a.lat), parseFloat(a.lng));
            const distB = getDistanceFromLatLonInKm(parseFloat(clickedEvent.lat), parseFloat(clickedEvent.lng), parseFloat(b.lat), parseFloat(b.lng));
            return distA - distB;
        });
        setDisplayedEvents(sortedEvents);
        
        if (carouselRef.current) {
            carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }

        setTimeout(() => {
            isProgrammaticScrollRef.current = false;
        }, 800);
    };

    // --- 🧠 Logic 2: Smart Near Me (With Loading Delay) ---
    const handleSmartNearMe = () => {
        // 1. เปิด Loading Overlay ทันที
        setIsSearching(true);
        setToastInfo(null); 

        // 2. หน่วงเวลา 800ms
        setTimeout(() => {
            // A. บังคับเปลี่ยนตัวกรองเป็น "วันนี้"
            setTimeframeFilter('today');

            // B. เริ่มหาพิกัด
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    
                    let closestEvent = null;
                    let minDistance = Infinity;

                    eventsWithLocation.forEach(evt => {
                        if (evt.lat && evt.lng) {
                            const dist = getDistanceFromLatLonInKm(userLat, userLng, parseFloat(evt.lat), parseFloat(evt.lng));
                            if (dist < minDistance) {
                                minDistance = dist;
                                closestEvent = evt;
                            }
                        }
                    });

                    const SEARCH_RADIUS_KM = 20;

                    setIsSearching(false); // ปิด Loading

                    if (minDistance > SEARCH_RADIUS_KM && closestEvent) {
                        setToastInfo({
                           type: 'smart_near_me',
                           message: 'แถวนี้เงียบเหงาจัง... 🍃',
                           actionLabel: `🚀 ไปงานที่ใกล้ที่สุด (${minDistance.toFixed(0)} กม.)`,
                           onAction: () => {
                               setToastInfo(null);
                               if(mapRef.current) {
                                   const targetLat = parseFloat(closestEvent.lat);
                                   const targetLng = parseFloat(closestEvent.lng);
                                   mapRef.current.flyTo([targetLat, targetLng], 12, { duration: 1.5 });
                                   setTimeout(() => handleMobileMarkerClick(closestEvent.id), 1600);
                               }
                           }
                       });
                    } else {
                        if(mapRef.current) {
                             mapRef.current.flyTo([userLat, userLng], 13, { duration: 1.5 });
                        }
                        setToastInfo(null);
                    }
                }, (error) => {
                    console.error("Location error:", error);
                    setIsSearching(false); 
                    alert("ไม่สามารถระบุตำแหน่งได้");
                });
            } else {
                setIsSearching(false);
            }
        }, 800); 
    };

    // --- Effect 1: Auto Sort & Smart Toast ---
    useEffect(() => {
        if (mobileViewMode === 'map') {
            if (loading || isSearching) { 
                setVisibleEventsCount(0); setDisplayedEvents([]); setToastInfo(null); return; 
            }

            if (isProgrammaticMoveRef.current) { isProgrammaticMoveRef.current = false; return; }
            if (hoveredEventId && clickedMarkerIdRef.current === hoveredEventId) { return; }

            let centerLat = 13.7462; let centerLng = 100.5347;
            if (mapRef.current) {
                const center = mapRef.current.getCenter();
                centerLat = center.lat; centerLng = center.lng;
            }

            let sourceEvents = filteredEvents;
            if (mapBounds) {
                sourceEvents = filteredEvents.filter(evt => {
                    if (!evt.lat || !evt.lng) return false;
                    return mapBounds.contains([parseFloat(evt.lat), parseFloat(evt.lng)]);
                });
            }

            const sortedEvents = [...sourceEvents].sort((a, b) => {
                if (!a.lat || !a.lng) return 1; if (!b.lat || !b.lng) return -1;
                const distA = getDistanceFromLatLonInKm(centerLat, centerLng, parseFloat(a.lat), parseFloat(a.lng));
                const distB = getDistanceFromLatLonInKm(centerLat, centerLng, parseFloat(b.lat), parseFloat(b.lng));
                return distA - distB; 
            });
            
            setDisplayedEvents(sortedEvents);
            setVisibleEventsCount(sortedEvents.length);

            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
            
            if (sortedEvents.length === 0) {
                toastTimerRef.current = setTimeout(() => {
                    if (filteredEvents.length === 0) {
                        if (timeframeFilter !== 'all') {
                             setToastInfo({
                                type: 'filter_time',
                                message: 'ช่วงเวลานี้ไม่มีงานเลย... 📅',
                                actionLabel: '⚡ ดูงานเร็วๆ นี้',
                                onAction: () => {
                                    setToastInfo(null);
                                    setTimeframeFilter('all'); 
                                    setSortOrder('upcoming');  
                                }
                            });
                            return;
                        }
                        if (categoryFilter !== 'ทั้งหมด') {
                            setToastInfo({
                               type: 'filter_cat',
                               message: `ไม่พบ ${categoryFilter} ในตอนนี้`,
                               actionLabel: '↺ ล้างตัวกรอง',
                               onAction: () => { handleClearFilters(); setToastInfo(null); }
                           });
                           return;
                       }
                    }
                    setToastInfo({
                        type: 'lost_map',
                        message: "ไม่พบกิจกรรมในบริเวณนี้ 🍃",
                        actionLabel: "กลับไปโซนจัดงาน",
                        onAction: () => {
                            setToastInfo(null); 
                            if (mapRef.current) mapRef.current.flyTo([13.7462, 100.5347], 14, { duration: 1.5 });
                        }
                    });

                }, 800);
            } else {
                setToastInfo(prev => (prev?.type === 'smart_near_me' ? prev : null));
            }
        }
    }, [mapBounds, mobileViewMode, filteredEvents, eventsWithLocation, loading, mapRef, timeframeFilter, categoryFilter, isSearching]);

    // --- Effect 2: FlyTo ---
    useEffect(() => {
        if (mobileViewMode === 'map' && hoveredEventId && mapRef.current) {
            if (clickedMarkerIdRef.current === hoveredEventId) { return; }
            clickedMarkerIdRef.current = null; 

            const targetEvent = eventsWithLocation.find(e => e.id === hoveredEventId);
            if (targetEvent && targetEvent.lat && targetEvent.lng) {
                const map = mapRef.current;
                const targetLat = parseFloat(targetEvent.lat);
                const targetLng = parseFloat(targetEvent.lng);
                const currentCenter = map.getCenter();
                const distKm = getDistanceFromLatLonInKm(currentCenter.lat, currentCenter.lng, targetLat, targetLng);
                if (distKm < 0.005) return; 

                isProgrammaticMoveRef.current = true; 
                const currentZoom = map.getZoom(); 
                const targetPoint = map.project([targetLat, targetLng], currentZoom);
                targetPoint.y += 100; 
                const targetLatLngWithOffset = map.unproject(targetPoint, currentZoom);

                map.flyTo(targetLatLngWithOffset, currentZoom, { animate: true, duration: 0.8, easeLinearity: 0.25 });
            }
        }
    }, [hoveredEventId, mobileViewMode, mapRef]);

    return (
        <div className="w-full h-full relative bg-white overflow-hidden flex flex-col">
            {/* List View */}
            <div className={`flex flex-col h-full transition-all duration-300 ${mobileViewMode === 'map' ? 'hidden' : 'flex'}`}>
                {/* ... (List View Content เหมือนเดิม ไม่ต้องแก้) ... */}
                <div className="flex-1 overflow-y-auto pb-24">
                     <div className="flex justify-between items-center mb-6 pt-6 px-4 bg-white z-30 relative">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate("/#events-section")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><IconChevronLeft size={24} className="text-gray-700" /></button>
                            <div><h1 className="text-2xl font-bold text-gray-900">กิจกรรมทั้งหมด</h1>{!loading && <p className="text-sm text-gray-500">พบ {filteredEvents.length} อีเวนต์</p>}</div>
                        </div>
                        {isFilterActive && (<button onClick={handleClearFilters} className="text-xs font-bold text-[#FF6B00] hover:text-[#e65000] bg-orange-50 px-3 py-1.5 rounded-full transition">ล้างตัวกรอง</button>)}
                    </div>
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
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
                        {loading ? ([...Array(6)].map((_, i) => <SkeletonEvent key={i} />)) : (
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
                        )}
                    </div>
                </div>
            </div>

            {/* Float Map Button */}
            {mobileViewMode === 'list' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50]">
                    <button onClick={() => setMobileViewMode('map')} className="flex items-center gap-2 bg-[#222] text-white px-6 py-3 rounded-full shadow-2xl font-bold transition transform hover:scale-105 active:scale-95 border border-white/20">
                        <IconMapPin size={18} /> แผนที่
                    </button>
                </div>
            )}

            {/* --- MAP VIEW (แก้ไขตรงนี้) --- */}
            {mobileViewMode === 'map' && (
                <div className="fixed inset-0 z-[5000] bg-white flex flex-col">
                    <div className="bg-white shadow-sm z-[5010] flex-shrink-0">
                         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <button onClick={() => setMobileViewMode('list')} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition">
                                <IconChevronLeft size={22} />
                            </button>
                            <h1 className="text-lg font-bold text-gray-900">สำรวจ Event ({visibleEventsCount})</h1>
                            {isFilterActive ? <button onClick={handleClearFilters} className="text-xs font-bold text-[#FF6B00]">ล้างตัวกรอง</button> : <div className="w-9"></div>}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide bg-white/95 backdrop-blur-sm">
                            
                            {/* ✅ UPDATED: Select ที่เปลี่ยนสีได้ + มี Animation */}
                            <motion.div 
                                className="relative shrink-0"
                                key={timeframeFilter} // Key เปลี่ยน -> Trigger Animation
                                initial={{ scale: 1 }}
                                animate={{ scale: timeframeFilter !== 'all' ? [1, 1.1, 1] : 1 }} // เด้งดึ๋งเมื่อไม่ใช้ All
                                transition={{ duration: 0.3 }}
                            >
                                <select 
                                    className={`appearance-none text-xs font-bold py-1.5 pl-3 pr-8 rounded-full focus:outline-none transition-all duration-300 border ${
                                        timeframeFilter !== 'all' 
                                        ? "bg-[#FF6B00] border-[#FF6B00] text-white shadow-md ring-2 ring-orange-200" // 🎨 Active Style
                                        : "bg-gray-100 border-transparent hover:border-gray-300 text-gray-700" // Default Style
                                    }`} 
                                    value={timeframeFilter} 
                                    onChange={(e) => setTimeframeFilter(e.target.value)}
                                >
                                    <option value="all" className="bg-white text-gray-700">📅 ทุกช่วงเวลา</option>
                                    <option value="today" className="bg-white text-gray-700">🔥 วันนี้</option>
                                    <option value="this_month" className="bg-white text-gray-700">เดือนนี้</option>
                                    <option value="next_month" className="bg-white text-gray-700">เดือนหน้า</option>
                                </select>
                                {/* Custom Arrow Icon เพื่อให้สีตัดกับพื้นหลัง */}
                                <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${timeframeFilter !== 'all' ? 'text-white' : 'text-gray-500'}`}>
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                                </div>
                            </motion.div>

                            <div className="relative shrink-0">
                                <select className="appearance-none bg-gray-100 border border-transparent hover:border-gray-300 text-gray-700 text-xs font-bold py-1.5 pl-3 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                    {["ทั้งหมด", "Concert", "Fan Meeting", "Fansign", "Workshop", "Exhibition", "Fan Event", "Pop-up Store", "Others"].map((filter) => (
                                        <option key={filter} value={filter}>{filter === "ทั้งหมด" ? "🏷️ หมวดหมู่ทั้งหมด" : filter}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="relative flex-1 w-full h-full">
                        {/* ✅ Loading Overlay */}
                        <AnimatePresence>
                            {isSearching && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-[5025] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white"
                                >
                                    <div className="w-12 h-12 border-4 border-white/20 border-t-[#FF6B00] rounded-full animate-spin mb-4"></div>
                                    <p className="text-lg font-bold">กำลังค้นหา...</p>
                                    <p className="text-sm text-white/70">กิจกรรม 'วันนี้' ในบริเวณนี้</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <MobileToast toastInfo={toastInfo} setToastInfo={setToastInfo} />
                        
                        <div className="absolute right-4 bottom-48 md:bottom-32 z-[5020] flex flex-col gap-3 items-end pointer-events-auto">
                            <button 
                                onClick={handleSmartNearMe} 
                                disabled={isLocating || isSearching} 
                                className={`flex items-center gap-2 px-4 h-11 rounded-full bg-white shadow-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition ${(isLocating || isSearching) ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {(isLocating || isSearching) ? <span className="animate-spin">...</span> : <IconTarget size={18} />}
                                <span>ใกล้ฉัน</span>
                            </button>

                            <button 
                                onClick={() => setMobileViewMode('list')} 
                                className="flex items-center gap-2 px-4 h-11 rounded-full bg-[#222] text-white shadow-2xl border border-white/20 font-bold text-sm transition transform hover:scale-105 active:scale-95"
                            >
                                <IconList size={18} />
                                <span>รายการ</span> 
                            </button>
                        </div>

                        <EventsMap 
                            events={eventsWithLocation} 
                            hoveredEventId={hoveredEventId} 
                            onMarkerClick={handleMobileMarkerClick} 
                            mapRef={mapRef} 
                            setMapBounds={setMapBounds} 
                            searchOnMove={searchOnMove} 
                            showMapDesktop={false} 
                            mobileViewMode={mobileViewMode} 
                        />

                        <MobileEventCarousel 
                            visibleEventsCount={visibleEventsCount}
                            filteredEvents={displayedEvents}
                            hoveredEventId={hoveredEventId}
                            setHoveredEventId={setHoveredEventId}
                            carouselRef={carouselRef}
                            navigate={navigate}
                            isProgrammaticScrollRef={isProgrammaticScrollRef} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileEventsView;