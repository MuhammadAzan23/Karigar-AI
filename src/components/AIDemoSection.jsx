import React, { useLayoutEffect, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const AIDemoSection = () => {
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [showConfidence, setShowConfidence] = useState(false);

  const fullText = "AC theek karna hai, kal subah\nG-13 mein, budget kam hai...";

  // 1. GSAP ScrollTrigger for in-view detection & text reveal
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setInView(true);
      gsap.set('.ai-word, .ai-label, .ai-body, .ai-bullet', { opacity: 1, y: 0, yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const timer = setTimeout(() => {
        // Label animation
        gsap.fromTo('.ai-label',
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: '.ai-demo-section',
              start: 'top 70%',
            }
          }
        );

        // Word reveal clip mask animation
        gsap.fromTo('.ai-word',
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power4.out',
            stagger: 0.05,
            scrollTrigger: {
              trigger: '.ai-demo-section',
              start: 'top 70%',
            }
          }
        );

        // Body text animation
        gsap.fromTo('.ai-body',
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.3,
            scrollTrigger: {
              trigger: '.ai-demo-section',
              start: 'top 70%',
            }
          }
        );

        // Bullet list items staggered fade-in
        gsap.fromTo('.ai-bullet',
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            stagger: 0.2,
            delay: 0.5,
            scrollTrigger: {
              trigger: '.ai-demo-section',
              start: 'top 70%',
            }
          }
        );

        // Trigger typing effect when in viewport
        ScrollTrigger.create({
          trigger: '.ai-demo-section',
          start: 'top 70%',
          onEnter: () => setInView(true),
          once: true
        });

        ScrollTrigger.refresh();
      }, 100);

      return () => clearTimeout(timer);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 2. Typing loop logic
  useEffect(() => {
    if (!inView) return;
    let isMounted = true;
    let intervalId;
    let timeoutId1;
    let timeoutId2;

    const startTyping = () => {
      if (!isMounted) return;
      setDisplayedText('');
      setShowConfidence(false);
      let index = 0;

      intervalId = setInterval(() => {
        if (!isMounted) return;
        setDisplayedText(fullText.slice(0, index + 1));
        index++;

        if (index >= fullText.length) {
          clearInterval(intervalId);

          // Reveal confidence card after 1200ms
          timeoutId1 = setTimeout(() => {
            if (!isMounted) return;
            setShowConfidence(true);

            // Wait 4.5s before resetting the typewriter loop
            timeoutId2 = setTimeout(() => {
              if (!isMounted) return;
              startTyping();
            }, 4500);
          }, 1200);
        }
      }, 60);
    };

    startTyping();

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
    };
  }, [inView]);

  const renderSplitText = (text) => {
    return text.split(' ').map((word, i) => (
      <div key={i} className="word-mask" style={{ marginRight: '0.25em' }}>
        <span className="ai-word" style={{ display: 'inline-block' }}>
          {word}
        </span>
      </div>
    ));
  };

  return (
    <section
      ref={sectionRef}
      className="ai-demo-section section-padding"
      style={{
        width: '100%',
        backgroundColor: 'var(--color-bg)',
        position: 'relative',
        zIndex: 3,
        overflow: 'hidden',
      }}
    >
      <div className="container-custom">
        <div
          className="ai-columns-wrapper"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '64px',
            width: '100%',
          }}
        >
          {/* Left Column: Text & Bullets */}
          <div
            className="ai-left-column"
            style={{
              flex: '1 1 55%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            {/* Label */}
            <div
              className="ai-label label-premium"
              style={{ marginBottom: '16px' }}
            >
              AI-Powered Understanding
            </div>

            {/* Headline */}
            <h2
              className="heading-section"
              style={{
                marginBottom: '24px',
                lineHeight: 1.1,
              }}
            >
              <div style={{ display: 'block' }}>
                {renderSplitText("Urdu, Roman Urdu,")}
              </div>
              <div style={{ display: 'block' }}>
                {renderSplitText("ya English—")}
              </div>
              <div style={{ display: 'block' }}>
                {renderSplitText("koi bhi language.")}
              </div>
            </h2>

            {/* Body Description */}
            <p
              className="ai-body body-premium"
              style={{
                maxWidth: '560px',
                marginBottom: '32px',
                fontSize: '18px',
              }}
            >
              Karigar AI aapki zaroorat ko samajhta hai chahe aap koi bhi language mein likhein. Bilkul human jaisi understanding.
            </p>

            {/* Bullet Points */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {[
                "✓ Detects service type automatically",
                "✓ Understands location context",
                "✓ Estimates budget sensitivity"
              ].map((bullet, i) => (
                <div
                  key={i}
                  className="ai-bullet"
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(2, 195, 154, 0.1)',
                      color: 'var(--color-primary)',
                      fontSize: '14px',
                      fontWeight: 'bold',
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ color: 'var(--color-body)' }}>{bullet.substring(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Phone Mockup */}
          <div
            className="ai-right-column"
            style={{
              flex: '1 1 40%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              perspective: '1000px',
            }}
          >
            {/* Phone Mockup Frame */}
            <div
              className="phone-mockup"
              style={{
                width: '280px',
                height: '560px',
                backgroundColor: 'var(--color-dark)',
                borderRadius: '36px',
                border: '3px solid var(--color-border)',
                boxShadow: '0 25px 50px -12px rgba(10, 21, 32, 0.6), 0 0 40px rgba(30, 58, 95, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                padding: '40px 16px 20px',
                transition: 'transform 0.5s ease',
              }}
            >
              {/* Phone Speaker & Notch */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '90px',
                  height: '18px',
                  backgroundColor: 'var(--color-border)',
                  borderRadius: '10px',
                  zIndex: 10,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '35px',
                    height: '4px',
                    backgroundColor: '#0D1B2A',
                    borderRadius: '2px',
                  }}
                />
              </div>

              {/* Chat Header inside Mockup */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--color-border)',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: 'var(--color-bg)',
                    fontSize: '14px',
                  }}
                >
                  K
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-white)' }}>
                    Karigar AI Chat
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }}></span>
                    Online
                  </div>
                </div>
              </div>

              {/* UI Chat Input Area */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Typing Prompt Container */}
                <div
                  style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-teal)',
                    borderRadius: '16px',
                    padding: '16px',
                    minHeight: '140px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <p
                    style={{
                      color: 'var(--color-white)',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      margin: 0,
                      whiteSpace: 'pre-line',
                      fontFamily: 'monospace',
                    }}
                  >
                    {displayedText}
                    <span className="cursor-blink">|</span>
                  </p>
                  
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '12px',
                      fontSize: '10px',
                      color: 'var(--color-body)',
                    }}
                  >
                    Type your request
                  </span>
                </div>

                {/* Confidence Card (Fade & Translate animation) */}
                <div
                  style={{
                    backgroundColor: 'rgba(26, 47, 69, 0.95)',
                    border: '1px solid var(--color-primary)',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 8px 24px rgba(2, 195, 154, 0.15)',
                    transform: showConfidence ? 'translateY(0)' : 'translateY(20px)',
                    opacity: showConfidence ? 1 : 0,
                    transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ color: 'var(--color-primary)', fontSize: '18px' }}>✓</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-white)' }}>
                      Urdu Request Detected
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '600' }}>
                      Samajh Gaya — 94% confidence
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Indicator line */}
              <div
                style={{
                  width: '100px',
                  height: '4px',
                  backgroundColor: 'var(--color-border)',
                  borderRadius: '2px',
                  alignSelf: 'center',
                  marginTop: 'auto',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ai-columns-wrapper {
            flex-direction: column !important;
            gap: 48px !important;
          }
          .ai-left-column {
            align-items: center !important;
            text-align: center !important;
            flex: 1 1 100% !important;
          }
          .ai-right-column {
            flex: 1 1 100% !important;
          }
          .phone-mockup {
            transform: scale(0.95);
          }
        }
      `}</style>
    </section>
  );
};

export default AIDemoSection;
