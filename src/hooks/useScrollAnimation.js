import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger globally once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const useScrollAnimation = (animationCallback, deps = []) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context((self) => {
      const timer = setTimeout(() => {
        if (animationCallback && typeof animationCallback === 'function') {
          animationCallback(self, containerRef.current);
        }
        ScrollTrigger.refresh();
      }, 100);

      return () => clearTimeout(timer);
    }, containerRef);

    return () => ctx.revert();
  }, deps);

  return containerRef;
};

export default useScrollAnimation;
