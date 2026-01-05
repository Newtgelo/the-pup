import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapStyles.css';

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

    const icon = L.divIcon({
        // ✅ 1. เพิ่ม Class นี้ เพื่อให้ CSS :hover ทำงานกับกล่อง Leaflet ได้โดยตรง
        className: 'custom-pill-icon', 
        html: html,
        iconSize: [null, null],
        iconAnchor: [0, 0] 
    });

    pillIconCache[event.id] = icon;
    return icon;
};

// --- Sub-Components (เหมือนเดิม) ---
const MapResizer = ({ showMapDesktop, mobileViewMode }) => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 300);
    }, [showMapDesktop, mobileViewMode, map]);
    return null;
};

const MapBoundsReporter = ({ setMapBounds }) => {
    const map = useMapEvents({
        moveend: () => { if (map) setMapBounds(map.getBounds()); },
    });
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
    events, 
    hoveredEventId, 
    setHoveredEventId, 
    onMarkerClick, mapRef, setMapBounds, searchOnMove, showMapDesktop, mobileViewMode 
}) => {
    
    const [selectedEvent, setSelectedEvent] = useState(null);

    // ✅ THE SNIPER EFFECT V2: ดัน Z-Index ทะลุจักรวาล
    useEffect(() => {
        // 1. ล้างค่าเก่า: หาตัวที่เคยถูกดัน Z-Index แล้วเอาออก
        const allMarkers = document.querySelectorAll('.custom-pill-icon');
        allMarkers.forEach(el => {
            el.style.zIndex = ''; // Reset ให้ Leaflet คำนวณเองเหมือนเดิม
            el.classList.remove('force-hover-style'); // ลบ Class effect (ขยายใหญ่)
        });

        // 2. ถ้ามี ID ใหม่ส่งมา
        if (hoveredEventId) {
            // หา element ลูกก่อน (ตัวเม็ดยา)
            const innerMarker = document.getElementById(`marker-${hoveredEventId}`);
            
            if (innerMarker) {
                // 🔥 ทีเด็ด: ไต่ขึ้นไปหาพ่อ (กล่อง Leaflet) แล้วสั่ง Z-Index ใส่พ่อเลย
                const parentMarker = innerMarker.closest('.leaflet-marker-icon');
                
                if (parentMarker) {
                    parentMarker.style.zIndex = '99999'; // บังคับอยู่หน้าสุด
                    parentMarker.classList.add('force-hover-style'); // เพิ่ม Class ให้ CSS สั่งขยาย
                    
                    // สั่งลูกให้ขยายด้วย (ผ่านการเติม class force-hover เดิม)
                    innerMarker.classList.add('force-hover');
                }
            }
        } else {
             // เคลียร์ state force-hover ของลูกเมื่อไม่มีการ hover
             const prevHoveredInner = document.querySelectorAll('.force-hover');
             prevHoveredInner.forEach(el => el.classList.remove('force-hover'));
        }
    }, [hoveredEventId]);

    // Reset Popup
    useEffect(() => { setSelectedEvent(null); }, [mobileViewMode]);
    useEffect(() => {
        if (selectedEvent) {
            const stillExists = events.find(e => e.id === selectedEvent.id);
            if (!stillExists) setSelectedEvent(null);
        }
    }, [events]); 

    // Markers
    const markers = useMemo(() => {
        return events.map((event) => (
            <Marker 
                key={event.id}
                position={[parseFloat(event.lat), parseFloat(event.lng)]}
                icon={getPillIcon(event)}
                eventHandlers={{ 
                    click: () => {
                         if (mobileViewMode === 'map') onMarkerClick(event.id);
                         else {
                            setSelectedEvent(event);
                            if (setHoveredEventId) setHoveredEventId(event.id);
                         }
                    },
                    mouseover: () => {
                        if (setHoveredEventId) setHoveredEventId(event.id);
                    },
                    mouseout: () => {
                        if (setHoveredEventId) setHoveredEventId(null);
                    }
                }}
            />
        ));
    }, [events, mobileViewMode]);

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
            
            {/* Inject CSS เพิ่มเติมเพื่อให้ force-hover-style ทำงาน */}
            <style jsx global>{`
                /* สั่งให้กล่อง Leaflet ที่ถูกเลือก ขยายใหญ่ขึ้น */
                .custom-pill-icon.force-hover-style .pill-marker {
                    transform: scale(1.15);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
                    z-index: 99999 !important;
                }
            `}</style>

            {markers}

            {selectedEvent && (
                <Popup 
                    position={[parseFloat(selectedEvent.lat), parseFloat(selectedEvent.lng)]}
                    onClose={() => {
                        setSelectedEvent(null);
                        if (setHoveredEventId) setHoveredEventId(null);
                    }}
                    autoPan={true} autoPanPadding={[50, 90]} offset={[0, -20]} closeButton={true}
                >
                    <div className="w-64 p-0 overflow-hidden rounded-lg">
                        <div className="aspect-video relative bg-gray-100">
                            <img src={selectedEvent.image_url} alt={selectedEvent.title} className="w-full h-full object-cover"/>
                            <span 
                                className="absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold shadow-md" 
                                style={{ backgroundColor: categoryColors[selectedEvent.category] || "#FF6B00", color: '#FFFFFF' }}
                            >
                                {selectedEvent.category}
                            </span>
                        </div>
                        <div className="p-3">
                            <h3 className="font-bold text-sm text-gray-900 leading-snug mb-2 line-clamp-2">{selectedEvent.title}</h3>
                            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">📅 {selectedEvent.date_display || new Date(selectedEvent.date).toLocaleDateString('th-TH')}</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => window.open(`/event/${selectedEvent.id}`, '_blank')}
                                    className="flex-1 bg-[#FF6B00] text-xs py-2 rounded-lg font-bold hover:bg-[#e65000] transition shadow-sm text-center text-white"
                                    style={{ color: '#FFFFFF' }}
                                >ดูรายละเอียด</button>
                                <a 
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEvent.lat},${selectedEvent.lng}`} 
                                    target="_blank" rel="noopener noreferrer" 
                                    className="flex items-center justify-center w-9 h-9 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 hover:bg-blue-100 transition"
                                ><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg></a>
                            </div>
                        </div>
                    </div>
                </Popup>
            )}
        </MapContainer>
    );
};
export default EventsMap;