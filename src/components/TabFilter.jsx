export default function TabFilter({ 
  tabs = [], 
  activeTab, 
  onChange, 
  className = '', 
  centered = false,
  variant = 'select', // 'select' (blue #0EA1CF) or 'cta' (red #CF0F47)
  isHeaderTab = false // if true, uses -mb-4 to align with parent header bottom border (like in Home.jsx)
}) {
  const activeClass = variant === 'cta' 
    ? 'border-cta text-text-main' 
    : 'border-select text-select';

  const wrapperClass = isHeaderTab
    ? `flex space-x-6 ${className}`
    : `flex border-b border-zinc-800/80 mb-6 overflow-x-auto whitespace-nowrap scrollbar-none gap-6 md:gap-8 px-2 ${
        centered ? 'justify-center' : ''
      } ${className}`;

  const buttonClass = isHeaderTab
    ? 'pb-4 -mb-4 border-b-2 text-body2 transition-all cursor-pointer font-medium'
    : 'pb-4 -mb-px border-b-2 text-body2 transition-all cursor-pointer font-bold';

  return (
    <div className={wrapperClass}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`${buttonClass} ${
            activeTab === tab.id
              ? activeClass
              : 'border-transparent text-text-sub3 hover:text-text-main'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
