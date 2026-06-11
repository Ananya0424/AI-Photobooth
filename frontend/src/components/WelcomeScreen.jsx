import { useState, useMemo } from 'react';

function WelcomeScreen({ onSubmit }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const sparkles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${2 + Math.random() * 3}s`,
      size: `${2 + Math.random() * 4}px`,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(name.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && name.trim() && !isSubmitting) {
      handleSubmit(e);
    }
  };

  return (
    <>
      <style>{`
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) translateY(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(1) translateY(-100px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes bounce-soft {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes scale-in {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .sparkle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: sparkle 4s ease-out infinite;
        }

        .sparkle-container {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .float-emoji {
          animation: float 3s ease-in-out infinite;
        }

        .camera-icon {
          animation: bounce-soft 2s ease-in-out infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        input:focus {
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
        }

        button:not(:disabled) {
          cursor: pointer;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        button:not(:disabled):hover {
          box-shadow: 0 20px 25px rgba(168, 85, 247, 0.4);
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }

        .animate-spin {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'linear-gradient(to bottom right, #0f172a, #2d1b4e, #0f172a)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Sparkle particles */}
        <div className="sparkle-container">
          {sparkles.map((s) => (
            <div
              key={s.id}
              className="sparkle"
              style={{
                left: s.left,
                top: s.top,
                animationDelay: s.delay,
                animationDuration: s.duration,
                width: s.size,
                height: s.size,
                background: s.id % 3 === 0
                  ? '#6366f1'
                  : s.id % 3 === 1
                  ? '#8b5cf6'
                  : '#ec4899',
              }}
            />
          ))}
        </div>

        {/* Floating emojis */}
        <div
          className="float-emoji"
          style={{
            position: 'absolute',
            top: '80px',
            left: '40px',
            fontSize: '48px',
            opacity: '0.2',
            userSelect: 'none',
            pointerEvents: 'none',
            animationDelay: '0s',
          }}
        >
          📸
        </div>

        <div
          className="float-emoji"
          style={{
            position: 'absolute',
            top: '130px',
            right: '64px',
            fontSize: '40px',
            opacity: '0.15',
            userSelect: 'none',
            pointerEvents: 'none',
            animationDelay: '1s',
          }}
        >
          ✨
        </div>

        <div
          className="float-emoji"
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '80px',
            fontSize: '40px',
            opacity: '0.15',
            userSelect: 'none',
            pointerEvents: 'none',
            animationDelay: '2s',
          }}
        >
          🎭
        </div>

        <div
          className="float-emoji"
          style={{
            position: 'absolute',
            bottom: '130px',
            right: '40px',
            fontSize: '48px',
            opacity: '0.2',
            userSelect: 'none',
            pointerEvents: 'none',
            animationDelay: '0.5s',
          }}
        >
          🌟
        </div>

        {/* Main Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '448px',
            position: 'relative',
            zIndex: 10,
          }}
        >
          <div
            className="glass-card"
            style={{
              borderRadius: '24px',
              padding: '40px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
              animation: 'scale-in 0.6s ease-out',
            }}
          >
            {/* Camera icon */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <div
                className="camera-icon"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'linear-gradient(to bottom right, #a855f7, #ec4899, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  boxShadow: '0 10px 25px rgba(168, 85, 247, 0.3)',
                }}
              >
                📷
              </div>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: '900',
                textAlign: 'center',
                marginBottom: '12px',
                background: 'linear-gradient(to right, #a78bfa, #f472b6, #c084fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AI Photobooth
            </h1>

            {/* Subtitle */}
            <p
              style={{
                color: '#ffffff',
                textAlign: 'center',
                marginBottom: '32px',
                fontSize: '16px',
                fontWeight: '600',
                lineHeight: '1.6',
              }}
            >
              Transform yourself with AI-powered costumes & backgrounds
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Input with floating label */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="userName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyPress={handleKeyPress}
                  placeholder=" "
                  style={{
                    width: '100%',
                    padding: '20px 20px 8px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '18px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)',
                    outline: 'none',
                    caretColor: '#a855f7',
                  }}
                  maxLength={30}
                  autoComplete="off"
                />
                <label
                  htmlFor="userName"
                  style={{
                    position: 'absolute',
                    left: '20px',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    top: name || isFocused ? '4px' : '16px',
                    fontSize: name || isFocused ? '12px' : '16px',
                    color: name || isFocused ? '#a78bfa' : '#9ca3af',
                    fontWeight: '500',
                  }}
                >
                  What's your name?
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!name.trim() || isSubmitting}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  border: 'none',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease',
                  background: name.trim()
                    ? 'linear-gradient(to right, #a855f7, #ec4899)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: name.trim() ? '#ffffff' : '#9ca3af',
                  boxShadow: name.trim()
                    ? '0 10px 25px rgba(168, 85, 247, 0.25)'
                    : 'none',
                  opacity: name.trim() ? 1 : 0.6,
                }}
              >
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg
                      className="animate-spin"
                      style={{
                        height: '20px',
                        width: '20px',
                        color: 'currentColor',
                      }}
                      viewBox="0 0 24 24"
                    >
                      <circle
                        style={{ opacity: '0.25' }}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        style={{ opacity: '0.75' }}
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Starting...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Let's Go
                    <span style={{ fontSize: '20px' }}>→</span>
                  </span>
                )}
              </button>
            </form>

            {/* Footer */}
            <p
              style={{
                color: '#9ca3af',
                fontSize: '12px',
                textAlign: 'center',
                marginTop: '24px',
              }}
            >
              ✦ Powered by AI • Premium Experience ✦
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomeScreen;