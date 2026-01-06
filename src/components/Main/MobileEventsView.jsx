import React, { useRef } from "react";
import { IconChevronLeft, IconMapPin } from "../icons/Icons";
import { SkeletonEvent } from "../ui/UIComponents";
import { EventCard } from "../ui/CardComponents";
import { motion, AnimatePresence } from "framer-motion";
import EventsMap from "./EventsMap";

const MobileEventsView = ({
    events, loading, filteredEvents,
    categoryFilter, setCategoryFilter,
    timeframeFilter, setTimeframeFilter,
    sortOrder, setSortOrder,
    mobileViewMode, setMobileViewMode,
    hoveredEventId, setHoveredEventId,
    searchOnMove, setSearchOnMove,
    mapBounds, setMapBounds,
    mapRef, handleNearMe, isLocating,
    handleClearFilters, navigate, onMarkerClick,
    eventsWithLocation
}) => {
    
    const carouselRef = useRef(null);

    const handleMobileMarkerClick = (id) => {
        setHoveredEventId(id);
        if (mobileViewMode === 'map' && carouselRef.current) {
            const cardElement = document.getElementById(`mobile-card-${id}`);
            if (cardElement) cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    };

    return (
        <div className="w-full h-full relative bg-white overflow-hidden">
            
            {/* List View */}
            <div className={`flex flex-col h-full transition-all duration-300 ${mobileViewMode === 'map' ? 'hidden' : 'flex'}`}>
                <div className="flex-1 overflow-y-auto pb-24">
                    <div className="flex justify-between items-center mb-6 pt-6 px-4 bg-white z-30 relative">
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate("/#events-section")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><IconChevronLeft size={24} className="text-gray-700" /></button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">กิจกรรมทั้งหมด</h1>
                                {!loading && <p className="text-sm text-gray-500">พบ {filteredEvents.length} อีเวนต์</p>}
                            </div>
                        </div>
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

                    {loading ? (
                        // ✅ แก้จุดที่ 1: เพิ่ม md:grid-cols-3 lg:grid-cols-4 ให้รองรับ Tablet
                        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
                            {[...Array(6)].map((_, i) => <SkeletonEvent key={i} />)}
                        </div>
                    ) : (
                        // ✅ แก้จุดที่ 2: เพิ่ม md:grid-cols-3 lg:grid-cols-4 ให้รองรับ Tablet
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

            {/* Map View */}
            {mobileViewMode === 'map' && (
                <div className="fixed inset-0 z-[2000] bg-white">
                    <div className="w-full h-full relative">
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
                            <button onClick={() => setSearchOnMove(!searchOnMove)} className="bg-white px-4 py-2 rounded-full shadow-md border border-gray-200 text-sm font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 active:scale-95">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${searchOnMove ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-gray-400 bg-white'}`}>
                                    {searchOnMove && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                ค้นหาเมื่อเลื่อนแผนที่
                            </button>
                        </div>
                        <div className="absolute right-4 bottom-56 z-[1000]">
                            <button onClick={handleNearMe} disabled={isLocating} className={`bg-white px-4 py-3 rounded-full shadow-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition active:scale-95 hover:text-[#FF6B00] flex items-center gap-2 font-bold ${isLocating ? 'opacity-70 cursor-wait' : ''}`}>
                                {isLocating ? "..." : "📍 ใกล้ฉัน"}
                            </button>
                        </div>

                        <EventsMap events={eventsWithLocation} hoveredEventId={hoveredEventId} onMarkerClick={handleMobileMarkerClick} mapRef={mapRef} setMapBounds={setMapBounds} searchOnMove={searchOnMove} showMapDesktop={false} mobileViewMode={mobileViewMode} />

                        {/* Carousel */}
                        <div className="absolute bottom-6 left-0 right-0 z-[1000] px-4">
                            <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide pt-2">
                                {filteredEvents.map((item) => (
                                    // ✅ แก้จุดที่ 3: เพิ่ม md:min-w-[350px] เพื่อไม่ให้การ์ดใหญ่เกินไปบน iPad
                                    <div id={`mobile-card-${item.id}`} key={item.id} className={`min-w-[85vw] md:min-w-[350px] snap-center shrink-0 transition-transform duration-300 ${hoveredEventId === item.id ? 'scale-105' : 'scale-100'}`} onClick={() => setHoveredEventId(item.id)}>
                                        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                                            <div className="flex h-32">
                                                <div className="w-32 h-full shrink-0"><img src={item.image_url} className="w-full h-full object-cover" alt="" /></div>
                                                <div className="flex-1 p-3 flex flex-col justify-between">
                                                    <div>
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 mb-1">{item.category}</span>
                                                        <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">{item.title}</h3>
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <p className="text-xs text-gray-500">📅 {item.date_display || item.date}</p>
                                                        <button onClick={(e) => { e.stopPropagation(); navigate(`/event/${item.id}`); }} className="bg-[#FF6B00] text-white text-[10px] px-2 py-1 rounded-md font-bold">ดูรายละเอียด</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000]">
                <button onClick={() => setMobileViewMode(mobileViewMode === 'list' ? 'map' : 'list')} className="flex items-center gap-2 bg-[#222] text-white px-6 py-3 rounded-full shadow-2xl font-bold transition transform hover:scale-105 active:scale-95 border border-white/20">
                    {mobileViewMode === 'list' ? <><IconMapPin size={18} /> แผนที่</> : <>📄 รายการ</>}
                </button>
            </div>
        </div>
    );
};

export default MobileEventsView;