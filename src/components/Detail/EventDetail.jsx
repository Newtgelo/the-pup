import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  IconShare,
  IconX,
  IconMaximize,
  IconCalendar,
  IconMapPin,
  IconChevronLeft,
  IconTicket,
} from "../icons/Icons";
import { SafeImage, NotFound } from "../ui/UIComponents";
import parse, { domToReact } from "html-react-parser";
import { Helmet } from "react-helmet-async";

// ✅ Skeleton Layout
const EventDetailSkeleton = () => (
  <div className="min-h-screen bg-white animate-pulse font-sans">
    {/* Background Placeholder */}
    <div className="absolute inset-x-0 top-0 h-[550px] bg-gray-900 w-full"></div>

    {/* Content Placeholder */}
    <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 lg:pt-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left: Poster */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-sm h-[500px] bg-gray-300 rounded-2xl"></div>
        </div>
        {/* Right: Info Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 h-[400px] shadow-xl border border-gray-100"></div>
      </div>
    </div>
  </div>
);

export const EventDetail = ({ onTriggerToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // ✅ 1. State สำหรับ Sticky Header
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ✅ 2. Scroll Listener: โชว์ Sticky Bar เมื่อเลื่อนลงมาเกิน 400px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowStickyHeader(true);
      } else {
        setShowStickyHeader(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();
      if (error) setEvent(null);
      else setEvent(data);
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  if (loading) return <EventDetailSkeleton />;

  if (!event)
    return (
      <NotFound title="ไม่พบกิจกรรมดังกล่าว" onBack={() => navigate("/")} />
    );

  const handleMapClick = () => {
    if (event.map_link) {
      window.open(event.map_link, "_blank");
    } else if (event.lat && event.lng) {
      window.open(
        `https://www.google.com/maps?q=${event.lat},${event.lng}`,
        "_blank",
      );
    } else if (event.location) {
      window.open(
        `https://www.google.com/maps?q=${encodeURIComponent(event.location)}`,
        "_blank",
      );
    } else {
      onTriggerToast("ไม่พบข้อมูลแผนที่");
    }
  };

  const addToCalendar = () => {
    if (!event.date) {
      onTriggerToast("ไม่พบข้อมูลวันเวลา");
      return;
    }
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
    } catch (err) {
      console.log("Error:", err);
    }
  };

  // ✅ LOGIC ปุ่มใหม่: คำนวณสถานะปุ่ม (Smart Button)
  const getActionBtnState = () => {
    const link = event.ticket_link || event.link || "";
    const lowerLink = link.trim().toLowerCase();

    if (lowerLink === "walk_in") {
      return {
        text: "งานฟรี Walk-in",
        style:
          "bg-[#10B981] hover:bg-[#059669] text-white shadow-lg hover:shadow-xl",
        icon: <IconMapPin size={20} />,
        action: handleMapClick,
        isLink: false,
        disabled: false,
      };
    } else if (lowerLink === "closed") {
      return {
        text: "งานปิด (Private)",
        style:
          "bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-700",
        icon: <IconX size={20} />,
        action: (e) => e.preventDefault(),
        isLink: false,
        disabled: true,
      };
    } else if (link.startsWith("http")) {
      return {
        text: "ดูรายละเอียด / จอง",
        style:
          "bg-[#FF6B00] hover:bg-[#E65000] text-white shadow-lg hover:shadow-xl",
        icon: <IconTicket size={20} />,
        href: link,
        isLink: true,
        disabled: false,
      };
    } else {
      return {
        text: "รอติดตาม",
        style:
          "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200",
        icon: <IconTicket size={20} />,
        action: (e) => e.preventDefault(),
        isLink: false,
        disabled: true,
      };
    }
  };

  const btnState = getActionBtnState();

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "วันงานแสดง";

  const metaDescription = event.description
    ? event.description.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..."
    : `รายละเอียดงาน ${event.title}`;

  return (
    <>
      <Helmet>
        <title>{`${event.title} | The Popup Plan`}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:image" content={event.image_url} />
      </Helmet>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90"
          >
            <IconX size={24} />
          </button>
          <SafeImage
            src={event.image_url}
            alt="Full View"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ✅ Sticky Header (Top) */}
      <div
        className={`fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-md shadow-md px-4 py-3 flex items-center justify-between gap-4 transition-transform duration-300 ${
          showStickyHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <button
            onClick={goBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition shrink-0"
          >
            <IconChevronLeft size={20} />
          </button>
          <h3 className="font-bold text-gray-900 text-sm md:text-lg truncate">
            {event.title}
          </h3>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop Only: Show Small Booking Button */}
          <div className="hidden lg:block">
            {btnState.isLink ? (
              <a
                href={btnState.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 ${btnState.style}`}
              >
                {btnState.text}
              </a>
            ) : (
              !btnState.disabled && (
                <button
                  onClick={btnState.action}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 ${btnState.style}`}
                >
                  {btnState.text}
                </button>
              )
            )}
          </div>

          <button
            onClick={handleShare}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            <IconShare size={18} />
          </button>
        </div>
      </div>

      {/* Navbar Buttons Back and Share (Original - Absolute) */}
      {/* ซ่อนตัวนี้เมื่อ Sticky มา เพื่อลดความซ้ำซ้อน (หรือไม่ซ่อนก็ได้ แต่นี่ซ่อนให้ดูคลีน) */}
      <div
        className={`absolute top-24 left-0 right-0 z-20 p-4 max-w-7xl mx-auto flex justify-between items-start pointer-events-none transition-opacity duration-300 ${
          showStickyHeader ? "opacity-0" : "opacity-100"
        }`}
      >
        {location.state?.fromHome ? (
          <button
            onClick={goBack}
            className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 flex items-center justify-center transition active:scale-90 shadow-lg"
          >
            <IconChevronLeft size={24} />
          </button>
        ) : (
          <div></div>
        )}

        <button
          onClick={handleShare}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white hover:bg-black/70 flex items-center justify-center transition active:scale-90 shadow-lg"
        >
          <IconShare size={20} />
        </button>
      </div>

      <div className="min-h-screen bg-white pb-24 lg:pb-12 font-sans">
        {/* Background (Static) */}
        <div className="absolute inset-x-0 top-0 h-[550px] overflow-hidden bg-gray-900">
          <div
            className="absolute inset-0 bg-center bg-cover blur-sm opacity-100 scale-105"
            style={{ backgroundImage: `url(${event.image_url})` }}
          ></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 lg:pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
            {/* LEFT: POSTER */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-lg cursor-pointer group hover:scale-[1.01] transition-transform duration-300"
                onClick={() => setIsLightboxOpen(true)}
              >
                <SafeImage
                  src={event.image_url}
                  className="w-full h-auto object-contain bg-transparent"
                />
                <div className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition duration-300">
                  <IconMaximize size={18} />
                </div>
              </div>
            </div>

            {/* RIGHT: INFO CARD */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-lg border border-gray-100">
                {/* Tags */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-[#FF6B00] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                    {event.category}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl lg:text-2xl font-extrabold text-gray-900 leading-tight mb-6 break-words text-balance">
                  {event.title}
                </h1>

                {/* Info List */}
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                      <IconCalendar size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {event.date_display || formattedDate}
                      </p>
                      <p className="text-sm text-gray-500">
                        {event.time || "TBA"}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-start gap-4 cursor-pointer hover:opacity-75 transition"
                    onClick={handleMapClick}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                      <IconMapPin size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg underline decoration-dotted underline-offset-4">
                        {event.location}
                      </p>
                      <p className="text-sm text-gray-500">คลิกเพื่อดูแผนที่</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                      <IconTicket size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {event.ticket_price ||
                          "จะยืนยันให้ทราบภายหลัง หรือ สามารถดูได้จากลิงก์รายละเอียด"}
                      </p>
                      <p className="text-sm text-gray-500">ราคาบัตร</p>
                    </div>
                  </div>
                </div>

                {/* ✅ Desktop Buttons (อัปเดตใหม่) */}
                <div className="hidden lg:flex gap-4 mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={addToCalendar}
                    className="flex-1 border border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00] text-gray-700 bg-white py-3 px-6 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition"
                  >
                    <IconCalendar size={20} /> เพิ่มในปฏิทิน
                  </button>

                  {/* Smart Button */}
                  {btnState.isLink ? (
                    <a
                      href={btnState.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-1 py-3 px-6 rounded-xl font-bold flex justify-center items-center gap-2 active:scale-95 transition ${btnState.style}`}
                    >
                      {btnState.icon} {btnState.text}
                    </a>
                  ) : (
                    <button
                      onClick={btnState.action}
                      disabled={btnState.disabled}
                      className={`flex-1 py-3 px-6 rounded-xl font-bold flex justify-center items-center gap-2 transition ${btnState.disabled ? "" : "active:scale-95"} ${btnState.style}`}
                    >
                      {btnState.icon} {btnState.text}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* --- DESCRIPTION --- */}
          <div className="mt-12 lg:mt-16">
            <div className="border-l-4 border-[#FF6B00] pl-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900">รายละเอียดงาน</h2>
            </div>

            <div className="prose prose-sm md:prose-lg text-gray-600 leading-relaxed whitespace-pre-line break-words text-pretty w-full bg-white p-0 md:p-0 font-body [&>p]:mb-6 [&>h1]:font-sans [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:font-sans [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-6 [&_a]:text-[#FF6B00] [&_a]:font-bold [&_a]:no-underline hover:[&_a]:underline [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-4 [&_img]:max-w-full">
              {parse(event.description || "", {
                replace: (domNode) => {
                  if (domNode.name === "iframe" && domNode.attribs) {
                    const { style, ...iframeAttribs } = domNode.attribs;
                    return (
                      <div className="w-full aspect-video my-8 rounded-xl overflow-hidden shadow-lg bg-black">
                        <iframe
                          {...iframeAttribs}
                          className="w-full h-full"
                          allowFullScreen
                        ></iframe>
                      </div>
                    );
                  }
                  if (
                    domNode.name === "a" &&
                    domNode.attribs &&
                    domNode.attribs.href
                  ) {
                    const href = domNode.attribs.href;
                    if (
                      href.includes("youtube.com/embed") ||
                      href.includes("youtu.be") ||
                      href.includes("youtube.com/watch")
                    ) {
                      let videoId = "";
                      if (href.includes("/embed/"))
                        videoId = href.split("/embed/")[1]?.split("?")[0];
                      else if (href.includes("v="))
                        videoId = href.split("v=")[1]?.split("&")[0];
                      else if (href.includes("youtu.be/"))
                        videoId = href.split("youtu.be/")[1]?.split("?")[0];
                      if (videoId) {
                        return (
                          <div className="w-full aspect-video my-8 rounded-xl overflow-hidden shadow-lg bg-black">
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              className="w-full h-full"
                              allowFullScreen
                              frameBorder="0"
                            ></iframe>
                          </div>
                        );
                      }
                    }
                    const { style, ...linkAttribs } = domNode.attribs;
                    return (
                      <a
                        {...linkAttribs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FF6B00] hover:underline break-words font-bold"
                      >
                        {domToReact(domNode.children)}
                      </a>
                    );
                  }
                },
              })}
            </div>

            {event.tags && (
              <div className="flex flex-wrap gap-2 mt-8 border-t border-gray-100 pt-6">
                {event.tags.split(",").map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-500 text-xs font-medium hover:bg-[#FF6B00] hover:text-white hover:border-[#FF6B00] transition cursor-pointer"
                    onClick={() => navigate(`/search?q=${tag.trim()}`)}
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Mobile Sticky Bar (Bottom) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 px-4 z-50 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-bottom">
        <button
          onClick={addToCalendar}
          className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 active:scale-95 transition"
        >
          <IconCalendar size={20} />
          <span className="text-sm font-bold">เพิ่มในปฏิทิน</span>
        </button>

        {/* Smart Button Mobile */}
        {btnState.isLink ? (
          <a
            href={btnState.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 h-12 rounded-xl font-bold text-base flex items-center justify-center active:scale-95 transition ${btnState.style}`}
          >
            {btnState.text}
          </a>
        ) : (
          <button
            onClick={btnState.action}
            disabled={btnState.disabled}
            className={`flex-1 h-12 rounded-xl font-bold text-base flex items-center justify-center transition ${btnState.disabled ? "" : "active:scale-95"} ${btnState.style}`}
          >
            {btnState.text}
          </button>
        )}
      </div>
    </>
  );
};