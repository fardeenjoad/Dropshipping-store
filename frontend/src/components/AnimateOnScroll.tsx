"use client";

import React, { useEffect, useState, useRef } from 'react';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  animation?: 'fade-in-up' | 'fade-in-left' | 'fade-in-right' | 'fade-in' | 'scale-in';
  delay?: number;
  className?: string;
  threshold?: number;
}

const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({ 
  children, 
  animation = 'fade-in-up', 
  delay = 0,
  className = '',
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            if (domRef.current) observer.unobserve(domRef.current);
          }
        });
      },
      { threshold }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const animationClass = isVisible ? `animate-${animation}` : 'opacity-0';
  
  return (
    <div 
      ref={domRef} 
      className={`${animationClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default AnimateOnScroll;
