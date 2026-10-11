import React, { useEffect, useRef, useState } from 'react';

interface FolioRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
}

/**
 * FolioReveal: A scroll-triggered reveal animation component
 * inspired by unrolling ancient palm-leaf folios and Vedic manuscripts.
 */
export const FolioReveal: React.FC<FolioRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentEl = domRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={domRef}
      style={{
        animationDelay: `${delayMs}ms`,
      }}
      className={`${
        isVisible
          ? 'animate-unroll-folio opacity-100'
          : 'opacity-0 translate-y-6 pointer-events-none'
      } transition-opacity duration-300 ${className}`}
    >
      {children}
    </div>
  );
};
