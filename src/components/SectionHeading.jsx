import React from 'react';

/**
 * Reusable heading component with a left color bar (design system blue)
 * @param {Object} props
 * @param {React.ReactNode} props.children - Title text
 * @param {string} [props.className] - Additional class names for the container
 * @param {boolean} [props.hasBorder=false] - Whether to draw a bottom divider line
 */
export default function SectionHeading({
  children,
  className = '',
  hasBorder = false
}) {
  return (
    <div
      className={`flex items-center space-x-2 ${
        hasBorder ? 'border-b border-[#222222] pb-4' : ''
      } ${className}`}
    >
      <div className="w-1.5 h-6 bg-select flex-shrink-0"></div>
      <h2 className="text-heading2 text-text-main font-bold tracking-wider">
        {children}
      </h2>
    </div>
  );
}
