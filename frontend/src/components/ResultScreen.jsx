import { useState, useEffect, useMemo, useCallback } from 'react';

function ResultScreen({ generatedImageUrl, capturedImage, onRetake, onRestart, onGetQR, userName }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  const imageToShow = generatedImageUrl || capturedImage;

  // Confetti particles
  const confettiPieces = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${1.5 + Math.random() * 2}s`,
      color: ['#6366f1', '#8b5cf6', '#ec4899', '#f472b6', '#818cf8', '#fbbf24', '#34d399'][i % 7],
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
  }, []);

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = useCallback(() => {
    if (!imageToShow) return;
    const link = document.createElement('a');
    link.href = imageToShow;
    link.download = `ai-photobooth-${userName || 'photo'}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageToShow, userName]);

  const handleShowQR = useCallback(async () => {
    setShowQRModal(true);
    setQrLoading(true);
    try {
      const data = await onGetQR();
      if (data) {
        setQrData(data);
      }
    } catch (err) {
      console.error('QR error:', err);
    } finally {
      setQrLoading(false);
    }
  }, [onGetQR]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 screen-enter relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="absolute top-0"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                animation: `confetti ${piece.duration} ease-out forwards`,
                width: `${piece.size}px`,
                height: `${piece.size * 1.4}px`,
                background: piece.color,
                borderRadius: piece.id % 2 === 0 ? '50%' : '2px',
                transform: `rotate(${piece.rotation}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-2">
            <span className="gradient-text">Your AI Portrait</span>
          </h2>
          <p className="text-text-secondary text-sm">
            Looking amazing, {userName}! 🎉
          </p>
        </div>

        {/* Image card */}
        <div className="relative mb-8 animate-scale-in">
          {/* Glow */}
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent opacity-20 blur-lg animate-pulse-glow" />

          <div className="relative glass-strong rounded-2xl p-3 shadow-2xl shadow-primary/10">
            {imageToShow ? (
              <img
                src={imageToShow}
                alt="Your AI Portrait"
                className="w-full rounded-xl object-contain max-h-[500px]"
              />
            ) : (
              <div className="w-full aspect-square rounded-xl bg-card flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3">🖼️</div>
                  <p className="text-text-muted text-sm">Image unavailable</p>
                </div>
              </div>
            )}

            {/* Premium frame label */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <div className="glass px-4 py-1.5 rounded-full">
                <span className="text-xs text-text-secondary font-medium">✨ AI Generated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {/* Retake */}
          <button
            onClick={onRetake}
            className="glass card-hover px-5 py-4 rounded-xl text-center transition-all duration-300 group"
          >
            <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform duration-300">🔄</div>
            <span className="text-sm font-medium text-text-primary">Generate Again</span>
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="gradient-primary btn-glow px-5 py-4 rounded-xl text-center text-white transition-all duration-300 shadow-lg shadow-primary/25 group"
          >
            <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform duration-300">⬇️</div>
            <span className="text-sm font-semibold">Download</span>
          </button>

          {/* QR Code */}
          <button
            onClick={handleShowQR}
            className="glass card-hover px-5 py-4 rounded-xl text-center transition-all duration-300 group"
          >
            <div className="text-2xl mb-1.5 group-hover:scale-110 transition-transform duration-300">📱</div>
            <span className="text-sm font-medium text-text-primary">Get QR Code</span>
          </button>
        </div>

        {/* Back to home */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={onRestart}
            className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium inline-flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
            Back to Home
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-base/80 backdrop-blur-md animate-fade-in"
            onClick={() => setShowQRModal(false)}
          />

          {/* Modal */}
          <div className="relative glass-strong rounded-3xl p-8 md:p-10 max-w-sm w-full shadow-2xl shadow-primary/20 animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-light transition-all duration-300"
            >
              ✕
            </button>

            <div className="text-center">
              <h3 className="text-2xl font-bold font-heading mb-2">
                <span className="gradient-text">Scan QR Code</span>
              </h3>
              <p className="text-text-secondary text-sm mb-6">
                Scan to download on your phone 📱
              </p>

              {/* QR Code display */}
              <div className="flex justify-center mb-6">
                {qrLoading ? (
                  <div className="w-48 h-48 rounded-2xl bg-surface flex items-center justify-center">
                    <div className="text-center">
                      <svg className="animate-spin-slow h-8 w-8 text-primary mx-auto mb-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-text-muted text-xs">Loading QR...</span>
                    </div>
                  </div>
                ) : qrData?.qrCode ? (
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <img
                      src={qrData.qrCode}
                      alt="QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-surface flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-text-muted text-xs">QR Code unavailable</p>
                      <p className="text-text-muted text-xs mt-1">Use the download button instead</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Download link */}
              {qrData?.imageUrl && (
                <a
                  href={qrData.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-light hover:text-primary text-sm underline underline-offset-4 transition-colors"
                >
                  Or open link directly →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultScreen;
