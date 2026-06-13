import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Crown, Sparkles, ArrowRight } from 'lucide-react';

const Intro = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-[#11100F] text-[#FAF9F6] overflow-hidden flex flex-col justify-between p-6 sm:p-8">
      {/* Background Hero Image with Dark Gold Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/luxury_event_bg.png"
          alt="Luxury Event Backdrop"
          className="w-full h-full object-cover opacity-35 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F0F0F] via-[#0F0F0F]/80 to-[#2A2318]/50"></div>
        {/* Animated ambient light blobs */}
        <motion.div
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-stone-900/20 blur-[140px] pointer-events-none"
        />
        <motion.div
          animate={{
            x: [0, -40, 40, 0],
            y: [0, 40, -40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] rounded-full bg-amber-900/10 blur-[150px] pointer-events-none"
        />
      </div>

      {/* Top Header - Minimal Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full flex justify-between items-center z-10 pt-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-[#D4AF37]/30 rounded-lg flex items-center justify-center bg-black/40 backdrop-blur-md">
            <Crown className="text-[#D4AF37]" size={18} />
          </div>
          <span className="text-xs uppercase tracking-[0.4em] font-sans text-stone-300 font-semibold">
            Royal Purple
          </span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/25 rounded-full px-4 py-1.5 bg-[#D4AF37]/5 backdrop-blur-sm">
          Scheduling Portal v2.0
        </div>
      </motion.div>

      {/* Center Dynamic Section - Centered Layout */}
      <div className="flex-grow flex flex-col items-center justify-center z-10 max-w-4xl mx-auto w-full py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="space-y-8 text-center"
        >
          {/* Subtle Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mx-auto">
            <Sparkles size={12} className="text-[#D4AF37]" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-stone-300 font-semibold">
              High-End Orchestration Platform
            </span>
          </div>

          {/* Premium Header */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-white tracking-tight leading-[1.15]">
            Scheduling Elite Celebrations.<br />
            <span className="italic font-normal text-[#D4AF37] gold-text-clip">Seamlessly Orchestrated.</span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-stone-400 font-light leading-relaxed max-w-2xl mx-auto">
            Transform custom concepts into masterfully timed galas, corporate summits, and wedding itineraries. Plan, manage vendors, and allocate guest layouts under one premium portal.
          </p>

          {/* CTA Button */}
          <div className="pt-6 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => navigate('/login')}
                className="relative group px-12 py-5 overflow-hidden rounded-full bg-[#D4AF37] text-black active:bg-[#800020] font-sans text-sm tracking-[0.2em] uppercase font-semibold shadow-2xl transition-all duration-500"
              >
                {/* Hover visual shimmer */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-[#D4AF37]/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                <span className="flex items-center gap-3 justify-center font-bold">
                  Get Started
                  <ArrowRight size={14} className="text-[#11100F] group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Footer - Tracked Brand Tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="w-full flex flex-col sm:flex-row justify-between items-center text-[10px] uppercase tracking-[0.3em] text-stone-500 z-10 gap-2 border-t border-white/5 pt-4"
      >
        <span>&bull; LONDON &bull; MONACO &bull; NEW YORK &bull; AMALFI</span>
        <span>Royal Purple Luxury Scheduler &copy; 2026</span>
      </motion.div>
    </div>
  );
};

export default Intro;
