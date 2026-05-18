import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const JourneySection = () => {
  const sectionRef = useRef(null);
  const horizontalPathRef = useRef(null);
  const verticalPathRef = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set('.journey-word, .journey-label', { opacity: 1, y: 0, yPercent: 0 });
      gsap.set('.journey-node', { backgroundColor: 'var(--color-primary)', scale: 1.15 });
      document.querySelectorAll('.step-number').forEach(el => el.style.color = 'var(--color-bg)');
      return;
    }

    const ctx = gsap.context(() => {
      const timer = setTimeout(() => {
        // 1. Headline reveal on scroll
        gsap.fromTo('.journey-label',
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: '.journey-section',
              start: 'top 75%',
            }
          }
        );

        gsap.fromTo('.journey-word',
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power4.out',
            stagger: 0.05,
            scrollTrigger: {
              trigger: '.journey-section',
              start: 'top 75%',
            }
          }
        );

        // 2. Determine if mobile layout is active to select the active path
        const isMobile = window.innerWidth < 768;
        const activePath = isMobile ? verticalPathRef.current : horizontalPathRef.current;
        const activeSuffix = isMobile ? 'v' : 'h';

        if (activePath) {
          const length = activePath.getTotalLength();
          
          // Initialize path styling
          activePath.style.strokeDasharray = length;
          activePath.style.strokeDashoffset = length;

          ScrollTrigger.create({
            trigger: '.journey-timeline-container',
            start: 'top 65%',
            end: 'bottom 35%',
            scrub: 1.2,
            onUpdate: (self) => {
              const progress = self.progress;
              
              // Draw active path stroke
              activePath.style.strokeDashoffset = length - (length * progress);

              // Staggered node thresholds (5 nodes)
              const nodeThresholds = [0.0, 0.25, 0.50, 0.75, 1.0];
              nodeThresholds.forEach((threshold, i) => {
                const node = document.querySelector(`.node-${activeSuffix}-${i + 1}`);
                if (node) {
                  if (progress >= threshold) {
                    node.classList.add('active');
                    gsap.to(node, {
                      backgroundColor: 'var(--color-primary)',
                      scale: 1.15,
                      borderColor: 'var(--color-primary)',
                      duration: 0.4,
                      ease: 'back.out(1.7)'
                    });
                  } else {
                    node.classList.remove('active');
                    gsap.to(node, {
                      backgroundColor: 'var(--color-card)',
                      scale: 1.0,
                      borderColor: 'var(--color-border)',
                      duration: 0.3,
                      ease: 'power2.out'
                    });
                  }
                }
              });
            }
          });
        }

        ScrollTrigger.refresh();
      }, 100);

      return () => clearTimeout(timer);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      title: "Zaroorat Batao",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="step-icon" style={{ color: 'var(--color-primary)', transition: 'color 0.3s' }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      title: "AI Samjha",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="step-icon" style={{ color: 'var(--color-primary)', transition: 'color 0.3s' }}>
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
        </svg>
      )
    },
    {
      title: "Best Karigar Mila",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="step-icon" style={{ color: 'var(--color-primary)', transition: 'color 0.3s' }}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>
        </svg>
      )
    },
    {
      title: "Booking Confirm",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="step-icon" style={{ color: 'var(--color-primary)', transition: 'color 0.3s' }}>
          <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
        </svg>
      )
    },
    {
      title: "Kaam Mukammal",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="step-icon" style={{ color: 'var(--color-primary)', transition: 'color 0.3s' }}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a4 4 0 0 0-4 4v5c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V6a4 4 0 0 0-4-4z"/>
        </svg>
      )
    }
  ];

  const renderSplitText = (text) => {
    return text.split(' ').map((word, i) => (
      <div key={i} className="word-mask" style={{ marginRight: '0.25em' }}>
        <span className="journey-word" style={{ display: 'inline-block' }}>
          {word}
        </span>
      </div>
    ));
  };

  return (
    <section
      ref={sectionRef}
      className="journey-section section-padding"
      style={{
        width: '100%',
        backgroundColor: 'var(--color-bg)',
        position: 'relative',
        zIndex: 3,
        overflow: 'hidden',
      }}
    >
      <div className="container-custom">
        {/* Section Headers */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '80px',
          }}
        >
          <div className="journey-label label-premium" style={{ marginBottom: '16px' }}>
            Booking Ka Safar
          </div>
          <h2 className="heading-section">
            {renderSplitText("5 Steps, Fauran Karigar")}
          </h2>
        </div>

        {/* Journey Timeline Container */}
        <div className="journey-timeline-container" style={{ position: 'relative', width: '100%' }}>
          
          {/* DESKTOP TIMELINE (Horizontal) */}
          <div className="timeline-horizontal" style={{ position: 'relative', width: '100%', padding: '40px 0 60px' }}>
            {/* SVG Connecting Track */}
            <div style={{ position: 'absolute', top: '72px', left: '8%', right: '8%', height: '4px', zIndex: 1 }}>
              <svg width="100%" height="4" viewBox="0 0 800 4" preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
                {/* Background Pending Track */}
                <line
                  x1="0%"
                  y1="2"
                  x2="100%"
                  y2="2"
                  stroke="var(--color-border)"
                  strokeWidth="2"
                  strokeDasharray="6, 6"
                />
                {/* Active Dynamic Progress Track */}
                <line
                  ref={horizontalPathRef}
                  className="journey-path"
                  x1="0%"
                  y1="2"
                  x2="100%"
                  y2="2"
                  stroke="var(--color-primary)"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>

            {/* Steps Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '16%',
                    textAlign: 'center',
                  }}
                >
                  {/* Icon Container */}
                  <div style={{ marginBottom: '16px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {step.icon}
                  </div>

                  {/* Circle Node */}
                  <div
                    className={`journey-node node-h-${i + 1}`}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-card)',
                      border: '2px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '16px',
                      fontSize: '18px',
                      fontWeight: '800',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      boxShadow: '0 8px 24px rgba(10, 21, 32, 0.3)',
                    }}
                  >
                    <span
                      className="step-number"
                      style={{
                        color: 'var(--color-primary)',
                        transition: 'color 0.3s',
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>

                  {/* Title Label */}
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: 'var(--color-body)',
                      lineHeight: '1.4',
                      maxWidth: '120px',
                    }}
                  >
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MOBILE TIMELINE (Vertical) */}
          <div className="timeline-vertical" style={{ display: 'none', position: 'relative', paddingLeft: '50px' }}>
            {/* SVG Connecting Track */}
            <div style={{ position: 'absolute', left: '20px', top: '30px', bottom: '30px', width: '4px', zIndex: 1 }}>
              <svg width="4" height="100%" viewBox="0 0 4 500" preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible', height: '100%' }}>
                {/* Background Pending Track */}
                <line
                  x1="2"
                  y1="0"
                  x2="2"
                  y2="500"
                  stroke="var(--color-border)"
                  strokeWidth="2"
                  strokeDasharray="6, 6"
                />
                {/* Active Dynamic Progress Track */}
                <path
                  ref={verticalPathRef}
                  className="journey-path"
                  d="M 2,0 L 2,500"
                  stroke="var(--color-primary)"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>

            {/* Vertical Nodes */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '48px',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {steps.map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    textAlign: 'left',
                  }}
                >
                  {/* Circle Node */}
                  <div
                    className={`journey-node node-v-${i + 1}`}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-card)',
                      border: '2px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '15px',
                      fontWeight: '800',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      boxShadow: '0 4px 12px rgba(10, 21, 32, 0.3)',
                    }}
                  >
                    <span
                      className="step-number"
                      style={{
                        color: 'var(--color-primary)',
                      }}
                    >
                      {i + 1}
                    </span>
                  </div>

                  {/* Icon & Description Column */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {step.icon}
                    </div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: '700',
                        color: 'var(--color-white)',
                      }}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .timeline-horizontal {
            display: none !important;
          }
          .timeline-vertical {
            display: block !important;
          }
          .journey-section .container-custom {
            padding: 0 32px !important;
          }
        }
      `}</style>
    </section>
  );
};

export default JourneySection;
