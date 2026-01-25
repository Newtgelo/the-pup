import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import DesktopEventsView from "./DesktopEventsView";
import MobileEventsView from "./MobileEventsView";

// Helper check coordinate
const isValidCoordinate = (lat, lng) => {
  const validLat =
    typeof lat === "number" && isFinite(lat) && lat >= -90 && lat <= 90;
  const validLng =
    typeof lng === "number" && isFinite(lng) && lng >= -180 && lng <= 180;
  return validLat && validLng;
};

export const EventsPage = () => {
  const navigate = useNavigate();
  
  // State เช็คขนาดหน้าจอ
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [timeframeFilter, setTimeframeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("upcoming");

  // View States
  const [mobileViewMode, setMobileViewMode] = useState("list");
  const [showMapDesktop, setShowMapDesktop] = useState(false);
  const [hoveredEventId, setHoveredEventId] = useState(null);

  // Map States
  const [searchOnMove, setSearchOnMove] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const mapRef = useRef();

  // useEffect ดักจับการเปลี่ยนขนาดหน้าจอ
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      const d = new Date();
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .or(`end_date.gte.${today},and(end_date.is.null,date.gte.${today})`)
        .order("date", { ascending: true });

      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // ------------------------------------------------------------------
  // ✅ STEP 1: กรองเนื้อหา (Category, Time, Sort) -> ได้งานทั้งหมดทั่วประเทศ
  // ------------------------------------------------------------------
  const baseFilteredEvents = useMemo(() => {
    let result = [...events];

    // 1. Filter Category
    if (categoryFilter !== "ทั้งหมด") {
      result = result.filter((event) => event.category === categoryFilter);
    }

    // 2. Filter Time
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (timeframeFilter !== "all") {
      result = result.filter((e) => {
        if (!e.date) return false;

        const startDate = new Date(e.date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = e.end_date ? new Date(e.end_date) : new Date(startDate);
        endDate.setHours(0, 0, 0, 0);

        if (timeframeFilter === "today") {
          return startDate <= now && endDate >= now;
        }

        if (timeframeFilter === "this_month") {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          return startDate <= endOfMonth && endDate >= startOfMonth;
        }

        else if (timeframeFilter === "next_month") {
          let nextMonth = now.getMonth() + 1;
          let nextYear = now.getFullYear();
          if (nextMonth > 11) {
            nextMonth = 0;
            nextYear++;
          }

          const startOfNextMonth = new Date(nextYear, nextMonth, 1);
          const endOfNextMonth = new Date(nextYear, nextMonth + 1, 0);
          return startDate <= endOfNextMonth && endDate >= startOfNextMonth;
        }
        return true;
      });
    }

    // 3. Sort (ย้ายมาทำตรงนี้ เพื่อให้ allEventsWithLocation เรียงถูกต้องด้วย)
    if (sortOrder === "newest") result.sort((a, b) => b.id - a.id);
    else result.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

    return result;
  }, [categoryFilter, timeframeFilter, sortOrder, events]);

  // ------------------------------------------------------------------
  // ✅ STEP 2: กรองตามขอบจอ (Map Bounds) -> เอาไว้แสดงผล
  // ------------------------------------------------------------------
  const filteredEvents = useMemo(() => {
    let result = [...baseFilteredEvents];

    // Filter by Map Bounds (เฉพาะตอนเปิด SearchOnMove)
    if (
      searchOnMove &&
      mapBounds &&
      (showMapDesktop || mobileViewMode === "map")
    ) {
      result = result.filter((e) => {
        const lat = parseFloat(e.lat);
        const lng = parseFloat(e.lng);
        if (!isValidCoordinate(lat, lng)) return false;
        return mapBounds.contains([lat, lng]);
      });
    }

    return result;
  }, [baseFilteredEvents, searchOnMove, mapBounds, showMapDesktop, mobileViewMode]);


  // ------------------------------------------------------------------
  // ✅ STEP 3: เตรียมข้อมูลส่งให้ลูก (2 ชุด)
  // ------------------------------------------------------------------

  // ชุดที่ 1: เฉพาะในจอ (Visible) -> เอาไว้ปักหมุดและโชว์การ์ด
  const eventsWithLocation = useMemo(() => {
    return filteredEvents.filter((e) =>
      isValidCoordinate(parseFloat(e.lat), parseFloat(e.lng)),
    );
  }, [filteredEvents]);

  // ชุดที่ 2: ทั้งหมดทั่วประเทศ (All) -> เอาไว้ให้ปุ่มจรวดคำนวณหางานนอกจอ
  const allEventsWithLocation = useMemo(() => {
      return baseFilteredEvents.filter(e => isValidCoordinate(parseFloat(e.lat), parseFloat(e.lng)));
  }, [baseFilteredEvents]);

  // Actions
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      alert("Browser ไม่รองรับ");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapRef.current;
        if (map) {
          if (!showMapDesktop) setShowMapDesktop(true);
          setTimeout(
            () => {
              try {
                map.setView([latitude, longitude], 14);
              } catch (e) {}
            },
            showMapDesktop ? 0 : 300,
          );
        }
        setTimeframeFilter("today");
        setMobileViewMode("map");
        setIsLocating(false);
      },
      (error) => {
        alert("กรุณาเปิด GPS");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  };

  const handleClearFilters = () => {
    setCategoryFilter("ทั้งหมด");
    setTimeframeFilter("all");
    setSearchOnMove(false);
  };

  const onMarkerClick = (id) => navigate(`/event/${id}`);

  const sharedProps = {
    events,
    loading,
    filteredEvents,
    categoryFilter,
    setCategoryFilter,
    timeframeFilter,
    setTimeframeFilter,
    sortOrder,
    setSortOrder,
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
    onMarkerClick,
    eventsWithLocation,
    // ✅ ส่งตัวนี้เพิ่มไปด้วยครับ
    allEventsWithLocation 
  };

  return (
    <>
        {/* 📱 Mobile View */}
        {!isDesktop && (
            <div className="lg:hidden fixed inset-0 w-full h-full z-0 bg-white overflow-hidden">
                <MobileEventsView 
                    {...sharedProps} 
                    mobileViewMode={mobileViewMode} 
                    setMobileViewMode={setMobileViewMode} 
                />
            </div>
        )}

        {/* 💻 Desktop View */}
        {isDesktop && (
            <div className="hidden lg:block w-full h-[calc(100vh-80px)] overflow-hidden">
                <DesktopEventsView 
                    {...sharedProps} 
                    showMapDesktop={showMapDesktop} 
                    setShowMapDesktop={setShowMapDesktop} 
                    mobileViewMode={mobileViewMode}
                />
            </div>
        )}
    </>
  );
};