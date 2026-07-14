import React from 'react';

/**
 * Reusable Age Rating Tag / Badge
 * @param {string} rating - The age rating string (e.g. "T18", "T16", "P", "K")
 * @param {'default'|'hero'} variant - Styling variant ('default' for solid red, 'hero' for white outline)
 * @param {string} className - Additional CSS class names
 */
const AgeRatingTag = ({ rating, variant = 'default', className = '' }) => {
  if (!rating) return null;

  if (variant === 'hero') {
    return (
      <span className={`border border-zinc-500 text-text-sub2 text-[10px] md:text-body3 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider select-none ${className}`}>
        {rating}
      </span>
    );
  }

  // Default: solid red background, white text (used on cards and other pages)
  return (
    <span className={`w-10 h-6 bg-cta text-text-main text-[11px] rounded font-bold uppercase tracking-wider select-none flex items-center justify-center flex-shrink-0 ${className}`}>
      {rating}
    </span>
  );
};

export default AgeRatingTag;
