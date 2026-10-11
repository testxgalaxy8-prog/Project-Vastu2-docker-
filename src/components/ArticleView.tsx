import React, { useEffect, useState } from 'react';
import {
  Clock,
  Eye,
  Calendar,
  ChevronRight,
  BookOpen,
  Tag,
  Share2,
  Bookmark,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AdBanner } from './AdBanner';
import { AdContainer } from './AdContainer';
import { FolioReveal } from './FolioReveal';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface ArticleData {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  authorName: string | null;
  readingTimeMinutes: number;
  viewsCount: number;
  publishedAt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  topics: Array<{
    id: number;
    name: string;
    slug: string;
    sanskritName: string | null;
    entityType: string;
    summary: string;
  }>;
  keywords: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
}

interface ArticleViewProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ slug, onNavigate }) => {
  const { logoUrl } = useSiteSettings();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadArticle() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/articles/${slug}`);
        if (!res.ok) {
          throw new Error('Article not found in classical repository.');
        }
        const data = await res.json();
        if (isMounted) {
          setArticle(data.article);
          setRelatedArticles(data.relatedArticles || []);
          setBreadcrumbs(data.breadcrumbs || []);
          // Sync document title and meta
          if (data.article.metaTitle) {
            document.title = `${data.article.metaTitle} | Vastu Ritam`;
          } else {
            document.title = `${data.article.title} | Vastu Ritam`;
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load article');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Render content with interactive Topic Entity Links
  const renderRichContent = (content: string) => {
    // Replace [[topic:slug|Label]] or [[topic:slug]] with interactive spans
    const topicPattern = /\[\[topic:([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Helper map of topics by slug
    const topicMap = new Map<string, any>();
    if (article?.topics) {
      for (const t of article.topics) {
        topicMap.set(t.slug, t);
      }
    }

    // Split markdown into lines/paragraphs
    const paragraphs = content.split('\n\n');

    return (
      <div className="space-y-6 text-[#291A10] leading-relaxed font-['Marcellus'] text-base sm:text-lg">
        {paragraphs.map((p, idx) => {
          const trimmed = p.trim();

          // Heading 2
          if (trimmed.startsWith('## ')) {
            return (
              <h2
                key={idx}
                className="font-['Cinzel',serif] text-2xl sm:text-3xl font-bold text-[#8B1E0F] pt-6 pb-2 border-b border-[var(--color-border)]/60"
              >
                {trimmed.replace(/^##\s+/, '')}
              </h2>
            );
          }

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h3
                key={idx}
                className="font-['Cinzel',serif] text-xl sm:text-2xl font-bold text-[#A94A14] pt-4"
              >
                {trimmed.replace(/^###\s+/, '')}
              </h3>
            );
          }

          // Heading 4
          if (trimmed.startsWith('#### ')) {
            return (
              <h4
                key={idx}
                className="font-['Cinzel',serif] text-lg sm:text-xl font-bold text-[#3B2219] pt-2"
              >
                {trimmed.replace(/^####\s+/, '')}
              </h4>
            );
          }

          // Blockquote (Sanskrit Verse or Axiom)
          if (trimmed.startsWith('>')) {
            const quoteContent = trimmed.replace(/^>\s*/gm, '');
            return (
              <blockquote
                key={idx}
                className="my-6 p-5 sm:p-6 rounded-2xl bg-[var(--color-pink-tint)] border-l-4 border-amber-600 shadow-xs italic text-[#4A2613] font-serif relative"
              >
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {parseEntityLinks(quoteContent, topicMap)}
                </div>
              </blockquote>
            );
          }

          // List items
          if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
            const items = trimmed.split('\n');
            return (
              <ul key={idx} className="space-y-2.5 my-4 pl-4 sm:pl-6 list-disc list-outside text-[#331C13]">
                {items.map((item, itemIdx) => {
                  const cleaned = item.replace(/^[-*]|\d+\.\s*/, '').trim();
                  return (
                    <li key={itemIdx} className="leading-relaxed">
                      {parseEntityLinks(cleaned, topicMap)}
                    </li>
                  );
                })}
              </ul>
            );
          }

          // Ad midway injection
          const showMidAd = idx === Math.floor(paragraphs.length / 2);

          return (
            <React.Fragment key={idx}>
              <p className="leading-relaxed text-[#2C1910]">
                {parseEntityLinks(trimmed, topicMap)}
              </p>
              {showMidAd && (
                <div className="my-8">
                  <AdContainer placement="ARTICLE_MIDDLE" rootMargin="150px 0px" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const parseEntityLinks = (text: string, topicMap: Map<string, any>): React.ReactNode => {
    const topicPattern = /\[\[topic:([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = topicPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(text.substring(lastIndex, match.index));
      }

      const topicSlug = match[1];
      const displayText = match[2] || topicSlug;
      const topicInfo = topicMap.get(topicSlug);

      elements.push(
        <button
          key={`${topicSlug}-${match.index}`}
          onClick={() => onNavigate(`/topic/${topicSlug}`)}
          onMouseEnter={() => topicInfo && setHoveredTopic(topicInfo)}
          onMouseLeave={() => setHoveredTopic(null)}
          className="inline-flex items-baseline gap-1 mx-1 px-2 py-0.5 rounded-lg bg-[var(--color-pink-tint)]/60 hover:bg-amber-300 text-[#2A1515] border border-[var(--color-border)]/80 font-semibold transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
          title={`Entity Topic: ${topicInfo?.name || displayText}`}
        >
          <span className="underline decoration-amber-600/70 underline-offset-3 group-hover:text-red-900">
            {displayText}
          </span>
          {topicInfo?.sanskritName && (
            <span className="text-[11px] text-[var(--color-secondary)]/80 font-normal ml-0.5">
              ({topicInfo.sanskritName})
            </span>
          )}
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return <>{elements}</>;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-['Cinzel'] text-amber-300 tracking-wider">Unrolling Sacred Shastric Folio...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="p-8 rounded-3xl bg-[#221417] border border-amber-500/40 text-amber-100">
          <BookOpen className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="font-['Cinzel'] text-2xl font-bold mb-2">Manuscript Not Found</h2>
          <p className="font-['Marcellus'] text-stone-300 mb-6">{error || 'Requested knowledge folio does not exist in the database.'}</p>
          <button
            onClick={() => onNavigate('/knowledge')}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-serif font-bold text-sm shadow-md"
          >
            Return to Gyan-Kosh Repository
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF5] text-[#2A1515] py-8 sm:py-12">
      {/* Top Breadcrumb Navigation */}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Content Column */}
          <main className="lg:col-span-8">
            <FolioReveal>
              <article className="p-6 sm:p-10 md:p-12 rounded-3xl bg-white border-2 border-[var(--color-border)]/80 shadow-lg relative overflow-hidden">
                {/* Header Meta */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[var(--color-border)]">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {article.categorySlug && (
                      <button
                        onClick={() => onNavigate(`/category/${article.categorySlug}`)}
                        className="px-3 py-1 rounded-full bg-[var(--color-pink-tint)] text-[#2A1515] text-xs font-serif font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors cursor-pointer"
                      >
                        {article.categoryName}
                      </button>
                    )}
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-body)] font-serif">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                      <span>{article.readingTimeMinutes} min read</span>
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[var(--color-text-body)] font-serif">
                      <Eye className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                      <span>{article.viewsCount} views</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-xl bg-[var(--color-pink-tint)]/80 hover:bg-[var(--color-pink-tint)] text-[var(--color-secondary)] transition-colors flex items-center gap-1 text-xs font-serif"
                      title="Share Article Link"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>

                {/* Article Title */}
                <h1 className="font-['Cinzel',serif] text-2xl sm:text-4xl md:text-5xl font-black text-[#1E110A] leading-tight sm:leading-tight mb-6">
                  {article.title}
                </h1>

                {/* Lead Excerpt */}
                <div className="p-5 rounded-2xl bg-[var(--color-pink-tint)]/60 border border-[var(--color-border)] text-[#2A1515] font-serif text-base sm:text-lg italic leading-relaxed mb-8">
                  {article.excerpt}
                </div>

                {/* Database-Driven Ad: ARTICLE_TOP (Lazy-loaded via IntersectionObserver) */}
                <AdContainer placement="ARTICLE_TOP" className="mb-8" />

                {/* Rich Body Content */}
                <div className="prose prose-amber max-w-none text-[#23150D]">
                  {renderRichContent(article.content)}
                </div>

                {/* Database-Driven Ad: ARTICLE_BOTTOM (Lazy-loaded via IntersectionObserver) */}
                <AdContainer placement="ARTICLE_BOTTOM" className="mt-8 mb-6" />

                {/* Presiding Topics & Keywords Cloud */}
                <div className="mt-10 pt-6 border-t border-[var(--color-border)]/80 space-y-4">
                  {article.topics && article.topics.length > 0 && (
                    <div>
                      <h4 className="text-xs font-serif uppercase tracking-wider text-[var(--color-text-body)] font-bold mb-2.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Presiding Entities & Canonical Topics</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {article.topics.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => onNavigate(`/topic/${t.slug}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200/90 text-[#2A1515] border border-[var(--color-border)] font-serif text-xs font-bold hover:shadow-xs hover:border-amber-600 transition-all cursor-pointer"
                          >
                            <span>{t.name}</span>
                            {t.sanskritName && (
                              <span className="text-[11px] text-[var(--color-secondary)]">({t.sanskritName})</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {article.keywords && article.keywords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-serif uppercase tracking-wider text-[var(--color-text-body)] font-bold mb-2 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        <span>Keywords & Shastric Terms</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {article.keywords.map((kw) => (
                          <span
                            key={kw.id}
                            className="px-2.5 py-0.5 rounded-md bg-stone-200/70 text-[var(--color-text-heading)] text-[11px] font-serif"
                          >
                            #{kw.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Author Monogram Card */}
                <div className="mt-8 p-5 rounded-2xl bg-[var(--color-pink-tint)]/40 border border-[var(--color-border)] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 bg-white shrink-0">
                    <img
                      src={logoUrl || "/trademark-logo.jpg"}
                      alt="Vastu Ritam Acharya"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.endsWith('/vastu-ritam-logo.jpg')) {
                          target.src = '/vastu-ritam-logo.jpg';
                        }
                      }}
                    />
                  </div>
                  <div>
                    <h5 className="font-['Cinzel',serif] text-sm font-bold text-[var(--color-text-heading)]">
                      {article.authorName || 'Vastu Ritam Research Foundation'}
                    </h5>
                    <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)]">
                      Authentic classical research curated in adherence with canonical Samarāṅgaṇa Sūtradhāra principles.
                    </p>
                  </div>
                </div>
              </article>
            </FolioReveal>

            {/* Related Shastric Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-12">
                <h3 className="font-['Cinzel',serif] text-xl sm:text-2xl font-bold text-[#1E110A] mb-6 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span>Related Shastric Knowledge</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {relatedArticles.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onNavigate(`/knowledge/${rel.slug}`)}
                      className="p-5 rounded-2xl bg-white border border-[var(--color-border)] shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <h4 className="font-['Cinzel',serif] text-base font-bold text-[#2A1515] group-hover:text-[var(--color-secondary)] transition-colors mb-2 leading-snug line-clamp-2">
                          {rel.title}
                        </h4>
                        <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)] leading-relaxed line-clamp-3 mb-4">
                          {rel.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[var(--color-secondary)] font-serif pt-3 border-t border-[var(--color-border)]">
                        <span>{rel.readingTimeMinutes} min read</span>
                        <span className="font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Read Folio &rarr;
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Database-Driven Sidebar Ad (Lazy-loaded via IntersectionObserver) */}
            <AdContainer placement="SIDEBAR" />

            {/* Presiding Entities / Topic Inspector */}
            {article.topics && article.topics.length > 0 && (
              <div className="p-5 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
                <h4 className="font-['Cinzel',serif] text-sm font-bold text-[var(--color-text-heading)] pb-3 border-b border-[var(--color-border)] mb-3 flex items-center justify-between">
                  <span>Linked Canonical Entities</span>
                  <Sparkles className="w-4 h-4 text-amber-600" />
                </h4>
                <div className="space-y-3">
                  {article.topics.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onNavigate(`/topic/${t.slug}`)}
                      className="p-3 rounded-xl bg-white hover:bg-[var(--color-pink-tint)] border border-[var(--color-border)]/80 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-['Cinzel'] text-xs font-bold text-[#2A1515] group-hover:text-[var(--color-secondary)]">
                          {t.name}
                        </span>
                        {t.sanskritName && (
                          <span className="text-[11px] text-[var(--color-secondary)] font-serif font-bold">
                            {t.sanskritName}
                          </span>
                        )}
                      </div>
                      <p className="font-['Marcellus'] text-[11px] text-[var(--color-text-body)] line-clamp-2 leading-relaxed">
                        {t.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Institutional Consultation Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2D160E] to-[#1A0C07] text-amber-100 border border-amber-600/40 shadow-md">
              <h4 className="font-['Cinzel',serif] text-base font-bold text-amber-300 mb-2">
                Need Classical Vastu Guidance?
              </h4>
              <p className="font-['Marcellus'] text-xs text-stone-300 leading-relaxed mb-4">
                Consult with certified scholars for architectural audits, site orientations, and non-destructive remedies.
              </p>
              <button
                onClick={() => onNavigate('/contact')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#2A1515] font-serif font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                Schedule Shastric Consultation
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
