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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 screen-enter relative">
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

      {/* Decorative floating elements */}
      <div className="absolute top-20 left-10 text-5xl animate-float opacity-20 select-none" style={{ animationDelay: '0s' }}>📸</div>
      <div className="absolute top-32 right-16 text-4xl animate-float opacity-15 select-none" style={{ animationDelay: '1s' }}>✨</div>
      <div className="absolute bottom-20 left-20 text-4xl animate-float opacity-15 select-none" style={{ animationDelay: '2s' }}>🎭</div>
      <div className="absolute bottom-32 right-10 text-5xl animate-float opacity-20 select-none" style={{ animationDelay: '0.5s' }}>🌟</div>

      <div className="w-full max-w-md">
        {/* Main card */}
        <div className="glass-strong rounded-3xl p-8 md:p-10 shadow-2xl shadow-primary/10 animate-scale-in">
          {/* Camera icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-4xl shadow-lg shadow-primary/30 animate-bounce-soft">
              📷
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-2 font-heading">
            <span className="gradient-text">AI Photobooth</span>
          </h1>

          <p className="text-text-secondary text-center mb-8 text-sm md:text-base">
            Transform yourself with AI-powered costumes & backgrounds
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input with floating label */}
            <div className="relative">
              <input
                type="text"
                id="userName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder=" "
                className="w-full px-5 py-4 bg-surface rounded-xl border border-border-subtle text-text-primary text-lg transition-all duration-300 peer focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-surface-light"
                maxLength={30}
                autoComplete="off"
              />
              <label
                htmlFor="userName"
                className={`absolute left-5 transition-all duration-300 pointer-events-none ${
                  name || isFocused
                    ? 'top-1 text-xs text-primary-light'
                    : 'top-4 text-base text-text-muted'
                }`}
              >
                What&apos;s your name?
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className={`w-full py-4 rounded-xl text-lg font-semibold font-heading tracking-wide transition-all duration-300 btn-glow ${
                name.trim()
                  ? 'gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 cursor-pointer'
                  : 'bg-card border border-border-subtle text-text-muted cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin-slow h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Starting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Let&apos;s Go
                  <span className="text-xl">→</span>
                </span>
              )}
            </button>
          </form>

          {/* Footer hint */}
          <p className="text-text-muted text-xs text-center mt-6">
            ✦ Powered by AI • Premium Experience ✦
          </p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
