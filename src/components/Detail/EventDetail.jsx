import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  IconShare, IconX, IconMaximize, IconCalendar, IconMapPin, IconChevronLeft, IconTicket,
} from "../icons/Icons";
import { SafeImage, NotFound } from "../ui/UIComponents";
import parse, { domToReact } from "html-react-parser";

// ✅ 1. Import Helmet
import { Helmet } from "react-helmet-async";

export const EventDetail = ({ onTriggerToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const goBack = () => {
    if (location.state?.fromHome) {
      navigate("/#events-section");
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
      if (error) setEvent(null);
      else setEvent(data);
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">กำลังโหลดอีเวนต์...</div>;
  if (!event) return <NotFound title="ไม่พบกิจกรรมดังกล่าว" onBack={() => navigate("/")} />;

  const handleMapClick = () => {
    if (event.lat && event.lng) {
      window.open(`https://www.google.com/maps/search/?api=1&query=$${event.lat},${event.lng}`, "_blank");
    } else if (event.location) {
      window.open(`https://www.google.com/maps/search/?api=1&query=$${encodeURIComponent(event.location)}`, "_blank");
    } else {
      onTriggerToast("ไม่พบข้อมูลแผนที่");
    }
  };

  const addToCalendar = () => {
    if (!event.date) { onTriggerToast("ไม่พบข้อมูลวันเวลา"); return; }
    const dateStr = event.date.replace(/-/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${dateStr}/${dateStr}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location || "")}`;
    window.open(url, "_blank");
    onTriggerToast("เปิด Google Calendar แล้ว");
  };

  const handleShare = async () => {
    const shareData = { title: event.title, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        onTriggerToast("คัดลอกลิงก์แล้ว");
      }
    } catch (err) { console.log("Error:", err); }
  };

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
    : "วันงานแสดง";

  // ✅ Helper: สร้าง Description แบบสั้นๆ สำหรับ SEO (ตัด HTML tags ออก)
  const metaDescription = event.description 
      ? event.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..."
      : `ดูรายละเอียดงาน ${event.title} วันที่ ${formattedDate} สถานที่ ${event.location} ได้ที่ The Popup Plan`;

  return (
    <>
      {/* ✅ 2. ส่วน SEO: เปลี่ยน Title และ Meta Tags */}
      <Helmet>
        <title>{`${event.title} | The Popup Plan`}</title>
        <meta name="description" content={metaDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={event.image_url} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.href} />
        <meta property="twitter:title" content={event.title} />
        <meta property="twitter:description" content={metaDescription} />
        <meta property="twitter:image" content={event.image_url} />
      </Helmet>

      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
          <button onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white hover:text-[#FF6B00] transition"><IconX size={32} /></button>
          <SafeImage src={event.image_url} alt="Full View" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* ... (ส่วน UI ด้านล่างเหมือนเดิม 100% ไม่แตะต้อง) ... */}
      <div className="md:hidden fixed top-[80px] left-0 right-0 px-4 z-40 flex justify-between pointer-events-none">
        <button onClick={goBack} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconChevronLeft size={24} /></button>
        <button onClick={handleShare} className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"><IconShare size={20} /></button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 pb-32 md:pb-8 relative animate-fade-in">
        <div className="hidden md:flex justify-between items-center mb-6">
          <button onClick={goBack} className="group flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition">
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition"><IconChevronLeft size={24} /></div>
            <span className="font-bold text-gray-900 group-hover:text-[#FF6B00]">ย้อนกลับ</span>
          </button>
          <button onClick={handleShare} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF6B00] transition shadow-sm"><IconShare size={20} /></button>
        </div>

        <div className="relative mb-12 mt-8 md:mt-0">
          <div className="hidden md:flex bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 min-h-[550px]">
            <div className="w-[45%] relative bg-gray-900 cursor-pointer group overflow-hidden" onClick={() => setIsLightboxOpen(true)}>
              <div className="absolute inset-0 bg-center bg-cover blur-xl opacity-50 scale-110" style={{ backgroundImage: `url(${event.image_url})` }}></div>
              <SafeImage src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-contain z-10 transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute bottom-3 right-3 bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md hover:bg-black/80 transition flex items-center justify-center border border-white/10 shadow-lg z-20"><IconMaximize size={20} /></div>
            </div>
            <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center relative">
              <div className="mb-auto">
                <span className="inline-block px-3 py-1 rounded-lg bg-orange-50 text-[#FF6B00] text-xs font-bold uppercase tracking-wider mb-3 w-fit border border-orange-100">{event.category}</span>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">{event.title}</h1>
              </div>
              <div className="space-y-6 my-6">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6B00] shadow-sm border border-orange-100 group-hover:scale-110 transition flex-shrink-0"><IconCalendar size={24} /></div>
                  <div><p className="text-gray-900 font-bold text-lg">{event.date_display || formattedDate}</p><p className="text-gray-500 text-sm">{event.time || "วันงานแสดง"}</p></div>
                </div>
                <div onClick={handleMapClick} className="flex items-start gap-4 group cursor-pointer hover:bg-blue-50 p-3 -ml-3 rounded-xl transition">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100 flex-shrink-0"><IconMapPin size={24} /></div>
                  <div><p className="text-gray-900 font-bold text-lg">{event.location}</p><p className="text-gray-500 text-sm">คลิกเพื่อดูแผนที่</p></div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 shadow-sm border border-green-100 flex-shrink-0"><IconTicket size={24} /></div>
                  <div><p className="text-gray-900 font-bold text-xl">{event.ticket_price || "Coming Soon"}</p><p className="text-gray-500 text-sm">ราคาบัตร</p></div>
                </div>
              </div>
              <div className="flex gap-3 mt-auto pt-8 border-t border-dashed border-gray-200">
                <a href={event.link || "#"} target={event.link ? "_blank" : "_self"} rel="noopener noreferrer" onClick={(e) => { if (!event.link) { e.preventDefault(); onTriggerToast("ยังไม่มีลิงก์จองบัตร"); } }} className="flex-1 bg-[#FF6B00] hover:bg-[#E65000] text-white py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex justify-center items-center gap-2 active:scale-95"><IconTicket size={24} /> จองบัตรเลย</a>
                <button onClick={addToCalendar} className="flex-1 border-2 border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-gray-700 bg-white py-4 px-6 rounded-xl font-bold text-lg transition flex justify-center items-center gap-2 active:scale-95"><IconCalendar size={24} /> เพิ่มในปฏิทิน</button>
              </div>
            </div>
          </div>

          <div className="md:hidden flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="relative h-[450px] bg-gray-900 overflow-hidden cursor-pointer group" onClick={() => setIsLightboxOpen(true)}>
              <div className="absolute inset-0 bg-center bg-cover blur-xl opacity-50 transition-transform group-hover:scale-125" style={{ backgroundImage: `url(${event.image_url})` }}></div>
              <div className="absolute inset-0 flex items-center justify-center p-6"><SafeImage src={event.image_url} alt={event.title} className="w-full h-full object-contain rounded-lg shadow-lg z-10" /></div>
              <div className="absolute top-4 left-4 z-20"><span className="inline-block px-2 py-1 rounded-lg bg-white/90 text-[#FF6B00] text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm">{event.category}</span></div>
              <div className="absolute top-4 right-4 bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md transition flex items-center justify-center border border-white/10 shadow-lg z-20"><IconMaximize size={20} /></div>
            </div>
            <div className="p-6 flex flex-col">
              <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-4">{event.title}</h1>
              <div className="space-y-4">
                <div className="flex items-start gap-3"><IconCalendar size={18} className="mt-1 text-[#FF6B00]" /><div><p className="text-gray-900 font-bold text-sm">{event.date_display || formattedDate}</p></div></div>
                <div onClick={handleMapClick} className="flex items-start gap-3 cursor-pointer active:opacity-60 transition"><IconMapPin size={18} className="mt-1 text-blue-500" /><p className="text-gray-900 font-bold text-sm underline decoration-dotted underline-offset-4 decoration-gray-300">{event.location}</p></div>
                <div className="flex items-start gap-3"><IconTicket size={18} className="mt-1 text-green-600" /><p className="text-gray-900 font-bold text-sm">{event.ticket_price || "Coming Soon"}</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          <div className="md:col-span-7 lg:col-span-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 border-l-4 border-[#FF6B00] pl-4">รายละเอียดงาน</h2>
            
            <div className="prose prose-sm md:prose-lg text-gray-600 leading-relaxed whitespace-pre-line 
              [&>p]:mb-4 
              [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-3
              [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3
              [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4
              [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4
              [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-4 [&_img]:max-w-full"
            >
              {parse(event.description || "", {
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

            {event.tags && (
              <div className="flex flex-wrap gap-2 mt-8 border-t border-gray-100 pt-6">
                {event.tags.split(",").map((tag, index) => (<span key={index} className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-sm font-medium hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] transition cursor-pointer" onClick={() => navigate(`/search?q=${tag.trim()}`)}>#{tag.trim()}</span>))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 px-4 md:hidden z-50 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-bottom">
        <button onClick={addToCalendar} className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition"><IconCalendar size={24} /></button>
        <a href={event.link || "#"} target={event.link ? "_blank" : "_self"} rel="noopener noreferrer" onClick={(e) => { if (!event.link) { e.preventDefault(); onTriggerToast("ยังไม่มีลิงก์จองบัตร"); } }} className="flex-1 bg-[#FF6B00] text-white h-12 rounded-xl font-bold text-base flex items-center justify-center shadow-lg active:scale-95 transition">จองบัตรเลย</a>
      </div>
    </>
  );
};