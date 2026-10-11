import React, { useState, useEffect } from 'react';
import { LibraryCategory, DictionaryTerm, Article, Handbook, MythItem, PageType } from '../types';
import { SHABD_KOSH_DATA, PRAKARAN_ARTICLES, HANDBOOKS_DATA, MYTHS_DATA } from '../data/vastuData';
import { FolioReveal } from './FolioReveal';
import { HandbookAccessModal, HandbookItem } from './HandbookAccessModal';
import { HandbookViewerModal } from './HandbookViewerModal';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  BookMarked,
  Video,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Play,
  FileText,
  ChevronRight,
  Sliders,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Type,
  X,
  ArrowLeft,
  Clock,
  User,
  Share2,
  ExternalLink,
  Compass,
  FolderOpen,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { AdvertisementBanner } from './AdBanner';
import { useTheme } from '../context/ThemeContext';

interface GyanKoshSectionProps {
  initialCategory?: LibraryCategory;
  onNavigate?: (page: PageType, subTab?: string) => void;
}

export const GyanKoshSection: React.FC<GyanKoshSectionProps> = ({
  initialCategory = 'shabd-kosh',
  onNavigate,
}) => {
  const { isLight } = useTheme();
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDictFilter, setSelectedDictFilter] = useState<string>('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [activeMythId, setActiveMythId] = useState<string>('1');

  // Reading Mode State & Typography Controls
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Database-Driven Video Learning State
  const [dbVideos, setDbVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<any | null>(null);
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');
  const [videoCategoryFilter, setVideoCategoryFilter] = useState<string>('All');

  // Database-Driven Handbooks & Client Reading Vault State
  const [dbHandbooks, setDbHandbooks] = useState<HandbookItem[]>(HANDBOOKS_DATA as any);
  const [selectedHandbookForAccess, setSelectedHandbookForAccess] = useState<HandbookItem | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [activeReadingHandbook, setActiveReadingHandbook] = useState<HandbookItem | null>(null);
  const [readingToken, setReadingToken] = useState<string | null>(null);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);

  const fetchDatabaseHandbooks = async () => {
    try {
      const res = await fetch('/api/handbooks');
      if (res.ok) {
        const data = await res.json();
        if (data.handbooks && data.handbooks.length > 0) {
          setDbHandbooks(data.handbooks);
        }
      }
    } catch (err) {
      console.warn('Using fallback handbooks:', err);
    }
  };

  const handleReadHandbookClick = (hb: HandbookItem) => {
    // Check if token already exists in session for this handbook
    let savedToken: string | null = null;
    try {
      savedToken = sessionStorage.getItem(`vr_hb_token_${hb.id}`);
    } catch {}

    if (savedToken) {
      setActiveReadingHandbook(hb);
      setReadingToken(savedToken);
      setIsViewerModalOpen(true);
    } else {
      setSelectedHandbookForAccess(hb);
      setIsAccessModalOpen(true);
    }
  };

  const handleAccessGranted = (token: string, hb: HandbookItem) => {
    setIsAccessModalOpen(false);
    setSelectedHandbookForAccess(null);
    setActiveReadingHandbook(hb);
    setReadingToken(token);
    setIsViewerModalOpen(true);
  };

  useEffect(() => {
    if (activeCategory === 'handbooks') {
      fetchDatabaseHandbooks();
    }
  }, [activeCategory]);

  const fetchDatabaseVideos = async () => {
    try {
      setLoadingVideos(true);
      setVideoError(null);
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error('Failed to load video library');
      const data = await res.json();
      setDbVideos(data.videos || []);
    } catch (err: any) {
      console.error('Error loading database videos:', err);
      setVideoError('Unable to load video archives. Please try again.');
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    if (activeCategory === 'videos') {
      fetchDatabaseVideos();
    }
  }, [activeCategory]);

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);

  const libraryTabs: { id: LibraryCategory; label: string; sanskrit: string }[] = [
    { id: 'shabd-kosh', label: 'Vastu Shabd Kosh', sanskrit: 'वास्तु शब्दकोशः' },
    { id: 'prakaran', label: 'Prakaaran (Articles)', sanskrit: 'प्रकरणानि' },
    { id: 'handbooks', label: 'Handbooks and Guides', sanskrit: 'हस्तपुस्तिका' },
    { id: 'videos', label: 'Videos', sanskrit: 'दृश्य-माध्यम' },
    { id: 'myths', label: 'Vastu Myths and Misconceptions', sanskrit: 'भ्रान्ति-निवारणम्' },
  ];

  // Filter dictionary terms
  const filteredTerms = SHABD_KOSH_DATA.filter((item) => {
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sanskrit.includes(searchTerm) ||
      item.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedDictFilter === 'All' || item.category === selectedDictFilter;
    return matchesSearch && matchesCategory;
  });

  // Typography font size class helper
  const getFontSizeClasses = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg sm:text-xl leading-relaxed sm:leading-[2.1]';
      case 'xlarge':
        return 'text-xl sm:text-2xl leading-loose sm:leading-[2.3]';
      default:
        return 'text-base sm:text-lg leading-relaxed sm:leading-[1.9]';
    }
  };

  /**
   * Renders the article body with the AdvertisementBanner placed at a logical breakpoint
   */
  const renderArticleContentWithAds = (content: string) => {
    const rawParagraphs = content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const paragraphs =
      rawParagraphs.length === 1 && rawParagraphs[0].includes('\n')
        ? rawParagraphs[0].split(/\n/).map((p) => p.trim()).filter(Boolean)
        : rawParagraphs;

    const breakpointIndex = paragraphs.length > 2 ? 2 : 1;
    const firstBlock = paragraphs.slice(0, breakpointIndex);
    const secondBlock = paragraphs.slice(breakpointIndex);

    return (
      <div className={`space-y-6 ${getFontSizeClasses()} font-['Marcellus'] text-[#2D1B14]`}>
        {/* First block of paragraphs */}
        {firstBlock.map((para, idx) => (
          <p
            key={`p-start-${idx}`}
            className={`text-[#2D1B14] leading-relaxed ${
              idx === 0
                ? 'first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-black first-letter:text-[#6B1F1F] first-letter:mr-2.5 first-letter:float-left first-letter:leading-none'
                : ''
            }`}
          >
            {para}
          </p>
        ))}

        {/* Logical Breakpoint: In-Article Advertisement Banner */}
        <div className="my-8 py-2 not-prose select-none">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <span className="h-[1.5px] w-10 bg-[#D4A72C]" />
            <span className="text-[10px] font-serif uppercase tracking-widest text-[#2D1B14] font-bold bg-[#E88A16] px-3 py-1 rounded-full border border-[#D4A72C]">
              Sponsored Architectural Resource
            </span>
            <span className="h-[1.5px] w-10 bg-[#D4A72C]" />
          </div>
          <AdvertisementBanner placement="article-inline" />
        </div>

        {/* Second block of paragraphs */}
        {secondBlock.map((para, idx) => (
          <p key={`p-end-${idx}`} className="text-[#2D1B14] leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    );
  };

  /**
   * Component for the Article Detail Reading Experience
   */
  const renderArticleReader = (isModal: boolean = false) => {
    if (!selectedArticle) return null;

    return (
      <article
        className={`w-full bg-[#F4E5C7] text-[#2D1B14] rounded-3xl border-2 border-[#D4A72C] shadow-2xl golden-aura-strong p-6 sm:p-10 md:p-12 text-left relative overflow-hidden transition-all ${
          isModal ? 'max-w-3xl my-auto animate-in zoom-in-95 duration-200' : 'max-w-4xl mx-auto'
        }`}
      >
        {/* Subtle Manuscript Accent Ribbon in Saffron & Maroon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#6B1F1F] via-[#E88A16] to-[#0F5C55]" />

        {/* Top Reading Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#D4A72C]/60 pb-4 mb-6">
          <button
            onClick={() => {
              if (isModal) {
                setIsReadingMode(false);
              }
              setSelectedArticle(null);
            }}
            className="text-xs font-serif font-bold text-[#FFF7ED] bg-[#6B1F1F] hover:bg-[#B94E2C] flex items-center gap-1.5 cursor-pointer px-3.5 py-1.5 rounded-xl border border-[#D4A72C] shadow-md transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#D4A72C]" />
            <span>Back to Treatises</span>
          </button>

          {/* Reading Experience Controls */}
          <div className="flex items-center gap-2">
            {/* Font Size Adjuster */}
            <div className="flex items-center bg-[#2D1B14] rounded-xl border border-[#D4A72C] p-0.5 text-xs font-serif text-[#FFF7ED] shadow-sm">
              <span className="px-2 text-[#E8D3A8] text-[10px] uppercase font-bold flex items-center gap-1">
                <Type className="w-3 h-3 text-[#D4A72C]" />
                <span className="hidden sm:inline">Text</span>
              </span>
              <button
                onClick={() => setFontSize('normal')}
                title="Default text size"
                className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                  fontSize === 'normal' ? 'bg-[#E88A16] text-[#2D1B14] font-bold' : 'text-[#E8D3A8]'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                title="Large text size"
                className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                  fontSize === 'large' ? 'bg-[#E88A16] text-[#2D1B14] font-bold' : 'text-[#E8D3A8]'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                title="Extra large text size"
                className={`px-2 py-0.5 rounded-lg text-xs cursor-pointer ${
                  fontSize === 'xlarge' ? 'bg-[#E88A16] text-[#2D1B14] font-bold' : 'text-[#E8D3A8]'
                }`}
              >
                A++
              </button>
            </div>

            {/* Reading Mode Focus Toggle */}
            <button
              onClick={() => setIsReadingMode(!isReadingMode)}
              title={isReadingMode ? 'Exit Distraction-Free Reading Mode' : 'Enter Distraction-Free Reading Mode'}
              className={`px-3 py-1.5 rounded-xl font-serif text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isReadingMode
                  ? 'bg-[#B94E2C] text-[#FFF7ED] border border-[#D4A72C]'
                  : 'bg-[#0F5C55] text-[#FFF7ED] border border-[#D4A72C]'
              }`}
            >
              {isReadingMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-[#D4A72C]" />
                  <span className="hidden sm:inline">Exit Focus</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-[#D4A72C]" />
                  <span>Reading Mode</span>
                </>
              )}
            </button>

            {isModal && (
              <button
                onClick={() => setIsReadingMode(false)}
                className="p-1.5 rounded-xl bg-[#2D1B14] hover:bg-[#6B1F1F] text-[#D4A72C] border border-[#D4A72C] transition-colors cursor-pointer"
                title="Close Focus View"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Article Meta Header */}
        <div className="space-y-2 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-serif">
            <span className="bg-[#6B1F1F] text-[#FFF7ED] font-bold px-3 py-1 rounded-full border border-[#D4A72C]">
              {selectedArticle.category}
            </span>
            <span className="text-[#6B1F1F]">·</span>
            <span className="flex items-center gap-1 text-[#2D1B14] font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#B94E2C]" />
              <span>{selectedArticle.readTime}</span>
            </span>
            <span className="text-[#6B1F1F]">·</span>
            <span className="flex items-center gap-1 text-[#0F5C55] font-bold">
              <User className="w-3.5 h-3.5 text-[#0F5C55]" />
              <span>{selectedArticle.author}</span>
            </span>
          </div>

          <h2 className="font-['Cinzel_Decorative'] text-2xl sm:text-3xl lg:text-4xl font-black text-[#2D1B14] leading-tight">
            {selectedArticle.title}
          </h2>

          {selectedArticle.sanskritTitle && (
            <div className="text-lg sm:text-xl font-['Yatra_One'] text-[#6B1F1F] pt-0.5">
              ॥ {selectedArticle.sanskritTitle} ॥
            </div>
          )}
        </div>

        {/* Key Shastric Takeaway Quote Card in Terracotta/Gold */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2D1B14] to-[#3B1111] rounded-2xl border-l-4 border-[#E88A16] border-y border-r border-[#D4A72C] mb-8 font-['Marcellus'] text-sm sm:text-base text-[#FFF7ED] shadow-xl">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#D4A72C] font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#E88A16]" />
            <span>Key Shastric Principle:</span>
          </div>
          <p className="italic leading-relaxed text-[#E8D3A8]">{selectedArticle.keyTakeaway}</p>
        </div>

        {/* Main Article Content with In-Article Advertisement at Breakpoint */}
        <div className="border-t-2 border-[#D4A72C]/40 pt-6">
          {renderArticleContentWithAds(selectedArticle.content)}
        </div>

        {/* Article Reading Footer & Next Steps */}
        <div className="mt-10 pt-6 border-t-2 border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-serif text-zinc-400 italic text-center sm:text-left font-medium">
            Published under the research auspices of Vastu Ritam Academic Repository.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (isModal) {
                  setIsReadingMode(false);
                }
                setSelectedArticle(null);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#6B1F1F] hover:bg-[#B94E2C] text-[#FFF7ED] font-serif text-xs font-bold border border-[#D4A72C] shadow-md transition-all cursor-pointer"
            >
              Close Treatise
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className={`space-y-10 transition-colors duration-300 py-6`}>
      {/* Dimmed Background Overlay when Reading Mode is Active on an Open Article */}
      {selectedArticle && isReadingMode && (
        <div
          className="fixed inset-0 z-50 bg-[#1A0F0A]/90 backdrop-blur-md overflow-y-auto p-3 sm:p-6 md:p-8 flex justify-center items-start animate-in fade-in duration-300"
          aria-modal="true"
          role="dialog"
        >
          {renderArticleReader(true)}
        </div>
      )}

      {/* Main Header & Repository Intro on Rich Heritage Grounding */}
      <FolioReveal>
        <div className="text-center max-w-3xl mx-auto space-y-3 px-4 sm:px-6 mb-8">
          <span className="text-xs font-bold tracking-widest text-[#2D1B14] uppercase bg-[#E88A16] px-4 py-1 rounded-full border-2 border-[#D4A72C] shadow-md">
            Vedic Repository & Intellectual Archive
          </span>
          <h1
            className={`font-['Cinzel_Decorative'] font-black text-3xl sm:text-4xl md:text-5xl tracking-wide drop-shadow-md ${
              isLight ? 'text-stone-950' : 'text-[#FFF7ED]'
            }`}
          >
            VASTU GYAN-KOSH <span className={`font-['Marcellus'] font-normal text-2xl sm:text-3xl md:text-4xl ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>(LIBRARY)</span>
          </h1>
          <p className="font-['Rozha_One'] text-xl sm:text-2xl text-[#E88A16]">
            “We do not aspire to have the most answers. We aspire to cultivate the clearest understanding.”
          </p>
          <p
            className={`font-['Marcellus'] text-sm sm:text-base leading-relaxed ${
              isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]'
            }`}
          >
            A dedicated intellectual sanctuary for architects, students, researchers, and discerning homeowners seeking classical Shastric wisdom uncorrupted by commercial trends.
          </p>
        </div>
      </FolioReveal>

      {/* Sponsored Partner Banner at top of Library */}
      <FolioReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <AdvertisementBanner placement="library-top" />
        </div>
      </FolioReveal>

      {/* Heritage Colored Library Tabs */}
      <FolioReveal>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#D4A72C]/40 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 flex-1">
            {libraryTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setSelectedArticle(null);
                  }}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all cursor-pointer font-serif flex items-center gap-2 shadow-md ${
                    isActive
                      ? 'bg-[#E88A16] text-[#2D1B14] border-2 border-[#6B1F1F] font-black scale-105 shadow-[0_0_15px_rgba(232,138,22,0.4)]'
                      : isLight
                      ? 'bg-white border-2 border-[var(--color-border)] text-[var(--color-text-heading)] hover:bg-amber-50 hover:text-amber-900 shadow-xs'
                      : 'bg-[#2D1B14] border-2 border-[#D4A72C]/70 text-[#E8D3A8] hover:bg-[#6B1F1F] hover:text-[#FFF7ED]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#6B1F1F]' : 'bg-[#D4A72C]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Secondary Action Toolbar: Reading Mode Switch & Ad Admin */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsReadingMode(!isReadingMode)}
              title={isReadingMode ? 'Disable Reading Mode' : 'Enable Focused Reading Mode'}
              className={`px-3.5 py-2 rounded-xl font-serif text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isReadingMode
                  ? 'bg-[#B94E2C] text-[#FFF7ED] border border-[#D4A72C]'
                  : isLight
                  ? 'bg-white hover:bg-stone-100 text-[var(--color-text-heading)] border border-[var(--color-border)] shadow-xs'
                  : 'bg-[#2D1B14] hover:bg-[#6B1F1F] text-[#E8D3A8] border border-[#D4A72C]/60'
              }`}
            >
              {isReadingMode ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#D4A72C]" />
                  <span>Reading Mode ON</span>
                </>
              ) : (
                <>
                  <EyeOff className={`w-3.5 h-3.5 ${isLight ? 'text-amber-700' : 'text-[#D4A72C]'}`} />
                  <span>Reading Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </FolioReveal>

      {/* Main Content Area Container: Theme-Aware Heritage Container */}
      <FolioReveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-3xl border-2 shadow-2xl p-6 sm:p-10 animate-in fade-in duration-200 text-left relative overflow-hidden bg-vastu-grid ${
              isLight
                ? 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF3E6] to-[#F5EADB] border-[var(--color-border)] text-[var(--color-text-heading)] shadow-amber-900/10'
                : 'section-teal-heritage border-[#D4A72C] text-[#FFF7ED]'
            }`}
          >
            {/* Subtle Manuscript Thread Holes */}
            <div
              className={`absolute top-6 left-6 w-3.5 h-3.5 rounded-full border-2 hidden md:block ${
                isLight ? 'bg-[var(--color-pink-tint)] border-amber-500' : 'bg-[#1A0F0A] border-[#D4A72C]'
              }`}
            />
            <div
              className={`absolute top-6 right-6 w-3.5 h-3.5 rounded-full border-2 hidden md:block ${
                isLight ? 'bg-[var(--color-pink-tint)] border-amber-500' : 'bg-[#1A0F0A] border-[#D4A72C]'
              }`}
            />

          {/* Category 1: Vastu Shabd-Kosh (Dictionary) */}
          {activeCategory === 'shabd-kosh' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#D4A72C]/40 pb-5">
                <div>
                  <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                    वास्तु शब्दकोशः
                  </span>
                  <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-[var(--color-text-heading)]' : 'text-[#FFF7ED]'}`}>
                    Vastu Shabd-Kosh (Classical Lexicon)
                  </h2>
                  <p className={`font-['Marcellus'] text-sm mt-1 ${isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]'}`}>
                    Comprehensive glossary of classical Sanskrit architectural terms, metaphysical concepts, and spatial definitions.
                  </p>
                </div>

                {/* Search Bar in Rich Heritage Styling */}
                <div className="relative w-full md:w-72">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-amber-700' : 'text-[#D4A72C]'}`} />
                  <input
                    type="text"
                    placeholder="Search Sanskrit term or concept..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 text-xs font-['Marcellus'] transition-colors ${
                      isLight
                        ? 'bg-white text-[var(--color-text-heading)] placeholder:text-stone-400 border-[var(--color-border)] focus:outline-amber-600 shadow-xs'
                        : 'bg-[#2D1B14] text-[#FFF7ED] placeholder:text-[#E8D3A8]/60 border-[#D4A72C] focus:outline-[#E88A16]'
                    }`}
                  />
                </div>
              </div>

              {/* Category Filter Chips in Rich Heritage Colors */}
              <div className="flex flex-wrap gap-2">
                {['All', 'Foundations & Energy', 'Spatial Matrix', 'Deities & Cosmography', 'Architectural Math'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDictFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-serif transition-colors cursor-pointer border shadow-sm ${
                      selectedDictFilter === cat
                        ? 'bg-[#E88A16] text-[#2D1B14] font-black border-[#D4A72C]'
                        : isLight
                        ? 'bg-white border-[var(--color-border)] text-[var(--color-text-body)] hover:bg-[var(--color-pink-tint)] hover:text-[var(--color-text-heading)]'
                        : 'bg-[#2D1B14] border-[#D4A72C]/60 text-[#E8D3A8] hover:bg-[#6B1F1F] hover:text-[#FFF7ED]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Terms Grid: Alternating Sandstone, Terracotta, Maroon & Indigo Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTerms.map((item, idx) => {
                  const cardStyles = [
                    'bg-[#E8D3A8] text-[#2D1B14] border-[#D4A72C]', // Sand
                    'bg-[#B94E2C] text-[#FFF7ED] border-[#D4A72C]', // Terracotta
                    'bg-[#6B1F1F] text-[#FFF7ED] border-[#D4A72C]', // Maroon
                    'bg-[#283B63] text-[#FFF7ED] border-[#D4A72C]', // Indigo
                    'bg-[#2D1B14] text-[#FFF7ED] border-[#E88A16]', // Dark Brown
                  ];
                  const currentStyle = cardStyles[idx % cardStyles.length];
                  const isLightCard = currentStyle.includes('#E8D3A8');

                  return (
                    <div
                      key={item.id}
                      className={`p-5 rounded-2xl border-2 shadow-lg space-y-3 hover:scale-102 transition-transform ${currentStyle}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-serif uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                          isLightCard ? 'bg-[#6B1F1F] text-[#FFF7ED]' : 'bg-[#E88A16] text-[#2D1B14]'
                        }`}>
                          {item.category}
                        </span>
                        <span className={`text-xs font-serif ${isLightCard ? 'text-[#6B1F1F]' : 'text-[#D4A72C]'}`}>
                          #{item.id}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-['Cinzel_Decorative'] text-lg font-black leading-snug">
                          {item.term}
                        </h3>
                        <div className={`text-sm font-['Yatra_One'] ${isLightCard ? 'text-[#0F5C55]' : 'text-[#D4A72C]'}`}>
                          {item.sanskrit}
                        </div>
                      </div>

                      <p className="font-['Marcellus'] text-xs sm:text-sm leading-relaxed">
                        {item.meaning}
                      </p>

                      <div className={`pt-2 border-t text-[11px] font-serif italic ${
                        isLightCard ? 'border-[#D4A72C]/60 text-[#3A2318]' : 'border-[#D4A72C]/40 text-[#E8D3A8]'
                      }`}>
                        Ref: {item.scripturalReference}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTerms.length === 0 && (
                <div className="p-12 text-center text-[#E8D3A8] font-['Marcellus'] bg-[#2D1B14]/80 rounded-2xl border border-[#D4A72C]">
                  No Sanskrit terms found matching "{searchTerm}". Try another keyword or clear filter.
                </div>
              )}
            </div>
          )}

          {/* Category 2: Prakaran (Scholarly Treatises / Articles) */}
          {activeCategory === 'prakaran' && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#D4A72C]/40 pb-5">
                <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                  प्रकरणानि · शोध-निबन्धाः
                </span>
                <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-[var(--color-text-heading)]' : 'text-[#FFF7ED]'}`}>
                  Prakaaran (Articles)
                </h2>
                <p className={`font-['Marcellus'] text-sm mt-1 ${isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]'}`}>
                  Rigorous textual studies linking classical treatises (Mayamatam, Manasara, Samarangana Sutradhara) to contemporary environmental physics.
                </p>
              </div>

              {/* Embedded Reading View or Articles Listing */}
              {selectedArticle && !isReadingMode ? (
                renderArticleReader(false)
              ) : (
                /* Articles Directory Listing in Alternating Sand & Terracotta Cards */
                <div className="space-y-5">
                  {PRAKARAN_ARTICLES.map((article, idx) => {
                    const isEven = idx % 2 === 0;
                    return (
                      <div
                        key={article.id}
                        className={`p-6 rounded-2xl border-2 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:scale-101 transition-transform ${
                          isEven
                            ? isLight
                              ? 'bg-white text-[var(--color-text-heading)] border-[var(--color-border)]'
                              : 'bg-[#E8D3A8] text-[#2D1B14] border-[#D4A72C]'
                            : isLight
                            ? 'bg-[#FFF7F2] text-amber-950 border-[var(--color-border)]/80'
                            : 'bg-[#B94E2C] text-[#FFF7ED] border-[#D4A72C]'
                        }`}
                      >
                        <div className="space-y-2 max-w-2xl text-left">
                          <div className="flex items-center gap-2 text-xs font-serif">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                              isEven ? 'bg-[#6B1F1F] text-[#FFF7ED]' : 'bg-[#2D1B14] text-[#D4A72C]'
                            }`}>
                              {article.category}
                            </span>
                            <span>·</span>
                            <span className={`flex items-center gap-1 font-semibold ${isEven ? (isLight ? 'text-[var(--color-text-body)]' : 'text-[#3A2318]') : (isLight ? 'text-amber-800' : 'text-[#E8D3A8]')}`}>
                              <Clock className="w-3.5 h-3.5" />
                              <span>{article.readTime}</span>
                            </span>
                          </div>
                          <h3 className="font-['Cinzel_Decorative'] text-xl font-black leading-snug">
                            {article.title}
                          </h3>
                          {article.sanskritTitle && (
                            <div className={`text-sm font-['Yatra_One'] ${isEven ? 'text-[#6B1F1F]' : (isLight ? 'text-amber-800' : 'text-[#FDE68A]')}`}>
                              ॥ {article.sanskritTitle} ॥
                            </div>
                          )}
                          <p className={`font-['Marcellus'] text-sm leading-relaxed ${isLight ? 'text-[var(--color-text-body)]' : ''}`}>
                            {article.summary}
                          </p>
                          <div className={`text-xs font-serif italic pt-1 ${isEven ? 'text-[#0F5C55]' : (isLight ? 'text-amber-800' : 'text-[#D4A72C]')}`}>
                            Authored by: {article.author}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedArticle(article);
                              setIsReadingMode(false);
                            }}
                            className={`px-4 py-2.5 rounded-xl border-2 font-serif text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                              isEven
                                ? 'bg-[#6B1F1F] text-[#FFF7ED] border-[#D4A72C] hover:bg-[#B94E2C]'
                                : 'bg-[#E88A16] text-[#2D1B14] border-[#D4A72C] hover:bg-[#D97706]'
                            }`}
                          >
                            <span>Read Treatise</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedArticle(article);
                              setIsReadingMode(true);
                            }}
                            title="Open in Distraction-Free Reading Mode"
                            className="px-3.5 py-2.5 rounded-xl bg-[#2D1B14] hover:bg-[#0F5C55] text-[#D4A72C] border-2 border-[#D4A72C] font-serif text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Maximize2 className="w-3.5 h-3.5 text-[#D4A72C]" />
                            <span className="hidden sm:inline">Focus Mode</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Category 3: Handbooks */}
          {activeCategory === 'handbooks' && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#D4A72C]/40 pb-5">
                <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                  हस्तपुस्तिका
                </span>
                <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-[var(--color-text-heading)]' : 'text-[#FFF7ED]'}`}>
                  Classical Handbooks & Field Guides
                </h2>
                <p className={`font-['Marcellus'] text-sm mt-1 ${isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]'}`}>
                  Structured reference manuals for professionals, architectural students, civil engineers, and prospective home purchasers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dbHandbooks.map((hb, idx) => {
                  const cardThemes = [
                    isLight ? 'bg-white text-[var(--color-text-heading)] border-[var(--color-border)]' : 'bg-[#E8D3A8] text-[#2D1B14] border-[#D4A72C]',
                    isLight ? 'bg-[#FFF7F2] text-amber-950 border-[var(--color-border)]/80' : 'bg-[#B94E2C] text-[#FFF7ED] border-[#D4A72C]',
                    isLight ? 'bg-[#F0FAF7] text-teal-950 border-teal-400/80' : 'bg-[#6B1F1F] text-[#FFF7ED] border-[#D4A72C]',
                  ];
                  const currentTheme = cardThemes[idx % cardThemes.length];
                  const isLightCard = isLight || currentTheme.includes('#E8D3A8');

                  return (
                    <div
                      key={hb.id}
                      className={`p-6 rounded-2xl border-2 shadow-xl flex flex-col justify-between space-y-4 hover:scale-102 transition-transform ${currentTheme}`}
                    >
                      <div className="space-y-3">
                        <span className={`text-[11px] font-serif uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${
                          isLightCard ? 'bg-[#6B1F1F] text-[#FFF7ED]' : 'bg-[#E88A16] text-[#2D1B14]'
                        }`}>
                          {hb.targetAudience}
                        </span>
                        <h3 className="font-['Cinzel_Decorative'] text-lg font-black leading-snug">
                          {hb.title}
                        </h3>
                        <p className={`font-['Marcellus'] text-xs italic ${isLightCard ? 'text-[#9A3412]' : 'text-[#FDE68A]'}`}>
                          {hb.subtitle}
                        </p>
                        <p className={`font-['Marcellus'] text-xs leading-relaxed ${isLight ? 'text-[var(--color-text-body)]' : ''}`}>
                          {hb.summary}
                        </p>

                        <div className="space-y-1 pt-2">
                          <span className={`text-[11px] font-serif font-bold block ${isLightCard ? 'text-[var(--color-text-heading)]' : ''}`}>
                            Included Modules:
                          </span>
                          <ul className="text-xs font-['Marcellus'] space-y-1">
                            {(hb.topics || []).map((t, topicIdx) => (
                              <li key={topicIdx} className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${isLightCard ? 'bg-[#6B1F1F]' : 'bg-[#D4A72C]'}`} />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className={`pt-4 border-t text-xs font-serif flex items-center justify-between ${
                        isLightCard ? 'border-[var(--color-border)] text-[var(--color-text-body)]' : 'border-[#D4A72C]/40 text-[#E8D3A8]'
                      }`}>
                        <span>{hb.pages || 40} Folio Pages</span>
                        <button
                          onClick={() => handleReadHandbookClick(hb)}
                          className={`px-4 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer shadow-sm hover:shadow-md flex items-center gap-1.5 ${
                            isLight
                              ? 'bg-[#6B1F1F] text-[#FFF7ED] border-[#D4A72C] hover:bg-[#B94E2C]'
                              : 'bg-[#E88A16] text-[#2D1B14] border-[#D4A72C] hover:bg-[#D97706]'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Handbook</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category 4: Videos (Database-Driven Video Learning Management) */}
          {activeCategory === 'videos' && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#D4A72C]/40 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className={`text-xs uppercase font-serif tracking-wider font-bold ${isLight ? 'text-amber-800' : 'text-[#D4A72C]'}`}>
                    दृश्य-माध्यम · Recorded Discourses
                  </span>
                  <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${isLight ? 'text-[var(--color-text-heading)]' : 'text-[#FFF7ED]'}`}>
                    Video Archives & Research Lectures
                  </h2>
                  <p className={`font-['Marcellus'] text-sm mt-1 ${isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]'}`}>
                    Scholarly discussions, architectural case evaluations, and debunking sessions recorded at academic forums.
                  </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-[var(--color-text-body)]' : 'text-stone-400'}`} />
                    <input
                      type="text"
                      placeholder="Search discourses..."
                      value={videoSearchQuery}
                      onChange={(e) => setVideoSearchQuery(e.target.value)}
                      className={`pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none transition-colors ${
                        isLight
                          ? 'bg-white border-2 border-[var(--color-border)] text-[var(--color-text-heading)] placeholder-stone-400 focus:border-amber-600 shadow-2xs'
                          : 'bg-[#2D1B14] border border-[#D4A72C]/50 text-[#FFF7ED] placeholder-stone-400 focus:border-[#D4A72C]'
                      }`}
                    />
                  </div>

                  <button
                    onClick={fetchDatabaseVideos}
                    title="Refresh video catalog"
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-stone-100 text-amber-800 border-[var(--color-border)] shadow-2xs'
                        : 'bg-[#2D1B14] hover:bg-[#3D251C] text-[#D4A72C] border-[#D4A72C]/50'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingVideos ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Video Grid from Database */}
              {loadingVideos ? (
                <div className="p-16 text-center text-[#E8D3A8] flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#D4A72C]" />
                  <p className="font-['Marcellus'] text-sm">Consulting Video Archives...</p>
                </div>
              ) : videoError ? (
                <div className="p-8 rounded-2xl bg-red-950/60 border border-red-800 text-center space-y-3">
                  <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
                  <p className="text-red-200 text-sm font-serif">{videoError}</p>
                  <button
                    onClick={fetchDatabaseVideos}
                    className="px-4 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-xs text-white font-bold cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : dbVideos.length === 0 ? (
                <div className="p-16 rounded-3xl bg-[#2D1B14]/80 border-2 border-dashed border-[#D4A72C]/40 text-center space-y-3">
                  <Video className="w-12 h-12 text-[#D4A72C]/60 mx-auto" />
                  <h3 className="font-['Cinzel_Decorative'] text-lg font-bold text-[#FFF7ED]">
                    No Published Discourses Available Yet
                  </h3>
                  <p className="font-['Marcellus'] text-[#E8D3A8] text-xs max-w-md mx-auto">
                    New scholarly recordings and architectural evaluations will be published by the fellowship shortly.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dbVideos
                    .filter((vid) => {
                      if (!videoSearchQuery.trim()) return true;
                      const q = videoSearchQuery.toLowerCase();
                      return (
                        vid.title.toLowerCase().includes(q) ||
                        vid.description.toLowerCase().includes(q) ||
                        vid.instructor?.toLowerCase().includes(q) ||
                        vid.topicName?.toLowerCase().includes(q)
                      );
                    })
                    .map((vid) => {
                      const isYt = vid.videoProvider?.toLowerCase() === 'youtube';
                      const isVimeo = vid.videoProvider?.toLowerCase() === 'vimeo';

                      return (
                        <div
                          key={vid.id}
                          className={`rounded-2xl border-2 overflow-hidden shadow-xl group transition-all flex flex-col justify-between ${
                            isLight
                              ? 'bg-white border-[var(--color-border)] text-[var(--color-text-heading)] shadow-amber-900/10 hover:shadow-xl'
                              : 'bg-[#2D1B14] border-[#D4A72C] text-[#FFF7ED] hover:shadow-[0_0_25px_rgba(212,167,44,0.25)]'
                          }`}
                        >
                          <div>
                            {/* Clickable Aspect-Video Thumbnail */}
                            <div
                              onClick={() => setActiveVideoModal(vid)}
                              className="relative aspect-video bg-stone-950 overflow-hidden cursor-pointer group/thumb"
                            >
                              <img
                                src={vid.thumbnailUrl}
                                alt={vid.title}
                                className="w-full h-full object-cover opacity-85 group-hover/thumb:opacity-100 group-hover/thumb:scale-105 transition-all duration-500"
                                onError={(e) => {
                                  (e.target as HTMLElement).setAttribute('src', '/hero-sanctuary.jpg');
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0F0A] via-transparent to-black/30" />

                              {/* Glowing Golden Play Button */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#D4A72C] to-[#E88A16] text-[#2D1B14] border-2 border-[#FFF7ED] flex items-center justify-center shadow-2xl group-hover/thumb:scale-115 transition-transform duration-300">
                                  <Play className="w-6 h-6 fill-current ml-0.5" />
                                </div>
                              </div>

                              {/* External Provider Badge */}
                              <span className="absolute top-3 left-3 bg-[#1A0F0A]/90 backdrop-blur-sm border border-[#D4A72C]/60 text-amber-200 text-[10px] font-serif font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                {isYt && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                {isVimeo && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                                <span className="capitalize">{vid.videoProvider}</span>
                              </span>

                              {/* Duration Badge */}
                              {vid.duration && (
                                <span className="absolute bottom-3 right-3 bg-[#1A0F0A]/90 border border-[#D4A72C]/60 text-[#D4A72C] text-xs font-serif px-2.5 py-0.5 rounded-md">
                                  {vid.duration}
                                </span>
                              )}
                            </div>

                            {/* Card Details */}
                            <div className="p-5 space-y-2.5 text-left">
                              {/* Entity / Category Tags */}
                              <div className="flex flex-wrap items-center gap-2">
                                {vid.topicName && (
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-serif uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    isLight
                                      ? 'bg-[var(--color-pink-tint)] border-[var(--color-border)] text-amber-900 font-bold'
                                      : 'bg-amber-950/80 border-amber-700/60 text-[#D4A72C]'
                                  }`}>
                                    <Compass className="w-2.5 h-2.5" />
                                    <span>{vid.topicName}</span>
                                  </span>
                                )}
                                {vid.categoryName && (
                                  <span className={`inline-flex items-center gap-1 text-[10px] font-serif ${
                                    isLight ? 'text-[var(--color-text-body)]' : 'text-stone-300'
                                  }`}>
                                    <FolderOpen className="w-2.5 h-2.5 text-[#E88A16]" />
                                    <span>{vid.categoryName}</span>
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <h3
                                onClick={() => setActiveVideoModal(vid)}
                                className={`font-['Cinzel_Decorative'] text-base sm:text-lg font-bold leading-snug transition-colors cursor-pointer ${
                                  isLight ? 'text-stone-950 hover:text-amber-800' : 'text-[#FFF7ED] hover:text-[#D4A72C]'
                                }`}
                              >
                                {vid.title}
                              </h3>

                              {/* Short Description */}
                              <p className={`font-['Marcellus'] text-xs sm:text-sm leading-relaxed line-clamp-3 ${
                                isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]/90'
                              }`}>
                                {vid.description}
                              </p>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className={`p-5 pt-0 flex items-center justify-between gap-2 border-t mt-3 pt-3 ${
                            isLight ? 'border-[var(--color-border)]' : 'border-[#D4A72C]/20'
                          }`}>
                            <span className={`text-xs font-serif truncate ${isLight ? 'text-zinc-800 font-bold' : 'text-zinc-200'}`}>
                              {vid.instructor ? `✦ ${vid.instructor}` : '✦ Vastu Ritam Fellowship'}
                            </span>

                            <button
                              onClick={() => setActiveVideoModal(vid)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#E88A16] hover:bg-[#D97706] text-[#2D1B14] font-serif font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Watch Discourse</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Public Video Playback Modal (Safe Official Embed) */}
              {activeVideoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className={`relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-4 max-h-[95vh] overflow-y-auto border-2 ${
                    isLight
                      ? 'bg-[#FAF6EE] border-[#D5C2B5] text-[#2A1515]'
                      : 'bg-[#1A0F0A] border-[#D4A72C] text-stone-200'
                  }`}>
                    {/* Header */}
                    <div className={`flex items-start justify-between gap-4 pb-3 border-b ${
                      isLight ? 'border-[#E8DEC8]' : 'border-[#D4A72C]/40'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs uppercase font-serif font-bold tracking-wider ${
                            isLight ? 'text-[#075B2A]' : 'text-[#D4A72C]'
                          }`}>
                            {activeVideoModal.videoProvider.toUpperCase()} Discourse Player
                          </span>
                          {activeVideoModal.topicName && (
                            <span className={`text-[10px] font-serif ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                              · Topic: {activeVideoModal.topicName}
                            </span>
                          )}
                        </div>
                        <h3 className={`font-['Cinzel_Decorative'] text-lg sm:text-xl font-bold mt-1 ${
                          isLight ? 'text-[#2A1515]' : 'text-[#FFF7ED]'
                        }`}>
                          {activeVideoModal.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveVideoModal(null)}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                          isLight
                            ? 'bg-[#EFE8D8] hover:bg-[#E2DAC8] text-stone-700 hover:text-stone-900'
                            : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Official Embed Iframe (Zero Local Video Hosting) */}
                    <div className={`aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border ${
                      isLight ? 'border-[#D5C2B5]' : 'border-amber-900/80'
                    }`}>
                      {activeVideoModal.embedUrl ? (
                        <iframe
                          src={activeVideoModal.embedUrl}
                          title={activeVideoModal.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-stone-200">
                          <AlertCircle className="w-8 h-8 text-amber-500" />
                          <p className="text-sm font-serif">Could not load embed player for this video.</p>
                          <a
                            href={activeVideoModal.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#D4A72C] underline flex items-center gap-1"
                          >
                            <span>Open on {activeVideoModal.videoProvider}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Description & Scholar Credits */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                      <div className="space-y-1 flex-1">
                        <p className={`font-['Marcellus'] text-sm leading-relaxed ${
                          isLight ? 'text-stone-700' : 'text-[#E8D3A8]'
                        }`}>
                          {activeVideoModal.description}
                        </p>
                        {activeVideoModal.instructor && (
                          <p className={`text-xs font-serif font-bold ${
                            isLight ? 'text-[#075B2A]' : 'text-[#D4A72C]'
                          }`}>
                            ✦ Presented by: {activeVideoModal.instructor}
                          </p>
                        )}
                      </div>

                      <a
                        href={activeVideoModal.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 rounded-xl flex items-center justify-center gap-2 font-serif text-xs transition-colors shrink-0 shadow-xs border ${
                          isLight
                            ? 'bg-white hover:bg-[#FAF6EE] text-[#2A1515] border-[#D5C2B5]'
                            : 'bg-[#2D1B14] hover:bg-[#3D251C] text-[#D4A72C] hover:text-amber-100 border-[#D4A72C]/60'
                        }`}
                      >
                        <span>Watch on {activeVideoModal.videoProvider}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Category 5: Myths & Misconceptions */}
          {activeCategory === 'myths' && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#D4A72C]/40 pb-5">
                <span className={`text-xs uppercase font-serif tracking-wider font-bold ${
                  isLight ? 'text-amber-800' : 'text-[#D4A72C]'
                }`}>
                  भ्रान्ति-निवारणम्
                </span>
                <h2 className={`font-['Cinzel_Decorative'] text-2xl sm:text-3xl font-black mt-1 ${
                  isLight ? 'text-stone-950' : 'text-[#FFF7ED]'
                }`}>
                  Vastu Myths & Commercial Superstitions
                </h2>
                <p className={`font-['Marcellus'] text-sm mt-1 ${
                  isLight ? 'text-[var(--color-text-body)]' : 'text-[#E8D3A8]'
                }`}>
                  Evidence-based dispelling of fear-mongering falsehoods fabricated by sensationalist commercial practitioners.
                </p>
              </div>

              <div className="space-y-4">
                {MYTHS_DATA.map((myth) => {
                  const isExpanded = activeMythId === myth.id;
                  return (
                    <div
                      key={myth.id}
                      className={`rounded-2xl border-2 overflow-hidden shadow-xl transition-all ${
                        isLight
                          ? 'bg-white border-[var(--color-border)] text-[var(--color-text-heading)] shadow-amber-900/5'
                          : 'bg-[#2D1B14] border-[#D4A72C] text-[#FFF7ED]'
                      }`}
                    >
                      <button
                        onClick={() => setActiveMythId(isExpanded ? '' : myth.id)}
                        className={`w-full p-5 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                          isLight ? 'hover:bg-amber-50/70' : 'hover:bg-[#3B1111]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-serif font-bold text-[#2D1B14] uppercase bg-[#E88A16] px-2.5 py-0.5 rounded border border-[#D4A72C]">
                              Common Fallacy
                            </span>
                            <span className={`text-xs font-serif ${isLight ? 'text-amber-800 font-bold' : 'text-[#D4A72C]'}`}>#{myth.id}</span>
                          </div>
                          <h3 className={`font-['Cinzel_Decorative'] text-base font-bold ${
                            isLight ? 'text-stone-950' : 'text-[#FFF7ED]'
                          }`}>
                            {myth.myth}
                          </h3>
                        </div>

                        <span
                          className={`w-7 h-7 rounded-full bg-[#E88A16] text-[#2D1B14] font-bold flex items-center justify-center shrink-0 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        >
                          ▼
                        </span>
                      </button>

                      {isExpanded && (
                        <div className={`p-5 border-t-2 space-y-4 text-xs sm:text-sm font-['Marcellus'] animate-in fade-in duration-150 text-left ${
                          isLight
                            ? 'bg-[var(--color-pink-tint)] border-[var(--color-border)] text-[var(--color-text-heading)]'
                            : 'bg-[#3B1111]/80 border-[#D4A72C]/40 text-[#FFF7ED]'
                        }`}>
                          <div className={`p-4 rounded-xl border space-y-1 shadow-md ${
                            isLight
                              ? 'bg-teal-50 border-teal-300 text-teal-950'
                              : 'bg-[#0F5C55] border-[#D4A72C] text-[#FFF7ED]'
                          }`}>
                            <strong className={`block font-serif uppercase tracking-wider text-xs ${
                              isLight ? 'text-teal-900 font-bold' : 'text-[#D4A72C]'
                            }`}>
                              Authentic Classical Reality:
                            </strong>
                            <p className="leading-relaxed">{myth.classicalTruth}</p>
                          </div>

                          <div className={`space-y-1 ${isLight ? 'text-[var(--color-text-heading)]' : 'text-[#E8D3A8]'}`}>
                            <strong className={`block font-serif ${isLight ? 'text-amber-900 font-bold' : 'text-[#FDE68A]'}`}>
                              Architectural & Scientific Reasoning:
                            </strong>
                            <p className="leading-relaxed">{myth.scripturalPrinciple}</p>
                          </div>

                          <div className={`space-y-1 p-3 rounded-xl border ${
                            isLight
                              ? 'bg-rose-50 border-rose-300 text-rose-950'
                              : 'bg-[#6B1F1F] border-[#D4A72C] text-[#FFF7ED]'
                          }`}>
                            <strong className={`block font-serif ${isLight ? 'text-rose-900 font-bold' : 'text-[#FDE68A]'}`}>
                              Practical & Psychological Harm:
                            </strong>
                            <p className="leading-relaxed">{myth.practicalHarm}</p>
                          </div>

                          <div className={`text-[11px] font-serif italic pt-1 border-t ${
                            isLight ? 'border-[var(--color-border)] text-[var(--color-text-body)]' : 'border-[#D4A72C]/40 text-[#D4A72C]'
                          }`}>
                            Context: {myth.misconceptionContext}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      </FolioReveal>

      {/* Verified Lead Contact Access Modal */}
      {selectedHandbookForAccess && (
        <HandbookAccessModal
          handbook={selectedHandbookForAccess}
          isOpen={isAccessModalOpen}
          onClose={() => {
            setIsAccessModalOpen(false);
            setSelectedHandbookForAccess(null);
          }}
          onAccessGranted={handleAccessGranted}
        />
      )}

      {/* Embedded Document Viewer Modal */}
      <HandbookViewerModal
        handbook={activeReadingHandbook}
        token={readingToken}
        isOpen={isViewerModalOpen}
        onClose={() => {
          setIsViewerModalOpen(false);
          setActiveReadingHandbook(null);
        }}
      />
    </div>
  );
};
