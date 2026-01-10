import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconX } from "../icons/Icons"; // ⚠️ เช็ค path ให้ถูกนะครับ

const MobileToast = ({ toastInfo, setToastInfo }) => {
    return (
        <AnimatePresence>
            {toastInfo && (
                <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    className="absolute bottom-28 md:bottom-32 left-4 right-4 z-[5030] bg-[#1a1a1a] text-white p-4 rounded-xl shadow-2xl flex items-center justify-between gap-3 border border-white/10"
                >
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/90">{toastInfo.message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={toastInfo.onAction} className="bg-[#FF6B00] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#e65000] active:scale-95 transition whitespace-nowrap">
                            {toastInfo.actionLabel}
                        </button>
                        <button onClick={() => setToastInfo(null)} className="text-white/40 hover:text-white p-1">
                            <IconX size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MobileToast;