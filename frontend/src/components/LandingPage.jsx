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
          min-height: 100vh;
          min-height: 100dvh;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
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
          padding: 20px 20px;
          background: rgba(7,4,14,0.5);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .lp-logo {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
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
          right: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 8px 16px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.8px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          min-height: 38px;
          display: flex;
          align-items: center;
          gap: 5px;
          -webkit-tap-highlight-color: transparent;
        }
        .lp-nav-gallery:hover {
          background: rgba(255,255,255,0.12);
          color: white;
          border-color: rgba(168,85,247,0.3);
        }

        /* HERO SECTION - PORTRAIT OPTIMIZED */
        .lp-hero {
          position: relative;
          z-index: 10;
          padding: 36px 24px 20px;
          text-align: center;
        }

        .lp-hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(44px, 12vw, 62px);
          font-weight: 900;
          line-height: 1.05;
          margin: 0 auto;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          text-shadow: 0 4px 24px rgba(0,0,0,0.5);
          max-width: 480px;
        }

        .lp-hero-line {
          display: block;
          margin-bottom: 2px;
        }

        .lp-gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #a855f7 40%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
        }

        .lp-hero-desc {
          margin-top: 18px;
          font-size: 16px;
          color: #94a3b8;
          line-height: 1.6;
          max-width: 340px;
          margin-left: auto;
          margin-right: auto;
          letter-spacing: 0.2px;
        }

        /* ASTRONAUT VISUAL SECTION */
        .lp-visual-section {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 10px 16px 16px;
          min-height: 320px;
        }

        .lp-astronaut-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Glow behind astronaut */
        .lp-astronaut-glow {
          position: absolute;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(99,102,241,0.1) 40%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }

        .lp-astronaut-img {
          position: relative;
          max-width: 100%;
          height: auto;
          max-height: 440px;
          object-fit: contain;
          object-position: center top;
          filter: drop-shadow(0 10px 40px rgba(147, 51, 234, 0.35));
          animation: lpFloatAstronaut 4s ease-in-out infinite;
        }

        @keyframes lpFloatAstronaut {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        /* CHARACTER PREVIEW CAROUSEL - ENLARGED */
        .lp-gallery-section {
          position: relative;
          z-index: 10;
          padding: 24px 0;
          overflow: hidden;
          background: rgba(0,0,0,0.25);
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .lp-gallery-label {
          text-align: center;
          font-family: 'Outfit', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 16px;
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
          border-radius: 16px;
          overflow: hidden;
          width: 215px;
          height: 290px;
          flex-shrink: 0;
          border: 1.5px solid rgba(255,255,255,0.1);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          background: linear-gradient(135deg, #0a0612 0%, #1a0f2e 100%);
          margin-right: 16px;
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
          border-radius: 0 0 16px 16px;
        }

        .lp-gallery-card:hover {
          transform: translateY(-6px) scale(1.02);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 16px 44px rgba(147, 51, 234, 0.35);
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
          padding: 24px 20px 40px;
          flex-direction: column;
          gap: 14px;
        }

        .lp-btn-start {
          background: linear-gradient(135deg, #6366f1 0%, #9333ea 45%, #db2777 100%);
          border: none;
          border-radius: 50px;
          padding: 18px 60px;
          color: white;
          font-size: 18px;
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
          max-width: 340px;
          min-height: 62px;
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
          transform: translateY(-3px);
          box-shadow: 0 20px 52px rgba(219, 39, 119, 0.5);
        }

        .lp-btn-icon {
          width: 20px;
          height: 20px;
        }

        /* FOOTER */
        .lp-footer {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 0 20px 24px;
          color: #334155;
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        /* ================================ */
        /* PORTRAIT-FIRST RESPONSIVE DESIGN */
        /* ================================ */

        /* Standard portrait tablet (e.g., iPad) */
        @media (max-width: 768px) {
          .lp-nav {
            padding: 18px 16px;
          }

          .lp-logo {
            font-size: 20px;
          }

          .lp-hero {
            padding: 30px 20px 16px;
          }

          .lp-hero-title {
            font-size: clamp(40px, 11vw, 54px);
          }

          .lp-hero-desc {
            font-size: 15px;
          }

          .lp-visual-section {
            min-height: 280px;
            padding: 8px 16px 12px;
          }

          .lp-astronaut-img {
            max-height: 400px;
          }

          .lp-gallery-card {
            width: 195px;
            height: 265px;
            margin-right: 14px;
          }

          .lp-cta-wrapper {
            padding: 20px 16px 36px;
          }

          .lp-btn-start {
            padding: 16px 48px;
            font-size: 17px;
            max-width: 300px;
            min-height: 58px;
          }
        }

        /* Smaller phones */
        @media (max-width: 480px) {
          .lp-nav {
            padding: 16px 12px;
          }

          .lp-logo {
            font-size: 18px;
            letter-spacing: 1px;
          }

          .lp-nav-gallery {
            font-size: 11px;
            padding: 7px 12px;
            right: 12px;
          }

          .lp-hero {
            padding: 24px 16px 14px;
          }

          .lp-hero-title {
            font-size: clamp(34px, 10vw, 46px);
            line-height: 1.08;
          }

          .lp-hero-desc {
            font-size: 14px;
            margin-top: 14px;
            max-width: 300px;
          }

          .lp-visual-section {
            min-height: 240px;
            padding: 6px 12px 10px;
          }

          .lp-astronaut-img {
            max-height: 340px;
          }

          .lp-astronaut-glow {
            width: 220px;
            height: 220px;
          }

          .lp-gallery-section {
            padding: 18px 0;
          }

          .lp-gallery-card {
            width: 175px;
            height: 240px;
            margin-right: 12px;
            border-radius: 14px;
          }

          .lp-cta-wrapper {
            padding: 18px 12px 32px;
            gap: 12px;
          }

          .lp-btn-start {
            padding: 15px 40px;
            font-size: 16px;
            max-width: 270px;
            min-height: 54px;
          }
        }

        /* Very small phones */
        @media (max-width: 380px) {
          .lp-hero-title {
            font-size: clamp(30px, 9vw, 40px);
          }

          .lp-astronaut-img {
            max-height: 280px;
          }

          .lp-gallery-card {
            width: 155px;
            height: 215px;
          }
        }

        /* LANDSCAPE FALLBACK */
        @media (orientation: landscape) and (max-height: 600px) {
          .lp-hero {
            padding: 14px 20px 10px;
          }

          .lp-hero-title {
            font-size: clamp(26px, 5vw, 34px);
          }

          .lp-hero-desc {
            font-size: 12px;
            display: none;
          }

          .lp-visual-section {
            min-height: 140px;
            padding: 6px;
          }

          .lp-astronaut-img {
            max-height: 170px;
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
            padding-top: max(16px, env(safe-area-inset-top));
            padding-left: max(16px, env(safe-area-inset-left));
            padding-right: max(16px, env(safe-area-inset-right));
          }

          .lp-cta-wrapper {
            padding-bottom: max(36px, env(safe-area-inset-bottom));
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

        {/* Astronaut Visual Section */}
        <div className="lp-visual-section">
          <div className="lp-astronaut-container">
            <div className="lp-astronaut-glow" />
            <img
              src="/assets/images/astronaut.png"
              alt="AI Photo Booth Astronaut"
              className="lp-astronaut-img"
              onError={(e) => e.target.src = '/assets/templates/male_astronaut.jpg'}
            />
          </div>
        </div>

        {/* Character Preview Carousel */}
        <div className="lp-gallery-section">
          <div className="lp-gallery-label">Choose Your Character</div>
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

        {/* Footer */}
        <div className="lp-footer">
          ✦ Powered by AI • Premium Experience ✦
        </div>
      </div>
    </>
  );
}

export default LandingPage;