import React, { useState, useEffect } from 'react';
import { DiscoverTab } from '../types';
import { InteractiveEmblem } from './InteractiveEmblem';
import { FolioReveal } from './FolioReveal';
import { FOUNDER_INFO, PHILOSOPHY_PRINCIPLES, COLLABORATORS_DATA } from '../data/vastuData';
import { BookOpen, CheckCircle, Shield, Award, Sparkles, GraduationCap, Compass, Users, Target, Eye } from 'lucide-react';
import { VastuRitamLogo } from './VastuRitamLogo';
import { BrandName } from './BrandName';
import { useTheme } from '../context/ThemeContext';

interface DiscoverSectionProps {
  initialTab?: DiscoverTab;
}

export const DiscoverSection: React.FC<DiscoverSectionProps> = ({ initialTab = 'meaning' }) => {
  const { isLight } = useTheme();
  const [activeTab, setActiveTab] = useState<DiscoverTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const tabs: { id: DiscoverTab; label: string; sanskrit?: string }[] = [
    { id: 'meaning', label: 'The Meaning', sanskrit: 'अर्थ-विमर्शः' },
    { id: 'philosophy', label: 'Our Philosophy', sanskrit: 'दर्शनम्' },
    { id: 'why-us', label: 'Why Vastu Ritam?', sanskrit: 'किमर्थम्?' },
    { id: 'collaborators', label: 'Our Collaborators', sanskrit: 'सहयोगिनः' },
    { id: 'mission-vision', label: 'Our Mission & Vision', sanskrit: 'लक्ष्यम्' },
    { id: 'founder', label: 'Founder & Research Scholar', sanskrit: 'संस्थापकः' },
    { id: 'emblem', label: 'Our Emblem · Identity', sanskrit: 'प्रतीकम्' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Section Header */}
      <FolioReveal>
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-serif uppercase tracking-widest text-[var(--color-accent-orange)] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-orange)]" />
            <span>The Institution & Foundations · संस्था-परिचयः</span>
          </div>
          <h1 className={`font-['Cinzel_Decorative'] text-3xl sm:text-4xl md:text-5xl font-black drop-shadow-md ${
            isLight ? 'text-[var(--color-text-heading)]' : 'text-zinc-100'
          }`}>
            Discover <BrandName size="inherit" />
          </h1>
          <p className={`font-['Marcellus'] text-sm sm:text-base leading-relaxed ${
            isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]'
          }`}>
            Rooted in classical wisdom, guided by thoughtful research, and committed to advancing the harmonious design of living and working spaces.
          </p>
        </div>

        {/* Heritage Colored Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-b-2 border-[#D4A72C]/40 pb-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer font-serif flex items-center gap-2 shadow-md ${
                  isActive
                    ? 'bg-[#E88A16] text-[#2D1B14] border-2 border-[#6B1F1F] font-black scale-105 shadow-[0_0_15px_rgba(232,138,22,0.4)]'
                    : isLight
                    ? 'bg-white border-2 border-[var(--color-border)] text-[var(--color-text-heading)] hover:bg-[var(--color-pink-tint)] hover:text-stone-950'
                    : 'bg-[#2D1B14] border-2 border-[#D4A72C]/60 text-[#E8D3A8] hover:bg-[#6B1F1F] hover:text-[#FFF7ED]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#6B1F1F]' : 'bg-[#D4A72C]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </FolioReveal>

      {/* Content Area: Theme-Aware Heritage Container */}
      <FolioReveal>
        <div
          className={`rounded-3xl border-2 shadow-2xl p-6 sm:p-10 md:p-12 transition-all bg-mandala-pattern ${
            isLight
              ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F5EADB] border-[var(--color-border)] text-[var(--color-text-heading)] shadow-amber-900/10'
              : 'section-hero-maroon border-[#D4A72C] text-[#FFF7ED]'
          }`}
        >
        
        {/* Tab 1: The Meaning */}
        {activeTab === 'meaning' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-left">
            <div className="border-b-2 border-[#D4A72C]/40 pb-5">
              <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                Etymology & Concept
              </span>
              <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-stone-950' : 'text-[#FFF7ED]'}`}>
                The Meaning: Vastu (वास्तु) & Ritam (रितम्)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vastu Definition: Sand Card */}
              <div className="bg-[#E8D3A8] text-[#2D1B14] rounded-2xl p-6 sm:p-8 border-2 border-[#D4A72C] shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-['Yatra_One'] text-[#0F5C55]">वास्तु</span>
                  <span className="text-[#6B1F1F] font-bold">|</span>
                  <h3 className="font-['Cinzel_Decorative'] text-xl font-black text-[#2D1B14]">Vastu</h3>
                </div>
                <p className="font-['Marcellus'] text-[#3A2318] text-base leading-relaxed">
                  The word <strong className="text-[#6B1F1F] font-bold">Vastu (वास्तु)</strong> refers to the science of harmonious living spaces. It explores the relationship between human life, nature, the built environment, and the principles that govern their balance. Derived from the Sanskrit root <span className="italic text-[#0F5C55] font-bold">vas</span> (to dwell or reside), it encompasses the soil, the building envelope, the air, and the celestial rhythms that cradle human existence.
                </p>
              </div>

              {/* Ritam Definition: Deep Teal Card */}
              <div className="bg-[#0F5C55] text-[#FFF7ED] rounded-2xl p-6 sm:p-8 border-2 border-[#D4A72C] shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl font-['Yatra_One'] text-[#E88A16]">रितम्</span>
                  <span className="text-[#D4A72C]">|</span>
                  <h3 className="font-['Cinzel_Decorative'] text-xl font-black text-[#FFF7ED]">Ritam</h3>
                </div>
                <p className="font-['Marcellus'] text-[#E8D3A8] text-base leading-relaxed">
                  <strong className="text-[#FDE68A] font-bold">Ritam (रितम्)</strong> is an ancient Vedic concept signifying the universal order that sustains creation. It represents the natural rhythm through which the cosmos maintains balance, harmony, and truth. Unlike arbitrary rules, <em>Ritam</em> is the cosmic law that governs the rising of the sun, the change of seasons, the flow of waters, and the moral order of existence.
                </p>
              </div>
            </div>

            {/* Synthesis: Brand Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[var(--color-primary)] text-white border-2 border-[var(--color-primary-dark)] shadow-xl">
              <h4 className="font-['Cinzel_Decorative'] text-xl font-black text-white mb-2">
                The Synthesis: <BrandName size="inherit" />
              </h4>
              <p className="font-['Marcellus'] text-white text-base sm:text-lg leading-relaxed">
                Together, <BrandName size="inherit" /> embodies the pursuit of understanding, applying, and advancing Vastu in alignment with this eternal order. It reflects a commitment to preserving classical wisdom while continually seeking deeper knowledge through study, research, and thoughtful practice.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Our Philosophy */}
        {activeTab === 'philosophy' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-left">
            <div className="border-b-2 border-[var(--color-border)] pb-5">
              <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-[var(--color-primary)]' : 'text-[var(--color-accent-orange)]'}`}>
                Guiding Creed
              </span>
              <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-[var(--color-text-heading)]' : 'text-zinc-100'}`}>
                Our Philosophy
              </h2>
            </div>

            {/* Central Pillar Quote in Brand Accent */}
            <div className="bg-[var(--color-surface-soft)] rounded-2xl p-6 sm:p-8 border-2 border-[var(--color-primary)] text-[var(--color-text)] shadow-xl">
              <blockquote className="font-['Rozha_One'] text-2xl sm:text-3xl text-[var(--color-primary)] mb-3 font-bold">
                “We do not begin with remedies. We begin with understanding.”
              </blockquote>
              <p className="font-['Marcellus'] text-[var(--color-text)] text-base sm:text-lg leading-relaxed font-medium">
                At <BrandName size="inherit" />, we believe that Vastu is a science of spatial harmony rooted in observation, experience, logic, and philosophical inquiry. It is not a collection of superstitions, fear-driven prescriptions, or one-size-fits-all remedies. True understanding of Vastu comes not from memorising rules, but from understanding the principles that govern the relationship between space, nature, and human life.
              </p>
            </div>

            {/* Three Foundational Principles: Alternating Sand, Teal, Terracotta */}
            <div>
              <h3 className={`font-['Cinzel_Decorative'] text-xl font-black mb-4 ${isLight ? 'text-stone-950' : 'text-[#FFF7ED]'}`}>
                Our Approach is Founded on Three Principles:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PHILOSOPHY_PRINCIPLES.map((principle, idx) => {
                  const cardStyles = [
                    'bg-[#E8D3A8] text-[#2D1B14]',
                    'bg-[#0F5C55] text-[#FFF7ED]',
                    'bg-[#B94E2C] text-[#FFF7ED]',
                  ];
                  const currentStyle = cardStyles[idx % cardStyles.length];
                  const isSand = currentStyle.includes('#E8D3A8');

                  return (
                    <div
                      key={principle.number}
                      className={`rounded-2xl p-6 border-2 border-[#D4A72C] shadow-xl hover:scale-102 transition-transform ${currentStyle}`}
                    >
                      <div className={`text-2xl font-serif font-black mb-2 ${isSand ? 'text-[#6B1F1F]' : 'text-[#D4A72C]'}`}>
                        {principle.number}
                      </div>
                      <div className={`text-xs font-serif font-bold mb-1 ${isSand ? 'text-[#0F5C55]' : 'text-[#FDE68A]'}`}>
                        {principle.sanskrit}
                      </div>
                      <h4 className="font-['Cinzel_Decorative'] text-lg font-black mb-3">
                        {principle.title}
                      </h4>
                      <p className={`font-['Marcellus'] text-sm sm:text-base leading-relaxed ${isSand ? 'text-[#3A2318]' : 'text-[#FFF7ED]'}`}>
                        {principle.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Empowerment Message */}
            <div className={`p-6 rounded-2xl border-2 shadow-sm ${
              isLight ? 'bg-[var(--color-pink-tint)]/70 border-[var(--color-border)] text-[var(--color-text-heading)]' : 'bg-[#2D1B14] border-[#D4A72C] text-[#E8D3A8]'
            }`}>
              <p className="font-['Marcellus'] text-base leading-relaxed">
                We believe that Vastu should empower people through understanding rather than dependence. Our objective is not merely to recommend changes to a building, but to cultivate a deeper appreciation of the principles that shape harmonious spaces. <strong className={isLight ? 'text-stone-950 font-bold' : 'text-[#FFF7ED] font-bold'}>When the principles are understood, the recommendations become self-evident.</strong>
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Why Vastu Ritam? */}
        {activeTab === 'why-us' && (
          <div className="space-y-6 animate-in fade-in duration-200 text-left">
            <div className="border-b-2 border-[#D4A72C]/40 pb-5">
              <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                The Need of the Hour
              </span>
              <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-[var(--color-text-heading)]' : 'text-zinc-100'}`}>
                Why <BrandName size="inherit" />?
              </h2>
            </div>

            <div className={`space-y-4 font-['Marcellus'] text-base sm:text-lg leading-relaxed ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
              <p>
                Today, information about Vastu is more accessible than ever before, yet genuine understanding often remains fragmented. Classical principles, modern interpretations, practical experiences, and popular advice frequently exist side by side, making it difficult for students, professionals, and homeowners to distinguish enduring principles from temporary trends.
              </p>

              <div className="p-5 rounded-2xl bg-[var(--color-surface-soft)] border-2 border-[var(--color-primary)] font-serif text-[var(--color-text)] font-black text-lg shadow-xl">
                <BrandName size="inherit" /> was established to bridge this gap.
              </div>

              <p>
                Our purpose is to create a structured, authentic, and intellectually honest institution for the study and application of Vastu—one that preserves classical wisdom, encourages research and thoughtful inquiry, and presents knowledge in a form that is relevant to contemporary architecture, construction, and living.
              </p>

              <p>
                We believe that Vastu deserves the same seriousness that is accorded to any enduring body of knowledge: careful study, respectful interpretation, open dialogue, and responsible application.
              </p>

              <p>
                Consultation is therefore only one aspect of our work; the larger mission is to build a trusted repository of knowledge for architects, engineers, designers, builders, students, researchers, and all those seeking a deeper understanding of harmonious spaces.
              </p>

              <div className="p-6 rounded-2xl bg-[var(--color-secondary)] text-white border-2 border-[var(--color-secondary-dark)] shadow-2xl">
                <p className="font-['Rozha_One'] text-lg sm:text-xl text-white">
                  “<BrandName size="inherit" /> exists not because Vastu lacks relevance, but because authentic understanding deserves a home where tradition, research, and practical wisdom can meet.”
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Our Collaborators */}
        {activeTab === 'collaborators' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-left">
            <div className="border-b-2 border-[#D4A72C]/40 pb-5">
              <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                Ecosystem of Practice
              </span>
              <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-stone-950' : 'text-[#FFF7ED]'}`}>
                Our Collaborators
              </h2>
              <p className={`font-['Marcellus'] text-sm sm:text-base mt-1 ${isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]'}`}>
                We work side-by-side with multidisciplinary experts to ensure Vastu principles enhance modern structural, environmental, and residential goals.
              </p>
            </div>

            <div className="space-y-8">
              {COLLABORATORS_DATA.map((collabGroup, idx) => (
                <div key={idx} className={`rounded-2xl p-6 sm:p-8 border-2 shadow-xl ${
                  isLight ? 'bg-white border-[var(--color-border)] text-[var(--color-text-heading)]' : 'bg-[#2D1B14] border-[#D4A72C] text-[#FFF7ED]'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase font-serif font-bold text-[#2D1B14] tracking-wider bg-[#E88A16] px-3 py-0.5 rounded border border-[#D4A72C]">
                      {collabGroup.sanskrit}
                    </span>
                  </div>
                  <h3 className={`font-['Cinzel_Decorative'] text-xl font-black mb-2 ${
                    isLight ? 'text-stone-950' : 'text-[#FFF7ED]'
                  }`}>
                    {collabGroup.category}
                  </h3>
                  <p className={`font-['Marcellus'] text-sm mb-6 ${
                    isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]'
                  }`}>
                    {collabGroup.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {collabGroup.items.map((item, itemIdx) => (
                      <div key={itemIdx} className={`rounded-xl p-4 border shadow-md ${
                        isLight ? 'bg-white border-[var(--color-border)] text-[var(--color-text-heading)]' : 'bg-[#E8D3A8] text-[#2D1B14] border-[#D4A72C]'
                      }`}>
                        <div className="flex items-center gap-2 font-['Cinzel_Decorative'] font-black text-base mb-1">
                          <CheckCircle className="w-4 h-4 text-[#0F5C55] shrink-0" />
                          <span>{item.role}</span>
                        </div>
                        <p className={`font-['Marcellus'] text-xs sm:text-sm pl-6 leading-relaxed ${
                          isLight ? 'text-[var(--color-text-body)]' : 'text-[#3A2318]'
                        }`}>
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Our Mission and Vision */}
        {activeTab === 'mission-vision' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-left">
            <div className="border-b-2 border-[#D4A72C]/40 pb-5">
              <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                Purpose & Horizon
              </span>
              <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-stone-950' : 'text-[#FFF7ED]'}`}>
                Our Mission & Vision
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mission Card */}
              <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl space-y-4 ${
                isLight ? 'bg-teal-900/90 text-[#FFF7ED] border-teal-500' : 'bg-[#0F5C55] text-[#FFF7ED] border-[#D4A72C]'
              }`}>
                <div className="w-12 h-12 rounded-xl bg-[#2D1B14] border border-[#D4A72C] flex items-center justify-center text-[#D4A72C]">
                  <Target className="w-6 h-6" />
                </div>
                <span className="text-xs font-serif uppercase tracking-wider font-bold text-[#D4A72C]">
                  ध्येयम् · Our Mission
                </span>
                <h3 className="font-['Cinzel_Decorative'] text-2xl font-black text-[#FFF7ED]">
                  Making Authentic Vastu Accessible
                </h3>
                <p className="font-['Marcellus'] text-[#E8D3A8] text-base">
                  To make authentic Vastu knowledge accessible through:
                </p>

                <ul className="space-y-2.5 font-['Marcellus'] text-[#FFF7ED] text-sm sm:text-base">
                  {[
                    "Systematic learning",
                    "Thoughtful research",
                    "Practical interpretation",
                    "Educational publications",
                    "Visual learning",
                    "Professional consultation"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-[#E88A16]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t border-[#D4A72C]/40">
                  <p className="font-['Rozha_One'] text-[#FDE68A] text-lg">
                    “Our objective is to help individuals understand not only what to do, but also why.”
                  </p>
                </div>
              </div>

              {/* Vision Card */}
              <div className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl space-y-4 ${
                isLight ? 'bg-amber-900/90 text-[#FFF7ED] border-amber-600' : 'bg-[#B94E2C] text-[#FFF7ED] border-[#D4A72C]'
              }`}>
                <div className="w-12 h-12 rounded-xl bg-[#2D1B14] border border-[#D4A72C] flex items-center justify-center text-[#E88A16]">
                  <Eye className="w-6 h-6" />
                </div>
                <span className="text-xs font-serif uppercase tracking-wider font-bold text-[#FDE68A]">
                  दृष्टिकोणम् · Our Vision
                </span>
                <h3 className="font-['Cinzel_Decorative'] text-2xl font-black text-[#FFF7ED]">
                  A Respected Classical Centre
                </h3>

                <p className="font-['Marcellus'] text-white text-base leading-relaxed">
                  To develop <BrandName size="inherit" /> into a trusted centre for Vastu knowledge where architects, interior designers, civil engineers, builders, researchers, educators, homeowners, students and practitioners can find reliable guidance rooted in classical wisdom and interpreted with intellectual integrity.
                </p>

                <div className="p-4 rounded-xl bg-[#2D1B14] border border-[#D4A72C]">
                  <p className="font-['Marcellus'] text-[#E8D3A8] text-sm sm:text-base leading-relaxed">
                    We aspire to build an enduring institution that contributes to the preservation, study, and advancement of Vastu for generations to come.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Founder and Research Scholar */}
        {activeTab === 'founder' && (
          <div className="space-y-8 animate-in fade-in duration-200 text-left">
            <div className="border-b-2 border-[#D4A72C]/40 pb-5">
              <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                Leadership & Academic Background
              </span>
              <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-stone-950' : 'text-[#FFF7ED]'}`}>
                Founder and Research Scholar
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Profile Card in Dark Brown & Gold */}
              <div className={`lg:col-span-4 rounded-2xl p-6 border-2 shadow-2xl text-center flex flex-col items-center ${
                isLight ? 'bg-white border-[var(--color-border)] text-[var(--color-text-heading)]' : 'bg-[#2D1B14] border-[#D4A72C] text-[#FFF7ED]'
              }`}>
                <div className="mb-4">
                  <VastuRitamLogo variant="emblem" size={96} />
                </div>
                <h3 className={`font-['Cinzel_Decorative'] text-xl font-black ${isLight ? 'text-stone-950' : 'text-[#FFF7ED]'}`}>
                  {FOUNDER_INFO.title}
                </h3>
                <span className={`text-xs font-serif uppercase tracking-wider block mt-1 font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                  {FOUNDER_INFO.institution}
                </span>

                <div className={`mt-4 pt-4 border-t text-xs font-['Marcellus'] space-y-1 ${
                  isLight ? 'border-[var(--color-border)] text-[var(--color-text-body)]' : 'border-[#D4A72C]/40 text-[#E8D3A8]'
                }`}>
                  <div>Vedic Architectural Hermeneutics</div>
                  <div>Empirical Spatial Modeling</div>
                  <div>Shastric Textual Analysis</div>
                </div>
              </div>

              {/* Qualifications & Areas of Interest */}
              <div className="lg:col-span-8 space-y-6">
                {/* Academic Qualifications: Sand Card */}
                <div className={`rounded-2xl p-6 border-2 shadow-xl ${
                  isLight ? 'bg-[var(--color-pink-tint)] border-[var(--color-border)] text-[var(--color-text-heading)]' : 'bg-[#E8D3A8] text-[#2D1B14] border-[#D4A72C]'
                }`}>
                  <h4 className="font-['Cinzel_Decorative'] text-lg font-black mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-[#6B1F1F]" />
                    <span>Academic Qualifications</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FOUNDER_INFO.qualifications.map((qual, idx) => (
                      <div key={idx} className={`flex items-center gap-2.5 p-3 rounded-xl border shadow-sm font-['Marcellus'] text-sm ${
                        isLight ? 'bg-white border-[var(--color-border)] text-[var(--color-text-heading)]' : 'bg-[#FFFDF9] border-[#D4A72C] text-[#2D1B14]'
                      }`}>
                        <CheckCircle className="w-4 h-4 text-[#0F5C55] shrink-0" />
                        <span className="font-bold">{qual}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas of Interest: Deep Teal */}
                <div className="bg-[#0F5C55] text-[#FFF7ED] rounded-2xl p-6 border-2 border-[#D4A72C] shadow-xl">
                  <h4 className="font-['Cinzel_Decorative'] text-lg font-black text-[#FFF7ED] mb-3 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#D4A72C]" />
                    <span>Areas of Interest</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {FOUNDER_INFO.areasOfInterest.map((area, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2D1B14] border border-[#D4A72C] text-[#E8D3A8] text-xs sm:text-sm font-['Marcellus'] shadow-sm"
                      >
                        ✦ {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Analytical Approach */}
                <div className={`p-5 rounded-2xl border-2 font-['Marcellus'] text-sm sm:text-base leading-relaxed ${
                  isLight ? 'bg-white border-[var(--color-border)] text-[var(--color-text-heading)]' : 'bg-[#2D1B14] border-[#D4A72C] text-[#E8D3A8]'
                }`}>
                  {FOUNDER_INFO.bio}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Our Emblem / Identity */}
        {activeTab === 'emblem' && (
          <div className="animate-in fade-in duration-200">
            <InteractiveEmblem />
          </div>
        )}

        </div>
      </FolioReveal>
    </div>
  );
};
