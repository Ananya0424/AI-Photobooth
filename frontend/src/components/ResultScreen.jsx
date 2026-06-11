import { useState, useEffect, useMemo, useCallback } from 'react';

function ResultScreen({ generatedImageUrl, capturedImage, onRetake, onRestart, onGetQR, userName }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('idle');

  const imageToShow = generatedImageUrl || capturedImage;

  const sparkles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`, duration: `${2 + Math.random() * 3}s`,
    size: `${2 + Math.random() * 4}px`,
  })), []);

  const confettiPieces = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i, left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`, duration: `${1.8 + Math.random() * 1.5}s`,
    color: ['#6366f1','#8b5cf6','#ec4899','#f472b6','#818cf8','#fbbf24','#34d399','#f87171'][i % 8],
    size: 5 + Math.random() * 8, rotation: Math.random() * 360,
    shape: i % 3,
  })), []);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4500);
    return () => clearTimeout(t);
  }, []);

  const handleDownload = useCallback(async () => {
    if (!imageToShow) return;
    setDownloadStatus('downloading');
    try {
      const response = await fetch(imageToShow);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `ai-photobooth-${userName || 'photo'}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      setDownloadStatus('downloaded');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback for base64 images
      const a = document.createElement('a');
      a.href = imageToShow;
      a.download = `ai-photobooth-${userName || 'photo'}-${Date.now()}.jpg`;
      a.target = '_self';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloadStatus('downloaded');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    }
  }, [imageToShow, userName]);

  const handleShowQR = useCallback(async () => {
    setShowQRModal(true); setQrLoading(true);
    try { const d = await onGetQR(); if (d) setQrData(d); }
    catch (e) { console.error(e); }
    finally { setQrLoading(false); }
  }, [onGetQR]);

  return (
    <>
      <style>{`
        @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0) translateY(0)}50%{opacity:1}100%{opacity:0;transform:scale(1) translateY(-80px)} }
        @keyframes confetti { 0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)} }
        @keyframes scale-in { 0%{opacity:0;transform:scale(0.93)}100%{opacity:1;transform:scale(1)} }
        @keyframes fade-in { 0%{opacity:0}100%{opacity:1} }
        @keyframes slide-up { 0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes spin-slow { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes glow-pulse { 0%,100%{opacity:0.5}50%{opacity:0.8} }
        .rs-sparkle { position:absolute;border-radius:50%;pointer-events:none;animation:sparkle 4s ease-out infinite; }
        .rs-sparkle-wrap { position:absolute;width:100%;height:100%;pointer-events:none; }
        .rs-float { animation:float 3s ease-in-out infinite; }
        .rs-glass {
          background:rgba(255,255,255,0.05);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.1);
        }
        .rs-spin { animation:spin-slow 1.5s linear infinite; }
        .rs-glow { animation:glow-pulse 2.5s ease-in-out infinite; }
        .rs-btn-dl:hover { box-shadow:0 20px 40px rgba(168,85,247,0.5);transform:translateY(-3px) scale(1.02); }
        .rs-btn-dl:active { transform:scale(0.97); }
        .rs-btn-sec:hover { background:rgba(255,255,255,0.1);transform:translateY(-2px); }
        .rs-btn-sec:active { transform:scale(0.97); }
        .rs-back:hover { color:#e2e8f0; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem 1rem',
        background: 'linear-gradient(to bottom right, #0f172a, #2d1b4e, #0f172a)',
        position: 'relative', overflow: 'hidden',
      }}>
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
                animation: `confetti ${p.duration} ease-out ${p.delay} forwards`,
              }} />
            ))}
          </div>
        )}

        {/* Sparkles */}
        <div className="rs-sparkle-wrap">
          {sparkles.map((s) => (
            <div key={s.id} className="rs-sparkle" style={{
              left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration,
              width: s.size, height: s.size,
              background: s.id % 3 === 0 ? '#6366f1' : s.id % 3 === 1 ? '#8b5cf6' : '#ec4899',
            }} />
          ))}
        </div>

        {/* Floating decorations */}
        {[
          { e: '🎉', top: '70px', left: '35px', delay: '0s', opacity: 0.2 },
          { e: '✨', top: '110px', right: '50px', delay: '1s', opacity: 0.18 },
          { e: '🌟', bottom: '100px', right: '40px', delay: '0.5s', opacity: 0.2 },
          { e: '🎊', bottom: '130px', left: '55px', delay: '1.5s', opacity: 0.15 },
        ].map((d, i) => (
          <div key={i} className="rs-float" style={{
            position: 'absolute', fontSize: '40px', opacity: d.opacity, userSelect: 'none',
            pointerEvents: 'none', animationDelay: d.delay,
            top: d.top, left: d.left, right: d.right, bottom: d.bottom,
          }}>{d.e}</div>
        ))}

        <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px', animation: 'fade-in 0.6s ease-out' }}>
            {/* Success badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)',
              borderRadius: '20px', padding: '6px 16px', marginBottom: '16px',
              color: '#34d399', fontSize: '13px', fontWeight: '600',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#34d399' }} />
              AI Portrait Ready!
            </div>

            <h2 style={{
              fontSize: '36px', fontWeight: '900', marginBottom: '8px',
              background: 'linear-gradient(to right, #a78bfa, #f472b6, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Your AI Portrait</h2>
            <p style={{ color: '#94a3b8', fontSize: '15px' }}>
              You look incredible, <span style={{ color: '#f1f5f9', fontWeight: '600' }}>{userName}</span>! 🎉
            </p>
          </div>

          {/* Image card */}
          <div style={{ position: 'relative', marginBottom: '24px', animation: 'scale-in 0.7s ease-out' }}>
            {/* Animated glow */}
            <div className="rs-glow" style={{
              position: 'absolute', inset: '-3px', borderRadius: '22px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899, #6366f1)',
              backgroundSize: '300% 300%',
              filter: 'blur(4px)',
            }} />

            <div className="rs-glass" style={{ position: 'relative', borderRadius: '20px', padding: '10px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
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

              {/* AI badge */}
              {imageLoaded && (
                <div style={{
                  position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(12px)',
                  borderRadius: '20px', padding: '6px 16px', border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  animation: 'fade-in 0.5s ease-out',
                }}>
                  <span style={{ fontSize: '12px' }}>✨</span>
                  <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '500', whiteSpace: 'nowrap' }}>AI Generated</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '12px', marginBottom: '20px', animation: 'slide-up 0.6s ease-out 0.3s both' }}>
            {/* Regenerate */}
            <button onClick={onRetake} className="rs-btn-sec" style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '16px 10px', cursor: 'pointer',
              transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '8px',
            }}>
              <div style={{ fontSize: '26px', lineHeight: 1 }}>🔄</div>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>Regenerate</span>
            </button>

            {/* Download — Primary */}
            <button onClick={handleDownload} disabled={downloadStatus === 'downloading'} className="rs-btn-dl" style={{
              background: downloadStatus === 'downloaded' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
              border: 'none',
              borderRadius: '16px', padding: '18px 10px', cursor: downloadStatus === 'downloading' ? 'wait' : 'pointer',
              transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '8px',
              boxShadow: downloadStatus === 'downloaded' ? '0 12px 30px rgba(34,197,94,0.35)' : '0 12px 30px rgba(168,85,247,0.35)',
              opacity: downloadStatus === 'downloading' ? 0.85 : 1,
            }}>
              <div style={{ fontSize: '28px', lineHeight: 1 }}>
                {downloadStatus === 'downloading' ? (
                  <svg className="rs-spin" style={{ width: '28px', height: '28px', color: '#fff' }} viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                    <path style={{ opacity: 0.85 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : downloadStatus === 'downloaded' ? '✅' : '⬇️'}
              </div>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700' }}>
                {downloadStatus === 'downloading' ? 'Downloading...' : downloadStatus === 'downloaded' ? 'Downloaded ✓' : 'Download'}
              </span>
            </button>

            {/* QR Code */}
            <button onClick={handleShowQR} className="rs-btn-sec" style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px', padding: '16px 10px', cursor: 'pointer',
              transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '8px',
            }}>
              <div style={{ fontSize: '26px', lineHeight: 1 }}>📱</div>
              <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>QR Code</span>
            </button>
          </div>

          {/* Back to home */}
          <div style={{ textAlign: 'center', animation: 'fade-in 0.6s ease-out 0.5s both' }}>
            <button onClick={onRestart} className="rs-back" style={{
              background: 'none', border: 'none', color: '#475569', fontSize: '14px',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '10px', transition: 'all 0.2s ease',
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
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}>
            {/* Backdrop */}
            <div
              onClick={() => setShowQRModal(false)}
              style={{
                position: 'absolute', inset: 0,
                background: 'rgba(7,14,30,0.85)', backdropFilter: 'blur(12px)',
                animation: 'fade-in 0.3s ease-out',
              }}
            />
            {/* Sheet */}
            <div className="rs-glass" style={{
              position: 'relative', borderRadius: '24px 24px 0 0', padding: '36px 32px 40px',
              width: '100%', maxWidth: '460px',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
              animation: 'slide-up 0.35s ease-out',
            }}>
              {/* Handle bar */}
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)', margin: '-12px auto 28px' }} />

              {/* Close */}
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

              {/* QR area */}
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
