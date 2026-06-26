import { useState, useEffect, useMemo, useCallback } from 'react';

function ResultScreen({ generatedImageUrl, capturedImage, onRetake, onRestart, onGetQR, userName, onShare, sessionId }) {
  const [showQRModal, setShowQRModal]   = useState(false);
  const [qrData, setQrData]             = useState(null);
  const [qrLoading, setQrLoading]       = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [imageLoaded, setImageLoaded]   = useState(false);
  const [shareStatus, setShareStatus]   = useState('idle');
  const [shareMessage, setShareMessage] = useState('');
  const [revealed, setRevealed]         = useState(false);

  const imageToShow = generatedImageUrl || capturedImage;

  const sparkles = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`, duration: `${2.5 + Math.random() * 3}s`,
    size: `${1.5 + Math.random() * 4}px`,
  })), []);

  const imageSparkles = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i,
    angle: (i / 16) * 360,
    dist: 50 + Math.random() * 30,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 3,
    color: i % 3 === 0 ? '#a78bfa' : i % 3 === 1 ? '#f472b6' : '#fbbf24',
  })), []);

  const stars = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${1.5 + Math.random() * 2.5}s`,
    size: `${2 + Math.random() * 3}px`,
  })), []);

  const confettiPieces = useMemo(() => Array.from({ length: 55 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`, duration: `${2 + Math.random() * 2}s`,
    color: ['#6366f1','#8b5cf6','#ec4899','#f472b6','#818cf8','#fbbf24','#34d399','#f87171','#a78bfa'][i % 9],
    size: 5 + Math.random() * 8, rotation: Math.random() * 360,
    shape: i % 3,
  })), []);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (imageLoaded) {
      const t = setTimeout(() => setRevealed(true), 200);
      return () => clearTimeout(t);
    }
  }, [imageLoaded]);

  const handleShare = useCallback(async () => {
    if (!sessionId) return;
    setShareStatus('sending'); setShareMessage('');
    try {
      const result = await onShare();
      if (result && result.success) {
        setShareStatus('sent'); setShareMessage('Portrait sent to your email! 📧');
      } else {
        setShareStatus('error'); setShareMessage(result?.error || 'Failed to send email');
      }
    } catch {
      setShareStatus('error'); setShareMessage('Failed to send email. Please try again.');
    }
    setTimeout(() => { setShareStatus('idle'); setShareMessage(''); }, 5000);
  }, [sessionId, onShare]);

  const handleShowQR = useCallback(async () => {
    setShowQRModal(true); setQrLoading(true);
    try { const d = await onGetQR(); if (d) setQrData(d); }
    catch (e) { console.error(e); }
    finally { setQrLoading(false); }
  }, [onGetQR]);

  return (
    <>
      <style>{`
        @keyframes rs-sparkle   { 0%,100%{opacity:0;transform:scale(0) translateY(0)}45%{opacity:1;transform:scale(1) translateY(-30px)}100%{opacity:0;transform:scale(0.6) translateY(-80px)} }
        @keyframes rs-star      { 0%,100%{opacity:0.15;transform:scale(0.8)}50%{opacity:0.9;transform:scale(1.2)} }
        @keyframes rs-confetti  { 0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes rs-float     { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(3deg)} }
        @keyframes rs-float-rev { 0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(14px) rotate(-3deg)} }
        @keyframes rs-scale-in  { 0%{opacity:0;transform:scale(0.93)}100%{opacity:1;transform:scale(1)} }
        @keyframes rs-reveal    { 0%{opacity:0;transform:scale(0.88) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes rs-fade-in   { 0%{opacity:0}100%{opacity:1} }
        @keyframes rs-slide-up  { 0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes rs-spin      { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes rs-glow-ring { 0%,100%{opacity:0.55;transform:scale(1)}50%{opacity:0.9;transform:scale(1.02)} }
        @keyframes rs-img-sparkle { 0%,100%{opacity:0;transform:scale(0)}50%{opacity:1;transform:scale(1)} }
        @keyframes rs-btn-shimmer { 0%{transform:translateX(-100%)}100%{transform:translateX(200%)} }
        @keyframes rs-orb-float { 0%,100%{transform:translate(0,0)}50%{transform:translate(12px,-12px)} }
        @keyframes rs-badge-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}50%{box-shadow:0 0 0 6px rgba(52,211,153,0.15)} }

        .rs-sparkle    { position:absolute;border-radius:50%;pointer-events:none;animation:rs-sparkle 5s ease-out infinite; }
        .rs-star       { position:absolute;border-radius:50%;pointer-events:none;animation:rs-star 2s ease-in-out infinite; }
        .rs-sparkle-wrap { position:absolute;width:100%;height:100%;pointer-events:none; }
        .rs-float      { animation:rs-float 3.5s ease-in-out infinite; }
        .rs-float-rev  { animation:rs-float-rev 4s ease-in-out infinite; }
        .rs-glass      { background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1); }
        .rs-spin       { animation:rs-spin 1.5s linear infinite; }
        .rs-glow-ring  { animation:rs-glow-ring 2.5s ease-in-out infinite; }
        .rs-img-spark  { position:absolute;border-radius:50%;pointer-events:none;animation:rs-img-sparkle 3s ease-in-out infinite; }
        .rs-badge-pulse{ animation:rs-badge-pulse 2s ease-in-out infinite; }

        /* Enhanced buttons */
        .rs-btn-download {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          border: none; border-radius: 16px; padding: 18px 10px;
          cursor: pointer; transition: all 0.3s ease;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          box-shadow: 0 8px 24px rgba(168,85,247,0.35);
          position: relative; overflow: hidden;
        }
        .rs-btn-download::before {
          content:''; position:absolute; inset:0; width:40%;
          background:linear-gradient(to right,transparent,rgba(255,255,255,0.15),transparent);
          animation:rs-btn-shimmer 3s ease-in-out infinite;
        }
        .rs-btn-download:hover { transform:translateY(-4px) scale(1.03);box-shadow:0 20px 40px rgba(168,85,247,0.5); }
        .rs-btn-download:active { transform:scale(0.97); }

        .rs-btn-share {
          border: none; border-radius: 16px; padding: 18px 10px;
          cursor: pointer; transition: all 0.3s ease;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          position: relative; overflow: hidden;
        }
        .rs-btn-share:hover { transform:translateY(-4px) scale(1.03); }
        .rs-btn-share:active { transform:scale(0.97); }

        .rs-btn-sec {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px; padding: 16px 10px;
          cursor: pointer; transition: all 0.25s ease;
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          backdrop-filter: blur(8px);
        }
        .rs-btn-sec:hover { background:rgba(255,255,255,0.1);transform:translateY(-3px);border-color:rgba(255,255,255,0.2); }
        .rs-btn-sec:active { transform:scale(0.97); }

        .rs-back:hover { color:#e2e8f0; background:rgba(255,255,255,0.06); }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem 1rem',
        background: 'linear-gradient(160deg, #07040e 0%, #120820 30%, #1e0f38 60%, #07040e 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        {[
          { size: 400, x: -8, y: 5,  color: '#6366f1', opacity: 0.08, dur: 9 },
          { size: 350, x: 65, y: 55, color: '#ec4899', opacity: 0.07, dur: 11 },
          { size: 250, x: 35, y: -5, color: '#8b5cf6', opacity: 0.08, dur: 8 },
        ].map((o, i) => (
          <div key={i} style={{
            position: 'absolute', width: `${o.size}px`, height: `${o.size}px`,
            left: `${o.x}%`, top: `${o.y}%`, borderRadius: '50%',
            background: o.color, opacity: o.opacity, filter: 'blur(70px)',
            animation: `rs-orb-float ${o.dur}s ease-in-out infinite`,
            animationDelay: `${i * 2}s`, pointerEvents: 'none',
          }} />
        ))}

        {/* Confetti */}
        {showConfetti && (
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50, overflow: 'hidden' }}>
            {confettiPieces.map((p) => (
              <div key={p.id} style={{
                position: 'absolute', top: '-20px', left: p.left,
                width: `${p.size}px`, height: p.shape === 0 ? `${p.size}px` : `${p.size * 1.5}px`,
                background: p.color,
                borderRadius: p.shape === 0 ? '50%' : p.shape === 1 ? '2px' : '1px 4px',
                transform: `rotate(${p.rotation}deg)`,
                animation: `rs-confetti ${p.duration} ease-out ${p.delay} forwards`,
              }} />
            ))}
          </div>
        )}

        {/* Background sparkles */}
        <div className="rs-sparkle-wrap">
          {sparkles.map((s) => (
            <div key={s.id} className="rs-sparkle" style={{
              left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration,
              width: s.size, height: s.size,
              background: s.id % 4 === 0 ? '#6366f1' : s.id % 4 === 1 ? '#8b5cf6' : s.id % 4 === 2 ? '#ec4899' : '#f472b6',
            }} />
          ))}
        </div>

        {/* Star twinkles */}
        {stars.map((s) => (
          <div key={s.id} className="rs-star" style={{
            left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration,
            width: s.size, height: s.size,
            background: s.id % 2 === 0 ? '#a78bfa' : '#f472b6',
            boxShadow: `0 0 ${parseInt(s.size) * 2}px ${s.id % 2 === 0 ? '#a78bfa' : '#f472b6'}`,
          }} />
        ))}

        {/* Floating decorations */}
        {[
          { e: '🎉', top: '8%',  left: '4%',  delay: '0s',   opacity: 0.22 },
          { e: '✨', top: '14%', right: '6%', delay: '1s',   opacity: 0.18, rev: true },
          { e: '🌟', bottom: '12%', right: '5%', delay: '0.5s', opacity: 0.2 },
          { e: '🎊', bottom: '18%', left: '6%', delay: '1.5s', opacity: 0.16, rev: true },
          { e: '💫', top: '45%', left: '2%',  delay: '2s',   opacity: 0.13 },
          { e: '✦',  top: '60%', right: '3%', delay: '3s',   opacity: 0.15, rev: true },
        ].map((d, i) => (
          <div key={i} className={d.rev ? 'rs-float-rev' : 'rs-float'} style={{
            position: 'absolute', fontSize: '38px', opacity: d.opacity,
            userSelect: 'none', pointerEvents: 'none', animationDelay: d.delay,
            top: d.top, left: d.left, right: d.right, bottom: d.bottom,
          }}>{d.e}</div>
        ))}

        <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px', animation: 'rs-fade-in 0.7s ease-out' }}>
            {/* Success badge */}
            <div className="rs-badge-pulse" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
              borderRadius: '20px', padding: '7px 18px', marginBottom: '16px',
              color: '#34d399', fontSize: '13px', fontWeight: '700',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              AI Portrait Ready!
            </div>

            <h2 style={{
              fontSize: '38px', fontWeight: '900', marginBottom: '8px',
              background: 'linear-gradient(135deg, #a78bfa, #f472b6, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Your AI Portrait</h2>

            <p style={{ color: '#94a3b8', fontSize: '15px' }}>
              You look incredible, <span style={{ color: '#f1f5f9', fontWeight: '600' }}>{userName}</span>! 🎉
            </p>
          </div>

          {/* Image card — hero section */}
          <div style={{
            position: 'relative', marginBottom: '24px',
            animation: revealed ? 'rs-reveal 0.8s cubic-bezier(0.34, 1.2, 0.64, 1) both' : 'none',
          }}>
            {/* Animated rotating glow ring */}
            <div className="rs-glow-ring" style={{
              position: 'absolute', inset: '-4px', borderRadius: '24px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899, #f472b6, #6366f1)',
              backgroundSize: '300% 300%',
              filter: 'blur(6px)',
              zIndex: 0,
            }} />

            {/* Second subtle glow layer */}
            <div style={{
              position: 'absolute', inset: '-12px', borderRadius: '28px',
              background: 'radial-gradient(ellipse, rgba(168,85,247,0.25), transparent 70%)',
              zIndex: 0, filter: 'blur(12px)',
            }} />

            <div className="rs-glass" style={{
              position: 'relative', borderRadius: '20px', padding: '10px',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
              zIndex: 1,
            }}>
              {imageToShow ? (
                <>
                  {!imageLoaded && (
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg className="rs-spin" style={{ width: '36px', height: '36px', color: '#a78bfa' }} viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                        <path style={{ opacity: 0.85 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                  <img
                    src={imageToShow}
                    alt="Your AI Portrait"
                    onLoad={() => setImageLoaded(true)}
                    style={{
                      width: '100%', borderRadius: '14px', objectFit: 'contain',
                      maxHeight: '500px', display: imageLoaded ? 'block' : 'none',
                    }}
                  />
                </>
              ) : (
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🖼️</div>
                    <p style={{ color: '#64748b', fontSize: '14px' }}>Image unavailable</p>
                  </div>
                </div>
              )}

              {/* Image sparkles — around the image when revealed */}
              {revealed && imageSparkles.map((s) => (
                <div key={s.id} className="rs-img-spark" style={{
                  width: `${s.size}px`, height: `${s.size}px`,
                  background: s.color,
                  boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
                  top: `${50 + s.dist * Math.sin(s.angle * Math.PI / 180)}%`,
                  left: `${50 + s.dist * Math.cos(s.angle * Math.PI / 180)}%`,
                  transform: 'translate(-50%,-50%)',
                  animationDelay: `${s.delay}s`,
                  animationDuration: `${2.5 + Math.random()}s`,
                }} />
              ))}

              {/* AI badge */}
              {imageLoaded && (
                <div style={{
                  position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)',
                  borderRadius: '20px', padding: '7px 18px', border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', gap: '7px',
                  animation: 'rs-fade-in 0.5s ease-out',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}>
                  <span style={{ fontSize: '12px' }}>✨</span>
                  <span style={{ color: '#a78bfa', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>AI Generated</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', animation: 'rs-slide-up 0.6s ease-out 0.4s both' }}>
            {/* Regenerate */}
            <button onClick={onRetake} className="rs-btn-sec">
              <div style={{ fontSize: '26px', lineHeight: 1 }}>🔄</div>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>Regenerate</span>
            </button>

            {/* QR Code */}
            <button onClick={handleShowQR} className="rs-btn-sec">
              <div style={{ fontSize: '26px', lineHeight: 1 }}>📱</div>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>QR Code</span>
            </button>
          </div>

          {/* Back to home */}
          <div style={{ textAlign: 'center', animation: 'rs-fade-in 0.6s ease-out 0.6s both' }}>
            <button onClick={onRestart} className="rs-back" style={{
              background: 'none', border: 'none', color: '#475569', fontSize: '14px',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px', transition: 'all 0.2s ease',
            }}>
              ← Start over
            </button>
          </div>

          <p style={{ color: '#334155', fontSize: '12px', textAlign: 'center', marginTop: '12px' }}>
            ✦ Powered by AI • Premium Experience ✦
          </p>
        </div>

        {/* QR Modal */}
        {showQRModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div onClick={() => setShowQRModal(false)} style={{
              position: 'absolute', inset: 0,
              background: 'rgba(7,14,30,0.88)', backdropFilter: 'blur(12px)',
              animation: 'rs-fade-in 0.3s ease-out',
            }} />
            <div className="rs-glass" style={{
              position: 'relative', borderRadius: '24px 24px 0 0', padding: '36px 32px 40px',
              width: '100%', maxWidth: '460px',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
              animation: 'rs-slide-up 0.35s ease-out',
            }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', margin: '-12px auto 28px' }} />
              <button onClick={() => setShowQRModal(false)} style={{
                position: 'absolute', top: '20px', right: '20px',
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>✕</button>

              <h3 style={{
                fontSize: '26px', fontWeight: '900', marginBottom: '6px', textAlign: 'center',
                background: 'linear-gradient(to right, #a78bfa, #f472b6)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Scan & Download</h3>
              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginBottom: '28px' }}>
                Point your camera at the QR code 📱
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                {qrLoading ? (
                  <div style={{ width: '200px', height: '200px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg className="rs-spin" style={{ width: '36px', height: '36px', color: '#a78bfa' }} viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                      <path style={{ opacity: 0.85 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : qrData?.qrCode ? (
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    <img src={qrData.qrCode} alt="QR Code" style={{ width: '168px', height: '168px', objectFit: 'contain', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ width: '200px', height: '200px', borderRadius: '16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '40px' }}>📱</div>
                    <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', lineHeight: '1.5', padding: '0 16px' }}>QR unavailable — use download instead</p>
                  </div>
                )}
              </div>

              {qrData?.imageUrl && (
                <div style={{ textAlign: 'center' }}>
                  <a href={qrData.imageUrl} target="_blank" rel="noopener noreferrer" style={{
                    color: '#a78bfa', fontSize: '14px', fontWeight: '600',
                    textDecoration: 'underline', textUnderlineOffset: '4px',
                  }}>Or open link directly →</a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ResultScreen;