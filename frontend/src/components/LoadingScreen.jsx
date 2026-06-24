import { useState, useEffect, useMemo } from 'react';

// Template-based loading content
const TEMPLATE_LOADING = {
  king: {
    title: 'Your Royal Transformation Has Begun',
    emoji: '👑',
    color: '#f59e0b',
    messages: [
      { text: 'The royal crown is being crafted...', emoji: '👑' },
      { text: 'Preparing your throne...', emoji: '🏰' },
      { text: 'A king deserves perfection...', emoji: '✨' },
      { text: 'Adding legendary royal details...', emoji: '⚔️' },
      { text: 'Your kingdom awaits its ruler...', emoji: '🏯' },
      { text: 'Forging a portrait fit for royalty...', emoji: '🛡️' },
      { text: 'Power, prestige, and glory are loading...', emoji: '🌟' },
      { text: 'Preparing your grand royal entrance...', emoji: '🎺' },
    ],
  },
  doctor: {
    title: 'Preparing Your Medical Professional Look',
    emoji: '🩺',
    color: '#38bdf8',
    messages: [
      { text: 'Putting on the white coat...', emoji: '🥼' },
      { text: 'Preparing medical expertise...', emoji: '🩺' },
      { text: 'Adding professional confidence...', emoji: '💼' },
      { text: 'Organizing your medical profile...', emoji: '📋' },
      { text: 'Creating a trusted doctor appearance...', emoji: '💊' },
      { text: 'Almost ready to save lives...', emoji: '❤️‍🩹' },
      { text: 'Finalizing professional details...', emoji: '🏥' },
      { text: 'Building your healthcare hero look...', emoji: '🦺' },
    ],
  },
  astronaut: {
    title: 'Mission Control Is Preparing Your Launch',
    emoji: '🚀',
    color: '#6366f1',
    messages: [
      { text: 'Launch sequence initiated...', emoji: '🚀' },
      { text: 'Calibrating space systems...', emoji: '🛰️' },
      { text: 'Preparing your astronaut suit...', emoji: '👨‍🚀' },
      { text: 'Approaching orbit...', emoji: '🌍' },
      { text: 'Mapping distant galaxies...', emoji: '🌌' },
      { text: 'Fueling your interstellar journey...', emoji: '🛸' },
      { text: 'Preparing for liftoff...', emoji: '🔥' },
      { text: 'Exploring the universe for your perfect look...', emoji: '✨' },
    ],
  },
  chef: {
    title: 'Cooking Up Your Masterpiece',
    emoji: '👨‍🍳',
    color: '#f472b6',
    messages: [
      { text: 'Gathering premium ingredients...', emoji: '🥘' },
      { text: 'Sharpening the chef\'s knife...', emoji: '🔪' },
      { text: 'Preparing culinary magic...', emoji: '🍽️' },
      { text: 'Mixing creativity with flavor...', emoji: '🎨' },
      { text: 'Creating a five-star transformation...', emoji: '⭐' },
      { text: 'Adding gourmet details...', emoji: '✨' },
      { text: 'The kitchen is buzzing with excitement...', emoji: '🔥' },
      { text: 'Almost ready to serve perfection...', emoji: '🌟' },
    ],
  },
  anime: {
    title: 'Entering the Anime Universe',
    emoji: '⚡',
    color: '#a855f7',
    messages: [
      { text: 'Sketching your anime character...', emoji: '🎨' },
      { text: 'Adding powerful anime effects...', emoji: '⚡' },
      { text: 'Unlocking your hidden powers...', emoji: '💥' },
      { text: 'Bringing your hero story to life...', emoji: '🦸' },
      { text: 'Enhancing dramatic visuals...', emoji: '🌌' },
      { text: 'Charging up your transformation...', emoji: '🔋' },
      { text: 'Creating your anime adventure...', emoji: '🗺️' },
      { text: 'Finalizing your legendary character design...', emoji: '✨' },
    ],
  },
  bride: {
    title: 'Creating Your Dream Bridal Look',
    emoji: '💍',
    color: '#ec4899',
    messages: [
      { text: 'Designing a magical bridal style...', emoji: '👰' },
      { text: 'Adding elegant details...', emoji: '💐' },
      { text: 'Preparing your special moment...', emoji: '🕊️' },
      { text: 'Perfecting every graceful touch...', emoji: '✨' },
      { text: 'Crafting a timeless bridal portrait...', emoji: '📸' },
      { text: 'Adding beauty and elegance...', emoji: '🌸' },
      { text: 'Making your dream look come true...', emoji: '💖' },
      { text: 'Almost ready for the grand reveal...', emoji: '💍' },
    ],
  },
  avenger: {
    title: 'Assembling Your Superhero Identity',
    emoji: '⚡',
    color: '#ef4444',
    messages: [
      { text: 'Activating superhero mode...', emoji: '⚡' },
      { text: 'Preparing your battle-ready look...', emoji: '🛡️' },
      { text: 'Enhancing heroic powers...', emoji: '💥' },
      { text: 'Building your legendary presence...', emoji: '🌟' },
      { text: 'The world needs a hero...', emoji: '🌍' },
      { text: 'Suiting up for action...', emoji: '🦸' },
      { text: 'Charging your super abilities...', emoji: '🔋' },
      { text: 'Your heroic transformation is almost complete...', emoji: '✨' },
    ],
  },
};

