import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AdBanner, AdSlot } from './AdBanner';
import { normalizeAdSlot, AD_SLOT_METRICS, DatabaseAd } from '../hooks/useActiveAds';
import { Sparkles, Eye } from 'lucide-react';

export interface AdContainerProps {
  /** The designated canonical placement slot (e.g. ARTICLE_TOP, ARTICLE_MIDDLE, ARTICLE_BOTTOM, SIDEBAR) */
  placement: AdSlot;
  /** Custom additional styling classes */
  className?: string;
  /** Margin around root bounding box to start pre-fetching before ad scrolls into view (default: '150px 0px') */
  rootMargin?: string;
  /** Percentage of target element visibility required to trigger load (default: 0.05) */
  threshold?: number | number[];
  /** Whether lazy loading via IntersectionObserver is enabled (default: true) */
  lazy?: boolean;
  /** If true, collapses slot when no ad exists; if false (default), keeps layout geometry with institutional fallback */
  allowEmpty?: boolean;
  /** Custom minimum height override to reserve DOM space */
  minHeight?: number;
  /** Explicit ad payload override */
  customAd?: DatabaseAd;
  /** Callback fired when user clicks the ad */
  onAdClick?: (ad: DatabaseAd) => void;
  /** Callback fired once when the ad enters the viewport */
  onAdVisible?: (placement: AdSlot) => void;
  /** Optional content children to wrap or inject around */
  children?: React.ReactNode;
  /** Where to render the ad slot relative to children (default: 'after') */
  slotPosition?: 'before' | 'after' | 'inside';
  /** Accessible label for the ad slot container */
  ariaLabel?: string;
}

/**
 * Custom hook to detect when an element intersects the viewport.
 * Falls back safely to true if IntersectionObserver is unsupported.
 */
export function useInViewport<T extends HTMLElement = HTMLDivElement>(options: {
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
  enabled?: boolean;
}) {
  const {
    rootMargin = '150px 0px',
    threshold = 0.05,
    triggerOnce = true,
    enabled = true,
  } = options;

  const [hasEnteredViewport, setHasEnteredViewport] = useState(!enabled);
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) {
      setHasEnteredViewport(true);
      return;
    }

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setHasEnteredViewport(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    // If already entered and only trigger once, do not recreate observer
    if (triggerOnce && hasEnteredViewport) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasEnteredViewport(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setHasEnteredViewport(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce, enabled, hasEnteredViewport]);

  return { elementRef, hasEnteredViewport };
}

/**
 * AdContainer Component:
 * Injects responsive banner ad slots into the main content flow using Intersection Observers
 * to guarantee that banner assets, Google AdSense scripts, and affiliate impressions
 * only load and execute when they actually enter or near the user's viewport.
 *
 * Prevents Cumulative Layout Shift (CLS) by locking reserved aspect boundaries.
 */
