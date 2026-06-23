import { useState, useMemo } from 'react';

function WelcomeScreen({ onSubmit, onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  const validateEmail = (val) => {
    if (!val.trim()) return '';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? '' : 'Please enter a valid email address';
  };

  const validatePhone = (val) => {
    if (!val.trim()) return '';
    const digits = val.replace(/\D/g, '');
    return digits.length >= 10 ? '' : 'Phone number must have at least 10 digits';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(validateEmail(val));
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    setPhone(val);
    setPhoneError(validatePhone(val));
  };

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
    if (!name.trim() || !email.trim() || !phone.trim() || isSubmitting || !!emailError || !!phoneError) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && name.trim() && email.trim() && phone.trim() && !isSubmitting && !emailError && !phoneError) {
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

        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              zIndex: 50,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              fontSize: '16px',
              fontWeight: '500'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '20px' }}>←</span> Back
          </button>
        )}

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

              {/* Email input with floating label */}
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  id="userEmail"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onKeyPress={handleKeyPress}
                  placeholder=" "
                  style={{
                    width: '100%',
                    padding: '20px 20px 8px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${emailError ? 'rgba(248, 113, 113, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '18px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)',
                    outline: 'none',
                    caretColor: '#a855f7',
                  }}
                  maxLength={50}
                  autoComplete="off"
                />
                <label
                  htmlFor="userEmail"
                  style={{
                    position: 'absolute',
                    left: '20px',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    top: email || emailFocused ? '4px' : '16px',
                    fontSize: email || emailFocused ? '12px' : '16px',
                    color: email || emailFocused ? '#a78bfa' : '#9ca3af',
                    fontWeight: '500',
                  }}
                >
                  Email address
                </label>
                {emailError && email && (
                  <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px', marginLeft: '4px' }}>{emailError}</p>
                )}
              </div>

              {/* Phone input with floating label */}
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  id="userPhone"
                  value={phone}
                  onChange={handlePhoneChange}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => setPhoneFocused(false)}
                  onKeyPress={handleKeyPress}
                  placeholder=" "
                  style={{
                    width: '100%',
                    padding: '20px 20px 8px 20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${phoneError ? 'rgba(248, 113, 113, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '18px',
                    transition: 'all 0.3s ease',
                    backdropFilter: 'blur(8px)',
                    outline: 'none',
                    caretColor: '#a855f7',
                  }}
                  maxLength={15}
                  autoComplete="off"
                />
                <label
                  htmlFor="userPhone"
                  style={{
                    position: 'absolute',
                    left: '20px',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'none',
                    top: phone || phoneFocused ? '4px' : '16px',
                    fontSize: phone || phoneFocused ? '12px' : '16px',
                    color: phone || phoneFocused ? '#a78bfa' : '#9ca3af',
                    fontWeight: '500',
                  }}
                >
                  Phone number
                </label>
                {phoneError && phone && (
                  <p style={{ color: '#f87171', fontSize: '12px', marginTop: '6px', marginLeft: '4px' }}>{phoneError}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!name.trim() || !email.trim() || !phone.trim() || isSubmitting || !!emailError || !!phoneError}
                style={{
                  width: '100%',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  border: 'none',
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s ease',
                  background: (name.trim() && email.trim() && phone.trim() && !emailError && !phoneError)
                    ? 'linear-gradient(to right, #a855f7, #ec4899)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: (name.trim() && email.trim() && phone.trim() && !emailError && !phoneError) ? '#ffffff' : '#9ca3af',
                  boxShadow: (name.trim() && email.trim() && phone.trim() && !emailError && !phoneError)
                    ? '0 10px 25px rgba(168, 85, 247, 0.25)'
                    : 'none',
                  opacity: (name.trim() && email.trim() && phone.trim() && !emailError && !phoneError) ? 1 : 0.6,
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