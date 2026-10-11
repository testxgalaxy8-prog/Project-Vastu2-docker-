import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { BrandName } from './BrandName';

interface VastuRitamLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'emblem' | 'full' | 'horizontal';
  showText?: boolean;
  showSubtitle?: boolean;
  subtitleAlwaysVisible?: boolean;
  customLogoUrl?: string;
  withTm?: boolean;
}

/**
 * Pure SVG Vector Emblem of Vastu Ritam
 * Rendered using the exact extracted brand colors:
 * - Red (#C51E28): Sacred Lotus & Action
 * - Green (#167A68): Open Stem & Spatial Mandala Order
 * - Pink (#F472B6 / #FDF2F4): Inner Lotus Radiance & Soft Gradients
 * - Orange (#F97316): Central Brahmasthana Bindu & Illuminating Accents
 */
export const VastuRitamVectorEmblem: React.FC<{ size: number; className?: string }> = ({
  size,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Vastu Ritam Official Emblem"
    >
      <defs>
        {/* Sacred Gold / Orange Accent Gradient */}
        <linearGradient id="vrGoldRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="50%" stopColor="#C51E28" />
          <stop offset="100%" stopColor="#8E1119" />
        </linearGradient>

        {/* Lotus Petal Gradient (Red to Pink) */}
        <linearGradient id="vrLotusGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#8E1119" />
          <stop offset="45%" stopColor="#C51E28" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>

        {/* Stem Brushstroke Gradient (Green to Deep Emerald) */}
        <linearGradient id="vrStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="30%" stopColor="#167A68" />
          <stop offset="100%" stopColor="#0D493E" />
        </linearGradient>

        {/* Center Glow */}
        <radialGradient id="vrCenterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDF2F4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
        </radialGradient>
      </defs>

      {/* 1. Outer Medallion Base */}
      <circle cx="100" cy="100" r="96" fill="#FFFFFF" stroke="url(#vrGoldRingGrad)" strokeWidth="3" />
      <circle cx="100" cy="100" r="91" fill="none" stroke="#167A68" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx="100" cy="100" r="80" fill="url(#vrCenterGlow)" />

      {/* 2. Concentric Degree / Cardinal Radial Markers */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="100"
          y1="10"
          x2="100"
          y2="17"
          stroke="#C51E28"
          strokeWidth="1.5"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}

      {/* 3. The 3x3 Navakhanda Mandala Grid (Sacred Green Order) */}
      <g transform="translate(62, 62)">
        <rect x="0" y="0" width="76" height="76" rx="4" fill="#167A68" fillOpacity="0.08" stroke="#167A68" strokeWidth="1.8" />
        <line x1="25.33" y1="0" x2="25.33" y2="76" stroke="#167A68" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="50.66" y1="0" x2="50.66" y2="76" stroke="#167A68" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="0" y1="25.33" x2="76" y2="25.33" stroke="#167A68" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="0" y1="50.66" x2="76" y2="50.66" stroke="#167A68" strokeWidth="1" strokeOpacity="0.6" />

        {/* Central Brahmasthana Sacred Rhombus & Orange Bindu */}
        <polygon points="38,28 48,38 38,48 28,38" fill="#F97316" fillOpacity="0.25" stroke="#C51E28" strokeWidth="1.2" />
        <circle cx="38" cy="38" r="3.5" fill="#F97316" />
      </g>

      {/* 4. The Unfinished Stem Brushstroke Circle */}
      <path
        d="M 100,28 A 68,68 0 1,1 52,148"
        fill="none"
        stroke="url(#vrStemGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* 5. The Blooming Sacred Lotus (Padma at Ishanya) */}
      <g transform="translate(100, 36)">
        <path
          d="M 0,-18 C -7,-8 -7,4 0,8 C 7,4 7,-8 0,-18 Z"
          fill="url(#vrLotusGrad)"
          stroke="#8E1119"
          strokeWidth="0.8"
        />
        <path
          d="M 0,2 C -11,-4 -18,-11 -14,-17 C -8,-15 -2,-7 0,2 Z"
          fill="url(#vrLotusGrad)"
          stroke="#8E1119"
          strokeWidth="0.8"
        />
        <path
          d="M 0,2 C 11,-4 18,-11 14,-17 C 8,-15 2,-7 0,2 Z"
          fill="url(#vrLotusGrad)"
          stroke="#8E1119"
          strokeWidth="0.8"
        />
        <path
          d="M 0,4 C -13,1 -22,-3 -20,-7 C -15,-6 -5,0 0,4 Z"
          fill="#F472B6"
          fillOpacity="0.9"
        />
        <path
          d="M 0,4 C 13,1 22,-3 20,-7 C 15,-6 5,0 0,4 Z"
          fill="#F472B6"
          fillOpacity="0.9"
        />
        <circle cx="0" cy="4" r="3" fill="#F97316" stroke="#C51E28" strokeWidth="0.8" />
      </g>

      {/* 6. Subtle Sanskrit Axiom */}
      <text
        x="100"
        y="172"
        textAnchor="middle"
        fontFamily="'Cinzel', serif"
        fontSize="10"
        fontWeight="bold"
        letterSpacing="2"
      >
        <tspan fill="#C51E28">VASTU </tspan>
        <tspan fill="#167A68">RITAM</tspan>
      </text>
    </svg>
  );
};

