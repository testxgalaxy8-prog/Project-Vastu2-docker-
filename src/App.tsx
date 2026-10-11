/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PageType, DiscoverTab, ServiceType, LibraryCategory } from './types';
import { Navbar } from './components/Navbar';
import { DivineBackground } from './components/DivineBackground';
import { DivineCursor } from './components/DivineCursor';
import { HomeSection } from './components/HomeSection';
import { DiscoverSection } from './components/DiscoverSection';
import { WhatWeDoSection } from './components/WhatWeDoSection';
import { GyanKoshSection } from './components/GyanKoshSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { AdminPanel } from './components/AdminPanel';
import { KnowledgeList } from './components/KnowledgeList';
import { ArticleView } from './components/ArticleView';
import { TopicView } from './components/TopicView';
import { TopicsList } from './components/TopicsList';
import { CategoryView } from './components/CategoryView';
import { CategoriesList } from './components/CategoriesList';
import { SearchResultsView } from './components/SearchResultsView';
import { Footer } from './components/Footer';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { isLight } = useTheme();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [discoverSubTab, setDiscoverSubTab] = useState<DiscoverTab>('meaning');
  const [serviceSubTab, setServiceSubTab] = useState<ServiceType>('residential');
  const [gyanKoshSubTab, setGyanKoshSubTab] = useState<LibraryCategory>('shabd-kosh');

  // Persistent Ritam Ambience & Petals State (persisted in localStorage across sessions)
  const [petalsEnabled, setPetalsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vastu_ritam_ambiance_petals');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const handleTogglePetals = useCallback(() => {
    setPetalsEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vastu_ritam_ambiance_petals', String(next));
      } catch (e) {
        console.warn('Could not persist petals preference:', e);
      }
      return next;
    });
  }, []);

  // Parse path & update route state
  const parseCurrentUrl = useCallback(() => {
    const pathname = window.location.pathname;
    const search = window.location.search;

    if (pathname.startsWith('/knowledge/')) {
      const slug = pathname.replace('/knowledge/', '').replace(/\/$/, '');
      if (slug) {
        setCurrentPage('article-detail');
        setActiveSlug(slug);
        return;
      }
    }

    if (pathname === '/knowledge') {
      setCurrentPage('knowledge');
      return;
    }

    if (pathname.startsWith('/topic/')) {
      const slug = pathname.replace('/topic/', '').replace(/\/$/, '');
      if (slug) {
        setCurrentPage('topic-detail');
        setActiveSlug(slug);
        return;
      }
    }

    if (pathname === '/topics') {
      setCurrentPage('topics');
      return;
    }

    if (pathname.startsWith('/category/')) {
      const slug = pathname.replace('/category/', '').replace(/\/$/, '');
      if (slug) {
        setCurrentPage('category-detail');
        setActiveSlug(slug);
        return;
      }
    }

    if (pathname === '/categories') {
      setCurrentPage('categories');
      return;
    }

    if (pathname === '/search') {
      const params = new URLSearchParams(search);
      const q = params.get('q') || '';
      setCurrentPage('search');
      setSearchQuery(q);
      return;
    }

    if (pathname === '/admin') {
      setCurrentPage('admin');
      return;
    }

    if (pathname === '/discover') {
      setCurrentPage('discover');
      return;
    }

    if (pathname === '/what-we-do') {
      setCurrentPage('what-we-do');
      return;
    }

    if (pathname === '/gyan-kosh') {
      setCurrentPage('gyan-kosh');
      return;
    }

    if (pathname === '/testimonials') {
      setCurrentPage('testimonials');
      return;
    }

    if (pathname === '/contact') {
      setCurrentPage('contact');
      return;
    }

    // Default to home
    setCurrentPage('home');
  }, []);

  // Listen to browser Back/Forward (popstate)
  useEffect(() => {
    parseCurrentUrl();

    const handlePopState = () => {
      parseCurrentUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parseCurrentUrl]);

  // Unified Navigation Handler (accepts either a route path or PageType identifier)
  const handleNavigate = (target: string, subTab?: string) => {
    let newPath = '/';

    if (target.startsWith('/')) {
      newPath = target;
    } else {
      switch (target) {
        case 'home':
          newPath = '/';
          break;
        case 'knowledge':
          newPath = '/knowledge';
          break;
        case 'topics':
          newPath = '/topics';
          break;
        case 'categories':
          newPath = '/categories';
          break;
        case 'admin':
          newPath = '/admin';
          break;
        case 'discover':
          newPath = '/discover';
          if (subTab) setDiscoverSubTab(subTab as DiscoverTab);
          break;
        case 'what-we-do':
          newPath = '/what-we-do';
          if (subTab) setServiceSubTab(subTab as ServiceType);
          break;
        case 'gyan-kosh':
          newPath = '/gyan-kosh';
          if (subTab) setGyanKoshSubTab(subTab as LibraryCategory);
          break;
        case 'testimonials':
          newPath = '/testimonials';
          break;
        case 'contact':
          newPath = '/contact';
          break;
        default:
          newPath = `/${target}`;
      }
    }

    if (window.location.pathname + window.location.search !== newPath) {
      window.history.pushState(null, '', newPath);
    }

    parseCurrentUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAdminRoute = currentPage === 'admin';

  return (
    <div
      className="min-h-screen bg-[#FAF6EE] text-[#2A1515] selection:bg-[#FCE7EC] selection:text-[var(--color-primary)] flex flex-col font-['Marcellus'] relative w-full overflow-x-hidden"
    >
      {/* Divine Mouse Cursor */}
      <DivineCursor />

      {/* Background with floating petals and Ritam Ambience shrine */}
      {!isAdminRoute && (
        <DivineBackground
          petalsEnabled={petalsEnabled}
          onTogglePetals={handleTogglePetals}
        />
      )}

      {/* Top Navbar (only for public website) */}
      {!isAdminRoute && (
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          petalsEnabled={petalsEnabled}
          onTogglePetals={handleTogglePetals}
        />
      )}

      {/* Main Routing Views */}
      <main className={isAdminRoute ? 'min-h-screen flex flex-col' : 'flex-1 relative z-10'}>
        {currentPage === 'home' && (
          <HomeSection onNavigate={handleNavigate} />
        )}

        {currentPage === 'knowledge' && (
          <KnowledgeList onNavigate={handleNavigate} />
        )}

        {currentPage === 'article-detail' && (
          <ArticleView slug={activeSlug} onNavigate={handleNavigate} />
        )}

        {currentPage === 'topics' && (
          <TopicsList onNavigate={handleNavigate} />
        )}

        {currentPage === 'topic-detail' && (
          <TopicView slug={activeSlug} onNavigate={handleNavigate} />
        )}

        {currentPage === 'categories' && (
          <CategoriesList onNavigate={handleNavigate} />
        )}

        {currentPage === 'category-detail' && (
          <CategoryView slug={activeSlug} onNavigate={handleNavigate} />
        )}

        {currentPage === 'search' && (
          <SearchResultsView query={searchQuery} onNavigate={handleNavigate} />
        )}

        {currentPage === 'admin' && (
          <AdminPanel onNavigate={handleNavigate} />
        )}

        {currentPage === 'discover' && (
          <DiscoverSection initialTab={discoverSubTab} />
        )}

        {currentPage === 'what-we-do' && (
          <WhatWeDoSection
            initialService={serviceSubTab}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'gyan-kosh' && (
          <GyanKoshSection
            initialCategory={gyanKoshSubTab}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'testimonials' && (
          <TestimonialsSection />
        )}

        {currentPage === 'contact' && (
          <ContactSection />
        )}
      </main>

      {/* Sacred Footer (only for public website) */}
      {!isAdminRoute && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}
