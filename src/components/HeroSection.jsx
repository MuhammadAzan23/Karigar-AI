import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ShinyText from './ShinyText';

const HeroSection = () => {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  // Canvas diagonal moving grid animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const squareSize = 50;
    const speed = 0.3;
    let offset = 0;

    const drawGrid = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update offset for diagonal movement
      offset = (offset + speed) % squareSize;

      // Draw vertical lines
      ctx.strokeStyle = 'rgba(30, 58, 95, 0.4)';
      ctx.lineWidth = 1;
      
      for (let x = offset; x < width; x += squareSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let y = offset; y < height; y += squareSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw hover fill
      const { x: mouseX, y: mouseY } = mouseRef.current;
      if (mouseX >= 0 && mouseY >= 0) {
        // Calculate cell indices accounting for the moving offset
        const cellX = Math.floor((mouseX - offset) / squareSize);
        const cellY = Math.floor((mouseY - offset) / squareSize);
        
        ctx.fillStyle = 'rgba(2, 195, 154, 0.08)';
        ctx.fillRect(
          cellX * squareSize + offset,
          cellY * squareSize + offset,
          squareSize,
          squareSize
        );
      }

      animationId = requestAnimationFrame(drawGrid);
    };

    drawGrid();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationId);
    };
  }, []);

  // GSAP text animations
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Just make everything visible
      gsap.set('.word, .hero-label, .hero-sub, .hero-ctas', { opacity: 1, y: 0, yPercent: 0 });
      return;
    }

    const t1 = gsap.timeline();

    // 1. Label fade-in from bottom
    t1.fromTo('.hero-label', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
    );

    // 2. Main headline word slide-up clip mask reveal
    t1.fromTo('.word',
      { yPercent: 110, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.0,
        ease: 'power4.out',
        stagger: 0.08,
      },
      '-=0.6' // overlap with label animation
    );

    // 3. Sub-copy slide up + fade-in
    t1.fromTo('.hero-sub',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.7'
    );

    // 4. CTA buttons slide up + fade-in
    t1.fromTo('.hero-ctas',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.6'
    );

  }, []);

  // Helper function to split text into words wrapped in overflow hidden containers
  const renderSplitText = (text, isShiny = false) => {
    return text.split(' ').map((word, i) => (
      <div key={i} className="word-mask" style={{ marginRight: '0.25em' }}>
        <span className="word" style={{ display: 'inline-block' }}>
          {isShiny ? (
            <ShinyText text={word} speed={3} />
          ) : (
            word
          )}
        </span>
      </div>
    ));
  };

  const handleCTA = () => {
    // Scroll smoothly to gallery/booking section
    const target = document.querySelector('.gallery-wrapper') || document.querySelector('.journey-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHowItWorks = () => {
    const target = document.querySelector('.journey-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: 'var(--color-bg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Canvas diagonal moving grid */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'auto',
        }}
      />

      {/* Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 2,
          pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(13, 27, 42, 0) 20%, rgba(13, 27, 42, 0.95) 100%)',
        }}
      />

      {/* Centered Content Container */}
      <div
        className="container-custom"
        style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: 'none', // Allow cursor interactions to pass to canvas
        }}
      >
        {/* Label */}
        <div
          className="hero-label label-premium"
          style={{
            color: 'var(--color-primary)',
            marginBottom: '24px',
            fontSize: 'clamp(11px, 1.5vw, 14px)',
            pointerEvents: 'auto',
          }}
        >
          Pakistan Ka Pehla AI-Powered Service Platform
        </div>

        {/* Main Headline */}
        <h1
          className="heading-hero"
          style={{
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'block' }}>
            {renderSplitText("Ghar Ka")}
          </div>
          <div style={{ display: 'block', margin: '4px 0' }}>
            {renderSplitText("Karigar,", true)}
          </div>
          <div style={{ display: 'block' }}>
            {renderSplitText("Fauran.")}
          </div>
        </h1>

        {/* Sub-copy */}
        <p
          className="hero-sub body-premium"
          style={{
            maxWidth: '560px',
            marginBottom: '40px',
            fontSize: 'clamp(15px, 2vw, 18px)',
            pointerEvents: 'auto',
          }}
        >
          Ek message mein apna kaam karwao — AI aapki zaroorat samjhega, best karigar dhundega, aur booking confirm karega.
        </p>

        {/* CTA Buttons */}
        <div
          className="hero-ctas"
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={handleCTA}
            className="btn-primary"
            aria-label="Find Karigar Now"
          >
            Karigar Dhundho →
          </button>
          <button
            onClick={handleHowItWorks}
            className="btn-secondary"
            aria-label="How it works"
          >
            How it Works
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
