import { useState, useEffect } from 'react';

const templateIcons = ['🏰', '🌅', '🎬', '👑', '🌸', '🏛️', '🎪', '🌌', '🎨'];

function TemplateScreen({ gender, onSelect, onBack, apiBase }) {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setFetchError('');
      try {
        const res = await fetch(`${apiBase}/templates/${gender}`);
        if (!res.ok) throw new Error('Failed to fetch templates');
        const data = await res.json();
        setTemplates(data.templates || []);
      } catch (err) {
        console.error('Template fetch error:', err);
        setFetchError('Could not load templates. Using defaults.');
        // Fallback templates for demo
        setTemplates([
          { id: '1', name: 'Royal Palace', backgroundName: 'Grand Palace Hall', gender, prompt: 'royal attire', previewImage: '' },
          { id: '2', name: 'Beach Sunset', backgroundName: 'Tropical Paradise', gender, prompt: 'beach outfit', previewImage: '' },
          { id: '3', name: 'Movie Star', backgroundName: 'Red Carpet', gender, prompt: 'celebrity look', previewImage: '' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplates();
  }, [gender, apiBase]);

  const handleContinue = async () => {
    if (!selected || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSelect(selected);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGradient = (index) => {
    const gradients = [
      'from-indigo-600/30 via-purple-600/20 to-pink-600/30',
      'from-amber-600/30 via-orange-600/20 to-rose-600/30',
      'from-emerald-600/30 via-teal-600/20 to-cyan-600/30',
      'from-blue-600/30 via-violet-600/20 to-purple-600/30',
      'from-pink-600/30 via-rose-600/20 to-red-600/30',
      'from-cyan-600/30 via-sky-600/20 to-blue-600/30',
    ];
    return gradients[index % gradients.length];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center screen-enter">
        <div className="glass-strong rounded-2xl p-10 text-center animate-pulse-glow">
          <div className="text-4xl mb-4 animate-bounce-soft">🎨</div>
          <p className="text-text-secondary shimmer-text text-lg font-heading">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-8 screen-enter">
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

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-16 pb-24">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-3">
            <span className="gradient-text">Pick Your Look</span>
          </h2>
          <p className="text-text-secondary text-sm md:text-base">
            Choose a costume & background for your AI portrait
          </p>
          {fetchError && (
            <p className="text-warning text-xs mt-2">{fetchError}</p>
          )}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl mb-10">
          {templates.map((template, index) => {
            const isSelected = selected?.id === template.id;
            return (
              <button
                key={template.id}
                onClick={() => setSelected(template)}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer animate-slide-up ${
                  isSelected
                    ? 'ring-2 ring-primary shadow-xl shadow-primary/20 scale-[1.02]'
                    : 'hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Preview area */}
                <div className={`relative h-48 md:h-56 bg-gradient-to-br ${getGradient(index)} flex items-center justify-center`}>
                  {template.previewImage ? (
                    <img
                      src={template.previewImage}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <span className="text-5xl md:text-6xl transition-transform duration-500 group-hover:scale-110">
                        {templateIcons[index % templateIcons.length]}
                      </span>
                      <span className="text-text-secondary/60 text-xs font-medium uppercase tracking-wider">
                        Preview
                      </span>
                    </div>
                  )}

                  {/* Selected overlay */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center animate-scale-in">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/40">
                        <span className="text-white text-xl font-bold">✓</span>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-base/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info */}
                <div className={`p-5 transition-all duration-300 ${
                  isSelected ? 'glass-strong' : 'glass'
                }`}>
                  <h3 className="text-lg font-semibold font-heading text-text-primary mb-1 text-left">
                    {template.name}
                  </h3>
                  <p className="text-text-secondary text-sm text-left flex items-center gap-1.5">
                    <span className="text-xs">🖼️</span>
                    {template.backgroundName}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue button */}
        <div className={`transition-all duration-500 ${selected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <button
            onClick={handleContinue}
            disabled={!selected || isSubmitting}
            className="gradient-primary text-white px-10 py-4 rounded-xl text-lg font-semibold font-heading tracking-wide btn-glow shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 flex items-center gap-3"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin-slow h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Setting up...
              </>
            ) : (
              <>
                Continue to Camera
                <span className="text-xl">📸</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplateScreen;
