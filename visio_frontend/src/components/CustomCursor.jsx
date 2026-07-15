import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    
    if (!cursor || !cursorDot) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let dotX = 0;
    let dotY = 0;

    // Smooth follow animation
    const animate = () => {
      // Cursor circle follows with delay (smoother)
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      cursorX += dx * 0.15;
      cursorY += dy * 0.15;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

      // Dot follows faster
      const dotDx = mouseX - dotX;
      const dotDy = mouseY - dotY;
      dotX += dotDx * 0.3;
      dotY += dotDy * 0.3;
      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px)`;

      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseEnter = (e) => {
      const target = e.target;
      const isClickable = 
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.onclick ||
        target.classList.contains('cursor-pointer') ||
        target.closest('a, button, [role="button"], input, textarea, select');
      
      setIsPointer(!!isClickable);
    };

    const handleMouseLeave = () => {
      setIsHidden(true);
    };

    const handleMouseEnterWindow = () => {
      setIsHidden(false);
    };

    // Event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, []);

  // Don't render on mobile/touch devices
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      setIsHidden(true);
    }
  }, []);

  return (
    <>
      <div 
        ref={cursorRef}
        className={`custom-cursor ${isPointer ? 'cursor-hover' : ''} ${isHidden ? 'cursor-hidden' : ''}`}
      >
        <div className="cursor-ring"></div>
      </div>
      <div 
        ref={cursorDotRef}
        className={`custom-cursor-dot ${isPointer ? 'cursor-dot-hover' : ''} ${isHidden ? 'cursor-hidden' : ''}`}
      />
    </>
  );
};

export default CustomCursor;
