import React, { useState, useEffect } from 'react';
import { BookOpen, X, Download, ExternalLink, Maximize2, Minimize2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { HandbookItem } from './HandbookAccessModal';

interface HandbookViewerModalProps {
  handbook: HandbookItem | null;
  token: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HandbookViewerModal: React.FC<HandbookViewerModalProps> = ({
  handbook,
  token,
  isOpen,
  onClose,
}) => {
  const { isLight } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIframeLoaded(false);
      setHasError(false);
      // Disable background scroll
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen, handbook?.id]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !handbook) return null;

  const streamUrl = `/api/handbooks/${handbook.id}/stream?token=${encodeURIComponent(token || '')}`;

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = streamUrl;
    link.download = `${handbook.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(streamUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative flex flex-col rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full rounded-none'
            : 'w-full max-w-6xl h-[92vh] max-h-[1000px]'
        } ${
          isLight
            ? 'bg-[#FFFAF5] border-[#EBDCD5] text-stone-900'
            : 'bg-[#180E10] border-[#44262E] text-stone-100'
        }`}
      >
        {/* Top Header Bar */}
        <header
          className={`flex items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5 border-b shrink-0 ${
            isLight
              ? 'bg-[#FFFDF9] border-[#EBDCD5]'
              : 'bg-[#1F1215] border-[#44262E]'
          }`}
        >
          {/* Left Title & Meta */}
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-primary,#C51E28)] text-white flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-['Cinzel_Decorative',serif] text-sm sm:text-base font-bold truncate">
                  {handbook.title}
                </h2>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Access
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-['Marcellus'] truncate">
                {handbook.targetAudience && (
                  <span>{handbook.targetAudience}</span>
                )}
                {handbook.pages && (
                  <span>· {handbook.pages} Folio Pages</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Open in New Tab */}
            <button
              onClick={handleOpenInNewTab}
              title="Open PDF in new window"
              className={`p-2 rounded-xl border text-xs font-serif font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                isLight
                  ? 'border-stone-300 text-stone-700 hover:bg-stone-100'
                  : 'border-stone-700 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">New Tab</span>
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              title="Download PDF Handbook"
              className={`p-2 rounded-xl border text-xs font-serif font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                isLight
                  ? 'border-stone-300 text-stone-700 hover:bg-stone-100'
                  : 'border-stone-700 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Toggle Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Reader'}
              className={`p-2 rounded-xl border text-xs font-serif font-medium transition-colors cursor-pointer hidden md:flex items-center justify-center ${
                isLight
                  ? 'border-stone-300 text-stone-700 hover:bg-stone-100'
                  : 'border-stone-700 text-stone-300 hover:bg-stone-800'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close Reader"
              className={`p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/80 transition-colors cursor-pointer ml-1`}
              aria-label="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Embedded PDF Viewer Container */}
        <div className="relative flex-1 w-full bg-stone-200 dark:bg-stone-900 overflow-hidden">
          {/* Loading indicator */}
          {!iframeLoaded && !hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300">
              <div className="w-10 h-10 border-3 border-[var(--color-primary,#C51E28)] border-t-transparent rounded-full animate-spin" />
              <p className="font-['Cinzel',serif] text-sm font-bold tracking-wider">
                Loading Vastu Ritam Handbook...
              </p>
              <p className="font-['Marcellus',serif] text-xs text-stone-500">
                Rendering verified architectural monograph
              </p>
            </div>
          )}

          {/* Fallback Error State */}
          {hasError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-stone-100 dark:bg-stone-900">
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <h4 className="font-['Cinzel',serif] text-base font-bold mb-1">
                Unable to Load Embedded Document
              </h4>
              <p className="font-['Marcellus',serif] text-xs text-stone-500 max-w-md mb-4">
                Your browser may block embedded PDFs or require opening directly. Click below to view the PDF in a new window.
              </p>
              <button
                onClick={handleOpenInNewTab}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-primary,#C51E28)] text-white text-xs font-serif font-bold shadow-md hover:bg-[#8E1118] transition-colors cursor-pointer flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open in Full Document Viewer</span>
              </button>
            </div>
          )}

          {/* Embedded Native PDF Viewer in iFrame */}
          <iframe
            src={`${streamUrl}#toolbar=1&navpanes=1`}
            title={handbook.title}
            className="w-full h-full border-0 bg-stone-100 dark:bg-stone-900"
            onLoad={() => setIframeLoaded(true)}
            onError={() => setHasError(true)}
          />

          {/* Mobile Fallback Overlay Note (helps mobile users where iframes cannot render native PDF controls) */}
          <div className="md:hidden absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-black/75 backdrop-blur-xs text-white text-[11px] flex items-center justify-between pointer-events-auto">
            <span className="font-['Marcellus'] truncate mr-2">
              Best viewed full screen on mobile devices
            </span>
            <button
              onClick={handleOpenInNewTab}
              className="px-2.5 py-1 rounded-lg bg-[var(--color-primary,#C51E28)] text-white text-[10px] font-bold shrink-0 cursor-pointer flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Full View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