const DEFAULT_LOADING = {
  title: 'Creating Your AI Portrait',
  emoji: '✨',
  color: '#a855f7',
  messages: [
    { text: 'Analyzing your features...', emoji: '🔍' },
    { text: 'Applying your costume...', emoji: '👔' },
    { text: 'Rendering the background...', emoji: '🎨' },
    { text: 'Adding lighting & effects...', emoji: '💡' },
    { text: 'Final polish...', emoji: '✨' },
  ],
};

function getTemplateConfig(templateName) {
  if (!templateName) return DEFAULT_LOADING;
  const key = templateName.toLowerCase();
  for (const [k, v] of Object.entries(TEMPLATE_LOADING)) {
    if (key.includes(k)) return v;
  }
  return DEFAULT_LOADING;
}

function LoadingScreen({ userName, templateName }) {
  const config = useMemo(() => getTemplateConfig(templateName), [templateName]);
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  // Rotate messages with fade
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((p) => (p + 1) % config.messages.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(t);
  }, [config]);

  useEffect(() => {
    const t = setInterval(() => setProgress((p) => p >= 90 ? 90 : p + Math.random() * 6 + 2), 750);
    return () => clearInterval(t);
  }, []);

  const sparkles = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 5}s`,
    duration: `${2.5 + Math.random() * 3}s`,
    size: `${1.5 + Math.random() * 4}px`,
  })), []);

  const stars = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${1.5 + Math.random() * 2.5}s`,
    size: `${2 + Math.random() * 3}px`,
  })), []);

  const orbs = useMemo(() => [
    { size: 360, x: -6, y: 8,  color: '#6366f1', opacity: 0.08, dur: 9 },
    { size: 300, x: 68, y: 58, color: '#ec4899', opacity: 0.07, dur: 11 },
    { size: 240, x: 38, y: -8, color: '#8b5cf6', opacity: 0.08, dur: 8 },
    { size: 200, x: 20, y: 60, color: config.color, opacity: 0.06, dur: 10 },
  ], [config.color]);

  const cur = config.messages[msgIdx];

  return (
    <>
      <style>{`
        @keyframes ls-sparkle  { 0%,100%{opacity:0;transform:scale(0) translateY(0)}45%{opacity:1;transform:scale(1) translateY(-30px)}100%{opacity:0;transform:scale(0.6) translateY(-80px)} }
        @keyframes ls-star     { 0%,100%{opacity:0.15;transform:scale(0.8)}50%{opacity:0.9;transform:scale(1.2)} }
        @keyframes ls-float-orb{ 0%,100%{transform:translate(0,0)}50%{transform:translate(16px,-16px)} }
        @keyframes ls-scale-in { 0%{opacity:0;transform:scale(0.93)}100%{opacity:1;transform:scale(1)} }
        @keyframes ls-spin-a   { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
        @keyframes ls-spin-b   { from{transform:rotate(0deg)}to{transform:rotate(-360deg)} }
        @keyframes ls-fade-msg { 0%{opacity:0;transform:translateY(6px)}100%{opacity:1;transform:translateY(0)} }
        @keyframes ls-shimmer  { 0%{transform:translateX(-100%)}100%{transform:translateX(200%)} }
        @keyframes ls-dot-bounce{ 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)} }
        @keyframes ls-pulse-glow{ 0%,100%{box-shadow:0 0 20px rgba(168,85,247,0.3)}50%{box-shadow:0 0 40px rgba(168,85,247,0.6),0 0 80px rgba(236,72,153,0.2)} }
        @keyframes ls-float-deco{ 0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(-18px) rotate(5deg)} }
        @keyframes ls-float-rev { 0%,100%{transform:translateY(0px) rotate(0deg)}50%{transform:translateY(14px) rotate(-4deg)} }
        @keyframes ls-particle  { 0%{transform:translateY(0) scale(1);opacity:0.8}100%{transform:translateY(-120px) scale(0);opacity:0} }
        .ls-sparkle  { position:absolute;border-radius:50%;pointer-events:none;animation:ls-sparkle 5s ease-out infinite; }
        .ls-star     { position:absolute;border-radius:50%;pointer-events:none;animation:ls-star 2s ease-in-out infinite; }
        .ls-glass    { background:rgba(255,255,255,0.05);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.1); }
        .ls-ring-a   { animation:ls-spin-a 2s linear infinite; }
        .ls-ring-b   { animation:ls-spin-b 3s linear infinite; }
        .ls-msg      { transition:opacity 0.35s ease,transform 0.35s ease; }
        .ls-msg.hidden { opacity:0;transform:translateY(-6px); }
        .ls-msg.visible{ opacity:1;transform:translateY(0); }
        .ls-shimmer  { animation:ls-shimmer 2s ease-in-out infinite; }
        .ls-dot      { animation:ls-dot-bounce 1.2s ease-in-out infinite; }
        .ls-pulse    { animation:ls-pulse-glow 2.5s ease-in-out infinite; }
        .ls-deco     { position:absolute;pointer-events:none;user-select:none;animation:ls-float-deco 5s ease-in-out infinite; }
        .ls-deco-rev { position:absolute;pointer-events:none;user-select:none;animation:ls-float-rev 6s ease-in-out infinite; }
        .ls-particle { position:absolute;pointer-events:none;border-radius:50%;animation:ls-particle 4s ease-out infinite; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'linear-gradient(160deg, #07040e 0%, #120820 30%, #1e0f38 60%, #07040e 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        {orbs.map((o, i) => (
          <div key={i} style={{
            position: 'absolute', width: `${o.size}px`, height: `${o.size}px`,
            left: `${o.x}%`, top: `${o.y}%`, borderRadius: '50%',
            background: o.color, opacity: o.opacity, filter: 'blur(70px)',
            animation: `ls-float-orb ${o.dur}s ease-in-out infinite`,
            animationDelay: `${i * 1.8}s`, pointerEvents: 'none',
          }} />
        ))}

        {/* Sparkles */}
        {sparkles.map((s) => (
          <div key={s.id} className="ls-sparkle" style={{
            left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration,
            width: s.size, height: s.size,
            background: s.id % 4 === 0 ? '#6366f1' : s.id % 4 === 1 ? '#8b5cf6' : s.id % 4 === 2 ? '#ec4899' : config.color,
          }} />
        ))}

        {/* Star twinkles */}
        {stars.map((s) => (
          <div key={s.id} className="ls-star" style={{
            left: s.left, top: s.top, animationDelay: s.delay, animationDuration: s.duration,
            width: s.size, height: s.size,
            background: s.id % 2 === 0 ? '#a78bfa' : '#f472b6',
            boxShadow: `0 0 ${parseInt(s.size) * 3}px ${s.id % 2 === 0 ? '#a78bfa' : '#f472b6'}`,
          }} />
        ))}

        {/* Floating decorations */}
        {[
          { e: config.emoji, top: '10%', left: '6%', delay: '0s', size: '40px', opacity: 0.2 },
          { e: '✨', top: '15%', right: '7%', delay: '1s', size: '28px', opacity: 0.16, rev: true },
          { e: '📸', bottom: '12%', left: '5%', delay: '0.5s', size: '30px', opacity: 0.14 },
          { e: '🌟', bottom: '18%', right: '6%', delay: '2s', size: '32px', opacity: 0.18, rev: true },
          { e: '💫', top: '45%', left: '2%', delay: '1.5s', size: '22px', opacity: 0.12 },
          { e: '✦', top: '60%', right: '3%', delay: '3s', size: '20px', opacity: 0.14, rev: true },
        ].map((d, i) => (
          <div key={i} className={d.rev ? 'ls-deco-rev' : 'ls-deco'} style={{
            fontSize: d.size, opacity: d.opacity, animationDelay: d.delay,
            top: d.top, left: d.left, right: d.right, bottom: d.bottom,
          }}>{d.e}</div>
        ))}

        {/* Rising particles */}
        {Array.from({ length: 12 }, (_, i) => (
          <div key={`part-${i}`} className="ls-particle" style={{
            left: `${8 + i * 7.5}%`,
            bottom: '5%',
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            background: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#ec4899' : config.color,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }} />
        ))}

        <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 10 }}>
          {/* Outer glow */}
          <div style={{
            position: 'absolute', inset: '-2px', borderRadius: '26px',
            background: `linear-gradient(135deg, rgba(139,92,246,0.4), ${config.color}50, rgba(99,102,241,0.3))`,
            filter: 'blur(2px)', opacity: 0.5,
          }} />

          <div className="ls-glass ls-pulse" style={{
            borderRadius: '24px', padding: '44px 36px 40px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
            animation: 'ls-scale-in 0.6s ease-out',
            textAlign: 'center',
            position: 'relative',
          }}>
            {/* Spinner */}
            <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 32px' }}>
              {/* Track */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.05)' }} />
              {/* Outer ring */}
              <div className="ls-ring-a" style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: '#a855f7', borderRightColor: config.color,
              }} />
              {/* Inner ring */}
              <div className="ls-ring-b" style={{
                position: 'absolute', inset: '14px', borderRadius: '50%',
                border: '2.5px solid transparent',
                borderBottomColor: '#818cf8', borderLeftColor: '#f472b6',
              }} />
              {/* Center icon */}
              <div style={{
                position: 'absolute', inset: '22px', borderRadius: '50%',
                background: `radial-gradient(circle, ${config.color}20, rgba(0,0,0,0) 70%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '30px', lineHeight: 1 }}>{config.emoji}</span>
              </div>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '26px', fontWeight: '900', marginBottom: '8px',
              background: `linear-gradient(135deg, #a78bfa, ${config.color}, #c084fc)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              lineHeight: 1.2,
            }}>{config.title}</h2>

            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>
              Hang tight, <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{userName}</span>! Magic is happening ✨
            </p>

            {/* Message card with fade transition */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${config.color}30`,
              borderRadius: '16px', padding: '16px 20px', marginBottom: '28px',
              display: 'flex', alignItems: 'center', gap: '14px',
              minHeight: '72px',
              boxShadow: `0 4px 24px ${config.color}10`,
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: `linear-gradient(135deg, ${config.color}30, rgba(236,72,153,0.2))`,
                border: `1px solid ${config.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              }}>{cur.emoji}</div>
              <div style={{ textAlign: 'left', flex: 1 }}>
                <p className={`ls-msg ${visible ? 'visible' : 'hidden'}`}
                   style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: '600', marginBottom: '0', lineHeight: 1.4 }}>
                  {cur.text}
                </p>
              </div>
              {/* Dots */}
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} className="ls-dot" style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: config.color, animationDelay: `${i * 0.15}s`,
                  }} />
                ))}
              </div>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Processing</span>
              <span style={{ color: config.color, fontSize: '12px', fontWeight: '700' }}>{Math.round(Math.min(progress, 100))}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                background: `linear-gradient(to right, #a855f7, ${config.color})`,
                width: `${Math.min(progress, 100)}%`,
                transition: 'width 0.7s ease',
                position: 'relative', overflow: 'hidden',
              }}>
                <div className="ls-shimmer" style={{
                  position: 'absolute', inset: 0, width: '40%',
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent)',
                }} />
              </div>
            </div>

            {/* Step dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '22px' }}>
              {config.messages.map((_, i) => (
                <div key={i} style={{
                  width: i === msgIdx ? '24px' : '8px', height: '8px', borderRadius: '4px',
                  background: i === msgIdx ? config.color : i < msgIdx ? '#6366f1' : 'rgba(255,255,255,0.08)',
                  transition: 'all 0.4s ease',
                  boxShadow: i === msgIdx ? `0 0 10px ${config.color}80` : 'none',
                }} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
            <span style={{ fontSize: '14px' }}>💡</span>
            <p style={{ color: '#475569', fontSize: '12px' }}>Every AI portrait is completely unique</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoadingScreen;