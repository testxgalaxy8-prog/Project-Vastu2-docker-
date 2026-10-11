import React, { useState } from 'react';
import { TESTIMONIALS_DATA } from '../data/vastuData';
import { Quote, Star, Sparkles, Building2, User, HardHat, Compass, Home as HomeIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BrandName } from './BrandName';

export const TestimonialsSection: React.FC = () => {
  const { isLight } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Architect', 'Engineer', 'Interior Designer', 'Homeowner', 'Commercial'];

  const filteredTestimonials = selectedCategory === 'All'
    ? TESTIMONIALS_DATA
    : TESTIMONIALS_DATA.filter((t) => t.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 text-xs font-serif uppercase tracking-widest text-[var(--color-accent-orange)] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-orange)]" />
          <span>Collaborator & Client Reflections</span>
          <span className="opacity-60">·</span>
          <span>अनुभव-संवादः</span>
        </div>
        <h1 className={`font-['Cinzel_Decorative'] text-3xl sm:text-4xl md:text-5xl font-black drop-shadow-md ${
          isLight ? 'text-[var(--color-text-heading)]' : 'text-zinc-100'
        }`}>
          Testimonials & Experiences
        </h1>
        <p className={`font-['Marcellus'] text-base sm:text-lg leading-relaxed ${
          isLight ? 'text-zinc-700' : 'text-zinc-300'
        }`}>
          Hear from practicing architects, civil engineers, interior designers, and property owners who have experienced the clarity, calm, and scientific integrity of <BrandName size="inherit" />.
        </p>
      </div>

      {/* Filter Tabs using Rich Indian Heritage Aesthetic */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-b-2 border-[#D4A72C]/40 pb-6">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer font-serif flex items-center gap-2 shadow-md ${
                isActive
                  ? 'bg-[#E88A16] text-[#2D1B14] border-2 border-[#6B1F1F] font-black scale-105 shadow-[0_0_15px_rgba(232,138,22,0.4)]'
                  : isLight
                  ? 'bg-white border-2 border-[var(--color-border)] text-[var(--color-text-heading)] hover:bg-[var(--color-pink-tint)] hover:text-stone-950'
                  : 'bg-[#2D1B14] border-2 border-[#D4A72C]/70 text-[#E8D3A8] hover:bg-[#6B1F1F] hover:text-[#FFF7ED]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#6B1F1F]' : 'bg-[#D4A72C]'}`} />
              <span>{cat === 'All' ? 'All Collaborators' : cat}</span>
            </button>
          );
        })}
      </div>

      {/* Testimonials Grid: Uniform Light Beige / Golden Cards matching reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {filteredTestimonials.map((item) => {
          return (
            <div
              key={item.id}
              className="rounded-3xl bg-[#E8D3A8] text-[#2D1B14] border-2 border-[#D4A72C] p-6 sm:p-7 shadow-xl hover:scale-102 hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Accent Ribbon */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6B1F1F] via-[#E88A16] to-[#0F5C55]" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Quote className="w-8 h-8 text-[#6B1F1F]" />
                  <div className="flex items-center gap-1 text-[#E88A16]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="font-['Marcellus'] text-sm sm:text-base leading-relaxed italic text-[#2D1B14] font-medium">
                  “{item.quote}”
                </p>
              </div>

              <div className="pt-6 border-t mt-6 flex items-center gap-3 border-[#D4A72C]/60">
                <div className="w-11 h-11 rounded-full bg-[#2D1B14] border-2 border-[#D4A72C] text-[#D4A72C] font-serif font-black text-sm flex items-center justify-center shadow-md shrink-0">
                  {item.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-['Cinzel_Decorative'] font-black text-sm truncate text-[#2D1B14]">
                    {item.name}
                  </h4>
                  <p className="text-xs font-serif truncate text-[#3A2318]">
                    {item.designation} {item.organization ? `· ${item.organization}` : ''}
                  </p>
                  <p className="text-[11px] font-serif font-bold text-[#6B1F1F]">
                    {item.location}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Professional Collaboration Notice: Brand Panel */}
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-border)] rounded-2xl p-6 sm:p-8 text-center max-w-3xl mx-auto space-y-3 shadow-xl text-[var(--color-text)]">
        <div className="flex items-center justify-center gap-2 text-xs font-serif text-[var(--color-accent-orange)] uppercase tracking-wider font-bold">
          <Sparkles className="w-4 h-4 text-[var(--color-accent-orange)]" />
          <span>Peer Collaboration & Professional Audits</span>
        </div>
        <h3 className="font-['Cinzel_Decorative'] text-xl sm:text-2xl font-black text-[var(--color-text)]">
          Are you an Architect, Civil Engineer, or Builder?
        </h3>
        <p className="font-['Marcellus'] text-[var(--color-text-muted)] text-sm sm:text-base leading-relaxed">
          <BrandName size="inherit" /> welcomes continuous peer collaboration. We review structural designs, apartment master plans, and site layouts on CAD/BIM without imposing superstition or architectural compromise.
        </p>
      </div>
    </div>
  );
};
