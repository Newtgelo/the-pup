import React from "react";
import { useLocation } from "react-router-dom"; // ✅ 1. นำเข้าเครื่องมือเช็ค URL

export const Footer = ({ onLogoClick }) => {
  const location = useLocation(); // ✅ 2. ดึงค่า URL ปัจจุบันมาเก็บไว้

  // ✅ 3. ด่านตรวจ: ถ้าอยู่หน้า "/events" ให้ซ่อน Footer (return null)
  if (location.pathname === '/events') {
    return null;
  }

  return (
    // ✅ 1. แก้ pb-28 เป็น pb-8 (ลดพื้นที่ว่างด้านล่างสุดให้สั้นลง)
    <footer className="bg-[#0F172A] text-white pt-10 pb-8 md:py-12">
      
      {/* ✅ 2. ลด gap-8 เหลือ gap-6 (ระยะห่างระหว่างโลโก้กับเมนู) */}
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-6 md:gap-8">
        
        {/* Logo Section */}
        <div className="mb-2 md:mb-0"> {/* เพิ่ม mb-2 กันชิดเกินไปนิดนึง */}
          <div className="flex items-center gap-3 mb-2 md:mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20"></div>
            <span className="font-bold text-lg">The Popup Plan</span>
          </div>
          <p className="text-gray-400 text-sm">
            Minimalist K-Pop Hub & Event Planner
          </p>
        </div>

        {/* Links Section */}
        {/* ✅ 3. ลด gap-12 เหลือ gap-8 (ระยะห่างระหว่างคอลัมน์เมนู) */}
        <div className="flex gap-8 md:gap-12 text-sm text-gray-400 w-full md:w-auto">
          <div className="flex flex-col gap-2">
            <span className="text-white font-bold mb-1 md:mb-2">เมนูหลัก</span>
            <button
              onClick={onLogoClick}
              className="text-left hover:text-white transition"
            >
              หน้าหลัก
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white font-bold mb-1 md:mb-2">ติดต่อเรา</span>
            <p>อีเมล: pr@thepopupplan.com</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      {/* ✅ 4. ลด mt-12 เป็น mt-8 (ดึงเส้นขีดขึ้นมาให้ชิดขึ้น) */}
      <div className="max-w-6xl mx-auto px-4 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        © 2025 The Popup Plan. All rights reserved.
      </div>
    </footer>
  );
};