import React from 'react';
import { SafeImage } from './UIComponents';
import { IconClock, IconCalendar, IconMapPin } from '../icons/Icons';

// 1. การ์ดข่าว (News Card)
export const NewsCard = ({ item, onClick, className = "" }) => (
  <div 
    onClick={onClick} 
    className={`bg-white rounded-xl overflow-hidden cursor-pointer flex flex-col group/news ${className}`}
  >
    {/* Image Section with Overlay Text */}
    <div className="aspect-[4/3] md:aspect-square bg-gray-100 relative overflow-hidden rounded-xl">
        <SafeImage 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover/news:scale-110"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
            <span className="bg-[#FF69B4] text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider">
                {item.category}
            </span>
        </div>

        {/* Text Overlay (อยู่บนภาพเสมอ) */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{item.title}</h3>
            <div className="text-gray-300 text-xs mt-1 flex items-center gap-1">
                <IconClock size={12} color="white"/> {item.date}
            </div>
        </div>
    </div>

    {/* 🔥 ลบ div ที่เคยอยู่ตรงนี้ออกไปแล้วครับ (ที่เป็น p-3 md:hidden) */}
    
  </div>
);

// ... (EventCard และ CafeCard ปล่อยไว้เหมือนเดิม)
export const EventCard = ({ item, onClick, showNewBadge = false, className = "" }) => (
  <div 
    onClick={onClick} 
    className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition flex flex-col h-full cursor-pointer group/event ${className}`}
  >
    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <SafeImage 
            src={item.image} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover/event:scale-110" 
        />
        {showNewBadge && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">NEW</div>
        )}
    </div>
    <div className="p-3 md:p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 leading-tight group-hover/event:text-[#FF6B00] transition line-clamp-2">
            {item.title}
        </h3>
        <div className="space-y-1 md:space-y-2 mt-2 text-xs md:text-sm text-gray-600 flex-1">
            <div className="flex items-start gap-1.5 text-[#E11D48] font-semibold">
                <IconCalendar size={12} className="mt-0.5 flex-shrink-0 md:w-[14px] md:h-[14px]"/>
                <div>
                    {item.schedules && item.schedules.length > 0 ? item.schedules.map((s, i) => (
                        <div key={i} className="mb-0.5 last:mb-0 whitespace-nowrap">
                            {(s.date || '').split(' ').length > 1 ? `${(s.date || '').split(' ')[0]} ${(s.date || '').split(' ')[1]}` : s.date}
                        </div>
                    )) : <span>{item.date}</span>}
                </div>
            </div>
            <p className="flex items-start gap-1.5 line-clamp-1">
                <IconMapPin size={12} className="mt-0.5 flex-shrink-0 md:w-[14px] md:h-[14px]"/> {item.location}
            </p>
        </div>
        <div className="mt-3 pt-2 border-t">
            <span className={`text-[10px] px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600`}>
                {item.type}
            </span>
        </div>
    </div>
  </div>
);

export const CafeCard = ({ item, onClick, className = "" }) => (
  <div 
    onClick={onClick} 
    className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition group/cafe cursor-pointer ${className}`}
  >
    <div className="h-32 md:h-48 overflow-hidden bg-gray-100">
        <SafeImage 
            src={item.image} 
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
            <IconMapPin size={12}/> {(item.location || "").split(',')[0]}
        </div>
    </div>
  </div>
);