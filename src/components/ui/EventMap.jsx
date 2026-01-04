import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🔧 แก้บั๊กไอคอนหมุด (Marker) ไม่ขึ้นใน React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

const EventMap = ({ lat, lng, locationName }) => {
  // ถ้าไม่มีพิกัด ไม่ต้องโชว์แผนที่
  if (!lat || !lng) return null;

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 relative z-0">
      <MapContainer 
        center={[lat, lng]} 
        zoom={15} 
        scrollWheelZoom={false} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]}>
          <Popup>
            <span className="font-bold text-[#FF6B00]">{locationName}</span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default EventMap;