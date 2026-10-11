import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Sparkles, Compass, X } from 'lucide-react';
import { useActiveAds, AdSlot, normalizeAdSlot, AD_SLOT_METRICS, DatabaseAd } from '../hooks/useActiveAds';

export type { AdSlot };

interface AdBannerProps {
  placement: AdSlot;
  className?: string;
  customAd?: DatabaseAd;
  /** If true, collapses space when no ad exists in DB; if false (default), keeps zero CLS with institutional research patron */
  allowEmpty?: boolean;
  onAdClick?: (ad: DatabaseAd) => void;
}

/**
 * Enterprise AdBanner Component:
 * - Direct Sponsored Banners with Zero CLS geometry
 * - Google AdSense (ca-pub-...) ad units with script injection & fail-safe fallback
 * - Custom HTML/Affiliate Embeds
 * - High-Monetization STICKY_FOOTER Anchor Bar
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  placement,
  className = '',
  customAd,
  allowEmpty = false,
  onAdClick,
}) => {
  const { ad: fetchedAd, loading, recordClick, getReservedSlotStyle } = useActiveAds({
    placement,
    autoTrackImpression: true,
  });

  const [stickyDismissed, setStickyDismissed] = useState(false);
  const [adSenseFailed, setAdSenseFailed] = useState(false);
  const adSenseRef = useRef<HTMLModElement | null>(null);

  const ad = customAd || fetchedAd;
  const normalizedPlacement = normalizeAdSlot(placement);
  const reservedStyle = getReservedSlotStyle(placement);

  // Dynamic Google AdSense Loader & Initializer
  useEffect(() => {
    if (ad?.adType === 'ADSENSE') {
      const client = 'ca-pub-9697854430800000';
      const existingScript = document.querySelector(`script[src*="googlesyndication.com"]`);
      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
        script.onerror = () => {
          console.warn('Google AdSense blocked or failed to load. Falling back to institutional patron banner.');
          setAdSenseFailed(true);
        };
        document.head.appendChild(script);
      }

      // Safe push to adsbygoogle queue
      try {
        const win = window as unknown as { adsbygoogle?: Array<Record<string, unknown>> };
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
      } catch (err) {
        console.warn('AdSense push caught:', err);
      }
    }
  }, [ad]);

  const handleClick = (e: React.MouseEvent) => {
    if (!ad) return;
    recordClick(ad.id);
    if (onAdClick) {
      onAdClick(ad);
    }
  };

  // 1. Loading Skeleton: Preserves the exact designated slot geometry to prevent layout shifts
  if (loading && !ad) {
    if (normalizedPlacement === 'HEADER') {
      return (
        <aside
          style={reservedStyle}
          className={`w-full bg-[#24130c]/90 border-b border-[#D4A72C]/20 py-2.5 px-4 flex items-center justify-between text-xs animate-pulse select-none ${className}`}
          aria-hidden="true"
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="h-4 w-48 bg-[#D4A72C]/10 rounded" />
            <div className="h-4 w-24 bg-[#D4A72C]/10 rounded" />
          </div>
        </aside>
      );
    }

    if (normalizedPlacement === 'SIDEBAR') {
      return (
        <div
          style={reservedStyle}
          className={`p-4 rounded-2xl bg-[#2D1B14]/40 border border-[#D4A72C]/20 shadow-sm animate-pulse flex flex-col justify-between ${className}`}
          aria-hidden="true"
        >
          <div className="h-3 w-28 bg-[#D4A72C]/15 rounded mb-3" />
          <div className="w-full h-32 bg-[#D4A72C]/10 rounded-lg mb-3" />
          <div className="h-4 w-3/4 bg-[#D4A72C]/15 rounded mb-2" />
          <div className="h-8 w-full bg-[#D4A72C]/10 rounded" />
        </div>
      );
    }

    // Standard Inline Reading Slot Skeleton
    return (
      <aside
        style={reservedStyle}
        className={`my-6 sm:my-8 p-5 sm:p-6 rounded-2xl bg-[#2D1B14]/40 border border-[#D4A72C]/25 shadow-xs animate-pulse select-none ${className}`}
        aria-hidden="true"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D4A72C]/15">
          <div className="h-3.5 w-36 bg-[#D4A72C]/15 rounded" />
          <div className="h-3.5 w-24 bg-[#D4A72C]/15 rounded" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-36 h-24 bg-[#D4A72C]/10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2.5 w-full">
            <div className="h-5 w-2/3 bg-[#D4A72C]/15 rounded" />
            <div className="h-4 w-5/6 bg-[#D4A72C]/10 rounded" />
            <div className="h-8 w-32 bg-[#D4A72C]/20 rounded-xl" />
          </div>
        </div>
      </aside>
    );
  }

  // 2. Empty State Handling (Zero CLS Guarantee with Institutional Research Patron Fallback)
  if (!ad || adSenseFailed) {
    if (allowEmpty) {
      return null;
    }

    // Institutional Research Patron Fallback (Deep Green, Ivory text, outlined pill, reduced height)
    if (normalizedPlacement === 'HEADER') {
      return (
        <aside
          style={reservedStyle}
          className={`w-full bg-[var(--color-secondary-dark)] text-[#FFFAF5] border-b border-[var(--color-border)] py-1.5 px-4 select-none relative z-20 ${className}`}
          aria-label="Vastu Ritam Institutional Archive"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="border border-[#FFFAF5]/40 text-[#FFFAF5] font-serif text-[10px] tracking-wider px-2 py-0.5 rounded-full uppercase font-bold">
                Sponsored
              </span>
              <span className="font-['Marcellus'] text-[#FFFAF5]/95 font-medium">
                Preserving authentic classical Vastu Vidya & cosmic spatial geometry.
              </span>
            </div>
            <a
              href="/knowledge"
              className="inline-flex items-center gap-1 text-[var(--color-accent-orange)] hover:text-[#FFFAF5] font-serif font-bold transition-colors"
            >
              <span>Learn More</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </aside>
      );
    }

    if (normalizedPlacement === 'SIDEBAR') {
      return (
        <div
          style={reservedStyle}
          className={`p-4 rounded-2xl bg-[#2D1B14]/80 text-[#FFF7ED] border border-[#D4A72C]/40 shadow-sm relative overflow-hidden text-left ${className}`}
        >
          <div className="flex items-center justify-between text-[10px] uppercase font-serif tracking-wider text-[#D4A72C] mb-2">
            <span className="bg-[#D4A72C]/10 px-2 py-0.5 rounded border border-[#D4A72C]/30 font-bold">Patron Initiative</span>
            <Compass className="w-3.5 h-3.5 text-[#D4A72C]" />
          </div>
          <h5 className="font-['Cinzel',serif] text-sm font-bold text-[#FFF7ED] leading-snug mb-2">
            Vastu Purusha Spatial Research
          </h5>
          <p className="text-xs text-[#E8D3A8]/80 mb-4 font-serif leading-relaxed">
            Supporting academic investigation and classical alignment methodologies.
          </p>
          <a
            href="/contact"
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#167A68] to-[#0F5C55] hover:from-[#1D9983] hover:to-[#167A68] text-[#FFF7ED] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <span>Partner With Us</span>
            <ExternalLink className="w-3 h-3 text-[#D4A72C]" />
          </a>
        </div>
      );
    }

    // Default inline article reading slot patron banner
    return (
      <aside
        style={reservedStyle}
        className={`my-6 sm:my-8 p-5 sm:p-6 rounded-2xl bg-[#2D1B14]/70 text-[#FFF7ED] border-2 border-[#D4A72C]/40 shadow-md select-none relative overflow-hidden transition-all hover:border-[#D4A72C] ${className}`}
        aria-label="Vastu Ritam Research Patron"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#D4A72C]/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-serif tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-[#D4A72C]/20 text-[#D4A72C] border border-[#D4A72C]/50">
              Institutional Patron
            </span>
            <span className="text-xs font-serif text-[#D4A72C]/60">·</span>
            <span className="text-xs font-serif text-[#E8D3A8] font-semibold">Vedic Architecture Network</span>
          </div>
          <span className="text-[10px] font-serif text-[#D4A72C] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#E88A16]" />
            <span>Sacred Spaces</span>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 space-y-1.5 min-w-0">
            <h4 className="font-['Cinzel',serif] text-base sm:text-lg font-bold text-[#FFF7ED] leading-snug">
              Authentic Vastu Purusha Mandala Handbook
            </h4>
            <p className="text-xs sm:text-sm text-[#E8D3A8]/80 font-serif line-clamp-2">
              Access peer-reviewed architectural monographs, orientation grids, and shastric treatises.
            </p>
            <div className="pt-2">
              <a
                href="/gyan-kosh"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#E88A16] to-[#B94E2C] hover:from-[#F59E0B] hover:to-[#D4A72C] text-[#2D1B14] font-serif font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>Read Knowledge Base</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. GOOGLE ADSENSE AD UNIT RENDERER
  // ---------------------------------------------------------------------------
  if (ad.adType === 'ADSENSE') {
    const slotId = ad.adSenseSlot || '1234567890';
    const format = ad.adSenseFormat || 'auto';
    const publisherId = ad.destinationUrl?.startsWith('ca-pub-') ? ad.destinationUrl : 'ca-pub-9697854430800000';

    return (
      <div
        style={reservedStyle}
        className={`w-full overflow-hidden my-4 p-2 rounded-xl bg-[#140604] border border-[#D4A72C]/30 text-center relative ${className}`}
      >
        <span className="text-[9px] font-mono text-[#D4A72C]/60 uppercase tracking-widest block mb-1">
          Google AdSense Sponsor
        </span>
        <ins
          ref={adSenseRef}
          className="adsbygoogle"
          style={{ display: 'block', minHeight: 90 }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. CUSTOM HTML / AFFILIATE SNIPPET RENDERER
  // ---------------------------------------------------------------------------
  if (ad.adType === 'CUSTOM_HTML' && ad.customHtml) {
    return (
      <div
        style={reservedStyle}
        className={`w-full overflow-hidden my-4 p-3 rounded-xl bg-[#1A0A06] border border-[#D4A72C]/35 relative ${className}`}
        dangerouslySetInnerHTML={{ __html: ad.customHtml }}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // 5. STICKY FOOTER ANCHOR BAR (High-Revenue Mobile & Desktop Unit)
  // ---------------------------------------------------------------------------
  if (normalizedPlacement === 'STICKY_FOOTER') {
    if (stickyDismissed) return null;

    return (
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#160507]/98 border-t-2 border-[#D4A72C]/50 shadow-2xl p-2.5 backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {ad.imageUrl && (
              <img
                src={ad.imageUrl}
                alt={ad.title}
                className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#D4A72C]/40"
              />
            )}
            <div className="min-w-0">
              <span className="text-[9px] uppercase font-serif tracking-widest text-[#E88A16] font-bold block">
                Featured Partner · Vastu Ritam
              </span>
              <p className="text-xs sm:text-sm font-['Cinzel',serif] text-[#FFF7ED] font-bold truncate">
                {ad.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={ad.destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4A72C] to-[#E88A16] text-[#1A0608] font-serif font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
            >
              <span>Explore</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setStickyDismissed(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10"
              title="Close Ad"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 6. STANDARD PLACEMENTS (HEADER, SIDEBAR, IN-ARTICLE)
  // ---------------------------------------------------------------------------

  // A. HEADER placement (Top of page banner: Deep Green, Ivory text, outlined pill, reduced height)
  if (normalizedPlacement === 'HEADER') {
    return (
      <aside
        style={reservedStyle}
        className={`w-full bg-[var(--color-secondary-dark)] text-[#FFFAF5] border-b border-[var(--color-border)] py-1.5 px-4 select-none relative z-20 transition-opacity duration-300 ${className}`}
        aria-label="Institutional Announcement"
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="border border-[#FFFAF5]/40 text-[#FFFAF5] font-serif text-[10px] tracking-wider px-2 py-0.5 rounded-full uppercase font-bold">
              SPONSORED
            </span>
            <span className="font-['Marcellus'] text-[#FFFAF5]/95 font-medium">{ad.title}</span>
          </div>

          <a
            href={ad.destinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="inline-flex items-center gap-1 text-[var(--color-accent-orange)] hover:text-[#FFFAF5] font-serif font-bold transition-colors group cursor-pointer"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </aside>
    );
  }

  // B. SIDEBAR placement (Compact vertical card)
  if (normalizedPlacement === 'SIDEBAR') {
    return (
      <div
        style={reservedStyle}
        className={`p-4 rounded-2xl bg-[#2D1B14]/90 text-[#FFF7ED] border border-[#D4A72C]/50 shadow-md relative overflow-hidden text-left transition-all hover:border-[#D4A72C] ${className}`}
      >
        <div className="flex items-center justify-between text-[10px] uppercase font-serif tracking-wider text-[#D4A72C] mb-2">
          <span className="bg-[#D4A72C]/15 px-2 py-0.5 rounded border border-[#D4A72C]/30 font-bold">Featured Initiative</span>
          <span className="text-[#E8D3A8]/60">Patron</span>
        </div>

        {ad.imageUrl && (
          <div className="w-full h-32 rounded-lg overflow-hidden bg-[#1A0F0A] border border-[#D4A72C]/30 mb-3 relative">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}

        <h5 className="font-['Cinzel',serif] text-sm font-bold text-[#FFF7ED] leading-snug mb-3">
          {ad.title}
        </h5>

        <a
          href={ad.destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#0F5C55] to-[#167A68] hover:from-[#167A68] hover:to-[#1D9983] text-[#FFF7ED] font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <span>Explore Service</span>
          <ExternalLink className="w-3 h-3 text-[#D4A72C]" />
        </a>
      </div>
    );
  }

  // C. ARTICLE_TOP, ARTICLE_MIDDLE, ARTICLE_BOTTOM (Inline reading flow)
  if (
    normalizedPlacement === 'ARTICLE_TOP' ||
    normalizedPlacement === 'ARTICLE_MIDDLE' ||
    normalizedPlacement === 'ARTICLE_BOTTOM'
  ) {
    return (
      <aside
        style={reservedStyle}
        className={`my-6 sm:my-8 p-5 sm:p-6 rounded-2xl bg-[#2D1B14]/85 text-[#FFF7ED] border-2 border-[#D4A72C]/50 shadow-md select-none relative overflow-hidden transition-all hover:border-[#D4A72C] ${className}`}
        aria-label="Sponsored Research & Resources"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#D4A72C]/25 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-serif tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-[#E88A16]/20 text-[#E88A16] border border-[#E88A16]/50">
              Vastu Ritam Partner
            </span>
            <span className="text-xs font-serif text-[#D4A72C]/60">·</span>
            <span className="text-xs font-serif text-[#E8D3A8] font-semibold">Vedic Heritage</span>
          </div>

          <span className="text-[10px] font-serif text-[#D4A72C] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#E88A16]" />
            <span>Patron Showcase</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {ad.imageUrl && (
            <div className="w-full sm:w-40 h-28 shrink-0 rounded-xl overflow-hidden bg-[#1A0F0A] border border-[#D4A72C]/40 shadow-xs relative">
              <img
                src={ad.imageUrl}
                alt={ad.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex-1 space-y-2 min-w-0">
            <h4 className="font-['Cinzel',serif] text-base sm:text-lg font-bold text-[#FFF7ED] leading-snug">
              {ad.title}
            </h4>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={ad.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#B94E2C] to-[#E88A16] hover:from-[#D4A72C] hover:to-[#B94E2C] text-[#FFF7ED] font-serif font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <span>View Details</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#FFF7ED] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <span className="text-[11px] font-serif text-zinc-400 italic">
                Verified through Vastu Ritam Research Standards
              </span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // D. DEFAULT MOBILE / FOOTER placement
  return (
    <div
      style={reservedStyle}
      className={`p-4 rounded-xl bg-[#2D1B14] text-[#E8D3A8] border border-[#D4A72C]/40 shadow-md flex items-center justify-between gap-4 transition-all ${className}`}
    >
      <div className="min-w-0">
        <span className="text-[10px] text-[#D4A72C] font-serif uppercase tracking-wider block">
          Patron Partner
        </span>
        <p className="text-xs font-serif text-[#FFF7ED] truncate">{ad.title}</p>
      </div>
      <a
        href={ad.destinationUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="px-3 py-1.5 rounded-lg bg-[#E88A16] hover:bg-[#D4A72C] text-[#2D1B14] text-xs font-serif font-bold shrink-0 transition-colors cursor-pointer"
      >
        Visit
      </a>
    </div>
  );
};

export const AdvertisementBanner = AdBanner;

export { AdContainer, ContentWithInjectedAds } from './AdContainer';
