import React, { useRef, useState, useEffect } from "react";
import {
  IconChevronLeft,
  IconMapPin,
  IconTarget,
  IconList,
  IconX,
} from "../icons/Icons";
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
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- 📱 Component: Bottom Sheet ---
const BottomSheet = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[6000] backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white z-[6001] rounded-t-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="pt-4 pb-2 px-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
              >
                <IconX size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto pb-10 safe-area-bottom">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MobileEventsView = ({
  events,
  loading,
  filteredEvents,
  categoryFilter,
  setCategoryFilter,
  timeframeFilter,
  setTimeframeFilter,
  sortOrder,
  setSortOrder,
  mobileViewMode,
  setMobileViewMode,
  hoveredEventId,
  setHoveredEventId,
  searchOnMove,
  setSearchOnMove,
  mapBounds,
  setMapBounds,
  mapRef,
  handleNearMe: originalHandleNearMe,
  isLocating,
  handleClearFilters,
  navigate,
  onMarkerClick,
  eventsWithLocation,
  allEventsWithLocation,
}) => {
  const carouselRef = useRef(null);
  const [toastInfo, setToastInfo] = useState(null);
  const [displayedEvents, setDisplayedEvents] = useState([]);
  const [visibleEventsCount, setVisibleEventsCount] = useState(0);
  const toastTimerRef = useRef(null);
  const isFilterActive =
    timeframeFilter !== "all" || categoryFilter !== "ทั้งหมด";
  const [loadingMessage, setLoadingMessage] = useState(null);

  const clickedMarkerIdRef = useRef(null);
  const isProgrammaticMoveRef = useRef(false);
  const isProgrammaticScrollRef = useRef(false);

  const [activeSheet, setActiveSheet] = useState(null);

  // --- Options Data ---
  const timeframeOptions = [
    { value: "all", label: "📅 ทุกช่วงเวลา" },
    { value: "today", label: "🔥 วันนี้" },
    { value: "this_month", label: "เดือนนี้" },
    { value: "next_month", label: "เดือนหน้า" },
  ];

  const sortOptions = [
    { value: "upcoming", label: "⚡ ใกล้วันงาน" },
    { value: "newest", label: "🆕 ล่าสุด" },
  ];

  const categoryOptions = [
    "ทั้งหมด",
    "Concert",
    "Fan Meeting",
    "Fansign",
    "Workshop",
    "Exhibition",
    "Fan Event",
    "Pop-up Store",
    "Others",
  ];

  const getCurrentLabel = (options, value) =>
    options.find((o) => o.value === value)?.label || value;

  // --- Functions ---
  const handleFullReset = () => {
    setLoadingMessage("กำลังรีเซ็ตค่าเริ่มต้น... 🔄");
    setToastInfo(null);
    setTimeout(() => {
      if (handleClearFilters) handleClearFilters();
      setTimeframeFilter("all");
      setCategoryFilter("ทั้งหมด");
      setSortOrder("upcoming");
      if (mapRef.current) {
        mapRef.current.flyTo([13.7462, 100.5347], 13, { duration: 1.5 });
      }
      setLoadingMessage(null);
    }, 800);
  };

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


  const handleSmartNearMe = () => {
    setLoadingMessage("กำลังค้นหากิจกรรม... \n'วันนี้' ในบริเวณนี้");
    setToastInfo(null);

    setTimeout(() => {
      setTimeframeFilter("today");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            if (mapRef.current) {
              mapRef.current.flyTo([userLat, userLng], 14, { duration: 1.5 });
            }
            setLoadingMessage(null);

            let closestEvent = null;
            let minDistance = Infinity;

            eventsWithLocation.forEach((evt) => {
              if (evt.lat && evt.lng) {
                const dist = getDistanceFromLatLonInKm(
                  userLat,
                  userLng,
                  parseFloat(evt.lat),
                  parseFloat(evt.lng),
                );
                if (dist < minDistance) {
                  minDistance = dist;
                  closestEvent = evt;
                }
              }
            });

            const SEARCH_RADIUS_KM = 20;

            if (minDistance > SEARCH_RADIUS_KM && closestEvent) {
              setTimeout(() => {
                setToastInfo({
                  type: "smart_near_me",
                  message: "แถวนี้เงียบจัง... 🍃",
                  actionLabel: `🚀 ไปหางานใกล้สุด (${minDistance.toFixed(0)} กม.)`,
                  onAction: () => {
                    setToastInfo(null);
                    setLoadingMessage(
                      "กำลังเดินทาง... \nไปงานที่ใกล้ที่สุด 🚀",
                    );
                    setTimeout(() => {
                      if (mapRef.current) {
                        const targetLat = parseFloat(closestEvent.lat);
                        const targetLng = parseFloat(closestEvent.lng);
                        mapRef.current.flyTo([targetLat, targetLng], 14, {
                          duration: 1.5,
                        });
                        setLoadingMessage(null);
                        setTimeout(
                          () => handleMobileMarkerClick(closestEvent.id),
                          1600,
                        );
                      }
                    }, 800);
                  },
                });
              }, 2000);
            } else {
              setToastInfo(null);
            }
          },
          (error) => {
            console.error("Location error:", error);
            setLoadingMessage(null);
            alert("ไม่สามารถระบุตำแหน่งได้ กรุณาเปิด GPS");
          },
        );
      } else {
        setLoadingMessage(null);
        alert("Browser นี้ไม่รองรับ Geolocation");
      }
    }, 800);
  };

  // --- Effects: Logic ที่แก้แล้วอยู่ตรงนี้ครับ! ---
  useEffect(() => {
    if (mobileViewMode === "map") {
      if (loading || loadingMessage) {
        setVisibleEventsCount(0);
        setDisplayedEvents([]);
        setToastInfo(null);
        return;
      }

      if (isProgrammaticMoveRef.current) {
        isProgrammaticMoveRef.current = false;
        return;
      }
      if (hoveredEventId && clickedMarkerIdRef.current === hoveredEventId) {
        return;
      }

      let centerLat = 13.7462;
      let centerLng = 100.5347;
      if (mapRef.current) {
        const center = mapRef.current.getCenter();
        centerLat = center.lat;
        centerLng = center.lng;
      }

      let sourceEvents = filteredEvents || [];

      if (mapBounds) {
        try {
          const paddedBounds = mapBounds.pad(0.2);
          sourceEvents = filteredEvents.filter((evt) => {
            const lat = parseFloat(evt.lat);
            const lng = parseFloat(evt.lng);
            if (isNaN(lat) || isNaN(lng)) return false;
            return paddedBounds.contains([lat, lng]);
          });
        } catch (e) {
          console.warn("Bounds error:", e);
        }
      }

      const sortedEvents = [...sourceEvents].sort((a, b) => {
        const latA = parseFloat(a.lat);
        const lngA = parseFloat(a.lng);
        const latB = parseFloat(b.lat);
        const lngB = parseFloat(b.lng);

        if (isNaN(latA) || isNaN(lngA)) return 1;
        if (isNaN(latB) || isNaN(lngB)) return -1;

        const distA = getDistanceFromLatLonInKm(
          centerLat,
          centerLng,
          latA,
          lngA,
        );
        const distB = getDistanceFromLatLonInKm(
          centerLat,
          centerLng,
          latB,
          lngB,
        );
        return distA - distB;
      });

      setDisplayedEvents(sortedEvents);
      setVisibleEventsCount(sortedEvents.length);

      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

      // ✅ [FIXED]: Logic ตรวจสอบก่อนแจ้งเตือน Reset
      if (sortedEvents.length === 0) {
        toastTimerRef.current = setTimeout(() => {
          // 1. เช็คก่อนว่า "ทั่วประเทศ" (allEventsWithLocation) ยังมีของไหม?
          const hasEventsAnywhere =
            (allEventsWithLocation && allEventsWithLocation.length > 0) ||
            (eventsWithLocation && eventsWithLocation.length > 0);

          if (!hasEventsAnywhere) {
            // === CASE A: ไม่มีงานเลยสักที่ (หมดเกลี้ยง) ===
            // ถึงจะยอมขึ้นเตือนให้ Reset
            if (timeframeFilter !== "all") {
              setToastInfo({
                type: "filter_time",
                message: "ช่วงเวลานี้ไม่มีงานเลย... 📅",
                actionLabel: "⚡ ดูงานเร็วๆ นี้",
                onAction: () => {
                  setToastInfo(null);
                  setLoadingMessage(
                    "กำลังปรับตัวกรอง... \nเป็น 'ทุกช่วงเวลา' ⚡",
                  );
                  setTimeout(() => {
                    setTimeframeFilter("all");
                    setSortOrder("upcoming");
                    setLoadingMessage(null);
                  }, 800);
                },
              });
              return;
            }
            if (categoryFilter !== "ทั้งหมด") {
              setToastInfo({
                type: "filter_cat",
                message: `ไม่พบ ${categoryFilter} ในตอนนี้`,
                actionLabel: "↺ ล้างตัวกรอง",
                onAction: () => {
                  setToastInfo(null);
                  setLoadingMessage("กำลังล้างตัวกรอง... 🧹");
                  setTimeout(() => {
                    handleClearFilters();
                    setLoadingMessage(null);
                  }, 800);
                },
              });
              return;
            }
          } else {
            // === CASE B: มีงานที่อื่น (Lost Map) ===
            // ห้าม Reset! ให้พาไปหาแทน
            setToastInfo({
              type: "lost_map",
              message: "ไม่พบกิจกรรมในบริเวณนี้ 🍃",
              actionLabel: "🚀 ไปหางานที่ใกล้ที่สุด", // เปลี่ยนปุ่มให้ชัดเจน
              onAction: () => {
                setToastInfo(null);

                const sourceForWarp =
                  allEventsWithLocation && allEventsWithLocation.length > 0
                    ? allEventsWithLocation
                    : eventsWithLocation;

                let targetLat = 13.7462;
                let targetLng = 100.5347;
                let msg = "กำลังเดินทาง... \nกลับไปโซนจัดงาน 🏙️";

                if (sourceForWarp && sourceForWarp.length > 0) {
                  const center = mapRef.current.getCenter();
                  const sorted = [...sourceForWarp]
                    .map((evt) => ({
                      ...evt,
                      dist: getDistanceFromLatLonInKm(
                        center.lat,
                        center.lng,
                        parseFloat(evt.lat),
                        parseFloat(evt.lng),
                      ),
                    }))
                    .sort((a, b) => a.dist - b.dist);

                  const target = sorted[0];
                  targetLat = parseFloat(target.lat);
                  targetLng = parseFloat(target.lng);
                  msg = `กำลังวาร์ปไป... \n${target.title.substring(0, 15)}... 🚀`;
                }

                setLoadingMessage(msg);
                setTimeout(() => {
                  if (mapRef.current) {
                    mapRef.current.flyTo([targetLat, targetLng], 13, {
                      duration: 1.5,
                    });
                  }
                  setLoadingMessage(null);
                }, 800);
              },
            });
          }
        }, 800);
      } else {
        setToastInfo((prev) => (prev?.type === "smart_near_me" ? prev : null));
      }
    }
    
  }, [
    mapBounds,
    mobileViewMode,
    filteredEvents,
    eventsWithLocation,
    loading,
    mapRef,
    timeframeFilter,
    categoryFilter,
    loadingMessage,
    allEventsWithLocation,
  ]);

  useEffect(() => {
    if (mobileViewMode === "map" && hoveredEventId && mapRef.current) {
      if (clickedMarkerIdRef.current === hoveredEventId) {
        return;
      }
      clickedMarkerIdRef.current = null;

      const targetEvent = eventsWithLocation.find(
        (e) => e.id === hoveredEventId,
      );
      if (targetEvent && targetEvent.lat && targetEvent.lng) {
        const map = mapRef.current;
        const targetLat = parseFloat(targetEvent.lat);
        const targetLng = parseFloat(targetEvent.lng);
        const currentCenter = map.getCenter();
        const distKm = getDistanceFromLatLonInKm(
          currentCenter.lat,
          currentCenter.lng,
          targetLat,
          targetLng,
        );
        if (distKm < 0.005) return;

        isProgrammaticMoveRef.current = true;
        const currentZoom = map.getZoom();
        const targetPoint = map.project([targetLat, targetLng], currentZoom);
        targetPoint.y += 100;
        const targetLatLngWithOffset = map.unproject(targetPoint, currentZoom);

        map.flyTo(targetLatLngWithOffset, currentZoom, {
          animate: true,
          duration: 0.8,
          easeLinearity: 0.25,
        });
      }
    }
  }, [hoveredEventId, mobileViewMode, mapRef]);

  return (
    <div className="w-full h-full relative bg-white overflow-hidden flex flex-col">
      {/* List View */}
      <div
        className={`flex flex-col h-full transition-all duration-300 ${mobileViewMode === "map" ? "hidden" : "flex"}`}
      >
        <div className="flex-1 overflow-y-auto pb-0">
          <div className="flex justify-between items-center mb-1 pt-6 px-4 bg-white z-30 relative">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/#events-section")}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              >
                <IconChevronLeft size={24} className="text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  กิจกรรมทั้งหมด
                </h1>
                {!loading && (
                  <p className="text-sm text-gray-500">
                    พบ {filteredEvents.length} อีเวนต์
                  </p>
                )}
              </div>
            </div>
            {isFilterActive && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-[#FF6B00] hover:text-[#e65000] bg-orange-50 px-3 py-1.5 rounded-full transition"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>

          <div className="sticky top-0 bg-white z-30 py-2 mb-1 border-b border-gray-100 px-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setActiveSheet("time")}
                  className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 transition active:scale-95 whitespace-nowrap ${timeframeFilter !== "all" ? "bg-[#FF6B00] text-white border-[#FF6B00]" : "bg-white border-gray-200 text-gray-700"}`}
                >
                  {getCurrentLabel(timeframeOptions, timeframeFilter)}
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </button>

                <button
                  onClick={() => setActiveSheet("sort")}
                  className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 transition active:scale-95 whitespace-nowrap bg-white border-gray-200 text-gray-700`}
                >
                  {getCurrentLabel(sortOptions, sortOrder)}
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categoryOptions.map((filter) => (
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

          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4">
            {loading ? (
              [...Array(6)].map((_, i) => <SkeletonEvent key={i} />)
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <EventCard
                        item={item}
                        onClick={() => navigate(`/event/${item.id}`)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center text-gray-400">
                    <div className="text-5xl mb-4">🗺️</div>
                    <p>
                      {searchOnMove
                        ? "ไม่พบกิจกรรมในบริเวณนี้"
                        : "ไม่พบกิจกรรม"}
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="mt-4 text-[#FF6B00] font-bold hover:underline"
                    >
                      ล้างตัวกรอง
                    </button>
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Float Map Button */}
      {mobileViewMode === "list" && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50]">
          <button
            onClick={() => setMobileViewMode("map")}
            className="flex items-center gap-2 bg-[#222] text-white px-6 py-3 rounded-full shadow-2xl font-bold transition transform hover:scale-105 active:scale-95 border border-white/20"
          >
            <IconMapPin size={18} /> แผนที่
          </button>
        </div>
      )}

      {/* --- MAP VIEW --- */}
      {mobileViewMode === "map" && (
        <div className="fixed inset-0 z-[5000] bg-white flex flex-col">
          <div className="bg-white shadow-sm z-[5010] flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <button
                onClick={() => setMobileViewMode("list")}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 hover:bg-gray-200 active:scale-95 transition"
              >
                <IconChevronLeft size={22} />
              </button>
              <h1 className="text-lg font-bold text-gray-900">
                สำรวจ Event ({visibleEventsCount})
              </h1>

              <button
                onClick={handleFullReset}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition flex items-center gap-1 ${
                  isFilterActive
                    ? "bg-orange-50 text-[#FF6B00] border border-orange-100 hover:bg-orange-100"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-transparent"
                }`}
              >
                <span className={isFilterActive ? "animate-spin-slow" : ""}>
                  🔄
                </span>
                <span>ล้างตัวกรอง</span>
              </button>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide bg-white/95 backdrop-blur-sm">
              <motion.div className="relative shrink-0">
                <button
                  onClick={() => setActiveSheet("time")}
                  className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 transition active:scale-95 whitespace-nowrap ${
                    timeframeFilter !== "all"
                      ? "bg-[#FF6B00] border-[#FF6B00] text-white shadow-md"
                      : "bg-gray-100 border-transparent text-gray-700"
                  }`}
                >
                  {getCurrentLabel(timeframeOptions, timeframeFilter)}
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </button>
              </motion.div>

              <motion.div className="relative shrink-0">
                <button
                  onClick={() => setActiveSheet("category")}
                  className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 transition active:scale-95 whitespace-nowrap ${
                    categoryFilter !== "ทั้งหมด"
                      ? "bg-[#FF6B00] border-[#FF6B00] text-white shadow-md"
                      : "bg-gray-100 border-transparent text-gray-700"
                  }`}
                >
                  {categoryFilter === "ทั้งหมด"
                    ? "🏷️ หมวดหมู่"
                    : categoryFilter}
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 1L5 5L9 1" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </div>

          <div className="relative flex-1 w-full h-full">
            <AnimatePresence>
              {loadingMessage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[5025] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white px-8 text-center"
                >
                  <div className="w-16 h-16 border-4 border-white/20 border-t-[#FF6B00] rounded-full animate-spin mb-6"></div>
                  <p className="text-2xl font-bold leading-relaxed whitespace-pre-line animate-pulse">
                    {loadingMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <MobileToast toastInfo={toastInfo} setToastInfo={setToastInfo} />

            <div className="absolute right-4 bottom-48 md:bottom-32 z-[5020] flex flex-col gap-3 items-end pointer-events-auto">
              <button
                onClick={handleSmartNearMe}
                disabled={isLocating || !!loadingMessage}
                className={`flex items-center gap-2 px-4 h-11 rounded-full bg-white shadow-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition ${isLocating || !!loadingMessage ? "opacity-70 cursor-wait" : ""}`}
              >
                {isLocating || !!loadingMessage ? (
                  <span className="animate-spin">...</span>
                ) : (
                  <IconTarget size={18} />
                )}
                <span>ใกล้ฉัน</span>
              </button>

              <button
                onClick={() => setMobileViewMode("list")}
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

      <BottomSheet
        isOpen={activeSheet === "time"}
        onClose={() => setActiveSheet(null)}
        title="เลือกช่วงเวลา 📅"
      >
        <div className="flex flex-col gap-2">
          {timeframeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTimeframeFilter(opt.value);
                setActiveSheet(null);
              }}
              className={`p-4 rounded-xl text-left font-bold transition flex justify-between items-center ${
                timeframeFilter === opt.value
                  ? "bg-orange-50 text-[#FF6B00] ring-1 ring-[#FF6B00]"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{opt.label}</span>
              {timeframeFilter === opt.value && <IconTarget size={18} />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === "sort"}
        onClose={() => setActiveSheet(null)}
        title="เรียงลำดับตาม ⚡"
      >
        <div className="flex flex-col gap-2">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setSortOrder(opt.value);
                setActiveSheet(null);
              }}
              className={`p-4 rounded-xl text-left font-bold transition flex justify-between items-center ${
                sortOrder === opt.value
                  ? "bg-orange-50 text-[#FF6B00] ring-1 ring-[#FF6B00]"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{opt.label}</span>
              {sortOrder === opt.value && <IconTarget size={18} />}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === "category"}
        onClose={() => setActiveSheet(null)}
        title="เลือกหมวดหมู่ 🏷️"
      >
        <div className="flex flex-col gap-2">
          {categoryOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategoryFilter(cat);
                setActiveSheet(null);
              }}
              className={`p-4 rounded-xl text-left font-bold transition flex justify-between items-center ${
                categoryFilter === cat
                  ? "bg-orange-50 text-[#FF6B00] ring-1 ring-[#FF6B00]"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{cat}</span>
              {categoryFilter === cat && <IconTarget size={18} />}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

export default MobileEventsView;
