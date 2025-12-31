import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export const ImageUploader = ({ onImageSelected, initialImage, folder = "common" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(initialImage || "");
  const [mode, setMode] = useState("upload");

  // ถ้ามีรูปเก่า (เช่น กดแก้ไขข่าว) ให้โชว์รูปนั้นทันที
  useEffect(() => {
    if (initialImage) {
      setPreview(initialImage);
    }
  }, [initialImage]);

  const handleUpload = async (event) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("กรุณาเลือกไฟล์รูปภาพ");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(filePath);
      
      const publicUrl = data.publicUrl;
      setPreview(publicUrl);
      onImageSelected(publicUrl);

    } catch (error) {
      alert("เกิดข้อผิดพลาดในการอัปโหลด: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPreview(url);
    onImageSelected(url);
  };

  return (
    <div className="space-y-4">
      {/* ✅ ปรับปรุงส่วนแสดงตัวอย่างรูป (Poster Style V2) */}
      <div className="relative w-full h-96 bg-gray-900 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center group shadow-inner">
        {preview ? (
          <>
            {/* Layer 1: พื้นหลังเบลอ (ช่วยให้รูปไม่ดูโล่งถ้าสัดส่วนไม่เต็ม) */}
            <div
                className="absolute inset-0 bg-center bg-cover scale-110 blur-xl opacity-60"
                style={{ backgroundImage: `url(${preview})` }}
            ></div>

            {/* Layer 2: รูปจริง (แนวตั้ง/แนวนอน ก็จะเห็นครบทั้งรูป ไม่โดนตัด) */}
            <img 
                src={preview} 
                alt="Preview" 
                className="relative h-full w-auto max-w-full object-contain shadow-2xl rounded-lg z-10 py-4 transition-transform duration-300 group-hover:scale-[1.02]" 
            />

            {/* Layer 3: ปุ่มลบ (Overlay) */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-20">
                <button 
                    onClick={() => { setPreview(""); onImageSelected(""); }}
                    className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-red-600 transition flex items-center gap-2 transform hover:scale-105"
                >
                    🗑️ ลบรูปภาพนี้
                </button>
            </div>
          </>
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <span className="text-5xl mb-3">🖼️</span>
            <span className="text-sm font-bold text-gray-500">ยังไม่มีรูปภาพ</span>
            <span className="text-xs mt-1 opacity-70">(รองรับทั้งแนวตั้งและแนวนอน)</span>
          </div>
        )}
        
        {/* Loading Spinner */}
        {uploading && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-30">
            <div className="flex flex-col items-center animate-pulse">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#FF6B00] mb-3"></div>
                <span className="text-[#FF6B00] text-sm font-bold tracking-wide">กำลังอัปโหลด...</span>
            </div>
          </div>
        )}
      </div>

      {/* ปุ่มสลับโหมด Upload / URL */}
      <div className="flex bg-gray-100 p-1 rounded-xl">
        <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
            ☁️ อัปโหลดไฟล์
        </button>
        <button
            type="button"
            onClick={() => setMode("url")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
            🔗 ใช้ลิงก์ (URL)
        </button>
      </div>

      {/* Input Area */}
      {mode === "upload" ? (
        <div>
           <label className="block w-full cursor-pointer bg-orange-50 hover:bg-orange-100 border-2 border-dashed border-orange-200 text-orange-600 py-4 rounded-xl text-center font-bold transition flex flex-col items-center gap-1 group">
              <span className="text-2xl group-hover:scale-110 transition">📂</span> 
              <span>คลิกเพื่อเลือกรูปจากเครื่อง</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleUpload} 
                disabled={uploading}
                className="hidden" 
              />
           </label>
           <p className="text-xs text-gray-400 mt-2 text-center">รองรับไฟล์ JPG, PNG, GIF (ขนาดแนะนำไม่เกิน 2MB)</p>
        </div>
      ) : (
        <input
          type="text"
          placeholder="วางลิงก์รูปภาพที่นี่ (https://...)"
          value={preview}
          onChange={handleUrlChange}
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF6B00] outline-none transition shadow-sm"
        />
      )}
    </div>
  );
};