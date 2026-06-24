import { useState, useEffect, useMemo } from 'react';

export default function SettingsScreen({ onBack, apiBase }) {
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [errorMsg, setErrorMsg] = useState('');

  const sparkles = useMemo(() => Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${2 + Math.random() * 3}s`,
    size: `${2 + Math.random() * 4}px`,
  })), []);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${apiBase}/settings`);
        if (!res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        setAvailableModels(data.availableModels || []);
        setSelectedModel(data.settings?.selectedModel || '');
      } catch (err) {
        console.error('Failed to load settings:', err);
        setErrorMsg('Failed to load settings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [apiBase]);

  // Save handler
  const handleSave = async () => {
    if (!selectedModel) return;
    setIsSaving(true);
    setSaveStatus(null);
    setErrorMsg('');
    try {
      const res = await fetch(`${apiBase}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedModel }),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setSaveStatus('error');
      setErrorMsg('Failed to save. Please try again.');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: scale(1) translateY(-80px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes ss-toast-in {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .ss-sparkle { position: absolute; border-radius: 50%; pointer-events: none; animation: sparkle 4s ease-out infinite; }
        .ss-sparkle-container { position: absolute; width: 100%; height: 100%; pointer-events: none; }
        .ss-float { animation: float 3s ease-in-out infinite; }
        .ss-glass {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ss-spin { animation: spin-slow 1.5s linear infinite; }
        .ss-back:hover { background: rgba(255,255,255,0.1); }
        .ss-save-btn:hover:not(:disabled) { box-shadow: 0 20px 40px rgba(168,85,247,0.5); transform: translateY(-3px) scale(1.02); }
        .ss-save-btn:active:not(:disabled) { transform: scale(0.97); }
        .ss-select:focus { border-color: rgba(167,139,250,0.6); box-shadow: 0 0 0 3px rgba(167,139,250,0.15); }
        .ss-select option { background: #1e1b4b; color: #f1f5f9; }
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
        {/* Sparkles */}
        <div className="ss-sparkle-container">
          {sparkles.map((s) => (
            <div key={s.id} className="ss-sparkle" style={{
              left: s.left, top: s.top,
              animationDelay: s.delay, animationDuration: s.duration,
              width: s.size, height: s.size,
              background: s.id % 3 === 0 ? '#6366f1' : s.id % 3 === 1 ? '#8b5cf6' : '#ec4899',
            }} />
          ))}
        </div>

        {/* Floating decorations */}
        {[
          { emoji: '⚙️', top: '70px', left: '40px', delay: '0s', size: '44px', opacity: 0.2 },
          { emoji: '🔧', top: '100px', right: '50px', delay: '1.2s', size: '40px', opacity: 0.18 },
          { emoji: '✨', bottom: '90px', left: '60px', delay: '0.6s', size: '36px', opacity: 0.15 },
          { emoji: '🤖', bottom: '120px', right: '45px', delay: '1.8s', size: '44px', opacity: 0.2 },
        ].map((d, i) => (
          <div key={i} className="ss-float" style={{
            position: 'absolute', fontSize: d.size, opacity: d.opacity,
            userSelect: 'none', pointerEvents: 'none', animationDelay: d.delay,
            top: d.top, left: d.left, right: d.right, bottom: d.bottom,
          }}>{d.emoji}</div>
        ))}

        {/* Back button */}
        <button
          onClick={onBack}
          className="ss-back"
          style={{
            position: 'fixed', top: '24px', left: '24px', zIndex: 20,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px', padding: '10px 18px', color: '#cbd5e1',
            fontSize: '14px', fontWeight: '500', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            backdropFilter: 'blur(12px)', transition: 'all 0.2s ease',
          }}
        >
          <span>←</span> Back
        </button>

        {/* Main content */}
        <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10 }}>
          {/* Glass card */}
          <div className="ss-glass" style={{
            borderRadius: '24px', padding: '40px 36px 36px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
            animation: 'scale-in 0.6s ease-out',
          }}>
            {/* Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '30px', boxShadow: '0 10px 25px rgba(168,85,247,0.35)',
              }}>⚙️</div>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '36px', fontWeight: '900', textAlign: 'center', marginBottom: '10px',
              background: 'linear-gradient(to right, #a78bfa, #f472b6, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Settings</h2>

            <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
              Configure your AI experience
            </p>

            {/* Loading state */}
            {isLoading ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                padding: '32px 0',
              }}>
                <svg className="ss-spin" style={{ width: '24px', height: '24px', color: '#a78bfa' }} viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span style={{ color: '#94a3b8', fontSize: '14px' }}>Loading settings...</span>
              </div>
            ) : (
              <div style={{ animation: 'slide-up 0.5s ease-out' }}>
                {/* Model selection */}
                <div style={{ marginBottom: '28px' }}>
                  <label style={{
                    display: 'block', color: '#cbd5e1', fontSize: '14px',
                    fontWeight: '600', marginBottom: '10px',
                    letterSpacing: '0.02em',
                  }}>
                    <span style={{ marginRight: '6px' }}>🤖</span> AI Model
                  </label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="ss-select"
                      style={{
                        width: '100%',
                        padding: '14px 44px 14px 16px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '14px',
                        color: '#f1f5f9',
                        fontSize: '15px',
                        fontWeight: '500',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                      }}
                    >
                      {availableModels.length === 0 && (
                        <option value="" disabled>No models available</option>
                      )}
                      {availableModels.map((model) => (
                        <option key={model.id} value={model.id}>{model.name}</option>
                      ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div style={{
                      position: 'absolute', right: '16px', top: '50%',
                      transform: 'translateY(-50%)', pointerEvents: 'none',
                      color: '#94a3b8', fontSize: '12px',
                    }}>▼</div>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px', lineHeight: '1.5' }}>
                    Choose the AI model for generating portraits
                  </p>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !selectedModel}
                  className="ss-save-btn"
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    background: isSaving ? 'rgba(168,85,247,0.4)' : 'linear-gradient(135deg, #a855f7, #ec4899)',
                    border: 'none',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: isSaving ? 'wait' : 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    boxShadow: '0 12px 30px rgba(168,85,247,0.3)',
                    opacity: !selectedModel ? 0.5 : 1,
                  }}
                >
                  {isSaving ? (
                    <>
                      <svg className="ss-spin" style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>💾 Save Settings</>
                  )}
                </button>

                {/* Status toast */}
                {saveStatus && (
                  <div style={{
                    marginTop: '16px',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    animation: 'ss-toast-in 0.3s ease-out',
                    background: saveStatus === 'success' ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                    border: `1px solid ${saveStatus === 'success' ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
                  }}>
                    <span style={{ fontSize: '16px' }}>{saveStatus === 'success' ? '✅' : '❌'}</span>
                    <span style={{
                      color: saveStatus === 'success' ? '#34d399' : '#f87171',
                      fontSize: '14px', fontWeight: '600',
                    }}>
                      {saveStatus === 'success' ? 'Settings saved successfully!' : errorMsg || 'Failed to save settings.'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <p style={{ color: '#475569', fontSize: '12px', textAlign: 'center', marginTop: '16px' }}>
            ✦ Powered by AI • Premium Experience ✦
          </p>
        </div>
      </div>
    </>
  );
}