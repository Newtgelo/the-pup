import React from "react";
import { Link } from "react-router-dom";
import { SafeImage } from "./UIComponents";
import { IconClock, IconCalendar, IconMapPin } from "../icons/Icons";

// ==========================================
// 1. การ์ดข่าว (News Card)
// ✅ คง Hover Effect ไว้
// ==========================================
export const NewsCard = ({ item, className = "" }) => {
  
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}-${month}-${year}`;
    }
    return dateString;
  };

  return (
    <Link
      to={`/news/${item.id}`}
      state={{ fromHome: true }}
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md cursor-pointer flex flex-col group/news h-full ${className}`}
    >
      {/* Image Section */}
      <div className="aspect-square md:aspect-square bg-gray-100 relative overflow-hidden">
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

      <div className="p-3 md:p-4 flex flex-col flex-1">
        <h3 className="text-gray-900 font-bold text-sm md:text-lg leading-tight line-clamp-2 mb-2 group-hover/news:text-[#FF6B00] transition">
          {item.title}
        </h3>

        <div className="mt-auto flex items-center gap-1 text-xs text-gray-400">
          <IconClock size={12} />
          <span>{formatDate(item.date)}</span>
        </div>
      </div>
    </Link>
  );
};


// ==========================================
// 2. การ์ดอีเวนต์ (Event Card)
// ✅ Dark Glass Category (Top-Left)
// ==========================================
export const EventCard = ({
  item,
  showNewBadge = false,
  className = "",
}) => {
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
    <Link
      to={`/event/${item.id}`}
      state={{ fromHome: true }}
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col h-full cursor-pointer ${className}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden">
        <SafeImage
          src={item.image_url || item.image || item.cover}
          alt={item.title}
          className="w-full h-full object-cover object-top"
        />

        {/* ✅ Type A: Dark Glass Badge (มุมซ้ายบน) */}
        <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 shadow-sm flex items-center justify-center">
          <span className="text-[10px] font-bold text-white uppercase tracking-wide leading-none">
            {item.category || item.type || "EVENT"}
          </span>
        </div>

        {/* New Badge (มุมขวาบน - ถ้ามี) */}
        {showNewBadge && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-20">
            NEW
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 leading-tight line-clamp-2">
          {item.title}
        </h3>

        <div className="space-y-1 md:space-y-2 mt-2 text-xs md:text-sm text-gray-600 flex-1">
          <div className="flex items-start gap-1.5 text-[#E11D48] font-semibold">
            <IconCalendar
              size={12}
              className="mt-0.5 flex-shrink-0 md:w-[14px] md:h-[14px]"
            />
            <span>
              {item.date_display || formatDate(item.date) || "ไม่ระบุวันที่"}
            </span>
          </div>

          <p className="flex items-start gap-1.5 line-clamp-1">
            <IconMapPin
              size={12}
              className="mt-0.5 flex-shrink-0 md:w-[14px] md:h-[14px]"
            />{" "}
            {item.location || item.location_name || "ไม่ระบุสถานที่"}
          </p>
        </div>

        {/* ❌ ลบ Category ด้านล่างออกแล้ว (ย้ายไปข้างบน) */}
      </div>
    </Link>
  );
};

// ==========================================
// 3. การ์ดคาเฟ่ (Cafe Card)
// ✅ คง Hover Effect ไว้
// ==========================================
export const CafeCard = ({ item, className = "" }) => {
  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const truncate = (str, length = 100) => {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.substring(0, length) + "...";
  };

  const plainDescription = stripHtml(item.description);

  return (
    <Link
      to={`/cafe/${item.id}`}
      state={{ fromHome: true }}
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition group/cafe cursor-pointer flex flex-col h-full ${className}`}
    >
      <div className="h-32 md:h-48 overflow-hidden bg-gray-100">
        <SafeImage
          src={
            (Array.isArray(item.images) ? item.images[0] : item.image_url) ||
            item.image
          }
          alt={item.name}
          className="w-full h-full object-cover group-hover/cafe:scale-105 transition duration-500"
        />
      </div>
      <div className="p-3 md:p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm md:text-lg text-gray-900 group-hover/cafe:text-[#FF6B00] transition line-clamp-1">
          {item.name}
        </h3>
        <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2 h-8 md:h-10">
          {truncate(plainDescription, 100)}
        </p>
        <div className="mt-auto pt-2 md:pt-4 flex items-center gap-1 text-[10px] md:text-xs text-gray-400">
          <IconMapPin size={12} />{" "}
          {(item.location_text || item.location || "").split(",")[0]}
        </div>
      </div>
    </Link>
  );
};