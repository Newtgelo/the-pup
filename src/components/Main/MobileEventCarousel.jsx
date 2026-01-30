import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MobileEventCarousel = ({
  visibleEventsCount,
  filteredEvents,
  hoveredEventId,
  setHoveredEventId,
  carouselRef,
  isProgrammaticScrollRef,
}) => {
  const handleNavigateToMap = (e, item) => {
    e.stopPropagation();
    if (item.lat && item.lng) {
      window.open(
        `http://maps.google.com/maps?q=${item.lat},${item.lng}`,
        "_blank",
      );
    } else {
      alert("ไม่พบพิกัดของสถานที่จัดงานนี้");
    }
  };

  const handleViewDetails = (e, id) => {
    e.stopPropagation();
    const url = `${window.location.origin}/event/${id}`;
    window.open(url, "_blank");
  };

  const handleScroll = () => {
    if (isProgrammaticScrollRef && isProgrammaticScrollRef.current) {
      return;
    }

    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;

    let closestCardId = null;
    let minDistance = Infinity;

    filteredEvents.forEach((item) => {
      const card = document.getElementById(`mobile-card-${item.id}`);
      if (card) {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(containerCenter - cardCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestCardId = item.id;
        }
      }
    });

    if (closestCardId && closestCardId !== hoveredEventId) {
      setHoveredEventId(closestCardId);
    }
  };

  useEffect(() => {
    if (carouselRef.current && filteredEvents.length > 0) {
      setTimeout(() => {
        if (!carouselRef.current) return;

        const firstEventId = filteredEvents[0].id;
        const firstCard = document.getElementById(
          `mobile-card-${firstEventId}`,
        );

        if (firstCard) {
          const container = carouselRef.current;
          const cardLeft = firstCard.offsetLeft;
          const cardWidth = firstCard.offsetWidth;
          const containerWidth = container.clientWidth;

          const scrollTo = cardLeft - containerWidth / 2 + cardWidth / 2;

          container.scrollTo({ left: scrollTo, behavior: "auto" });
          setHoveredEventId(firstEventId);
        }
      }, 100);
    }
  }, [filteredEvents]);

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
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide pt-10 pointer-events-auto items-end touch-pan-x"
          >
            {/* 1. HEAD CARD (ใบสรุปงาน) */}
            <div className="snap-center shrink-0 w-[140px] h-[140px] flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur-md w-full h-full rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-between text-center p-3 py-4">
                <div className="flex flex-col items-center justify-center flex-1">
                  <div className="bg-orange-50 text-[#FF6B00] w-9 h-9 rounded-full flex items-center justify-center mb-1.5 shadow-sm">
                    <span className="text-lg">🎉</span>
                  </div>
                  <div className="font-bold text-gray-900 text-sm">
                    พบ {visibleEventsCount} งาน
                  </div>
                  <div className="text-[10px] text-gray-500">
                    ในบริเวณหน้าจอนี้
                  </div>
                </div>
                <div className="w-full mt-2 pt-2 border-t border-gray-100">
                  <p className="text-[9px] text-gray-400 font-medium bg-gray-50 rounded-lg py-1 px-2 inline-block">
                    👈 เลื่อนแผนที่เพื่อดูเพิ่ม
                  </p>
                </div>
              </div>
            </div>

            {/* 2. EVENT CARDS (รายการงาน) */}
            {filteredEvents.map((item) => (
              <div
                id={`mobile-card-${item.id}`}
                key={item.id}
                className={`w-[80vw] max-w-[320px] snap-center shrink-0 transition-transform duration-300 ${hoveredEventId === item.id ? "scale-100" : "scale-95"}`}
                onClick={() => setHoveredEventId(item.id)}
              >
                <div
                  className={`bg-white rounded-xl shadow-lg overflow-hidden border transition-all duration-300 h-[140px] flex ${hoveredEventId === item.id ? "border-gray-100 shadow-xl" : "border-gray-100"}`}
                >
                  <div className="w-[110px] h-full shrink-0 relative bg-gray-200">
                    <img
                      src={item.image_url}
                      className="w-full h-full object-cover"
                      alt={item.title}
                      loading="lazy"
                    />
                    <div className="absolute top-0 left-0 w-1 h-full bg-transparent"></div>
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-3 pb-1 flex-1">
                      <div className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">
                        {item.category || "EVENT"}
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 leading-tight line-clamp-2 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        📍 {item.location || item.location_name || "ไม่ระบุ"}
                      </p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                        📅 {item.date_display || item.date}
                      </p>
                    </div>
                    <div className="flex items-center h-10 border-t border-gray-100 mt-auto">
                      <button
                        onClick={(e) => handleNavigateToMap(e, item)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-full text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition active:bg-gray-100"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                        </svg>{" "}
                        นำทาง
                      </button>
                      <div className="w-[1px] h-full bg-gray-100"></div>
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

            {/* ✅ 3. TAIL CARD - แบบมี Emoji เคลื่อนไหว */}
            <div className="snap-center shrink-0 w-[140px] h-[140px] flex items-center justify-center">
              <div className="bg-white/95 backdrop-blur-md w-full h-full rounded-xl border-2 border-dashed border-gray-300 shadow-sm flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
                {/* Animated Icon */}
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-orange-100/50 rounded-full animate-ping"></div>
                  <div className="relative bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-3xl animate-bounce">🗺️</span>
                  </div>
                </div>

                {/* Text */}
                <div className="text-xs font-bold text-gray-800 mb-1">
                  ซูมออก 🔍
                </div>
                <div className="text-[9px] text-gray-500 leading-tight font-medium">
                  หรือเลื่อนแผนที่
                  <br />
                  เพื่อค้นหารอบๆ
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileEventCarousel;
