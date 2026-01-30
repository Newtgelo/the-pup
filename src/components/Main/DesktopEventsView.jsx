import React, { useRef, useState, useEffect } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconX,
} from "../icons/Icons";
import { SkeletonEvent } from "../ui/UIComponents";
import { EventCard } from "../ui/CardComponents";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import EventsMap from "./EventsMap";
import L from "leaflet";

// --- 📐 Helper: คำนวณระยะทาง ---
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- 🎨 Helper: สีหมวดหมู่ ---
const categoryColors = {
  Concert: "#FF6B00",
  "Fan Meeting": "#E91E63",
  Fansign: "#9C27B0",
  Workshop: "#2196F3",
  Exhibition: "#00BCD4",
  "Fan Event": "#4CAF50",
  "Pop-up Store": "#3F51B5",
  Others: "#607D8B",
};

// --- 📇 Sub-Component: การ์ดเดี่ยวๆ ---
const SingleFloatingCard = ({ event, isCenter, onClick, onClose }) => {
  const cardVariants = {
    center: { scale: 1, opacity: 1, zIndex: 50, y: 0, x: 0 },
    side: {
      scale: 0.85,
      opacity: 0.5,
      zIndex: 10,
      y: 15,
      x: 0,
      cursor: "pointer",
    },
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="side"
      animate={isCenter ? "center" : "side"}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      onClick={!isCenter ? onClick : undefined}
      className={`bg-white rounded-2xl shadow-2xl p-2 flex items-center gap-3 border border-gray-100 relative flex-shrink-0 transition-shadow duration-300 ${isCenter ? "w-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-gray-900/5" : "w-[320px] grayscale-[30%]"}`}
    >
      {/* รูปภาพ */}
      <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100 relative">
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {!isCenter && <div className="absolute inset-0 bg-white/20" />}
      </div>

      {/* ข้อมูลตรงกลาง */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{
              backgroundColor: `${categoryColors[event.category]}20`,
              color: categoryColors[event.category],
            }}
          >
            {event.category}
          </span>
          {event.location && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
              <span
                className="text-[10px] text-gray-500 font-medium truncate"
                title={event.location}
              >
                {event.location}
              </span>
            </div>
          )}
        </div>

        <h3
          className="text-sm font-bold text-gray-900 truncate leading-tight"
          title={event.title}
        >
          {event.title}
        </h3>
        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
          📅{" "}
          {event.date_display ||
            new Date(event.date).toLocaleDateString("th-TH")}
        </p>
      </div>

      {/* ปุ่ม Action ด้านขวา */}
      <div
        className={`flex flex-col gap-2 items-end pr-1 transition-opacity duration-200 ${isCenter ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <button
          onClick={() => window.open(`/event/${event.id}`, "_blank")}
          className="bg-[#FF6B00] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-[#e65000] transition shadow-sm whitespace-nowrap"
        >
          ดูรายละเอียด
        </button>
        <a
          href={`http://googleusercontent.com/maps.google.com/?q=${event.lat},${event.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-[#FF6B00] transition p-1 hover:bg-orange-50 rounded flex items-center justify-center"
          title="เปิดใน Google Maps"
          onClick={(e) => e.stopPropagation()}
        >
          <IconMapPin size={18} />
        </a>
      </div>

      {isCenter && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 transition z-20"
        >
          <IconX size={12} />
        </button>
      )}
    </motion.div>
  );
};