export const AdContainer: React.FC<AdContainerProps> = ({
  placement,
  className = '',
  rootMargin = '150px 0px',
  threshold = 0.05,
  lazy = true,
  allowEmpty = false,
  minHeight: customMinHeight,
  customAd,
  onAdClick,
  onAdVisible,
  children,
  slotPosition = 'after',
  ariaLabel,
}) => {
  const normalizedSlot = normalizeAdSlot(placement);
  const slotMetrics = AD_SLOT_METRICS[normalizedSlot] || { minHeight: 140, containSize: '100% 140px' };
  const reservedMinHeight = customMinHeight || slotMetrics.minHeight || 140;

  const { elementRef, hasEnteredViewport } = useInViewport<HTMLDivElement>({
    rootMargin,
    threshold,
    triggerOnce: true,
    enabled: lazy,
  });

  const hasFiredVisibility = useRef(false);

  useEffect(() => {
    if (hasEnteredViewport && !hasFiredVisibility.current) {
      hasFiredVisibility.current = true;
      if (onAdVisible) {
        onAdVisible(placement);
      }
    }
  }, [hasEnteredViewport, onAdVisible, placement]);

  // Reserved slot placeholder style to completely eliminate layout shifting
  const containerStyle: React.CSSProperties = {
    minHeight: reservedMinHeight,
    contain: 'layout',
  };

  // Render the active ad once in viewport, or the reserved placeholder skeleton before it enters
  const renderedAdSlot = (
    <div
      ref={elementRef}
      style={containerStyle}
      className={`ad-container-slot transition-opacity duration-300 relative w-full ${className}`}
      data-ad-placement={normalizedSlot}
      data-ad-loaded={hasEnteredViewport ? 'true' : 'false'}
      aria-label={ariaLabel || `Sponsored advertisement slot for ${normalizedSlot}`}
    >
      {hasEnteredViewport ? (
        // When in viewport: instantiate and load the AdBanner
        <AdBanner
          placement={placement}
          className="w-full"
          allowEmpty={allowEmpty}
          customAd={customAd}
          onAdClick={onAdClick}
        />
      ) : (
        // Before entering viewport: keep zero-CLS geometry with subtle shimmer placeholder
        <div
          className="w-full h-full flex items-center justify-center rounded-2xl bg-[#2D1B14]/15 border border-dashed border-[#D4A72C]/20 p-4 select-none"
          style={{ minHeight: reservedMinHeight }}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center justify-center gap-1.5 opacity-40">
            <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#D4A72C]">
              <Sparkles className="w-3 h-3 text-[#E88A16]" />
              <span>Vastu Ritam Patron Sponsor · {normalizedSlot}</span>
            </span>
            <span className="text-[9px] font-serif text-[#E8D3A8]/60">
              Reserved Placement Slot
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // If wrapping children, inject relative to content flow
  if (children) {
    if (slotPosition === 'before') {
      return (
        <div className="ad-container-wrapper space-y-4">
          {renderedAdSlot}
          {children}
        </div>
      );
    }

    if (slotPosition === 'inside') {
      return (
        <div className="ad-container-wrapper relative">
          {children}
          <div className="my-6">{renderedAdSlot}</div>
        </div>
      );
    }

    // Default 'after'
    return (
      <div className="ad-container-wrapper space-y-4">
        {children}
        {renderedAdSlot}
      </div>
    );
  }

  // Standalone ad slot in content flow
  return renderedAdSlot;
};

/**
 * Utility Component: Injects AdContainer slots into an array of paragraphs
 * or HTML sections at intelligent intervals (e.g. after paragraph 2 or midway).
 */
export interface ContentWithInjectedAdsProps {
  /** Array of content paragraphs or blocks */
  paragraphs: string[];
  /** Render function for each paragraph block */
  renderParagraph: (text: string, index: number) => React.ReactNode;
  /** Primary placement slot to inject midway (default: ARTICLE_MIDDLE) */
  midwayPlacement?: AdSlot;
  /** Optional top placement before first paragraph */
  topPlacement?: AdSlot;
  /** Optional bottom placement after last paragraph */
  bottomPlacement?: AdSlot;
  /** Paragraph index where mid-content ad should appear (defaults to midway) */
  injectIndex?: number;
  /** Additional custom class for injected ad slots */
  slotClassName?: string;
}

export const ContentWithInjectedAds: React.FC<ContentWithInjectedAdsProps> = ({
  paragraphs,
  renderParagraph,
  midwayPlacement = 'ARTICLE_MIDDLE',
  topPlacement,
  bottomPlacement,
  injectIndex,
  slotClassName = 'my-8',
}) => {
  if (!paragraphs || paragraphs.length === 0) return null;

  // Calculate mid-ad injection point
  const targetIndex =
    typeof injectIndex === 'number'
      ? injectIndex
      : Math.max(1, Math.floor(paragraphs.length / 2));

  return (
    <div className="content-with-injected-ads space-y-4">
      {/* Optional Top Injected Ad */}
      {topPlacement && (
        <AdContainer
          placement={topPlacement}
          className={slotClassName}
          rootMargin="200px 0px"
        />
      )}

      {/* Main Content Flow with Midway Injected Ad */}
      {paragraphs.map((paragraph, idx) => {
        const isInjectionPoint = idx === targetIndex && paragraphs.length > 2;

        return (
          <React.Fragment key={idx}>
            {renderParagraph(paragraph, idx)}

            {isInjectionPoint && (
              <AdContainer
                placement={midwayPlacement}
                className={slotClassName}
                rootMargin="150px 0px"
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Optional Bottom Injected Ad */}
      {bottomPlacement && (
        <AdContainer
          placement={bottomPlacement}
          className={slotClassName}
          rootMargin="100px 0px"
        />
      )}
    </div>
  );
};

export default AdContainer;
