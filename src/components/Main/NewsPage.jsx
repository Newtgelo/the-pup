import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase";
import { IconChevronLeft } from "../icons/Icons";
import { SkeletonNews } from "../ui/UIComponents";
import { NewsCard } from "../ui/CardComponents";

export const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("ทั้งหมด");
  const [filteredNews, setFilteredNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    // ✅ แก้ตรงนี้: เพิ่ม .eq('status', 'published') เพื่อกรองข่าวที่เป็น Draft ออก
    supabase
      .from("news")
      .select("*")
      .eq("status", "published") 
      .order("id", { ascending: false })
      .then(({ data }) => {
        const newsData = data || [];
        setNews(newsData);
        setFilteredNews(newsData);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = news;
    if (categoryFilter !== "ทั้งหมด") result = news.filter((item) => item.category?.toLowerCase().trim() === categoryFilter.toLowerCase().trim());
    setFilteredNews(result);
    setCurrentPage(1);
  }, [categoryFilter, news]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const handlePageChange = (pageNumber) => { setCurrentPage(pageNumber); document.getElementById("news-grid-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      <div className="py-6 border-b border-gray-100 mb-6 flex gap-2 items-center" id="news-grid-anchor">
        <button onClick={() => navigate("/#news-section")}><IconChevronLeft size={24} /></button>
        <div><h1 className="text-2xl font-bold text-gray-900">ข่าวสารทั้งหมด</h1>{!loading && (<p className="text-gray-500 text-sm">พบทั้งหมด {filteredNews.length} รายการ</p>)}</div>
      </div>
      <div className="flex flex-wrap gap-2 mb-8">{["ทั้งหมด", "K-pop", "T-pop"].map((filter) => (<button key={filter} onClick={() => setCategoryFilter(filter)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${categoryFilter === filter ? "bg-[#FF6B00] text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>{filter}</button>))}</div>
      {loading ? (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">{[...Array(8)].map((_, i) => (<SkeletonNews key={i} />))}</div>) : (<><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in min-h-[500px] content-start">{currentItems.length > 0 ? (currentItems.map((item) => (<NewsCard key={item.id} item={item} onClick={() => navigate(`/news/${item.id}`)} />))) : (<div className="col-span-full text-center py-16 text-gray-400">ไม่พบข่าวสารในหมวดหมู่นี้</div>)}</div>{totalPages > 1 && (<div className="flex justify-center items-center mt-12 gap-2"><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 transition ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50 hover:text-[#FF6B00]"}`}><IconChevronLeft size={20} /></button>{[...Array(totalPages)].map((_, index) => { const page = index + 1; if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) { return (<button key={page} onClick={() => handlePageChange(page)} className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition ${currentPage === page ? "bg-[#FF6B00] text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"}`}>{page}</button>); } else if (page === currentPage - 2 || page === currentPage + 2) { return (<span key={page} className="text-gray-400">...</span>); } return null; })}<button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 transition ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-50 hover:text-[#FF6B00]"}`}><div className="rotate-180"><IconChevronLeft size={20} /></div></button></div>)}</>)}
    </div>
  );
};