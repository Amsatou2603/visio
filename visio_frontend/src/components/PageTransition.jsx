import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    // Track page view
    trackPageView(location.pathname + location.search);

    // Animation
    if (ref.current) {
      ref.current.classList.remove('page-enter');
      void ref.current.offsetWidth;
      ref.current.classList.add('page-enter');
    }
  }, [location.pathname, location.search]);

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  );
};

export default PageTransition;