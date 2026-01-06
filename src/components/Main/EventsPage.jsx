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

// ✅ ต้องมีบรรทัดนี้ครับ! export const EventsPage
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

  // Fetch Data
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const fetchEvents = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .gte("date", today)
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
    
    // 2. Filter Time
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (timeframeFilter !== "all") {
      result = result.filter((e) => {
        if (!e.date) return false;
        if (timeframeFilter === "today") return e.date === todayStr;
        const eventDate = new Date(e.date);
        if (timeframeFilter === "this_month")
          return (eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear());
        else if (timeframeFilter === "next_month") {
          let nextMonth = now.getMonth() + 1;
          let nextYear = now.getFullYear();
          if (nextMonth > 11) { nextMonth = 0; nextYear++; }
          return (eventDate.getMonth() === nextMonth && eventDate.getFullYear() === nextYear);
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
    <div className="w-full h-[calc(100dvh-80px)] overflow-hidden">
        <div className="lg:hidden h-full">
            <MobileEventsView 
                {...sharedProps} 
                mobileViewMode={mobileViewMode} 
                setMobileViewMode={setMobileViewMode} 
            />
        </div>
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