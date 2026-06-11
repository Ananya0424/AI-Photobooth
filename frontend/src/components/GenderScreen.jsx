import { useState, useMemo } from 'react';

function GenderScreen({ onSelect, onBack, userName }) {
  const [selected, setSelected] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState('');

  const sparkles = useMemo(() => Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${2 + Math.random() * 3}s`,
    size: `${2 + Math.random() * 4}px`,
  })), []);

  const handleSelect = async (gender) => {
    setSelected(gender);
    setIsLoading(true);
    try {
      await onSelect(gender);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: scale(1) translateY(-80px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes card-enter {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .gs-sparkle { position: absolute; border-radius: 50%; pointer-events: none; animation: sparkle 4s ease-out infinite; }
        .gs-sparkle-container { position: absolute; width: 100%; height: 100%; pointer-events: none; }
        .gs-float { animation: float 3s ease-in-out infinite; }
        .gs-glass {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .gs-card-male {
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.25);
          backdrop-filter: blur(16px);
        }
        .gs-card-female {
          background: rgba(236, 72, 153, 0.08);
          border: 1px solid rgba(236, 72, 153, 0.25);
          backdrop-filter: blur(16px);
        }
        .gs-card-male:hover {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
          transform: translateY(-4px);
        }
        .gs-card-female:hover {
          background: rgba(236, 72, 153, 0.15);
          border-color: rgba(236, 72, 153, 0.5);
          box-shadow: 0 20px 40px rgba(236, 72, 153, 0.2);
          transform: translateY(-4px);
        }
        .gs-card-male.selected {
          background: rgba(59, 130, 246, 0.18);
          border-color: rgba(59, 130, 246, 0.7);
          box-shadow: 0 0 0 2px rgba(59,130,246,0.4), 0 20px 40px rgba(59, 130, 246, 0.25);
          transform: translateY(-4px) scale(1.01);
        }
        .gs-card-female.selected {
          background: rgba(236, 72, 153, 0.18);
          border-color: rgba(236, 72, 153, 0.7);
          box-shadow: 0 0 0 2px rgba(236,72,153,0.4), 0 20px 40px rgba(236, 72, 153, 0.25);
          transform: translateY(-4px) scale(1.01);
        }
        .gs-card { transition: all 0.35s ease; cursor: pointer; border-radius: 20px; padding: 36px 28px; text-align: center; animation: card-enter 0.5s ease-out both; }
        .gs-spin { animation: spin-slow 2s linear infinite; }
        .gs-back:hover { background: rgba(255,255,255,0.1); }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'linear-gradient(to bottom right, #0f172a, #2d1b4e, #0f172a)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Sparkles */}
        <div className="gs-sparkle-container">
          {sparkles.map((s) => (
            <div key={s.id} className="gs-sparkle" style={{
              left: s.left, top: s.top,
              animationDelay: s.delay, animationDuration: s.duration,
              width: s.size, height: s.size,
              background: s.id % 3 === 0 ? '#6366f1' : s.id % 3 === 1 ? '#8b5cf6' : '#ec4899',
            }} />
          ))}
        </div>

        {/* Floating decorations */}
        {[
          { emoji: '👔', top: '70px', left: '40px', delay: '0s', size: '44px', opacity: 0.2 },
          { emoji: '👗', top: '100px', right: '50px', delay: '1.2s', size: '40px', opacity: 0.18 },
          { emoji: '✨', bottom: '90px', left: '60px', delay: '0.6s', size: '36px', opacity: 0.15 },
          { emoji: '🌟', bottom: '120px', right: '45px', delay: '1.8s', size: '44px', opacity: 0.2 },
        ].map((d, i) => (
          <div key={i} className="gs-float" style={{
            position: 'absolute', fontSize: d.size, opacity: d.opacity,
            userSelect: 'none', pointerEvents: 'none', animationDelay: d.delay,
            top: d.top, left: d.left, right: d.right, bottom: d.bottom,
          }}>{d.emoji}</div>
        ))}

        {/* Back button */}
        <button
          onClick={onBack}
          className="gs-back"
          style={{
            position: 'fixed', top: '24px', left: '24px', zIndex: 20,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px', padding: '10px 18px', color: '#cbd5e1',
            fontSize: '14px', fontWeight: '500', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            backdropFilter: 'blur(12px)', transition: 'all 0.2s ease',
          }}
        >
          <span>←</span> Back
        </button>

        {/* Main content */}
        <div style={{ width: '100%', maxWidth: '560px', position: 'relative', zIndex: 10 }}>
          {/* Glass header card */}
          <div className="gs-glass" style={{
            borderRadius: '24px', padding: '36px 40px 28px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            animation: 'scale-in 0.6s ease-out',
            marginBottom: '24px',
          }}>
            {/* Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '30px', boxShadow: '0 10px 25px rgba(168,85,247,0.35)',
              }}>🎭</div>
            </div>

            {/* Greeting */}
            <p style={{ color: '#a78bfa', textAlign: 'center', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
              Hey <span style={{ color: '#f472b6' }}>{userName}</span> 👋
            </p>

            {/* Title */}
            <h2 style={{
              fontSize: '36px', fontWeight: '900', textAlign: 'center', marginBottom: '10px',
              background: 'linear-gradient(to right, #a78bfa, #f472b6, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Choose Your Style</h2>

            <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '15px', lineHeight: '1.6' }}>
              Select a costume category to see your AI portrait options
            </p>
          </div>

          {/* Gender cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {[
              { value: 'male', emoji: '👔', label: 'Male', desc: 'Suits, uniforms & formal wear', color: '#3b82f6', delay: '0.15s' },
              { value: 'female', emoji: '👗', label: 'Female', desc: 'Dresses, gowns & elegant outfits', color: '#ec4899', delay: '0.25s' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => !isLoading && handleSelect(opt.value)}
                onMouseEnter={() => setHoveredId(opt.value)}
                onMouseLeave={() => setHoveredId('')}
                disabled={isLoading}
                className={`gs-card ${opt.value === 'male' ? 'gs-card-male' : 'gs-card-female'} ${selected === opt.value ? 'selected' : ''}`}
                style={{ animationDelay: opt.delay, border: 'none', outline: 'none', position: 'relative' }}
              >
                {/* Check badge */}
                {selected === opt.value && (
                  <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', color: '#fff', fontWeight: '700',
                    boxShadow: `0 0 12px ${opt.color}80`,
                  }}>✓</div>
                )}

                {/* Emoji */}
                <div style={{
                  fontSize: '56px', marginBottom: '14px', lineHeight: 1,
                  transition: 'transform 0.3s ease',
                  transform: selected === opt.value || hoveredId === opt.value ? 'scale(1.12)' : 'scale(1)',
                  filter: selected === opt.value ? `drop-shadow(0 0 16px ${opt.color}70)` : 'none',
                }}>{opt.emoji}</div>

                <h3 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>{opt.label}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{opt.desc}</p>

                {/* Bottom accent */}
                <div style={{
                  height: '3px', borderRadius: '2px', marginTop: '18px',
                  background: `linear-gradient(to right, transparent, ${opt.color}, transparent)`,
                  opacity: selected === opt.value ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                }} />
              </button>
            ))}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="gs-glass" style={{
              borderRadius: '14px', padding: '16px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            }}>
              <svg className="gs-spin" style={{ width: '18px', height: '18px', color: '#a78bfa' }} viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Loading templates...</span>
            </div>
          )}

          <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
            ✦ Powered by AI • Premium Experience ✦
          </p>
        </div>
      </div>
    </>
  );
}

export default GenderScreen;
