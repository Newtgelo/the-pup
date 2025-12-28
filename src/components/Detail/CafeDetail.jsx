import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase";
import {
  IconShare,
  IconX,
  IconChevronLeft,
  IconZoomIn,
  IconMapPin,
  IconBriefcase,
  IconClock,
  IconPhone,
  IconUsers,
  IconLayout,
} from "../icons/Icons";
import { SafeImage, NotFound } from "../ui/UIComponents";

// ✅ 1. เพิ่ม Import ตัวแปลง HTML
import parse, { domToReact } from "html-react-parser";

export const CafeDetail = ({ onTriggerToast }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otherCafes, setOtherCafes] = useState([]);
  const [activeTab, setActiveTab] = useState("general");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [showStickyTabs, setShowStickyTabs] = useState(false);

  const goBack = () => {
    if (location.state?.fromHome) {
      navigate("/#cafes-section");
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const fetchCafe = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("cafes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        setCafe(null);
      } else {
        const gallery = [
          data.image_url,
          data.gallery_image_1,
          data.gallery_image_2,
          data.gallery_image_3,
          data.gallery_image_4,
          data.gallery_image_5,
          data.gallery_image_6,
          data.gallery_image_7,
          data.gallery_image_8,
          data.gallery_image_9,
        ].filter((img) => img && img.trim() !== "");
        data.images = gallery;
        setCafe(data);
      }
      setLoading(false);
    };
    fetchCafe();
  }, [id]);

  const allImages = cafe?.images || [];
  const currentImage = allImages[selectedImageIndex] || cafe?.image_url || "";

  const handleNext = (e) => {
    e?.stopPropagation();
    if (allImages.length <= 1) return;
    setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
  };
  const handlePrev = (e) => {
    e?.stopPropagation();
    if (allImages.length <= 1) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) handleNext();
    if (distance < -50) handlePrev();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, allImages.length]);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowStickyTabs(true);
      else setShowStickyTabs(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getFacilities = () => {
    if (!cafe || !cafe.facilities) return [];
    if (Array.isArray(cafe.facilities)) return cafe.facilities;
    if (typeof cafe.facilities === "string") return cafe.facilities.split(",");
    return [];
  };
  const facilities = getFacilities();

  // ✅ 2. เพิ่มฟังก์ชัน renderRichText (Logic แปลง YouTube และ HTML)
  const renderRichText = (htmlContent) => {
    return parse(htmlContent || "", {
      replace: (domNode) => {
        // กรณี 1: iframe
        if (domNode.name === "iframe" && domNode.attribs) {
          return (
            <div className="w-full aspect-video my-8 rounded-xl overflow-hidden shadow-lg bg-black">
              <iframe {...domNode.attribs} className="w-full h-full" allowFullScreen></iframe>
            </div>
          );
        }
        // กรณี 2: Link <a>
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
        // กรณี 3: Text Link ใน <p> (แก้ปัญหาลิงก์ดิบ)
        if (domNode.name === "p" && domNode.children && domNode.children.length === 1 && domNode.children[0].type === "text") {
            const text = domNode.children[0].data.trim();
            if (text.startsWith("http") && (text.includes("youtube.com/watch") || text.includes("youtu.be"))) {
                let videoId = "";
                if (text.includes("v=")) videoId = text.split("v=")[1]?.split("&")[0];
                else if (text.includes("youtu.be/")) videoId = text.split("youtu.be/")[1]?.split("?")[0];

                if (videoId) {
                    return (
                        <div className="w-full aspect-video my-8 rounded-xl overflow-hidden shadow-lg bg-black">
                            <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen frameBorder="0"></iframe>
                        </div>
                    );
                }
            }
        }
      },
    });
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        กำลังโหลดคาเฟ่...
      </div>
    );
  if (!cafe)
    return <NotFound title="ไม่พบคาเฟ่ดังกล่าว" onBack={() => navigate("/")} />;

  const handleBooking = () => onTriggerToast("เปิดฟอร์มติดต่อเช่าสถานที่...");
  const handleMap = () => {
    if (cafe.map_link) window.open(cafe.map_link, "_blank");
    else if (cafe.lat && cafe.lng)
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`,
        "_blank"
      );
    else onTriggerToast("ไม่พบลิงก์แผนที่");
  };
  const handleCall = () => {
    if (cafe.phone) window.location.href = `tel:${cafe.phone}`;
    else onTriggerToast("ไม่มีเบอร์โทรศัพท์");
  };
  const handleShare = async () => {
    const shareData = { title: cafe.name, url: window.location.href };
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

  return (
    <>
      <div
        className={`fixed top-16 md:top-20 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40 shadow-sm transition-transform duration-300 ${
          showStickyTabs ? "translate-y-0" : "-translate-y-[200%]"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={goBack}
              className="md:hidden flex-shrink-0 text-gray-500 hover:text-[#FF6B00]"
            >
              <IconChevronLeft size={24} />
            </button>
            <h3 className="font-bold text-gray-900 truncate leading-tight flex-1">
              {cafe.name}
            </h3>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
            <button
              onClick={() => {
                setActiveTab("general");
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all ${
                activeTab === "general"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ลูกค้า
            </button>
            <button
              onClick={() => {
                setActiveTab("venue");
                window.scrollTo({ top: 400, behavior: "smooth" });
              }}
              className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-1 ${
                activeTab === "venue"
                  ? "bg-blue-950 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <IconBriefcase size={14} /> ผู้จัด
            </button>
          </div>
        </div>
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-[#FF6B00] transition z-50 p-2"
          >
            <IconX size={32} />
          </button>
          <button
            onClick={handlePrev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center text-white transition z-50"
          >
            <IconChevronLeft size={32} />
          </button>
          <div
            className="relative w-full max-w-5xl h-full flex items-center justify-center px-2 md:px-16"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <SafeImage
              src={currentImage}
              alt="Full View"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
            />
          </div>
          <button
            onClick={handleNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full items-center justify-center text-white transition z-50"
          >
            <div className="rotate-180">
              <IconChevronLeft size={32} />
            </div>
          </button>
          {allImages.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/90 bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}

      <div
        className={`md:hidden fixed top-[80px] left-0 right-0 px-4 z-40 flex justify-between pointer-events-none transition-all duration-300 ${
          showStickyTabs
            ? "opacity-0 pointer-events-none -translate-y-20"
            : "opacity-100 translate-y-0"
        }`}
      >
        <button
          onClick={goBack}
          className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"
        >
          <IconChevronLeft size={24} />
        </button>
        <button
          onClick={handleShare}
          className="pointer-events-auto w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center text-gray-700 hover:text-[#FF6B00] transition active:scale-90"
        >
          <IconShare size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 relative animate-fade-in">
        <div className="hidden md:flex justify-between items-center mb-6">
          <button
            onClick={goBack}
            className="group flex items-center gap-2 text-gray-500 hover:text-[#FF6B00] transition"
          >
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition">
              <IconChevronLeft size={24} />
            </div>
            <span className="font-bold text-gray-900 group-hover:text-[#FF6B00]">
              ย้อนกลับ
            </span>
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-[#FF6B00] transition shadow-sm"
          >
            <IconShare size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 mt-8 md:mt-0">
          <div>
            <div
              className="rounded-2xl overflow-hidden shadow-md mb-3 h-[300px] md:h-[400px] bg-gray-100 relative group cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            >
              <SafeImage
                src={currentImage}
                alt={cafe.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition flex items-center justify-center">
                <IconZoomIn size={16} color="white" />
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="flex overflow-x-auto gap-2 pb-2 md:grid md:grid-cols-6 md:gap-2 md:pb-0 scrollbar-hide snap-x">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 snap-start w-24 aspect-square md:w-auto rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImageIndex === idx
                        ? "border-[#FF6B00] scale-95 ring-2 ring-[#FF6B00]/30"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`gallery-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {cafe.name}
              </h1>
              <div className="flex items-center text-gray-500 text-sm">
                <IconMapPin size={16} className="mr-1" />{" "}
                {cafe.location_text || "ไม่ระบุสถานที่"}
              </div>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                  activeTab === "general"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                สำหรับลูกค้า
              </button>
              <button
                onClick={() => setActiveTab("venue")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "venue"
                    ? "bg-blue-950 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <IconBriefcase size={16} /> สำหรับผู้จัด
              </button>
            </div>

            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                  <div className="flex gap-4 items-start">
                    <IconClock className="text-gray-400 mt-1" />
                    <div>
                      <p className="font-bold text-sm">เวลาทำการ</p>
                      <p className="text-sm whitespace-pre-line text-gray-600">
                        {cafe.open_time || "โปรดสอบถามข้อมูลจากทางร้าน"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">
                      🏷️
                    </div>
                    <div>
                      <p className="font-bold text-sm">ราคาเฉลี่ย</p>
                      <p className="text-sm text-[#FF6B00] font-bold">
                        {cafe.price_range || "~100 - 250 บาท"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex gap-3">
                  <button
                    onClick={handleMap}
                    className="flex-1 bg-[#FF6B00] hover:bg-[#E65000] text-white py-3 rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-md active:scale-95"
                  >
                    <IconMapPin size={18} /> ดูแผนที่
                  </button>
                  <button
                    onClick={handleCall}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition flex justify-center items-center gap-2 active:scale-95"
                  >
                    <IconPhone size={18} /> โทร
                  </button>
                </div>
              </div>
            )}

            {activeTab === "venue" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-6 bg-blue-950 rounded-full"></span>
                    <h3 className="font-bold text-lg text-gray-900">
                      ข้อมูลสถานที่จัดงาน
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <IconUsers size={12} /> ความจุ
                      </div>
                      <div className="font-bold text-gray-900">
                        {cafe.capacity || "สอบถามร้าน"}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-blue-100">
                      <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <IconLayout size={12} /> พื้นที่
                      </div>
                      <div className="font-bold text-gray-900">
                        {cafe.area_type || "Indoor / Outdoor"}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-2 text-gray-700">
                      สิ่งอำนวยความสะดวก
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {facilities.length > 0 ? (
                        facilities.map((fac, i) => (
                          <span
                            key={i}
                            className="text-xs bg-white border border-blue-100 px-3 py-1.5 rounded-full text-gray-600"
                          >
                            {fac.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">
                          - ไม่มีข้อมูล -
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex gap-3">
                  <button
                    onClick={handleMap}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition flex justify-center items-center gap-2 active:scale-95"
                  >
                    <IconMapPin size={18} /> ดูแผนที่
                  </button>
                  <button
                    onClick={handleBooking}
                    className="flex-1 bg-[#1E293B] hover:bg-black text-white py-3 rounded-xl font-bold transition flex justify-center items-center gap-2 shadow-md active:scale-95"
                  >
                    <IconBriefcase size={18} /> สนใจจัดงานที่นี่
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 border-t border-gray-100 pt-10">
          <div className="lg:col-span-7">
            <h2
              className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
                activeTab === "venue" ? "text-[#1E293B]" : "text-gray-900"
              }`}
            >
              {activeTab === "general"
                ? "📝 รายละเอียดและบรรยากาศร้าน"
                : "🏢 รายละเอียดพื้นที่และกฎระเบียบ"}
            </h2>
            {/* ✅ 3. ใช้ renderRichText ในจุดนี้ โดยคง Class เดิมไว้ครบถ้วน */}
            <div className="prose prose-lg text-gray-600 leading-relaxed whitespace-pre-line mb-8">
              {activeTab === "venue"
                ? (cafe.organizer_description || cafe.description ? renderRichText(cafe.organizer_description || cafe.description) : "ยังไม่มีรายละเอียดเพิ่มเติม")
                : (cafe.description ? renderRichText(cafe.description) : "ยังไม่มีรายละเอียดเพิ่มเติม")}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-gray-200">
          <h3 className="text-xl font-bold mb-6 text-gray-900">
            คาเฟ่แนะนำอื่นๆ
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {otherCafes.map((c) => {
              let cImg = c.image_url;
              if (Array.isArray(c.images) && c.images.length > 0) {
                cImg = c.images[0];
              } else if (
                typeof c.images === "string" &&
                c.images.startsWith("{")
              ) {
                const parsed = c.images
                  .replace(/^{|}$/g, "")
                  .split(",")
                  .map((s) => s.replace(/"/g, ""));
                if (parsed.length > 0 && parsed[0] !== "") cImg = parsed[0];
              }
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/cafe/${c.id}`)}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition cursor-pointer group"
                >
                  <div className="h-32 md:h-40 overflow-hidden bg-gray-100">
                    <SafeImage
                      src={cImg}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#FF6B00] transition">
                      {c.name}
                    </h4>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
                      <IconMapPin size={10} />{" "}
                      {(c.location_text || "").split(",")[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 px-4 md:hidden z-50 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] safe-area-bottom">
        {activeTab === "general" ? (
          <>
            <button
              onClick={handleMap}
              className="flex-1 bg-[#FF6B00] text-white h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
            >
              <IconMapPin size={20} /> ดูแผนที่
            </button>
            <button
              onClick={handleCall}
              className="flex-1 border border-gray-200 text-gray-700 bg-white h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition"
            >
              <IconPhone size={20} /> โทร
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleMap}
              className="flex-1 border border-gray-200 text-gray-700 bg-white h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition"
            >
              <IconMapPin size={20} /> ดูแผนที่
            </button>
            <button
              onClick={handleBooking}
              className="flex-[2] bg-[#1E293B] text-white h-12 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
            >
              <IconBriefcase size={20} /> สนใจจัดงาน
            </button>
          </>
        )}
      </div>
    </>
  );
};