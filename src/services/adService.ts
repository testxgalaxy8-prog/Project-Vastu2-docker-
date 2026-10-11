import { Advertisement, AdPlacement } from '../types';

const STORAGE_KEY = 'vastu_ritam_advertisements_v1';

export const DEFAULT_ADS: Advertisement[] = [
  {
    id: 'ad-sthapatya-brass',
    clientName: 'Sthapatya Shilp Studios',
    title: 'Sacred Vastu Metals & Handcrafted Brass Yantras',
    tagline: 'Pancha-Loha & bell-metal remedies cast by traditional artisans in compliance with Mayamatam.',
    description: 'Specializing in consecrated pure copper, brass and bronze plates, Bhoomi-Pujan copper urns, and custom-proportioned Shikhar Kalash for residences and institutions.',
    imageUrl: 'https://images.unsplash.com/photo-1599818816942-0268ec349479?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://example.com/sthapatya-shilp',
    ctaText: 'View Metal Catalogue',
    badge: 'Sponsored Partner',
    placements: ['article-inline', 'article-sidebar', 'library-top'],
    category: 'Sacred Materials & Metalcraft',
    status: 'active',
    viewsCount: 142,
    clicksCount: 29,
    createdAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'ad-prana-lime',
    clientName: 'Prana Earth Architecture',
    title: 'Natural Breathable Lime Plasters & CSEB Bricks',
    tagline: 'Authentic breathable masonry that harmonizes structural breathability and thermal inertia.',
    description: 'Eliminate toxic chemical emissions with traditional non-hydraulic lime mortars, Surkhi clay pozzolana, and compressed stabilized earth blocks tested for longevity.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://example.com/prana-earth',
    ctaText: 'Request Material Samples',
    badge: 'Eco-Architecture Patron',
    placements: ['article-inline', 'library-top', 'footer-banner'],
    category: 'Sustainable Building Materials',
    status: 'active',
    viewsCount: 98,
    clicksCount: 17,
    createdAt: '2026-09-21T11:30:00.000Z',
  },
  {
    id: 'ad-vedacraft-timber',
    clientName: 'VedaCraft Sustainable Timber',
    title: 'Reclaimed Auspicious Teak & Sal Main Door Portals',
    tagline: 'Precision Ayadi-proportioned main entrance frames crafted from aged, certified hardwoods.',
    description: 'Every sacred threshold (Dwara) deserves wood seasoned under natural moon phases. Sourced sustainably and carved with traditional classical lintel reliefs.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://example.com/vedacraft',
    ctaText: 'Explore Entrance Portals',
    badge: 'Artisan Showcase',
    placements: ['article-sidebar', 'article-inline'],
    category: 'Carpentry & Joinery',
    status: 'active',
    viewsCount: 84,
    clicksCount: 12,
    createdAt: '2026-09-22T08:15:00.000Z',
  }
];

export const adService = {
  getAll(): Advertisement[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read advertisements from localStorage:', e);
    }
    // Default seed
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ADS));
    } catch {
      // ignore
    }
    return DEFAULT_ADS;
  },

  save(ads: Advertisement[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ads));
      window.dispatchEvent(new Event('vastu_ritam_ads_updated'));
    } catch (e) {
      console.error('Could not save advertisements to localStorage:', e);
    }
  },

  getByPlacement(placement: AdPlacement): Advertisement[] {
    const all = this.getAll();
    return all.filter((ad) => ad.status === 'active' && ad.placements.includes(placement));
  },

  recordImpression(id: string): void {
    const all = this.getAll();
    const updated = all.map((ad) => {
      if (ad.id === id) {
        return { ...ad, viewsCount: ad.viewsCount + 1 };
      }
      return ad;
    });
    this.save(updated);
  },

  recordClick(id: string): void {
    const all = this.getAll();
    const updated = all.map((ad) => {
      if (ad.id === id) {
        return { ...ad, clicksCount: ad.clicksCount + 1 };
      }
      return ad;
    });
    this.save(updated);
  },

  create(data: Omit<Advertisement, 'id' | 'viewsCount' | 'clicksCount' | 'createdAt'>): Advertisement {
    const all = this.getAll();
    const newAd: Advertisement = {
      ...data,
      id: `ad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      viewsCount: 0,
      clicksCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.save([newAd, ...all]);
    return newAd;
  },

  update(id: string, updates: Partial<Advertisement>): Advertisement | null {
    const all = this.getAll();
    let updatedItem: Advertisement | null = null;
    const updated = all.map((ad) => {
      if (ad.id === id) {
        updatedItem = { ...ad, ...updates };
        return updatedItem;
      }
      return ad;
    });
    if (updatedItem) {
      this.save(updated);
    }
    return updatedItem;
  },

  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((ad) => ad.id !== id);
    if (filtered.length !== all.length) {
      this.save(filtered);
      return true;
    }
    return false;
  },

  reset(): Advertisement[] {
    this.save(DEFAULT_ADS);
    return DEFAULT_ADS;
  },
};
