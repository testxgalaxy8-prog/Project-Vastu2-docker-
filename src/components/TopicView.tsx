import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Clock,
  ExternalLink,
  Layers,
  Compass,
} from 'lucide-react';
import { AdBanner } from './AdBanner';
import { AdContainer } from './AdContainer';
import { FolioReveal } from './FolioReveal';

interface TopicDetail {
  id: number;
  name: string;
  slug: string;
  sanskritName: string | null;
  entityType: string;
  summary: string;
  description: string;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

interface TopicViewProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const TopicView: React.FC<TopicViewProps> = ({ slug, onNavigate }) => {
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [relations, setRelations] = useState<{ outgoing: any[]; incoming: any[] }>({ outgoing: [], incoming: [] });
  const [articles, setArticles] = useState<any[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchTopic() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/topics/${slug}`);
        if (!res.ok) {
          throw new Error('Canonical Entity Topic not found.');
        }
        const data = await res.json();
        if (isMounted) {
          setTopic(data.topic);
          setRelations(data.relations || { outgoing: [], incoming: [] });
          setArticles(data.articles || []);
          setBreadcrumbs(data.breadcrumbs || []);
          if (data.topic.metaTitle) {
            document.title = `${data.topic.metaTitle} | Vastu Ritam`;
          } else {
            document.title = `${data.topic.name} (Entity) | Vastu Ritam`;
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Failed to load topic');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchTopic();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="font-['Cinzel'] text-amber-300 tracking-wider">Retrieving Canonical Entity Archive...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="p-8 rounded-3xl bg-[#221417] border border-amber-500/40 text-amber-100">
          <Compass className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="font-['Cinzel'] text-2xl font-bold mb-2">Entity Not Found</h2>
          <p className="font-['Marcellus'] text-stone-300 mb-6">{error || 'Requested entity does not exist.'}</p>
          <button
            onClick={() => onNavigate('/topics')}
            className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-serif font-bold text-sm"
          >
            Explore All Canonical Entities
          </button>
        </div>
      </div>
    );
  }

  // Format entity type label
  const formatEntityType = (type: string) => {
    switch (type) {
      case 'deity':
        return 'Presiding Cosmic Deity (Devata)';
      case 'energy_zone':
        return 'Vastu Energy Matrix / Pada';
      case 'concept':
        return 'Vedic Metaphysical Principle';
      case 'shastra':
        return 'Canonical Treatise';
      case 'direction':
        return 'Directional Orientation (Disha)';
      default:
        return 'Canonical Entity';
    }
  };

  const formatRelationType = (type: string) => {
    switch (type) {
      case 'presides_over':
        return 'Presides Over';
      case 'associated_with':
        return 'Associated With';
      case 'counterpart_of':
        return 'Counterpart Of';
      case 'element_ruler':
        return 'Ruler of Element';
      default:
        return 'Related To';
    }
  };

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Topic Information */}
          <main className="lg:col-span-8 space-y-8">
            <FolioReveal>
              <div className="p-6 sm:p-10 md:p-12 rounded-3xl bg-white border-2 border-[var(--color-border)]/80 shadow-lg relative overflow-hidden">
                {/* Entity Badge Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[var(--color-pink-tint)] text-[#2A1515] text-xs font-serif font-bold uppercase tracking-wider">
                      {formatEntityType(topic.entityType)}
                    </span>
                    <span className="text-xs text-[var(--color-text-body)] font-serif">· Canonical Entity</span>
                  </div>

                  <span className="text-xs text-[var(--color-text-body)] font-serif flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
                    <span>Single Source of Truth</span>
                  </span>
                </div>

                {/* Title & Devanagari */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4">
                  <h1 className="font-['Cinzel',serif] text-3xl sm:text-4xl md:text-5xl font-black text-[#1E110A] leading-tight">
                    {topic.name}
                  </h1>
                  {topic.sanskritName && (
                    <span className="font-['Rozha_One',serif] text-2xl sm:text-3xl text-[var(--color-secondary)]">
                      ({topic.sanskritName})
                    </span>
                  )}
                </div>

                {/* High-Level Shastric Summary */}
                <div className="p-5 rounded-2xl bg-[var(--color-pink-tint)]/60 border border-[var(--color-border)] text-[#2A1515] font-serif text-base sm:text-lg italic leading-relaxed mb-8">
                  {topic.summary}
                </div>

                {/* Database-Driven Ad (Lazy-loaded via IntersectionObserver) */}
                <AdContainer placement="ARTICLE_TOP" className="mb-8" />

                {/* Detailed Description */}
                <div className="prose prose-amber max-w-none text-[#23150D] space-y-4 font-['Marcellus'] text-base sm:text-lg leading-relaxed">
                  {topic.description.split('\n\n').map((paragraph, pIdx, arr) => {
                    const trimmed = paragraph.trim();
                    const showMidAd = pIdx === Math.floor(arr.length / 2) && arr.length >= 3;

                    let contentBlock = null;
                    if (trimmed.startsWith('### ')) {
                      contentBlock = (
                        <h3 key={pIdx} className="font-['Cinzel',serif] text-xl sm:text-2xl font-bold text-[#8B1E0F] pt-4">
                          {trimmed.replace(/^###\s+/, '')}
                        </h3>
                      );
                    } else if (trimmed.startsWith('#### ')) {
                      contentBlock = (
                        <h4 key={pIdx} className="font-['Cinzel',serif] text-lg font-bold text-[#A94A14] pt-2">
                          {trimmed.replace(/^####\s+/, '')}
                        </h4>
                      );
                    } else if (trimmed.startsWith('>')) {
                      contentBlock = (
                        <blockquote key={pIdx} className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-l-4 border-amber-600 italic text-[var(--color-text-heading)] my-4">
                          {trimmed.replace(/^>\s*/gm, '')}
                        </blockquote>
                      );
                    } else if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
                      contentBlock = (
                        <ul key={pIdx} className="space-y-2 list-disc pl-5 my-4">
                          {trimmed.split('\n').map((item, iIdx) => (
                            <li key={iIdx}>{item.replace(/^[-*]|\d+\.\s*/, '')}</li>
                          ))}
                        </ul>
                      );
                    } else {
                      contentBlock = <p key={pIdx}>{trimmed}</p>;
                    }

                    return (
                      <React.Fragment key={pIdx}>
                        {contentBlock}
                        {showMidAd && (
                          <div className="my-8">
                            <AdContainer placement="ARTICLE_MIDDLE" rootMargin="150px 0px" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </FolioReveal>

            {/* Topic ↔ Topic Relationships */}
            {(relations.outgoing.length > 0 || relations.incoming.length > 0) && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--color-border)] shadow-sm">
                <h3 className="font-['Cinzel',serif] text-xl font-bold text-[#2A1515] mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[var(--color-secondary)]" />
                  <span>Canonical Inter-Entity Matrix (Topic ↔ Topic)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relations.outgoing.map((rel) => (
                    <div
                      key={`out-${rel.relationId}`}
                      onClick={() => onNavigate(`/topic/${rel.slug}`)}
                      className="p-4 rounded-2xl bg-amber-50 hover:bg-[var(--color-pink-tint)] border border-[var(--color-border)] transition-all cursor-pointer group"
                    >
                      <span className="text-[10px] font-serif uppercase tracking-widest text-[var(--color-secondary)] font-bold block mb-1">
                        {formatRelationType(rel.relationType)}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-['Cinzel',serif] text-sm font-bold text-[var(--color-text-heading)] group-hover:text-[var(--color-secondary)]">
                          {rel.name}
                        </span>
                        {rel.sanskritName && (
                          <span className="text-xs text-[var(--color-secondary)] font-serif font-bold">
                            {rel.sanskritName}
                          </span>
                        )}
                      </div>
                      <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)] line-clamp-2 mt-1.5 leading-relaxed">
                        {rel.summary}
                      </p>
                    </div>
                  ))}

                  {relations.incoming.map((rel) => (
                    <div
                      key={`in-${rel.relationId}`}
                      onClick={() => onNavigate(`/topic/${rel.slug}`)}
                      className="p-4 rounded-2xl bg-amber-50 hover:bg-[var(--color-pink-tint)] border border-[var(--color-border)] transition-all cursor-pointer group"
                    >
                      <span className="text-[10px] font-serif uppercase tracking-widest text-[var(--color-secondary)] font-bold block mb-1">
                        Referred By ({formatRelationType(rel.relationType)})
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-['Cinzel',serif] text-sm font-bold text-[var(--color-text-heading)] group-hover:text-[var(--color-secondary)]">
                          {rel.name}
                        </span>
                        {rel.sanskritName && (
                          <span className="text-xs text-[var(--color-secondary)] font-serif font-bold">
                            {rel.sanskritName}
                          </span>
                        )}
                      </div>
                      <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)] line-clamp-2 mt-1.5 leading-relaxed">
                        {rel.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Articles Linking to this Topic */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--color-border)] shadow-sm">
              <h3 className="font-['Cinzel',serif] text-xl font-bold text-[#2A1515] mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--color-secondary)]" />
                <span>Knowledge Folios Referencing {topic.name} ({articles.length})</span>
              </h3>
              <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)] mb-6">
                All authentic shastric articles connected directly to this entity in the PostgreSQL database.
              </p>

              {articles.length === 0 ? (
                <p className="text-xs font-serif text-[var(--color-text-body)] italic py-4">
                  Treatises connecting to this spatial entity will appear here as the canonical repository expands.
                </p>
              ) : (
                <div className="space-y-4">
                  {articles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => onNavigate(`/knowledge/${art.slug}`)}
                      className="p-5 rounded-2xl bg-amber-50/70 hover:bg-[var(--color-pink-tint)]/90 border border-[var(--color-border)]/80 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {art.categoryName && (
                            <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[var(--color-secondary)] bg-[var(--color-pink-tint)] px-2 py-0.5 rounded">
                              {art.categoryName}
                            </span>
                          )}
                          <span className="text-xs text-[var(--color-text-body)] font-serif flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{art.readingTimeMinutes} min</span>
                          </span>
                        </div>
                        <h4 className="font-['Cinzel',serif] text-base font-bold text-[var(--color-text-heading)] group-hover:text-[var(--color-secondary)] transition-colors">
                          {art.title}
                        </h4>
                        <p className="font-['Marcellus'] text-xs text-[var(--color-text-body)] line-clamp-2 max-w-2xl">
                          {art.excerpt}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 text-xs font-serif font-bold text-[var(--color-secondary)] group-hover:translate-x-1 transition-transform">
                        <span>Read</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <AdContainer placement="SIDEBAR" />

            {/* Quick Entity Details Card */}
            <div className="p-6 rounded-2xl bg-white border border-[var(--color-border)] shadow-xs">
              <h4 className="font-['Cinzel',serif] text-sm font-bold text-[var(--color-text-heading)] pb-3 border-b border-[var(--color-border)] mb-4">
                Entity Registry Details
              </h4>
              <dl className="space-y-3 text-xs font-['Marcellus']">
                <div>
                  <dt className="text-[var(--color-text-body)] font-bold uppercase text-[10px]">Canonical Slug</dt>
                  <dd className="font-mono text-[var(--color-text-heading)] bg-[var(--color-pink-tint)]/70 px-2 py-0.5 rounded inline-block mt-0.5">
                    /topic/{topic.slug}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-body)] font-bold uppercase text-[10px]">Entity Classification</dt>
                  <dd className="text-[var(--color-text-heading)] font-semibold mt-0.5">{formatEntityType(topic.entityType)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-body)] font-bold uppercase text-[10px]">Sanskrit Devanagari</dt>
                  <dd className="text-[var(--color-text-heading)] font-['Rozha_One'] text-base mt-0.5">{topic.sanskritName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-body)] font-bold uppercase text-[10px]">Database Persistence</dt>
                  <dd className="text-emerald-800 font-bold mt-0.5">PostgreSQL Cloud SQL Single Source of Truth</dd>
                </div>
              </dl>
            </div>

            {/* Institutional Consultation Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2D160E] to-[#1A0C07] text-amber-100 border border-amber-600/40 shadow-md">
              <h4 className="font-['Cinzel',serif] text-base font-bold text-amber-300 mb-2">
                Need Guidance on {topic.name}?
              </h4>
              <p className="font-['Marcellus'] text-xs text-stone-300 leading-relaxed mb-4">
                Connect with classical Vastu Ritam scholars to understand practical architectural applications of this canonical entity.
              </p>
              <button
                onClick={() => onNavigate('/contact')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#2A1515] font-serif font-bold text-xs transition-colors shadow-sm cursor-pointer"
              >
                Inquire with Acharyas
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
