import React from 'react';

/**
 * Reusable heading component with a left color bar (design system)
 * @param {Object} props
 * @param {React.ReactNode} props.children - Title text
 * @param {string} [props.className] - Additional class names for the container
 * @param {boolean} [props.hasBorder=false] - Whether to draw a bottom divider line
 * @param {boolean} [props.uppercase=true] - Transform text to uppercase
 */
export default function SectionHeading({
  children,
  className = '',
  hasBorder = false,
  uppercase = true
}) {
  return (
    <div
      className={`flex items-center space-x-2.5 ${
        hasBorder ? 'border-b border-[#222222] pb-3' : ''
      } ${className}`}
    >
      <div className="w-1.5 h-5 bg-select flex-shrink-0 rounded-full"></div>
      <h2 className={`text-subtitle text-text-main font-bold tracking-wider ${uppercase ? 'uppercase' : ''}`}>
        {children}
      </h2>
    </div>
  );
}
