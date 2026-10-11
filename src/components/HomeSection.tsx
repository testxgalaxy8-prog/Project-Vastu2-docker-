import React from 'react';
import { PageType } from '../types';
import { InteractiveEmblem } from './InteractiveEmblem';
import { VastuRitamLogo } from './VastuRitamLogo';
import { BrandName } from './BrandName';
import { AdBanner } from './AdBanner';
import { AdContainer } from './AdContainer';
import { FolioReveal } from './FolioReveal';
import { BookOpen, PhoneCall, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, Building2, Home as HomeIcon, Award } from 'lucide-react';
import { DIRECTIONAL_ZONES } from '../data/vastuData';
import { useTheme } from '../context/ThemeContext';

interface HomeSectionProps {
  onNavigate: (page: PageType, subTab?: string) => void;
  onReplayIntro?: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ onNavigate, onReplayIntro }) => {
  const { isLight } = useTheme();

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* Hero Section: Fully responsive across mobile, tablet, and desktop */}
      <FolioReveal>
        <section className="relative overflow-hidden pt-2 sm:pt-6 md:pt-8 lg:pt-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div
            className={`rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-8 lg:p-12 border shadow-xl relative overflow-hidden bg-vastu-grid transition-colors duration-200 ${
              isLight
                ? 'bg-[#FFFAF5] border-[#EBDCD5] text-[#2A1515] shadow-[#2A1515]/5'
                : 'bg-[#1A0F0F] border-[#44262E] text-[#FFF6F7]'
            }`}
          >
            {/* Soft radial atmospheric backdrop gradient */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 sm:w-96 lg:w-[520px] h-64 sm:h-96 lg:h-[520px] bg-gradient-to-br from-[var(--color-pink-tint)] to-[#FFFAF5] opacity-50 sm:opacity-75 rounded-full blur-2xl sm:blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center relative z-10">
              {/* Left Column: Mission, Vision, and Call to Action (Responsive across mobile, tablet, desktop) */}
              <div className="md:col-span-7 space-y-4 sm:space-y-5 lg:space-y-6 text-left">
                {/* Sacred Heading Kicker */}
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-['Marcellus'] font-bold uppercase tracking-wider max-w-full ${
                      isLight
                        ? 'bg-[var(--color-pink-tint)] text-[var(--color-primary)] border border-[var(--color-border)]'
                        : 'bg-[#2A151B] text-[var(--color-primary-light)] border border-[#44262E]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0 text-[var(--color-primary)]" />
                    <span className="truncate sm:whitespace-normal">Dedicated Institution for Classical Vastu Research & Practice</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h1
                    className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl md:text-3xl lg:text-5xl font-black leading-tight sm:leading-tight break-words ${
                      isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
                    }`}
                  >
                    Towards Harmony through <br className="hidden sm:inline" />
                    <span className="text-[var(--color-primary)]">Authentic Vastu Knowledge</span>
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1">
                    <span
                      className={`text-base sm:text-xl lg:text-2xl font-['Yatra_One'] ${
                        isLight ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent-pink)]'
                      }`}
                    >
                      वास्तु रितम्
                    </span>
                    <span className="text-[#EBDCD5] dark:text-[#44262E]">|</span>
                    <span
                      className={`text-xs sm:text-sm md:text-base lg:text-lg font-['Rozha_One'] text-[var(--color-secondary)] font-bold`}
                    >
                      ॥ संतुलनात् समृद्धिः सुखम् ॥
                    </span>
                  </div>
                </div>

                <p
                  className={`font-['Marcellus'] text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl font-normal ${
                    isLight ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  <BrandName size="inherit" />{' '}
                  is an institution dedicated to the study, practice, dissemination and consultation of authentic Vastu knowledge. Rooted in classical wisdom and guided by thoughtful research, we seek to advance the understanding and application of Vastu in the design and development of harmonious living and working spaces.
                </p>

                <div
                  className={`p-3.5 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border text-xs sm:text-sm lg:text-base font-['Marcellus'] leading-relaxed shadow-xs sm:shadow-sm ${
                    isLight
                      ? 'bg-white/95 border-[var(--color-border)] text-zinc-800'
                      : 'bg-[#1C1317]/80 border-[var(--color-border)] text-zinc-100'
                  }`}
                >
                  <p>
                    Our primary collaborators include <span className="font-semibold text-[var(--color-primary)]">architects, civil engineers, interior designers, builders, developers</span> and other professionals associated with the built environment. We also serve <span className="font-semibold text-[var(--color-secondary)]">homeowners, property owners, business owners, students, teachers and researchers</span> seeking a deeper understanding of Vastu.
                  </p>
                </div>

                {/* Two High-Contrast Action Buttons: Red Primary, Green Secondary */}
                <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row md:flex-col lg:flex-row flex-wrap gap-2.5 sm:gap-3 lg:gap-4 items-stretch sm:items-center md:items-stretch lg:items-center">
                  <button
                    onClick={() => onNavigate('gyan-kosh')}
                    className="w-full sm:w-auto md:w-full lg:w-auto justify-center px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-['Marcellus'] text-xs sm:text-sm lg:text-base font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white border border-[var(--color-primary-dark)] transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer group shrink-0"
                  >
                    <BookOpen className="w-4 sm:w-5 h-4 sm:h-5 text-white group-hover:scale-110 transition-transform shrink-0" />
                    <span className="whitespace-nowrap">Explore Vastu Gyan-Kosh</span>
                  </button>

                  <button
                    onClick={() => onNavigate('contact')}
                    className="w-full sm:w-auto md:w-full lg:w-auto justify-center px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-['Marcellus'] text-xs sm:text-sm lg:text-base font-bold bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-hover)] text-white border border-[var(--color-secondary-dark)] transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer group shrink-0"
                  >
                    <PhoneCall className="w-4 sm:w-5 h-4 sm:h-5 text-white group-hover:scale-110 transition-transform shrink-0" />
                    <span className="whitespace-nowrap flex items-center">Consult <BrandName variant="badge" size="inherit" /></span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                </div>
              </div>

              {/* Right Column: Sacred Sanctuary Imagery & Emblem Visual (Tablet md:col-span-5, Desktop lg:col-span-5) */}
              <div className="md:col-span-5 flex flex-col items-center justify-center w-full mt-4 md:mt-0">
                <div
                  className={`relative w-full max-w-sm sm:max-w-md md:max-w-none lg:max-w-md mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border-2 shadow-2xl p-2.5 sm:p-3 group ${
                    isLight
                      ? 'bg-white border-white shadow-[0_12px_40px_rgba(42,21,21,0.08)]'
                      : 'bg-[#221417] border-[#44262E] shadow-black/50'
                  }`}
                >
                  {/* Temple Image */}
                  <div className="relative h-48 sm:h-60 md:h-52 lg:h-72 w-full rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 sm:mb-3 border border-[var(--color-border)] bg-stone-900">
                    <img
                      src="/hero-sanctuary.jpg"
                      alt="Vedic Temple Sanctuary Ambience"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.endsWith('/heaven-portal.jpg')) {
                          target.src = '/heaven-portal.jpg';
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-3 left-3 sm:left-4 right-3 sm:right-4 text-[#FFFAF5]">
                      <span className="text-[10px] sm:text-[11px] font-serif uppercase tracking-widest text-[var(--color-accent-orange)] block font-semibold">Vedic Architecture</span>
                      <p className="font-['Rozha_One'] text-xs sm:text-sm lg:text-base text-[#FFFAF5]">“We do not begin with remedies. We begin with understanding.”</p>
                    </div>
                  </div>

                  {/* Emblem Stamp Banner */}
                  <div
                    className={`flex items-center gap-2.5 sm:gap-3.5 p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border shadow-xs ${
                      isLight
                        ? 'bg-[var(--color-surface-soft)] border-[var(--color-border)] text-zinc-900'
                        : 'bg-[#24151B] border-[var(--color-border)] text-zinc-100'
                    }`}
                  >
                    <VastuRitamLogo variant="emblem" size={44} className="sm:w-[52px] sm:h-[52px] shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-xs sm:text-sm font-bold block truncate">
                        <BrandName size="sm" withTm={true} /> <span className="text-[var(--color-primary)] font-serif text-[10px] sm:text-xs font-bold uppercase ml-1">Identity</span>
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-serif block truncate ${
                          isLight ? 'text-zinc-600' : 'text-zinc-400'
                        }`}
                      >
                        Vedic Architectural Canons
                      </span>
                    </div>
                    <button
                      onClick={() => onNavigate('discover', 'emblem')}
                      className="text-xs font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline cursor-pointer shrink-0"
                    >
                      Inspect →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </FolioReveal>

      {/* Sponsored Partner Showcase Strip (Lazy-loaded via IntersectionObserver) */}
      <FolioReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdContainer placement="library-top" rootMargin="200px 0px" />
        </section>
      </FolioReveal>

      {/* Foundational Vedic Philosophy */}
      <FolioReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-3xl p-6 sm:p-10 lg:p-12 border-2 shadow-2xl text-center transition-colors duration-200 ${
              isLight
                ? 'bg-gradient-to-b from-white via-[var(--color-surface-soft)] to-pink-50/20 border-[var(--color-border)] text-zinc-900 shadow-zinc-900/5'
                : 'bg-gradient-to-b from-[#1C1317] via-[#24151B] to-[#161D1A] border-[var(--color-border)] text-zinc-100'
            }`}
          >
            <div className="max-w-3xl mx-auto mb-8">
              <div
                className={`flex items-center justify-center gap-2 text-xs font-serif uppercase tracking-widest font-bold ${
                  isLight ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent-pink)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-orange)]" />
                <span>Foundational Vedic Philosophy · मूल-सिद्धान्ताः</span>
              </div>
              <h2
                className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl md:text-4xl font-black mt-3 ${
                  isLight ? 'text-zinc-950' : 'text-white'
                }`}
              >
                Our Motto · ध्येयवाक्यम्
              </h2>
              <p
                className={`font-['Rozha_One'] text-xl sm:text-2xl mt-2 ${
                  isLight ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent-pink)]'
                }`}
              >
                ॥ संतुलन · समृद्धि · सौख्यम् ॥
              </p>
              <p
                className={`font-['Marcellus'] text-sm sm:text-base mt-1 font-medium ${
                  isLight ? 'text-zinc-700' : 'text-zinc-300'
                }`}
              >
                These three ideals form the foundation of every consultation, publication, and educational initiative undertaken by <BrandName size="inherit" />.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* 1. Santulan (Balance) - Green */}
              <div
                className={`rounded-2xl p-6 border-2 shadow-xl relative overflow-hidden group hover:scale-102 transition-all ${
                  isLight
                    ? 'bg-white border-[var(--color-secondary)]/40 text-zinc-900 shadow-sm'
                    : 'bg-[#15231F] border-[var(--color-secondary)]/60 text-zinc-100'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 font-['Yatra_One'] text-2xl shadow-sm ${
                    isLight
                      ? 'bg-emerald-50 border-emerald-300 text-[var(--color-secondary)]'
                      : 'bg-[#1C1317] border-[var(--color-secondary)] text-[var(--color-secondary)]'
                  }`}
                >
                  सं
                </div>
                <div
                  className={`text-xs uppercase tracking-wider font-bold ${
                    isLight ? 'text-[var(--color-secondary)]' : 'text-emerald-400'
                  }`}
                >
                  Pillar I · प्रथम सोपानम्
                </div>
                <h3
                  className={`font-['Cinzel_Decorative'] text-xl font-black mt-1 ${
                    isLight ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  संतुलन (Balance)
                </h3>
                <p
                  className={`font-['Marcellus'] text-sm sm:text-base mt-3 leading-relaxed ${
                    isLight ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  Balance forms the foundation of every space and leads to Prosperity. When elemental energies (Earth, Water, Fire, Air, Space) resonate in equilibrium, physical and psychological tension naturally subsides.
                </p>
              </div>

              {/* 2. Samriddhi (Prosperity) - Orange */}
              <div
                className={`rounded-2xl p-6 border-2 shadow-xl relative overflow-hidden group hover:scale-102 transition-all ${
                  isLight
                    ? 'bg-white border-[var(--color-accent-orange)]/40 text-zinc-900 shadow-sm'
                    : 'bg-[#241A14] border-[var(--color-accent-orange)]/60 text-zinc-100'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 font-['Yatra_One'] text-2xl shadow-sm ${
                    isLight
                      ? 'bg-orange-50 border-orange-300 text-[var(--color-accent-orange)]'
                      : 'bg-[#1C1317] border-[var(--color-accent-orange)] text-[var(--color-accent-orange)]'
                  }`}
                >
                  समृ
                </div>
                <div
                  className={`text-xs uppercase tracking-wider font-bold ${
                    isLight ? 'text-[var(--color-accent-orange)]' : 'text-amber-400'
                  }`}
                >
                  Pillar II · द्वितीय सोपानम्
                </div>
                <h3
                  className={`font-['Cinzel_Decorative'] text-xl font-black mt-1 ${
                    isLight ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  समृद्धि (Prosperity)
                </h3>
                <p
                  className={`font-['Marcellus'] text-sm sm:text-base mt-3 leading-relaxed ${
                    isLight ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  Prosperity arises when balance allows life and work to flourish and therefore nurtures Well-being. Genuine prosperity encompasses clear intellect, vocational momentum, financial stability, and joyful endeavors.
                </p>
              </div>

              {/* 3. Saukhyam (Well-Being) - Red */}
              <div
                className={`rounded-2xl p-6 border-2 shadow-xl relative overflow-hidden group hover:scale-102 transition-all ${
                  isLight
                    ? 'bg-white border-[var(--color-primary)]/40 text-zinc-900 shadow-sm'
                    : 'bg-[#24151B] border-[var(--color-primary)]/60 text-zinc-100'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 font-['Yatra_One'] text-2xl shadow-sm ${
                    isLight
                      ? 'bg-red-50 border-red-300 text-[var(--color-primary)]'
                      : 'bg-[#1C1317] border-[var(--color-primary)] text-[var(--color-primary)]'
                  }`}
                >
                  सौ
                </div>
                <div
                  className={`text-xs uppercase tracking-wider font-bold ${
                    isLight ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent-pink)]'
                  }`}
                >
                  Pillar III · तृतीय सोपानम्
                </div>
                <h3
                  className={`font-['Cinzel_Decorative'] text-xl font-black mt-1 ${
                    isLight ? 'text-zinc-950' : 'text-white'
                  }`}
                >
                  सौख्यम् (Well-Being)
                </h3>
                <p
                  className={`font-['Marcellus'] text-sm sm:text-base mt-3 leading-relaxed ${
                    isLight ? 'text-zinc-700' : 'text-zinc-300'
                  }`}
                >
                  Well-Being is the ultimate objective—a state of physical comfort, mental peace, and holistic harmony. A building should not only protect its inhabitants from the elements, but replenish their spirits daily.
                </p>
              </div>
            </div>
          </div>
        </section>
      </FolioReveal>

      {/* Interactive Emblem Section */}
      <FolioReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InteractiveEmblem />
        </section>
      </FolioReveal>

      {/* Core Philosophy Banner */}
      <FolioReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-3xl p-8 sm:p-12 border-2 shadow-2xl relative overflow-hidden transition-colors duration-200 ${
              isLight
                ? 'bg-gradient-to-br from-white via-[var(--color-surface-soft)] to-pink-50/30 border-[var(--color-border)] text-zinc-900 shadow-zinc-900/5'
                : 'bg-gradient-to-br from-[#1C1317] via-[#24151B] to-[#161D1A] border-[var(--color-border)] text-zinc-100'
            }`}
          >
            <div className="relative z-10 max-w-3xl space-y-4 text-left">
              <span
                className={`font-['Yatra_One'] text-sm tracking-widest uppercase ${
                  isLight ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent-pink)]'
                }`}
              >
                Classical Integrity vs Commercial Myths
              </span>
              <h2
                className={`font-['Rozha_One'] text-2xl sm:text-3xl md:text-4xl leading-snug ${
                  isLight ? 'text-zinc-950' : 'text-white'
                }`}
              >
                “We do not begin with remedies. <br />
                We begin with understanding.”
              </h2>
              <p
                className={`font-['Marcellus'] text-sm sm:text-base leading-relaxed ${
                  isLight ? 'text-zinc-700' : 'text-zinc-300'
                }`}
              >
                At <BrandName size="inherit" />, we believe that Vastu is a science of spatial harmony rooted in observation, experience, logic, and philosophical inquiry. It is not a collection of superstitions, fear-driven prescriptions, or one-size-fits-all remedies.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('discover', 'philosophy')}
                  className="px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-sm border border-[var(--color-primary-dark)] shadow-md transition-all cursor-pointer"
                >
                  Read Our Complete Philosophy →
                </button>
              </div>
            </div>
          </div>
        </section>
      </FolioReveal>

      {/* Bottom Consultation Banner in Terracotta & Maroon Gradient */}
      <FolioReveal>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`border-2 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-2xl transition-colors duration-200 ${
              isLight
                ? 'bg-gradient-to-r from-red-50 via-pink-50 to-orange-50 border-[var(--color-border)] text-zinc-900 shadow-zinc-900/10'
                : 'bg-gradient-to-r from-[#8E1119] via-[#C51E28] to-[#167A68] border-[var(--color-primary)] text-white'
            }`}
          >
            <div className="space-y-2">
              <h3
                className={`font-['Cinzel_Decorative'] text-xl sm:text-2xl font-black ${
                  isLight ? 'text-zinc-950' : 'text-white'
                }`}
              >
                Planning a New Project, Renovation, or Property Purchase?
              </h3>
              <p
                className={`font-['Marcellus'] text-sm sm:text-base ${
                  isLight ? 'text-zinc-700' : 'text-zinc-200'
                }`}
              >
                Consult with <BrandName size="inherit" /> for reasoned, non-destructive guidance grounded in classical texts and architectural reality.
              </p>
            </div>
            <button
              onClick={() => onNavigate('contact')}
              className="whitespace-nowrap px-7 py-3.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-serif font-bold border border-[var(--color-primary-dark)] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-white" />
              <span className="flex items-center">Consult <BrandName variant="badge" size="inherit" /></span>
            </button>
          </div>
        </section>
      </FolioReveal>
    </div>
  );
};
