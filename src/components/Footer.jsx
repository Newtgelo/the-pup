import React from "react";

export const Footer = ({ onLogoClick }) => {
  return (
    // ✅ ลบ mt-20 ออกแล้วครับ เพื่อให้ Footer ชนกับเนื้อหาด้านบนพอดี ไม่เกิดช่องว่างสีเทา
    <footer className="bg-[#0F172A] text-white pt-12 pb-28 md:py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Logo & Slogan */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20"></div>
            <span className="font-bold text-lg">The Popup Plan</span>
          </div>
          <p className="text-gray-400 text-sm">
            Minimalist K-Pop Hub & Event Planner
          </p>
        </div>

        {/* Links */}
        <div className="flex gap-12 text-sm text-gray-400">
          <div className="flex flex-col gap-2">
            <span className="text-white font-bold mb-2">เมนูหลัก</span>
            <button
              onClick={onLogoClick}
              className="text-left hover:text-white transition"
            >
              หน้าหลัก
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white font-bold mb-2">ติดต่อเรา</span>
            <p>อีเมล: pr@thepopupplan.com</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-6xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        © 2025 The Popup Plan. All rights reserved.
      </div>
    </footer>
  );
};