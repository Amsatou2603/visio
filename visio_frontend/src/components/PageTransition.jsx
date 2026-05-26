import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.classList.remove('page-enter');
      void ref.current.offsetWidth; // force reflow
      ref.current.classList.add('page-enter');
    }
  }, [location.pathname]);

  return (
    <div ref={ref} className="page-enter" style={{ minHeight: '60vh' }}>
      {children}
    </div>
  );
};

export default PageTransition;