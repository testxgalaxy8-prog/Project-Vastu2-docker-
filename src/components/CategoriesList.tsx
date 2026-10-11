import React, { useEffect, useState } from 'react';
import { BookOpen, FolderOpen, ArrowRight } from 'lucide-react';
import { FolioReveal } from './FolioReveal';
import { AdBanner } from './AdBanner';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  articleCount: number;
}

interface CategoriesListProps {
  onNavigate: (path: string) => void;
}

export const CategoriesList: React.FC<CategoriesListProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
    document.title = 'Canonical Categories | Vastu Ritam';
  }, []);

  return (
    <div className="min-h-screen bg-[#EDE0C8] text-[#22160D] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FolioReveal>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-serif uppercase tracking-widest text-amber-800 font-bold bg-amber-200/80 px-3 py-1 rounded-full border border-[var(--color-border)]">
              Taxonomy & Classifications
            </span>
            <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl font-black text-[#1A0F0A] mt-4 mb-4">
              Knowledge Repository Categories
            </h1>
            <p className="font-['Marcellus'] text-sm sm:text-base text-[var(--color-text-body)] leading-relaxed">
              Classical Vastu Vidya partitioned systematically according to canonical traditions, metaphysical fields, and spatial architecture.
            </p>
          </div>
        </FolioReveal>

        <div className="mb-10">
          <AdBanner placement="HEADER" />
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-['Cinzel'] text-amber-900">Loading Categories from PostgreSQL...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigate(`/category/${c.slug}`)}
                className="p-8 rounded-3xl bg-[#FAF4E6] border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-10 h-10 rounded-xl bg-amber-200/80 flex items-center justify-center text-amber-900">
                      <FolderOpen className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-serif font-bold text-amber-800 bg-[var(--color-pink-tint)] px-3 py-1 rounded-full border border-[var(--color-border)]">
                      {c.articleCount} Treatises
                    </span>
                  </div>

                  <h3 className="font-['Cinzel',serif] text-2xl font-bold text-stone-950 group-hover:text-amber-800 transition-colors mb-2">
                    {c.name}
                  </h3>

                  <p className="font-['Marcellus'] text-sm text-[var(--color-text-body)] leading-relaxed mb-6">
                    {c.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-serif font-bold text-amber-900">
                  <span className="font-mono text-[var(--color-text-body)]">/category/{c.slug}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Browse Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
