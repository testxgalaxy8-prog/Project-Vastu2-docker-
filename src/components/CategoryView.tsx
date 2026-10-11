import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Clock,
  Eye,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { FolioReveal } from './FolioReveal';
import { AdBanner } from './AdBanner';

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface CategoryViewProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ slug, onNavigate }) => {
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadCategory() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/categories/${slug}`);
        if (!res.ok) {
          throw new Error('Category not found.');
        }
        const data = await res.json();
        if (isMounted) {
          setCategory(data.category);
          setArticles(data.articles || []);
          setBreadcrumbs(data.breadcrumbs || []);
          if (data.category.metaTitle) {
            document.title = `${data.category.metaTitle} | Vastu Ritam`;
          } else {
            document.title = `${data.category.name} | Vastu Ritam`;
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load category');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCategory();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-['Cinzel'] text-[var(--color-secondary)] tracking-wider">Accessing Shastric Classification Repository...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="p-8 rounded-3xl bg-[#221417] border border-amber-500/40 text-amber-100">
          <FolderOpen className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="font-['Cinzel'] text-2xl font-bold mb-2">Category Not Found</h2>
          <p className="font-['Marcellus'] text-stone-300 mb-6">{error || 'Requested category does not exist in the database.'}</p>
          <button
            onClick={() => onNavigate('/categories')}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-serif font-bold text-sm"
          >
            Browse All Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF5] text-[#2A1515] py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-['Marcellus'] text-[var(--color-text-body)]">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--color-secondary)]/60 shrink-0" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-bold text-[#2A1515] truncate max-w-xs">{crumb.label}</span>
              ) : (
                <button
                  onClick={() => onNavigate(crumb.path)}
                  className="hover:text-[var(--color-secondary)] transition-colors cursor-pointer"
                >
                  {crumb.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Category Header */}
        <FolioReveal>
          <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-[var(--color-border)]/80 shadow-md mb-10 text-center max-w-4xl mx-auto">
            <span className="text-xs font-serif uppercase tracking-widest text-[var(--color-secondary)] font-bold bg-[var(--color-pink-tint)] px-3 py-1 rounded-full">
              Canonical Classification
            </span>
            <h1 className="font-['Cinzel',serif] text-3xl sm:text-5xl font-black text-[#1E110A] mt-4 mb-3">
              {category.name}
            </h1>
            <p className="font-['Marcellus'] text-base sm:text-lg text-[var(--color-text-body)] leading-relaxed max-w-2xl mx-auto">
              {category.description}
            </p>
          </div>
        </FolioReveal>

        {/* Database-Driven Ad Banner */}
        <div className="mb-10">
          <AdBanner placement="HEADER" />
        </div>

        {/* Article Cards Grid */}
        <div className="mb-8">
          <h2 className="font-['Cinzel',serif] text-xl sm:text-2xl font-bold text-[var(--color-text-heading)] mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--color-secondary)]" />
            <span>Published Treatises in {category.name} ({articles.length})</span>
          </h2>

          {articles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[var(--color-border)] p-8">
              <p className="font-['Marcellus'] text-[var(--color-text-body)]">No published treatises currently in this classification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => onNavigate(`/knowledge/${art.slug}`)}
                  className="p-6 rounded-3xl bg-white border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-body)] font-serif mb-2.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                        <span>{art.readingTimeMinutes} min</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                        <span>{art.viewsCount} views</span>
                      </span>
                    </div>

                    <h3 className="font-['Cinzel',serif] text-lg font-bold text-[#2A1515] group-hover:text-[var(--color-secondary)] transition-colors mb-2 leading-snug">
                      {art.title}
                    </h3>

                    <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)] leading-relaxed line-clamp-3 mb-4">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-serif font-bold text-[var(--color-secondary)]">
                    <span>Read Canonical Folio</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
