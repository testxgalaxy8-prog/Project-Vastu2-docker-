import React, { useEffect, useState } from 'react';
import { Search, BookOpen, Compass, FolderOpen, ArrowRight } from 'lucide-react';
import { FolioReveal } from './FolioReveal';
import { AdBanner } from './AdBanner';

interface SearchResultsViewProps {
  query: string;
  onNavigate: (path: string) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({ query, onNavigate }) => {
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<{ articles: any[]; topics: any[]; categories: any[] }>({
    articles: [],
    topics: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function executeSearch() {
      if (!query.trim()) {
        setResults({ articles: [], topics: [], categories: [] });
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setResults(data);
        }
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    executeSearch();
    document.title = `Search: "${query}" | Vastu Ritam`;
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const totalHits = results.articles.length + results.topics.length + results.categories.length;

  return (
    <div className="min-h-screen bg-[#EDE0C8] text-[#22160D] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <FolioReveal>
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h1 className="font-['Cinzel',serif] text-3xl sm:text-4xl font-black text-[var(--color-text-heading)] mb-4">
              Shastric Search Results
            </h1>
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search across treatises, entities, devatas, and categories..."
                className="w-full pl-12 pr-28 py-3 rounded-2xl bg-[#FAF4E6] border-2 border-[var(--color-border)] font-serif text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-serif font-bold text-xs"
              >
                Search
              </button>
            </form>
            <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)] mt-3">
              Found {totalHits} matching records for <span className="font-bold text-amber-950">"{query}"</span>
            </p>
          </div>
        </FolioReveal>

        <div className="mb-10">
          <AdBanner placement="HEADER" />
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-['Cinzel'] text-amber-900">Searching PostgreSQL Knowledge Base...</p>
          </div>
        ) : totalHits === 0 ? (
          <div className="text-center py-16 bg-[#FAF4E6] rounded-3xl border border-[var(--color-border)] p-8 max-w-2xl mx-auto">
            <p className="font-['Marcellus'] text-[var(--color-text-body)]">No canonical records matched your search query. Try terms like "Brahma", "Brahmastra", "Brahmasthan", or "Water".</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* 1. Canonical Topics / Entities */}
            {results.topics.length > 0 && (
              <div>
                <h2 className="font-['Cinzel',serif] text-xl font-bold text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-700" />
                  <span>Canonical Entities & Devatas ({results.topics.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.topics.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onNavigate(`/topic/${t.slug}`)}
                      className="p-5 rounded-2xl bg-[#FAF4E6] border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-bold uppercase text-[10px]">
                          {t.entityType}
                        </span>
                        {t.sanskritName && (
                          <span className="font-['Rozha_One'] text-amber-800 text-base">{t.sanskritName}</span>
                        )}
                      </div>
                      <h3 className="font-['Cinzel',serif] text-base font-bold text-stone-950 group-hover:text-amber-800 mb-1">
                        {t.name}
                      </h3>
                      <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)] line-clamp-2 leading-relaxed">
                        {t.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Knowledge Articles */}
            {results.articles.length > 0 && (
              <div>
                <h2 className="font-['Cinzel',serif] text-xl font-bold text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-700" />
                  <span>Knowledge Treatises & Folios ({results.articles.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.articles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => onNavigate(`/knowledge/${art.slug}`)}
                      className="p-5 rounded-2xl bg-[#FAF4E6] border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        {art.categoryName && (
                          <span className="text-[10px] uppercase font-bold text-amber-800 bg-[var(--color-pink-tint)] px-2 py-0.5 rounded mb-2 inline-block">
                            {art.categoryName}
                          </span>
                        )}
                        <h3 className="font-['Cinzel',serif] text-base font-bold text-stone-950 group-hover:text-amber-800 mb-2 leading-snug">
                          {art.title}
                        </h3>
                        <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)] line-clamp-2 mb-3">
                          {art.excerpt}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-serif font-bold text-amber-900">
                        <span>Read Treatises</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Categories */}
            {results.categories.length > 0 && (
              <div>
                <h2 className="font-['Cinzel',serif] text-xl font-bold text-[var(--color-text-heading)] mb-4 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-700" />
                  <span>Classifications ({results.categories.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.categories.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onNavigate(`/category/${c.slug}`)}
                      className="p-5 rounded-2xl bg-[#FAF4E6] border border-[var(--color-border)] hover:border-amber-500 cursor-pointer transition-all"
                    >
                      <h3 className="font-['Cinzel',serif] text-base font-bold text-stone-950 mb-1">{c.name}</h3>
                      <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)] line-clamp-2">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
