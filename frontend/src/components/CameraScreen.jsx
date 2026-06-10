import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 720,
  height: 720,
  facingMode: 'user',
};

function CameraScreen({ onCapture, onBack, userName }) {
  const webcamRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [hasPermission, setHasPermission] = useState(true);

  const handleUserMedia = useCallback(() => {
    setIsCameraReady(true);
    setHasPermission(true);
    setCameraError('');
  }, []);

  const handleUserMediaError = useCallback((err) => {
    console.error('Camera error:', err);
    setHasPermission(false);
    setCameraError(
      'Camera access denied. Please allow camera permissions and reload the page.'
    );
  }, []);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Show flash
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 400);

        // Send to parent
        setTimeout(() => {
          onCapture(imageSrc);
        }, 300);
      }
    }
  }, [onCapture]);

  const startCountdown = useCallback(() => {
    if (countdown !== null) return;
    setCountdown(3);
  }, [countdown]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      capturePhoto();
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, capturePhoto]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 screen-enter relative">
      {/* Flash effect */}
      {showFlash && <div className="camera-flash" />}

      {/* Back button */}
      <div className="fixed top-6 left-6 z-20">
        <button
          onClick={onBack}
          disabled={countdown !== null}
          className="glass px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition-all duration-300 card-hover flex items-center gap-2 disabled:opacity-50"
        >
          <span>←</span>
          <span>Back</span>
        </button>
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-2">
            <span className="gradient-text">Strike a Pose!</span>
          </h2>
          <p className="text-text-secondary text-sm">
            {userName}, look at the camera and click capture when ready
          </p>
        </div>

        {/* Camera container */}
        <div className="relative mx-auto mb-8 animate-scale-in">
          {/* Glow border */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent opacity-40 blur-sm animate-pulse-glow" />

          <div className="relative rounded-2xl overflow-hidden bg-card border border-border-glow">
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
                className="w-full aspect-square object-cover block"
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center bg-card">
                <div className="text-center p-8">
                  <div className="text-5xl mb-4">📷</div>
                  <p className="text-text-secondary text-sm mb-2">Camera access required</p>
                  <p className="text-text-muted text-xs">{cameraError}</p>
                </div>
              </div>
            )}

            {/* Camera loading overlay */}
            {!isCameraReady && hasPermission && (
              <div className="absolute inset-0 glass-strong flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3 animate-bounce-soft">📸</div>
                  <p className="text-text-secondary text-sm shimmer-text">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Countdown overlay */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 bg-base/60 backdrop-blur-sm flex items-center justify-center z-10">
                <div
                  key={countdown}
                  className="animate-countdown"
                >
                  <span className="text-8xl md:text-9xl font-black font-heading text-white drop-shadow-[0_0_30px_rgba(99,102,241,0.8)]">
                    {countdown}
                  </span>
                </div>
              </div>
            )}

            {/* Corner guides */}
            <div className="absolute inset-4 pointer-events-none">
              {/* Top-left */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/30 rounded-tl-lg" />
              {/* Top-right */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
              {/* Bottom-left */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
              {/* Bottom-right */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/30 rounded-br-lg" />
            </div>
          </div>
        </div>

        {/* Capture button */}
        <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={startCountdown}
            disabled={!isCameraReady || countdown !== null || !hasPermission}
            className={`group relative w-20 h-20 rounded-full transition-all duration-300 ${
              isCameraReady && countdown === null && hasPermission
                ? 'cursor-pointer hover:scale-105'
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {/* Outer ring - pulsing */}
            <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse-glow" />

            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full border-2 border-white/50 transition-all duration-300 group-hover:border-white/80" />

            {/* Inner circle */}
            <div className="absolute inset-4 rounded-full gradient-primary transition-all duration-300 group-hover:scale-110 shadow-lg shadow-primary/40 group-hover:shadow-xl group-hover:shadow-primary/60 flex items-center justify-center">
              <span className="text-white text-xl">📸</span>
            </div>
          </button>
        </div>

        {/* Hint text */}
        <p className="text-text-muted text-xs text-center mt-4">
          {countdown !== null
            ? 'Get ready...'
            : 'Click the button to start a 3-second countdown'}
        </p>
      </div>
    </div>
  );
}

export default CameraScreen;
