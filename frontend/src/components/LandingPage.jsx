import { useNavigate } from 'react-router-dom';

const galleryItems = [
  { img: '/assets/templates/male_avenger.jpg', name: 'Avenger' },
  { img: '/assets/templates/female_astronaut.jpg', name: 'Astronaut' },
  { img: '/assets/templates/male_king.jpg', name: 'King' },
  { img: '/assets/templates/female_avenger.jpg', name: 'Avenger' },
  { img: '/assets/templates/male_astronaut.jpg', name: 'Astronaut' },
  { img: '/assets/templates/female_queen.jpg', name: 'Queen' },
];

function LandingPage({ onStart }) {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        /* Reset and Base Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background-color: #07040e;
          color: white;
        }

        /* PORTRAIT-FIRST CONTAINER - Allow natural scroll */
        .lp-container {
          min-height: 100vh;
          min-height: 100dvh;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          width: 100%;
          background-color: #07040e;
          scroll-behavior: smooth;
        }

        /* Background Image - fixed background */
        .lp-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
          background-image: url('/assets/images/hero-bg.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        /* Overlay with portrait-friendly gradient */
        .lp-bg-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          background: linear-gradient(
            180deg,
            rgba(7,4,14,0.75) 0%,
            rgba(7,4,14,0.4) 30%,
            rgba(7,4,14,0.3) 50%,
            rgba(7,4,14,0.8) 80%,
            rgba(7,4,14,0.98) 100%
          );
          pointer-events: none;
        }

        /* MINIMAL CENTERED HEADER */
        .lp-nav {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 24px 32px;
          background: rgba(7,4,14,0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          min-height: 80px;
        }

        .lp-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          color: white;
          text-decoration: none;
          letter-spacing: 1.5px;
          text-align: center;
          white-space: nowrap;
          text-transform: uppercase;
        }

        .lp-logo-sparkle {
          background: linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Gallery Link */
        .lp-nav-gallery {
          position: absolute;
          right: 24px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 10px 20px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 8px;
          -webkit-tap-highlight-color: transparent;
        }
        .lp-nav-gallery:hover {
          background: rgba(255,255,255,0.12);
          color: white;
          border-color: rgba(168,85,247,0.3);
        }

        /* HERO SECTION - large and immersive */
        .lp-hero {
          position: relative;
          z-index: 10;
          padding: 8vh 48px 4vh;
          text-align: left;
          min-height: 65vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .lp-hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(52px, 6vh, 90px);
          font-weight: 900;
          line-height: 1.05;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          text-shadow: 0 4px 24px rgba(0,0,0,0.5);
          max-width: 580px;
        }

        .lp-hero-line {
          display: block;
          margin-bottom: 0.5vh;
        }

        .lp-gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #a855f7 40%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
        }

        .lp-hero-desc {
          margin-top: 32px;
          font-size: clamp(17px, 2.2vh, 24px);
          color: #cbd5e1;
          line-height: 1.6;
          max-width: 440px;
          letter-spacing: 0.2px;
        }

        /* SPACING SECTIONS */
        .lp-spacing {
          position: relative;
          z-index: 10;
          height: 10vh;
          min-height: 60px;
        }

        /* CHARACTER PREVIEW CAROUSEL */
        .lp-gallery-section {
          position: relative;
          z-index: 10;
          padding: 48px 0;
          overflow: hidden;
          background: rgba(0,0,0,0.25);
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
        }

        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 6)); }
        }

        .lp-gallery-grid {
          display: flex;
          width: max-content;
          gap: 0;
          animation: scrollMarquee 45s linear infinite;
          padding: 0 8px;
        }

        .lp-gallery-grid:hover {
          animation-play-state: paused;
        }

        .lp-gallery-card {
          border-radius: 18px;
          overflow: hidden;
          width: 230px;
          height: 310px;
          flex-shrink: 0;
          border: 1.5px solid rgba(255,255,255,0.1);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          background: linear-gradient(135deg, #0a0612 0%, #1a0f2e 100%);
          margin-right: 24px;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(0,0,0,0.35);
          position: relative;
        }

        .lp-gallery-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: linear-gradient(to top, rgba(10,6,18,0.7), transparent);
          pointer-events: none;
          border-radius: 0 0 18px 18px;
        }

        .lp-gallery-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 16px 40px rgba(147, 51, 234, 0.35);
        }

        .lp-gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }

        .lp-spacing-2 {
          position: relative;
          z-index: 10;
          height: 8vh;
          min-height: 50px;
        }

        /* CTA SECTION */
        .lp-cta-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 64px 32px 80px;
          flex-direction: column;
          gap: 24px;
        }

        .lp-cta-text {
          font-size: clamp(20px, 3vh, 32px);
          font-weight: 700;
          text-align: center;
          color: #e2e8f0;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 2vh;
        }

        .lp-btn-start {
          background: linear-gradient(135deg, #6366f1 0%, #9333ea 45%, #db2777 100%);
          border: none;
          border-radius: 50px;
          padding: 20px 64px;
          color: white;
          font-size: 19px;
          font-weight: 800;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 12px 36px rgba(147, 51, 234, 0.45);
          white-space: nowrap;
          width: 100%;
          max-width: 360px;
          min-height: 64px;
          font-family: 'Outfit', sans-serif;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          -webkit-tap-highlight-color: transparent;
        }

        .lp-btn-start::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .lp-btn-start:hover::before {
          left: 100%;
        }

        .lp-btn-start:active {
          transform: scale(0.97);
        }

        .lp-btn-start:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 52px rgba(219, 39, 119, 0.5);
        }

        .lp-btn-icon {
          width: 22px;
          height: 22px;
        }

        .lp-footer-spacing {
          position: relative;
          z-index: 10;
          height: 6vh;
          min-height: 40px;
        }

        /* TALL PORTRAIT / KIOSK EXTRA LARGE HEIGHT STYLING */
        @media (min-height: 1000px) {
          .lp-hero {
            min-height: 70vh;
            padding: 10vh 48px 4vh;
          }

          .lp-hero-title {
            font-size: clamp(64px, 7vh, 100px);
          }

          .lp-hero-desc {
            font-size: clamp(20px, 2.5vh, 26px);
            max-width: 520px;
            margin-top: 4vh;
          }

          .lp-gallery-section {
            padding: 6vh 0;
          }

          .lp-gallery-card {
            width: clamp(230px, 15vh, 280px);
            height: clamp(310px, 20vh, 380px);
            margin-right: 2.5vh;
          }

          .lp-cta-wrapper {
            padding: 6vh 32px 8vh;
            gap: 3vh;
          }

          .lp-btn-start {
            min-height: 72px;
            font-size: 22px;
            max-width: 400px;
          }
        }

        /* LANDSCAPE FALLBACK FOR SHORT SCREENS */
        @media (orientation: landscape) and (max-height: 600px) {
          .lp-hero {
            padding: 40px 20px 20px;
            min-height: auto;
          }

          .lp-hero-title {
            font-size: 38px;
          }

          .lp-hero-desc {
            display: none;
          }

          .lp-gallery-section {
            padding: 24px 0;
          }

          .lp-gallery-card {
            width: 160px;
            height: 220px;
            margin-right: 16px;
          }

          .lp-cta-wrapper {
            padding: 32px 16px 40px;
          }

          .lp-btn-start {
            padding: 14px 40px;
            font-size: 16px;
            max-width: 260px;
            min-height: 52px;
          }
        }

        /* Touch Device Optimizations */
        @supports (padding: max(0px)) {
          .lp-nav {
            padding-top: max(24px, env(safe-area-inset-top));
            padding-left: max(32px, env(safe-area-inset-left));
            padding-right: max(32px, env(safe-area-inset-right));
          }

          .lp-cta-wrapper {
            padding-bottom: max(80px, env(safe-area-inset-bottom));
          }
        }

        /* Touch Target Optimization */
        .lp-nav-gallery,
        .lp-btn-start {
          min-height: 44px;
          min-width: 44px;
          -webkit-tap-highlight-color: transparent;
        }

        /* Prevent selection */
        .lp-nav,
        .lp-hero,
        .lp-gallery-section,
        .lp-cta-wrapper {
          -webkit-user-select: none;
          user-select: none;
        }

        .lp-container {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="lp-container">
        {/* Fixed Backgrounds */}
        <div className="lp-bg" />
        <div className="lp-bg-overlay" />

        {/* Fixed Header */}
        <nav className="lp-nav">
          <span className="lp-logo">
            <span className="lp-logo-sparkle">AI Photo Booth</span>
          </span>

          <button
            className="lp-nav-gallery"
            onClick={() => navigate('/gallery')}
          >
            🖼 Gallery
          </button>
        </nav>

        {/* LARGE HERO SECTION - 110vh */}
        <div className="lp-hero">
          <h1 className="lp-hero-title">
            <span className="lp-hero-line">BE ANYONE.</span>
            <span className="lp-hero-line">ANYWHERE.</span>
            <span className="lp-hero-line">
              <span className="lp-gradient-text">AI MAKES IT</span>
            </span>
            <span className="lp-hero-line">
              <span className="lp-gradient-text">POSSIBLE.</span>
            </span>
          </h1>
          <p className="lp-hero-desc">
            Step into new roles, new worlds and new versions of yourself with AI Photo Booth.
          </p>
        </div>

        {/* Spacing */}
        <div className="lp-spacing" />

        {/* LARGE CHARACTER CAROUSEL */}
        <div className="lp-gallery-section">
          <div className="lp-gallery-grid">
            {[...galleryItems, ...galleryItems, ...galleryItems, ...galleryItems, ...galleryItems, ...galleryItems].map((item, idx) => (
              <div key={idx} className="lp-gallery-card">
                <img src={item.img} alt={item.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* More Spacing */}
        <div className="lp-spacing-2" />

        {/* LARGE CTA SECTION */}
        <div className="lp-cta-wrapper">
          <span className="lp-cta-text">Ready to transform?</span>
          <button className="lp-btn-start" onClick={onStart}>
            <span>START NOW</span>
            <svg className="lp-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Footer Spacing */}
        <div className="lp-footer-spacing" />
      </div>
    </>
  );
}

export default LandingPage;