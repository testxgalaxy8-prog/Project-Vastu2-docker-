export type PageType =
  | 'home'
  | 'discover'
  | 'what-we-do'
  | 'gyan-kosh'
  | 'testimonials'
  | 'contact'
  | 'admin'
  | 'knowledge'
  | 'article-detail'
  | 'topic-detail'
  | 'topics'
  | 'category-detail'
  | 'categories'
  | 'search';

export type AdPlacement = 'article-inline' | 'article-sidebar' | 'library-top' | 'footer-banner';

export interface Advertisement {
  id: string;
  clientName: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  ctaText: string;
  badge: string; // e.g. "Sponsored Partner", "Featured Artisan", "Architecture Patron"
  placements: AdPlacement[];
  category: string;
  status: 'active' | 'paused';
  viewsCount: number;
  clicksCount: number;
  createdAt: string;
}

export type DiscoverTab = 
  | 'meaning' 
  | 'philosophy' 
  | 'why-us' 
  | 'collaborators' 
  | 'mission-vision' 
  | 'founder' 
  | 'emblem';

export type ServiceType = 
  | 'residential' 
  | 'commercial' 
  | 'industrial' 
  | 'before-you-buy' 
  | 'consultation';

export type LibraryCategory = 
  | 'shabd-kosh' 
  | 'prakaran' 
  | 'handbooks' 
  | 'videos' 
  | 'myths';

export interface DictionaryTerm {
  id: string;
  term: string;
  sanskrit: string;
  category: 'Directions' | 'Cosmology' | 'Architecture' | 'Remedies' | 'Measures';
  meaning: string;
  architecturalSignificance: string;
  scripturalReference?: string;
}

export interface Article {
  id: string;
  title: string;
  sanskritTitle?: string;
  readTime: string;
  category: string;
  summary: string;
  content: string;
  author: string;
  keyTakeaway: string;
}

export interface Handbook {
  id: string;
  title: string;
  subtitle: string;
  targetAudience: string;
  pages: number;
  topics: string[];
  summary: string;
}

export interface MythItem {
  id: string;
  myth: string;
  misconceptionContext: string;
  classicalTruth: string;
  scripturalPrinciple: string;
  practicalHarm: string;
}

export interface Testimonial {
  id: string;
  name: string;
  designation: string;
  organization?: string;
  location: string;
  quote: string;
  category: 'Architect' | 'Engineer' | 'Interior Designer' | 'Homeowner' | 'Commercial';
  avatarInitials: string;
}
