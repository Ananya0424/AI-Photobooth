import { useState, useEffect, useMemo } from 'react';

// Template-based loading content
const TEMPLATE_LOADING = {
  king: {
    title: 'The Journey of a King',
    emoji: '👑',
    color: '#f59e0b',
    messages: [
      { text: 'A king is the protector and leader of a kingdom.', emoji: '🛡️' },
      { text: 'Great kings are remembered for their wisdom, courage, and leadership.', emoji: '👑' },
      { text: 'Kings were responsible for making important decisions for their people.', emoji: '📜' },
      { text: 'A powerful king earned respect through justice, not fear.', emoji: '⚖️' },
      { text: 'Throughout history, legendary kings built great civilizations.', emoji: '🏛️' },
      { text: "A king's duty was to protect his kingdom during peace and war.", emoji: '⚔️' },
      { text: 'Strong leadership often determines the success of a kingdom.', emoji: '🏰' },
      { text: 'Many kings spent years learning strategy and governance.', emoji: '📚' },
      { text: 'A wise king listens to his advisors but makes the final decision.', emoji: '🧠' },
      { text: 'The crown symbolizes responsibility as much as power.', emoji: '👑' },
      { text: 'History remembers kings who served their people well.', emoji: '📖' },
      { text: 'Every great kingdom once had a visionary ruler.', emoji: '🌟' },
      { text: 'Royal courts were centers of art, culture, and diplomacy.', emoji: '🎭' },
      { text: 'A throne carries the weight of an entire nation.', emoji: '🪑' },
      { text: 'Kings often led their armies personally into battle.', emoji: '🐎' },
      { text: 'Castles were built to protect kingdoms from invasion.', emoji: '🏯' },
      { text: 'Diplomacy and alliances were a king\u2019s most powerful tools.', emoji: '🤝' },
      { text: 'A true king rules with both strength and compassion.', emoji: '❤️' },
      { text: 'Royal bloodlines once decided who would inherit the throne.', emoji: '🩸' },
      { text: 'The greatest kingdoms were built on trust between ruler and people.', emoji: '🏯' },
    ],
  },
  astronaut: {
    title: 'Exploring the Universe',
    emoji: '🚀',
    color: '#6366f1',
    messages: [
      { text: 'Astronauts are highly trained space explorers.', emoji: '👨‍🚀' },
      { text: 'Becoming an astronaut requires years of education and training.', emoji: '📚' },
      { text: 'Astronauts experience microgravity while in space.', emoji: '🛰️' },
      { text: 'Space missions help us learn more about our universe.', emoji: '🌌' },
      { text: 'Astronauts conduct scientific experiments in orbit.', emoji: '🔬' },
      { text: 'The International Space Station travels around Earth every 90 minutes.', emoji: '🛰️' },
      { text: 'Astronauts train underwater to prepare for spacewalks.', emoji: '🤿' },
      { text: 'Living in space requires both physical and mental strength.', emoji: '💪' },
      { text: 'Astronauts inspire future generations to explore science and technology.', emoji: '🔭' },
      { text: 'Every space mission expands human knowledge.', emoji: '🧠' },
      { text: 'Space exploration helps improve life on Earth.', emoji: '🌍' },
      { text: 'Astronauts represent humanity\u2019s desire to explore the unknown.', emoji: '✨' },
      { text: 'In space, sunrises and sunsets happen multiple times a day.', emoji: '🌅' },
      { text: 'Astronauts must learn to operate complex spacecraft systems.', emoji: '🛸' },
      { text: 'Spacesuits protect astronauts from extreme temperatures and radiation.', emoji: '🧑‍🚀' },
      { text: 'Rockets must reach incredible speeds to escape Earth\u2019s gravity.', emoji: '🔥' },
      { text: 'Astronauts often work alongside scientists from many countries.', emoji: '🤝' },
      { text: 'Years of preparation go into every minute spent in orbit.', emoji: '⏳' },
      { text: 'Some astronauts spend over a year aboard a single mission.', emoji: '🗓️' },
      { text: 'Looking at Earth from space changes how astronauts see the world.', emoji: '🌎' },
    ],
  },
  avenger: {
    title: 'The Spirit of a Hero',
    emoji: '⚡',
    color: '#ef4444',
    messages: [
      { text: 'True heroes use their strength to protect others.', emoji: '🛡️' },
      { text: 'Great heroes are defined by their courage and determination.', emoji: '🔥' },
      { text: 'Teamwork is one of the most important qualities of an Avenger.', emoji: '🤝' },
      { text: 'Heroes often face challenges that seem impossible.', emoji: '⚡' },
      { text: 'Leadership and responsibility go hand in hand.', emoji: '🦸' },
      { text: 'Courage means acting despite fear.', emoji: '💪' },
      { text: 'Every hero starts as an ordinary person who chooses to do the right thing.', emoji: '🌟' },
      { text: 'Heroes inspire people through their actions.', emoji: '✨' },
      { text: 'Protecting others requires sacrifice and dedication.', emoji: '❤️' },
      { text: 'The greatest heroes never give up.', emoji: '🚀' },
      { text: 'Strength is important, but character is what truly defines a hero.', emoji: '🧠' },
      { text: 'Every challenge is an opportunity to become stronger.', emoji: '💥' },
      { text: 'Heroes rise to the occasion when the world needs them most.', emoji: '🌍' },
      { text: 'A true team is stronger than any single hero alone.', emoji: '🤜🤛' },
      { text: 'Heroes often hide their struggles behind their strength.', emoji: '🎭' },
      { text: 'Justice and fairness guide a hero\u2019s every decision.', emoji: '⚖️' },
      { text: 'Heroes train relentlessly to master their unique abilities.', emoji: '🏋️' },
      { text: 'A hero\u2019s greatest power is often their unwavering will.', emoji: '🔋' },
      { text: 'Every hero has a weakness, but it\u2019s how they overcome it that matters.', emoji: '🛡️' },
      { text: 'Heroes remind us that anyone can choose to make a difference.', emoji: '🌟' },
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
  const key = templateName?.toLowerCase().trim();
  const config = (key && TEMPLATE_LOADING[key]) || DEFAULT_LOADING;

  // Debug logging — trace exactly what template name arrived and what was matched.
  console.log('Template received by Loading Screen:', templateName);
  console.log('Normalized key used for lookup:', key);
  console.log('Loading Config selected:', config === DEFAULT_LOADING ? 'DEFAULT_LOADING (no match found!)' : key);

  return config;
}

function LoadingScreen({ userName, templateName }) {
  const config = useMemo(() => getTemplateConfig(templateName), [templateName]);

  // Debug: confirm the LoadingScreen actually received a templateName prop at all.
  useEffect(() => {
    console.log('Template received by Loading Screen:', templateName);
    console.log('Loading Config:', config);
    if (!templateName) {
      console.warn('LoadingScreen received no templateName prop — check the parent component / navigation flow.');
    }
  }, [templateName, config]);

  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  // Rotate messages with fade — every 3.5s, matching the 3-4s cadence for immersive reading
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((p) => (p + 1) % config.messages.length);
        setVisible(true);
      }, 400);
    }, 3500);
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
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px', marginTop: '22px', maxWidth: '300px', margin: '22px auto 0' }}>
              {config.messages.map((_, i) => (
                <div key={i} style={{
                  width: i === msgIdx ? '20px' : '6px', height: '6px', borderRadius: '3px',
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