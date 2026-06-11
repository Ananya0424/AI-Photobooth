import { useState, useEffect, useMemo } from 'react';

const steps = [
  { text: 'Analyzing your features', emoji: '🔍', sub: 'Face detection running...' },
  { text: 'Applying your costume', emoji: '👔', sub: 'Dressing you up...' },
  { text: 'Rendering the background', emoji: '🎨', sub: 'Painting the scene...' },
  { text: 'Adding lighting & effects', emoji: '💡', sub: 'Setting the mood...' },
  { text: 'Final polish', emoji: '✨', sub: 'Almost done...' },
];

function LoadingScreen({ userName }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStepIdx((p) => (p + 1) % steps.length), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setProgress((p) => p >= 90 ? 90 : p + Math.random() * 7 + 2), 750);
    return () => clearInterval(t);
  }, []);

  const sparkles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`, duration: `${2 + Math.random() * 3}s`,
    size: `${2 + Math.random() * 4}px`,
  })), []);

  const orbs = useMemo(() => [
    { size: 300, x: -5, y: 10, color: '#6366f1', opacity: 0.07, dur: 8 },
    { size: 250, x: 70, y: 60, color: '#ec4899', opacity: 0.06, dur: 10 },
    { size: 200, x: 40, y: -10, color: '#8b5cf6', opacity: 0.07, dur: 7 },
  ], []);

  const cur = steps[stepIdx];

  return (
    <>
      <style>{`
        @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0) translateY(0)}50%{opacity:1}100%{opacity:0;transform:scale(1) translateY(-80px)} }
        @keyframes float-orb { 0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-20px)} }
        @keyframes scale-in { 0%{opacity:0;transform:scale(0.93)}100%{opacity:1;transform:scale(1)} }
        @keyframes spin-a { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes spin-b { from{transform:rotate(0deg)}to{transform:rotate(-360deg)} }
        @keyframes fade-up { 0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{transform:translateX(-100%)}100%{transform:translateX(200%)} }
        @keyframes dot-bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)} }
        .ls-sparkle { position:absolute;border-radius:50%;pointer-events:none;animation:sparkle 4s ease-out infinite; }
        .ls-sparkle-wrap { position:absolute;width:100%;height:100%;pointer-events:none; }
        .ls-glass {
          background:rgba(255,255,255,0.05);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.1);
        }
        .ls-ring-a { animation:spin-a 2s linear infinite; }
        .ls-ring-b { animation:spin-b 3s linear infinite; }
        .ls-fade-up { animation:fade-up 0.5s ease-out both; }
        .ls-shimmer { animation:shimmer 2s ease-in-out infinite; }
        .ls-dot { animation:dot-bounce 1.2s ease-in-out infinite; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'linear-gradient(to bottom right, #0f172a, #2d1b4e, #0f172a)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        {orbs.map((o, i) => (
          <div key={i} style={{
            position: 'absolute', width: `${o.size}px`, height: `${o.size}px`,
            left: `${o.x}%`, top: `${o.y}%`, borderRadius: '50%',
            background: o.color, opacity: o.opacity, filter: 'blur(60px)',
            animation: `float-orb ${o.dur}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`, pointerEvents: 'none',
          }} />
        ))}

        {/* Sparkles */}
        <div className="ls-sparkle-wrap">
          {sparkles.map((s) => (
            <div key={s.id} className="ls-sparkle" style={{
              left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration,
              width: s.size, height: s.size,
              background: s.id % 3 === 0 ? '#6366f1' : s.id % 3 === 1 ? '#8b5cf6' : '#ec4899',
            }} />
          ))}
        </div>

        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
          <div className="ls-glass" style={{
            borderRadius: '24px', padding: '44px 36px 40px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            animation: 'scale-in 0.6s ease-out',
            textAlign: 'center',
          }}>
            {/* Spinner */}
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 32px' }}>
              {/* Track */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.06)' }} />
              {/* Outer ring */}
              <div className="ls-ring-a" style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: '#a855f7', borderRightColor: '#ec4899',
              }} />
              {/* Inner ring */}
              <div className="ls-ring-b" style={{
                position: 'absolute', inset: '12px', borderRadius: '50%',
                border: '2px solid transparent',
                borderBottomColor: '#818cf8', borderLeftColor: '#f472b6',
              }} />
              {/* Emoji center */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span key={stepIdx} className="ls-fade-up" style={{ fontSize: '28px' }}>{cur.emoji}</span>
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '28px', fontWeight: '900', marginBottom: '8px',
              background: 'linear-gradient(to right, #a78bfa, #f472b6, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Creating your portrait</h2>

            <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '30px' }}>
              Hang tight, <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{userName}</span>! Magic is happening ✨
            </p>

            {/* Current step card */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px', padding: '14px 20px', marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(236,72,153,0.3))',
                border: '1px solid rgba(168,85,247,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
              }}>{cur.emoji}</div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <p key={`t-${stepIdx}`} className="ls-fade-up" style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                  {cur.text}
                </p>
                <p key={`s-${stepIdx}`} className="ls-fade-up" style={{ color: '#64748b', fontSize: '12px' }}>
                  {cur.sub}
                </p>
              </div>
              {/* Dots */}
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {[0,1,2].map(i => (
                  <div key={i} className="ls-dot" style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: '#a78bfa', animationDelay: `${i * 0.15}s`,
                  }} />
                ))}
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Processing</span>
              <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '600' }}>{Math.round(Math.min(progress, 100))}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                background: 'linear-gradient(to right, #a855f7, #ec4899)',
                width: `${Math.min(progress, 100)}%`,
                transition: 'width 0.7s ease',
                position: 'relative', overflow: 'hidden',
              }}>
                <div className="ls-shimmer" style={{
                  position: 'absolute', inset: 0, width: '40%',
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent)',
                }} />
              </div>
            </div>

            {/* Step dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {steps.map((_, i) => (
                <div key={i} style={{
                  width: i === stepIdx ? '24px' : '8px', height: '8px', borderRadius: '4px',
                  background: i === stepIdx ? '#a855f7' : i < stepIdx ? '#6366f1' : 'rgba(255,255,255,0.1)',
                  transition: 'all 0.4s ease',
                  boxShadow: i === stepIdx ? '0 0 10px rgba(168,85,247,0.6)' : 'none',
                }} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <span style={{ fontSize: '14px' }}>💡</span>
            <p style={{ color: '#475569', fontSize: '12px' }}>Every AI portrait is completely unique</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoadingScreen;
