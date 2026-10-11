import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Compass,
  FolderOpen,
  Tag,
  Video,
  BookOpen,
  Megaphone,
  Image as ImageIcon,
  UserCheck,
  History,
  LogOut,
  Eye,
  CheckCircle2,
  Menu,
  X,
  Shield,
  Layers,
  PhoneCall,
  KeyRound,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { BrandName } from '../BrandName';

export type AdminTab =
  | 'dashboard'
  | 'articles'
  | 'topics'
  | 'categories'
  | 'keywords'
  | 'videos'
  | 'handbooks'
  | 'ads'
  | 'media'
  | 'logo'
  | 'contact'
  | 'security'
  | 'users'
  | 'audit';

export interface AdminUser {
  id: number;
  uid: string;
  email: string;
  displayName?: string | null;
  role: 'admin' | 'editor' | 'viewer';
}

interface AdminLayoutProps {
  currentUser: AdminUser;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onLogout: () => void;
  onNavigatePublic: () => void;
  actionNotice?: string | null;
  children: React.ReactNode;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard & Overview', icon: LayoutDashboard },
  { id: 'articles', label: 'Articles & Treatises', icon: FileText },
  { id: 'topics', label: 'Topics & Canonical Entities', icon: Compass },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'keywords', label: 'Keywords & Shastric Terms', icon: Tag },
  { id: 'videos', label: 'Gyan Kosh: Video Learning', icon: Video },
  { id: 'handbooks', label: 'Handbook Management & Leads', icon: BookOpen },
  { id: 'ads', label: 'Advertisement CMS', icon: Megaphone },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'logo', label: 'Emblem & Logo Image', icon: ImageIcon },
  { id: 'contact', label: 'Admin Contact Details', icon: PhoneCall },
  { id: 'security', label: 'Security & Login Credentials', icon: KeyRound },
];

