import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import global design system and styling resets
import './index.css';

// Import all sections in delivery order
import HeroSection from './components/HeroSection';
import TickerSection from './components/TickerSection';
import StatsSection from './components/StatsSection';
import AIDemoSection from './components/AIDemoSection';
import JourneySection from './components/JourneySection';
import GallerySection from './components/GallerySection';
import FooterCTA from './components/FooterCTA';

// Register GSAP ScrollTrigger globally once at the application root
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function App() {
  // Post-mount layout safety and accessibility support
  useEffect(() => {
    // 1. Refresh ScrollTrigger after DOM is completely ready and fonts are loaded
    const handleLoad = () => {
      ScrollTrigger.refresh();
    };
    
    window.addEventListener('load', handleLoad);
    
    // Safety fallback: refresh after short delay
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(timer);
    };
  }, []);

  return (
    <main
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-white)',
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* 1. HERO SECTION (full viewport height, word-mask, ShinyText, grid bg) */}
      <HeroSection />

      {/* 2. TICKER TAPE (continuous horizontal scroll words and punctuation) */}
      <TickerSection />

      {/* 3. STATS SECTION (count-up on scroll) */}
      <StatsSection />

      {/* 4. AI DEMO SECTION (typing Roman Urdu inside dynamic phone mockup) */}
      <AIDemoSection />

      {/* 5. BOOKING JOURNEY (SVG connecting line draws itself with scroll progress) */}
      <JourneySection />

      {/* 6. KARIGAR GALLERY (sticky horizontal scroll pinned container) */}
      <GallerySection />

      {/* 7. FOOTER CTA (large ShinyText headline + custom action triggers) */}
      <FooterCTA />
    </main>
  );
}

export default App;
