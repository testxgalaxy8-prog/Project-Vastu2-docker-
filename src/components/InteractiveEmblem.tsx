import React, { useState } from 'react';
import { EMBLEM_EXPLANATIONS } from '../data/vastuData';
import { Sparkles, Info, CheckCircle2, Compass, Layers } from 'lucide-react';
import { BrandName } from './BrandName';
import { useTheme } from '../context/ThemeContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface InteractiveEmblemProps {
  initialActiveId?: string;
}

export const InteractiveEmblem: React.FC<InteractiveEmblemProps> = ({ initialActiveId = 'lotus' }) => {
  const { isLight } = useTheme();
  const { logoUrl } = useSiteSettings();
  const [activeSectionId, setActiveSectionId] = useState<string>(initialActiveId);

  const activeItem = EMBLEM_EXPLANATIONS.find(item => item.id === activeSectionId) || EMBLEM_EXPLANATIONS[0];
  const emblemImageUrl = logoUrl || '/trademark-logo.jpg';

  return (
    <div
      className={`border-2 rounded-3xl p-5 sm:p-8 md:p-10 transition-colors duration-200 select-none ${
        isLight
          ? 'bg-gradient-to-br from-[#FFFDFB] via-[#FFF9F5] to-[#FDF4F5] border-[#EBDCD5] text-[#2A1515] shadow-xl shadow-stone-900/5'
          : 'bg-gradient-to-br from-[#1C1317] via-[#24151B] to-[#141C1A] border-[#44262E] text-zinc-100 shadow-2xl'
      }`}
    >
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="text-xs font-bold tracking-widest text-white uppercase bg-[var(--color-primary)] px-4 py-1.5 rounded-full border border-[var(--color-primary-dark)] shadow-md">
          Sacred Symbolism & Epistemology
        </span>
        <h3
          className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl md:text-4xl mt-3 font-black tracking-wide ${
            isLight ? 'text-[#2A1515]' : 'text-white drop-shadow-md'
          }`}
        >
          Our Emblem · Our Identity
        </h3>
        <p
          className={`font-['Marcellus'] text-sm sm:text-base mt-2 leading-relaxed ${
            isLight ? 'text-[#5A4545]' : 'text-zinc-300'
          }`}
        >
          Every element of the official <BrandName size="inherit" /> trademark emblem has been chosen with sacred purpose. Click on any section of the emblem below or use the tabs to reveal its timeless philosophical meaning.
        </p>
      </div>

      {/* Interactive Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
        {EMBLEM_EXPLANATIONS.map((section) => {
          const isActive = section.id === activeSectionId;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              className={`px-4 py-2 text-xs sm:text-sm rounded-xl transition-all cursor-pointer font-serif flex items-center gap-2 shadow-sm ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white border border-[var(--color-primary-dark)] font-bold scale-105 shadow-md shadow-red-950/20'
                  : isLight
                  ? 'bg-white border-[#EBDCD5] text-[#2A1515] hover:bg-[#FDF2F4] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 font-medium'
                  : 'bg-[#2A161F] border-[#44262E] text-zinc-300 hover:bg-[#381D29] hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-[var(--color-secondary)]'}`} />
              <span>{section.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Trademark Logo with Clickable Hotspots + Dynamic Explanation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Trademark Logo with Hotspot Overlays */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div
            className={`relative w-full max-w-[380px] sm:max-w-[440px] aspect-square rounded-3xl p-4 sm:p-5 border-2 select-none group transition-colors duration-200 ${
              isLight
                ? 'bg-white border-[#EBDCD5] shadow-[0_12px_40px_rgba(42,21,21,0.08)]'
                : 'bg-[#140E10] border-[#44262E] shadow-2xl'
            }`}
          >
            {/* The Actual Official Registered Trademark Logo Image */}
            <div
              className={`w-full h-full flex items-center justify-center p-2 rounded-2xl bg-white border ${
                isLight ? 'border-[#EBDCD5]' : 'border-[#44262E]'
              }`}
            >
              <img
                src={emblemImageUrl}
                alt="Official Registered Trademark Emblem of Vastu Ritam"
                className="w-full h-full object-contain filter contrast-105"
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

            {/* SVG Interactive Hotspot Overlay Map */}
            <svg
              viewBox="0 0 400 400"
              className="absolute inset-4 sm:inset-5 w-[calc(100%-2rem)] sm:w-[calc(100%-2.5rem)] h-[calc(100%-2rem)] sm:h-[calc(100%-2.5rem)] pointer-events-auto"
            >
              {/* Hotspot 1: The Blooming Sacred Lotus (Padma) */}
              <g
                onClick={() => setActiveSectionId('lotus')}
                className="cursor-pointer"
              >
                <circle
                  cx="200"
                  cy="75"
                  r="52"
                  fill={activeSectionId === 'lotus' ? 'rgba(232, 138, 22, 0.3)' : 'transparent'}
                  stroke={activeSectionId === 'lotus' ? '#EA580C' : 'rgba(212, 167, 44, 0.4)'}
                  strokeWidth={activeSectionId === 'lotus' ? '3' : '1.5'}
                  strokeDasharray={activeSectionId === 'lotus' ? 'none' : '4,3'}
                  className="hover:stroke-[#E88A16] hover:fill-[#E88A16]/20 transition-all"
                />
              </g>

              {/* Hotspot 2: The Unfinished Stem Brushstroke Circle */}
              <g
                onClick={() => setActiveSectionId('stem')}
                className="cursor-pointer"
              >
                <circle
                  cx="200"
                  cy="150"
                  r="125"
                  fill="none"
                  stroke={activeSectionId === 'stem' ? '#167A68' : 'transparent'}
                  strokeWidth={activeSectionId === 'stem' ? '6' : '0'}
                  className="hover:stroke-[#167A68] hover:stroke-[3px] transition-all"
                  strokeDasharray="8,6"
                />
              </g>

              {/* Hotspot 3: The 3x3 Mandala Grid */}
              <g
                onClick={() => setActiveSectionId('mandala')}
                className="cursor-pointer"
              >
                <rect
                  x="115"
                  y="65"
                  width="170"
                  height="170"
                  fill={activeSectionId === 'mandala' ? 'rgba(15, 92, 85, 0.3)' : 'transparent'}
                  stroke={activeSectionId === 'mandala' ? '#167A68' : 'rgba(22, 122, 104, 0.4)'}
                  strokeWidth={activeSectionId === 'mandala' ? '3' : '1'}
                  strokeDasharray={activeSectionId === 'mandala' ? 'none' : '5,3'}
                  className="hover:stroke-[#167A68] hover:fill-[#0F5C55]/20 transition-all"
                />
              </g>

              {/* Hotspot 4: The Seated Vastu Purusha in Center */}
              <g
                onClick={() => setActiveSectionId('purusha')}
                className="cursor-pointer"
              >
                <circle
                  cx="200"
                  cy="155"
                  r="62"
                  fill={activeSectionId === 'purusha' ? 'rgba(197, 30, 40, 0.3)' : 'transparent'}
                  stroke={activeSectionId === 'purusha' ? '#C51E28' : 'rgba(197, 30, 40, 0.4)'}
                  strokeWidth={activeSectionId === 'purusha' ? '3.5' : '1'}
                  strokeDasharray={activeSectionId === 'purusha' ? 'none' : '4,3'}
                  className="hover:stroke-[#C51E28] hover:fill-[#C51E28]/20 transition-all"
                />
              </g>

              {/* Hotspot 5: The Colours (Red & Green circle indicators) */}
              <g
                onClick={() => setActiveSectionId('colours')}
                className="cursor-pointer"
              >
                {/* Left Green Arc Marker */}
                <circle
                  cx="75"
                  cy="150"
                  r="18"
                  fill={activeSectionId === 'colours' ? 'rgba(22, 122, 104, 0.4)' : 'transparent'}
                  stroke={activeSectionId === 'colours' ? '#167A68' : 'rgba(22, 122, 104, 0.4)'}
                  strokeWidth={activeSectionId === 'colours' ? '3' : '1.5'}
                />
                {/* Right Red Arc Marker */}
                <circle
                  cx="325"
                  cy="175"
                  r="18"
                  fill={activeSectionId === 'colours' ? 'rgba(197, 30, 40, 0.4)' : 'transparent'}
                  stroke={activeSectionId === 'colours' ? '#C51E28' : 'rgba(197, 30, 40, 0.4)'}
                  strokeWidth={activeSectionId === 'colours' ? '3' : '1.5'}
                />
              </g>

              {/* Hotspot 6: The Motto & Sanskrit Typography */}
              <g
                onClick={() => setActiveSectionId('motto')}
                className="cursor-pointer"
              >
                <rect
                  x="40"
                  y="290"
                  width="320"
                  height="100"
                  rx="10"
                  fill={activeSectionId === 'motto' ? 'rgba(197, 30, 40, 0.25)' : 'transparent'}
                  stroke={activeSectionId === 'motto' ? '#C51E28' : 'rgba(197, 30, 40, 0.4)'}
                  strokeWidth={activeSectionId === 'motto' ? '2.5' : '1'}
                  strokeDasharray={activeSectionId === 'motto' ? 'none' : '4,3'}
                  className="hover:stroke-[#C51E28] hover:fill-[#C51E28]/20 transition-all"
                />
              </g>
            </svg>

            {/* Interactive hint badge */}
            <div
              className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[11px] font-serif px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap border ${
                isLight
                  ? 'bg-[#FFFAF5] text-[var(--color-primary)] border-[#EBDCD5] font-semibold'
                  : 'bg-[#2D1B14] text-[#D4A72C] border-[#D4A72C]'
              }`}
            >
              <Sparkles className="w-3 h-3 text-[var(--color-accent-orange)]" />
              <span>Click any element on the official logo to inspect</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Explanation Card */}
        <div className="lg:col-span-6">
          <div
            className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl relative overflow-hidden transition-all text-left ${
              isLight
                ? 'bg-white text-[#2A1515] border-[#EBDCD5] shadow-[0_12px_40px_rgba(42,21,21,0.08)]'
                : 'bg-[#24151B] text-zinc-100 border-[#44262E] shadow-2xl'
            }`}
          >
            {/* Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent-pink)] to-[var(--color-secondary)]" />

            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs uppercase tracking-wider font-bold text-white bg-[var(--color-primary)] px-3.5 py-1 rounded-full border border-[var(--color-primary-dark)]">
                {activeItem.badge}
              </span>
              <span
                className={`text-xs font-serif italic font-bold ${
                  isLight ? 'text-[var(--color-secondary)] font-semibold' : 'text-[var(--color-accent-pink)]'
                }`}
              >
                {activeItem.subheading}
              </span>
            </div>

            <h4
              className={`font-['Cinzel_Decorative'] text-xl sm:text-2xl font-black mb-3 flex items-center gap-2 ${
                isLight ? 'text-[#2A1515]' : 'text-white'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-[var(--color-primary)] inline-block shrink-0" />
              {activeItem.title}
            </h4>

            <div
              className={`font-['Marcellus'] leading-relaxed text-sm sm:text-base space-y-3 whitespace-pre-line border-t pt-4 font-normal ${
                isLight ? 'text-[#5A4545] border-[#EBDCD5]' : 'text-zinc-200 border-[#44262E]'
              }`}
            >
              {activeItem.explanation}
            </div>

            {/* Quick Interactive Selector Chips */}
            <div className={`mt-6 pt-4 border-t ${isLight ? 'border-[#EBDCD5]' : 'border-[#44262E]'}`}>
              <span
                className={`text-xs block mb-2 font-serif font-bold ${
                  isLight ? 'text-[#2A1515]' : 'text-zinc-300'
                }`}
              >
                Quickly explore other emblem dimensions:
              </span>
              <div className="flex flex-wrap gap-2">
                {EMBLEM_EXPLANATIONS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSectionId(item.id)}
                    className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer font-serif ${
                      item.id === activeSectionId
                        ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary-dark)] font-bold shadow-md'
                        : isLight
                        ? 'bg-[#FFF8F3] text-[#2A1515] border-[#EBDCD5] hover:bg-[#FDF2F4] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 font-medium'
                        : 'bg-[#1C1317] text-zinc-300 border-[#44262E] hover:bg-[#2A161F] hover:text-white'
                    }`}
                  >
                    {item.title.split(' ')[0]} {item.title.split(' ')[1] || ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

