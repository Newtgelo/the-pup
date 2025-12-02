import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // ใช้ behavior: 'instant' เพื่อสั่งให้ "วาร์ป" ทันที ห้ามเลื่อน
    // (บาง Browser ใช้ 'auto' แต่ 'instant' ชัวร์กว่าสำหรับเคสนี้)
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", 
    });
  }, [pathname]);

  return null;
}