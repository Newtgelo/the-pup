import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Import Icons
import { IconSearch, IconX, IconLogo } from './components/icons/Icons';

// Import UI Components
import { Toast, NotFound } from './components/ui/UIComponents'; 
import RouteLoader from './components/RouteLoader'; 
import ScrollToTop from './components/ScrollToTop'; 

// Import Views (Detail Pages)
import { NewsDetail, EventDetail, CafeDetail } from './components/PageViews';

// --- Zone Admin Imports ---
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard'; // ✅ Import AdminDashboard
import { AdminNewsDashboard } from './pages/AdminNewsDashboard'; // --- IGNORE ---
import { AdminCreateNews } from './pages/AdminCreateNews';
import { AdminEditNews } from './pages/AdminEditNews';

import { AdminEventDashboard } from './pages/AdminEventDashboard';
import { AdminCreateEvent } from './pages/AdminCreateEvent';
import { AdminEditEvent } from './pages/AdminEditEvent';

import { AdminLayout } from './pages/AdminLayout';

import { AdminCafeDashboard } from './pages/AdminCafeDashboard';
import { AdminCreateCafe } from './pages/AdminCreateCafe';
import { AdminEditCafe } from './pages/AdminEditCafe';

// Import Main Pages
import { 
  HomePage,
  SearchPage,
  NewsPage,     
  EventsPage,   
  CafesPage     
} from './components/MainPages';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const triggerToast = (message) => setToast({ show: true, message });
  const closeToast = () => setToast({ ...toast, show: false });

  useEffect(() => {
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
     const val = e.target.value;
     setSearchTerm(val);
     if (val) {
        navigate(`/search?q=${val}`);
     } else {
        navigate('/'); 
     }
  };

  const clearSearch = () => {
      setSearchTerm("");
      navigate('/');
  };

  const handleLogoClick = () => {
      setSearchTerm("");
      navigate('/');
      window.scrollTo(0, 0); 
  };

  // เช็คว่าอยู่ในหน้า Admin หรือไม่ (เพื่อซ่อน Navbar/Footer ของหน้าบ้าน)
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      <RouteLoader />
      <ScrollToTop />

      {/* ✅ NAVBAR (ซ่อนถ้าเป็นหน้า Admin) */}
      {!isAdminPage && (
        <nav className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* Logo */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
                <IconLogo />
                <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900">The Popup Plan</h1>
                    <p className="text-[10px] md:text-xs text-gray-500">Minimalist K-Pop Hub & Event Planner</p>
                </div>
              </div>
              
              {/* Desktop Search */}
              <div className="hidden md:flex relative w-1/3">
                <input type="text" placeholder="ค้นหากิจกรรม / ศิลปิน..." className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[#FF6B00] bg-gray-50 transition" value={searchTerm} onChange={handleSearch} />
                {searchTerm ? (<button onClick={clearSearch} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"><IconX size={20} /></button>) : (<div className="absolute right-3 top-2.5 text-gray-400"><IconSearch size={20} /></div>)}
              </div>

              {/* Mobile Search Toggle */}
              <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)} className="md:hidden p-2 text-gray-500 hover:text-[#FF6B00] transition rounded-full hover:bg-gray-50">
                  {isMobileSearchOpen ? <IconX size={24} /> : <IconSearch size={24} />}
              </button>
            </div>
            
            {/* Mobile Search Overlay */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileSearchOpen ? 'max-h-20 opacity-100 border-t border-gray-100' : 'max-h-0 opacity-0'}`}>
               <div className="py-3 pb-4 relative">
                 <input type="text" placeholder="ค้นหากิจกรรม / ศิลปิน..." className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[#FF6B00] bg-gray-50 text-sm shadow-sm" value={searchTerm} onChange={handleSearch}/>
                 {searchTerm ? (<button onClick={clearSearch} className="absolute right-3 top-5 text-gray-400 hover:text-gray-600"><IconX size={18} /></button>) : (<div className="absolute right-3 top-5 text-gray-400"><IconSearch size={18} /></div>)}
               </div>
            </div>
          </div>
        </nav>
      )}

      {/* ROUTES */}
      <Routes>
        {/* หน้าบ้าน (Public) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/cafes" element={<CafesPage />} />
        <Route path="/news/:id" element={<NewsDetail onTriggerToast={triggerToast} />} />
        <Route path="/event/:id" element={<EventDetail onTriggerToast={triggerToast} />} />
        <Route path="/cafe/:id" element={<CafeDetail onTriggerToast={triggerToast} />} />
        
        {/* 🔐 Admin Login (หน้าเดียวที่ไม่ต้องมี Layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* ✅ Admin Layout Group (Sidebar จะโผล่เฉพาะในนี้) */}
        <Route element={<AdminLayout />}>
            {/* ✅ 2. เพิ่ม Route Dashboard เข้าไปในนี้ */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/news" element={<AdminNewsDashboard />} />  {/* ✅ 2. เพิ่ม Route นี้ */}

            <Route path="/admin/create-news" element={<AdminCreateNews />} />
            <Route path="/admin/edit-news/:id" element={<AdminEditNews />} />

            <Route path="/admin/events" element={<AdminEventDashboard />} />
            <Route path="/admin/create-event" element={<AdminCreateEvent />} />
            <Route path="/admin/edit-event/:id" element={<AdminEditEvent />} />

            {/* ✅ Cafe Manager Routes */}
            <Route path="/admin/cafes" element={<AdminCafeDashboard />} />
            <Route path="/admin/create-cafe" element={<AdminCreateCafe />} />
            <Route path="/admin/edit-cafe/:id" element={<AdminEditCafe />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound onBack={() => navigate('/')} />} />
      </Routes>

      <Toast message={toast.message} show={toast.show} onClose={closeToast} />

      {/* ✅ FOOTER (ซ่อนถ้าเป็นหน้า Admin) */}
      {!isAdminPage && (
        <footer className="bg-[#0F172A] text-white mt-20 pt-12 pb-28 md:py-12">
           <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-8">
              <div><div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-full bg-white/20"></div><span className="font-bold text-lg">The Popup Plan</span></div><p className="text-gray-400 text-sm">Minimalist K-Pop Hub & Event Planner</p></div>
              <div className="flex gap-12 text-sm text-gray-400"><div className="flex flex-col gap-2"><span className="text-white font-bold mb-2">เมนูหลัก</span><button onClick={handleLogoClick} className="text-left hover:text-white">หน้าหลัก</button></div><div className="flex flex-col gap-2"><span className="text-white font-bold mb-2">ติดต่อเรา</span><p>อีเมล: pr@thepopupplan.com</p></div></div>
           </div>
           <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">© 2025 The Popup Plan. All rights reserved.</div>
        </footer>
      )}
    </div>
  );
}