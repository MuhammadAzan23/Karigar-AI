import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const TickerSection = () => {
  const containerRef = useRef(null);

  // Continuous loop animations
  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Row 1: Leftward Ticker
    // We set xPercent from 0 to -50 (half of a 4x repeated track is exactly two repeats)
    const animRow1 = gsap.to('.ticker-row-1 .ticker-track', {
      xPercent: -50,
      ease: 'none',
      duration: 30,
      repeat: -1
    });

    // Row 2: Rightward Ticker
    // To move right seamlessly, we animate from -50% to 0%
    const animRow2 = gsap.fromTo('.ticker-row-2 .ticker-track',
      { xPercent: -50 },
      {
        xPercent: 0,
        ease: 'none',
        duration: 25,
        repeat: -1
      }
    );

    return () => {
      animRow1.kill();
      animRow2.kill();
    };
  }, []);

  // Row 1 Sentence
  const row1Sentence = (
    <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      In every booking, discover the undeniable{" "}
      <em style={{ color: 'var(--color-primary)', fontStyle: 'normal', opacity: 1, fontWeight: '800', margin: '0 8px' }}>Real Magic</em>{" "}
      of connecting trusted{" "}
      <em style={{ color: 'var(--color-primary)', fontStyle: 'normal', opacity: 1, fontWeight: '800', margin: '0 8px' }}>Karigar</em>{" "}
      with every{" "}
      <em style={{ color: 'var(--color-primary)', fontStyle: 'normal', opacity: 1, fontWeight: '800', margin: '0 8px' }}>home</em>{" "}
      — fast, fair, and always on time.
    </div>
  );

  // SVG Punctuation Elements
  const StarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" style={{ margin: '0 24px', flexShrink: 0 }}>
      <polygon
        points="10,1 12.9,7 19.5,7.6 14.5,12 16.2,18.5 10,15 3.8,18.5 5.5,12 0.5,7.6 7.1,7"
        fill="var(--color-primary)"
        opacity="0.8"
      />
    </svg>
  );

  const DiamondIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ margin: '0 24px', flexShrink: 0 }}>
      <polygon
        points="8,0 16,8 8,16 0,8"
        fill="var(--color-teal)"
        opacity="0.7"
      />
    </svg>
  );

  const DotClusterIcon = () => (
    <svg width="24" height="12" viewBox="0 0 24 12" style={{ margin: '0 24px', flexShrink: 0 }}>
      <circle cx="4" cy="6" r="3" fill="var(--color-primary)" opacity="0.5" />
      <circle cx="12" cy="6" r="3" fill="var(--color-primary)" opacity="0.8" />
      <circle cx="20" cy="6" r="3" fill="var(--color-primary)" opacity="0.5" />
    </svg>
  );

  // Row 2 Services
  const services = [
    { name: 'Electrician', icon: <StarIcon /> },
    { name: 'Plumber', icon: <DiamondIcon /> },
    { name: 'AC Repair', icon: <DotClusterIcon /> },
    { name: 'Painter', icon: <StarIcon /> },
    { name: 'Carpenter', icon: <DiamondIcon /> },
    { name: 'Tutor', icon: <DotClusterIcon /> },
    { name: 'Cleaner', icon: <StarIcon /> },
    { name: 'Welder', icon: <DiamondIcon /> }
  ];

  const row2Sentence = (
    <div style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
      {services.map((service, i) => (
        <React.Fragment key={i}>
          <span>{service.name}</span>
          {service.icon}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section
      ref={containerRef}
      style={{
        width: '100%',
        backgroundColor: 'var(--color-dark)',
        overflow: 'hidden',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '48px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
      }}
    >
      {/* Row 1 - Moves Left */}
      <div
        className="ticker-row-1"
        style={{
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          className="ticker-track"
          style={{
            display: 'flex',
            width: 'max-content',
            gap: '60px',
            alignItems: 'center',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.15)',
          }}
        >
          {row1Sentence}
          {row1Sentence}
          {row1Sentence}
          {row1Sentence}
        </div>
      </div>

      {/* Row 2 - Moves Right */}
      <div
        className="ticker-row-2"
        style={{
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          className="ticker-track"
          style={{
            display: 'flex',
            width: 'max-content',
            gap: '60px',
            alignItems: 'center',
            fontSize: 'clamp(18px, 2.5vw, 32px)',
            fontWeight: 600,
            color: 'rgba(2, 195, 154, 0.4)',
          }}
        >
          {row2Sentence}
          {row2Sentence}
          {row2Sentence}
          {row2Sentence}
        </div>
      </div>
    </section>
  );
};

export default TickerSection;
