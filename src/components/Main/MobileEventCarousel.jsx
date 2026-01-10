import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const MobileEventCarousel = ({ 
    visibleEventsCount, 
    filteredEvents, 
    hoveredEventId, 
    setHoveredEventId, 
    carouselRef, 
    // navigate ไม่ได้ใช้แล้ว เพราะใช้ window.open
}) => {

    const handleNavigateToMap = (e, item) => {
        e.stopPropagation(); 
        if (item.lat && item.lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`, '_blank');
        } else {
            alert("ไม่พบพิกัดของสถานที่จัดงานนี้");
        }
    };

    const handleViewDetails = (e, id) => {
        e.stopPropagation();
        const url = `${window.location.origin}/event/${id}`;
        window.open(url, '_blank');
    };

    return (
        <AnimatePresence>
            {visibleEventsCount > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-6 left-0 right-0 z-[5010] pointer-events-none"
                >
                    {/* Container Scroll */}
                    <div 
                        ref={carouselRef} 
                        className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x scrollbar-hide pt-10 pointer-events-auto items-end"
                    >
                        {filteredEvents.map((item) => (
                            <div 
                                id={`mobile-card-${item.id}`} 
                                key={item.id} 
                                // ✅ แก้: ใช้ w-[80vw] และ max-w-[320px] เพื่อไม่ให้กว้างเกินไปจนล้น
                                className={`w-[80vw] max-w-[320px] snap-center shrink-0 transition-transform duration-300 ${hoveredEventId === item.id ? 'scale-100' : 'scale-95'}`} 
                                onClick={() => setHoveredEventId(item.id)}
                            >
                                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 h-[140px] flex">
                                    
                                    {/* --- 1. รูปภาพ (ฝั่งซ้าย) --- */}
                                    {/* Fix ความกว้างรูปไว้ที่ 110px เพื่อให้ไม่กินที่เนื้อหา */}
                                    <div className="w-[110px] h-full shrink-0 relative bg-gray-200">
                                        <img 
                                            src={item.image_url} 
                                            className="w-full h-full object-cover" 
                                            alt={item.title} 
                                            loading="lazy"
                                        />
                                        {/* แถบสีส้มตกแต่ง */}
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#FF6B00]"></div>
                                    </div>

                                    {/* --- 2. เนื้อหา (ฝั่งขวา) --- */}
                                    <div className="flex-1 flex flex-col min-w-0">
                                        
                                        {/* ส่วนข้อมูล (Padding ปกติ) */}
                                        <div className="p-3 pb-1 flex-1">
                                            {/* หมวดหมู่ */}
                                            <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                                                {item.category || "EVENT"}
                                            </div>

                                            {/* ชื่องาน */}
                                            <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2 mb-1">
                                                {item.title}
                                            </h3>

                                            {/* สถานที่ */}
                                            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                📍 {item.location || item.location_name || "ไม่ระบุ"}
                                            </p>
                                            
                                             {/* วันที่ (แบบย่อ) */}
                                             <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                                📅 {item.date_display || item.date}
                                            </p>
                                        </div>

                                        {/* --- 3. ส่วน Action (ล่างสุด) --- */}
                                        {/* มีเส้นขีดคั่นข้างบน (border-t) แบบ Agoda */}
                                        <div className="flex items-center h-10 border-t border-gray-100 mt-auto">
                                            
                                            {/* ปุ่มนำทาง (ซ้าย) */}
                                            <button 
                                                onClick={(e) => handleNavigateToMap(e, item)}
                                                className="flex-1 flex items-center justify-center gap-1.5 h-full text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition active:bg-gray-100"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                                                </svg>
                                                นำทาง
                                            </button>

                                            {/* เส้นแบ่งแนวตั้ง (Optional) */}
                                            <div className="w-[1px] h-full bg-gray-100"></div>

                                            {/* ปุ่มดูรายละเอียด (ขวา - สีส้ม) */}
                                            <button 
                                                onClick={(e) => handleViewDetails(e, item.id)}
                                                className="flex-1 h-full text-[11px] font-bold text-[#FF6B00] hover:bg-orange-50 transition active:bg-orange-100"
                                            >
                                                ดูรายละเอียด
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobileEventCarousel;