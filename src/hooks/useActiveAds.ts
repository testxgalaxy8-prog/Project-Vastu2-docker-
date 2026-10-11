import { useState, useEffect, useCallback, useRef } from 'react';

export type AdSlot =
  | 'HEADER'
  | 'ARTICLE_TOP'
  | 'ARTICLE_MIDDLE'
  | 'ARTICLE_BOTTOM'
  | 'SIDEBAR'
  | 'FOOTER'
  | 'STICKY_FOOTER'
  | 'MOBILE'
  | 'library-top'
  | 'article-inline'
  | 'article-sidebar';

export interface DatabaseAd {
  id: number;
  title: string;
  imageUrl: string;
  destinationUrl: string;
  placement: string;
  adType?: 'BANNER' | 'ADSENSE' | 'CUSTOM_HTML' | string;
  adSenseSlot?: string | null;
  adSenseFormat?: string | null;
  customHtml?: string | null;
  priority?: number;
  impressions?: number;
  clicks?: number;
}

export interface UseActiveAdsOptions {
  /** Optional specific route pathname (e.g., '/knowledge', '/topic/brahmasthan'). Defaults to current browser path. */
  route?: string;
  /** Optional specific placement slot to target */
  placement?: AdSlot;
  /** Auto-record impressions when ad loads */
  autoTrackImpression?: boolean;
}

export interface UseActiveAdsResult {
  /** Map of active ads indexed by uppercase placement slot (e.g. HEADER, SIDEBAR) */
  ads: Record<string, DatabaseAd | null>;
  /** Specific ad for the requested placement slot (if options.placement was passed) */
  ad: DatabaseAd | null;
  /** Helper to get the active ad for any designated slot */
  getAdForSlot: (slot: AdSlot) => DatabaseAd | null;
  /** Loading state for initial route fetch */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Manually track a click on an ad */
  recordClick: (adId: number) => Promise<void>;
  /** Manually track an impression on an ad */
  recordImpression: (adId: number, placement: string) => Promise<void>;
  /** Refresh ads from database */
  refetch: () => Promise<void>;
  /** Returns reserved layout styles for designated slots to eliminate Cumulative Layout Shift (CLS) */
  getReservedSlotStyle: (slot: AdSlot) => React.CSSProperties;
}

/**
 * Standard slot normalization to match canonical database placement enum
 */
export const normalizeAdSlot = (slot: AdSlot | string): string => {
  const s = String(slot).trim();
  if (s === 'library-top') return 'HEADER';
  if (s === 'article-inline') return 'ARTICLE_MIDDLE';
  if (s === 'article-sidebar') return 'SIDEBAR';
  return s.toUpperCase();
};

/**
 * Canonical dimensions and aspect constraints to preserve DOM layout
 * and guarantee 0.00 Cumulative Layout Shift (CLS) during article reading.
 */
export const AD_SLOT_METRICS: Record<
  string,
  { minHeight: number; containSize: string; defaultRatio?: string }
> = {
  HEADER: {
    minHeight: 48,
    containSize: '100% 48px',
  },
  ARTICLE_TOP: {
    minHeight: 140,
    containSize: '100% 140px',
  },
  ARTICLE_MIDDLE: {
    minHeight: 140,
    containSize: '100% 140px',
  },
  ARTICLE_BOTTOM: {
    minHeight: 140,
    containSize: '100% 140px',
  },
  SIDEBAR: {
    minHeight: 280,
    containSize: '100% 280px',
  },
  FOOTER: {
    minHeight: 72,
    containSize: '100% 72px',
  },
  STICKY_FOOTER: {
    minHeight: 90,
    containSize: '100% 90px',
  },
  MOBILE: {
    minHeight: 64,
    containSize: '100% 64px',
  },
};

// Global in-memory cache to deduplicate simultaneous requests on the same route
const routeAdsCache = new Map<string, { ads: Record<string, DatabaseAd | null>; timestamp: number }>();
const CACHE_TTL_MS = 30000; // 30 seconds

/**
 * Hook that fetches active advertisements from the PostgreSQL database
 * based on the current page's route and ensures they are displayed within
 * the designated ad slots (HEADER, SIDEBAR, etc.) without affecting the layout shift of the reading content.
 */
export function useActiveAds(options: UseActiveAdsOptions = {}): UseActiveAdsResult {
  const { route: explicitRoute, placement, autoTrackImpression = true } = options;

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const effectiveRoute = explicitRoute || currentPath;

  const [ads, setAds] = useState<Record<string, DatabaseAd | null>>(() => {
    const cached = routeAdsCache.get(effectiveRoute);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.ads;
    }
    return {};
  });

  const [loading, setLoading] = useState<boolean>(() => {
    const cached = routeAdsCache.get(effectiveRoute);
    return !(cached && Date.now() - cached.timestamp < CACHE_TTL_MS);
  });

  const [error, setError] = useState<string | null>(null);
  const recordedImpressions = useRef<Set<number>>(new Set());

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cached = routeAdsCache.get(effectiveRoute);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setAds(cached.ads);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/ads?route=${encodeURIComponent(effectiveRoute)}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch active ads: HTTP ${res.status}`);
      }

      const data = await res.json();
      const adsBySlot: Record<string, DatabaseAd | null> = data.adsBySlot || {};

      routeAdsCache.set(effectiveRoute, {
        ads: adsBySlot,
        timestamp: Date.now(),
      });

      setAds(adsBySlot);
    } catch (err: any) {
      console.warn('Advertisement fetch error:', err);
      setError(err.message || 'Error loading ads');
    } finally {
      setLoading(false);
    }
  }, [effectiveRoute]);

  // Fetch when route changes
  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Listen for admin updates via custom event dispatched on ad creation/edit
  useEffect(() => {
    const handleAdsUpdated = () => {
      routeAdsCache.clear();
      fetchAds();
    };

    window.addEventListener('vastu_ritam_ads_updated', handleAdsUpdated);
    return () => {
      window.removeEventListener('vastu_ritam_ads_updated', handleAdsUpdated);
    };
  }, [fetchAds]);

  // Click tracking
  const recordClick = useCallback(async (adId: number) => {
    if (!adId) return;
    try {
      await fetch(`/api/ads/${adId}/click`, { method: 'POST' });
    } catch {
      // Non-blocking fire and forget
    }
  }, []);

  // Impression tracking
  const recordImpression = useCallback(
    async (adId: number, placementSlot: string) => {
      if (!adId || recordedImpressions.current.has(adId)) return;
      recordedImpressions.current.add(adId);

      try {
        await fetch(`/api/ads/${normalizeAdSlot(placementSlot)}`, { method: 'GET' });
      } catch {
        // Non-blocking
      }
    },
    []
  );

  const getAdForSlot = useCallback(
    (slot: AdSlot): DatabaseAd | null => {
      const normalized = normalizeAdSlot(slot);
      return ads[normalized] || null;
    },
    [ads]
  );

  const targetNormalizedSlot = placement ? normalizeAdSlot(placement) : null;
  const specificAd = targetNormalizedSlot ? ads[targetNormalizedSlot] || null : null;

  // Auto-record impression for target ad if present
  useEffect(() => {
    if (autoTrackImpression && specificAd && targetNormalizedSlot) {
      recordImpression(specificAd.id, targetNormalizedSlot);
    }
  }, [autoTrackImpression, specificAd, targetNormalizedSlot, recordImpression]);

  // Zero CLS style helper
  const getReservedSlotStyle = useCallback((slot: AdSlot): React.CSSProperties => {
    const norm = normalizeAdSlot(slot);
    const metrics = AD_SLOT_METRICS[norm] || { minHeight: 120, containSize: '100% 120px' };

    return {
      minHeight: `${metrics.minHeight}px`,
      containIntrinsicSize: metrics.containSize,
      contentVisibility: 'auto',
      transition: 'opacity 300ms ease, border-color 200ms ease',
    };
  }, []);

  return {
    ads,
    ad: specificAd,
    getAdForSlot,
    loading,
    error,
    recordClick,
    recordImpression,
    refetch: fetchAds,
    getReservedSlotStyle,
  };
}

/** Alias export for semantic clarity */
export const useRouteAdvertisements = useActiveAds;
