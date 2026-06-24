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

        /* PORTRAIT-FIRST CONTAINER */
        .lp-container {
          height: 100vh;
          height: 100dvh;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          width: 100%;
          background-color: #07040e;
        }

        /* Background Image - Portrait Optimized */
        .lp-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: url('/assets/images/hero-bg.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        /* Overlay with portrait-friendly gradient */
        .lp-bg-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            180deg,
            rgba(7,4,14,0.75) 0%,
            rgba(7,4,14,0.4) 30%,
            rgba(7,4,14,0.35) 55%,
            rgba(7,4,14,0.85) 80%,
            rgba(7,4,14,0.97) 100%
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
          padding: 2.2vh 32px;
          background: rgba(7,4,14,0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          height: 7.5vh;
          min-height: 60px;
        }

        .lp-logo {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(20px, 2.8vh, 32px);
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
          padding: 1vh 2vh;
          color: #cbd5e1;
          font-size: clamp(11px, 1.6vh, 16px);
          font-weight: 700;
          letter-spacing: 0.8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          min-height: 4.2vh;
          display: flex;
          align-items: center;
          gap: 6px;
          -webkit-tap-highlight-color: transparent;
        }
        .lp-nav-gallery:hover {
          background: rgba(255,255,255,0.12);
          color: white;
          border-color: rgba(168,85,247,0.3);
        }

        /* HERO SECTION - left-aligned, height-first portrait */
        .lp-hero {
          position: relative;
          z-index: 10;
          padding: 6vh 48px 3vh;
          text-align: left;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 48vh;
        }

        .lp-hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(36px, 5.2vh, 88px);
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
          margin-top: 3vh;
          font-size: clamp(14px, 2vh, 22px);
          color: #94a3b8;
          line-height: 1.6;
          max-width: 440px;
          letter-spacing: 0.2px;
        }

        /* CHARACTER PREVIEW CAROUSEL */
        .lp-gallery-section {
          position: relative;
          z-index: 10;
          padding: 3.5vh 0;
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
          animation: scrollMarquee 35s linear infinite;
          padding: 0 8px;
        }

        .lp-gallery-grid:hover {
          animation-play-state: paused;
        }

        .lp-gallery-card {
          border-radius: 18px;
          overflow: hidden;
          width: clamp(160px, 14.5vh, 260px);
          height: clamp(215px, 19.5vh, 350px);
          flex-shrink: 0;
          border: 1.5px solid rgba(255,255,255,0.1);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          background: linear-gradient(135deg, #0a0612 0%, #1a0f2e 100%);
          margin-right: 2.2vh;
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
          height: 6vh;
          background: linear-gradient(to top, rgba(10,6,18,0.7), transparent);
          pointer-events: none;
          border-radius: 0 0 18px 18px;
        }

        .lp-gallery-card:hover {
          transform: translateY(-0.8vh) scale(1.02);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 1.5vh 4vh rgba(147, 51, 234, 0.35);
        }

        .lp-gallery-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }

        /* CTA SECTION */
        .lp-cta-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4vh 32px 5vh;
          flex-direction: column;
          gap: 2.2vh;
        }

        .lp-btn-start {
          background: linear-gradient(135deg, #6366f1 0%, #9333ea 45%, #db2777 100%);
          border: none;
          border-radius: 50px;
          padding: 2.2vh 6.5vh;
          color: white;
          font-size: clamp(16px, 2.2vh, 26px);
          font-weight: 800;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5vh;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 12px 36px rgba(147, 51, 234, 0.45);
          white-space: nowrap;
          width: 100%;
          max-width: clamp(280px, 35vh, 480px);
          min-height: clamp(56px, 6.5vh, 88px);
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
          transform: translateY(-0.4vh);
          box-shadow: 0 2.5vh 6vh rgba(219, 39, 119, 0.5);
        }

        .lp-btn-icon {
          width: clamp(18px, 2.2vh, 26px);
          height: clamp(18px, 2.2vh, 26px);
        }

        /* FOOTER */
        .lp-footer {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 0 20px 2.5vh;
          color: #334155;
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        /* LANDSCAPE FALLBACK */
        @media (orientation: landscape) and (max-height: 600px) {
          .lp-container {
            height: auto;
            min-height: 100vh;
            overflow-y: auto;
          }

          .lp-hero {
            padding: 14px 20px 10px;
            min-height: auto;
          }

          .lp-hero-title {
            font-size: clamp(26px, 5vw, 34px);
          }

          .lp-hero-desc {
            font-size: 12px;
            display: none;
          }

          .lp-gallery-section {
            padding: 10px 0;
          }

          .lp-gallery-card {
            width: 120px;
            height: 165px;
            margin-right: 10px;
          }

          .lp-cta-wrapper {
            padding: 10px 16px 14px;
          }

          .lp-btn-start {
            padding: 12px 36px;
            font-size: 14px;
            max-width: 200px;
            min-height: 46px;
          }
        }

        /* Touch Device Optimizations */
        @supports (padding: max(0px)) {
          .lp-nav {
            padding-top: max(2.2vh, env(safe-area-inset-top));
            padding-left: max(32px, env(safe-area-inset-left));
            padding-right: max(32px, env(safe-area-inset-right));
          }

          .lp-cta-wrapper {
            padding-bottom: max(5vh, env(safe-area-inset-bottom));
          }
        }

        /* Touch Target Optimization */
        .lp-nav-gallery,
        .lp-btn-start {
          min-height: 44px;
          min-width: 44px;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      <div className="lp-container">
        {/* Backgrounds */}
        <div className="lp-bg" />
        <div className="lp-bg-overlay" />

        {/* Header — Minimal + Centered Brand */}
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

        {/* Hero Section */}
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


        {/* Character Preview Carousel */}
        <div className="lp-gallery-section">
          <div className="lp-gallery-grid">
            {[...galleryItems, ...galleryItems, ...galleryItems, ...galleryItems, ...galleryItems, ...galleryItems].map((item, idx) => (
              <div key={idx} className="lp-gallery-card">
                <img src={item.img} alt={item.name} loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="lp-cta-wrapper">
          <button className="lp-btn-start" onClick={onStart}>
            <span>START NOW</span>
            <svg className="lp-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>


      </div>
    </>
  );
}

export default LandingPage;