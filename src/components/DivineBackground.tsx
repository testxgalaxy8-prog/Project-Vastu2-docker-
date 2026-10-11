import React, { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DivineBackgroundProps {
  petalsEnabled?: boolean;
  onTogglePetals?: () => void;
}

export const DivineBackground: React.FC<DivineBackgroundProps> = ({
  petalsEnabled = true,
  onTogglePetals,
}) => {
  const { isLight } = useTheme();

  // Clear any legacy ambient audio storage flag
  useEffect(() => {
    try {
      localStorage.removeItem('vastu_ritam_ambiance_audio');
    } catch {
      // ignore
    }
  }, []);

  // Main Ambience Trigger: Controls visual petals
  const handleMainAmbianceClick = () => {
    if (onTogglePetals) {
      onTogglePetals();
    }
  };

  // Floating sacred petals in logo red (#C51E28) and forest green (#167A68)
  const petals = [
    { left: '3%', delay: '0s', duration: '14s', size: 18, color: '#C51E28', vein: '#FDF2F4' }, // Red
    { left: '11%', delay: '3.5s', duration: '17s', size: 22, color: '#167A68', vein: '#E6F4F0' }, // Green
    { left: '19%', delay: '1.2s', duration: '15s', size: 16, color: '#C51E28', vein: '#FDF2F4' }, // Red
    { left: '28%', delay: '6s', duration: '19s', size: 20, color: '#167A68', vein: '#E6F4F0' }, // Green
    { left: '38%', delay: '0.8s', duration: '14.5s', size: 24, color: '#C51E28', vein: '#FDF2F4' }, // Red
    { left: '49%', delay: '4.5s', duration: '18s', size: 17, color: '#167A68', vein: '#E6F4F0' }, // Green
    { left: '59%', delay: '2.5s', duration: '16s', size: 21, color: '#C51E28', vein: '#FDF2F4' }, // Red
    { left: '68%', delay: '7s', duration: '20s', size: 19, color: '#167A68', vein: '#E6F4F0' }, // Green
    { left: '79%', delay: '1.8s', duration: '15.5s', size: 23, color: '#C51E28', vein: '#FDF2F4' }, // Red
    { left: '89%', delay: '5.2s', duration: '18.5s', size: 18, color: '#167A68', vein: '#E6F4F0' }, // Green
    { left: '96%', delay: '2.8s', duration: '16.5s', size: 22, color: '#C51E28', vein: '#FDF2F4' }, // Red
  ];

  return (
    <>
      {/* =========================================================================
          1. DEEP BACKGROUND LAYER (z-0)
          Slow-moving Vedic Mandalas and Sacred Yantra Geometry
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Subtle Slow-Moving Vedic Mandala in Background */}
        <div className="absolute -top-40 -right-40 w-[650px] h-[650px] md:w-[850px] md:h-[850px] opacity-[0.06] select-none pointer-events-none animate-spin-slow">
          <svg viewBox="0 0 400 400" className="w-full h-full text-amber-900 fill-current">
            <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6,4" />
            <circle cx="200" cy="200" r="160" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="80" fill="none" stroke="currentColor" strokeWidth="2" />
            {[...Array(16)].map((_, i) => (
              <g key={i} transform={`rotate(${i * 22.5} 200 200)`}>
                <path d="M200,40 Q215,100 200,160 Q185,100 200,40" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="200" cy="90" r="4" fill="currentColor" />
              </g>
            ))}
            <polygon points="200,60 321,270 79,270" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <polygon points="200,340 321,130 79,130" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] md:w-[750px] md:h-[750px] opacity-[0.05] select-none pointer-events-none animate-spin-slow-reverse">
          <svg viewBox="0 0 400 400" className="w-full h-full text-amber-900 fill-current">
            <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="200" cy="200" r="140" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8,6" />
            {[...Array(12)].map((_, i) => (
              <g key={i} transform={`rotate(${i * 30} 200 200)`}>
                <path d="M200,50 C230,100 230,150 200,180 C170,150 170,100 200,50" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </g>
            ))}
            <rect x="130" y="130" width="140" height="140" fill="none" stroke="currentColor" strokeWidth="2" />
            <rect x="130" y="130" width="140" height="140" transform="rotate(45 200 200)" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* =========================================================================
          2. ATMOSPHERIC SACRED PETALS OVERLAY (z-30)
          Floats above page content (z-10) without blocking clicks (pointer-events-none)
          ========================================================================= */}
      {petalsEnabled && (
        <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none">
          {petals.map((p, idx) => (
            <div
              key={idx}
              className="absolute top-0 opacity-0"
              style={{
                left: p.left,
                animation: `float-petal ${p.duration} linear infinite`,
                animationDelay: p.delay,
              }}
            >
              <svg
                width={p.size}
                height={p.size * 1.3}
                viewBox="0 0 24 32"
                fill={p.color}
                className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.15)]"
              >
                <path d="M12,0 C18,6 24,16 22,24 C20,30 14,32 12,32 C10,32 4,30 2,24 C0,16 6,6 12,0 Z" />
                <path d="M12,4 C14,10 16,18 12,28" stroke={p.vein} strokeWidth="0.8" fill="none" opacity="0.75" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          3. AUTHENTIC RITAM AMBIENCE SHRINE WIDGET (Bottom Right Fixed z-40)
          Seamlessly integrated with root state: controls Petals Ambience
          ========================================================================= */}
      <aside
        aria-label="Ritam Ambience & Sacred Atmosphere Shrine"
        className="fixed bottom-3 right-3 sm:bottom-5 sm:right-6 pointer-events-auto z-40 max-w-[calc(100vw-24px)]"
      >
        <div
          className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all duration-300 backdrop-blur-xl shadow-xl select-none ${
            isLight
              ? 'bg-white border-[var(--color-border)] text-[#2A1515] shadow-[0_8px_25px_rgba(42,21,21,0.08)]'
              : 'bg-[#1A0F0F] border-[#44262E] text-[#FFF6F7] shadow-2xl'
          }`}
        >
          {/* Sacred Brass Diya with Flickering Flame & Incense Smoke */}
          <button
            type="button"
            onClick={handleMainAmbianceClick}
            title={petalsEnabled ? 'Pause Sacred Petals Ambience' : 'Trigger Sacred Sacred Petals Ambience'}
            className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 cursor-pointer focus:outline-none"
          >
            {/* Incense Smoke Swirls */}
            <div
              className={`absolute -top-3 left-3 w-2.5 h-7 bg-gradient-to-t from-stone-400/30 via-stone-300/15 to-transparent rounded-full filter blur-[1.5px] transition-opacity duration-500 ${
                petalsEnabled ? 'opacity-90' : 'opacity-25'
              }`}
              style={{ animation: 'incense-smoke 4.5s ease-out infinite' }}
            />
            <div
              className={`absolute -top-4 left-2 w-3 h-8 bg-gradient-to-t from-amber-400/20 via-stone-200/10 to-transparent rounded-full filter blur-[2px] transition-opacity duration-500 ${
                petalsEnabled ? 'opacity-80' : 'opacity-15'
              }`}
              style={{ animation: 'incense-smoke 6s ease-out infinite', animationDelay: '2.2s' }}
            />

            {/* Diya SVG with Green & Crimson Accents */}
            <svg viewBox="0 0 32 32" className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-sm">
              <path d="M6,22 C6,27 26,27 26,22 C26,20 6,20 6,22 Z" fill="var(--color-secondary-dark)" stroke="var(--color-secondary)" strokeWidth="1" />
              <path d="M8,22 C8,25 24,25 24,22 C24,21 8,21 8,22 Z" fill="var(--color-secondary)" />
              <ellipse cx="16" cy="21.5" rx="7" ry="2" fill="var(--color-secondary-dark)" />
              <line x1="16" y1="21.5" x2="16" y2="17" stroke="var(--color-secondary-dark)" strokeWidth="1.5" />

              {/* Flame (Crimson & Gold/Orange pulse) */}
              <path
                d="M16,10 C18,14 19,16 16,19 C13,16 14,14 16,10 Z"
                fill={petalsEnabled ? 'var(--color-primary)' : 'var(--color-primary-dark)'}
                className={petalsEnabled ? 'animate-pulse' : 'opacity-70'}
              />
              <path
                d="M16,12 C17,15 17.5,16 16,18 C14.5,16 15,15 16,12 Z"
                fill={petalsEnabled ? 'var(--color-accent-orange)' : 'var(--color-primary-light)'}
              />
            </svg>
          </button>

          {/* Ambience Text & Status Label (Clicking toggles petals) */}
          <div
            onClick={handleMainAmbianceClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleMainAmbianceClick();
              }
            }}
            title={petalsEnabled ? 'Click to pause petals' : 'Click to trigger petals'}
            className="flex flex-col text-left cursor-pointer group/title"
          >
            <span
              className={`text-[11px] sm:text-xs font-['Marcellus',serif] font-bold flex items-center gap-1.5 ${
                isLight ? 'text-[var(--color-text-heading)]' : 'text-[#FFF7ED]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block transition-colors ${
                  petalsEnabled
                    ? 'bg-[var(--color-secondary)] shadow-[0_0_8px_var(--color-secondary)] animate-ping'
                    : 'bg-stone-400'
                }`}
              />
              <span className="group-hover/title:text-[var(--color-primary)] transition-colors">Ritam Ambience</span>
            </span>

            <span
              className={`text-[9px] font-serif tracking-wider flex items-center gap-1 ${
                isLight ? 'text-[var(--color-secondary)] font-medium' : 'text-[var(--color-secondary-light)]'
              }`}
            >
              <span>{petalsEnabled ? 'Petals Active' : 'Petals Paused'}</span>
            </span>
          </div>

          {/* Petals Control Button */}
          {onTogglePetals && (
            <div
              className={`flex items-center shrink-0 pl-1 border-l ${
                isLight ? 'border-[var(--color-border)]' : 'border-[#D4A72C]/25'
              }`}
            >
              <button
                type="button"
                onClick={onTogglePetals}
                title={petalsEnabled ? 'Pause Floating Sacred Petals' : 'Trigger Floating Sacred Petals'}
                aria-label={petalsEnabled ? 'Pause Petals' : 'Enable Petals'}
                className={`p-1.5 rounded-full transition-all text-xs flex items-center justify-center cursor-pointer ${
                  petalsEnabled
                    ? isLight
                      ? 'bg-[var(--color-pink-tint)] text-[var(--color-primary)] border border-[var(--color-border)] hover:bg-[#FCE7EC]'
                      : 'bg-[#2A151B] text-[var(--color-primary-light)] border border-[#44262E]'
                    : isLight
                    ? 'bg-[#FFFAF5] text-[#5A4545] hover:text-[var(--color-primary)] hover:bg-[#FDF2F4] border border-[#EBDCD5]'
                    : 'bg-[#221417] text-[#D5C2C7] hover:text-white hover:bg-[#321B24] border border-[#44262E]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
