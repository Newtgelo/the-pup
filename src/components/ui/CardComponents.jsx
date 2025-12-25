import React from "react";
import { SafeImage } from "./UIComponents";
import { IconClock, IconCalendar, IconMapPin } from "../icons/Icons";

// ==========================================
// 1. การ์ดข่าว (News Card)
// ==========================================
export const NewsCard = ({ item, onClick, className = "" }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl overflow-hidden cursor-pointer flex flex-col group/news ${className}`}
  >
    {/* Image Section */}
    <div className="aspect-[4/3] md:aspect-square bg-gray-100 relative overflow-hidden rounded-xl">
      <SafeImage
        src={item.image_url || item.image}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover/news:scale-110"
      />

      {/* Category Badge */}
      <div className="absolute top-3 left-3">
        <span className="bg-[#FF69B4] text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
          {item.category}
        </span>
      </div>
    </div>

    {/* Content Section */}
    <div className="p-4 flex flex-col flex-1">
      <h3 className="text-gray-900 font-bold text-lg leading-tight line-clamp-2 mb-2 group-hover/news:text-[#FF6B00] transition">
        {item.title}
      </h3>

      <div className="mt-auto flex items-center gap-1 text-xs text-gray-400">
        <IconClock size={12} />
        <span>{item.date}</span>
      </div>
    </div>
  </div>
);

// ==========================================
// 2. การ์ดอีเวนต์ (Event Card)
// 🔥 แก้ไข: รองรับ date_display และ location_name จาก Supabase
// ==========================================

export const EventCard = ({
  item,
  onClick,
  showNewBadge = false,
  className = "",
}) => {
  // 🔥 ฟังก์ชันแปลงวันที่ให้เป็นไทย (เพิ่มมาใหม่ แต่ไม่กระทบ UI)
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col h-full cursor-pointer group/event ${className}`}
    >
      {/* Image Container (Cinematic Look) - คงเดิม 100% */}
      <div className="relative aspect-[3/4] bg-gray-900 overflow-hidden">
        {/* Layer 1: ฉากหลังเบลอ */}
        <div
          className="absolute inset-0 bg-center bg-cover blur-xl opacity-50 scale-110 transition-transform duration-500 group-hover/event:scale-125"
          style={{ backgroundImage: `url(${item.image_url || item.image})` }}
        ></div>

        {/* Layer 2: รูปหลัก */}
        <SafeImage
          src={item.image_url || item.image || item.cover}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-contain z-10 p-2 transition-transform duration-500 group-hover/event:scale-110"
        />

        {/* New Badge */}
        {showNewBadge && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-20">
            NEW
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 leading-tight group-hover/event:text-[#FF6B00] transition line-clamp-2">
          {item.title}
        </h3>

        <div className="space-y-1 md:space-y-2 mt-2 text-xs md:text-sm text-gray-600 flex-1">
          {/* 📅 วันที่ (แก้ logic ให้ใช้วันที่ไทย) */}
          <div className="flex items-start gap-1.5 text-[#E11D48] font-semibold">
            <IconCalendar
              size={12}
              className="mt-0.5 flex-shrink-0 md:w-[14px] md:h-[14px]"
            />
            {/* ถ้ามี date_display ให้โชว์อันนั้นก่อน ถ้าไม่มีค่อยไปใช้ formatDate */}
            <span>
              {item.date_display || formatDate(item.date) || "ไม่ระบุวันที่"}
            </span>
          </div>

          {/* 📍 สถานที่ (แก้ logic ให้ดึง item.location ด้วย) */}
          <p className="flex items-start gap-1.5 line-clamp-1">
            <IconMapPin
              size={12}
              className="mt-0.5 flex-shrink-0 md:w-[14px] md:h-[14px]"
            />{" "}
            {/* 🔥 ดึง location (ชื่อใหม่) ก่อน location_name */}
            {item.location || item.location_name || "ไม่ระบุสถานที่"}
          </p>
        </div>

        <div className="mt-3 pt-2 border-t">
          <span
            className={`text-[10px] px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600`}
          >
            {/* 🔥 ดึง category (ชื่อใหม่) ก่อน type */}
            {item.category || item.type || "Event"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. การ์ดคาเฟ่ (Cafe Card)
// ==========================================
export const CafeCard = ({ item, onClick, className = "" }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition group/cafe cursor-pointer ${className}`}
  >
    <div className="h-32 md:h-48 overflow-hidden bg-gray-100">
      <SafeImage
        // ถ้า item.images เป็น Array ให้เอาตัวที่ 0, ถ้าไม่ใช่ให้ใช้ค่าเดิม
        src={
          (Array.isArray(item.images) ? item.images[0] : item.image_url) ||
          item.image
        }
        alt={item.name}
        className="w-full h-full object-cover group-hover/cafe:scale-105 transition duration-500"
      />
    </div>
    <div className="p-3 md:p-4">
      <h3 className="font-bold text-sm md:text-lg text-gray-900 group-hover/cafe:text-[#FF6B00] transition line-clamp-1">
        {item.name}
      </h3>
      <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2 h-8 md:h-10">
        {item.description}
      </p>
      <div className="mt-2 md:mt-4 flex items-center gap-1 text-[10px] md:text-xs text-gray-400">
        {/* รองรับ location_text ด้วย */}
        <IconMapPin size={12} />{" "}
        {(item.location_text || item.location || "").split(",")[0]}
      </div>
    </div>
  </div>
);
