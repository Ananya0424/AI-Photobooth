import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import Webcam from 'react-webcam';
import BoothBackground, { boothStyles } from './BoothBackground';

const videoConstraints = { width: 720, height: 720, facingMode: 'user' };

function CameraScreen({ onCapture, onBack, userName, selectedTemplate }) {
  const webcamRef = useRef(null);
  const [countdown, setCountdown]       = useState(null);
  const [showFlash, setShowFlash]       = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError]   = useState('');
  const [hasPermission, setHasPermission] = useState(true);

  const handleUserMedia      = useCallback(() => { setIsCameraReady(true); setHasPermission(true); setCameraError(''); }, []);
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
        // Pass selectedTemplate through alongside the photo — previously this was
        // dropped here because CameraScreen never received or forwarded it.
        console.log('🟢 [CameraScreen] Capturing photo, forwarding selectedTemplate:', selectedTemplate);
        setTimeout(() => onCapture(imageSrc, selectedTemplate), 300);
      }
    }
  }, [onCapture, selectedTemplate]);

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
        ${boothStyles}
        @keyframes cs-scale-in     { 0%{opacity:0;transform:scale(0.92)} 100%{opacity:1;transform:scale(1)} }
        @keyframes cs-spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes cs-flash        { 0%{opacity:0} 20%{opacity:1} 100%{opacity:0} }
        @keyframes cs-countdown    { 0%{opacity:0;transform:scale(2)} 30%{opacity:1;transform:scale(1)} 80%{opacity:1} 100%{opacity:0;transform:scale(0.8)} }
        @keyframes cs-pulse-ring   { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(1.3);opacity:0} }
        @keyframes cs-scan-cam     { 0%{top:0} 100%{top:100%} }
        @keyframes cs-corner-blink { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes cs-live-blink   { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes cs-orbit-ring   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes cs-ready-glow   { 0%,100%{box-shadow:0 0 20px rgba(168,85,247,0.3)} 50%{box-shadow:0 0 40px rgba(168,85,247,0.7),0 0 80px rgba(236,72,153,0.3)} }

        .cs-glass {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .cs-flash-overlay { position:fixed;inset:0;background:#fff;pointer-events:none;z-index:100;animation:cs-flash 0.4s ease-out forwards; }
        .cs-spin { animation:cs-spin 1.5s linear infinite; }
        .cs-pulse-ring  { position:absolute;inset:-10px;border-radius:50%;border:2px solid rgba(168,85,247,0.55);animation:cs-pulse-ring 1.5s ease-out infinite; pointer-events:none; }
        .cs-pulse-ring2 { position:absolute;inset:-20px;border-radius:50%;border:1px solid rgba(168,85,247,0.28);animation:cs-pulse-ring 1.5s ease-out 0.5s infinite; pointer-events:none; }
        .cs-back:hover { background:rgba(255,255,255,0.1); }
        .cs-btn-cap:hover { transform:scale(1.08); }
        .cs-btn-cap:active { transform:scale(0.94); }

        /* Camera scan line */
        .cs-scan-cam {
          position:absolute; left:0; right:0; height:2px; pointer-events:none; z-index:5;
          background:linear-gradient(to right, transparent, rgba(139,92,246,0.7), rgba(236,72,153,0.5), transparent);
          animation: cs-scan-cam 3s linear infinite;
          box-shadow: 0 0 8px rgba(139,92,246,0.5);
        }
        .cs-live-dot { animation: cs-live-blink 1.5s ease-in-out infinite; }
        .cs-orbit { animation: cs-orbit-ring 8s linear infinite; }
        .cs-ready { animation: cs-ready-glow 2s ease-in-out infinite; }

        /* Camera frame corners */
        .cs-cam-corner {
          position:absolute; width:32px; height:32px; pointer-events:none;
          animation: cs-corner-blink 2s ease-in-out infinite;
        }
      `}</style>

      {showFlash && <div className="cs-flash-overlay" />}

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', background: 'linear-gradient(160deg, #07040e 0%, #120820 30%, #1e0f38 60%, #07040e 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <BoothBackground emojis={[
          { e: '📸', top: '7%',   left: '5%',   delay: '0s',   size: '40px', opacity: 0.16 },
          { e: '🎯', top: '12%',  right: '6%',  delay: '1s',   size: '34px', opacity: 0.13 },
          { e: '✨', bottom: '9%', left: '6%',  delay: '2s',   size: '28px', opacity: 0.14 },
          { e: '🌟', bottom: '13%', right: '5%', delay: '0.5s', size: '36px', opacity: 0.16 },
        ]} />

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

        <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10 }}>
          {/* Outer glow when camera ready */}
          {canCapture && (
            <div style={{
              position: 'absolute', inset: '-3px', borderRadius: '27px',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(236,72,153,0.3))',
              filter: 'blur(2px)', opacity: 0.5,
            }} />
          )}

          <div className="cs-glass" style={{
            borderRadius: '24px', padding: '36px 36px 32px', position: 'relative',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
            animation: 'cs-scale-in 0.6s ease-out',
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ color: '#a78bfa', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>
                Ready, <span style={{ color: '#f472b6' }}>{userName}</span>? 😊
              </p>
              <h2 style={{
                fontSize: '34px', fontWeight: '900', marginBottom: '8px',
                background: 'linear-gradient(135deg, #a78bfa, #f472b6, #c084fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Strike a Pose!</h2>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Look at the camera and tap capture</p>
            </div>

            {/* Camera viewport */}
            <div style={{ position: 'relative', marginBottom: '28px' }}>
              {/* Glow border ring */}
              <div style={{
                position: 'absolute', inset: '-2px', borderRadius: '18px',
                background: canCapture
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899, #6366f1)'
                  : 'rgba(255,255,255,0.07)',
                transition: 'opacity 0.4s ease', opacity: canCapture ? 0.85 : 0.3,
              }} />

              {/* Orbit decoration ring */}
              {canCapture && (
                <div className="cs-orbit" style={{
                  position: 'absolute', inset: '-14px', borderRadius: '22px',
                  border: '1px dashed rgba(139,92,246,0.25)',
                  pointerEvents: 'none',
                }} />
              )}

              <div style={{
                position: 'relative', borderRadius: '16px', overflow: 'hidden',
                background: '#0f172a', aspectRatio: '1',
              }}>
                {hasPermission ? (
                  <Webcam
                    ref={webcamRef} audio={false}
                    screenshotFormat="image/jpeg" screenshotQuality={0.92}
                    videoConstraints={videoConstraints} mirrored={true}
                    onUserMedia={handleUserMedia} onUserMediaError={handleUserMediaError}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
                    <div style={{ textAlign: 'center', padding: '32px' }}>
                      <div style={{ fontSize: '52px', marginBottom: '16px' }}>📷</div>
                      <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '8px', fontWeight: '600' }}>Camera access required</p>
                      <p style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.6' }}>{cameraError}</p>
                    </div>
                  </div>
                )}

                {/* Loading overlay */}
                {!isCameraReady && hasPermission && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: 'rgba(15,23,42,0.88)', backdropFilter: 'blur(8px)',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <svg className="cs-spin" style={{ width: '40px', height: '40px', color: '#a78bfa', margin: '0 auto 14px' }} viewBox="0 0 24 24">
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
                    background: 'rgba(15,23,42,0.78)', backdropFilter: 'blur(4px)',
                  }}>
                    <div key={countdown} style={{ animation: 'cs-countdown 1s ease-out forwards' }}>
                      <span style={{
                        fontSize: '130px', fontWeight: '900', lineHeight: 1, color: '#fff',
                        textShadow: '0 0 40px rgba(168,85,247,0.9), 0 0 100px rgba(236,72,153,0.5)',
                      }}>{countdown}</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', marginTop: '10px', letterSpacing: '4px', textTransform: 'uppercase' }}>
                      Get ready...
                    </p>
                  </div>
                )}

                {/* AI scan line — only when camera active */}
                {isCameraReady && countdown === null && (
                  <div className="cs-scan-cam" />
                )}

                {/* Camera frame corners */}
                {isCameraReady && (
                  <>
                    {[
                      { top: '14px',   left: '14px',   borderTop:    '2.5px solid rgba(255,255,255,0.6)', borderLeft:   '2.5px solid rgba(255,255,255,0.6)', borderRadius: '5px 0 0 0' },
                      { top: '14px',   right: '14px',  borderTop:    '2.5px solid rgba(255,255,255,0.6)', borderRight:  '2.5px solid rgba(255,255,255,0.6)', borderRadius: '0 5px 0 0' },
                      { bottom: '14px', left: '14px',  borderBottom: '2.5px solid rgba(255,255,255,0.6)', borderLeft:   '2.5px solid rgba(255,255,255,0.6)', borderRadius: '0 0 0 5px' },
                      { bottom: '14px', right: '14px', borderBottom: '2.5px solid rgba(255,255,255,0.6)', borderRight:  '2.5px solid rgba(255,255,255,0.6)', borderRadius: '0 0 5px 0' },
                    ].map((s, i) => (
                      <div key={i} className="cs-cam-corner" style={{ animationDelay: `${i * 0.45}s`, ...s }} />
                    ))}

                    {/* Face guide oval */}
                    <div style={{
                      position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
                      width: '52%', height: '56%', borderRadius: '50%',
                      border: '1.5px dashed rgba(255,255,255,0.18)',
                      pointerEvents: 'none',
                    }} />

                    {/* LIVE badge */}
                    <div style={{
                      position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.65)', borderRadius: '20px', padding: '4px 12px',
                      display: 'flex', alignItems: 'center', gap: '7px', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      <div className="cs-live-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 7px #ef444490' }} />
                      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px' }}>LIVE</span>
                    </div>

                    {/* AI label */}
                    <div style={{
                      position: 'absolute', bottom: '12px', right: '12px',
                      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                      borderRadius: '8px', padding: '4px 10px',
                      border: '1px solid rgba(139,92,246,0.3)',
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                      <span style={{ color: '#a78bfa', fontSize: '10px', fontWeight: '700', letterSpacing: '1px' }}>AI READY</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Capture button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <button
                onClick={startCountdown} disabled={!canCapture}
                className={canCapture ? 'cs-btn-cap' : ''}
                style={{
                  position: 'relative', width: '88px', height: '88px', borderRadius: '50%',
                  background: 'none', border: 'none',
                  cursor: canCapture ? 'pointer' : 'not-allowed',
                  opacity: canCapture ? 1 : 0.4, transition: 'transform 0.2s ease',
                }}
              >
                {canCapture && <><div className="cs-pulse-ring" /><div className="cs-pulse-ring2" /></>}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '4px solid rgba(255,255,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div className={canCapture ? 'cs-ready' : ''} style={{
                    width: '62px', height: '62px', borderRadius: '50%',
                    background: canCapture ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '26px', transition: 'all 0.3s ease',
                  }}>📸</div>
                </div>
              </button>

              <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', letterSpacing: '0.3px' }}>
                {countdown !== null ? '😄 Smile!' : !hasPermission ? 'Enable camera to continue' : !isCameraReady ? 'Camera loading...' : 'Tap to start 3-second countdown'}
              </p>
            </div>
          </div>

          <p style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '16px', letterSpacing: '0.5px' }}>
            ✦ POWERED BY AI  ·  PREMIUM EXPERIENCE ✦
          </p>
        </div>
      </div>
    </>
  );
}

export default CameraScreen;