import React, { useState, useEffect } from 'react';
import { BrandName } from './BrandName';
import {
  LayoutDashboard,
  FileText,
  Compass,
  FolderOpen,
  Tag,
  Megaphone,
  Image as ImageIcon,
  ShieldCheck,
  History,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
  Sparkles,
  Link as LinkIcon,
  Save,
  X,
  AlertCircle,
  TrendingUp,
  MousePointerClick,
  Layers,
  UserCheck,
} from 'lucide-react';
import { AdSlot } from './AdBanner';
import { auth, googleAuthProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { KeywordsManager } from './admin/KeywordsManager';
import { ContactSettingsManager } from './admin/ContactSettingsManager';
import { VideoLearningManager } from './admin/VideoLearningManager';
import { HandbookManager } from './admin/HandbookManager';
import { AdminCredentialsManager } from './admin/AdminCredentialsManager';
import { WebsiteLogoManager } from './admin/WebsiteLogoManager';
import { AdminLayout, type AdminTab } from './admin/AdminLayout';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface AdminPanelProps {
  onNavigate: (path: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const { logoUrl } = useSiteSettings();
  // Auth state - strictly start with empty inputs so default credentials are never exposed
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Admin View
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState<any | null>(null);

  // Entities Data
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [topicsList, setTopicsList] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [keywordsList, setKeywordsList] = useState<any[]>([]);
  const [adsList, setAdsList] = useState<any[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);

  // Modals & Forms
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '/hero-sanctuary.jpg',
    categoryId: '',
    status: 'draft',
    metaTitle: '',
    metaDescription: '',
    readingTimeMinutes: 5,
    topicIds: [] as number[],
    keywordIds: [] as number[],
  });

  // Selected text helper for inserting Topic Links
  const [selectedTopicToLink, setSelectedTopicToLink] = useState('');
  const [topicLinkCustomText, setTopicLinkCustomText] = useState('');

  // Topic Modal
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<any | null>(null);
  const [topicForm, setTopicForm] = useState({
    name: '',
    slug: '',
    sanskritName: '',
    entityType: 'concept',
    summary: '',
    description: '',
    imageUrl: '/trademark-logo.jpg',
    metaTitle: '',
    metaDescription: '',
  });

  // Topic Relation Tool
  const [sourceTopicId, setSourceTopicId] = useState('');
  const [targetTopicId, setTargetTopicId] = useState('');
  const [relationType, setRelationType] = useState('related_to');

  // Ad Modal
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any | null>(null);
  const [adForm, setAdForm] = useState({
    title: '',
    imageUrl: '/trademark-logo.jpg',
    destinationUrl: 'https://vasturitam.ai.studio',
    placement: 'ARTICLE_TOP' as AdSlot,
    adType: 'BANNER' as 'BANNER' | 'ADSENSE' | 'CUSTOM_HTML',
    adSenseSlot: '1234567890',
    adSenseFormat: 'auto',
    customHtml: '',
    isActive: true,
    priority: 5,
    startDate: '',
    endDate: '',
  });

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
  });

  // Feedback Notification
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // 1. Check current auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        setAuthLoading(true);
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Load CMS Data when authenticated or tab changes
  useEffect(() => {
    if (!currentUser) return;

    if (activeTab === 'dashboard') {
      fetch('/api/admin/dashboard')
        .then((r) => r.json())
        .then((d) => setDashboardStats(d))
        .catch(console.error);
    } else if (activeTab === 'articles') {
      fetch('/api/admin/articles')
        .then((r) => r.json())
        .then((d) => setArticlesList(d.articles || []))
        .catch(console.error);
      fetch('/api/categories').then((r) => r.json()).then((d) => setCategoriesList(d.categories || []));
      fetch('/api/topics').then((r) => r.json()).then((d) => setTopicsList(d.topics || []));
      fetch('/api/keywords').then((r) => r.json()).then((d) => setKeywordsList(d.keywords || []));
    } else if (activeTab === 'topics') {
      fetch('/api/admin/topics')
        .then((r) => r.json())
        .then((d) => setTopicsList(d.topics || []))
        .catch(console.error);
    } else if (activeTab === 'categories') {
      fetch('/api/admin/categories')
        .then((r) => r.json())
        .then((d) => setCategoriesList(d.categories || []))
        .catch(console.error);
    } else if (activeTab === 'keywords') {
      fetch('/api/admin/keywords')
        .then((r) => r.json())
        .then((d) => setKeywordsList(d.keywords || []))
        .catch(console.error);
    } else if (activeTab === 'videos') {
      fetch('/api/admin/categories')
        .then((r) => r.json())
        .then((d) => setCategoriesList(d.categories || []))
        .catch(console.error);
      fetch('/api/admin/topics')
        .then((r) => r.json())
        .then((d) => setTopicsList(d.topics || []))
        .catch(console.error);
    } else if (activeTab === 'ads') {
      fetch('/api/admin/ads')
        .then((r) => r.json())
        .then((d) => setAdsList(d.ads || []))
        .catch(console.error);
    } else if (activeTab === 'media') {
      fetch('/api/admin/media')
        .then((r) => r.json())
        .then((d) => setMediaList(d.media || []))
        .catch(console.error);
    } else if (activeTab === 'users') {
      fetch('/api/admin/users')
        .then((r) => r.json())
        .then((d) => setUsersList(d.users || []))
        .catch(console.error);
    } else if (activeTab === 'audit') {
      fetch('/api/admin/audit-logs')
        .then((r) => r.json())
        .then((d) => setAuditLogsList(d.logs || []))
        .catch(console.error);
    }
  }, [currentUser, activeTab]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      setCurrentUser(data.user);
      notify(`Welcome back, ${data.user.displayName || data.user.email}`);
    } catch (err: any) {
      setLoginError(err.message || 'Authentication error');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoginError(null);
      const userCred = await signInWithPopup(auth, googleAuthProvider);
      const token = await userCred.user.getIdToken();
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        notify('Signed in with Google Firebase Auth');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Google Sign-in failed');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    notify('Logged out successfully');
  };

  const fetchKeywords = async () => {
    try {
      const res = await fetch('/api/admin/keywords');
      if (res.ok) {
        const data = await res.json();
        setKeywordsList(data.keywords || []);
      }
    } catch (err) {
      console.error('Failed to fetch keywords:', err);
    }
  };

  // --- ARTICLE CRUD ---
  const openNewArticle = () => {
    setEditingArticle(null);
    setArticleForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '/hero-sanctuary.jpg',
      categoryId: categoriesList[0]?.id?.toString() || '',
      status: 'draft',
      metaTitle: '',
      metaDescription: '',
      readingTimeMinutes: 5,
      topicIds: [],
      keywordIds: [],
    });
    setIsArticleModalOpen(true);
  };

  const openEditArticle = (art: any) => {
    setEditingArticle(art);
    setArticleForm({
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      content: art.content,
      featuredImage: art.featuredImage || '/hero-sanctuary.jpg',
      categoryId: art.categoryId ? art.categoryId.toString() : '',
      status: art.status,
      metaTitle: art.metaTitle || '',
      metaDescription: art.metaDescription || '',
      readingTimeMinutes: art.readingTimeMinutes || 5,
      topicIds: art.topics?.map((t: any) => t.id) || [],
      keywordIds: art.keywords?.map((k: any) => k.id) || [],
    });
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingArticle
        ? `/api/admin/articles/${editingArticle.id}`
        : '/api/admin/articles';
      const method = editingArticle ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save article');

      notify(`Article "${articleForm.title}" saved successfully!`);
      setIsArticleModalOpen(false);

      // Refresh list
      const r = await fetch('/api/admin/articles');
      const d = await r.json();
      setArticlesList(d.articles || []);
    } catch (err: any) {
      notify(err.message || 'Error saving article');
    }
  };

  const handleDeleteArticle = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('Article removed from database');
        setArticlesList((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err: any) {
      notify(err.message || 'Error deleting article');
    }
  };

  // Helper: Insert Topic Tag into Content Area
  const insertTopicLinkIntoContent = () => {
    if (!selectedTopicToLink) return;
    const topic = topicsList.find((t) => t.slug === selectedTopicToLink);
    const label = topicLinkCustomText.trim() || topic?.name || selectedTopicToLink;
    const tag = `[[topic:${selectedTopicToLink}|${label}]]`;

    setArticleForm((prev) => ({
      ...prev,
      content: prev.content + ` ${tag} `,
      topicIds: topic && !prev.topicIds.includes(topic.id) ? [...prev.topicIds, topic.id] : prev.topicIds,
    }));

    setTopicLinkCustomText('');
    notify(`Inserted link to Topic: ${topic?.name}`);
  };

  // --- TOPIC CRUD ---
  const openNewTopic = () => {
    setEditingTopic(null);
    setTopicForm({
      name: '',
      slug: '',
      sanskritName: '',
      entityType: 'concept',
      summary: '',
      description: '',
      imageUrl: '/trademark-logo.jpg',
      metaTitle: '',
      metaDescription: '',
    });
    setIsTopicModalOpen(true);
  };

  const openEditTopic = (top: any) => {
    setEditingTopic(top);
    setTopicForm({
      name: top.name,
      slug: top.slug,
      sanskritName: top.sanskritName || '',
      entityType: top.entityType,
      summary: top.summary,
      description: top.description,
      imageUrl: top.imageUrl || '/trademark-logo.jpg',
      metaTitle: top.metaTitle || '',
      metaDescription: top.metaDescription || '',
    });
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTopic ? `/api/admin/topics/${editingTopic.id}` : '/api/admin/topics';
      const method = editingTopic ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topicForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save entity');

      notify(`Canonical Topic "${topicForm.name}" saved!`);
      setIsTopicModalOpen(false);

      const r = await fetch('/api/admin/topics');
      const d = await r.json();
      setTopicsList(d.topics || []);
    } catch (err: any) {
      notify(err.message || 'Error saving topic');
    }
  };

  const handleConnectTopics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTopicId || !targetTopicId || sourceTopicId === targetTopicId) {
      notify('Select two different canonical topics to connect.');
      return;
    }
    try {
      const res = await fetch('/api/admin/topic-relations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceTopicId,
          targetTopicId,
          relationType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to connect topics');
      notify('Topic relation matrix updated in PostgreSQL!');
      setSourceTopicId('');
      setTargetTopicId('');
    } catch (err: any) {
      notify(err.message || 'Error connecting topics');
    }
  };

  // --- ADVERTISEMENT CRUD ---
  const openNewAd = () => {
    setEditingAd(null);
    setAdForm({
      title: '',
      imageUrl: '/trademark-logo.jpg',
      destinationUrl: 'https://vasturitam.ai.studio',
      placement: 'ARTICLE_TOP',
      adType: 'BANNER',
      adSenseSlot: '1234567890',
      adSenseFormat: 'auto',
      customHtml: '',
      isActive: true,
      priority: 5,
      startDate: '',
      endDate: '',
    });
    setIsAdModalOpen(true);
  };

  const openEditAd = (ad: any) => {
    setEditingAd(ad);
    setAdForm({
      title: ad.title,
      imageUrl: ad.imageUrl,
      destinationUrl: ad.destinationUrl,
      placement: ad.placement as AdSlot,
      adType: ad.adType || 'BANNER',
      adSenseSlot: ad.adSenseSlot || '1234567890',
      adSenseFormat: ad.adSenseFormat || 'auto',
      customHtml: ad.customHtml || '',
      isActive: ad.isActive,
      priority: ad.priority || 5,
      startDate: ad.startDate ? ad.startDate.split('T')[0] : '',
      endDate: ad.endDate ? ad.endDate.split('T')[0] : '',
    });
    setIsAdModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : '/api/admin/ads';
      const method = editingAd ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save ad');

      notify(`Ad "${adForm.title}" saved!`);
      setIsAdModalOpen(false);

      // Trigger public refresh
      window.dispatchEvent(new Event('vastu_ritam_ads_updated'));

      const r = await fetch('/api/admin/ads');
      const d = await r.json();
      setAdsList(d.ads || []);
    } catch (err: any) {
      notify(err.message || 'Error saving ad');
    }
  };

  const handleDeleteAd = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('Advertisement deleted');
        setAdsList((prev) => prev.filter((a) => a.id !== id));
        window.dispatchEvent(new Event('vastu_ritam_ads_updated'));
      }
    } catch (err: any) {
      notify(err.message || 'Error deleting ad');
    }
  };

  // --- LOGIN GATE SCREEN ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-['Cinzel'] text-amber-900 font-bold">Verifying Vastu Ritam CMS Authority...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] text-stone-800 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Subtle decorative gold mandala background watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#D4A72C_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-white border-2 border-amber-400/80 shadow-2xl relative z-10 space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500 mx-auto mb-4 bg-white p-1.5 shadow-md">
              <img src={logoUrl || "/trademark-logo.jpg"} alt="Vastu Ritam Logo" className="w-full h-full object-contain" />
            </div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold tracking-wider uppercase border border-amber-300 mb-2">
              Strict Admin Portal · Authorized Access Only
            </div>
            <h1 className="font-['Cinzel',serif] text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
              <BrandName size="2xl" /> <span className="text-zinc-600 text-lg font-serif">CMS</span>
            </h1>
            <p className="font-['Marcellus'] text-xs text-stone-600 mt-1">
              Enterprise PostgreSQL & Canonical Content Administration
            </p>
          </div>

          {/* Strict Security Policy Notice */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-stone-700 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold text-amber-900 block">Strict Personnel Authorization</span>
              <span>Public registration is permanently disabled. Only pre-assigned administrators can sign in.</span>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 font-serif text-sm">
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-700 font-bold mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                placeholder="Enter your registered admin email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-700 font-bold mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter your administrative password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-600 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              Sign In to CMS Console
            </button>
          </form>

          <div className="pt-4 border-t border-stone-200 text-center space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-serif font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Sign In with Pre-Authorized Google Account</span>
            </button>

            <button
              onClick={() => onNavigate('/')}
              className="text-xs text-stone-600 hover:text-amber-700 font-serif transition-colors block mx-auto cursor-pointer"
            >
              &larr; Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- AUTHENTICATED CMS DASHBOARD ---
  return (
    <AdminLayout
      currentUser={currentUser}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
      onNavigatePublic={() => onNavigate('/')}
      actionNotice={actionNotice}
    >
      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && dashboardStats && (
            <div className="space-y-8">
              <div>
                <h2 className="font-['Cinzel',serif] text-2xl font-bold text-[#2A1515]">
                  Repository Command Center
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Active Cloud SQL PostgreSQL database metrics and operational telemetry.
                </p>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Total Articles</span>
                  <p className="font-['Cinzel'] text-3xl font-bold text-[#C51E28] mt-1">
                    {dashboardStats.counts.totalArticles}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                    {dashboardStats.counts.publishedArticles} Published · {dashboardStats.counts.draftArticles} Drafts
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Canonical Entities</span>
                  <p className="font-['Cinzel'] text-3xl font-bold text-[#167A68] mt-1">
                    {dashboardStats.counts.totalTopics}
                  </p>
                  <span className="text-[11px] text-[#A20D18] font-medium mt-1 block">Devatas, Padas & Shastras</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Ad Impressions</span>
                  <p className="font-['Cinzel'] text-3xl font-bold text-[#D4A72C] mt-1">
                    {dashboardStats.counts.totalImpressions}
                  </p>
                  <span className="text-[11px] text-stone-500 mt-1 block">Database-driven tracking</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Ad CTR Ratio</span>
                  <p className="font-['Cinzel'] text-3xl font-bold text-emerald-700 mt-1">
                    {dashboardStats.counts.ctr}
                  </p>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    {dashboardStats.counts.totalClicks} verified clicks
                  </span>
                </div>
              </div>

              {/* Recent Audit Activity */}
              <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                <h3 className="font-['Cinzel',serif] text-base font-bold text-[#2A1515] mb-4 flex items-center gap-2">
                  <History className="w-4 h-4 text-[#C51E28]" />
                  <span>Recent Security & Audit Logs</span>
                </h3>
                <div className="divide-y divide-[#E8DEC8] text-xs">
                  {dashboardStats.recentLogs.map((log: any) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] text-[#C51E28] uppercase font-bold">
                          {log.action}
                        </span>
                        <p className="text-[#4A3535]">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARTICLES */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Cinzel',serif] text-2xl font-bold text-[#2A1515]">
                    Articles & Knowledge Folios
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Manage canonical treatises with interactive topic linking and status transitions.
                  </p>
                </div>
                <button
                  onClick={openNewArticle}
                  className="px-4 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-serif font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Compose New Article</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                <table className="w-full text-left text-xs font-serif">
                  <thead className="bg-[#FAF6EE] text-[#4A3535] uppercase tracking-wider text-[10px] border-b border-[#E8DEC8]">
                    <tr>
                      <th className="p-4">Title & Slug</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Views</th>
                      <th className="p-4">Updated</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DEC8] text-[#2A1515]">
                    {articlesList.map((art) => (
                      <tr key={art.id} className="hover:bg-[#FAF6EE]/70 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-[#2A1515] text-sm">{art.title}</p>
                          <p className="font-mono text-[11px] text-stone-500">/knowledge/{art.slug}</p>
                        </td>
                        <td className="p-4 text-stone-700">{art.categoryName || '—'}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              art.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                : art.status === 'review'
                                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                                : 'bg-stone-100 text-stone-600 border border-stone-200'
                            }`}
                          >
                            {art.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-stone-700">{art.viewsCount}</td>
                        <td className="p-4 text-stone-500">
                          {new Date(art.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => onNavigate(`/knowledge/${art.slug}`)}
                            className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 cursor-pointer"
                            title="View Public Folio"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditArticle(art)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 cursor-pointer"
                            title="Edit Article"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteArticle(art.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer"
                              title="Delete Article"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TOPICS & ENTITIES */}
          {activeTab === 'topics' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Cinzel',serif] text-2xl font-bold text-[#2A1515]">
                    Canonical Entities & Topics
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Entities are independent Vedic objects (Deities, Padas, Shastras) linked to articles and other topics.
                  </p>
                </div>
                <button
                  onClick={openNewTopic}
                  className="px-4 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-serif font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Canonical Entity</span>
                </button>
              </div>

              {/* Topic ↔ Topic Inter-Entity Linker Card */}
              <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                <h3 className="font-['Cinzel',serif] text-sm font-bold text-[#2A1515] mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C51E28]" />
                  <span>Connect Inter-Entity Relationships (Topic ↔ Topic)</span>
                </h3>
                <p className="text-xs text-stone-600 mb-4">
                  Define cosmic relationships in PostgreSQL (e.g. Lord Brahma → Presides Over → Brahmasthan).
                </p>

                <form onSubmit={handleConnectTopics} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-serif">
                  <select
                    value={sourceTopicId}
                    onChange={(e) => setSourceTopicId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  >
                    <option value="">Source Entity...</option>
                    {topicsList.map((t) => (
                      <option key={`src-${t.id}`} value={t.id}>
                        {t.name} ({t.entityType})
                      </option>
                    ))}
                  </select>

                  <select
                    value={relationType}
                    onChange={(e) => setRelationType(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  >
                    <option value="presides_over">Presides Over</option>
                    <option value="associated_with">Associated With</option>
                    <option value="counterpart_of">Counterpart Of</option>
                    <option value="element_ruler">Element Ruler</option>
                    <option value="vedic_root">Vedic Root</option>
                    <option value="related_to">Related To</option>
                  </select>

                  <select
                    value={targetTopicId}
                    onChange={(e) => setTargetTopicId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  >
                    <option value="">Target Entity...</option>
                    {topicsList.map((t) => (
                      <option key={`tgt-${t.id}`} value={t.id}>
                        {t.name} ({t.entityType})
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="py-2 px-4 rounded-xl bg-[#167A68] hover:bg-[#075B2A] text-white font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Create Relationship
                  </button>
                </form>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topicsList.map((top) => (
                  <div
                    key={top.id}
                    className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="px-2 py-0.5 rounded bg-[#FDF2F4] text-[#C51E28] font-bold uppercase text-[10px] border border-[#FBCFE8]">
                          {top.entityType}
                        </span>
                        {top.sanskritName && (
                          <span className="font-['Rozha_One'] text-[#C51E28] text-base">{top.sanskritName}</span>
                        )}
                      </div>
                      <h4 className="font-['Cinzel',serif] text-base font-bold text-[#2A1515] mb-1">
                        {top.name}
                      </h4>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                        {top.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#E8DEC8] flex items-center justify-between">
                      <span className="font-mono text-[10px] text-stone-500">/topic/{top.slug}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onNavigate(`/topic/${top.slug}`)}
                          className="p-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 cursor-pointer"
                          title="View Public Entity Page"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditTopic(top)}
                          className="p-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 cursor-pointer"
                          title="Edit Topic"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Cinzel',serif] text-2xl font-bold text-[#2A1515]">
                    Classifications & Categories
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Systematic divisions of classical Vastu Vidya.
                  </p>
                </div>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-serif font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categoriesList.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-['Cinzel',serif] text-base font-bold text-[#2A1515]">{c.name}</h4>
                      <span className="font-mono text-stone-500 text-xs">/category/{c.slug}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed mb-4">{c.description}</p>
                    <button
                      onClick={() => onNavigate(`/category/${c.slug}`)}
                      className="text-xs font-bold text-[#C51E28] hover:text-[#A20D18] flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Collection</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: KEYWORDS */}
          {activeTab === 'keywords' && (
            <KeywordsManager
              keywords={keywordsList}
              userRole={currentUser?.role || 'editor'}
              onRefresh={fetchKeywords}
              onNotify={notify}
              onNavigatePublic={(slug) => onNavigate(`/article?keyword=${slug}`)}
            />
          )}

          {/* TAB: GYAN KOSH VIDEO LEARNING */}
          {activeTab === 'videos' && (
            <VideoLearningManager
              categoriesList={categoriesList}
              topicsList={topicsList}
              userRole={currentUser?.role || 'editor'}
              onNotification={(msg) => notify(msg)}
            />
          )}

          {/* TAB: GYAN KOSH HANDBOOK MANAGEMENT & CLIENT LEADS */}
          {activeTab === 'handbooks' && (
            <HandbookManager
              userRole={currentUser?.role || 'editor'}
              onNotification={(msg) => notify(msg)}
            />
          )}

          {/* TAB 6: ADVERTISEMENT CMS */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-['Cinzel',serif] text-2xl font-bold text-[#2A1515]">
                    Advertisement & Revenue Management Engine
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Google AdSense auto/custom units, direct sponsor campaigns, impression & CTR revenue analytics.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingAd(null);
                      setAdForm({
                        title: 'Google AdSense In-Article Responsive',
                        imageUrl: 'https://pagead2.googlesyndication.com',
                        destinationUrl: 'ca-pub-9697854430800000',
                        placement: 'ARTICLE_MIDDLE',
                        adType: 'ADSENSE',
                        adSenseSlot: '9823471029',
                        adSenseFormat: 'auto',
                        customHtml: '',
                        isActive: true,
                        priority: 8,
                        startDate: '',
                        endDate: '',
                      });
                      setIsAdModalOpen(true);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-serif font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ AdSense Unit</span>
                  </button>
                  <button
                    onClick={openNewAd}
                    className="px-4 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-serif font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Sponsor Banner</span>
                  </button>
                </div>
              </div>

              {/* Google AdSense Revenue & Configuration Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#E8DEC8] shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C51E28] tracking-wider block">Google AdSense Status</span>
                    <p className="text-sm font-bold text-[#2A1515] mt-0.5">Active & Serving</p>
                    <p className="font-mono text-[10px] text-stone-500">ca-pub-9697854430800000</p>
                  </div>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse" />
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">Total Active Slots</span>
                  <p className="text-lg font-bold text-[#2A1515] mt-0.5">{adsList.filter(a => a.isActive).length} Live Placements</p>
                  <p className="text-[10px] text-stone-500 font-serif">Header, Article, Sidebar & Sticky Anchor</p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">Est. Combined CTR</span>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">
                    {(() => {
                      const totalImp = adsList.reduce((acc, a) => acc + (a.impressions || 0), 0);
                      const totalClicks = adsList.reduce((acc, a) => acc + (a.clicks || 0), 0);
                      return totalImp > 0 ? ((totalClicks / totalImp) * 100).toFixed(2) + '%' : '0.00%';
                    })()}
                  </p>
                  <p className="text-[10px] text-stone-500 font-serif">Real-time non-blocking tracking</p>
                </div>
              </div>

              {/* Table of Ads */}
              <div className="overflow-x-auto rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs">
                <table className="w-full text-left text-xs font-serif">
                  <thead className="bg-[#FAF6EE] text-[#4A3535] uppercase tracking-wider text-[10px] border-b border-[#E8DEC8]">
                    <tr>
                      <th className="p-4">Ad Campaign</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Slot</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Priority</th>
                      <th className="p-4">Impressions</th>
                      <th className="p-4">Clicks</th>
                      <th className="p-4">CTR</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DEC8] text-[#2A1515]">
                    {adsList.map((ad) => {
                      const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={ad.id} className="hover:bg-[#FAF6EE]/70 transition-colors">
                          <td className="p-4">
                            <p className="font-bold text-[#2A1515] text-sm line-clamp-1">{ad.title}</p>
                            <p className="font-mono text-[10px] text-stone-500 truncate max-w-xs">{ad.destinationUrl}</p>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                ad.adType === 'ADSENSE'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-300'
                                  : ad.adType === 'CUSTOM_HTML'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-300'
                                  : 'bg-amber-50 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {ad.adType || 'BANNER'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-700 border border-stone-300">
                              {ad.placement}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ad.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'bg-stone-100 text-stone-600 border border-stone-200'
                              }`}
                            >
                              {ad.isActive ? 'ACTIVE' : 'PAUSED'}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-stone-700">{ad.priority}</td>
                          <td className="p-4 font-mono text-stone-700">{ad.impressions}</td>
                          <td className="p-4 font-mono text-stone-700">{ad.clicks}</td>
                          <td className="p-4 font-mono font-bold text-[#C51E28]">{ctr}%</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => openEditAd(ad)}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 cursor-pointer"
                              title="Edit Ad"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteAd(ad.id)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer"
                              title="Delete Ad"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: MEDIA LIBRARY */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-['Cinzel',serif] text-2xl font-bold text-[#2A1515]">
                  Media & Asset Library
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Canonical images, manuscript folios, and promotional banners stored in database.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { name: 'Official Registered Trademark', url: '/trademark-logo.jpg' },
                  { name: 'Vedic Sacred Sanctuary', url: '/hero-sanctuary.jpg' },
                  { name: 'Palm Leaf Manuscript Texture', url: '/palm-leaf-texture.jpg' },
                  { name: 'Vastu Ritam Emblem', url: '/emblem.jpg' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs space-y-2">
                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-white border border-[#E8DEC8]">
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-bold text-[#2A1515] truncate">{item.name}</p>
                    <p className="font-mono text-[10px] text-stone-500 truncate">{item.url}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(item.url);
                        notify(`Copied URL: ${item.url}`);
                      }}
                      className="w-full py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#F2E7D5] text-[10px] text-[#2A1515] border border-[#D5C2B5] font-bold cursor-pointer transition-colors"
                    >
                      Copy URL
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: ADMIN CONTACT DETAILS & CHANNELS */}
          {activeTab === 'contact' && (
            <ContactSettingsManager
              userRole={currentUser.role}
              onNotification={(msg) => notify(msg)}
            />
          )}

          {/* TAB: WEBSITE LOGO SETTING */}
          {activeTab === 'logo' && (
            <WebsiteLogoManager
              userRole={currentUser.role}
              onNotification={(msg) => notify(msg)}
            />
          )}

          {/* TAB: ADMIN LOGIN & SECURITY CREDENTIALS */}
          {activeTab === 'security' && (
            <AdminCredentialsManager
              currentUser={currentUser}
              onUpdateCurrentUser={(updated) => {
                setCurrentUser(updated);
                notify('Admin profile & credentials successfully updated and active.');
              }}
              onNotification={(msg) => notify(msg)}
            />
          )}

          {/* TAB 9: USERS & RBAC */}
          {activeTab === 'users' && currentUser.role === 'admin' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-['Cinzel',serif] text-2xl font-bold text-[#2A1515]">
                  Role-Based Access Control (RBAC)
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Manage administrators, scholars, and editors with persistent roles in PostgreSQL.
                </p>
              </div>

              <div className="rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs font-serif">
                  <thead className="bg-[#FAF6EE] text-[#4A3535] uppercase tracking-wider text-[10px] border-b border-[#E8DEC8]">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DEC8] text-[#2A1515]">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-[#FAF6EE]/70 transition-colors">
                        <td className="p-4 font-bold text-[#2A1515]">{u.displayName || 'Vedic Scholar'}</td>
                        <td className="p-4 font-mono text-stone-600">{u.email}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded font-mono uppercase text-[10px] font-bold bg-[#FDF2F4] text-[#C51E28] border border-[#FBCFE8]">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 text-stone-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: AUDIT LOGS */}
          {activeTab === 'audit' && currentUser.role === 'admin' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-['Cinzel',serif] text-2xl font-bold text-[#2A1515]">
                  Cryptographic Audit Trail
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Immutable record of every article creation, topic link, ad change, and system event.
                </p>
              </div>

              <div className="rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs font-serif">
                  <thead className="bg-[#FAF6EE] text-[#4A3535] uppercase tracking-wider text-[10px] border-b border-[#E8DEC8]">
                    <tr>
                      <th className="p-4">Action</th>
                      <th className="p-4">Target Entity</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DEC8] text-[#2A1515]">
                    {auditLogsList.map((l) => (
                      <tr key={l.id} className="hover:bg-[#FAF6EE]/70 transition-colors">
                        <td className="p-4 font-mono text-[11px] text-[#C51E28] font-bold">{l.action}</td>
                        <td className="p-4 font-mono text-[10px] text-stone-600">{l.entityType} ({l.entityId})</td>
                        <td className="p-4 text-[#4A3535]">{l.details}</td>
                        <td className="p-4 font-mono text-[10px] text-stone-500">
                          {new Date(l.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      {/* --- MODAL: ARTICLE EDITOR (With Interactive Topic Link Inserter) --- */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full bg-[#FAF6EE] border-2 border-[#D5C2B5] rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#2A1515] space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DEC8]">
              <h3 className="font-['Cinzel',serif] text-xl font-bold text-[#2A1515]">
                {editingArticle ? 'Edit Article Treatises' : 'Compose New Shastric Article'}
              </h3>
              <button
                onClick={() => setIsArticleModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs font-serif">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={articleForm.title}
                    onChange={(e) => {
                      const t = e.target.value;
                      setArticleForm((p) => ({
                        ...p,
                        title: t,
                        slug: p.slug || t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] focus:outline-none focus:border-[#C51E28]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Slug (URL Path)</label>
                  <input
                    type="text"
                    required
                    value={articleForm.slug}
                    onChange={(e) => setArticleForm((p) => ({ ...p, slug: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] font-mono text-[#2A1515] focus:outline-none focus:border-[#C51E28]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Lead Excerpt</label>
                <textarea
                  rows={2}
                  required
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm((p) => ({ ...p, excerpt: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] focus:outline-none focus:border-[#C51E28]"
                />
              </div>

              {/* INTERACTIVE TOPIC ENTITY LINK CONNECTOR */}
              <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E8DEC8] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#C51E28] text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C51E28]" />
                    <span>Topic & Entity Connector (No Manual HTML Required)</span>
                  </span>
                  <span className="text-[10px] text-stone-500">Inserts interactive shastric link</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedTopicToLink}
                    onChange={(e) => setSelectedTopicToLink(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#D5C2B5] text-[#2A1515] text-xs"
                  >
                    <option value="">Select Existing Topic / Entity...</option>
                    {topicsList.map((t) => (
                      <option key={t.id} value={t.slug}>
                        {t.name} ({t.entityType})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Custom Link Text (e.g. Lord Brahma)..."
                    value={topicLinkCustomText}
                    onChange={(e) => setTopicLinkCustomText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#D5C2B5] text-[#2A1515] text-xs"
                  />

                  <button
                    type="button"
                    onClick={insertTopicLinkIntoContent}
                    className="px-4 py-2 rounded-lg bg-[#C51E28] hover:bg-[#A20D18] text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Connect Entity
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">
                  Full Article Body (Markdown supported)
                </label>
                <textarea
                  rows={10}
                  required
                  value={articleForm.content}
                  onChange={(e) => setArticleForm((p) => ({ ...p, content: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] font-mono text-xs text-[#2A1515] leading-relaxed focus:outline-none focus:border-[#C51E28]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Category</label>
                  <select
                    value={articleForm.categoryId}
                    onChange={(e) => setArticleForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  >
                    <option value="">Select Category...</option>
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Status</label>
                  <select
                    value={articleForm.status}
                    onChange={(e) => setArticleForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">Review</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Read Time (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    value={articleForm.readingTimeMinutes}
                    onChange={(e) => setArticleForm((p) => ({ ...p, readingTimeMinutes: parseInt(e.target.value, 10) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">SEO Title</label>
                  <input
                    type="text"
                    value={articleForm.metaTitle}
                    onChange={(e) => setArticleForm((p) => ({ ...p, metaTitle: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">SEO Description</label>
                  <input
                    type="text"
                    value={articleForm.metaDescription}
                    onChange={(e) => setArticleForm((p) => ({ ...p, metaDescription: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DEC8]">
                <button
                  type="button"
                  onClick={() => setIsArticleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 text-stone-800 font-bold hover:bg-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-bold shadow-md cursor-pointer transition-colors"
                >
                  Save Article into PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: TOPIC ENTITY EDITOR --- */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-[#FAF6EE] border-2 border-[#D5C2B5] rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#2A1515] space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <h3 className="font-['Cinzel',serif] text-xl font-bold text-[#2A1515]">
                {editingTopic ? 'Edit Canonical Entity' : 'Register New Canonical Entity'}
              </h3>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4 text-xs font-serif">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Entity Name</label>
                  <input
                    type="text"
                    required
                    value={topicForm.name}
                    onChange={(e) => {
                      const n = e.target.value;
                      setTopicForm((p) => ({
                        ...p,
                        name: n,
                        slug: p.slug || n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Slug (/topic/...)</label>
                  <input
                    type="text"
                    required
                    value={topicForm.slug}
                    onChange={(e) => setTopicForm((p) => ({ ...p, slug: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] font-mono text-[#2A1515]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">
                    Sanskrit Devanagari (e.g. ब्रह्मा)
                  </label>
                  <input
                    type="text"
                    value={topicForm.sanskritName}
                    onChange={(e) => setTopicForm((p) => ({ ...p, sanskritName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] font-['Rozha_One'] text-[#C51E28] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Entity Classification</label>
                  <select
                    value={topicForm.entityType}
                    onChange={(e) => setTopicForm((p) => ({ ...p, entityType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  >
                    <option value="deity">Deity / Devata</option>
                    <option value="energy_zone">Energy Zone / Pada</option>
                    <option value="concept">Metaphysical Concept</option>
                    <option value="shastra">Classical Shastra / Treatise</option>
                    <option value="direction">Direction / Disha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Summary (1-2 sentences)</label>
                <textarea
                  rows={2}
                  required
                  value={topicForm.summary}
                  onChange={(e) => setTopicForm((p) => ({ ...p, summary: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Detailed Canonical Exposition</label>
                <textarea
                  rows={6}
                  required
                  value={topicForm.description}
                  onChange={(e) => setTopicForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] font-mono text-xs text-[#2A1515]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DEC8]">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 text-stone-800 font-bold hover:bg-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-bold shadow-md cursor-pointer transition-colors"
                >
                  Save Entity into PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADVERTISEMENT CMS EDITOR --- */}
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-[#FAF6EE] border-2 border-[#D5C2B5] rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#2A1515] space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC8]">
              <h3 className="font-['Cinzel',serif] text-xl font-bold text-[#2A1515]">
                {editingAd ? 'Edit Database Advertisement' : 'Create Scheduled Advertisement'}
              </h3>
              <button
                onClick={() => setIsAdModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-4 text-xs font-serif">
              {/* Ad Type Selector */}
              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1.5">Monetization Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdForm((p) => ({ ...p, adType: 'BANNER' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      adForm.adType === 'BANNER'
                        ? 'bg-[#C51E28] border-[#A20D18] text-white shadow-xs'
                        : 'bg-white border-[#D5C2B5] text-stone-700 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    Direct Sponsor Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdForm((p) => ({ ...p, adType: 'ADSENSE' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      adForm.adType === 'ADSENSE'
                        ? 'bg-[#C51E28] border-[#A20D18] text-white shadow-xs'
                        : 'bg-white border-[#D5C2B5] text-stone-700 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    Google AdSense Unit
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdForm((p) => ({ ...p, adType: 'CUSTOM_HTML' }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      adForm.adType === 'CUSTOM_HTML'
                        ? 'bg-[#C51E28] border-[#A20D18] text-white shadow-xs'
                        : 'bg-white border-[#D5C2B5] text-stone-700 hover:bg-[#FAF6EE]'
                    }`}
                  >
                    Custom Affiliate Code
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold uppercase mb-1">Campaign Title / Identifier</label>
                <input
                  type="text"
                  required
                  value={adForm.title}
                  onChange={(e) => setAdForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder={adForm.adType === 'ADSENSE' ? 'Google AdSense In-Article Responsive' : 'e.g. Vedic Architecture Certification'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Placement Slot</label>
                  <select
                    value={adForm.placement}
                    onChange={(e) => setAdForm((p) => ({ ...p, placement: e.target.value as AdSlot }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515] font-mono"
                  >
                    <option value="HEADER">HEADER (Top Leaderboard)</option>
                    <option value="ARTICLE_TOP">ARTICLE_TOP (Above Treatises)</option>
                    <option value="ARTICLE_MIDDLE">ARTICLE_MIDDLE (In-Article Reading)</option>
                    <option value="ARTICLE_BOTTOM">ARTICLE_BOTTOM (Post-Article End)</option>
                    <option value="SIDEBAR">SIDEBAR (Sticky Right Rail)</option>
                    <option value="STICKY_FOOTER">STICKY_FOOTER (Bottom Floating Anchor)</option>
                    <option value="FOOTER">FOOTER (Bottom Page)</option>
                    <option value="MOBILE">MOBILE (Mobile Optimized)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Priority (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={adForm.priority}
                    onChange={(e) => setAdForm((p) => ({ ...p, priority: parseInt(e.target.value, 10) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] text-[#2A1515]"
                  />
                </div>
              </div>

              {/* Conditional Fields based on adType */}
              {adForm.adType === 'ADSENSE' ? (
                <div className="p-3.5 rounded-xl bg-white border border-[#E8DEC8] shadow-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#C51E28] font-bold uppercase mb-1">Google AdSense Slot ID (data-ad-slot)</label>
                      <input
                        type="text"
                        required
                        value={adForm.adSenseSlot}
                        onChange={(e) => setAdForm((p) => ({ ...p, adSenseSlot: e.target.value }))}
                        placeholder="e.g. 9823471029"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#D5C2B5] font-mono text-[#2A1515]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#C51E28] font-bold uppercase mb-1">Format</label>
                      <select
                        value={adForm.adSenseFormat}
                        onChange={(e) => setAdForm((p) => ({ ...p, adSenseFormat: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] border border-[#D5C2B5] text-[#2A1515]"
                      >
                        <option value="auto">Auto (Responsive)</option>
                        <option value="rectangle">Rectangle (300x250 / 336x280)</option>
                        <option value="horizontal">Horizontal Banner (728x90)</option>
                        <option value="vertical">Vertical Skyscraper (160x600 / 300x600)</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500 font-serif">
                    ✦ This unit will automatically render official Google AdSense ads under publisher ID <span className="font-mono text-[#C51E28]">ca-pub-9697854430800000</span>.
                  </p>
                </div>
              ) : adForm.adType === 'CUSTOM_HTML' ? (
                <div>
                  <label className="block text-stone-700 font-bold uppercase mb-1">Custom Embed HTML / Affiliate Snippet</label>
                  <textarea
                    rows={4}
                    required
                    value={adForm.customHtml}
                    onChange={(e) => setAdForm((p) => ({ ...p, customHtml: e.target.value }))}
                    placeholder="<a href='...'><img src='...' /></a> or affiliate script"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] font-mono text-xs text-[#2A1515]"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-stone-700 font-bold uppercase mb-1">Destination URL</label>
                    <input
                      type="url"
                      required
                      value={adForm.destinationUrl}
                      onChange={(e) => setAdForm((p) => ({ ...p, destinationUrl: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] font-mono text-[#2A1515]"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold uppercase mb-1">Banner Image URL / Asset</label>
                    <input
                      type="text"
                      required
                      value={adForm.imageUrl}
                      onChange={(e) => setAdForm((p) => ({ ...p, imageUrl: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D5C2B5] font-mono text-[#2A1515]"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="adActiveCheck"
                  checked={adForm.isActive}
                  onChange={(e) => setAdForm((p) => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-[#D5C2B5] text-[#C51E28] focus:ring-[#C51E28]"
                />
                <label htmlFor="adActiveCheck" className="text-stone-700 font-bold cursor-pointer">
                  Activate Advertisement (Serve in scheduled rotation)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DEC8]">
                <button
                  type="button"
                  onClick={() => setIsAdModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 text-stone-800 font-bold hover:bg-stone-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C51E28] hover:bg-[#A20D18] text-white font-bold shadow-md cursor-pointer transition-colors"
                >
                  Save Advertisement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
