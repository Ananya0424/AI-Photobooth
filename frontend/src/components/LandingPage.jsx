import { useState } from 'react';

const galleryItems = [
  { img: '/assets/templates/male_avenger.jpg', name: 'Avenger' },
  { img: '/assets/templates/female_astronaut.jpg', name: 'Astronaut' },
  { img: '/assets/templates/male_king.jpg', name: 'King' },
  { img: '/assets/templates/female_avenger.jpg', name: 'Avenger' },
  { img: '/assets/templates/male_astronaut.jpg', name: 'Astronaut' },
  { img: '/assets/templates/female_queen.jpg', name: 'Queen' },
];

function LandingPage({ onStart }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        /* Reset and Base Styles */
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background-color: #07040e;
          color: white;
        }

        .lp-container {
          min-height: 100vh;
          position: relative;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        /* Full Background Image */
        .lp-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: url('/assets/images/hero-bg.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        /* Overlay to darken the background slightly */
        .lp-bg-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(to right, rgba(7,4,14,0.95) 0%, rgba(7,4,14,0.7) 40%, transparent 100%);
          pointer-events: none;
        }

        /* Bottom gradient to blend into gallery section */
        .lp-bg-bottom-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 50%;
          z-index: 2;
          background: linear-gradient(to top, rgba(7,4,14,1) 0%, rgba(7,4,14,0.6) 40%, transparent 100%);
          pointer-events: none;
        }

        /* Navigation */
        .lp-nav {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 60px;
        }

        .lp-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: white;
          text-decoration: none;
        }

        .lp-links {
          display: flex;
          gap: 40px;
        }

        .lp-links a {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.3s;
          cursor: pointer;
        }
        
        .lp-links a:hover {
          color: white;
        }

        .lp-hamburger {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
        }

        /* Main Content Area */
        .lp-main-content {
          position: relative;
          z-index: 10;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Hero Content */
        .lp-hero {
          padding: 20px 60px;
          max-width: 800px;
        }

        .lp-hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(48px, 6vw, 84px);
          font-weight: 900;
          line-height: 1.05;
          margin: 0;
          text-transform: uppercase;
          text-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .lp-gradient-text {
          background: linear-gradient(to right, #3b82f6 0%, #a855f7 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .lp-hero-desc {
          margin-top: 24px;
          font-size: 18px;
          color: #cbd5e1;
          line-height: 1.6;
          max-width: 500px;
        }

        /* Features */
        .lp-features {
          display: flex;
          gap: 30px;
          padding: 0 60px;
          margin-top: 40px;
        }

        .lp-feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 12px;
          color: #e2e8f0;
        }

        .lp-feature-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 8px;
          background: rgba(255,255,255,0.03);
        }

        .lp-feature-text {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* Gallery with Marquee Auto-Scroll */
        .lp-gallery-section {
          position: relative;
          z-index: 10;
          padding: 40px 0; /* remove horizontal padding for full bleed */
          overflow: hidden; /* Hide scrollbar for marquee */
          display: flex;
        }

        /* Marquee Animation */
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-160px * 8 - 16px * 8)); } /* Adjust based on card width + gap * number of cards */
        }

        .lp-gallery-grid {
          display: flex;
          width: max-content;
          gap: 16px;
          animation: scrollMarquee 25s linear infinite;
        }
        
        /* Pause on hover */
        .lp-gallery-grid:hover {
          animation-play-state: paused;
        }

        .lp-gallery-card {
          border-radius: 16px;
          overflow: hidden;
          width: 160px;
          height: 220px;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.1);
          transition: transform 0.3s ease, border-color 0.3s ease;
          background: #000;
        }

        .lp-gallery-card:hover {
          transform: translateY(-5px);
          border-color: rgba(236, 72, 153, 0.5);
        }

        .lp-gallery-card img {
          width: 100%;
          height: 118%; /* Crop bottom 18% to hide any baked-in text */
          object-fit: cover;
          object-position: center top;
          display: block;
        }

        /* CTA Section */
        .lp-cta-wrapper {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: center;
          padding: 20px 0 60px;
        }

        .lp-btn-start {
          background: linear-gradient(90deg, #1d4ed8 0%, #9333ea 50%, #db2777 100%);
          border: none;
          border-radius: 50px;
          padding: 20px 80px;
          color: white;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 1.5px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 10px 30px rgba(147, 51, 234, 0.3);
        }

        .lp-btn-start:hover {
          transform: scale(1.05);
          box-shadow: 0 15px 40px rgba(219, 39, 119, 0.5);
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .lp-gallery-section { justify-content: center; flex-wrap: wrap; }
          .lp-gallery-grid { flex-wrap: wrap; justify-content: center; }
        }

        @media (max-width: 900px) {
          .lp-links { display: none; }
          .lp-hero { padding: 40px 30px; }
          .lp-features { flex-wrap: wrap; padding: 0 30px; gap: 20px; }
          .lp-feature-item::after { display: none; }
          .lp-gallery-section { padding: 40px 30px; }
          .lp-bg-overlay { background: rgba(7,4,14,0.8); }
        }

        @media (max-width: 600px) {
          .lp-hero-title { font-size: 40px; }
          .lp-nav { padding: 20px; }
          .lp-gallery-card { width: 140px; height: 190px; }
        }
      `}</style>

      <div className="lp-container">
        {/* Backgrounds */}
        <div className="lp-bg" />
        <div className="lp-bg-overlay" />
        <div className="lp-bg-bottom-overlay" />

        {/* Header */}
        <nav className="lp-nav">
          <a href="#" className="lp-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3" />
            </svg>
            AI Photo Booth
          </a>
          
          <div className="lp-links">
            <a>Features</a>
            <a>How It Works</a>
            <a>Gallery</a>
            <a>Contact</a>
          </div>

          <button className="lp-hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>

        <div className="lp-main-content">
          {/* Hero Section */}
          <div className="lp-hero">
            <h1 className="lp-hero-title">
              BE ANYONE.<br />ANYWHERE.<br />
              <span className="lp-gradient-text">AI MAKES IT POSSIBLE.</span>
            </h1>
            <p className="lp-hero-desc">
              Step into new roles, new worlds and new versions of yourself with AI Photo Booth.
            </p>
          </div>

          {/* Features Row */}
          <div className="lp-features">
            <div className="lp-feature-item">
              <div className="lp-feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2Z" />
                  <path d="M12 12 2.1 12" />
                  <path d="M12 12 18.5 5.5" />
                </svg>
              </div>
              <span className="lp-feature-text">AI Powered</span>
            </div>
            
            <div className="lp-feature-item">
              <div className="lp-feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <span className="lp-feature-text">High Quality</span>
            </div>

            <div className="lp-feature-item">
              <div className="lp-feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 15v.01" />
                </svg>
              </div>
              <span className="lp-feature-text">Face Preserved</span>
            </div>

            <div className="lp-feature-item">
              <div className="lp-feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
                  <path d="m14 7 3 3" />
                  <path d="M5 6v4" />
                  <path d="M19 14v4" />
                  <path d="M10 2v2" />
                  <path d="M7 8H3" />
                  <path d="M21 16h-4" />
                  <path d="M11 3H9" />
                </svg>
              </div>
              <span className="lp-feature-text">Instant Effect</span>
            </div>

            <div className="lp-feature-item">
              <div className="lp-feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
              <span className="lp-feature-text">Share & Email</span>
            </div>
          </div>
        </div>

        {/* Gallery with Marquee Auto-Scroll */}
        <div className="lp-gallery-section">
          <div className="lp-gallery-grid">
            {/* Render 2 sets of items for seamless infinite scroll */}
            {[...galleryItems, ...galleryItems].map((item, idx) => (
              <div key={idx} className="lp-gallery-card">
                <img src={item.img} alt={item.name} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="lp-cta-wrapper">
          <button className="lp-btn-start" onClick={onStart}>
            START NOW
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