// --- 🎠 Component: Carousel Container ---
const FloatingCarouselCard = ({
  currentEvent,
  prevEvent,
  nextEvent,
  onNext,
  onPrev,
  onClose,
  onCenterMap,
  hasNext,
  hasPrev,
}) => {
  if (!currentEvent) return null;

  return (
    <div className="absolute bottom-8 inset-x-0 mx-auto w-full z-[20] flex justify-center items-center gap-4 pointer-events-none px-4 h-[120px]">
      <div className="pointer-events-auto z-[21]">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={`w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg border border-gray-200 flex items-center justify-center transition-all ${!hasPrev ? "opacity-30 cursor-not-allowed grayscale" : "hover:scale-110 hover:bg-white text-gray-800 hover:shadow-xl"}`}
        >
          <IconChevronLeft size={24} />
        </button>
      </div>

      <div className="flex items-center justify-center relative min-w-[360px]">
        <LayoutGroup>
          <AnimatePresence mode="popLayout">
            {prevEvent && (
              <div
                key={prevEvent.id}
                className="pointer-events-auto hidden xl:block absolute -left-[290px] scale-90 opacity-40 z-0"
              >
                <SingleFloatingCard
                  event={prevEvent}
                  isCenter={false}
                  onClick={onPrev}
                />
              </div>
            )}

            <div
              key={currentEvent.id}
              className="pointer-events-auto z-50 mx-2"
            >
              <SingleFloatingCard
                event={currentEvent}
                isCenter={true}
                onClose={onClose}
              />
            </div>

            {nextEvent && (
              <div
                key={nextEvent.id}
                className="pointer-events-auto hidden xl:block absolute -right-[290px] scale-90 opacity-40 z-0"
              >
                <SingleFloatingCard
                  event={nextEvent}
                  isCenter={false}
                  onClick={onNext}
                />
              </div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>

      <div className="pointer-events-auto z-[21]">
        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg border border-gray-200 flex items-center justify-center transition-all ${!hasNext ? "opacity-30 cursor-not-allowed grayscale" : "hover:scale-110 hover:bg-white text-gray-800 hover:shadow-xl"}`}
        >
          <IconChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---
const DesktopEventsView = ({
  events,
  loading,
  filteredEvents,
  categoryFilter,
  setCategoryFilter,
  timeframeFilter,
  setTimeframeFilter,
  sortOrder,
  setSortOrder,
  showMapDesktop,
  setShowMapDesktop,
  hoveredEventId,
  setHoveredEventId,
  searchOnMove,
  setSearchOnMove,
  mapBounds,
  setMapBounds,
  mapRef,
  handleNearMe,
  isLocating,
  handleClearFilters,
  navigate,
  eventsWithLocation,
  mobileViewMode,
}) => {
  const hasActiveFilter =
    categoryFilter !== "ทั้งหมด" || timeframeFilter !== "all" || searchOnMove;

  const containerPaddingClass = showMapDesktop
    ? "px-4 md:px-6 lg:px-8"
    : "max-w-7xl mx-auto px-4 md:px-6 lg:px-8";

  const cardRefs = useRef({});
  const [nearbyQueue, setNearbyQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);

  const handleMarkerClick = (clickedId) => {
    const clickedEvent = eventsWithLocation.find((e) => e.id === clickedId);
    if (!clickedEvent) return;

    const sortedEvents = [...eventsWithLocation]
      .map((e) => ({
        ...e,
        distance: getDistanceFromLatLonInKm(
          parseFloat(clickedEvent.lat),
          parseFloat(clickedEvent.lng),
          parseFloat(e.lat),
          parseFloat(e.lng),
        ),
      }))
      .sort((a, b) => a.distance - b.distance);

    setNearbyQueue(sortedEvents);
    setQueueIndex(0);
    setHoveredEventId(clickedId);
    flyToEvent(clickedEvent);
  };

  const handleNext = () => {
    if (queueIndex < nearbyQueue.length - 1) {
      const nextIdx = queueIndex + 1;
      setQueueIndex(nextIdx);
      const nextEvt = nearbyQueue[nextIdx];
      flyToEvent(nextEvt);
      setHoveredEventId(nextEvt.id);
    }
  };

  const handlePrev = () => {
    if (queueIndex > 0) {
      const prevIdx = queueIndex - 1;
      setQueueIndex(prevIdx);
      const prevEvt = nearbyQueue[prevIdx];
      flyToEvent(prevEvt);
      setHoveredEventId(prevEvt.id);
    }
  };

  const handleCloseCard = () => {
    setNearbyQueue([]);
    setQueueIndex(0);
    setHoveredEventId(null);
  };

  const flyToEvent = (event) => {
    const lat = parseFloat(event?.lat);
    const lng = parseFloat(event?.lng);

    if (mapRef.current && !isNaN(lat) && !isNaN(lng)) {
      const map = mapRef.current;
      const targetZoom = 15;
      const targetPoint = map.project([lat, lng], targetZoom);
      targetPoint.y += 150;
      const targetLatLng = map.unproject(targetPoint, targetZoom);

      map.flyTo(targetLatLng, targetZoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  };

  const currentEvent = nearbyQueue[queueIndex] || null;
  const prevEvent = queueIndex > 0 ? nearbyQueue[queueIndex - 1] : null;
  const nextEvent =
    queueIndex < nearbyQueue.length - 1 ? nearbyQueue[queueIndex + 1] : null;

  // ✅ FIX Grid Logic: เพิ่ม 2xl:grid-cols-6
  // ถ้าปิดแผนที่ (Full Width): 2 -> 3 -> 4 -> 5 -> 6
  // ถ้าเปิดแผนที่ (Half Width): 2 -> 3
  const gridClass = showMapDesktop
    ? "gap-4 grid-cols-2 xl:grid-cols-3"
    : "gap-4 md:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6";

  return (
    <div className="w-full h-full flex flex-row bg-white overflow-hidden">
      {/* --- LEFT: List Section --- */}
      <div
        className={`flex flex-col h-full transition-all duration-300 ease-in-out ${showMapDesktop ? "lg:w-1/2" : "w-full"} `}
      >
        <div className="flex-1 overflow-y-auto pb-6 scroll-smooth">
          <div
            className={`flex justify-between items-center mb-6 pt-6 bg-white z-30 relative ${containerPaddingClass}`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/#events-section")}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <IconChevronLeft size={24} className="text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  กิจกรรมทั้งหมด
                </h1>
                {!loading && (
                  <p className="text-sm text-gray-500">
                    พบ {filteredEvents.length} อีเวนต์
                  </p>
                )}
              </div>
            </div>
          </div>
          <div
            className={`sticky top-0 bg-white z-30 py-2 mb-6 border-b border-gray-100 ${containerPaddingClass}`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
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
                <button
                  onClick={() => setShowMapDesktop(!showMapDesktop)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-700 hover:bg-black hover:text-white hover:border-black transition active:scale-95 whitespace-nowrap"
                >
                  {showMapDesktop ? (
                    <>
                      <IconX size={18} /> ปิดแผนที่  
                    </>
                  ) : (
                    <>
                      <IconMapPin size={18} /> แสดงแผนที่
                    </>
                  )}
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  "ทั้งหมด",
                  "Concert",
                  "Fan Meeting",
                  "Fansign",
                  "Workshop",
                  "Exhibition",
                  "Fan Event",
                  "Pop-up Store",
                  "Others",
                ].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCategoryFilter(filter)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition border ${categoryFilter === filter ? "bg-[#FF6B00] text-white border-[#FF6B00]" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Grid List */}
          {loading ? (
            <div
              className={`grid w-full ${gridClass} ${containerPaddingClass}`}
            >
              {[...Array(6)].map((_, i) => (
                <SkeletonEvent key={i} />
              ))}
            </div>
          ) : (
            <div
              className={`grid w-full ${gridClass} ${containerPaddingClass}`}
            >
              {filteredEvents.length > 0 ? (
                filteredEvents.map((item) => (
                  <div 
        key={item.id} 
        // ✅ 1. Wrapper ยังคงรับ Mouse Enter/Leave เพื่อทำ Effect ขอบส้ม
        className={`cursor-pointer rounded-xl transition-all duration-200 ease-in-out border-2 ${hoveredEventId === item.id ? 'border-[#FF6B00] scale-[1.02] shadow-xl ring-2 ring-[#FF6B00]/20' : 'border-transparent hover:border-transparent'}`}
        onMouseEnter={() => setHoveredEventId(item.id)} 
        onMouseLeave={() => setHoveredEventId(null)}
        ref={el => cardRefs.current[item.id] = el}
        
        // ✅ 2. สั่งเปิด Tab ใหม่ที่นี่ (และสั่ง stopPropagation กันเหนียว)
        onClick={(e) => {
             e.preventDefault();
             e.stopPropagation();
             window.open(`/event/${item.id}`, '_blank');
        }}
    >
        {/* ✅ 3. ไม้ตาย: ครอบ div อีกชั้น ใส่ pointer-events-none */}
        {/* คำสั่งนี้จะทำให้ EventCard ข้างใน "กดไม่ติด" (ทะลุผ่าน) ทำให้ Link เดิมไม่ทำงาน */}
        <div className="pointer-events-none">
            <EventCard item={item} />
        </div>
    </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center">
                  <div className="text-5xl mb-4 grayscale opacity-50">🗺️</div>
                  <p className="text-lg font-medium text-gray-300 mb-6">
                    ไม่พบกิจกรรม
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-2.5 rounded-full border-2 border-gray-200 text-gray-500 font-bold text-sm hover:border-[#FF6B00] hover:text-[#FF6B00] hover:bg-orange-50 transition-all duration-200 flex items-center gap-2"
                  >
                    <IconX size={16} /> ล้างตัวกรองทั้งหมด
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- RIGHT: Map Section --- */}
      <div
        className={`lg:w-1/2 h-full bg-white p-6 xl:p-8 relative transition-all duration-300 ease-in-out ${showMapDesktop ? "block" : "hidden"}`}
      >
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[10]">
            <button
              onClick={() => setSearchOnMove(!searchOnMove)}
              className="bg-white px-4 py-2 rounded-full shadow-md border border-gray-200 text-sm font-bold text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition active:scale-95"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${searchOnMove ? "bg-[#FF6B00] border-[#FF6B00]" : "border-gray-400 bg-white"}`}
              >
                {searchOnMove && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              ค้นหาเมื่อเลื่อนแผนที่
            </button>
          </div>

          <div className="absolute bottom-40 right-4 z-[10]">
            <button
              onClick={handleNearMe}
              disabled={isLocating}
              className={`bg-white px-4 py-3 rounded-full shadow-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition active:scale-95 hover:text-[#FF6B00] flex items-center gap-2 font-bold ${isLocating ? "opacity-70 cursor-wait" : ""}`}
            >
              {isLocating ? (
                <svg
                  className="animate-spin h-5 w-5 text-[#FF6B00]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <IconMapPin size={20} />
              )}
              ใกล้ฉัน
            </button>
          </div>

          <EventsMap
            events={eventsWithLocation}
            hoveredEventId={hoveredEventId}
            setHoveredEventId={setHoveredEventId}
            onMarkerClick={handleMarkerClick}
            mapRef={mapRef}
            setMapBounds={setMapBounds}
            searchOnMove={searchOnMove}
            showMapDesktop={showMapDesktop}
            mobileViewMode={mobileViewMode}
          />

          <FloatingCarouselCard
            currentEvent={currentEvent}
            prevEvent={prevEvent}
            nextEvent={nextEvent}
            onNext={handleNext}
            onPrev={handlePrev}
            hasNext={queueIndex < nearbyQueue.length - 1}
            hasPrev={queueIndex > 0}
            onClose={handleCloseCard}
            onCenterMap={() => flyToEvent(currentEvent)}
          />
        </div>
      </div>
    </div>
  );
};

export default DesktopEventsView;
