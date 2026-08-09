import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal Component
 * Smoothly reveals and floats elements up as the user scrolls into view.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.15
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getTransformStyle = () => {
    switch (direction) {
      case 'up':
        return isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0';
      case 'down':
        return isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0';
      case 'left':
        return isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0';
      case 'right':
        return isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0';
      case 'scale':
        return isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0';
      default:
        return isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0';
    }
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${getTransformStyle()} ${className}`}
    >
      {children}
    </div>
  );
}
