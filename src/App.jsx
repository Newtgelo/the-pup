import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

// ✅ 1. Import Helmet สำหรับจัดการ SEO
import { Helmet } from 'react-helmet-async';

// Import Icons
import { IconSearch, IconX, IconLogo } from "./components/icons/Icons";

// Import UI Components
import { Toast, NotFound } from "./components/ui/UIComponents";
import RouteLoader from "./components/RouteLoader";
import ScrollToTop from "./components/ScrollToTop";

// ✅ Import Footer ที่แยกออกมาใหม่
import { Footer } from "./components/Footer";

// Import Views (Detail Pages)
import { NewsDetail, EventDetail, CafeDetail } from "./components/Detail";

// --- Zone Admin Imports ---
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminNewsDashboard } from "./pages/AdminNewsDashboard";
import { AdminCreateNews } from "./pages/AdminCreateNews";
import { AdminEditNews } from "./pages/AdminEditNews";

import { AdminEventDashboard } from "./pages/AdminEventDashboard";
import { AdminCreateEvent } from "./pages/AdminCreateEvent";
import { AdminEditEvent } from "./pages/AdminEditEvent";

import { AdminLayout } from "./pages/AdminLayout";

import { AdminCafeDashboard } from "./pages/AdminCafeDashboard";
import { AdminCreateCafe } from "./pages/AdminCreateCafe";
import { AdminEditCafe } from "./pages/AdminEditCafe";

import { AdminSettings } from "./pages/AdminSettings";

import {
  HomePage,
  SearchPage,
  NewsPage,
  EventsPage,
  CafesPage,
} from "./components/Main";

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
      navigate("/");
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    navigate("/");
  };

  const handleLogoClick = () => {
    setSearchTerm("");
    navigate("/");
    window.scrollTo(0, 0);
  };

  const isAdminPage = location.pathname.startsWith("/admin");

  // ✅ เช็คว่าเป็นหน้า Events หรือไม่ (เพื่อซ่อน Navbar ในมือถือ)
  const isEventsPage = location.pathname === '/events';

  // ✅ 2. กำหนดค่า Default SEO
  const defaultTitle = "The Popup Plan | Minimalist K-Pop Hub";
  const defaultDesc = "รวมทุกอีเวนต์ K-Pop ครบ จบ ในที่เดียว ค้นหาคาเฟ่ โปรเจกต์วันเกิด และคอนเสิร์ตศิลปินคนโปรดได้ง่ายๆ";
  const defaultImage = "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1200&auto=format&fit=crop";
  const siteUrl = "https://the-popup-plan.vercel.app/";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* ✅ 3. Helmet SEO */}
      <Helmet>
        <title>{defaultTitle}</title>
        <meta name="description" content={defaultDesc} />

        {/* Facebook / Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={defaultTitle} />
        <meta property="og:description" content={defaultDesc} />
        <meta property="og:image" content={defaultImage} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={siteUrl} />
        <meta property="twitter:title" content={defaultTitle} />
        <meta property="twitter:description" content={defaultDesc} />
        <meta property="twitter:image" content={defaultImage} />
      </Helmet>

      <RouteLoader />
      <ScrollToTop />

      {!isAdminPage && (
        // ✅ เพิ่ม ClassLogic: ถ้าเป็นหน้า Events ให้ซ่อนในมือถือ (hidden) แต่โชว์ในจอ md ขึ้นไป (md:block)
        <nav className={`bg-white border-b sticky top-0 z-50 ${isEventsPage ? 'hidden md:block' : ''}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 md:h-20">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={handleLogoClick}
              >
                <IconLogo />
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-gray-900">
                    The Popup Plan
                  </h1>
                  <p className="text-[10px] md:text-xs text-gray-500">
                    Minimalist K-Pop Hub & Event Planner
                  </p>
                </div>
              </div>

              <div className="hidden md:flex relative w-1/3">
                <input
                  type="text"
                  placeholder="ค้นหากิจกรรม / ศิลปิน..."
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[#FF6B00] bg-gray-50 transition"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm ? (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <IconX size={20} />
                  </button>
                ) : (
                  <div className="absolute right-3 top-2.5 text-gray-400">
                    <IconSearch size={20} />
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-[#FF6B00] transition rounded-full hover:bg-gray-50"
              >
                {isMobileSearchOpen ? (
                  <IconX size={24} />
                ) : (
                  <IconSearch size={24} />
                )}
              </button>
            </div>

            <div
              className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                isMobileSearchOpen
                  ? "max-h-20 opacity-100 border-t border-gray-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="py-3 pb-4 relative">
                <input
                  type="text"
                  placeholder="ค้นหากิจกรรม / ศิลปิน..."
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-[#FF6B00] bg-gray-50 text-sm shadow-sm"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                {searchTerm ? (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-5 text-gray-400 hover:text-gray-600"
                  >
                    <IconX size={18} />
                  </button>
                ) : (
                  <div className="absolute right-3 top-5 text-gray-400">
                    <IconSearch size={18} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/cafes" element={<CafesPage />} />

        <Route
          path="/news/:id"
          element={<NewsDetail onTriggerToast={triggerToast} />}
        />
        <Route
          path="/event/:id"
          element={<EventDetail onTriggerToast={triggerToast} />}
        />
        <Route
          path="/cafe/:id"
          element={<CafeDetail onTriggerToast={triggerToast} />}
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/admin/settings" element={<AdminSettings />} />

          <Route path="/admin/news" element={<AdminNewsDashboard />} />
          <Route path="/admin/create-news" element={<AdminCreateNews />} />
          <Route path="/admin/edit-news/:id" element={<AdminEditNews />} />

          <Route path="/admin/events" element={<AdminEventDashboard />} />
          <Route path="/admin/create-event" element={<AdminCreateEvent />} />
          <Route path="/admin/edit-event/:id" element={<AdminEditEvent />} />

          <Route path="/admin/cafes" element={<AdminCafeDashboard />} />
          <Route path="/admin/create-cafe" element={<AdminCreateCafe />} />
          <Route path="/admin/edit-cafe/:id" element={<AdminEditCafe />} />
        </Route>

        <Route path="*" element={<NotFound onBack={() => navigate("/")} />} />
      </Routes>

      <Toast message={toast.message} show={toast.show} onClose={closeToast} />

      {/* ✅ Footer จัดการตัวเองแล้ว (ซ่อนเมื่ออยู่หน้า events) */}
      {!isAdminPage && <Footer onLogoClick={handleLogoClick} />}
    </div>
  );
}