export const VastuRitamLogo: React.FC<VastuRitamLogoProps> = ({
  className = '',
  size = 46,
  variant = 'horizontal',
  showText = true,
  showSubtitle = true,
  subtitleAlwaysVisible = false,
  customLogoUrl,
  withTm = true,
}) => {
  const { isLight } = useTheme();
  const { logoUrl } = useSiteSettings();
  const numSize = typeof size === 'number' ? size : parseInt(size as string, 10) || 46;

  const activeLogo = customLogoUrl || logoUrl;
  const isCustomLogoActive = Boolean(activeLogo && activeLogo !== '/trademark-logo.jpg' && activeLogo !== '/vastu-emblem-square.png');

  // Primary image paths with dynamic configured logo as top priority
  // If custom/active logo is set, try it first, and only fall back to vector emblem if it cannot load
  const imageSources = Array.from(
    new Set(
      [
        activeLogo,
        !isCustomLogoActive ? '/trademark-logo.jpg' : null,
        !isCustomLogoActive ? '/vastu-emblem-square.png' : null,
      ].filter(Boolean) as string[]
    )
  );

  const [currentSourceIndex, setCurrentSourceIndex] = useState<number>(0);
  const [allImagesFailed, setAllImagesFailed] = useState<boolean>(false);

  useEffect(() => {
    setCurrentSourceIndex(0);
    setAllImagesFailed(false);
  }, [activeLogo]);

  const handleImageError = () => {
    if (currentSourceIndex < imageSources.length - 1) {
      setCurrentSourceIndex((prev) => prev + 1);
    } else {
      setAllImagesFailed(true);
    }
  };

  const brandSize = numSize >= 48 ? 'lg' : 'md';

  // 1. Emblem Only Variant (Clean Protective Medallion)
  if (variant === 'emblem') {
    return (
      <div
        style={{ width: numSize, height: numSize }}
        className={`relative shrink-0 select-none overflow-hidden rounded-2xl sm:rounded-full bg-white shadow-md ring-2 ring-[var(--color-primary,#C51E28)] p-1 flex items-center justify-center transition-all duration-300 hover:ring-[var(--color-accent-orange,#F97316)] hover:scale-105 ${className}`}
      >
        {!allImagesFailed ? (
          <img
            src={imageSources[currentSourceIndex]}
            alt="Website Logo Emblem"
            className="max-h-full max-w-full w-auto h-auto object-contain rounded-xl sm:rounded-full"
            onError={handleImageError}
          />
        ) : (
          <VastuRitamVectorEmblem size={numSize - 4} />
        )}
      </div>
    );
  }

  // 2. Full Trademark Lockup Variant
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <div
          style={{ width: typeof size === 'number' ? size : 280 }}
          className="relative max-w-full aspect-square bg-white rounded-3xl p-3 shadow-xl ring-2 ring-[var(--color-primary,#C51E28)] flex items-center justify-center overflow-hidden"
        >
          {!allImagesFailed ? (
            <img
              src={imageSources[currentSourceIndex]}
              alt="Website Logo Full Lockup"
              className="max-h-full max-w-full w-auto h-auto object-contain rounded-2xl"
              onError={handleImageError}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              <VastuRitamVectorEmblem size={200} />
              <div className="mt-3 text-center">
                <BrandName size="lg" withTm={withTm} />
                <span className="font-['Yatra_One'] text-xs text-[var(--color-secondary,#167A68)] block mt-1">
                  ॥ वास्तु रितम् ॥
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Horizontal Header / Navbar Variant
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none min-w-0 ${className}`}>
      {/* Brand Logo Container with Aspect Ratio Preservation */}
      <div
        style={{
          height: numSize,
          maxWidth: isCustomLogoActive ? (numSize < 40 ? '110px' : '150px') : numSize,
          minWidth: numSize,
        }}
        className={`relative shrink-0 flex items-center justify-center p-0.5 transition-all duration-300 overflow-hidden ${
          isCustomLogoActive
            ? 'rounded-xl bg-white/95 shadow-xs border border-[var(--color-border,#EBDCD5)] px-1'
            : 'rounded-full bg-white shadow-sm ring-1.5 ring-[var(--color-primary,#C51E28)] group-hover:ring-[var(--color-accent-orange,#F97316)]'
        }`}
      >
        {!allImagesFailed ? (
          <img
            src={imageSources[currentSourceIndex]}
            alt="Website Logo"
            className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
            onError={handleImageError}
          />
        ) : (
          <VastuRitamVectorEmblem size={numSize - 4} />
        )}
      </div>

      {/* Typography Lockup with Canonical BrandName Component */}
      {showText && (
        <div className="flex flex-col text-left justify-center min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap leading-tight">
            <BrandName size={brandSize} withTm={withTm} />
            <span
              className={`${
                subtitleAlwaysVisible ? 'inline-block' : 'hidden xl:inline-block'
              } font-['Yatra_One',serif] text-xs sm:text-sm tracking-wide font-normal ${
                isLight ? 'text-[var(--color-secondary)] font-medium' : 'text-[var(--color-secondary-light)]'
              }`}
            >
              वास्तु रितम्
            </span>
          </div>

          {/* Subtitle */}
          {showSubtitle && (
            <div
              className={`text-[10px] 2xl:text-[11px] font-['Marcellus',serif] font-normal tracking-wider mt-0.5 truncate ${
                subtitleAlwaysVisible ? 'block' : 'hidden 2xl:block'
              } ${
                isLight ? 'text-zinc-600 font-medium' : 'text-zinc-400'
              }`}
            >
              Towards Harmony through Authentic Vastu Knowledge
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VastuRitamLogo;
