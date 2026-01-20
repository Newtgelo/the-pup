import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import parse, { domToReact } from "html-react-parser";
import { supabase } from "../../supabase";
import {
  IconShare, IconChevronLeft, IconClock,
} from "../icons/Icons";
import { SafeImage, NotFound } from "../ui/UIComponents";
import { Helmet } from "react-helmet-async";

// ✅ แก้ไข Skeleton ให้ตรงกับดีไซน์ใหม่ (Hero Banner เต็มจอ)
const NewsDetailSkeleton = () => (
  <div className="min-h-screen bg-white animate-pulse font-sans">
    
    {/* 1. ส่วน Hero Banner (เลียนแบบของจริง: เต็มจอ + Overlay) */}
    <div className="relative w-full aspect-video max-h-[70vh] lg:max-h-[85vh] bg-gray-200">
      
      {/* Desktop Topic Placeholder: จำลองข้อความลอยบนรูป (เฉพาะจอใหญ่) */}
      <div className="hidden md:flex absolute bottom-0 left-0 right-0 pb-12 pt-24 justify-end flex-col max-w-4xl mx-auto px-4 w-full">
         {/* Badge & Date */}
         <div className="flex gap-3 mb-4">
            <div className="h-7 w-20 bg-gray-300/50 rounded-full backdrop-blur-sm"></div>
            <div className="h-7 w-32 bg-gray-300/50 rounded-full backdrop-blur-sm"></div>
         </div>
         {/* Title */}
         <div className="h-10 w-3/4 bg-gray-300/50 rounded-lg mb-3 backdrop-blur-sm"></div>
         <div className="h-10 w-1/2 bg-gray-300/50 rounded-lg backdrop-blur-sm"></div>
      </div>
    </div>

    {/* 2. ส่วนเนื้อหาข่าว (Content Body) */}
    <div className="max-w-4xl mx-auto px-4 mt-8 md:mt-12">
      
      {/* Mobile Header Placeholder: จำลองหัวข้อสำหรับมือถือ (เฉพาะจอเล็ก) */}
      <div className="md:hidden block mb-8 text-center">
         <div className="flex justify-center gap-3 mb-4">
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
         </div>
         <div className="h-8 w-full bg-gray-200 rounded mb-2"></div>
         <div className="h-8 w-2/3 bg-gray-200 rounded mx-auto"></div>
         <hr className="border-gray-100 mt-6" />
      </div>

      {/* Paragraphs: เนื้อหาข่าวจำลอง */}
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        
        {/* รูปแทรกในเนื้อหา (Optional) */}
        <div className="h-64 w-full bg-gray-100 rounded-xl my-8"></div>
        
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  </div>
);

