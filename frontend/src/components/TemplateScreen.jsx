import { useState, useEffect, useMemo } from 'react';
import BoothBackground, { boothStyles } from './BoothBackground';

const templateIcons = ['🏰','🌅','🎬','👑','🌸','🏛️','🎪','🌌','🎨','🦋','🔮','🗼'];
const cardAccents = [
  { glow: '#818cf8', from: '#1e1b4b', to: '#312e81', badge: 'rgba(129,140,248,0.2)', badgeText: '#818cf8' },
  { glow: '#f59e0b', from: '#1c1917', to: '#44403c', badge: 'rgba(245,158,11,0.2)',  badgeText: '#fbbf24' },
  { glow: '#34d399', from: '#052e16', to: '#14532d', badge: 'rgba(52,211,153,0.2)',  badgeText: '#34d399' },
  { glow: '#60a5fa', from: '#0c1445', to: '#1e3a8a', badge: 'rgba(96,165,250,0.2)',  badgeText: '#60a5fa' },
  { glow: '#f472b6', from: '#4a0012', to: '#831843', badge: 'rgba(244,114,182,0.2)', badgeText: '#f472b6' },
  { glow: '#38bdf8', from: '#0a2540', to: '#0369a1', badge: 'rgba(56,189,248,0.2)',  badgeText: '#38bdf8' },
];

// Decorative-only particle field. Purely presentational; no effect on data/logic.
function useAmbientParticles() {
  return useMemo(() => {
    const rand = (min, max) => Math.random() * (max - min) + min;
    const stars = Array.from({ length: 28 }, (_, i) => ({
      id: `star-${i}`,
      top: `${rand(0, 100)}%`,
      left: `${rand(0, 100)}%`,
      size: rand(1.5, 3.2),
      delay: rand(0, 4),
      duration: rand(2.5, 5),
    }));
    const sparkles = Array.from({ length: 10 }, (_, i) => ({
      id: `sparkle-${i}`,
      top: `${rand(4, 96)}%`,
      left: `${rand(2, 98)}%`,
      size: rand(10, 20),
      delay: rand(0, 6),
      duration: rand(6, 11),
      drift: rand(-30, 30),
    }));
    const icons = ['✨', '📸', '🖼️', '⭐', '💫', '🎞️', '🪄'];
    const motifs = Array.from({ length: 9 }, (_, i) => ({
      id: `motif-${i}`,
      icon: icons[i % icons.length],
      top: `${rand(5, 92)}%`,
      left: `${rand(2, 95)}%`,
      size: rand(20, 36),
      delay: rand(0, 7),
      duration: rand(7, 13),
      opacity: rand(0.08, 0.18),
      drift: rand(-24, 24),
    }));
    const blobs = [
      { id: 'blob-1', top: '-8%',  left: '-10%', size: 480, c1: '#a855f7', c2: '#312e81', delay: 0 },
      { id: 'blob-2', top: '55%',  left: '70%',  size: 420, c1: '#ec4899', c2: '#1e1b4b', delay: 2 },
      { id: 'blob-3', top: '78%',  left: '-12%', size: 380, c1: '#38bdf8', c2: '#0c1445', delay: 4 },
      { id: 'blob-4', top: '5%',   left: '65%',  size: 360, c1: '#f59e0b', c2: '#1c1917', delay: 1 },
    ];
    return { stars, sparkles, motifs, blobs };
  }, []);
}

