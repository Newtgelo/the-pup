import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapStyles.css';

// --- Helper & Icon Cache (เหมือนเดิม) ---
const categoryColors = {
    "Concert": "#FF6B00", "Fan Meeting": "#E91E63", "Fansign": "#9C27B0",
    "Workshop": "#2196F3", "Exhibition": "#00BCD4", "Fan Event": "#4CAF50",
    "Pop-up Store": "#3F51B5", "Others": "#607D8B"
};

const pillIconCache = {};
const getPillIcon = (event) => {
    if (pillIconCache[event.id]) return pillIconCache[event.id];
    const color = categoryColors[event.category] || "#FF6B00";
    const html = `
        <div id="marker-${event.id}" class="pill-marker-container">
            <div class="pill-marker" style="--marker-color: ${color};">
                <div class="pill-image-wrapper">
                    <img src="${event.image_url}" class="pill-image" onerror="this.style.display='none'"/>
                </div>
                <span class="pill-text">${event.title}</span>
            </div>
        </div>
    `;
    const icon = L.divIcon({ className: 'custom-pill-icon', html, iconSize: [null, null], iconAnchor: [0, 0] });
    pillIconCache[event.id] = icon;
    return icon;
};

// --- Sub-Components (เหมือนเดิม) ---
const MapResizer = ({ showMapDesktop, mobileViewMode }) => {
    const map = useMap();
    useEffect(() => { setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 300); }, [showMapDesktop, mobileViewMode, map]);
    return null;
};
const MapBoundsReporter = ({ setMapBounds }) => {
    const map = useMapEvents({ moveend: () => { if (map) setMapBounds(map.getBounds()); }, });
    return null;
};
const MapAutoFit = ({ markers, searchOnMove }) => {
    const map = useMap();
    const prevMarkersRef = useRef("");
    useEffect(() => {
        if (searchOnMove) return;
        const currentMarkersKey = markers.map(m => m.id).sort().join(',');
        if (prevMarkersRef.current === currentMarkersKey) return;
        prevMarkersRef.current = currentMarkersKey;
        if (markers.length > 0) {
            const lats = markers.map(e => parseFloat(e.lat));
            const valid = lats.filter(l => !isNaN(l));
            if (valid.length > 0) {
                const bounds = markers.map(e => [parseFloat(e.lat), parseFloat(e.lng)]);
                try { map.fitBounds(bounds, { padding: [50, 50] }); } catch (e) {}
            }
        }
    }, [markers, map, searchOnMove]);
    return null;
};

// --- Main Map Component ---
const EventsMap = ({ 
    events, hoveredEventId, setHoveredEventId, 
    onMarkerClick, // ✅ รับฟังก์ชันคลิกมาจาก Parent
    mapRef, setMapBounds, searchOnMove, showMapDesktop, mobileViewMode 
}) => {
    
    // 🔥 REF GUARD: กัน Loop เหมือนเดิม
    const activeHoverRef = useRef(null);
    useEffect(() => { activeHoverRef.current = hoveredEventId; }, [hoveredEventId]);

    // 🎯 SNIPER MODE: ยิง Class (Z-Index)
    useEffect(() => {
        document.querySelectorAll('.custom-pill-icon').forEach(el => {
            el.classList.remove('force-hover-style'); el.style.zIndex = '';
        });
        if (hoveredEventId) {
            const inner = document.getElementById(`marker-${hoveredEventId}`);
            if (inner) {
                const parent = inner.closest('.leaflet-marker-icon');
                if (parent) { parent.classList.add('force-hover-style'); parent.style.zIndex = '99999'; }
            }
        }
    }, [hoveredEventId]);

    // ✅ MARKERS: เหลือแค่นี้! (ไม่มี Popup แล้ว)
    const markers = useMemo(() => {
        return events.map((event) => (
            <Marker 
                key={event.id}
                position={[parseFloat(event.lat), parseFloat(event.lng)]}
                icon={getPillIcon(event)}
                eventHandlers={{ 
                    // 🔥 CLICK: ส่ง ID กลับไปให้ DesktopEventsView จัดการ Card เอง
                    click: () => onMarkerClick(event.id),
                    mouseover: () => {
                        if (activeHoverRef.current === event.id) return;
                        activeHoverRef.current = event.id;
                        if (setHoveredEventId) setHoveredEventId(event.id);
                    },
                    mouseout: () => {
                        if (activeHoverRef.current === event.id) {
                            activeHoverRef.current = null;
                            if (setHoveredEventId) setHoveredEventId(null);
                        }
                    }
                }}
            />
        ));
    }, [events, mobileViewMode, onMarkerClick]); 

    return (
        <MapContainer 
            center={[13.7563, 100.5018]} zoom={11} scrollWheelZoom={true} 
            className="w-full h-full z-0" ref={mapRef} zoomControl={false}
        >
            <TileLayer attribution='© CARTO' url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <ZoomControl position="topright" />
            <MapResizer showMapDesktop={showMapDesktop} mobileViewMode={mobileViewMode} />
            <MapBoundsReporter setMapBounds={setMapBounds} />
            <MapAutoFit markers={events} searchOnMove={searchOnMove} />
            {markers}
            {/* ❌ ไม่มี <Popup> แล้ว! ปลอดภัย 100% */}
        </MapContainer>
    );
};
export default EventsMap;