import React, { useState, useEffect, useRef } from 'react';
import { 
    IconChevronRight, IconChevronLeft, IconInbox, IconCheck, IconLogo 
} from '../icons/Icons'; 

// ==========================================
// 1. BREADCRUMBS (เก็บไว้เผื่อใช้)
// ==========================================
export const Breadcrumbs = ({ items }) => (
  <nav className="flex items-center text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <span className="mx-2 text-gray-400"><IconChevronRight size={14} /></span>}
        {item.onClick ? (
          <button 
            onClick={item.onClick}
            className="hover:text-[#FF6B00] transition-colors hover:underline underline-offset-4"
          >
            {item.label}
          </button>
        ) : (
          <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-md">
            {item.label}
          </span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

// ==========================================
// 2. EMPTY STATE
// ==========================================
export const EmptyState = ({ title, subtitle, onReset }) => (
  <div className="col-span-full w-full py-12 text-center flex flex-col justify-center items-center gap-4 animate-in fade-in zoom-in duration-300 bg-gray-50 rounded-xl border border-dashed border-gray-200">
    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 shadow-sm">
      <IconInbox size={32} />
    </div>
    <div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
    {onReset && (
      <button 
        onClick={onReset}
        className="mt-1 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:border-[#FF6B00] hover:text-[#FF6B00] transition shadow-sm active:scale-95"
      >
         ล้างค่าการค้นหา
      </button>
    )}
  </div>
);

// ==========================================
// 3. TOAST NOTIFICATION
// ==========================================
export const Toast = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 w-max max-w-[90vw]">
      <div className="bg-green-500 rounded-full p-1"><IconCheck size={12} color="white" /></div>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// ==========================================
// 4. SAFE IMAGE (โหลดรูปไม่ติด มี Logo แทน)
// ==========================================
export const SafeImage = ({ src, alt, className }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-300 ${className}`}>
        <div className="text-center flex flex-col items-center">
           <IconLogo size={40} color="#D1D5DB" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

// ==========================================
// 5. SCROLLABLE ROW (🔥 แก้ไขตรงนี้ครับ)
// ==========================================


export const ScrollableRow = ({ children, className = "" }) => {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  // 🔥 แก้ตรงนี้ครับ: เพิ่ม setTimeout เพื่อดักคอ Browser
  useEffect(() => {
    const resetScroll = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0; // สั่งกลับซ้ายสุด
            checkScroll(); // เช็คปุ่มลูกศรใหม่
        }
    };

    // 1. สั่งรอบแรกทันทีที่โหลด
    resetScroll();

    // 2. สั่งซ้ำอีกทีหลังผ่านไป 0.1 วินาที (เพื่อแก้ทาง Browser ที่พยายามจำตำแหน่งเดิม)
    const timer = setTimeout(resetScroll, 100);
    
    return () => clearTimeout(timer);
  }, []); // ทำงานแค่ตอนเริ่มโหลด Component ครั้งแรก

  // ... (ส่วน checkScroll, useEffect ตัวที่สอง, scroll function และ return เหมือนเดิม) ...
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.6; 
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      {/* Left Button */}
      <button
        onClick={() => scroll('left')}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-2 rounded-full shadow-lg text-gray-700 hover:text-[#FF6B00] transition-all duration-300 flex items-center justify-center border border-gray-100 -ml-4 hidden md:flex ${showLeft ? 'opacity-0 group-hover:opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
      >
        <IconChevronLeft size={20} />
      </button>

      {/* Content Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`flex overflow-x-auto scrollbar-hide snap-x ${className}`}
      >
         {children}
      </div>

      {/* Right Button */}
      <button
        onClick={() => scroll('right')}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 p-2 rounded-full shadow-lg text-gray-700 hover:text-[#FF6B00] transition-all duration-300 flex items-center justify-center border border-gray-100 -mr-4 hidden md:flex ${showRight ? 'opacity-0 group-hover:opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
      >
        <IconChevronRight size={20} />
      </button>
    </div>
  );
};


// ==========================================
// 6. LOADING SKELETONS
// ==========================================
// 1. Skeleton สำหรับ News (แนวนอน/แนวตั้งตามการ์ดจริง)
export const SkeletonNews = () => (
  <div className="w-[85vw] sm:w-[350px] md:w-full flex flex-col gap-3 animate-pulse">
    {/* ส่วนรูปภาพ (เลียนแบบสัดส่วนจริง) */}
    <div className="w-full aspect-video bg-gray-200 rounded-2xl"></div>
    {/* ส่วนเนื้อหา */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
    </div>
  </div>
);

// 2. Skeleton สำหรับ Events (แนวตั้งสูง)
export const SkeletonEvent = () => (
  <div className="w-[38vw] min-w-[140px] md:w-[220px] lg:w-[260px] flex flex-col gap-3 animate-pulse">
    {/* ส่วนรูปภาพแนวตั้ง */}
    <div className="w-full aspect-[3/4] bg-gray-200 rounded-2xl"></div>
    {/* ส่วนเนื้อหา */}
    <div className="space-y-2 px-1">
      <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
      <div className="h-3 bg-gray-200 rounded-full w-full"></div>
    </div>
  </div>
);

// 3. Skeleton สำหรับ Cafes (สี่เหลี่ยมจัตุรัส + ข้อความ)
export const SkeletonCafe = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    {/* ส่วนรูปภาพจัตุรัส */}
    <div className="w-full aspect-square bg-gray-200 rounded-2xl"></div>
    {/* ส่วนเนื้อหา */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded-full w-2/3"></div>
      <div className="h-3 bg-gray-200 rounded-full w-1/3"></div>
    </div>
  </div>
);

// ==========================================
// 7. NOT FOUND PAGE
// ==========================================
export const NotFound = ({ title = "ไม่พบหน้าที่ต้องการ", onBack }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-300">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 mb-8">ลิงก์อาจผิด หรือข้อมูลถูกลบไปแล้ว</p>
      <button onClick={onBack} className="bg-[#FF6B00] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-[#E65000] transition active:scale-95">
        กลับหน้าหลัก
      </button>
    </div>
  );