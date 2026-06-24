import { useState, useMemo } from 'react';
import BoothBackground, { boothStyles } from './BoothBackground';

function GenderScreen({ onSelect, onBack, userName }) {
  const [selected, setSelected]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hovered, setHovered]     = useState('');

  const handleSelect = async (gender) => {
    if (isLoading) return;
    setSelected(gender);
    setIsLoading(true);
    try { await onSelect(gender); }
    finally { setIsLoading(false); }
  };

  return (
    <>
      <style>{`
        ${boothStyles}
        @keyframes gs-scale-in   { 0%{opacity:0;transform:scale(0.94)} 100%{opacity:1;transform:scale(1)} }
        @keyframes gs-card-enter { 0%{opacity:0;transform:translateY(32px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes gs-spin       { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes gs-shimmer    { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .gs-glass {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .gs-back:hover { background: rgba(255,255,255,0.1); }

        /* Gender cards */
        .gs-card {
          position: relative; width: 100%; border-radius: 20px;
          padding: 0; cursor: pointer; outline: none;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          animation: gs-card-enter 0.5s ease-out both;
        }
        .gs-card:active { transform: scale(0.98); }

        .gs-card-male {
          background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.06));
          border: 1.5px solid rgba(59,130,246,0.25);
        }
        .gs-card-female {
          background: linear-gradient(135deg, rgba(236,72,153,0.1), rgba(219,39,119,0.06));
          border: 1.5px solid rgba(236,72,153,0.25);
        }
        .gs-card-male:hover, .gs-card-male.hovered {
          background: linear-gradient(135deg, rgba(59,130,246,0.18), rgba(37,99,235,0.12));
          border-color: rgba(59,130,246,0.55);
          box-shadow: 0 24px 48px rgba(59,130,246,0.22), inset 0 1px 0 rgba(59,130,246,0.15);
          transform: translateY(-5px);
        }
        .gs-card-female:hover, .gs-card-female.hovered {
          background: linear-gradient(135deg, rgba(236,72,153,0.18), rgba(219,39,119,0.12));
          border-color: rgba(236,72,153,0.55);
          box-shadow: 0 24px 48px rgba(236,72,153,0.22), inset 0 1px 0 rgba(236,72,153,0.15);
          transform: translateY(-5px);
        }
        .gs-card-male.selected {
          background: linear-gradient(135deg, rgba(59,130,246,0.22), rgba(37,99,235,0.15));
          border-color: rgba(59,130,246,0.7);
          box-shadow: 0 0 0 2px rgba(59,130,246,0.3), 0 28px 56px rgba(59,130,246,0.28);
          transform: translateY(-6px) scale(1.008);
        }
        .gs-card-female.selected {
          background: linear-gradient(135deg, rgba(236,72,153,0.22), rgba(219,39,119,0.15));
          border-color: rgba(236,72,153,0.7);
          box-shadow: 0 0 0 2px rgba(236,72,153,0.3), 0 28px 56px rgba(236,72,153,0.28);
          transform: translateY(-6px) scale(1.008);
        }
        .gs-spin { animation: gs-spin 1.5s linear infinite; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', background: 'linear-gradient(160deg, #07040e 0%, #120820 30%, #1e0f38 60%, #07040e 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <BoothBackground emojis={[
          { e: '👔', top: '7%',   left: '5%',   delay: '0s',   size: '44px', opacity: 0.18 },
          { e: '👗', top: '12%',  right: '6%',  delay: '1.3s', size: '40px', opacity: 0.15 },
          { e: '✨', bottom: '9%', left: '7%',  delay: '0.7s', size: '30px', opacity: 0.15 },
          { e: '🌟', bottom: '13%', right: '5%', delay: '2.1s', size: '40px', opacity: 0.18 },
        ]} />

        <button onClick={onBack} className="gs-back" style={{
          position: 'fixed', top: '24px', left: '24px', zIndex: 20,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px', padding: '10px 18px', color: '#cbd5e1',
          fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          backdropFilter: 'blur(12px)', transition: 'all 0.2s ease',
        }}>← Back</button>

        <div style={{ width: '100%', maxWidth: '520px', position: 'relative', zIndex: 10 }}>
          {/* Header card */}
          <div className="gs-glass" style={{
            borderRadius: '24px', padding: '36px 40px 32px', marginBottom: '20px',
            boxShadow: '0 28px 56px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
            animation: 'gs-scale-in 0.55s ease-out',
          }}>
            {/* Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', inset: '-10px', borderRadius: '26px',
                  background: 'radial-gradient(ellipse, rgba(168,85,247,0.28), transparent 70%)',
                }} />
                <div style={{
                  width: '80px', height: '80px', borderRadius: '18px',
                  background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', boxShadow: '0 12px 28px rgba(168,85,247,0.45)',
                  position: 'relative',
                }}>🎭</div>
              </div>
            </div>

            <p style={{ color: '#a78bfa', textAlign: 'center', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>
              Hey <span style={{ color: '#f472b6' }}>{userName}</span> 👋
            </p>
            <h2 style={{
              fontSize: '38px', fontWeight: '900', textAlign: 'center', marginBottom: '10px',
              background: 'linear-gradient(135deg, #a78bfa, #f472b6, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              letterSpacing: '-0.3px',
            }}>Choose Your Style</h2>
            <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '15px', lineHeight: '1.6' }}>
              Select a costume category to see your AI portrait options
            </p>
          </div>

          {/* ── VERTICAL gender cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            {[
              {
                value: 'male',
                emoji: '👔', label: 'Male',
                desc: 'Suits, uniforms & formal wear',
                subDesc: 'Classic & contemporary menswear looks',
                color: '#3b82f6',
                gradient: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                delay: '0.1s',
              },
              {
                value: 'female',
                emoji: '👗', label: 'Female',
                desc: 'Dresses, gowns & elegant outfits',
                subDesc: 'Glamorous & sophisticated womenswear',
                color: '#ec4899',
                gradient: 'linear-gradient(135deg, #be185d, #ec4899)',
                delay: '0.22s',
              },
            ].map((opt) => {
              const isSelected = selected === opt.value;
              const isHovered  = hovered === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => !isLoading && handleSelect(opt.value)}
                  onMouseEnter={() => setHovered(opt.value)}
                  onMouseLeave={() => setHovered('')}
                  disabled={isLoading}
                  className={`gs-card ${opt.value === 'male' ? 'gs-card-male' : 'gs-card-female'}${isSelected ? ' selected' : isHovered ? ' hovered' : ''}`}
                  style={{ animationDelay: opt.delay }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '28px 32px' }}>
                    {/* Large emoji in a styled circle */}
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%', flexShrink: 0,
                      background: `${opt.color}22`,
                      border: `2px solid ${opt.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '40px', lineHeight: 1,
                      transition: 'all 0.3s ease',
                      transform: isSelected || isHovered ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isSelected ? `0 0 24px ${opt.color}50` : 'none',
                      filter: isSelected ? `drop-shadow(0 0 12px ${opt.color}80)` : 'none',
                    }}>{opt.emoji}</div>

                    {/* Text */}
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <h3 style={{ color: '#f1f5f9', fontSize: '26px', fontWeight: '800', marginBottom: '4px', lineHeight: 1.2 }}>
                        {opt.label}
                      </h3>
                      <p style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>{opt.desc}</p>
                      <p style={{ color: '#64748b', fontSize: '12px' }}>{opt.subDesc}</p>
                    </div>

                    {/* Arrow / check */}
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      background: isSelected ? opt.gradient : 'rgba(255,255,255,0.06)',
                      border: `1.5px solid ${isSelected ? opt.color : 'rgba(255,255,255,0.12)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: isSelected ? '20px' : '18px', color: isSelected ? '#fff' : '#64748b',
                      transition: 'all 0.3s ease',
                      boxShadow: isSelected ? `0 0 16px ${opt.color}60` : 'none',
                    }}>
                      {isSelected ? '✓' : '→'}
                    </div>
                  </div>

                  {/* Bottom accent bar */}
                  <div style={{
                    height: '3px', borderRadius: '0 0 18px 18px',
                    background: `linear-gradient(to right, transparent, ${opt.color}80, transparent)`,
                    opacity: isSelected ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                  }} />
                </button>
              );
            })}
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

          <p style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '16px', letterSpacing: '0.5px' }}>
            ✦ POWERED BY AI  ·  PREMIUM EXPERIENCE ✦
          </p>
        </div>
      </div>
    </>
  );
}

export default GenderScreen;