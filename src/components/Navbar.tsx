import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PageType } from '../types';
import {
  ChevronDown,
  Menu,
  X,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { VastuRitamLogo } from './VastuRitamLogo';
import { AdBanner } from './AdBanner';
import { useTheme } from '../context/ThemeContext';
import {
  NAV_CONFIG,
  NavItemConfig,
  NavChildItem,
} from '../config/navigation';

interface NavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType, subTab?: string) => void;
  petalsEnabled: boolean;
  onTogglePetals: () => void;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  petalsEnabled,
  onTogglePetals,
  onReplayIntro,
}) => {
  const { isLight, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const drawerContainerRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------------------------------------------------------
  // 1. Desktop Hover Dropdown Management with Smooth Intent Delay
  // ---------------------------------------------------------------------------
  const handleMouseEnter = (dropdownId: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(dropdownId);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 2. Navigation Dispatcher
  // ---------------------------------------------------------------------------
  const handleSubNavigate = useCallback((page: PageType, subTab?: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    onNavigate(page, subTab);
  }, [onNavigate]);

  const toggleMobileAccordion = (sectionId: string) => {
    setMobileAccordion((prev) => (prev === sectionId ? null : sectionId));
  };

  // ---------------------------------------------------------------------------
  // 3. Overflow & Scroll Lock for Mobile Menu Drawer
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      // Prevent layout shift from scrollbar disappearing
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';

      // Keyboard handler (Escape to close)
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  // Check active state for nav items
  const isItemActive = (item: NavItemConfig): boolean => {
    if (item.activeMatches && item.activeMatches.includes(currentPage)) {
      return true;
    }
    return currentPage === item.page;
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-colors duration-200 ${
        isLight
          ? 'bg-white/95 border-b border-[var(--color-border)] shadow-xs'
          : 'bg-[#140E10]/95 border-b border-[var(--color-border)] shadow-xl shadow-black/40'
      }`}
    >
      {/* 1. SLENDER TOP SANSKRIT & UTILITY BAR (Solid ivory, 1px bottom border, text in text-body, all icons in secondary green) */}
      <div
        className={`w-full py-1.5 px-3 sm:px-6 lg:px-8 text-xs font-serif select-none border-b transition-colors ${
          isLight
            ? 'bg-[#FFFAF5] border-[#EBDCD5] text-[#5A4545]'
            : 'bg-[#1A0F0F] border-[#44262E] text-[#D5C2C7]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 w-full">
          {/* Left: Research Credential & Sanskrit Tagline */}
          <div className="flex items-center gap-2 text-xs truncate min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] shadow-[0_0_6px_var(--color-secondary)] animate-pulse shrink-0" />
            <span
              className={`font-['Marcellus'] font-medium truncate ${
                isLight ? 'text-[#5A4545]' : 'text-[#D5C2C7]'
              }`}
            >
              Classical Research & Spatial Science
            </span>
            <span className="text-[#EBDCD5] dark:text-[#44262E] hidden md:inline shrink-0">·</span>
            <span
              className="font-['Yatra_One'] hidden md:inline tracking-wider text-[var(--color-secondary)] shrink-0"
            >
              ॥ संतुलनात् समृद्धिः सुखम् ॥
            </span>
          </div>

          {/* Right: Centralized Utility Actions + Theme Mode Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {NAV_CONFIG.utilityItems.map((uItem, index) => {
              const Icon = uItem.icon;

              if (uItem.type === 'action') {
                if (uItem.actionKey === 'replayIntro' && onReplayIntro) {
                  return (
                    <React.Fragment key={uItem.id}>
                      {index > 0 && (
                        <span className="w-[1px] h-3 bg-[#EBDCD5] dark:bg-[#44262E]" />
                      )}
                      <button
                        onClick={onReplayIntro}
                        className={`text-xs font-['Marcellus'] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded cursor-pointer ${
                          isLight
                            ? 'text-[#5A4545] hover:text-[var(--color-primary)] hover:bg-[#FDF2F4]'
                            : 'text-[#D5C2C7] hover:text-[var(--color-primary-light)]'
                        }`}
                        title={uItem.title}
                      >
                        <Icon className="w-3 h-3 text-[var(--color-secondary)]" />
                        <span className="hidden sm:inline">{uItem.label}</span>
                      </button>
                    </React.Fragment>
                  );
                }

                if (uItem.actionKey === 'togglePetals') {
                  return (
                    <React.Fragment key={uItem.id}>
                      {index > 0 && (
                        <span className="w-[1px] h-3 bg-[#EBDCD5] dark:bg-[#44262E]" />
                      )}
                      <button
                        onClick={onTogglePetals}
                        className={`text-xs font-['Marcellus'] flex items-center gap-1.5 transition-colors px-1.5 py-0.5 rounded cursor-pointer ${
                          isLight
                            ? 'text-[#5A4545] hover:text-[var(--color-primary)] hover:bg-[#FDF2F4]'
                            : 'text-[#D5C2C7] hover:text-[var(--color-accent-pink)]'
                        }`}
                        title={petalsEnabled ? 'Pause Floating Petals' : 'Enable Floating Petals'}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            petalsEnabled ? 'bg-[var(--color-secondary)]' : 'bg-[#EBDCD5]'
                          }`}
                        />
                        <span className="hidden md:inline">
                          {petalsEnabled ? 'Petals: On' : 'Petals: Off'}
                        </span>
                      </button>
                    </React.Fragment>
                  );
                }
                return null;
              }

              return (
                <React.Fragment key={uItem.id}>
                  {index > 0 && (
                    <span className="w-[1px] h-3 bg-[#EBDCD5] dark:bg-[#44262E]" />
                  )}
                  <button
                    onClick={() => uItem.page && handleSubNavigate(uItem.page, uItem.subTab)}
                    className={`text-xs font-['Marcellus'] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded cursor-pointer ${
                      isLight
                        ? 'text-[#5A4545] hover:text-[var(--color-primary)] hover:bg-[#FDF2F4]'
                        : 'text-[#D5C2C7] hover:text-[var(--color-secondary)]'
                    }`}
                    title={uItem.title}
                  >
                    <Icon className="w-3 h-3 text-[var(--color-secondary)]" />
                    <span className="hidden sm:inline">{uItem.label}</span>
                  </button>
                </React.Fragment>
              );
            })}

            {/* Quick Theme Toggle Button */}
            <span className="w-[1px] h-3 bg-[#EBDCD5] dark:bg-[#44262E]" />
            <button
              onClick={toggleTheme}
              className={`text-xs font-['Marcellus'] flex items-center gap-1.5 transition-colors px-2 py-0.5 rounded-full cursor-pointer border ${
                isLight
                  ? 'bg-white text-[#2A1515] border-[#EBDCD5] hover:bg-[#FDF2F4]'
                  : 'bg-[#221417] text-[#FFF6F7] border-[#44262E] hover:bg-[#321B24]'
              }`}
              title={isLight ? 'Switch to Dark Celestial Theme' : 'Switch to Clean Light Theme'}
            >
              {isLight ? <Moon className="w-3 h-3 text-[var(--color-secondary)]" /> : <Sun className="w-3 h-3 text-[var(--color-secondary)]" />}
              <span className="hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SPONSOR BANNER */}
      <AdBanner placement="HEADER" allowEmpty={true} />

      {/* =========================================================================
          3. MAIN NAVIGATION BAR WITH STRICT BASELINE ALIGNMENT
             Desktop: 72px height, baseline centered
             Mobile/Tablet: 64px height, baseline centered
          ========================================================================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-4 xl:px-6 2xl:px-8 w-full">
        {/* DESKTOP BAR (lg:flex) */}
        <div className="hidden lg:flex items-center justify-between h-[72px] w-full gap-1.5 lg:gap-2 xl:gap-3 2xl:gap-6 min-w-0">
          {/* COL 1 (LEFT): BRAND IDENTITY LOGO */}
          <div className="h-full flex items-center justify-start shrink-0 min-w-0">
            <button
              onClick={() => handleSubNavigate('home')}
              className="group flex items-center gap-2 xl:gap-3 text-left focus:outline-none transition-transform hover:scale-[1.01] cursor-pointer"
              aria-label="Vastu Ritam Home"
            >
              <VastuRitamLogo variant="horizontal" size={38} className="lg:scale-95 xl:scale-100 origin-left" />
            </button>
          </div>

          {/* COL 2 (CENTER): DYNAMICALLY MAPPED NAVIGATION TABS */}
          <nav
            className="h-full flex items-center justify-center gap-0.5 xl:gap-1 2xl:gap-1.5 select-none min-w-0"
            aria-label="Primary Navigation"
          >
            {NAV_CONFIG.mainNav.map((item) => {
              const active = isItemActive(item);
              const hasDropdown = Boolean(item.dropdown);

              if (!hasDropdown) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSubNavigate(item.page, item.subTab)}
                    className={`h-9 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 rounded-lg text-xs xl:text-[13px] 2xl:text-sm font-['Marcellus',serif] whitespace-nowrap tracking-wide inline-flex items-center justify-center transition-all duration-200 cursor-pointer relative group ${
                      active
                        ? 'bg-[var(--color-pink-tint)] text-[var(--color-primary)] font-bold shadow-xs'
                        : isLight
                        ? 'text-[#2A1515] hover:text-[var(--color-primary)] hover:bg-[var(--color-pink-tint)]/60 font-medium'
                        : 'text-[#D5C2C7] hover:text-[#FFF6F7] hover:bg-white/5'
                    }`}
                  >
                    <span className="hidden 2xl:inline">{item.label}</span>
                    <span className="2xl:hidden">{item.shortLabel || item.label}</span>
                    <span className="absolute bottom-1 left-2.5 right-2.5 h-[2px] bg-[var(--color-accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                  </button>
                );
              }

              // Dropdown Tab
              const dropdown = item.dropdown!;
              const isDropdownOpen = activeDropdown === item.id;

              return (
                <div
                  key={item.id}
                  className="relative h-full flex items-center"
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => handleSubNavigate(item.page, item.subTab)}
                    aria-expanded={isDropdownOpen}
                    className={`group h-9 px-1.5 lg:px-2 xl:px-2.5 2xl:px-3 rounded-lg text-xs xl:text-[13px] 2xl:text-sm font-['Marcellus',serif] whitespace-nowrap tracking-wide transition-all duration-200 inline-flex items-center justify-center gap-1 cursor-pointer relative ${
                      active
                        ? 'bg-[var(--color-pink-tint)] text-[var(--color-primary)] font-bold shadow-xs'
                        : isLight
                        ? 'text-[#2A1515] hover:text-[var(--color-primary)] hover:bg-[var(--color-pink-tint)]/60 font-medium'
                        : 'text-[#D5C2C7] hover:text-[#FFF6F7] hover:bg-white/5'
                    }`}
                  >
                    <span className="hidden 2xl:inline">{item.label}</span>
                    <span className="2xl:hidden">{item.shortLabel || item.label}</span>
                    <ChevronDown
                      className={`w-3 h-3 shrink-0 transition-transform duration-200 ${
                        isDropdownOpen
                          ? 'rotate-180 text-[var(--color-primary)]'
                          : isLight
                          ? 'text-[#5A4545] group-hover:text-[var(--color-primary)]'
                          : 'text-[#D5C2C7] group-hover:text-zinc-200'
                      }`}
                    />
                    <span className="absolute bottom-1 left-2.5 right-2.5 h-[2px] bg-[var(--color-accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                  </button>

                  {/* Dropdown Flyout Panel */}
                  {isDropdownOpen && (
                    <div
                      className={`absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2 w-72 xl:w-80 backdrop-blur-2xl rounded-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 shadow-xl border ${
                        isLight
                          ? 'bg-white/98 border-[var(--color-border)] text-zinc-900 shadow-stone-300/40'
                          : 'bg-[#1C1317]/98 border-[var(--color-border)] text-zinc-100 shadow-2xl'
                      }`}
                    >
                      {/* Section Title Header */}
                      <div
                        className={`px-3 py-1.5 mb-1 text-[10px] font-['Cinzel',serif] uppercase tracking-[0.14em] flex items-center justify-between border-b ${
                          isLight
                            ? 'text-[var(--color-primary)] border-[var(--color-border)] font-bold'
                            : 'text-[var(--color-primary-light)] border-[var(--color-border)]'
                        }`}
                      >
                        <span>{dropdown.title}</span>
                        {dropdown.icon && (
                          <dropdown.icon
                            className="w-3 h-3 text-[var(--color-secondary)]"
                          />
                        )}
                      </div>

                      {/* Items List */}
                      <div className="space-y-0.5">
                        {dropdown.items.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleSubNavigate(subItem.page, subItem.subTab)}
                            className={`w-full text-left px-3.5 py-2 text-xs xl:text-sm font-['Marcellus',serif] rounded-xl flex items-center justify-between transition-all cursor-pointer group ${
                              isLight
                                ? 'text-zinc-700 hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)]'
                                : 'text-zinc-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="group-hover:translate-x-0.5 transition-transform font-medium">
                              {subItem.label}
                            </span>
                            {subItem.badge && (
                              <span
                                className="text-[10px] font-mono shrink-0 ml-2 text-[var(--color-accent-orange)] font-semibold"
                              >
                                {subItem.badge}
                              </span>
                            )}
                            {subItem.sanskritLabel && (
                              <span
                                className="text-[10px] font-serif shrink-0 ml-2 text-[var(--color-secondary)]"
                              >
                                {subItem.sanskritLabel}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Optional Highlighted Footer Action */}
                      {dropdown.footerAction && (
                        <div
                          className={`border-t mt-1.5 pt-1.5 ${
                            isLight ? 'border-[var(--color-border)]' : 'border-[var(--color-border)]'
                          }`}
                        >
                          <button
                            onClick={() =>
                              handleSubNavigate(
                                dropdown.footerAction!.page,
                                dropdown.footerAction!.subTab
                              )
                            }
                            className={`w-full text-left px-3.5 py-2 text-xs xl:text-sm font-['Marcellus',serif] font-semibold rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                              isLight
                                ? 'text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:bg-[var(--color-surface-soft)]'
                                : 'text-[var(--color-primary-light)] hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              {dropdown.footerAction.icon && (
                                <dropdown.footerAction.icon
                                  className="w-3.5 h-3.5 text-[var(--color-primary)]"
                                />
                              )}
                              <span>{dropdown.footerAction.label}</span>
                            </span>
                            {dropdown.footerAction.badge && (
                              <span
                                className="text-[10px] font-mono text-[var(--color-secondary)] font-bold"
                              >
                                {dropdown.footerAction.badge}
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* COL 3 (RIGHT): PRIMARY CONSULTATION CTA */}
          <div className="h-full flex items-center justify-end shrink-0">
            <button
              onClick={() => handleSubNavigate(NAV_CONFIG.primaryCta.page, NAV_CONFIG.primaryCta.subTab)}
              aria-label={NAV_CONFIG.primaryCta.ariaLabel}
              className="h-9 xl:h-10 inline-flex items-center justify-center gap-1.5 xl:gap-2 px-2.5 lg:px-3 xl:px-4 2xl:px-5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-['Marcellus',serif] font-bold text-xs xl:text-sm tracking-wide shadow-md shadow-red-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-[var(--color-primary-dark)] shrink-0"
            >
              <NAV_CONFIG.primaryCta.icon className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="whitespace-nowrap hidden 2xl:inline">
                {NAV_CONFIG.primaryCta.label}
              </span>
              <span className="whitespace-nowrap 2xl:hidden">
                {NAV_CONFIG.primaryCta.shortLabel}
              </span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            MOBILE & TABLET HEADER BAR (< 1024px)
            Height: Exactly 64px with matching baseline alignment
            ========================================================================= */}
        <div className="lg:hidden flex items-center justify-between h-[64px] w-full min-w-0">
          {/* Logo on Left - Baseline Centered */}
          <div className="h-full flex items-center justify-start shrink-0 min-w-0">
            <button
              onClick={() => handleSubNavigate('home')}
              className="flex items-center gap-2 text-left focus:outline-none cursor-pointer min-w-0"
              aria-label="Vastu Ritam Home"
            >
              <VastuRitamLogo variant="horizontal" size={36} showSubtitle={false} />
            </button>
          </div>

          {/* Right Action Group: Baseline Centered CTA + Hamburger Button */}
          <div className="h-full flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Direct 1-tap phone consultation button for mobile/tablets */}
            <button
              onClick={() => handleSubNavigate(NAV_CONFIG.primaryCta.page, NAV_CONFIG.primaryCta.subTab)}
              className="h-9 px-2.5 sm:px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] text-white font-['Marcellus',serif] font-bold text-xs tracking-wide shadow-sm hover:bg-[var(--color-primary-hover)] active:scale-95 transition-all cursor-pointer border border-[var(--color-primary-dark)] shrink-0"
              aria-label={NAV_CONFIG.primaryCta.label}
              title={NAV_CONFIG.primaryCta.label}
            >
              <NAV_CONFIG.primaryCta.icon className="w-3.5 h-3.5 shrink-0 text-white" />
              <span className="hidden sm:inline whitespace-nowrap">{NAV_CONFIG.primaryCta.shortLabel}</span>
            </button>

            {/* Mobile Menu Drawer Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] focus:outline-none transition-colors cursor-pointer text-zinc-700 dark:text-zinc-200 hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)] shrink-0"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileMenuOpen ? (
                <X className="w-4.5 h-4.5 text-[var(--color-primary)]" />
              ) : (
                <Menu className="w-4.5 h-4.5 text-[var(--color-primary)]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. FULLY RESPONSIVE MOBILE MENU DRAWER (Graceful Overflow & Safe Insets)
          ========================================================================= */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="fixed inset-0 top-[96px] sm:top-[98px] z-50 lg:hidden flex justify-end animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation Menu"
        >
          {/* Backdrop Overlay with Smooth Blur */}
          <div
            className={`fixed inset-0 top-[96px] sm:top-[98px] -z-10 transition-opacity ${
              isLight ? 'bg-black/35 backdrop-blur-xs' : 'bg-black/75 backdrop-blur-sm'
            }`}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Container - Graceful height, full scroll capability, safe bottom bar */}
          <div
            ref={drawerContainerRef}
            className={`w-full sm:max-w-md h-[calc(100dvh-96px)] sm:h-[calc(100dvh-98px)] border-t sm:border-l shadow-2xl flex flex-col justify-between overflow-hidden transition-colors ${
              isLight
                ? 'bg-white border-[var(--color-border)] text-zinc-900'
                : 'bg-[#1C1317]/98 backdrop-blur-2xl border-[var(--color-border)] text-zinc-100'
            }`}
          >
            {/* Top Tagline & Sanskrit Inscription + Theme Toggle */}
            <div
              className={`px-4 py-2.5 border-b flex items-center justify-between text-xs select-none ${
                isLight ? 'bg-[var(--color-surface-soft)] border-[var(--color-border)]' : 'bg-[#140E10] border-[var(--color-border)]'
              }`}
            >
              <span
                className="font-['Cinzel',serif] uppercase tracking-wider font-semibold text-[11px] text-[var(--color-primary)]"
              >
                Menu & Knowledge
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="font-['Yatra_One'] text-[11px] text-[var(--color-secondary)]"
                >
                  ॥ वास्तु रितम् ॥
                </span>
                <button
                  onClick={toggleTheme}
                  className="p-1 rounded-md text-[10px] flex items-center gap-1 border border-[var(--color-border)] cursor-pointer bg-[var(--color-surface)] text-zinc-800 dark:text-zinc-200"
                >
                  {isLight ? <Moon className="w-3 h-3 text-[var(--color-primary)]" /> : <Sun className="w-3 h-3 text-[var(--color-accent-orange)]" />}
                  <span>{isLight ? 'Dark' : 'Light'}</span>
                </button>
              </div>
            </div>

            {/* Scrollable Nav Items Area (Handles Overflow Smoothly) */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-2 select-none">
              {NAV_CONFIG.mainNav.map((item) => {
                const active = isItemActive(item);
                const hasDropdown = Boolean(item.dropdown);

                if (!hasDropdown) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSubNavigate(item.page, item.subTab)}
                      className={`w-full text-left py-3 px-3.5 rounded-xl text-sm font-['Marcellus',serif] transition-all cursor-pointer flex items-center justify-between ${
                        active
                          ? 'bg-[var(--color-surface-soft)] text-[var(--color-primary)] font-bold border-l-4 border-[var(--color-primary)] shadow-xs'
                          : isLight
                          ? 'text-zinc-800 hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-primary)] font-medium'
                          : 'text-zinc-200 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight
                        className="w-3.5 h-3.5 text-zinc-400"
                      />
                    </button>
                  );
                }

                // Accordion Section for Dropdown Items
                const dropdown = item.dropdown!;
                const isAccordionOpen = mobileAccordion === item.id;

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl overflow-hidden border border-[var(--color-border)] transition-colors ${
                      isLight
                        ? 'bg-white shadow-xs'
                        : 'bg-white/[0.02]'
                    }`}
                  >
                    <button
                      onClick={() => toggleMobileAccordion(item.id)}
                      aria-expanded={isAccordionOpen}
                      className={`w-full flex items-center justify-between py-3 px-3.5 text-sm font-['Marcellus',serif] cursor-pointer transition-colors ${
                        active || isAccordionOpen
                          ? 'text-[var(--color-primary)] font-bold bg-[var(--color-surface-soft)]'
                          : isLight
                          ? 'text-zinc-800 font-medium'
                          : 'text-zinc-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.icon && (
                          <item.icon
                            className="w-4 h-4 text-[var(--color-secondary)]"
                          />
                        )}
                        <span>{item.label}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 text-zinc-400 ${isAccordionOpen ? 'rotate-180 text-[var(--color-primary)]' : ''}`}
                      />
                    </button>

                    {isAccordionOpen && (
                      <div
                        className={`px-3 pb-3 space-y-1 text-xs font-['Marcellus',serif] border-t border-[var(--color-border)] pt-2 ${
                          isLight
                            ? 'bg-[var(--color-surface-soft)]'
                            : 'bg-black/20'
                        }`}
                      >
                        {/* Section Header */}
                        <div
                          className="text-[10px] font-['Cinzel',serif] uppercase tracking-[0.14em] px-2 py-1 text-[var(--color-primary)] font-bold"
                        >
                          {dropdown.title}
                        </div>

                        {/* Subitems */}
                        {dropdown.items.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleSubNavigate(subItem.page, subItem.subTab)}
                            className={`w-full text-left py-2 px-2.5 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                              isLight
                                ? 'text-zinc-700 hover:text-[var(--color-primary)] hover:bg-white'
                                : 'text-zinc-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <span>{subItem.label}</span>
                            {subItem.badge && (
                              <span
                                className="text-[10px] font-mono text-[var(--color-accent-orange)] font-semibold"
                              >
                                {subItem.badge}
                              </span>
                            )}
                            {subItem.sanskritLabel && (
                              <span
                                className="text-[10px] font-serif text-[var(--color-secondary)]"
                              >
                                {subItem.sanskritLabel}
                              </span>
                            )}
                          </button>
                        ))}

                        {/* Footer Action if present */}
                        {dropdown.footerAction && (
                          <div
                            className="border-t border-[var(--color-border)] pt-1.5 mt-1.5"
                          >
                            <button
                              onClick={() =>
                                handleSubNavigate(
                                  dropdown.footerAction!.page,
                                  dropdown.footerAction!.subTab
                                )
                              }
                              className={`w-full text-left py-2 px-2.5 font-semibold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                isLight
                                  ? 'text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)]'
                                  : 'text-[var(--color-primary-light)] hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                {dropdown.footerAction.icon && (
                                  <dropdown.footerAction.icon
                                    className="w-3.5 h-3.5 text-[var(--color-primary)]"
                                  />
                                )}
                                <span>{dropdown.footerAction.label}</span>
                              </span>
                              {dropdown.footerAction.badge && (
                                <span
                                  className="text-[10px] font-mono text-[var(--color-secondary)] font-bold"
                                >
                                  {dropdown.footerAction.badge}
                                </span>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Quick Links Section in Drawer */}
              <div
                className="pt-3 border-t border-[var(--color-border)] space-y-1"
              >
                <span
                  className="text-[10px] font-['Cinzel',serif] uppercase tracking-[0.14em] px-2 block font-semibold text-[var(--color-primary)]"
                >
                  Quick Access
                </span>
                {NAV_CONFIG.quickDrawerLinks.map((qLink) => (
                  <button
                    key={qLink.id}
                    onClick={() => handleSubNavigate(qLink.page, qLink.subTab)}
                    className={`w-full text-left py-2 px-2 text-xs font-['Marcellus',serif] flex items-center justify-between rounded-lg transition-colors cursor-pointer ${
                      isLight
                        ? 'text-zinc-700 hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)]'
                        : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    <span>{qLink.label}</span>
                    {qLink.sanskritLabel && (
                      <span
                        className="text-[10px] font-serif text-[var(--color-secondary)]"
                      >
                        {qLink.sanskritLabel}
                      </span>
                    )}
                    {qLink.badge && (
                      <span
                        className="text-[10px] font-mono text-[var(--color-accent-orange)] font-semibold"
                      >
                        {qLink.badge}
                      </span>
                    )}
                  </button>
                ))}

                {onReplayIntro && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onReplayIntro();
                    }}
                    className="w-full text-left py-2 px-2 text-xs font-['Marcellus',serif] flex items-center gap-2 rounded-lg transition-colors cursor-pointer text-[var(--color-primary)] hover:bg-[var(--color-surface-soft)] font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent-orange)]" />
                    <span>Replay Sanctuary Entry (स्वर्गे प्रवेशः)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sticky Bottom Action Bar with Large Touch-Friendly Consultation CTA */}
            <div
              className={`p-4 border-t border-[var(--color-border)] shadow-2xl shrink-0 ${
                isLight
                  ? 'bg-white'
                  : 'bg-[#140E10]/95 backdrop-blur-xl'
              }`}
            >
              <button
                onClick={() =>
                  handleSubNavigate(NAV_CONFIG.primaryCta.page, NAV_CONFIG.primaryCta.subTab)
                }
                className="w-full h-12 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-['Marcellus',serif] font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all border border-[var(--color-primary-dark)]"
              >
                <NAV_CONFIG.primaryCta.icon className="w-4 h-4 text-white" />
                <span>{NAV_CONFIG.primaryCta.label}</span>
              </button>
              <p
                className="text-[10px] text-center font-serif mt-2 text-zinc-500"
              >
                Prior appointment required for in-depth architectural floor plan audit.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