export const NewsDetail = ({ onTriggerToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherNews, setOtherNews] = useState([]);
  
  // ✅ 1. เพิ่ม State เก็บระยะการ Scroll
  const [scrollY, setScrollY] = useState(0);

  const goBack = () => {
    if (location.state?.fromHome) {
      navigate("/#news-section");
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("news").select("*").eq("id", id).single();
      if (error) {
        setNews(null);
      } else {
        setNews(data);
        const { data: others } = await supabase
          .from("news")
          .select("*")
          .neq("id", id)
          .order('date', { ascending: false })
          .limit(6);
        
        if (others) setOtherNews(others);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // ✅ 2. เพิ่ม Listener ดักจับการ Scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    // เพิ่ม event listener
    window.addEventListener("scroll", handleScroll);
    // ลบออกเมื่อ component ถูกทำลาย (clean up)
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    const shareData = { title: news?.title, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        onTriggerToast("คัดลอกลิงก์แล้ว");
      }
    } catch (err) {
      console.log("Error:", err);
    }
  };

  if (loading) return <NewsDetailSkeleton />;
  if (!news) return <NotFound title="ไม่พบข่าวดังกล่าว" onBack={() => navigate("/")} />;

  const metaDescription = news.content 
      ? news.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..."
      : `อ่านข่าว ${news.title} อัปเดตล่าสุดวงการ K-Pop ที่ The Popup Plan`;

  return (
    <div className="min-h-screen bg-white pb-12 font-sans">
      <Helmet>
        <title>{`${news.title} | The Popup Plan`}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={news.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={news.image_url} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={news.title} />
        <meta property="twitter:description" content={metaDescription} />
        <meta property="twitter:image" content={news.image_url} />
      </Helmet>

      {/* ✅ HERO BANNER */}
      <div className="relative w-full mt-0 group">
        {news.image_url ? (
          <div className="w-full aspect-video max-h-[70vh] lg:max-h-[85vh] relative overflow-hidden">
            <SafeImage 
              src={news.image_url} 
              alt={news.title} 
              className="w-full h-full object-cover" 
            />
            
            {/* Desktop Overlay: เงาดำไล่ระดับ (เฉพาะจอใหญ่) */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
            
            {/* Desktop Topic: ข้อความลอยบนรูป (ซ้ายล่าง) */}
            <div 
                className="hidden md:flex absolute bottom-0 left-0 right-0 pb-12 pt-24 justify-end flex-col z-10"
                // ✅ 3. ใส่ Parallax Effect ตรงนี้ (คูณ 0.4 ให้ช้ากว่ารูป)
                style={{ transform: `translateY(-${scrollY * 0.2}px)` }}
            >
                <div className="max-w-4xl mx-auto px-4 w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-[#FF6B00] text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-white/20">
                            {news.category}
                        </span>
                        <span className="text-gray-200 flex items-center gap-1 font-medium text-sm drop-shadow-md">
                            <IconClock size={16} />
                            {/* ✅ แก้เป็นแบบนี้ */}
    {news.date ? news.date.split('-').reverse().join('-') : ''}
                        </span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-[1.6] lg:leading-[1.5] drop-shadow-lg max-w-3xl">
                        {news.title}
                    </h1>
                </div>
            </div>

          </div>
        ) : (
          <div className="h-[20px]"></div>
        )}

        {/* ✅ ปุ่มย้อนกลับและแชร์ */}
        <div className="absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 z-20 flex justify-between items-start text-white drop-shadow-md">
            
            {/* ✅ Logic ซ่อนปุ่ม Back ถ้าเปิด Tab ใหม่ (ไม่มี state) */}
            {location.state?.fromHome ? (
                <button onClick={goBack} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/20 transition">
                     <IconChevronLeft size={24} className="text-white" />
                </button>
            ) : (
                <div></div>
            )}
            
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/20 transition">
                <IconShare size={20} className="text-white"/>
            </button>
        </div>
      </div>


      {/* ✅ CONTENT BODY */}
      <div className="max-w-4xl mx-auto px-4 mt-8 md:mt-12 animate-fade-in-up">
          
          {/* ✅ MOBILE ONLY HEADER */}
          <div className="md:hidden block mb-8 text-center">
             <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                <span className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{news.category}</span>
                <span className="text-gray-500 flex items-center gap-1 font-medium text-xs"><IconClock size={16} />
                {/* ✅ แก้เป็นแบบนี้ */}
    {news.date ? news.date.split('-').reverse().join('-') : ''}
                </span>
             </div>
             <h1 className="text-2xl font-extrabold text-[#111111] leading-tight"> 
                {news.title}
             </h1>
             <hr className="border-gray-100 mt-6" />
          </div>

          {/* Body Content */}
          <div className="prose prose-sm md:prose-lg text-[#111111] leading-relaxed whitespace-pre-line break-words w-full
                font-body 
                {/* 👆 ✅ ใส่ตรงนี้: เนื้อหาปกติจะเป็นฟอนต์มีหัว (Looped) */}

                [&>p]:mb-6 
                
                {/* 👇 ✅ สั่งให้หัวข้อแทรก (h1, h2) กลับไปใช้ฟอนต์เท่ๆ ไม่มีหัว (Sans) */}
                [&>h1]:font-sans [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4
                [&>h2]:font-sans [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4
                
                [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6
                [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-6
                [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-8 [&_img]:max-w-full [&_img]:mx-auto
                [&>blockquote]:border-l-4 [&>blockquote]:border-orange-400 
                [&>blockquote]:pl-4 [&>blockquote]:py-2 [&>blockquote]:my-6
                [&>blockquote]:italic [&>blockquote]:text-gray-700 [&>blockquote]:bg-transparent"
          >
            {parse(news.content || "", {
              replace: (domNode) => {
                 if (domNode.name === "iframe" && domNode.attribs) { return (<div className="w-full aspect-video my-4 rounded-xl overflow-hidden shadow-sm bg-black"><iframe {...domNode.attribs} className="w-full h-full" allowFullScreen></iframe></div>); }
                 if (domNode.name === "a" && domNode.attribs && domNode.attribs.href) { 
                      const href = domNode.attribs.href;
                      if (href.includes("youtube.com/embed") || href.includes("youtu.be") || href.includes("youtube.com/watch")) {
                        let videoId = "";
                        if (href.includes("/embed/")) videoId = href.split("/embed/")[1]?.split("?")[0];
                        else if (href.includes("v=")) videoId = href.split("v=")[1]?.split("&")[0];
                        else if (href.includes("youtu.be/")) videoId = href.split("youtu.be/")[1]?.split("?")[0];
                        
                        if (videoId) return (
  <span className="block w-full aspect-video my-4 rounded-xl overflow-hidden shadow-sm bg-black">
    <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen frameBorder="0"></iframe>
  </span>
);
                      }
                     return <a {...domNode.attribs} target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] hover:underline break-words font-bold">{domToReact(domNode.children)}</a>
                 }
              },
            })}
          </div>

          {/* Footer Tags */}
          {news.tags && (
            <div className="mt-10 mb-12 flex flex-wrap gap-2 pb-8 border-b border-gray-100">
              {news.tags.split(",").map((tag, index) => (
                <span key={index} className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition cursor-pointer" onClick={() => navigate(`/search?q=${tag.trim()}`)}>#{tag.trim()}</span>
              ))}
            </div>
          )}

          {/* Related News */}
          <div className="mt-12">
            <h3 className="text-xl font-bold text-[#111111] mb-6">ข่าวล่าสุดที่น่าสนใจ</h3>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
              {otherNews.map((n) => (
                <div key={n.id} onClick={() => { navigate(`/news/${n.id}`); window.scrollTo(0, 0); }} className="flex-shrink-0 w-[42vw] md:w-[30%] snap-start cursor-pointer group">
                  <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3">
                    <SafeImage src={n.image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  </div>
                  <h4 className="font-bold text-[#111111] leading-tight group-hover:text-[#FF6B00] transition line-clamp-2">{n.title}</h4>
                  
                  {/* ✅ แก้ไข: ใส่ไอคอนนาฬิกา และสลับเลขเป็น วัน-เดือน-ปี */}
<div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
   <IconClock size={12} />
   <span>{n.date ? n.date.split('-').reverse().join('-') : ''}</span>
</div>

                </div>
              ))}
            </div>
          </div>

      </div>
    </div>
  );
};