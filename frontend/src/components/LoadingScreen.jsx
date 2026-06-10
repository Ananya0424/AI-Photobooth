import { useState, useEffect, useMemo } from 'react';

const loadingMessages = [
  { text: 'Analyzing your features...', emoji: '🔍' },
  { text: 'Applying costume...', emoji: '👔' },
  { text: 'Rendering background...', emoji: '🎨' },
  { text: 'Adding finishing touches...', emoji: '✨' },
  { text: 'Perfecting the details...', emoji: '💎' },
  { text: 'Almost there...', emoji: '🚀' },
];

function LoadingScreen({ userName }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Animate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Cap at 90% until actually done
        return prev + Math.random() * 8 + 2;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const currentMessage = loadingMessages[messageIndex];

  // Floating orbs
  const orbs = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      size: 40 + Math.random() * 60,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      delay: Math.random() * 3,
      duration: 4 + Math.random() * 4,
      color: ['#6366f1', '#8b5cf6', '#ec4899', '#818cf8', '#a78bfa', '#f472b6'][i],
    }));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 screen-enter relative overflow-hidden">
      {/* Animated background orbs */}
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="absolute rounded-full animate-float opacity-10 blur-xl"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            background: orb.color,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration}s`,
          }}
        />
      ))}

      <div className="w-full max-w-md relative z-10">
        {/* Main card */}
        <div className="glass-strong rounded-3xl p-8 md:p-10 shadow-2xl shadow-primary/10 text-center animate-scale-in">
          {/* Animated spinner */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-4 border-border-subtle" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-secondary animate-spin-slow"
              style={{ animationDuration: '2s' }}
            />

            {/* Middle ring */}
            <div
              className="absolute inset-3 rounded-full border-2 border-transparent border-b-accent border-l-primary-light animate-spin-slow"
              style={{ animationDuration: '3s', animationDirection: 'reverse' }}
            />

            {/* Center emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                key={messageIndex}
                className="text-3xl animate-scale-in"
              >
                {currentMessage.emoji}
              </span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-2">
            <span className="shimmer-text">Creating your AI portrait</span>
          </h2>

          {/* User name */}
          <p className="text-text-secondary text-sm mb-6">
            Hang tight, {userName}! Magic is happening ✨
          </p>

          {/* Progress bar */}
          <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-4">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-700 ease-out relative"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Status message */}
          <div className="h-6 flex items-center justify-center">
            <p
              key={messageIndex}
              className="text-text-secondary text-sm animate-fade-in flex items-center gap-2"
            >
              <span>{currentMessage.emoji}</span>
              {currentMessage.text}
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex justify-center gap-2 mt-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-light animate-bounce-soft"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        {/* Fun tip */}
        <p className="text-text-muted text-xs text-center mt-6 animate-fade-in" style={{ animationDelay: '1s' }}>
          💡 AI-generated images are unique — no two portraits are the same!
        </p>
      </div>
    </div>
  );
}

export default LoadingScreen;
