import { useState, useMemo } from 'react';
import BoothBackground, { boothStyles } from './BoothBackground';

function WelcomeScreen({ onSubmit, onBack }) {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused]       = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);

  const validateEmail = (v) => !v.trim() ? '' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address';
  const validatePhone = (v) => !v.trim() ? '' : v.replace(/\D/g,'').length >= 10 ? '' : 'Phone must have at least 10 digits';

  const handleEmailChange = (e) => { setEmail(e.target.value); setEmailError(validateEmail(e.target.value)); };
  const handlePhoneChange = (e) => { setPhone(e.target.value); setPhoneError(validatePhone(e.target.value)); };

  const canSubmit = name.trim() && email.trim() && phone.trim() && !emailError && !phoneError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try { await onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <>
      <style>{`
        ${boothStyles}
        @keyframes ws-scale-in  { 0%{opacity:0;transform:scale(0.94)} 100%{opacity:1;transform:scale(1)} }
        @keyframes ws-bounce    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes ws-spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ws-shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes ws-frame-glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        .ws-glass {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .ws-input-wrap { position: relative; }
        .ws-input {
          width: 100%;
          padding: 22px 20px 10px 20px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 14px;
          color: #fff;
          font-size: 17px;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
          outline: none;
          caret-color: #a855f7;
          box-sizing: border-box;
        }
        .ws-input:focus { border-color: rgba(167,139,250,0.6); box-shadow: 0 0 0 3px rgba(167,139,250,0.12), inset 0 0 20px rgba(167,139,250,0.04); }
        .ws-input.error { border-color: rgba(248,113,113,0.5); }
        .ws-label {
          position: absolute; left: 20px;
          transition: all 0.25s ease; pointer-events: none;
          font-weight: 500;
        }
        .ws-submit {
          width: 100%; padding: 18px 32px; border-radius: 14px;
          font-size: 18px; font-weight: 700; border: none;
          transition: all 0.3s ease; letter-spacing: 0.3px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .ws-submit.active {
          background: linear-gradient(135deg, #a855f7, #ec4899, #8b5cf6);
          background-size: 200% 200%; color: #fff;
          box-shadow: 0 12px 32px rgba(168,85,247,0.4);
          cursor: pointer;
        }
        .ws-submit.active:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 20px 40px rgba(168,85,247,0.5); }
        .ws-submit.active:active { transform: scale(0.97); }
        .ws-submit.inactive { background: rgba(255,255,255,0.05); color: #4b5563; cursor: not-allowed; }
        .ws-spin { animation: ws-spin 1.5s linear infinite; }
        .ws-bounce { animation: ws-bounce 2s ease-in-out infinite; }
        .ws-back:hover { background: rgba(255,255,255,0.1); }

        /* Portrait frame decoration */
        .ws-frame {
          position: absolute; inset: -1px; border-radius: 17px; pointer-events: none;
          background: linear-gradient(135deg, rgba(139,92,246,0.4), rgba(236,72,153,0.3), rgba(99,102,241,0.3));
          padding: 1px;
        }
        .ws-frame-inner { width:100%; height:100%; border-radius:16px; background:transparent; }
        .ws-frame-corner {
          position: absolute; width: 20px; height: 20px; pointer-events: none;
          animation: ws-frame-glow 2s ease-in-out infinite;
        }
        .ws-divider { height: 1px; background: linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent); margin: 6px 0; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', background: 'linear-gradient(160deg, #07040e 0%, #120820 30%, #1e0f38 60%, #07040e 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <BoothBackground emojis={[
          { e: '📸', top: '7%',   left: '5%',   delay: '0s',   size: '44px', opacity: 0.18 },
          { e: '🎭', top: '13%',  right: '6%',  delay: '1.5s', size: '38px', opacity: 0.15 },
          { e: '✨', bottom: '8%', left: '7%',  delay: '0.8s', size: '32px', opacity: 0.15 },
          { e: '🌟', bottom: '14%', right: '5%', delay: '2s',  size: '42px', opacity: 0.18 },
        ]} />

        {/* Back button */}
        {onBack && (
          <button onClick={onBack} className="ws-back" style={{
            position: 'fixed', top: '24px', left: '24px', zIndex: 20,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px', padding: '10px 18px', color: '#cbd5e1',
            fontSize: '14px', fontWeight: '500', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            backdropFilter: 'blur(12px)', transition: 'all 0.2s ease',
          }}>← Back</button>
        )}

        <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10 }}>
          {/* Outer glow ring */}
          <div style={{
            position: 'absolute', inset: '-2px', borderRadius: '26px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(236,72,153,0.35), rgba(99,102,241,0.4))',
            filter: 'blur(1px)', opacity: 0.6,
          }} />

          <div className="ws-glass" style={{
            borderRadius: '24px', padding: '44px 40px 40px', position: 'relative',
            boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
            animation: 'ws-scale-in 0.6s ease-out',
          }}>
            {/* Portrait frame corner accents */}
            {[
              { top: '16px', left: '16px',  borderTop: '2px solid rgba(139,92,246,0.7)', borderLeft: '2px solid rgba(139,92,246,0.7)', borderRadius: '4px 0 0 0' },
              { top: '16px', right: '16px', borderTop: '2px solid rgba(236,72,153,0.6)', borderRight: '2px solid rgba(236,72,153,0.6)', borderRadius: '0 4px 0 0' },
              { bottom: '16px', left: '16px',  borderBottom: '2px solid rgba(99,102,241,0.6)', borderLeft: '2px solid rgba(99,102,241,0.6)', borderRadius: '0 0 0 4px' },
              { bottom: '16px', right: '16px', borderBottom: '2px solid rgba(139,92,246,0.5)', borderRight: '2px solid rgba(139,92,246,0.5)', borderRadius: '0 0 4px 0' },
            ].map((s, i) => (
              <div key={i} className="ws-frame-corner" style={{ animationDelay: `${i * 0.5}s`, ...s }} />
            ))}

            {/* Camera icon */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              {/* Outer glow ring */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', inset: '-8px', borderRadius: '24px',
                  background: 'radial-gradient(ellipse, rgba(168,85,247,0.3), transparent 70%)',
                }} />
                <div className="ws-bounce" style={{
                  width: '88px', height: '88px', borderRadius: '18px',
                  background: 'linear-gradient(135deg, #a855f7, #ec4899, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '36px', boxShadow: '0 12px 30px rgba(168,85,247,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
                  position: 'relative',
                }}>
                  📷
                  {/* Lens dot */}
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)', boxShadow: '0 0 6px rgba(255,255,255,0.6)' }} />
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '46px', fontWeight: '900', textAlign: 'center', marginBottom: '8px',
              background: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 50%, #c084fc 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              letterSpacing: '-0.5px',
            }}>AI Photobooth</h1>

            <p style={{ color: '#cbd5e1', textAlign: 'center', marginBottom: '6px', fontSize: '15px', fontWeight: '500', lineHeight: '1.6' }}>
              Transform yourself with AI-powered costumes & backgrounds
            </p>

            <div className="ws-divider" style={{ margin: '20px 0' }} />

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Name */}
              <div className="ws-input-wrap">
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}
                  placeholder=" " className="ws-input" maxLength={30} autoComplete="off"
                />
                <label className="ws-label" style={{
                  top: name || isFocused ? '6px' : '18px',
                  fontSize: name || isFocused ? '11px' : '16px',
                  color: name || isFocused ? '#a78bfa' : '#6b7280',
                }}>What's your name?</label>
              </div>

              {/* Email */}
              <div className="ws-input-wrap">
                <input
                  type="email" value={email} onChange={handleEmailChange}
                  onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                  placeholder=" " className={`ws-input${emailError ? ' error' : ''}`} maxLength={60} autoComplete="off"
                />
                <label className="ws-label" style={{
                  top: email || emailFocused ? '6px' : '18px',
                  fontSize: email || emailFocused ? '11px' : '16px',
                  color: email || emailFocused ? '#a78bfa' : '#6b7280',
                }}>Email address</label>
                {emailError && email && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '5px', marginLeft: '4px' }}>{emailError}</p>}
              </div>

              {/* Phone */}
              <div className="ws-input-wrap">
                <input
                  type="tel" value={phone} onChange={handlePhoneChange}
                  onFocus={() => setPhoneFocused(true)} onBlur={() => setPhoneFocused(false)}
                  placeholder=" " className={`ws-input${phoneError ? ' error' : ''}`} maxLength={15} autoComplete="off"
                />
                <label className="ws-label" style={{
                  top: phone || phoneFocused ? '6px' : '18px',
                  fontSize: phone || phoneFocused ? '11px' : '16px',
                  color: phone || phoneFocused ? '#a78bfa' : '#6b7280',
                }}>Phone number</label>
                {phoneError && phone && <p style={{ color: '#f87171', fontSize: '12px', marginTop: '5px', marginLeft: '4px' }}>{phoneError}</p>}
              </div>

              {/* Submit */}
              <button type="submit" disabled={!canSubmit || isSubmitting} className={`ws-submit ${canSubmit ? 'active' : 'inactive'}`}>
                {isSubmitting ? (
                  <>
                    <svg className="ws-spin" style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24">
                      <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path style={{ opacity: 0.85 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Starting...
                  </>
                ) : (
                  <>Let's Go <span style={{ fontSize: '20px' }}>→</span></>
                )}
              </button>
            </form>

            <p style={{ color: '#374151', fontSize: '11px', textAlign: 'center', marginTop: '20px', letterSpacing: '0.5px' }}>
              ✦ POWERED BY AI  ·  PREMIUM EXPERIENCE ✦
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomeScreen;