import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Clock, Eye, ArrowRight } from 'lucide-react';
import { FolioReveal } from './FolioReveal';
import { AdBanner } from './AdBanner';
import { useTheme } from '../context/ThemeContext';

interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readingTimeMinutes: number;
  viewsCount: number;
  categoryName?: string;
  categorySlug?: string;
  topics?: Array<{ id: string; name: string; slug: string }>;
}

export const KnowledgeList: React.FC<{ onNavigate: (path: string) => void }> = ({
  onNavigate,
}) => {
  const { isLight } = useTheme();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/knowledge').then((r) => r.json()),
      fetch('/api/categories').then((r) => r.json()),
    ])
      .then(([kData, cData]) => {
        if (kData.articles) setArticles(kData.articles);
        if (cData.categories) setCategories(cData.categories);
      })
      .catch((err) => console.error('Error fetching knowledge:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredArticles = articles.filter((art) => {
    const matchesCat =
      selectedCategory === 'all' || art.categorySlug === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div
      className={`min-h-screen py-10 sm:py-16 transition-colors duration-200 ${
        isLight
          ? 'bg-[#FFFAF5] text-[#2A1515]'
          : 'bg-[#1A0F0F] text-[#FFF6F7]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FolioReveal>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span
              className={`text-xs font-serif uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                isLight
                  ? 'bg-[var(--color-pink-tint)] text-[var(--color-primary)] border-[var(--color-border)]'
                  : 'bg-[#2A151B] text-[var(--color-primary-light)] border-[#44262E]'
              }`}
            >
              Vedic Architectural Treatises
            </span>
            <h1
              className={`font-['Cinzel_Decorative',serif] text-3xl sm:text-5xl font-black mt-4 mb-4 ${
                isLight ? 'text-[#2A1515]' : 'text-[#FFF6F7]'
              }`}
            >
              Vastu Gyan-Kosh Knowledgebase
            </h1>
            <p
              className={`font-['Marcellus'] text-sm sm:text-base leading-relaxed ${
                isLight ? 'text-[#5A4545]' : 'text-zinc-300'
              }`}
            >
              Authentic shastric research, geometric treatises, and spatial orientation principles directly sourced from Samarāṅgaṇa Sūtradhāra and classical manuscripts.
            </p>
          </div>
        </FolioReveal>

        {/* Database-Driven Header Ad */}
        <div className="mb-10">
          <AdBanner placement="HEADER" />
        </div>

        {/* Search & Category Filter Controls */}
        <div
          className={`p-4 sm:p-6 rounded-3xl border shadow-xs mb-10 space-y-4 ${
            isLight
              ? 'bg-white border-[var(--color-border)]'
              : 'bg-[#221417] border-[#44262E]'
          }`}
        >
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search treatises by keyword, topic, or concept..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border font-serif text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] ${
                isLight
                  ? 'bg-[#FFFAF5] border-[var(--color-border)] text-[#2A1515] placeholder:text-[#5A4545]/70'
                  : 'bg-[#1A0F0F] border-[#44262E] text-[#FFF6F7] placeholder:text-zinc-500'
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-border)]">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : isLight
                  ? 'bg-white hover:bg-[var(--color-pink-tint)] text-[#5A4545] border border-[var(--color-border)]'
                  : 'bg-[#1A0F0F] text-zinc-300 border border-[#44262E]'
              }`}
            >
              All Treatises ({articles.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-[var(--color-secondary)] text-white shadow-xs'
                    : isLight
                    ? 'bg-white hover:bg-[var(--color-pink-tint)] text-[#5A4545] border border-[var(--color-border)]'
                    : 'bg-[#1A0F0F] text-zinc-300 border border-[#44262E]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-['Cinzel'] text-[var(--color-secondary)] font-bold">Consulting Classical Archives...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div
            className={`text-center py-16 rounded-3xl border p-8 max-w-2xl mx-auto ${
              isLight
                ? 'bg-white border-[var(--color-border)]'
                : 'bg-[#221417] border-[#44262E]'
            }`}
          >
            <p className="font-['Marcellus'] text-[#5A4545]">No treatises found matching your current filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => onNavigate(`/knowledge/${art.slug}`)}
                className={`p-6 rounded-3xl border shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                  isLight
                    ? 'bg-white border-[var(--color-border)] hover:border-[var(--color-secondary)]'
                    : 'bg-[#221417] border-[#44262E] hover:border-[var(--color-secondary-light)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#5A4545] font-serif mb-3">
                    {art.categoryName && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 px-2 py-0.5 rounded">
                        {art.categoryName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--color-secondary)]" />
                      <span>{art.readingTimeMinutes} min read</span>
                    </span>
                  </div>

                  <h3
                    className={`font-['Cinzel_Decorative',serif] text-lg sm:text-xl font-bold transition-colors mb-2 leading-snug ${
                      isLight
                        ? 'text-[#2A1515] group-hover:text-[var(--color-primary)]'
                        : 'text-[#FFF6F7] group-hover:text-[var(--color-primary-light)]'
                    }`}
                  >
                    {art.title}
                  </h3>

                  <p
                    className={`font-['Marcellus'] text-xs leading-relaxed line-clamp-3 mb-4 ${
                      isLight ? 'text-[#5A4545]' : 'text-zinc-300'
                    }`}
                  >
                    {art.excerpt}
                  </p>

                  {/* Linked Topics Badges */}
                  {art.topics && art.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {art.topics.map((t: any) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 rounded bg-[var(--color-pink-tint)] text-[var(--color-primary)] font-serif text-[10px] border border-[var(--color-border)]"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs font-serif font-bold ${
                    isLight
                      ? 'border-[var(--color-border)] text-[var(--color-secondary)]'
                      : 'border-[#44262E] text-[var(--color-secondary-light)]'
                  }`}
                >
                  <span className="flex items-center gap-1 text-[11px] text-[#5A4545]">
                    <Eye className="w-3 h-3 text-[var(--color-secondary)]" />
                    <span>{art.viewsCount} reads</span>
                  </span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read Treatise</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
