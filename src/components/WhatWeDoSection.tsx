import React, { useState, useEffect } from 'react';
import { ServiceType, PageType } from '../types';
import { SERVICES_DATA } from '../data/vastuData';
import { FolioReveal } from './FolioReveal';
import { Home as HomeIcon, Building2, Factory, ShoppingCart, PhoneCall, ArrowRight, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BrandName } from './BrandName';

interface WhatWeDoSectionProps {
  initialService?: ServiceType;
  onNavigate: (page: PageType, subTab?: string) => void;
}

export const WhatWeDoSection: React.FC<WhatWeDoSectionProps> = ({
  initialService = 'residential',
  onNavigate,
}) => {
  const { isLight } = useTheme();
  const [activeService, setActiveService] = useState<ServiceType>(initialService);

  useEffect(() => {
    if (initialService) {
      setActiveService(initialService);
    }
  }, [initialService]);

  const serviceTabs: { id: ServiceType; label: string; icon: React.ReactNode }[] = [
    { id: 'residential', label: 'Residential Vastu', icon: <HomeIcon className="w-4 h-4" /> },
    { id: 'commercial', label: 'Commercial Vastu', icon: <Building2 className="w-4 h-4" /> },
    { id: 'industrial', label: 'Industrial Vastu', icon: <Factory className="w-4 h-4" /> },
    { id: 'before-you-buy', label: 'Vastu Before You Buy', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'consultation', label: 'Consult Vastu Ritam', icon: <PhoneCall className="w-4 h-4" /> },
  ];

  const currentServiceData = SERVICES_DATA.find((s) => s.id === activeService);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header & Tabs */}
      <FolioReveal>
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="flex items-center justify-center gap-2 text-xs font-serif uppercase tracking-widest text-[var(--color-primary)] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-orange)]" />
            <span>Professional Consultation & Classical Guidance</span>
            <span className="opacity-60">·</span>
            <span>वास्तु परामर्शः</span>
          </div>
          <h1 className={`font-['Cinzel_Decorative'] text-3xl sm:text-4xl md:text-5xl font-black drop-shadow-md ${
            isLight ? 'text-zinc-950' : 'text-white'
          }`}>
            What We Do
          </h1>
          <p className={`font-['Marcellus'] text-base sm:text-lg leading-relaxed ${
            isLight ? 'text-zinc-700' : 'text-zinc-300'
          }`}>
            Whether you are building, buying, renovating, or planning a commercial or industrial space, <BrandName size="inherit" /> offers guidance rooted in classical principles and practical architectural understanding.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-b border-[var(--color-border)] pb-6">
          {serviceTabs.map((tab) => {
            const isActive = activeService === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'consultation') {
                    onNavigate('contact');
                  } else {
                    setActiveService(tab.id);
                  }
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer font-serif flex items-center gap-2 shadow-sm ${
                  isActive
                    ? 'bg-[var(--color-primary)] text-white font-bold scale-105 shadow-md'
                    : isLight
                    ? 'bg-white border border-[var(--color-border)] text-zinc-800 hover:bg-[var(--color-surface-soft)] hover:text-zinc-950'
                    : 'bg-[#1C1317] border border-[var(--color-border)] text-zinc-300 hover:bg-[#2A161F] hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[var(--color-secondary)]'}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </FolioReveal>

      {/* Main Service Details Display */}
      {currentServiceData && (
        <FolioReveal>
          <div className={`rounded-3xl border-2 shadow-2xl p-6 sm:p-10 md:p-12 text-left relative overflow-hidden bg-vastu-grid ${
            isLight
              ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F5EADB] border-amber-400 text-stone-900 shadow-amber-900/10'
              : 'section-teal-heritage border-[#D4A72C] text-[#FFF7ED]'
          }`}>
            {/* Subtle Manuscript Thread Holes */}
            <div className={`absolute top-6 left-6 w-3.5 h-3.5 rounded-full border-2 shadow-inner hidden md:block ${
              isLight ? 'bg-amber-100 border-amber-500' : 'bg-[#1A0F0A] border-[#D4A72C]'
            }`} />
            <div className={`absolute top-6 right-6 w-3.5 h-3.5 rounded-full border-2 shadow-inner hidden md:block ${
              isLight ? 'bg-amber-100 border-amber-500' : 'bg-[#1A0F0A] border-[#D4A72C]'
            }`} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
              <div className="lg:col-span-8 space-y-6">
                <div className="border-b-2 border-[#D4A72C]/40 pb-4">
                  <span className={`text-xs uppercase font-serif tracking-wider font-bold ${
                    isLight ? 'text-amber-800' : 'text-[#D4A72C]'
                  }`}>
                    {currentServiceData.sanskrit}
                  </span>
                  <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${
                    isLight ? 'text-stone-950' : 'text-[#FFF7ED]'
                  }`}>
                    {currentServiceData.title}
                  </h2>
                  <p className="text-sm sm:text-base font-['Rozha_One'] text-[#E88A16] mt-1">
                    {currentServiceData.tagline}
                  </p>
                </div>

                <p className={`font-['Marcellus'] text-base sm:text-lg leading-relaxed ${
                  isLight ? 'text-stone-700' : 'text-[#E8D3A8]'
                }`}>
                  {currentServiceData.intro}
                </p>

                <div>
                  <h3 className={`font-['Cinzel_Decorative'] text-lg sm:text-xl font-bold mb-3 ${
                    isLight ? 'text-stone-950' : 'text-[#FFF7ED]'
                  }`}>
                    Key Shastric Focus Areas & Deliverables:
                  </h3>
                  <div className="space-y-3">
                    {currentServiceData.focusAreas.map((area, idx) => {
                      const isEven = idx % 2 === 0;
                      return (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border-2 shadow-md font-['Marcellus'] text-sm sm:text-base transition-transform hover:scale-101 ${
                            isEven
                              ? isLight
                                ? 'bg-white text-stone-900 border-amber-300'
                                : 'bg-[#E8D3A8] text-[#2D1B14] border-[#D4A72C]'
                              : isLight
                              ? 'bg-amber-100/70 text-stone-900 border-amber-300'
                              : 'bg-[#2D1B14] text-[#FFF7ED] border-[#D4A72C]/70'
                          }`}
                        >
                          <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${isEven ? 'text-[#0F5C55]' : 'text-[#E88A16]'}`} />
                          <span className={isEven ? 'font-medium' : ''}>{area}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4 items-center">
                  <button
                    onClick={() => onNavigate('contact')}
                    className="px-6 py-3.5 rounded-xl bg-[#E88A16] hover:bg-[#D97706] text-[#2D1B14] font-serif font-bold text-sm border-2 border-[#D4A72C] shadow-xl hover:shadow-[0_0_20px_rgba(232,138,22,0.5)] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-[#2D1B14]" />
                    <span>Request Consultation for {currentServiceData.title}</span>
                  </button>

                  <button
                    onClick={() => onNavigate('gyan-kosh')}
                    className={`px-5 py-3.5 rounded-xl font-serif text-sm font-bold border-2 shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-stone-100 text-stone-900 border-amber-300'
                        : 'bg-[#6B1F1F] hover:bg-[#B94E2C] text-[#FFF7ED] border-[#D4A72C]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-[#E88A16]" />
                    <span>Browse Related Treatises in Library</span>
                  </button>
                </div>
              </div>

              {/* Right Card: Non-Destructive Methodology */}
              <div className={`lg:col-span-4 rounded-2xl p-6 border-2 shadow-2xl space-y-4 ${
                isLight ? 'bg-amber-50/90 border-amber-300 text-stone-900' : 'bg-[#E8D3A8] text-[#2D1B14] border-[#D4A72C]'
              }`}>
                <div className="flex items-center gap-2 text-[#6B1F1F] font-bold text-xs uppercase tracking-wider font-serif">
                  <Sparkles className="w-4 h-4 text-[#0F5C55]" />
                  <span>Our Consultation Ethos</span>
                </div>
                <h4 className="font-['Cinzel_Decorative'] text-lg font-black">
                  Non-Destructive & Architectural
                </h4>
                <p className={`font-['Marcellus'] text-sm leading-relaxed font-medium ${
                  isLight ? 'text-stone-700' : 'text-[#3A2318]'
                }`}>
                  We work harmoniously within structural limitations. No irrational knocking down of beams or pillars. Instead, we optimize functional room allocation, elemental frequencies (light, ventilation, color resonances), and mental clarity.
                </p>
                <div className={`p-4 rounded-xl border text-xs font-['Marcellus'] space-y-2 ${
                  isLight ? 'bg-white border-amber-200 text-stone-800' : 'bg-[#2D1B14] border-[#D4A72C] text-[#E8D3A8]'
                }`}>
                  <div className={`flex items-center gap-2 font-semibold ${isLight ? 'text-stone-900' : 'text-[#FFF7ED]'}`}>
                    <span className="w-2 h-2 rounded-full bg-[#E88A16]" />
                    <span>CAD Floor Plan Analysis</span>
                  </div>
                  <div className={`flex items-center gap-2 font-semibold ${isLight ? 'text-stone-900' : 'text-[#FFF7ED]'}`}>
                    <span className="w-2 h-2 rounded-full bg-[#0F5C55]" />
                    <span>Solar & Magnetic Orientation</span>
                  </div>
                  <div className={`flex items-center gap-2 font-semibold ${isLight ? 'text-stone-900' : 'text-[#FFF7ED]'}`}>
                    <span className="w-2 h-2 rounded-full bg-[#D4A72C]" />
                    <span>Clear, Rational Explanations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FolioReveal>
      )}

      {/* Need Guidance? Consult Tab CTA Banner */}
      <FolioReveal>
        <div className="bg-gradient-to-r from-[#1C1317] via-[#24151B] to-[#141C1A] border-2 border-[var(--color-border)] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <span className="text-xs uppercase font-serif tracking-widest text-[var(--color-accent-pink)] font-bold">
              Need Guidance? · मार्गदर्शनम्
            </span>
            <h3 className="font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black text-white">
              Consult <BrandName size="inherit" /> Today
            </h3>
            <p className="font-['Marcellus'] text-zinc-300 text-sm sm:text-base max-w-xl">
              Have a residential blueprint, office space, or prospective plot you wish to evaluate? Speak directly with our research scholar and consultation team.
            </p>
          </div>
          <button
            onClick={() => onNavigate('contact')}
            className="whitespace-nowrap px-8 py-3.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-serif font-bold text-sm sm:text-base border border-[var(--color-primary-dark)] shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
          >
            <PhoneCall className="w-5 h-5 text-white" />
            <span className="flex items-center">Consult <BrandName variant="badge" size="inherit" /></span>
          </button>
        </div>
      </FolioReveal>
    </div>
  );
};