const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'users', label: 'User RBAC & Roles', icon: UserCheck, adminOnly: true },
  { id: 'audit', label: 'Audit Logs', icon: History, adminOnly: true },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onLogout,
  onNavigatePublic,
  actionNotice,
  children,
}) => {
  const { isLight, toggleTheme } = useTheme();
  const { logoUrl } = useSiteSettings();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route/tab change or window resize
  const handleTabSelect = (tab: AdminTab) => {
    onTabChange(tab);
    setMobileSidebarOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-['Marcellus',serif] bg-[#FAF6EE] text-[#2A1515] transition-colors duration-200">
      {/* 1. FIXED TOP HEADER (Height: 64px / h-16) */}
      <header className="fixed top-0 left-0 right-0 h-16 px-4 sm:px-6 z-40 flex items-center justify-between select-none bg-[#FFFDF9]/95 border-b border-[#E8DEC8] shadow-xs backdrop-blur-md">
        {/* Left: Mobile Toggle + Brand Lockup */}
        <div className="flex items-center gap-3">
          {/* Mobile Sidebar Hamburger (< 768px) */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-stone-700 hover:text-[#C51E28] hover:bg-[#FAF6EE] transition-colors cursor-pointer"
            aria-label={mobileSidebarOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Vastu Ritam Trademark Logo & System Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white p-0.5 border border-[#E8DEC8] overflow-hidden shrink-0 shadow-xs">
              <img src={logoUrl || "/trademark-logo.jpg"} alt="Vastu Ritam Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <BrandName size="sm" withTm={true} />
                <span className="hidden sm:inline-flex text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border bg-[#FDF2F4] text-[#C51E28] border-[#FBCFE8] font-bold">
                  CMS · PostgreSQL
                </span>
              </div>
              <p className="text-[10px] hidden sm:block text-stone-600">
                Protected Administrative Console
              </p>
            </div>
          </div>
        </div>

        {/* Right: Public Site Link + User Identity + Sign Out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onTabChange('security')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-serif transition-colors cursor-pointer border ${
              activeTab === 'security'
                ? 'bg-[#C51E28] text-white font-bold border-[#8E1119] shadow-xs'
                : 'bg-white hover:bg-[#FAF6EE] text-stone-800 border-[#E8DEC8] font-medium'
            }`}
            title="Change Login Email & Password"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Credentials</span>
          </button>

          <button
            onClick={onNavigatePublic}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif transition-colors cursor-pointer border bg-white hover:bg-[#FAF6EE] text-stone-800 border-[#E8DEC8]"
            title="View Public Website"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Public Site</span>
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-[#E8DEC8]">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold max-w-[140px] truncate text-[#2A1515]">
                {currentUser.displayName || currentUser.email}
              </p>
              <div className="flex items-center justify-end gap-1">
                <Shield className="w-2.5 h-2.5 text-[#C51E28]" />
                <span className="text-[10px] uppercase font-mono text-[#C51E28] font-bold">
                  {currentUser.role}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl transition-colors cursor-pointer border bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. FIXED DESKTOP SIDEBAR (Width: 256px / w-64, Top: 64px) */}
      <aside className="hidden md:flex flex-col w-64 fixed top-16 bottom-0 left-0 z-30 select-none overflow-y-auto bg-[#FFFDF9] border-r border-[#E8DEC8] shadow-xs">
        <div className="p-4 flex-1 flex flex-col justify-between">
          <nav className="space-y-1 text-xs font-serif font-bold">
            {/* Primary Knowledge & Content Group */}
            <div className="pb-1.5 px-3 text-[10px] font-mono uppercase tracking-wider text-stone-600 font-bold">
              Content & Shastra
            </div>
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C51E28] text-white font-bold shadow-md'
                      : 'text-stone-700 hover:bg-[#FAF6EE] hover:text-[#C51E28]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-[#C51E28]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            {/* Admin-only Group */}
            {currentUser.role === 'admin' && (
              <>
                <div className="pt-4 pb-1.5 px-3 border-t border-[#E8DEC8] text-[10px] font-mono uppercase tracking-wider text-stone-600 font-bold">
                  System Administration
                </div>
                {ADMIN_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#C51E28] text-white font-bold shadow-md'
                          : 'text-stone-700 hover:bg-[#FAF6EE] hover:text-[#C51E28]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-[#C51E28]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </>
            )}
          </nav>

          {/* Sidebar Footer info */}
          <div className="pt-4 mt-4 border-t border-[#E8DEC8] text-[11px] font-mono flex items-center justify-between text-stone-500">
            <span className="truncate">RBAC: {currentUser.role}</span>
            <span className="text-emerald-700 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </aside>

      {/* 3. MOBILE SLIDE-OVER SIDEBAR (< 768px) */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] p-4 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200 border-r bg-[#FFFDF9] border-[#E8DEC8] text-[#2A1515] shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8DEC8]">
                <span className="font-['Cinzel',serif] text-sm font-bold text-[#2A1515]">
                  Navigation Menu
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1 text-xs font-serif font-bold">
                <div className="pb-1 px-2 text-[10px] font-mono uppercase tracking-wider text-stone-600 font-bold">
                  Content & Shastra
                </div>
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#C51E28] text-white font-bold shadow-md'
                          : 'text-stone-700 hover:bg-[#FAF6EE] hover:text-[#C51E28]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-[#C51E28]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}

                {currentUser.role === 'admin' && (
                  <>
                    <div className="pt-3 pb-1 px-2 text-[10px] font-mono uppercase tracking-wider border-t border-[#E8DEC8] text-stone-600 font-bold">
                      Administration
                    </div>
                    {ADMIN_NAV_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabSelect(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#C51E28] text-white font-bold shadow-md'
                              : 'text-stone-700 hover:bg-[#FAF6EE] hover:text-[#C51E28]'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-white' : 'text-[#C51E28]'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </>
                )}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E8DEC8]">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs cursor-pointer bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({currentUser.role})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FLOATING ACTION TOAST NOTICE */}
      {actionNotice && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 p-4 rounded-2xl bg-amber-500 text-stone-950 font-serif font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-bounce border border-amber-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* 5. STANDARDIZED MAIN CONTENT CONTAINER */}
      {/* Offsets: md:pl-64 (256px fixed sidebar), pt-16 (64px fixed header) */}
      <div className="md:pl-64 pt-16 flex-1 flex flex-col">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
