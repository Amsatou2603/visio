import { useEffect, useRef } from 'react';

/**
 * Hook pour animer les éléments au scroll
 * @param {Object} options - Options d'animation
 * @returns {Object} - Ref à attacher à l'élément
 */
export const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);
  const {
    threshold = 0.1,
    rootMargin = '0px',
    animationClass = 'scroll-reveal',
    once = true,
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add initial state
    element.classList.add('scroll-hidden');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('scroll-hidden');
            entry.target.classList.add(animationClass);
            
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            entry.target.classList.add('scroll-hidden');
            entry.target.classList.remove(animationClass);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, animationClass, once]);

  return elementRef;
};

/**
 * Hook pour animer plusieurs enfants avec délai échelonné
 */
export const useStaggerAnimation = (options = {}) => {
  const containerRef = useRef(null);
  const {
    threshold = 0.1,
    staggerDelay = 100, // ms between each child
    animationClass = 'scroll-reveal-stagger',
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = Array.from(container.children);
    
    children.forEach((child, index) => {
      child.classList.add('scroll-hidden');
      child.style.transitionDelay = `${index * staggerDelay}ms`;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const kids = Array.from(entry.target.children);
            kids.forEach((child) => {
              child.classList.remove('scroll-hidden');
              child.classList.add(animationClass);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(container);

    return () => {
      if (container) {
        observer.unobserve(container);
      }
    };
  }, [threshold, staggerDelay, animationClass]);

  return containerRef;
};

/**
 * Hook pour parallax simple au scroll
 */
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const windowHeight = window.innerHeight;
      
      // Only apply parallax when element is in viewport
      if (rect.top < windowHeight && rect.bottom > 0) {
        const yPos = (scrolled - elementTop) * speed;
        element.style.transform = `translateY(${yPos}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return elementRef;
};

/**
 * Composant wrapper pour animations de scroll
 */
export const ScrollReveal = ({ 
  children, 
  animation = 'fade-up',
  delay = 0,
  once = true,
  className = ''
}) => {
  const ref = useScrollAnimation({ 
    animationClass: `scroll-reveal-${animation}`,
    once 
  });

  return (
    <div 
      ref={ref} 
      className={className}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default { useScrollAnimation, useStaggerAnimation, useParallax, ScrollReveal };