function TemplateScreen({ gender, onSelect, onBack, apiBase }) {
  const [templates, setTemplates]       = useState([]);
  const [selected, setSelected]         = useState(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError]     = useState('');
  const [hovered, setHovered]           = useState('');
  const { stars, sparkles, motifs, blobs } = useAmbientParticles();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setFetchError('');
      try {
        const res = await fetch(`${apiBase}/templates/${gender}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch {
        setFetchError('Could not load templates — showing defaults.');
        setTemplates([
          { id: '1', name: 'Royal Palace',  backgroundName: 'Grand Palace Hall',       gender, prompt: 'royal attire',     previewImage: '' },
          { id: '2', name: 'Beach Sunset',  backgroundName: 'Tropical Paradise',       gender, prompt: 'beach outfit',     previewImage: '' },
          { id: '3', name: 'Movie Star',    backgroundName: 'Hollywood Red Carpet',    gender, prompt: 'celebrity look',   previewImage: '' },
        ]);
      } finally { setIsLoading(false); }
    };
    load();
  }, [gender, apiBase]);

  const handleContinue = async () => {
    if (!selected || isSubmitting) return;
    // Debug: confirm exactly what template object is being handed off to the parent/navigation.
    console.log('Selected Template:', selected);
    console.log('Selected Template name (what LoadingScreen should match on):', selected?.name);
    setIsSubmitting(true);
    try { await onSelect(selected); }
    finally { setIsSubmitting(false); }
  };

  return (
    <>
      <style>{`
        ${boothStyles}
        @keyframes ts-scale-in  { 0%{opacity:0;transform:scale(0.93)} 100%{opacity:1;transform:scale(1)} }
        @keyframes ts-card-in   { 0%{opacity:0;transform:translateY(32px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes ts-spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ts-slide-up  { 0%{opacity:0;transform:translateY(100%)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes ts-selected-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(168,85,247,0), 0 28px 60px rgba(168,85,247,0.25); }
          50%     { box-shadow: 0 0 0 8px rgba(168,85,247,0.16), 0 28px 70px rgba(168,85,247,0.4); }
        }
        @keyframes ts-twinkle   { 0%,100%{opacity:0.15;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.25)} }
        @keyframes ts-drift     {
          0%   { transform: translate(0,0) rotate(0deg); }
          50%  { transform: translate(var(--dx,12px), -22px) rotate(8deg); }
          100% { transform: translate(0,0) rotate(0deg); }
        }
        @keyframes ts-blob-float {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(3%, -4%) scale(1.08); }
        }
        @keyframes ts-shine-sweep {
          0%   { transform: translateX(-130%) skewX(-18deg); }
          100% { transform: translateX(230%) skewX(-18deg); }
        }
        @keyframes ts-border-spin { to { --ts-angle: 360deg; } }
        @keyframes ts-ring-pulse {
          0%   { transform: scale(0.85); opacity: 0.9; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ts-badge-pop { 0%{transform:scale(0.4) rotate(-15deg);opacity:0} 60%{transform:scale(1.15) rotate(4deg)} 100%{transform:scale(1) rotate(0)} }
        @keyframes ts-title-glow { 0%,100%{opacity:0.55} 50%{opacity:1} }
        @keyframes ts-orbit { from{transform:rotate(0deg) translateX(var(--orbit-r,120px)) rotate(0deg)} to{transform:rotate(360deg) translateX(var(--orbit-r,120px)) rotate(-360deg)} }
        @property --ts-angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }

        @media (prefers-reduced-motion: reduce) {
          .ts-star, .ts-sparkle, .ts-motif, .ts-blob, .ts-card, .ts-orbit-el { animation: none !important; }
        }

        .ts-glass {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ts-back { transition: all 0.25s cubic-bezier(0.34,1.2,0.64,1); }
        .ts-back:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.35); }
        .ts-spin { animation: ts-spin 1.5s linear infinite; }

        /* Ambient layer */
        .ts-ambient { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
        .ts-blob { position: absolute; border-radius: 50%; filter: blur(60px); animation: ts-blob-float 14s ease-in-out infinite; }
        .ts-star { position: absolute; border-radius: 50%; background: #fff; animation: ts-twinkle ease-in-out infinite; box-shadow: 0 0 6px 1px rgba(255,255,255,0.7); }
        .ts-sparkle { position: absolute; animation: ts-drift ease-in-out infinite; filter: drop-shadow(0 0 6px rgba(196,181,253,0.6)); }
        .ts-motif { position: absolute; animation: ts-drift ease-in-out infinite; }

        /* Template card — vertical single column */
        .ts-card {
          position: relative; border-radius: 22px; overflow: hidden;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1), box-shadow 0.4s cubic-bezier(0.34, 1.2, 0.64, 1), border-color 0.3s ease;
          animation: ts-card-in 0.55s ease-out both;
          isolation: isolate;
        }
        .ts-card:hover { transform: translateY(-8px) scale(1.015); }
        .ts-card.selected {
          transform: translateY(-10px) scale(1.018);
          animation: ts-card-in 0.55s ease-out both, ts-selected-pulse 2.2s ease-in-out infinite;
        }
        .ts-card-img { display: block; width: 100%; transition: transform 0.6s cubic-bezier(0.16,1,0.3,1); }
        .ts-card:hover .ts-card-img, .ts-card.selected .ts-card-img { transform: scale(1.06); }

        /* Shine sweep on hover */
        .ts-shine { position: absolute; top: -20%; left: 0; width: 45%; height: 140%; pointer-events: none;
          background: linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0) 100%);
          opacity: 0; z-index: 3; }
        .ts-card:hover .ts-shine { opacity: 1; animation: ts-shine-sweep 1.1s cubic-bezier(0.4,0,0.2,1); }

        /* Animated gradient border ring for selected cards */
        .ts-ring {
          position: absolute; inset: 0; border-radius: 22px; pointer-events: none; z-index: 4;
          padding: 2px;
          background: conic-gradient(from var(--ts-angle, 0deg), var(--ring-c1), var(--ring-c2), var(--ring-c3), var(--ring-c1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: ts-border-spin 4s linear infinite;
        }

        .ts-check-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid currentColor; animation: ts-ring-pulse 1.8s ease-out infinite; }
        .ts-badge-anim { animation: ts-badge-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }

        .ts-title-glow { animation: ts-title-glow 3.5s ease-in-out infinite; }
        .ts-orbit-el { animation: ts-orbit linear infinite; }

        /* Continue bar */
        .ts-bottom-bar { animation: ts-slide-up 0.4s ease-out; }
        .ts-continue {
          position: relative; overflow: hidden;
          background-size: 200% 200%;
          transition: box-shadow 0.35s ease, transform 0.25s cubic-bezier(0.34,1.2,0.64,1), background-position 0.6s ease;
        }
        .ts-continue:hover:not(:disabled) {
          box-shadow: 0 26px 48px rgba(168,85,247,0.6), 0 0 0 1px rgba(255,255,255,0.15) inset;
          transform: translateY(-3px); background-position: 100% 50%;
        }
        .ts-continue:active:not(:disabled) { transform: scale(0.97); }
        .ts-continue::after {
          content: ''; position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
          background: linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-20deg);
        }
        .ts-continue:hover:not(:disabled)::after { animation: ts-shine-sweep 1s cubic-bezier(0.4,0,0.2,1); }

        @media (max-width: 480px) {
          .ts-card { border-radius: 18px; }
          .ts-orbit-el { display: none; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(160deg, #07040e 0%, #120820 30%, #1e0f38 60%, #07040e 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient premium decoration layer — purely visual, no logic */}
        <div className="ts-ambient" aria-hidden="true">
          {blobs.map(b => (
            <div key={b.id} className="ts-blob" style={{
              top: b.top, left: b.left, width: `${b.size}px`, height: `${b.size}px`,
              background: `radial-gradient(circle, ${b.c1}55, ${b.c2}00 70%)`,
              animationDelay: `${b.delay}s`,
            }} />
          ))}
          {stars.map(s => (
            <div key={s.id} className="ts-star" style={{
              top: s.top, left: s.left, width: `${s.size}px`, height: `${s.size}px`,
              animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`,
            }} />
          ))}
          {sparkles.map(s => (
            <div key={s.id} className="ts-sparkle" style={{
              top: s.top, left: s.left, fontSize: `${s.size}px`,
              animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`,
              '--dx': `${s.drift}px`,
            }}>✦</div>
          ))}
          {motifs.map(m => (
            <div key={m.id} className="ts-motif" style={{
              top: m.top, left: m.left, fontSize: `${m.size}px`, opacity: m.opacity,
              animationDuration: `${m.duration}s`, animationDelay: `${m.delay}s`,
              '--dx': `${m.drift}px`,
            }}>{m.icon}</div>
          ))}
        </div>

        <BoothBackground emojis={[
          { e: '🎨', top: '7%',   left: '5%',   delay: '0s',   size: '40px', opacity: 0.16 },
          { e: '✨', top: '12%',  right: '6%',  delay: '1.2s', size: '32px', opacity: 0.14 },
          { e: '🌟', bottom: '9%', right: '5%', delay: '0.6s', size: '38px', opacity: 0.16 },
          { e: '🖼️', bottom: '20%', left: '5%', delay: '2s',   size: '34px', opacity: 0.12 },
        ]} />

        {/* Back button */}
        <button onClick={onBack} className="ts-back" style={{
          position: 'fixed', top: 'clamp(16px, 4vw, 24px)', left: 'clamp(16px, 4vw, 24px)', zIndex: 20,
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '12px', padding: '10px 18px', color: '#cbd5e1',
          fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          backdropFilter: 'blur(14px)', minHeight: '40px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
        }}>← Back</button>

        {/* Scroll area */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: 'clamp(72px, 10vw, 90px) clamp(14px, 4vw, 20px)',
          paddingBottom: selected ? '136px' : '60px',
          zIndex: 10, position: 'relative',
        }}>
          {isLoading ? (
            <div className="ts-glass" style={{ borderRadius: '24px', padding: '56px 48px', textAlign: 'center', animation: 'ts-scale-in 0.5s ease-out' }}>
              <svg className="ts-spin" style={{ width: '44px', height: '44px', color: '#a78bfa', margin: '0 auto 16px', display: 'block' }} viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                <path style={{ opacity: 0.85 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Loading templates...</p>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Fetching the best looks for you</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ position: 'relative', textAlign: 'center', marginBottom: '36px', animation: 'ts-scale-in 0.5s ease-out', width: '100%', maxWidth: '560px' }}>
                {/* Glow behind title */}
                <div aria-hidden="true" style={{
                  position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
                  width: '320px', height: '160px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(168,85,247,0.35), rgba(236,72,153,0.12) 55%, transparent 75%)',
                  filter: 'blur(20px)', animation: 'ts-title-glow 3.5s ease-in-out infinite', pointerEvents: 'none',
                }} />
                {/* Orbiting sparkles around heading */}
                <div aria-hidden="true" style={{ position: 'absolute', top: '14px', left: '50%', width: '0', height: '0' }}>
                  <span className="ts-orbit-el" style={{ position: 'absolute', fontSize: '16px', '--orbit-r': '150px', animationDuration: '10s', opacity: 0.7 }}>✨</span>
                  <span className="ts-orbit-el" style={{ position: 'absolute', fontSize: '13px', '--orbit-r': '170px', animationDuration: '14s', animationDirection: 'reverse', opacity: 0.5 }}>⭐</span>
                </div>
                <h2 style={{
                  position: 'relative', fontSize: 'clamp(32px, 7vw, 42px)', fontWeight: '900', marginBottom: '10px',
                  background: 'linear-gradient(135deg, #c4b5fd, #f9a8d4, #d8b4fe 60%, #a78bfa)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  letterSpacing: '-0.8px', fontFamily: "'Georgia', 'Iowan Old Style', serif",
                }}>Pick Your Look</h2>
                <p style={{ position: 'relative', color: '#a3aebd', fontSize: '15px', marginBottom: fetchError ? '12px' : 0, letterSpacing: '0.2px' }}>
                  Choose a costume & background for your AI portrait
                </p>
                {fetchError && (
                  <div style={{
                    position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                    borderRadius: '10px', padding: '6px 14px', color: '#fbbf24', fontSize: '12px',
                    marginBottom: '10px',
                  }}>⚠️ {fetchError}</div>
                )}
                {/* Gender pill */}
                <div style={{
                  position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  marginTop: '16px',
                  background: gender === 'male' ? 'rgba(59,130,246,0.12)' : 'rgba(236,72,153,0.12)',
                  border: `1px solid ${gender === 'male' ? 'rgba(59,130,246,0.3)' : 'rgba(236,72,153,0.3)'}`,
                  borderRadius: '20px', padding: '8px 22px',
                  color: gender === 'male' ? '#93c5fd' : '#f9a8d4',
                  fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase',
                  boxShadow: gender === 'male' ? '0 4px 18px rgba(59,130,246,0.18)' : '0 4px 18px rgba(236,72,153,0.18)',
                }}>
                  <span>{gender === 'male' ? '👔' : '👗'}</span>
                  {gender} Templates
                </div>
              </div>

              {/* Template list — vertical single column */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: 'clamp(18px, 4vw, 24px)', width: '100%', maxWidth: '560px',
              }}>
                {templates.map((tpl, idx) => {
                  const isSelected = selected?.id === tpl.id;
                  const isHovered  = hovered === tpl.id;
                  const acc = cardAccents[idx % cardAccents.length];

                  return (
                    <div
                      key={tpl.id}
                      className={`ts-card${isSelected ? ' selected' : ''}`}
                      onClick={() => setSelected(tpl)}
                      onMouseEnter={() => setHovered(tpl.id)}
                      onMouseLeave={() => setHovered('')}
                      style={{
                        animationDelay: `${idx * 0.1}s`,
                        background: isSelected
                          ? `linear-gradient(155deg, rgba(255,255,255,0.09), rgba(255,255,255,0.025)), radial-gradient(120% 100% at 0% 0%, ${acc.glow}14, transparent 60%)`
                          : 'linear-gradient(155deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                        backdropFilter: 'blur(20px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                        border: isSelected
                          ? `1px solid ${acc.glow}55`
                          : isHovered
                          ? `1px solid ${acc.glow}50`
                          : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: isSelected
                          ? `0 0 0 1px ${acc.glow}30, 0 30px 64px ${acc.glow}30, 0 8px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`
                          : isHovered
                          ? `0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px ${acc.glow}20, inset 0 1px 0 rgba(255,255,255,0.06)`
                          : '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
                        '--ring-c1': `${acc.glow}cc`,
                        '--ring-c2': '#ec4899cc',
                        '--ring-c3': `${acc.glow}cc`,
                      }}
                    >
                      {/* Animated gradient ring border — selected only */}
                      {isSelected && <div className="ts-ring" aria-hidden="true" />}

                      {/* Image area — portrait ratio */}
                      <div style={{
                        position: 'relative', overflow: 'hidden',
                        aspectRatio: '16 / 9',
                        background: `linear-gradient(160deg, ${acc.from}, ${acc.to})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {/* Shine sweep on hover */}
                        <div className="ts-shine" aria-hidden="true" />
                        {tpl.previewImage ? (
                          <img
                            src={tpl.previewImage} alt={tpl.name}
                            className="ts-card-img"
                            style={{ height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '24px' }}>
                            <div style={{
                              fontSize: '80px', lineHeight: 1,
                              filter: `drop-shadow(0 0 28px ${acc.glow}70)`,
                              transition: 'transform 0.3s ease',
                              transform: isSelected || isHovered ? 'scale(1.14)' : 'scale(1)',
                              marginBottom: '12px',
                            }}>{templateIcons[idx % templateIcons.length]}</div>
                            <p style={{ color: `${acc.glow}`, fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.85 }}>
                              {tpl.backgroundName}
                            </p>
                          </div>
                        )}

                        {/* Cinematic overlay gradient for depth */}
                        <div aria-hidden="true" style={{
                          position: 'absolute', inset: 0, pointerEvents: 'none',
                          background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.45) 100%)',
                        }} />

                        {/* Number badge */}
                        <div style={{
                          position: 'absolute', top: '14px', left: '14px', zIndex: 2,
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: acc.badge, border: `1px solid ${acc.glow}60`,
                          backdropFilter: 'blur(8px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: acc.badgeText, fontSize: '14px', fontWeight: '800',
                          boxShadow: `0 4px 12px ${acc.glow}25`,
                        }}>{idx + 1}</div>

                        {/* Selected overlay */}
                        {isSelected && (
                          <div style={{
                            position: 'absolute', inset: 0, display: 'flex', zIndex: 2,
                            alignItems: 'center', justifyContent: 'center',
                            background: `${acc.glow}18`,
                          }}>
                            <div className="ts-badge-anim" style={{
                              position: 'relative',
                              width: '68px', height: '68px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 12px 32px rgba(168,85,247,0.65), 0 0 0 4px rgba(255,255,255,0.12)',
                              fontSize: '30px', color: '#fff',
                            }}>
                              <span className="ts-check-ring" aria-hidden="true" style={{ color: '#ec4899' }} />
                              ✓
                            </div>
                          </div>
                        )}

                        {/* Glow edge on selected */}
                        {isSelected && (
                          <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            boxShadow: `inset 0 0 50px ${acc.glow}30, inset 0 0 2px ${acc.glow}60`,
                          }} />
                        )}
                      </div>

                      {/* Card footer — name BELOW image */}
                      <div style={{
                        position: 'relative', padding: 'clamp(16px, 4vw, 20px) clamp(16px, 5vw, 24px)',
                        background: isSelected
                          ? `linear-gradient(135deg, ${acc.from}95, rgba(0,0,0,0.45))`
                          : 'rgba(0,0,0,0.28)',
                        borderTop: `1px solid ${isSelected ? acc.glow + '40' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'background 0.35s ease, border-color 0.35s ease',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Template name — now below the image */}
                            <p style={{
                              color: isSelected ? '#f8fafc' : '#e2e8f0',
                              fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '800', marginBottom: '4px',
                              letterSpacing: '-0.2px',
                            }}>{tpl.name}</p>
                            <p style={{ color: '#64748b', fontSize: '13px' }}>{tpl.backgroundName}</p>
                          </div>
                          <div style={{
                            padding: '10px 18px', borderRadius: '12px', flexShrink: 0,
                            minHeight: '40px', display: 'flex', alignItems: 'center',
                            background: isSelected ? 'linear-gradient(135deg, #a855f7, #ec4899)' : acc.badge,
                            border: `1px solid ${isSelected ? 'transparent' : `${acc.glow}50`}`,
                            color: isSelected ? '#fff' : acc.badgeText,
                            fontSize: '13px', fontWeight: '700',
                            transition: 'all 0.3s ease',
                            boxShadow: isSelected ? '0 6px 20px rgba(168,85,247,0.45)' : 'none',
                            whiteSpace: 'nowrap',
                          }}>
                            {isSelected ? 'Selected ✓' : 'Select'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Sticky CTA bar */}
        {selected && !isLoading && (
          <div className="ts-glass ts-bottom-bar" style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            padding: '18px 24px',
            background: 'linear-gradient(180deg, rgba(20,12,32,0.55), rgba(10,6,18,0.85))',
            boxShadow: '0 -20px 50px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              {/* Selected preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(236,72,153,0.3))',
                  border: '1px solid rgba(168,85,247,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  boxShadow: '0 6px 16px rgba(168,85,247,0.25)',
                }}>{templateIcons[templates.findIndex(t => t.id === selected.id) % templateIcons.length]}</div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.name}</p>
                  <p style={{ color: '#64748b', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.backgroundName}</p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleContinue} disabled={isSubmitting}
                className="ts-continue"
                style={{
                  padding: 'clamp(14px, 3vw, 16px) clamp(22px, 5vw, 32px)', borderRadius: '16px', border: 'none',
                  minHeight: '52px',
                  background: isSubmitting
                    ? 'rgba(168,85,247,0.5)'
                    : 'linear-gradient(120deg, #9333ea, #a855f7, #ec4899, #a855f7)',
                  color: '#fff', fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: '700',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 14px 32px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="ts-spin" style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Setting up...
                  </>
                ) : <>Continue to Camera <span style={{ fontSize: '18px' }}>📸</span></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default TemplateScreen;