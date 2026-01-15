import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import parse, { domToReact } from "html-react-parser";
import { supabase } from "../../supabase"; 
import {
  IconShare, IconChevronLeft, IconClock,
} from "../icons/Icons"; 
import { SafeImage, NotFound } from "../ui/UIComponents";
import { Helmet } from "react-helmet-async";

// ✅ 1. สร้าง Skeleton Component (โครงกระดูกสำหรับโหลด)
const NewsDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
    {/* Desktop Header Placeholder */}
    <div className="hidden md:flex justify-between items-center mb-6">
      <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
    </div>

    {/* Title Section Placeholder */}
    <div className="mb-8 mt-12 md:mt-0">
      <div className="flex gap-3 mb-4">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
      </div>
      {/* จำลองหัวข้อข่าว 2 บรรทัด */}
      <div className="h-8 md:h-10 bg-gray-200 rounded-lg w-full mb-3"></div>
      <div className="h-8 md:h-10 bg-gray-200 rounded-lg w-2/3"></div>
    </div>

    {/* Image Placeholder (สัดส่วนเดียวกับรูปจริง) */}
    <div className="rounded-2xl overflow-hidden mb-10 aspect-video bg-gray-200"></div>

    {/* Content Placeholder (จำลองเนื้อหาข่าว) */}
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-11/12"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      <div className="h-40 bg-gray-200 rounded w-full my-6"></div> {/* จำลองรูปแทรก/วิดีโอ */}
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
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
      // หน่วงเวลาเทียม 0.5 วิ เพื่อให้เห็น Skeleton สวยๆ (ถ้าไม่ชอบลบ setTimeout ออกได้ครับ)
      // await new Promise(resolve => setTimeout(resolve, 500)); 
      
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
          .limit(3);
        
        if (others) setOtherNews(others);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

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

  // ✅ 2. เปลี่ยนจาก Text ธรรมดา เป็น Skeleton Component
  if (loading) return <NewsDetailSkeleton />;
  
  if (!news) return <NotFound title="ไม่พบข่าวดังกล่าว" onBack={() => navigate("/")} />;

  const metaDescription = news.content 
      ? news.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..."
      : `อ่านข่าว ${news.title} อัปเดตล่าสุดวงการ K-Pop ที่ The Popup Plan`;

  return (
    <>
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

      <div className="md:hidden fixed top-[80px] left-0 right-0 px-4 z-40 flex justify-between pointer-events-none">
        <button onClick={goBack} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconChevronLeft size={24} /></button>
        <button onClick={handleShare} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconShare size={20} /></button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 relative animate-fade-in">
        <div className="hidden md:flex justify-between items-center mb-6">
          <button onClick={goBack} className="group flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition">
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition"><IconChevronLeft size={24} /></div>
            <span className="font-bold text-gray-900 group-hover:text-[#FF6B00]">ย้อนกลับ</span>
          </button>
          <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF6B00] transition shadow-sm"><IconShare size={20} /></button>
        </div>

        <div className="mb-8 mt-12 md:mt-0">
          <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
            <span className="bg-[#FF6B00] text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">{news.category}</span>
            <span className="text-gray-500 flex items-center gap-1"><IconClock size={14} /> {news.date}</span>
          </div>
          
          <h1 className="text-2xl md:text-4xl lg:text-4xl font-extrabold text-gray-900 leading-snug md:leading-snug lg:leading-snug py-2 mb-4"> 
            {news.title}
          </h1>
        </div>

      {news.image_url && (
  // ✅ ลบ aspect-video ออก
  // ✅ ใส่ max-h-[600px] เผื่อรูปยาวเกินไปจะได้ไม่ล้นจอ (ปรับเลขได้)
  <div className="rounded-2xl overflow-hidden mb-10 shadow-lg bg-gray-100 relative group">
    <SafeImage 
        src={news.image_url} 
        alt={news.title} 
        // ✅ เปลี่ยน object-cover -> object-contain (หรือเอาออกเลยก็ได้ถ้ารูปเต็ม)
        // ✅ h-auto = สูงตามจริง
        className="w-full h-auto max-h-[80vh] object-contain mx-auto" 
    />
  </div>
)}

        <div className="max-w-3xl mx-auto mb-10 prose prose-sm md:prose-lg text-gray-600 leading-relaxed whitespace-pre-line 
              [&>p]:mb-4 
              [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-3
              [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3
              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4
              [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4
              [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-8 [&_img]:max-w-full [&_img]:max-h-[500px] [&_img]:object-contain [&_img]:mx-auto"
        >
          {parse(news.content || "", {
            replace: (domNode) => {
              if (domNode.name === "iframe" && domNode.attribs) {
                return (
                  <div className="w-full aspect-video my-8 rounded-xl overflow-hidden shadow-lg bg-black">
                    <iframe {...domNode.attribs} className="w-full h-full" allowFullScreen></iframe>
                  </div>
                );
              }
              if (domNode.name === "a" && domNode.attribs && domNode.attribs.href) {
                const href = domNode.attribs.href;
                if (href.includes("youtube.com/embed") || href.includes("youtu.be") || href.includes("youtube.com/watch")) {
                  let videoId = "";
                  if (href.includes("/embed/")) videoId = href.split("/embed/")[1]?.split("?")[0];
                  else if (href.includes("v=")) videoId = href.split("v=")[1]?.split("&")[0];
                  else if (href.includes("youtu.be/")) videoId = href.split("youtu.be/")[1]?.split("?")[0];

                  if (videoId) {
                    return (
                      <div className="w-full aspect-video my-8 rounded-xl overflow-hidden shadow-lg bg-black">
                        <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen frameBorder="0"></iframe>
                      </div>
                    );
                  }
                }
                return (
                  <a {...domNode.attribs} target="_blank" rel="noopener noreferrer" className="text-[#FF6B00] hover:underline break-words font-bold">
                    {domToReact(domNode.children)}
                  </a>
                );
              }
            },
          })}
        </div>

        {news.tags && (
          <div className="max-w-3xl mx-auto mb-12 flex flex-wrap gap-2">
            {news.tags.split(",").map((tag, index) => (
              <span key={index} className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-[#FF6B00] hover:text-white transition cursor-pointer" onClick={() => navigate(`/search?q=${tag.trim()}`)}>#{tag.trim()}</span>
            ))}
          </div>
        )}
        <hr className="border-gray-200 mb-12" />

        <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">ข่าวล่าสุดที่น่าสนใจ</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherNews.map((n) => (
              <div key={n.id} onClick={() => { navigate(`/news/${n.id}`); window.scrollTo(0, 0); }} className="cursor-pointer group">
                <div className="aspect-video rounded-xl overflow-hidden bg-gray-200 mb-3">
                  <SafeImage src={n.image_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                </div>
                <h4 className="font-bold text-gray-900 leading-tight group-hover:text-[#FF6B00] transition line-clamp-2">{n.title}</h4>
                <p className="text-xs text-gray-500 mt-2">{n.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};