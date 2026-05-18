import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const StatsSection = () => {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    // Register ScrollTrigger if not registered
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Set to final states directly if user prefers reduced motion
      gsap.set('.stat-card', { opacity: 1, y: 0, scale: 1 });
      document.querySelectorAll('.stat-number').forEach(el => {
        el.textContent = el.dataset.target;
      });
      return;
    }

    const ctx = gsap.context(() => {
      const timer = setTimeout(() => {
        // 1. Animate Cards In
        gsap.fromTo('.stat-card', 
          {
            opacity: 0,
            y: 60,
            scale: 0.92
          }, 
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.15,
            scrollTrigger: {
              trigger: '.stats-section',
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            }
          }
        );

        // 2. Count-Up Numbers
        ScrollTrigger.create({
          trigger: '.stats-section',
          start: 'top 80%',
          once: true,
          onEnter: () => {
            document.querySelectorAll('.stat-number').forEach(el => {
              const target = parseFloat(el.dataset.target);
              const isDecimal = el.dataset.decimal === 'true';
              gsap.fromTo(
                { val: 0 },
                {
                  val: target,
                  duration: 2.2,
                  ease: 'power2.out',
                  onUpdate: function() {
                    el.textContent = isDecimal
                      ? this.targets()[0].val.toFixed(1)
                      : Math.round(this.targets()[0].val);
                  }
                }
              );
            });
          }
        });

        ScrollTrigger.refresh();
      }, 100);

      return () => clearTimeout(timer);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const statsData = [
    { value: 247,  suffix: '+', decimal: false, label: 'Verified Karigar',   sub: 'Across 12 cities' },
    { value: 4.8,  suffix: '★', decimal: true,  label: 'Average Rating',     sub: '12,400+ reviews'  },
    { value: 98,   suffix: '%', decimal: false, label: 'Jobs Completed',     sub: 'Satisfaction rate' },
    { value: 60,   suffix: 's', decimal: false, label: 'Avg Booking Time',   sub: 'From request to confirm' }
  ];

  return (
    <section
      ref={sectionRef}
      className="stats-section section-padding"
      style={{
        width: '100%',
        backgroundColor: 'var(--color-bg)',
        position: 'relative',
        zIndex: 3,
        overflow: 'hidden',
      }}
    >
      <div className="container-custom">
        {/* Responsive Grid Container */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {statsData.map((stat, i) => (
            <div
              key={i}
              className="stat-card"
              style={{
                backgroundColor: 'var(--color-card)',
                borderRadius: '20px',
                padding: '48px 40px',
                border: '1px solid var(--color-border)',
                borderTop: '3px solid var(--color-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(10, 21, 32, 0.3)',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
              }}
            >
              {/* Number and Suffix */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <span
                  className="stat-number"
                  data-target={stat.value}
                  data-decimal={stat.decimal}
                  style={{
                    fontSize: 'clamp(48px, 6vw, 84px)',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    lineHeight: 1,
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  0
                </span>
                <span
                  style={{
                    fontSize: 'clamp(24px, 3vw, 42px)',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    marginLeft: '2px',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {stat.suffix}
                </span>
              </div>

              {/* Label */}
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-white)',
                  marginBottom: '8px',
                }}
              >
                {stat.label}
              </div>

              {/* Sub-description */}
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--color-body)',
                  fontWeight: 500,
                }}
              >
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Styled Grid Card Hover effect overrides in case CSS isn't loaded */}
      <style>{`
        .stat-card:hover {
          transform: translateY(-8px);
          border-color: var(--color-primary) !important;
          box-shadow: 0 15px 35px rgba(2, 195, 154, 0.15);
        }
        @media (max-width: 1024px) {
          .stats-section .container-custom > div {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .stats-section .container-custom > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default StatsSection;
