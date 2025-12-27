import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { IconChevronLeft } from "../icons/Icons";
import { SkeletonCafe } from "../ui/UIComponents";
import { CafeCard } from "../ui/CardComponents";

export const CafesPage = () => {
  const navigate = useNavigate();
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCafes = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("cafes").select("*").eq("status", "published").order("id", { ascending: false });
      if (error) console.error("Error fetching cafes:", error);
      else setCafes(data || []);
      setLoading(false);
    };
    fetchCafes();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      <div className="py-6 border-b border-gray-100 mb-6 flex gap-2 items-center">
        <button onClick={() => navigate("/#cafes-section")} className="text-gray-500 hover:text-[#FF6B00] transition"><IconChevronLeft size={24} /></button>
        <div><h1 className="text-2xl font-bold text-gray-900">คาเฟ่และสถานที่ทั้งหมด</h1>{!loading && (<p className="text-gray-500 text-sm">พบทั้งหมด {cafes.length} รายการ</p>)}</div>
      </div>
      {loading ? (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{[1, 2, 3, 4, 5, 6].map((i) => (<SkeletonCafe key={i} />))}</div>) : (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">{cafes.map((cafe) => (<CafeCard key={cafe.id} item={cafe} onClick={() => navigate(`/cafe/${cafe.id}`)} />))}{cafes.length === 0 && (<div className="col-span-full text-center py-20 text-gray-400"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">☕️</div>ยังไม่มีข้อมูลคาเฟ่ที่เผยแพร่ในขณะนี้</div>)}</div>)}
    </div>
  );
};