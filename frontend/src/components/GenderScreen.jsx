import { useState } from 'react';

const genderOptions = [
  {
    value: 'male',
    label: 'Male',
    emoji: '👔',
    description: 'Suits, uniforms & formal wear',
    gradient: 'from-blue-600/20 to-indigo-600/20',
    borderColor: 'border-blue-500/40',
    glowColor: 'shadow-blue-500/20',
    hoverGlow: 'hover:shadow-blue-500/30',
    activeRing: 'ring-blue-500/50',
  },
  {
    value: 'female',
    label: 'Female',
    emoji: '👗',
    description: 'Dresses, gowns & elegant outfits',
    gradient: 'from-pink-600/20 to-rose-600/20',
    borderColor: 'border-pink-500/40',
    glowColor: 'shadow-pink-500/20',
    hoverGlow: 'hover:shadow-pink-500/30',
    activeRing: 'ring-pink-500/50',
  },
];

function GenderScreen({ onSelect, onBack, userName }) {
  const [selected, setSelected] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelect = async (gender) => {
    setSelected(gender);
    setIsLoading(true);
    try {
      await onSelect(gender);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 screen-enter">
      {/* Back button */}
      <div className="fixed top-6 left-6 z-20">
        <button
          onClick={onBack}
          className="glass px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition-all duration-300 card-hover flex items-center gap-2"
        >
          <span>←</span>
          <span>Back</span>
        </button>
      </div>

      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <p className="text-text-secondary text-sm mb-2">
            Hey <span className="text-primary-light font-medium">{userName}</span> 👋
          </p>
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-3">
            <span className="gradient-text">Choose Your Style</span>
          </h2>
          <p className="text-text-secondary text-sm md:text-base">
            Select your preference to see matching costumes
          </p>
        </div>

        {/* Gender cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {genderOptions.map((option, index) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              disabled={isLoading}
              className={`relative group rounded-2xl p-8 md:p-10 transition-all duration-500 cursor-pointer border animate-slide-up ${
                selected === option.value
                  ? `glass-strong ${option.borderColor} ring-2 ${option.activeRing} shadow-xl ${option.glowColor}`
                  : `glass border-border-subtle ${option.hoverGlow} hover:border-opacity-60`
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Gradient overlay on hover */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${option.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Emoji */}
                <div
                  className={`text-6xl md:text-7xl mb-5 transition-transform duration-500 group-hover:scale-110 ${
                    selected === option.value ? 'animate-bounce-soft' : ''
                  }`}
                >
                  {option.emoji}
                </div>

                {/* Label */}
                <h3 className="text-2xl font-bold font-heading text-text-primary mb-2">
                  {option.label}
                </h3>

                {/* Description */}
                <p className="text-text-secondary text-sm text-center">
                  {option.description}
                </p>

                {/* Selected indicator */}
                {selected === option.value && (
                  <div className="mt-4 flex items-center gap-2 text-primary-light text-sm font-medium animate-scale-in">
                    <span className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-white text-xs">✓</span>
                    Selected
                  </div>
                )}
              </div>

              {/* Corner accent */}
              <div className={`absolute top-3 right-3 w-2 h-2 rounded-full transition-all duration-500 ${
                selected === option.value ? 'bg-primary-light scale-100' : 'bg-transparent scale-0'
              }`} />
            </button>
          ))}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center mt-8 animate-fade-in">
            <div className="glass px-6 py-3 rounded-full flex items-center gap-3">
              <svg className="animate-spin-slow h-5 w-5 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-text-secondary text-sm">Loading templates...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GenderScreen;
