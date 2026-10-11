import React from 'react';

export interface BrandNameProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'hero' | 'inherit';
  variant?: 'split' | 'monochrome' | 'reverse' | 'badge';
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'div';
  uppercase?: boolean;
  withTm?: boolean;
}

const sizeClasses: Record<string, string> = {
  xs: 'text-xs tracking-wider',
  sm: 'text-sm tracking-wider',
  md: 'text-base sm:text-lg tracking-wider',
  lg: 'text-lg sm:text-xl tracking-wide',
  xl: 'text-xl sm:text-2xl tracking-wide',
  '2xl': 'text-2xl sm:text-3xl tracking-wide',
  '3xl': 'text-3xl sm:text-4xl tracking-wide',
  hero: 'text-3xl sm:text-5xl lg:text-6xl tracking-wider',
  inherit: '',
};

/**
 * BrandName Component
 * Canonical brand typography for "Vastu Ritam" matching the brand logo identity:
 * - Font: Cinzel (Classical architectural serif font matching the registered logo)
 * - "Vastu" in Maroon Red (#A20D18)
 * - "Ritam" in Forest Green (#075B2A)
 * - Consistent capitalization and spacing everywhere
 */
export const BrandName: React.FC<BrandNameProps> = ({
  className = '',
  size = 'inherit',
  variant = 'split',
  as: Component = 'span',
  uppercase = false,
  withTm = false,
}) => {
  const sizeClass = sizeClasses[size] || '';
  const vastuText = uppercase ? 'VASTU' : 'Vastu';
  const ritamText = uppercase ? 'RITAM' : 'Ritam';

  const tmSymbol = withTm ? (
    <sup
      className={`text-[0.55em] font-sans font-bold ml-0.5 leading-none select-none align-super ${
        variant === 'monochrome' ? '' : 'text-[#A20D18]'
      }`}
      title="Trade Mark (TM)"
      aria-label="Trade Mark"
    >
      ™
    </sup>
  ) : null;

  if (variant === 'monochrome') {
    return (
      <Component className={`font-['Cinzel',serif] font-bold select-none inline-flex items-baseline ${sizeClass} ${className}`}>
        {vastuText} {ritamText}
        {tmSymbol}
      </Component>
    );
  }

  if (variant === 'badge') {
    return (
      <Component
        className={`bg-[#FFFDF9] px-2 sm:px-2.5 py-0.5 rounded-lg shadow-xs inline-flex items-baseline flex-nowrap border border-stone-200/60 mx-1.5 ${sizeClass} ${className}`}
      >
        <span className="text-[#A20D18] font-['Cinzel',serif] font-bold transition-colors duration-200">
          {vastuText}
        </span>
        <span className="inline-block w-[0.3em]">&nbsp;</span>
        <span className="text-[#075B2A] font-['Cinzel',serif] font-bold transition-colors duration-200">
          {ritamText}
        </span>
        {tmSymbol}
      </Component>
    );
  }

  return (
    <Component
      className={`font-['Cinzel',serif] font-bold select-none inline-flex items-baseline flex-nowrap ${sizeClass} ${className}`}
    >
      <span className="text-[#A20D18] transition-colors duration-200">
        {vastuText}
      </span>
      <span className="inline-block w-[0.3em]">&nbsp;</span>
      <span className="text-[#075B2A] transition-colors duration-200">
        {ritamText}
      </span>
      {tmSymbol}
    </Component>
  );
};

export default BrandName;
