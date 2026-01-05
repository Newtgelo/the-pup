import React, { useRef } from "react";
import { IconChevronLeft, IconMapPin, IconX } from "../icons/Icons";
import { SkeletonEvent } from "../ui/UIComponents";
import { EventCard } from "../ui/CardComponents";
import { motion, AnimatePresence } from "framer-motion";
import EventsMap from "./EventsMap";

const DesktopEventsView = ({
    events, loading, filteredEvents,
    categoryFilter, setCategoryFilter,
    timeframeFilter, setTimeframeFilter,
    sortOrder, setSortOrder,
    showMapDesktop, setShowMapDesktop,
    hoveredEventId, setHoveredEventId,
    searchOnMove, setSearchOnMove,
    mapBounds, setMapBounds,
    mapRef, handleNearMe, isLocating,
    handleClearFilters, navigate, onMarkerClick,
    eventsWithLocation,
    mobileViewMode // ✅ 1. เพิ่มบรรทัดนี้ครับ! (รับค่ามา)
}) => {
    
    const hasActiveFilter = categoryFilter !== "ทั้งหมด" || timeframeFilter !== "all" || searchOnMove;
    const containerPaddingClass = showMapDesktop 
        ? "px-6 md:px-8 lg:px-12 lg:pr-10" 
        : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
    const cardRefs = useRef({});

    return (
        <div className="w-full h-full flex flex-row bg-white overflow-hidden">
            {/* ... (ส่วน List ด้านซ้าย เหมือนเดิมทุกประการ) ... */}
            <div className={`flex flex-col h-full transition-all duration-300 ease-in-out ${showMapDesktop ? 'lg:w-1/2' : 'w-full'} `}>
                <div className="flex-1 overflow-y-auto pb-6 scroll-smooth">
                    {/* Header */}
                    <div className={`flex justify-between items-center mb-6 pt-6 bg-white z-30 relative ${containerPaddingClass}`}>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate("/#events-section")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"><IconChevronLeft size={24} className="text-gray-700" /></button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">กิจกรรมทั้งหมด</h1>
                                {!loading && <p className="text-sm text-gray-500">พบ {filteredEvents.length} อีเวนต์</p>}
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className={`sticky top-0 bg-white z-30 py-2 mb-6 border-b border-gray-100 ${containerPaddingClass}`}>
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="flex gap-2 items-center">
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

                                    <AnimatePresence>
                                        {hasActiveFilter && (
                                            <motion.button 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                onClick={handleClearFilters}
                                                className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#FF6B00] transition ml-2 font-bold bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
                                            >
                                                <IconX size={14} /> ล้างค่า
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <button onClick={() => setShowMapDesktop(!showMapDesktop)} className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-700 hover:bg-black hover:text-white hover:border-black transition active:scale-95 whitespace-nowrap">
                                    {showMapDesktop ? <><IconX size={18} /> แสดงรายการแบบเต็ม</> : <><IconMapPin size={18} /> แสดงแผนที่</>}
                                </button>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {["ทั้งหมด", "Concert", "Fan Meeting", "Fansign", "Workshop", "Exhibition", "Fan Event", "Pop-up Store", "Others"].map((filter) => (
                                    <button key={filter} onClick={() => setCategoryFilter(filter)} className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition border ${categoryFilter === filter ? "bg-[#FF6B00] text-white border-[#FF6B00]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>{filter}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Grid List */}
                    {loading ? (
                        <div className={`grid gap-6 ${containerPaddingClass} ${showMapDesktop ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                            {[...Array(6)].map((_, i) => <SkeletonEvent key={i} />)}
                        </div>
                    ) : (
                        <div className={`grid gap-6 ${containerPaddingClass} ${showMapDesktop ? 'grid-cols-2 xl:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className={`
                                            rounded-xl transition-all duration-200 ease-in-out border-2
                                            ${hoveredEventId === item.id 
                                                ? 'border-[#FF6B00] scale-[1.02] shadow-xl ring-2 ring-[#FF6B00]/20' 
                                                : 'border-transparent hover:border-transparent'
                                            }
                                        `}
                                        onMouseEnter={() => setHoveredEventId(item.id)} 
                                        onMouseLeave={() => setHoveredEventId(null)}
                                        ref={el => cardRefs.current[item.id] = el}
                                    >
                                        <EventCard item={item} onClick={() => window.open(`/event/${item.id}`, '_blank')} />
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center text-gray-400">
                                    <div className="text-5xl mb-4">🗺️</div>
                                    <p>{searchOnMove && showMapDesktop ? "ไม่พบกิจกรรมในบริเวณแผนที่นี้" : "ไม่พบกิจกรรมในช่วงเวลานี้"}</p>
                                    <button onClick={handleClearFilters} className="mt-4 text-[#FF6B00] font-bold hover:underline">ล้างตัวกรองค้นหา</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Map Section */}
            {showMapDesktop && (
                <div className="lg:w-1/2 h-full bg-white p-6 xl:p-8 relative">
                    <div className="sticky top-6 w-full h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                        {/* ... (ปุ่มค้นหาเมื่อเลื่อนแผนที่ & ปุ่มใกล้ฉัน เหมือนเดิม) ... */}
                         <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
                            <button onClick={() => setSearchOnMove(!searchOnMove)} className="bg-white px-4 py-2 rounded-full shadow-md border border-gray-200 text-sm font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition active:scale-95">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${searchOnMove ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-gray-400 bg-white'}`}>
                                    {searchOnMove && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                ค้นหาเมื่อเลื่อนแผนที่
                            </button>
                        </div>
                        <div className="absolute bottom-10 right-4 z-[1000]">
                            <button onClick={handleNearMe} disabled={isLocating} className={`bg-white px-4 py-3 rounded-full shadow-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition active:scale-95 hover:text-[#FF6B00] flex items-center gap-2 font-bold ${isLocating ? 'opacity-70 cursor-wait' : ''}`}>
                                {isLocating ? (
                                    <svg className="animate-spin h-5 w-5 text-[#FF6B00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#FF6B00]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                )}
                                ใกล้ฉัน วันนี้
                            </button>
                        </div>

                        {/* EventsMap */}
                        <EventsMap 
                            events={eventsWithLocation} 
                            hoveredEventId={hoveredEventId} 
                            setHoveredEventId={setHoveredEventId} // ✅ ตรวจสอบว่ามีบรรทัดนี้แล้ว
                            onMarkerClick={onMarkerClick} 
                            mapRef={mapRef} 
                            setMapBounds={setMapBounds} 
                            searchOnMove={searchOnMove} 
                            showMapDesktop={showMapDesktop} 
                            mobileViewMode={mobileViewMode} // ✅ 2. ส่งค่าตัวแปรนี้ไปให้ Map
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DesktopEventsView;