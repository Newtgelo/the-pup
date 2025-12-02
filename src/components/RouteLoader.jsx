import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function RouteLoader() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 1. เมื่อ URL เปลี่ยน ให้เริ่มวิ่ง
    setVisible(true);
    setProgress(30); // เริ่มที่ 30% ทันที

    // 2. ขยับไป 70% แบบสุ่มนิดๆ ให้ดูเหมือนโหลดจริง
    const timer1 = setTimeout(() => setProgress(70), 100);

    // 3. วิ่งไปจบที่ 100% แล้วซ่อนตัว
    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200); // รอ 0.2 วิ ให้ User เห็นว่าเต็มหลอดแล้วค่อยหายไป
    }, 400); // เวลาทั้งหมดในการวิ่ง (ปรับเลขนี้ถ้าอยากให้วิ่งนานขึ้น)

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location]); // ทำงานทุกครั้งที่ location เปลี่ยน

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[100]">
      <div 
        className="h-[3px] bg-[#FF6B00] shadow-[0_0_10px_#FF6B00] transition-all ease-out duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}