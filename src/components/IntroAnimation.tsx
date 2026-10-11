import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { BrandName } from './BrandName';
import { PageType } from '../types';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface IntroAnimationProps {
  onComplete: (targetPage?: PageType) => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const { logoUrl } = useSiteSettings();
  // Stages of the Heavenly Entry:
  // 0: Initial Cosmic Void & Golden Dawn (0ms)
  // 1: Heavenly Sanctuary Portal Appears with God-Rays (300ms)
  // 2: Sacred Golden Mandala & Emblem Ascend (900ms)
  // 3: Heavenly Proclamation & Typography Glow (1600ms)
  // 4: The Golden Gates are Ready (2400ms)
  // 5: Gates Part & Divine Light Bursts Through to Website (User click or auto at 5500ms)
  const [stage, setStage] = useState<number>(0);
  const [isEnteringHeaven, setIsEnteringHeaven] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const completedRef = useRef<boolean>(false);

  // Enter Heaven Transition: Twin golden temple gates part, divine burst of light, portal zoom
  const enterSanctuary = useCallback((targetPage: PageType = 'home') => {
    if (completedRef.current) return;
    completedRef.current = true;

    setIsEnteringHeaven(true);

    // After the celestial gates slide open and light streams into the screen (950ms), unmount
    setTimeout(() => {
      onComplete(targetPage);
    }, 950);
  }, [onComplete]);

  // Main Progression Sequence
  useEffect(() => {
    // 1. Accessibility: respects prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const reducedTimer = setTimeout(() => enterSanctuary('home'), 400);
      return () => clearTimeout(reducedTimer);
    }

    // 2. Lock body scroll during celestial entry
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 3. Staged emergence of the Heavenly Realm
    const t1 = setTimeout(() => setStage(1), 250);   // Heavenly Portal and light rays
    const t2 = setTimeout(() => setStage(2), 850);   // Mandala & Emblem
    const t3 = setTimeout(() => setStage(3), 1500);  // Sacred Typography
    const t4 = setTimeout(() => setStage(4), 2200);  // "Step into Sanctuary" button ready

    // 4. Auto-progress timer smoothly filling progress bar towards auto-entry at 5.5s
    const startTime = Date.now();
    const duration = 5200;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        enterSanctuary('home');
      }
    }, 50);

    // 5. Keyboard listener (Space / Enter / Escape to enter immediately)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        enterSanctuary('home');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [enterSanctuary]);

  return (
    <div
      role="dialog"
      aria-label="Vastu Ritam Heavenly Sanctuary Entry"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden select-none bg-[#070302]"
    >
      {/* =========================================================================
          BACKGROUND LAYER: CELESTIAL HEAVENLY VEDIC SANCTUARY PORTAL
          ========================================================================= */}
      <div
        className={`absolute inset-0 transition-transform duration-1000 ease-out ${
          isEnteringHeaven ? 'scale-125 filter blur-xs' : 'scale-100'
        }`}
      >
        {/* Real Generated High-Res Heavenly Sanctuary Image */}
        <img
          src="/heaven-portal.jpg"
          alt="Celestial Vedic Heaven Gateway"
          className={`w-full h-full object-cover object-center transition-all duration-1000 ${
            stage >= 1 ? 'opacity-90 scale-100' : 'opacity-0 scale-105'
          }`}
          onError={(e) => {
            // High-fidelity fallback to hero sanctuary if image asset is deferred
            const target = e.currentTarget;
            if (!target.src.endsWith('/hero-sanctuary.jpg')) {
              target.src = '/hero-sanctuary.jpg';
            }
          }}
        />

        {/* Ambient Heavenly Twilight Overlays & Sacred Gold Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0604] via-[#0C0604]/50 to-[#070302]/80" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0C0604]/40 to-[#050201]/95" />

        {/* Pulsating Heavenly Sun Core (Centre of Heaven) */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[850px] sm:h-[850px] rounded-full bg-gradient-to-tr from-[#F59E0B]/35 via-[#D4A72C]/25 to-[#E88A16]/20 blur-[100px] pointer-events-none transition-all duration-1000 ${
            stage >= 1 ? 'opacity-100 animate-heaven-pulse' : 'opacity-0 scale-50'
          }`}
        />

        {/* Rotating God Rays streaming from the center of Heaven */}
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${
            stage >= 1 ? 'opacity-65' : 'opacity-0'
          }`}
        >
          <div className="w-[1200px] h-[1200px] rounded-full bg-[conic-gradient(from_0deg_at_50%_50%,rgba(245,158,11,0.22)_0deg,transparent_25deg,rgba(212,167,44,0.18)_50deg,transparent_75deg,rgba(245,158,11,0.25)_100deg,transparent_130deg,rgba(234,179,8,0.2)_180deg,transparent_215deg,rgba(245,158,11,0.2)_260deg,transparent_310deg,rgba(245,158,11,0.22)_360deg)] animate-celestial-ray" />
        </div>

        {/* Ascending Golden Particles & Floating Lotus Petals */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-t from-[#D4A72C] to-white shadow-[0_0_8px_#F59E0B]"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${(i * 4.2 + (i % 3) * 2)}%`,
                bottom: `-${Math.random() * 30}px`,
                animation: `celestial-drift ${4 + (i % 5) * 1.5}s infinite linear`,
                animationDelay: `${(i * 0.28)}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* =========================================================================
          THE CELESTIAL GATES (DIVYA DVARA)
          Majestic golden temple portals that gracefully slide open to reveal the site!
          ========================================================================= */}
      {/* Left Temple Gate */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 z-20 pointer-events-none transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) flex items-center justify-end ${
          isEnteringHeaven ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="w-full h-full bg-gradient-to-r from-[#0C0604]/90 via-[#180A05]/80 to-transparent border-r border-[#D4A72C]/40 backdrop-blur-[2px] flex items-center justify-end pr-4 sm:pr-8">
          {/* Authentic Classical Temple Gate Carving Detail */}
          <div className="w-2 sm:w-3 h-48 sm:h-80 rounded-l-full bg-gradient-to-b from-[#D4A72C]/20 via-[#D4A72C]/60 to-[#D4A72C]/20 shadow-[0_0_20px_rgba(212,167,44,0.4)]" />
        </div>
      </div>

      {/* Right Temple Gate */}
      <div
        className={`absolute inset-y-0 right-0 w-1/2 z-20 pointer-events-none transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1) flex items-center justify-start ${
          isEnteringHeaven ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="w-full h-full bg-gradient-to-l from-[#0C0604]/90 via-[#180A05]/80 to-transparent border-l border-[#D4A72C]/40 backdrop-blur-[2px] flex items-center justify-start pl-4 sm:pl-8">
          <div className="w-2 sm:w-3 h-48 sm:h-80 rounded-r-full bg-gradient-to-b from-[#D4A72C]/20 via-[#D4A72C]/60 to-[#D4A72C]/20 shadow-[0_0_20px_rgba(212,167,44,0.4)]" />
        </div>
      </div>

      {/* Divine Radiant Light Burst through the Center when entering */}
      <div
        className={`absolute inset-0 z-30 pointer-events-none flex items-center justify-center transition-opacity duration-700 ${
          isEnteringHeaven ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-96 h-96 rounded-full bg-gradient-to-r from-amber-100 via-white to-amber-200 blur-2xl animate-[divine-light-burst_0.9s_ease-out_forwards]" />
      </div>

      {/* =========================================================================
          TOP UTILITY BAR (Immediate Skip)
          ========================================================================= */}
      <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-40 flex items-center gap-2.5">
        {/* Immediate Enter / Skip Button */}
        <button
          onClick={() => enterSanctuary('home')}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1A0A06]/80 hover:bg-[#2A1009] border border-[#D4A72C]/40 hover:border-[#D4A72C] text-[#E8D3A8] hover:text-white text-xs font-['Marcellus',serif] transition-all cursor-pointer backdrop-blur-md shadow-lg"
          aria-label="Skip heavenly intro and enter website"
        >
          <span>Skip to Website</span>
          <X className="w-3.5 h-3.5 text-[#D4A72C]" />
        </button>
      </div>

      {/* =========================================================================
          CENTRAL HEAVENLY COMPOSITION & SACRED TEXTUAL INVOCATION
          ========================================================================= */}
      <div
        className={`relative z-30 max-w-3xl w-full mx-auto px-6 h-full flex flex-col items-center justify-center text-center transition-all duration-800 ${
          isEnteringHeaven ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        {/* 1. SACRED MANTRA / CELESTIAL BLESSING */}
        <div
          className={`flex items-center gap-2 sm:gap-3 transition-all duration-800 ease-out mb-4 ${
            stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#D4A72C]" />
          <span className="font-['Yatra_One',serif] text-xs sm:text-sm text-[#D4A72C] tracking-[0.25em] drop-shadow-[0_0_12px_rgba(212,167,44,0.8)]">
            ॥ ॐ नमः परमपुरुषाय दिव्यवास्तुपुरुषाय नमः ॥
          </span>
          <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#D4A72C]" />
        </div>

        {/* 2. ROTATING SACRED VEDIC MANDALA & GLOWING EMBLEM MEDALLION */}
        <div
          className={`relative flex items-center justify-center my-2 sm:my-3 transition-all duration-1000 ease-out ${
            stage >= 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-6'
          }`}
        >
          {/* Subtle Outer Concentric Mandala SVG */}
          <div className="absolute w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] pointer-events-none animate-spin-slow opacity-40">
            <svg viewBox="0 0 200 200" className="w-full h-full text-[#D4A72C]">
              <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" />
              <circle cx="100" cy="100" r="82" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="100" cy="100" r="68" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 4" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <line
                  key={a}
                  x1="100"
                  y1="8"
                  x2="100"
                  y2="192"
                  stroke="currentColor"
                  strokeWidth="0.6"
                  transform={`rotate(${a} 100 100)`}
                  strokeDasharray="4 4"
                />
              ))}
            </svg>
          </div>

          {/* Golden Corona Halo */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#F59E0B]/40 via-[#D4A72C]/30 to-[#E88A16]/40 blur-xl animate-pulse" />

          {/* Sacred Medallion Disc */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FAF7F2] p-1.5 shadow-[0_0_50px_rgba(245,158,11,0.6)] ring-2 sm:ring-4 ring-[#D4A72C] flex items-center justify-center overflow-hidden">
            <img
              src={logoUrl || "/vastu-emblem-square.png"}
              alt="Vastu Ritam Sacred Emblem"
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith('/trademark-logo.jpg')) {
                  target.src = '/trademark-logo.jpg';
                } else if (!target.src.endsWith('/emblem.jpg')) {
                  target.src = '/emblem.jpg';
                }
              }}
            />
          </div>
        </div>

        {/* 3. ILLUMINATED BRAND WORDMARK (Vastu Ritam) */}
        <div
          className={`transition-all duration-800 ease-out mb-2 ${
            stage >= 3 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
          }`}
        >
          <div className="flex items-center justify-center">
            <BrandName size="hero" uppercase={true} />
          </div>
        </div>

        {/* 4. SACRED DEVANAGARI & CANONICAL PRINCIPLE */}
        <div
          className={`transition-all duration-700 ease-out space-y-2 mb-6 ${
            stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="font-['Yatra_One',serif] text-lg sm:text-2xl text-[#E8D3A8] tracking-[0.2em] flex items-center justify-center gap-3">
            <span>वास्तु</span>
            <span className="text-[var(--color-secondary-light)]">रितम्</span>
            <span className="text-white/40">·</span>
            <span className="text-base sm:text-lg text-[var(--color-accent-orange)] font-['Rozha_One']">
              ॥ संतुलनात् समृद्धिः सुखम् ॥
            </span>
          </div>

          <p className="font-['Marcellus',serif] text-xs sm:text-sm text-[#E8D3A8]/90 tracking-[0.1em] uppercase font-medium">
            Towards Harmony through Authentic Vastu Knowledge
          </p>

          <p className="font-['Rozha_One',serif] text-xs sm:text-base text-[#FDE68A] italic leading-relaxed pt-1 max-w-xl mx-auto drop-shadow-sm">
            “We do not begin with remedies. We begin with understanding.”
          </p>
        </div>

        {/* 5. THE CELESTIAL GATEWAY BUTTON: "STEP INTO THE SANCTUARY" */}
        <div
          className={`transition-all duration-700 ease-out flex flex-col items-center gap-3 ${
            stage >= 4 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          <button
            onClick={() => enterSanctuary('home')}
            className="group relative px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-['Cinzel',serif] font-black text-sm sm:text-base tracking-[0.12em] shadow-[0_0_35px_rgba(197,30,40,0.5)] hover:shadow-[0_0_50px_rgba(197,30,40,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 cursor-pointer border-2 border-[var(--color-primary-light)]"
          >
            <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
            <span>STEP INTO THE SANCTUARY</span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1.5 transition-transform" />
          </button>

          {/* Subtext with Auto-Progress indicator */}
          <div className="flex items-center gap-2 text-[11px] font-['Marcellus',serif] text-[#E8D3A8]/75">
            <span className="font-['Yatra_One'] text-[#D4A72C]">स्वर्गे प्रवेशः</span>
            <span>·</span>
            <span>Opening celestial gates in {Math.max(1, Math.ceil((100 - progress) / 20))}s</span>
          </div>

          {/* Golden Progress Bar */}
          <div className="w-48 sm:w-64 h-1 rounded-full bg-stone-900/80 border border-[#D4A72C]/30 overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-[#D4A72C] via-[#F59E0B] to-[#34D399] transition-all duration-100 ease-linear shadow-[0_0_10px_#F59E0B]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
