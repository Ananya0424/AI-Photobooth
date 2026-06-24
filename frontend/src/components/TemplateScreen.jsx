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

function TemplateScreen({ gender, onSelect, onBack, apiBase }) {
  const [templates, setTemplates]       = useState([]);
  const [selected, setSelected]         = useState(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError]     = useState('');
  const [hovered, setHovered]           = useState('');

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
        @keyframes ts-selected-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(168,85,247,0)} 50%{box-shadow:0 0 0 6px rgba(168,85,247,0.2)} }

        .ts-glass {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ts-back:hover { background: rgba(255,255,255,0.1); }
        .ts-spin { animation: ts-spin 1.5s linear infinite; }

        /* Template card — vertical single column */
        .ts-card {
          position: relative; border-radius: 20px; overflow: hidden;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
          animation: ts-card-in 0.5s ease-out both;
        }
        .ts-card:hover { transform: translateY(-6px) scale(1.01); }
        .ts-card.selected {
          transform: translateY(-8px) scale(1.012);
          animation: ts-card-in 0.5s ease-out both, ts-selected-pulse 2s ease-in-out infinite;
        }
        .ts-card-img { display: block; width: 100%; transition: transform 0.5s ease; }
        .ts-card:hover .ts-card-img, .ts-card.selected .ts-card-img { transform: scale(1.04); }

        /* Continue bar */
        .ts-bottom-bar { animation: ts-slide-up 0.4s ease-out; }
        .ts-continue:hover:not(:disabled) { box-shadow: 0 24px 40px rgba(168,85,247,0.55); transform: translateY(-3px); }
        .ts-continue:active:not(:disabled) { transform: scale(0.97); }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        background: 'linear-gradient(160deg, #07040e 0%, #120820 30%, #1e0f38 60%, #07040e 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <BoothBackground emojis={[
          { e: '🎨', top: '7%',   left: '5%',   delay: '0s',   size: '40px', opacity: 0.16 },
          { e: '✨', top: '12%',  right: '6%',  delay: '1.2s', size: '32px', opacity: 0.14 },
          { e: '🌟', bottom: '9%', right: '5%', delay: '0.6s', size: '38px', opacity: 0.16 },
          { e: '🖼️', bottom: '20%', left: '5%', delay: '2s',   size: '34px', opacity: 0.12 },
        ]} />

        {/* Back button */}
        <button onClick={onBack} className="ts-back" style={{
          position: 'fixed', top: '24px', left: '24px', zIndex: 20,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px', padding: '10px 18px', color: '#cbd5e1',
          fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          backdropFilter: 'blur(12px)', transition: 'all 0.2s ease',
        }}>← Back</button>

        {/* Scroll area */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '90px 20px', paddingBottom: selected ? '130px' : '60px',
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
              <div style={{ textAlign: 'center', marginBottom: '32px', animation: 'ts-scale-in 0.5s ease-out', width: '100%', maxWidth: '560px' }}>
                <h2 style={{
                  fontSize: '40px', fontWeight: '900', marginBottom: '10px',
                  background: 'linear-gradient(135deg, #a78bfa, #f472b6, #c084fc)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  letterSpacing: '-0.3px',
                }}>Pick Your Look</h2>
                <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: fetchError ? '12px' : 0 }}>
                  Choose a costume & background for your AI portrait
                </p>
                {fetchError && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                    borderRadius: '10px', padding: '6px 14px', color: '#fbbf24', fontSize: '12px',
                    marginBottom: '10px',
                  }}>⚠️ {fetchError}</div>
                )}
                {/* Gender pill */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  marginTop: '16px',
                  background: gender === 'male' ? 'rgba(59,130,246,0.12)' : 'rgba(236,72,153,0.12)',
                  border: `1px solid ${gender === 'male' ? 'rgba(59,130,246,0.3)' : 'rgba(236,72,153,0.3)'}`,
                  borderRadius: '20px', padding: '8px 22px',
                  color: gender === 'male' ? '#93c5fd' : '#f9a8d4',
                  fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase',
                }}>
                  <span>{gender === 'male' ? '👔' : '👗'}</span>
                  {gender} Templates
                </div>
              </div>

              {/* Template list — vertical single column */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                gap: '24px', width: '100%', maxWidth: '560px',
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
                        background: 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(16px)',
                        border: isSelected
                          ? `2px solid ${acc.glow}90`
                          : isHovered
                          ? `1px solid ${acc.glow}50`
                          : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: isSelected
                          ? `0 0 0 1px ${acc.glow}30, 0 28px 56px ${acc.glow}28, inset 0 1px 0 rgba(255,255,255,0.08)`
                          : isHovered
                          ? `0 20px 40px rgba(0,0,0,0.45), 0 0 0 1px ${acc.glow}20`
                          : '0 6px 20px rgba(0,0,0,0.35)',
                      }}
                    >
                      {/* Image area — portrait ratio */}
                      <div style={{
                        position: 'relative', overflow: 'hidden',
                        aspectRatio: '16 / 9',
                        background: `linear-gradient(160deg, ${acc.from}, ${acc.to})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
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

                        {/* Number badge */}
                        <div style={{
                          position: 'absolute', top: '14px', left: '14px',
                          width: '34px', height: '34px', borderRadius: '50%',
                          background: acc.badge, border: `1px solid ${acc.glow}60`,
                          backdropFilter: 'blur(8px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: acc.badgeText, fontSize: '14px', fontWeight: '800',
                        }}>{idx + 1}</div>

                        {/* Selected overlay */}
                        {isSelected && (
                          <div style={{
                            position: 'absolute', inset: 0, display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: `${acc.glow}18`,
                          }}>
                            <div style={{
                              width: '64px', height: '64px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 10px 28px rgba(168,85,247,0.6)',
                              fontSize: '30px', color: '#fff',
                            }}>✓</div>
                          </div>
                        )}

                        {/* Glow edge on selected */}
                        {isSelected && (
                          <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            boxShadow: `inset 0 0 40px ${acc.glow}20`,
                          }} />
                        )}
                      </div>

                      {/* Card footer — name BELOW image */}
                      <div style={{
                        padding: '20px 24px',
                        background: isSelected
                          ? `linear-gradient(135deg, ${acc.from}90, rgba(0,0,0,0.4))`
                          : 'rgba(0,0,0,0.25)',
                        borderTop: `1px solid ${isSelected ? acc.glow + '40' : 'rgba(255,255,255,0.06)'}`,
                        transition: 'all 0.3s ease',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Template name — now below the image */}
                            <p style={{
                              color: isSelected ? '#f1f5f9' : '#e2e8f0',
                              fontSize: '18px', fontWeight: '800', marginBottom: '4px',
                              letterSpacing: '-0.2px',
                            }}>{tpl.name}</p>
                            <p style={{ color: '#64748b', fontSize: '13px' }}>{tpl.backgroundName}</p>
                          </div>
                          <div style={{
                            padding: '10px 18px', borderRadius: '12px', flexShrink: 0,
                            background: isSelected ? 'linear-gradient(135deg, #a855f7, #ec4899)' : acc.badge,
                            border: `1px solid ${isSelected ? 'transparent' : `${acc.glow}50`}`,
                            color: isSelected ? '#fff' : acc.badgeText,
                            fontSize: '13px', fontWeight: '700',
                            transition: 'all 0.3s ease',
                            boxShadow: isSelected ? '0 4px 16px rgba(168,85,247,0.4)' : 'none',
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
            borderTop: '1px solid rgba(255,255,255,0.1)',
            padding: '18px 24px',
            boxShadow: '0 -16px 40px rgba(0,0,0,0.5)',
          }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              {/* Selected preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.35), rgba(236,72,153,0.3))',
                  border: '1px solid rgba(168,85,247,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
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
                  padding: '16px 32px', borderRadius: '16px', border: 'none',
                  background: isSubmitting ? 'rgba(168,85,247,0.5)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                  color: '#fff', fontSize: '16px', fontWeight: '700',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 12px 28px rgba(168,85,247,0.35)',
                  transition: 'all 0.3s ease', flexShrink: 0,
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