import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import DesktopEventsView from "./DesktopEventsView";
import MobileEventsView from "./MobileEventsView";

// Helper check coordinate
const isValidCoordinate = (lat, lng) => {
    const validLat = typeof lat === 'number' && isFinite(lat) && lat >= -90 && lat <= 90;
    const validLng = typeof lng === 'number' && isFinite(lng) && lng >= -180 && lng <= 180;
    return validLat && validLng;
};

export const EventsPage = () => {
  const navigate = useNavigate();
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

  // ✅ Fetch Data: แก้ Logic ดึงข้อมูลให้รองรับงานที่เริ่มไปแล้วแต่ยังไม่จบ
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);

      // สร้างวันที่ปัจจุบัน (YYYY-MM-DD)
      const d = new Date();
      // ปรับเวลาเล็กน้อยเผื่อเรื่อง Timezone หรือกรณีเลยเที่ยงคืนมานิดหน่อย (optional)
      const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        // 👇 แก้ตรงนี้: เช็คว่า (จบหลังวันนี้) หรือ (ไม่มีวันจบ แต่เริ่มหลังวันนี้)
        .or(`end_date.gte.${today},and(end_date.is.null,date.gte.${today})`)
        .order("date", { ascending: true });

      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  // Filter Logic
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // 1. Filter Category
    if (categoryFilter !== "ทั้งหมด") {
      result = result.filter((event) => event.category === categoryFilter);
    }
    
    // 2. Filter Time (ปรับปรุงให้รองรับ Multi-day Event)
    const now = new Date();
    // set เวลาเป็น 00:00:00 เพื่อเทียบแค่วันที่
    now.setHours(0,0,0,0); 

    if (timeframeFilter !== "all") {
      result = result.filter((e) => {
        if (!e.date) return false;
        
        const startDate = new Date(e.date);
        startDate.setHours(0,0,0,0);

        // ถ้ามี end_date ให้ใช้, ถ้าไม่มีให้ถือว่าเป็นวันเดียวกับ start_date
        const endDate = e.end_date ? new Date(e.end_date) : new Date(startDate);
        endDate.setHours(0,0,0,0);

        // กรอง "วันนี้" : งานต้องครอบคลุมวันนี้ (เริ่ม <= วันนี้ <= จบ)
        if (timeframeFilter === "today") {
            return startDate <= now && endDate >= now;
        }

        // กรอง "เดือนนี้" : งานต้องมีส่วนใดส่วนหนึ่งอยู่ในเดือนนี้
        if (timeframeFilter === "this_month") {
             const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
             const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
             return startDate <= endOfMonth && endDate >= startOfMonth;
        }
        
        // กรอง "เดือนหน้า"
        else if (timeframeFilter === "next_month") {
          let nextMonth = now.getMonth() + 1;
          let nextYear = now.getFullYear();
          if (nextMonth > 11) { nextMonth = 0; nextYear++; }
          
          const startOfNextMonth = new Date(nextYear, nextMonth, 1);
          const endOfNextMonth = new Date(nextYear, nextMonth + 1, 0);
          return startDate <= endOfNextMonth && endDate >= startOfNextMonth;
        }
        return true;
      });
    }

    // 3. Filter by Map Bounds
    if (searchOnMove && mapBounds && (showMapDesktop || mobileViewMode === 'map')) {
        result = result.filter((e) => {
            const lat = parseFloat(e.lat);
            const lng = parseFloat(e.lng);
            if (!isValidCoordinate(lat, lng)) return false;
            return mapBounds.contains([lat, lng]);
        });
    }

    // 4. Sort
    if (sortOrder === "newest") result.sort((a, b) => b.id - a.id);
    else result.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    
    return result;
  }, [categoryFilter, timeframeFilter, sortOrder, events, searchOnMove, mapBounds, showMapDesktop, mobileViewMode]);

  const eventsWithLocation = useMemo(() => {
      return filteredEvents.filter(e => isValidCoordinate(parseFloat(e.lat), parseFloat(e.lng)));
  }, [filteredEvents]);

  // Actions
  const handleNearMe = () => {
    if (!navigator.geolocation) { alert("Browser ไม่รองรับ"); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const map = mapRef.current;
            if (map) {
                if (!showMapDesktop) setShowMapDesktop(true);
                setTimeout(() => {
                    try { map.setView([latitude, longitude], 14); } catch(e){}
                }, showMapDesktop ? 0 : 300);
            }
            setTimeframeFilter("today");
            setMobileViewMode("map");
            setIsLocating(false);
        },
        (error) => { alert("กรุณาเปิด GPS"); setIsLocating(false); },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const handleClearFilters = () => {
    setCategoryFilter("ทั้งหมด");
    setTimeframeFilter("all");
    setSearchOnMove(false);
  };

  const onMarkerClick = (id) => navigate(`/event/${id}`);

  // Props Pack
  const sharedProps = {
      events, loading, filteredEvents,
      categoryFilter, setCategoryFilter,
      timeframeFilter, setTimeframeFilter,
      sortOrder, setSortOrder,
      hoveredEventId, setHoveredEventId,
      searchOnMove, setSearchOnMove,
      mapBounds, setMapBounds,
      mapRef, handleNearMe, isLocating,
      handleClearFilters, navigate, onMarkerClick,
      eventsWithLocation
  };

  return (
    // ✅ แก้ไข: มือถือให้สูงเต็มจอ (h-[100dvh]) / จอใหญ่ให้ลบ Navbar (h-[calc(100vh-80px)])
    <div className="w-full lg:h-[calc(100vh-80px)] h-[100dvh] overflow-hidden">
        
        {/* Mobile View */}
        <div className="lg:hidden h-full">
            <MobileEventsView 
                {...sharedProps} 
                mobileViewMode={mobileViewMode} 
                setMobileViewMode={setMobileViewMode} 
            />
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block h-full">
            <DesktopEventsView 
                {...sharedProps} 
                showMapDesktop={showMapDesktop} 
                setShowMapDesktop={setShowMapDesktop} 
                mobileViewMode={mobileViewMode}
            />
        </div>
    </div>
);
};