import { useState, useEffect, useMemo } from 'react';

const templateIcons = ['🏰','🌅','🎬','👑','🌸','🏛️','🎪','🌌','🎨'];
const cardGrads = [
  { from: '#1e1b4b', to: '#312e81', accent: '#818cf8' },
  { from: '#1c1917', to: '#44403c', accent: '#f59e0b' },
  { from: '#052e16', to: '#14532d', accent: '#34d399' },
  { from: '#0c1445', to: '#1e3a8a', accent: '#60a5fa' },
  { from: '#4a0012', to: '#831843', accent: '#f472b6' },
  { from: '#0a2540', to: '#0369a1', accent: '#38bdf8' },
];

function TemplateScreen({ gender, onSelect, onBack, apiBase }) {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [hoveredId, setHoveredId] = useState('');

  const sparkles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`, duration: `${2 + Math.random() * 3}s`,
    size: `${2 + Math.random() * 4}px`,
  })), []);

  useEffect(() => {
    const fetch_ = async () => {
      setIsLoading(true); setFetchError('');
      try {
        const res = await fetch(`${apiBase}/templates/${gender}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch {
        setFetchError('Could not load templates — showing defaults.');
        setTemplates([
          { id: '1', name: 'Royal Palace', backgroundName: 'Grand Palace Hall', gender, prompt: 'royal attire', previewImage: '' },
          { id: '2', name: 'Beach Sunset', backgroundName: 'Tropical Paradise', gender, prompt: 'beach outfit', previewImage: '' },
          { id: '3', name: 'Movie Star', backgroundName: 'Hollywood Red Carpet', gender, prompt: 'celebrity look', previewImage: '' },
        ]);
      } finally { setIsLoading(false); }
    };
    fetch_();
  }, [gender, apiBase]);

  const handleContinue = async () => {
    if (!selected || isSubmitting) return;
    setIsSubmitting(true);
    try { await onSelect(selected); } finally { setIsSubmitting(false); }
  };

  return (
    <>
      <style>{`
        @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0) translateY(0)}50%{opacity:1}100%{opacity:0;transform:scale(1) translateY(-80px)} }
        @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)} }
        @keyframes scale-in { 0%{opacity:0;transform:scale(0.93)}100%{opacity:1;transform:scale(1)} }
        @keyframes card-in { 0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes spin-slow { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes slide-up { 0%{opacity:0;transform:translateY(100%)}100%{opacity:1;transform:translateY(0)} }
        .ts-sparkle { position:absolute;border-radius:50%;pointer-events:none;animation:sparkle 4s ease-out infinite; }
        .ts-sparkle-wrap { position:absolute;width:100%;height:100%;pointer-events:none; }
        .ts-float { animation:float 3s ease-in-out infinite; }
        .ts-glass {
          background:rgba(255,255,255,0.05);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.1);
        }
        .ts-spin { animation:spin-slow 1.5s linear infinite; }
        .ts-back:hover { background:rgba(255,255,255,0.1); }
        .ts-card { transition:all 0.3s ease; cursor:pointer; border-radius:18px; overflow:hidden; animation:card-in 0.5s ease-out both; }
        .ts-card:hover { transform:translateY(-6px); }
        .ts-continue:hover { box-shadow:0 20px 35px rgba(168,85,247,0.45); transform:translateY(-2px); }
        .ts-bottom-bar { animation:slide-up 0.4s ease-out; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(to bottom right, #0f172a, #2d1b4e, #0f172a)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Sparkles */}
        <div className="ts-sparkle-wrap">
          {sparkles.map((s) => (
            <div key={s.id} className="ts-sparkle" style={{
              left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration,
              width: s.size, height: s.size,
              background: s.id % 3 === 0 ? '#6366f1' : s.id % 3 === 1 ? '#8b5cf6' : '#ec4899',
            }} />
          ))}
        </div>

        {/* Floating decorations */}
        {[
          { e: '🎨', top: '70px', left: '35px', delay: '0s', opacity: 0.18 },
          { e: '✨', top: '110px', right: '50px', delay: '1s', opacity: 0.15 },
          { e: '🌟', bottom: '100px', right: '40px', delay: '0.5s', opacity: 0.18 },
        ].map((d, i) => (
          <div key={i} className="ts-float" style={{
            position: 'absolute', fontSize: '38px', opacity: d.opacity, userSelect: 'none',
            pointerEvents: 'none', animationDelay: d.delay,
            top: d.top, left: d.left, right: d.right, bottom: d.bottom,
          }}>{d.e}</div>
        ))}

        {/* Back button */}
        <button onClick={onBack} className="ts-back" style={{
          position: 'fixed', top: '24px', left: '24px', zIndex: 20,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px', padding: '10px 18px', color: '#cbd5e1',
          fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          backdropFilter: 'blur(12px)', transition: 'all 0.2s ease',
        }}>← Back</button>

        {/* Main scrollable area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 20px', paddingBottom: selected ? '120px' : '60px', zIndex: 10, position: 'relative' }}>

          {/* Loading */}
          {isLoading ? (
            <div className="ts-glass" style={{ borderRadius: '24px', padding: '48px 40px', textAlign: 'center', animation: 'scale-in 0.5s ease-out' }}>
              <svg className="ts-spin" style={{ width: '40px', height: '40px', color: '#a78bfa', margin: '0 auto 16px', display: 'block' }} viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                <path style={{ opacity: 0.85 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Loading templates...</p>
              <p style={{ color: '#64748b', fontSize: '13px' }}>Fetching the best looks for you</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '36px', animation: 'scale-in 0.5s ease-out' }}>
                <h2 style={{
                  fontSize: '36px', fontWeight: '900', marginBottom: '10px',
                  background: 'linear-gradient(to right, #a78bfa, #f472b6, #c084fc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>Pick Your Look</h2>
                <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: fetchError ? '10px' : 0 }}>
                  Choose a costume &amp; background for your AI portrait
                </p>
                {fetchError && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                    borderRadius: '10px', padding: '6px 14px',
                    color: '#fbbf24', fontSize: '12px',
                  }}>⚠️ {fetchError}</div>
                )}
              </div>

              {/* Gender Label Pill (like reference) */}
              <div style={{
                background: '#2d1b4e',
                color: '#fff',
                padding: '8px 24px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '800',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                {gender} TEMPLATES
              </div>

              {/* Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px', width: '100%', maxWidth: '1000px',
              }}>
                {templates.map((tpl, idx) => {
                  const isSelected = selected?.id === tpl.id;
                  const g = cardGrads[idx % cardGrads.length];
                  return (
                    <div
                      key={tpl.id}
                      className="ts-card"
                      onClick={() => setSelected(tpl)}
                      onMouseEnter={() => setHoveredId(tpl.id)}
                      onMouseLeave={() => setHoveredId('')}
                      style={{
                        animationDelay: `${idx * 0.07}s`,
                        border: isSelected
                          ? `2px solid ${g.accent}`
                          : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: isSelected
                          ? `0 0 0 1px ${g.accent}40, 0 20px 40px ${g.accent}25`
                          : hoveredId === tpl.id
                          ? '0 16px 32px rgba(0,0,0,0.4)'
                          : '0 4px 16px rgba(0,0,0,0.3)',
                        transform: isSelected ? 'translateY(-6px) scale(1.01)' : hoveredId === tpl.id ? 'translateY(-6px)' : 'translateY(0)',
                        position: 'relative'
                      }}
                    >
                      {/* Name Pill (like reference) */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#000',
                        color: '#fff',
                        padding: '6px 20px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '800',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                      }}>
                        {tpl.name}
                      </div>

                      {/* Preview Image */}
                      <div style={{
                        aspectRatio: '1 / 1.1', position: 'relative', overflow: 'hidden',
                        background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {tpl.previewImage ? (
                          <img src={tpl.previewImage} alt={tpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease', transform: hoveredId === tpl.id ? 'scale(1.05)' : 'scale(1)' }} />
                        ) : (
                          <span style={{
                            fontSize: '64px', lineHeight: 1,
                            filter: `drop-shadow(0 0 20px ${g.accent}60)`,
                            transition: 'transform 0.3s ease',
                            transform: hoveredId === tpl.id || isSelected ? 'scale(1.15)' : 'scale(1)',
                          }}>
                            {templateIcons[idx % templateIcons.length]}
                          </span>
                        )}

                        {/* Selected check */}
                        {isSelected && (
                          <div style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: `${g.accent}20`,
                          }}>
                            <div style={{
                               width: '64px', height: '64px', borderRadius: '50%',
                               background: `linear-gradient(135deg, #a855f7, #ec4899)`,
                               display: 'flex', alignItems: 'center', justifyContent: 'center',
                               boxShadow: '0 8px 24px rgba(168,85,247,0.5)',
                            }}>
                              <span style={{ color: '#fff', fontSize: '32px', fontWeight: '900' }}>✓</span>
                            </div>
                          </div>
                        )}

                        {/* Accent dot */}
                        <div style={{
                          position: 'absolute', bottom: '12px', right: '12px',
                          width: '10px', height: '10px', borderRadius: '50%',
                          background: g.accent, opacity: isSelected ? 1 : 0,
                          boxShadow: `0 0 10px ${g.accent}`,
                          transition: 'opacity 0.3s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Sticky bottom bar — shows when selected */}
        {selected && !isLoading && (
          <div className="ts-glass ts-bottom-bar" style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '16px 24px',
          }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              {/* Selected preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3))',
                  border: '1px solid rgba(168,85,247,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>
                  {templateIcons[templates.findIndex(t => t.id === selected.id) % templateIcons.length]}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.name}</p>
                  <p style={{ color: '#64748b', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.backgroundName}</p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleContinue}
                disabled={isSubmitting}
                className="ts-continue"
                style={{
                  padding: '14px 28px', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(to right, #a855f7, #ec4899)',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 10px 25px rgba(168,85,247,0.3)',
                  transition: 'all 0.3s ease', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: '10px',
                  opacity: isSubmitting ? 0.7 : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg style={{ width: '16px', height: '16px', animation: 'spin-slow 1.5s linear infinite' }} viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Setting up...
                  </>
                ) : (
                  <>Continue to Camera <span style={{ fontSize: '18px' }}>📸</span></>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default TemplateScreen;