import React, { useEffect, useState } from 'react';

export const DivineCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on non-touch devices
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.classList.contains('cursor-pointer') ||
        target.getAttribute('data-clickable') === 'true'
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Smooth trailing physics
    const interval = setInterval(() => {
      setTrailingPos((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.25,
        y: prev.y + (position.y - prev.y) * 0.25,
      }));
    }, 16);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(interval);
    };
  }, [position, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer Golden Aura Ring */}
      <div
        className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
        }}
      >
        <div
          className={`rounded-full transition-all duration-300 border border-amber-500/50 flex items-center justify-center ${
            isHovered
              ? 'w-10 h-10 bg-amber-400/20 scale-125 border-red-500/70 shadow-[0_0_15px_rgba(234,88,12,0.35)]'
              : 'w-7 h-7 bg-amber-200/10 shadow-[0_0_10px_rgba(217,119,6,0.2)]'
          }`}
        >
          {isHovered && (
            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
          )}
        </div>
      </div>

      {/* Center Golden Diya Point */}
      <div
        className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div
          className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_6px_#f59e0b] transition-transform ${
            isHovered ? 'scale-150 ring-2 ring-red-400' : 'scale-100'
          }`}
        />
      </div>
    </>
  );
};
