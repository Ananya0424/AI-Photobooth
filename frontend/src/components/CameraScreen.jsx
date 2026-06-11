import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = { width: 720, height: 720, facingMode: 'user' };

function CameraScreen({ onCapture, onBack, userName }) {
  const webcamRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [hasPermission, setHasPermission] = useState(true);

  const sparkles = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${2 + Math.random() * 3}s`,
    size: `${2 + Math.random() * 3}px`,
  })), []);

  const handleUserMedia = useCallback(() => { setIsCameraReady(true); setHasPermission(true); setCameraError(''); }, []);
  const handleUserMediaError = useCallback((err) => {
    console.error('Camera error:', err);
    setHasPermission(false);
    setCameraError('Camera access denied. Please allow camera permissions and reload.');
  }, []);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 400);
        setTimeout(() => onCapture(imageSrc), 300);
      }
    }
  }, [onCapture]);

  const startCountdown = useCallback(() => {
    if (countdown !== null) return;
    setCountdown(3);
  }, [countdown]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { capturePhoto(); setCountdown(null); return; }
    const t = setTimeout(() => setCountdown((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, capturePhoto]);

  const canCapture = isCameraReady && countdown === null && hasPermission;

  return (
    <>
      <style>{`
        @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0) translateY(0)}50%{opacity:1}100%{opacity:0;transform:scale(1) translateY(-80px)} }
        @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)} }
        @keyframes scale-in { 0%{opacity:0;transform:scale(0.92)}100%{opacity:1;transform:scale(1)} }
        @keyframes spin-slow { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes camera-flash { 0%{opacity:0}20%{opacity:1}100%{opacity:0} }
        @keyframes countdown-pop { 0%{opacity:0;transform:scale(2)}30%{opacity:1;transform:scale(1)}80%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(0.8)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6}100%{transform:scale(1.25);opacity:0} }
        .cs-sparkle { position:absolute;border-radius:50%;pointer-events:none;animation:sparkle 4s ease-out infinite; }
        .cs-sparkle-wrap { position:absolute;width:100%;height:100%;pointer-events:none; }
        .cs-float { animation:float 3s ease-in-out infinite; }
        .cs-flash { position:fixed;inset:0;background:#fff;pointer-events:none;z-index:100;animation:camera-flash 0.4s ease-out forwards; }
        .cs-spin { animation:spin-slow 1.5s linear infinite; }
        .cs-glass {
          background:rgba(255,255,255,0.05);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.1);
        }
        .cs-back:hover { background:rgba(255,255,255,0.1); }
        .cs-btn-ready:hover { transform:scale(1.06); }
        .cs-btn-ready:active { transform:scale(0.96); }
        .cs-pulse-ring { position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(168,85,247,0.5);animation:pulse-ring 1.5s ease-out infinite; }
        .cs-pulse-ring-2 { position:absolute;inset:-16px;border-radius:50%;border:1px solid rgba(168,85,247,0.25);animation:pulse-ring 1.5s ease-out 0.5s infinite; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'linear-gradient(to bottom right, #0f172a, #2d1b4e, #0f172a)',
        position: 'relative', overflow: 'hidden',
      }}>
        {showFlash && <div className="cs-flash" />}

        {/* Sparkles */}
        <div className="cs-sparkle-wrap">
          {sparkles.map((s) => (
            <div key={s.id} className="cs-sparkle" style={{
              left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration,
              width: s.size, height: s.size,
              background: s.id % 3 === 0 ? '#6366f1' : s.id % 3 === 1 ? '#8b5cf6' : '#ec4899',
            }} />
          ))}
        </div>

        {/* Floating emojis */}
        {[
          { e: '📸', top: '70px', left: '35px', delay: '0s', opacity: 0.2 },
          { e: '🎯', top: '110px', right: '50px', delay: '1s', opacity: 0.15 },
          { e: '✨', bottom: '100px', left: '55px', delay: '2s', opacity: 0.15 },
          { e: '🌟', bottom: '130px', right: '40px', delay: '0.5s', opacity: 0.2 },
        ].map((d, i) => (
          <div key={i} className="cs-float" style={{
            position: 'absolute', fontSize: '40px', opacity: d.opacity, userSelect: 'none',
            pointerEvents: 'none', animationDelay: d.delay,
            top: d.top, left: d.left, right: d.right, bottom: d.bottom,
          }}>{d.e}</div>
        ))}

        {/* Back button */}
        <button onClick={onBack} disabled={countdown !== null} className="cs-back" style={{
          position: 'fixed', top: '24px', left: '24px', zIndex: 20,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px', padding: '10px 18px', color: '#cbd5e1',
          fontSize: '14px', fontWeight: '500', cursor: countdown !== null ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px',
          backdropFilter: 'blur(12px)', transition: 'all 0.2s ease',
          opacity: countdown !== null ? 0.4 : 1,
        }}>← Back</button>

        {/* Main card */}
        <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 10 }}>
          <div className="cs-glass" style={{
            borderRadius: '24px', padding: '36px 36px 32px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            animation: 'scale-in 0.6s ease-out',
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ color: '#a78bfa', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>
                Ready, <span style={{ color: '#f472b6' }}>{userName}</span>? 😊
              </p>
              <h2 style={{
                fontSize: '32px', fontWeight: '900', marginBottom: '8px',
                background: 'linear-gradient(to right, #a78bfa, #f472b6, #c084fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Strike a Pose!</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>Look at the camera and click capture</p>
            </div>

            {/* Camera viewport */}
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              {/* Glow border */}
              <div style={{
                position: 'absolute', inset: '-2px', borderRadius: '18px',
                background: canCapture
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)'
                  : 'rgba(255,255,255,0.08)',
                padding: '2px',
                transition: 'opacity 0.4s ease',
                opacity: canCapture ? 0.8 : 0.3,
              }} />

              <div style={{
                position: 'relative', borderRadius: '16px', overflow: 'hidden',
                background: '#0f172a', aspectRatio: '1',
              }}>
                {hasPermission ? (
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    screenshotQuality={0.92}
                    videoConstraints={videoConstraints}
                    mirrored={true}
                    onUserMedia={handleUserMedia}
                    onUserMediaError={handleUserMediaError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
                    <div style={{ textAlign: 'center', padding: '32px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
                      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>Camera access required</p>
                      <p style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.6' }}>{cameraError}</p>
                    </div>
                  </div>
                )}

                {/* Loading overlay */}
                {!isCameraReady && hasPermission && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <svg className="cs-spin" style={{ width: '36px', height: '36px', color: '#a78bfa', margin: '0 auto 12px' }} viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                        <path style={{ opacity: 0.85 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p style={{ color: '#94a3b8', fontSize: '14px' }}>Starting camera...</p>
                    </div>
                  </div>
                )}

                {/* Countdown overlay */}
                {countdown !== null && countdown > 0 && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)',
                  }}>
                    <div key={countdown} style={{ animation: 'countdown-pop 1s ease-out forwards' }}>
                      <span style={{
                        fontSize: '120px', fontWeight: '900', lineHeight: 1, color: '#fff',
                        textShadow: '0 0 40px rgba(168,85,247,0.9), 0 0 80px rgba(236,72,153,0.5)',
                      }}>{countdown}</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', marginTop: '8px', letterSpacing: '3px', textTransform: 'uppercase' }}>
                      Get ready...
                    </p>
                  </div>
                )}

                {/* Corner guides */}
                {isCameraReady && (
                  <>
                    {[
                      { top: '16px', left: '16px', borderTop: '2px solid rgba(255,255,255,0.45)', borderLeft: '2px solid rgba(255,255,255,0.45)', borderRadius: '6px 0 0 0' },
                      { top: '16px', right: '16px', borderTop: '2px solid rgba(255,255,255,0.45)', borderRight: '2px solid rgba(255,255,255,0.45)', borderRadius: '0 6px 0 0' },
                      { bottom: '16px', left: '16px', borderBottom: '2px solid rgba(255,255,255,0.45)', borderLeft: '2px solid rgba(255,255,255,0.45)', borderRadius: '0 0 0 6px' },
                      { bottom: '16px', right: '16px', borderBottom: '2px solid rgba(255,255,255,0.45)', borderRight: '2px solid rgba(255,255,255,0.45)', borderRadius: '0 0 6px 0' },
                    ].map((s, i) => (
                      <div key={i} style={{ position: 'absolute', width: '28px', height: '28px', ...s }} />
                    ))}
                    {/* LIVE dot */}
                    <div style={{
                      position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.6)', borderRadius: '20px', padding: '4px 10px',
                      display: 'flex', alignItems: 'center', gap: '6px', backdropFilter: 'blur(8px)',
                    }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef444480' }} />
                      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: '600', letterSpacing: '1px' }}>LIVE</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Capture button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <button
                onClick={startCountdown}
                disabled={!canCapture}
                className={canCapture ? 'cs-btn-ready' : ''}
                style={{
                  position: 'relative', width: '80px', height: '80px', borderRadius: '50%',
                  background: 'none', border: 'none', cursor: canCapture ? 'pointer' : 'not-allowed',
                  opacity: canCapture ? 1 : 0.45, transition: 'transform 0.2s ease',
                }}
              >
                {canCapture && <><div className="cs-pulse-ring" /><div className="cs-pulse-ring-2" /></>}
                {/* Outer white ring */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '4px solid rgba(255,255,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {/* Inner gradient circle */}
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: canCapture
                      ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                      : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px',
                    boxShadow: canCapture ? '0 8px 24px rgba(168,85,247,0.5)' : 'none',
                    transition: 'all 0.3s ease',
                  }}>📸</div>
                </div>
              </button>

              <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', letterSpacing: '0.3px' }}>
                {countdown !== null ? '😄 Smile!' : !hasPermission ? 'Enable camera to continue' : !isCameraReady ? 'Camera loading...' : 'Tap to start 3-second countdown'}
              </p>
            </div>
          </div>

          <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
            ✦ Powered by AI • Premium Experience ✦
          </p>
        </div>
      </div>
    </>
  );
}

export default CameraScreen;
