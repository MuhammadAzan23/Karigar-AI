import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const GallerySection = () => {
  const galleryRef = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.set('.gallery-word, .gallery-label', { opacity: 1, y: 0, yPercent: 0 });
      gsap.set('.karigar-card', { opacity: 1, x: 0, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const timer = setTimeout(() => {
        const track = document.querySelector('.gallery-track');
        const cards = gsap.utils.toArray('.karigar-card');
        const isMobile = window.innerWidth < 768;

        // 1. Header slide-up on mount/scroll
        gsap.fromTo('.gallery-label',
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: '.gallery-sticky',
              start: 'top 80%',
            }
          }
        );

        gsap.fromTo('.gallery-word',
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power4.out',
            stagger: 0.05,
            scrollTrigger: {
              trigger: '.gallery-sticky',
              start: 'top 80%',
            }
          }
        );

        // 2. Toggled Horizontal Scroll (Desktop) vs Vertical Scroll (Mobile)
        if (isMobile) {
          // Mobile: simple vertical fade/slide reveal on scroll
          gsap.fromTo('.karigar-card',
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.15,
              scrollTrigger: {
                trigger: '.gallery-track',
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              }
            }
          );
        } else {
          // Desktop/Tablet: Pin & translate horizontal track
          if (track) {
            const totalWidth = track.scrollWidth - window.innerWidth + (window.innerWidth * 0.05); // Include padding offset

            // Horizontal Slide Animation
            gsap.to(track, {
              x: () => -totalWidth,
              ease: 'none',
              scrollTrigger: {
                trigger: '.gallery-wrapper',
                start: 'top top',
                end: () => `+=${totalWidth}`,
                scrub: 1,
                pin: '.gallery-sticky',
                anticipatePin: 1,
                invalidateOnRefresh: true,
              }
            });

            // Progress Bar linked to scroll
            gsap.fromTo('.gallery-progress-bar',
              { scaleX: 0 },
              {
                scaleX: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: '.gallery-wrapper',
                  start: 'top top',
                  end: () => `+=${totalWidth}`,
                  scrub: true,
                }
              }
            );

            // Stagger cards in from the right as they enter sticky viewport
            cards.forEach((card, i) => {
              gsap.fromTo(card,
                { opacity: 0, x: 80 },
                {
                  opacity: 1,
                  x: 0,
                  duration: 0.6,
                  ease: 'power3.out',
                  scrollTrigger: {
                    trigger: '.gallery-wrapper',
                    start: () => `+=${(i * (totalWidth / cards.length)) * 0.8} top`,
                    toggleActions: 'play none none reverse',
                    scrub: false,
                  }
                }
              );
            });
          }
        }

        ScrollTrigger.refresh();
      }, 100);

      return () => clearTimeout(timer);
    }, galleryRef);

    return () => ctx.revert();
  }, []);

  const karigars = [
    { name: 'Ali Hassan',     initials: 'AH', service: 'AC Repair',    rating: 4.9, jobs: 312, years: 5, price: 900,  onTime: '95%' },
    { name: 'Kamran Baig',    initials: 'KB', service: 'Electrician',  rating: 4.7, jobs: 247, years: 3, price: 800,  onTime: '92%' },
    { name: 'Tariq Mehmood',  initials: 'TM', service: 'Plumber',      rating: 4.8, jobs: 189, years: 4, price: 750,  onTime: '94%' },
    { name: 'Sohail Raza',    initials: 'SR', service: 'Carpenter',    rating: 4.6, jobs: 156, years: 6, price: 1100, onTime: '91%' },
    { name: 'Usman Farooq',   initials: 'UF', service: 'Painter',      rating: 4.7, jobs: 203, years: 2, price: 700,  onTime: '89%' },
    { name: 'Bilal Ahmed',    initials: 'BA', service: 'Welder',        rating: 4.5, jobs: 134, years: 7, price: 950,  onTime: '93%' },
  ];

  const renderSplitText = (text) => {
    return text.split('\n').map((line, idx) => (
      <div key={idx} style={{ display: 'block' }}>
        {line.split(' ').map((word, i) => (
          <div key={i} className="word-mask" style={{ marginRight: '0.25em' }}>
            <span className="gallery-word" style={{ display: 'inline-block' }}>
              {word}
            </span>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div
      ref={galleryRef}
      className="gallery-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Sticky Inner Div */}
      <div
        className="gallery-sticky"
        style={{
          width: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--color-bg)',
        }}
      >
        {/* Section Header */}
        <div
          style={{
            padding: '60px 5vw 0',
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            zIndex: 10,
            position: 'relative',
          }}
        >
          <div className="gallery-label label-premium" style={{ marginBottom: '12px' }}>
            Best Karigar
          </div>
          <h2
            className="heading-section"
            style={{
              lineHeight: 1.15,
            }}
          >
            {renderSplitText("Aapke Ilaqe Ke\nTop Professionals")}
          </h2>
        </div>

        {/* Horizontal Card Track */}
        <div
          className="gallery-track"
          style={{
            display: 'flex',
            gap: '24px',
            padding: '40px 5vw 120px',
            width: 'max-content',
            marginTop: '20px',
          }}
        >
          {karigars.map((karigar, idx) => (
            <div
              key={idx}
              className="karigar-card"
              style={{
                width: '320px',
                flexShrink: 0,
                backgroundColor: 'var(--color-card)',
                borderRadius: '20px',
                padding: '28px 24px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 12px 30px rgba(10, 21, 32, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Profile Header (Avatar + Name & Service) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Initials Avatar */}
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '24px',
                    color: 'var(--color-white)',
                    boxShadow: '0 4px 12px rgba(2, 128, 144, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  {karigar.initials}
                </div>

                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-white)', marginBottom: '4px' }}>
                    {karigar.name}
                  </h3>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)' }}>
                    {karigar.service}
                  </span>
                </div>
              </div>

              {/* Rating and Experience Row */}
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--color-body)',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>⭐ {karigar.rating}</span>
                <span>•</span>
                <span>{karigar.jobs} jobs</span>
                <span>•</span>
                <span>{karigar.years} yrs exp</span>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', width: '100%' }} />

              {/* Mini Stats Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-body)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--color-white)', fontSize: '12px', fontWeight: 700 }}>{karigar.onTime}</span>
                  <span>On-Time</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)' }}>
                  <span style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 700 }}>Rs.{karigar.price}</span>
                  <span>/hr</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--color-white)', fontSize: '12px', fontWeight: 700 }}>3%</span>
                  <span>Cancel</span>
                </div>
              </div>

              {/* CTA Booking Button */}
              <button
                className="btn-book"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-bg)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease',
                  marginTop: '8px',
                }}
              >
                Book Karo →
              </button>
            </div>
          ))}
        </div>

        {/* Floating Bottom Progress Tracker */}
        <div
          className="gallery-footer-bar"
          style={{
            position: 'absolute',
            bottom: '30px',
            left: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10,
          }}
        >
          {/* Progress track */}
          <div
            style={{
              width: '200px',
              height: '2px',
              backgroundColor: 'rgba(30, 58, 95, 0.4)',
              overflow: 'hidden',
              borderRadius: '1px',
            }}
          >
            <div
              className="gallery-progress-bar"
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--color-primary)',
                transformOrigin: 'left',
                transform: 'scaleX(0)',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--color-body)',
              letterSpacing: '1px',
            }}
          >
            ← Scroll to explore karigar →
          </div>
        </div>

      </div>

      <style>{`
        /* Card Hover Effects */
        .karigar-card {
          transition: border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease !important;
        }
        .karigar-card:hover {
          transform: translateY(-8px) !important;
          border-color: var(--color-primary) !important;
          box-shadow: 0 15px 35px rgba(2, 195, 154, 0.15) !important;
        }
        
        .btn-book {
          transition: all 0.3s ease;
        }
        .karigar-card:hover .btn-book {
          background-color: #03d6a9 !important;
          box-shadow: 0 4px 12px rgba(2, 195, 154, 0.2);
        }

        /* Sticky settings for desktop horizontal scroll wrapper */
        @media (min-width: 768px) {
          .gallery-wrapper {
            height: 300vh; /* scroll volume */
          }
          .gallery-sticky {
            position: sticky;
            top: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        }

        /* Mobile specific styles: Disable pinning, vertical stack */
        @media (max-width: 768px) {
          .gallery-wrapper {
            height: auto !important;
            padding: 80px 0;
          }
          .gallery-sticky {
            position: relative !important;
            height: auto !important;
            display: block !important;
          }
          .gallery-track {
            flex-direction: column !important;
            width: 100% !important;
            align-items: center !important;
            padding: 40px 24px 0 !important;
            margin-top: 0 !important;
            gap: 28px !important;
          }
          .karigar-card {
            width: 100% !important;
            max-width: 380px !important;
          }
          .gallery-footer-bar {
            display: none !important;
          }
          .gallery-sticky > div:first-child {
            padding: 0 24px !important;
            text-align: center !important;
          }
          .gallery-sticky > div:first-child h2 {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default GallerySection;
