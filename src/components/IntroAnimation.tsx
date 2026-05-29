import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [stage, setStage] = useState(0);

  // Auto transition sequence
  useEffect(() => {
    // Stage 1: Welcoming text parts fade in
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 1400);
    const t3 = setTimeout(() => setStage(3), 2200);
    // Stage 4: Doors open, showroom reveal starts
    const t4 = setTimeout(() => setStage(4), 3100);
    // Stage 5: Finish intro, enter app
    const t5 = setTimeout(() => {
      onComplete();
    }, 6500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div id="intro-screen" className="fixed inset-0 z-50 bg-[#050505] flex flex-col justify-between overflow-hidden font-display select-none">
      {/* Skip button in corner */}
      <button
        id="skip-btn"
        onClick={onComplete}
        className="absolute top-6 right-6 z-50 px-5 py-2 rounded-full border border-neutral-700 bg-neutral-900/60 hover:bg-neutral-800 hover:border-brand-gold text-xs font-bold text-white transition-all cursor-pointer tracking-wider"
      >
        SKIP INTRO
      </button>

      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:30px_30px] opacity-30 pointer-events-none" />

      {/* Welcoming typography */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        <div className="space-y-4 max-w-lg">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={stage >= 1 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-neutral-400 font-medium tracking-widest text-sm uppercase"
          >
            Welcome to
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={stage >= 2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-brand-gold/10 px-4 py-1.5 rounded-full border border-brand-gold/30 text-brand-gold text-xs font-bold tracking-widest uppercase"
          >
            <Sparkles className="w-3 lines-3 animate-spin duration-10000" />
            No. 1 in South Africa
            <Sparkles className="w-3 lines-3 animate-spin duration-10000" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={stage >= 3 ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="text-4xl sm:text-6xl font-black text-brand-red tracking-tighter leading-none"
          >
            MIT MAK <br className="sm:hidden" />
            <span className="text-white drop-shadow-[0_5px_15px_rgba(230,0,0,0.4)]">MOTORS</span>
          </motion.h1>
        </div>
      </div>

      {/* Showroom Interactive Scene */}
      <div className="relative w-full h-[45%] flex justify-center items-end bg-gradient-to-t from-neutral-950 to-transparent">
        
        {/* Shimmer/Lights reveal behind the doors */}
        <div className="absolute inset-0 w-full h-full bg-radial-gradient from-neutral-800 to-black z-0 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={stage >= 4 ? { opacity: 0.35, scale: 1 } : {}}
            transition={{ duration: 1.5 }}
            className="w-4/5 text-center text-brand-gold italic font-bold tracking-widest text-sm md:text-lg uppercase drop-shadow-[0_0_10px_rgba(197,160,89,0.3)]"
          >
            ✨ Pretoria Luxury Showroom Reveal ✨
            <div className="text-[10px] text-neutral-400 font-sans tracking-normal mt-2 not-italic font-normal">
              ESTABLISHED 1995 • TRUSTED SERVICE
            </div>
          </motion.div>

          {/* Glowing laser bars / spot lights */}
          <motion.div 
            animate={stage >= 4 ? { x: [-150, 150], opacity: [0.1, 0.4, 0.1] } : { opacity: 0 }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-10 left-1/2 w-2 h-48 bg-brand-red/40 blur-md origin-top transform rotate-45"
          />
          <motion.div 
            animate={stage >= 4 ? { x: [150, -150], opacity: [0.1, 0.4, 0.1] } : { opacity: 0 }}
            transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
            className="absolute -top-10 left-1/2 w-4 h-48 bg-brand-gold/30 blur-md origin-top transform -rotate-45"
          />
        </div>

        {/* Sliding double doors */}
        <div id="doorway" className="absolute inset-0 w-full h-full flex z-10 pointer-events-none">
          {/* Left Door */}
          <motion.div
            initial={{ x: 0 }}
            animate={stage >= 4 ? { x: "-100%" } : {}}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="w-1/2 h-full bg-neutral-900 border-r border-brand-gold/70 flex items-center justify-end pr-4 shadow-[5px_0_20px_rgba(0,0,0,0.8)]"
          >
            <div className="flex flex-col items-end opacity-60">
              <div className="w-10 h-1 bg-brand-gold/50 my-1 rounded" />
              <div className="w-5 h-1 bg-brand-gold/50 rounded" />
            </div>
          </motion.div>

          {/* Right Door */}
          <motion.div
            initial={{ x: 0 }}
            animate={stage >= 4 ? { x: "100%" } : {}}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="w-1/2 h-full bg-neutral-900 border-l border-brand-gold/70 flex items-center justify-start pl-4 shadow-[-5px_0_20px_rgba(0,0,0,0.8)]"
          >
            <div className="flex flex-col items-start opacity-60">
              <div className="w-10 h-1 bg-brand-gold/50 my-1 rounded" />
              <div className="w-5 h-1 bg-brand-gold/50 rounded" />
            </div>
          </motion.div>
        </div>

        {/* Humorous Car dealer visual character sliding in */}
        <motion.div
          id="character"
          initial={{ x: -150 }}
          animate={{ x: "min(350px, 45vw)" }}
          transition={{ type: "spring", stiffness: 45, damping: 12, delay: 0.5 }}
          className="absolute bottom-6 w-20 h-36 z-20 flex flex-col items-center select-none"
        >
          {/* Hat */}
          <div className="relative w-12 h-4 bg-white rounded-t-lg border-b-2 border-brand-red flex items-center justify-center">
            {/* hat bill / visor */}
            <div className="absolute -right-2 top-2 w-[18px] h-1.5 bg-neutral-800 rounded-r-md" />
          </div>

          {/* Head & Facial features */}
          <div className="relative w-10.5 h-11 bg-[#e0ac69] rounded-b-xl flex flex-col items-center">
            {/* Futuristic black designer sunglasses */}
            <div className="absolute top-2.5 w-9.5 h-3.5 bg-neutral-950 rounded-sm flex items-center justify-between px-1.5 z-10 shadow">
              <div className="w-3 h-2 bg-neutral-800 rounded-sm" />
              <div className="w-0.5 h-3 bg-neutral-600 self-center" />
              <div className="w-3 h-2 bg-neutral-800 rounded-sm" />
            </div>

            {/* Nose */}
            <div className="w-2.5 h-3 bg-[#cda05e] rounded-md mt-6" />

            {/* Cigar! */}
            <div className="absolute top-8.5 right-[-8px] rotate-[-8deg] flex items-center">
              <div className="w-4 h-1.5 bg-[#4e342e] rounded-l border border-[#2b1814]" />
              {/* Burning orange Tip */}
              <div className="w-1 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 animate-pulse rounded-r-sm shadow-[0_0_4px_#f97316]" />
              {/* Puffing Smoke visual */}
              <motion.div
                animate={{
                  y: [-2, -12, -22],
                  x: [0, 5, -2],
                  scale: [0.6, 1.2, 0.5],
                  opacity: [0.8, 0.9, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeOut",
                }}
                className="absolute left-[14px] top-[-6px] w-2.5 h-2.5 rounded-full bg-neutral-400/80 blur-[1px]"
              />
            </div>
          </div>

          {/* Fancy suit body with gold tie and gold pin */}
          <div className="relative w-12.5 h-16 bg-neutral-900 border border-neutral-800 rounded-md mt-0.5 flex flex-col items-center overflow-hidden">
            {/* White collar */}
            <div className="w-5 h-2 bg-white flex justify-between absolute top-0">
              <div className="w-2 h-2 bg-neutral-900 origin-top-left rotate-45" />
              <div className="w-2 h-2 bg-neutral-900 origin-top-right -rotate-45" />
            </div>
            {/* Elegant gold tie */}
            <div className="w-2 h-10 bg-brand-gold absolute top-1 flex flex-col items-center">
              <div className="w-1.5 h-1.5 bg-brand-red rounded-full mt-3" />
            </div>
            {/* Lapels */}
            <div className="absolute left-0 top-0 w-3.5 h-8 bg-neutral-800 rounded-br-lg border-r border-neutral-700" />
            <div className="absolute right-0 top-0 w-3.5 h-8 bg-neutral-800 rounded-bl-lg border-l border-neutral-700" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
