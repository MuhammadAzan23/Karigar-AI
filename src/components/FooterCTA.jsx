import React from 'react';
import ShinyText from './ShinyText';

const FooterCTA = () => {
  const handleCTA = () => {
    // Scroll smoothly back to top or service booking trigger
    const target = document.querySelector('.gallery-wrapper') || document.querySelector('.journey-section') || window;
    if (target === window) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      style={{
        width: '100%',
        backgroundColor: 'var(--color-dark)',
        borderTop: '1px solid var(--color-border)',
        padding: '80px 5vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 3,
      }}
    >
      {/* Container */}
      <div
        className="container-custom"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          maxWidth: '800px',
        }}
      >
        {/* Shiny Headline */}
        <h2
          style={{
            lineHeight: 1.0,
            marginBottom: '8px',
          }}
        >
          <ShinyText
            text="Karigar AI"
            speed={4}
            style={{
              fontSize: 'clamp(48px, 8vw, 96px)',
              fontWeight: 800,
            }}
          />
        </h2>

        {/* Sub-copy */}
        <p
          className="body-premium"
          style={{
            fontSize: 'clamp(16px, 2.2vw, 20px)',
            maxWidth: '520px',
            color: 'var(--color-body)',
            lineHeight: '1.6',
          }}
        >
          Pakistan ka pehla AI karigar marketplace. <br />
          Aaj shuru karein.
        </p>

        {/* Action Button */}
        <button
          onClick={handleCTA}
          className="btn-footer-primary"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-bg)',
            fontSize: '18px',
            fontWeight: '700',
            padding: '20px 56px',
            borderRadius: '50px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 8px 24px rgba(2, 195, 154, 0.2)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            marginTop: '12px',
          }}
          aria-label="Find Karigar Now"
        >
          Apna Karigar Dhundho →
        </button>

        {/* Fine Print */}
        <div
          style={{
            fontSize: '12px',
            color: '#3D6680',
            letterSpacing: '1px',
            fontWeight: 600,
            textTransform: 'uppercase',
            marginTop: '16px',
          }}
        >
          Free to use • No signup required • 24/7 support
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(30, 58, 95, 0.3)', margin: '16px 0' }} />

        {/* Footer Links */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {["Privacy", "Terms", "Contact", "Careers"].map((link, idx) => (
            <a
              key={idx}
              href={`#${link.toLowerCase()}`}
              className="footer-link"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#3D6680',
                textDecoration: 'none',
                transition: 'color 0.3s ease',
              }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* Copyright notice */}
        <div
          style={{
            fontSize: '11px',
            color: 'rgba(61, 102, 128, 0.6)',
            marginTop: '16px',
          }}
        >
          &copy; {new Date().getFullYear()} Karigar AI. All rights reserved.
        </div>
      </div>

      <style>{`
        .btn-footer-primary:hover {
          transform: scale(1.03) translateY(-2px);
          box-shadow: 0 12px 30px rgba(2, 195, 154, 0.35);
          background-color: #03d6a9;
        }
        
        .footer-link:hover {
          color: var(--color-primary) !important;
        }
      `}</style>
    </footer>
  );
};

export default FooterCTA;
