/**
 * BoothBackground — shared ambient background layer for all screens.
 * Drop inside any screen's root div (position: relative, overflow: hidden).
 * All elements are purely decorative and pointer-events: none.
 */
import { useMemo } from 'react';

const SHARED_STYLES = `
  @keyframes pb-sparkle {
    0%   { opacity: 0; transform: scale(0) translateY(0); }
    45%  { opacity: 1; transform: scale(1) translateY(-30px); }
    100% { opacity: 0; transform: scale(0.6) translateY(-80px); }
  }
  @keyframes pb-float-slow {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-22px) rotate(4deg); }
  }
  @keyframes pb-orbit {
    from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
  }
  @keyframes pb-orb-pulse {
    0%, 100% { opacity: 0.12; transform: scale(1); }
    50%       { opacity: 0.22; transform: scale(1.08); }
  }
  @keyframes pb-scan-line {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 0.06; }
    90%  { opacity: 0.06; }
    100% { transform: translateY(200%); opacity: 0; }
  }
  @keyframes pb-corner-glow {
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 0.6; }
  }
  .pb-sparkle      { position: absolute; border-radius: 50%; pointer-events: none; animation: pb-sparkle 5s ease-out infinite; }
  .pb-float-emoji  { position: absolute; pointer-events: none; user-select: none; animation: pb-float-slow 4s ease-in-out infinite; }
  .pb-orb          { position: absolute; border-radius: 50%; pointer-events: none; animation: pb-orb-pulse 6s ease-in-out infinite; filter: blur(60px); }
  .pb-scan         { position: absolute; left: 0; right: 0; height: 2px; pointer-events: none; animation: pb-scan-line 8s linear infinite; background: linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent); }
  .pb-grid         { position: absolute; inset: 0; pointer-events: none; opacity: 0.025; background-image: linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px); background-size: 48px 48px; }
  .pb-corner       { position: absolute; pointer-events: none; animation: pb-corner-glow 3s ease-in-out infinite; }
`;

export const boothStyles = SHARED_STYLES;

export default function BoothBackground({ emojis = [], extraOrbs = [] }) {
  const sparkles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${5 + Math.random() * 90}%`,
    top: `${5 + Math.random() * 90}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${3 + Math.random() * 4}s`,
    size: `${1.5 + Math.random() * 3}px`,
    color: i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#8b5cf6' : '#ec4899',
  })), []);

  const defaultEmojis = emojis.length ? emojis : [
    { e: '✨', top: '8%',  left: '6%',  delay: '0s',    size: '32px', opacity: 0.18 },
    { e: '🌟', top: '12%', right: '7%', delay: '1.4s',  size: '28px', opacity: 0.15 },
    { e: '✦',  bottom: '9%', left: '8%',  delay: '2.2s', size: '24px', opacity: 0.15 },
    { e: '✦',  bottom: '12%', right: '6%', delay: '0.8s', size: '28px', opacity: 0.18 },
  ];

  const orbs = [
    { width: 400, height: 400, top: '-10%', left: '-8%',  color: 'rgba(99,102,241,0.15)',  delay: '0s',   duration: '8s' },
    { width: 350, height: 350, bottom: '-8%', right: '-6%', color: 'rgba(236,72,153,0.12)', delay: '3s',   duration: '10s' },
    { width: 250, height: 250, top: '30%',  left: '40%',  color: 'rgba(139,92,246,0.1)',   delay: '1.5s', duration: '7s' },
    ...extraOrbs,
  ];

  return (
    <>
      <style>{SHARED_STYLES}</style>

      {/* Subtle grid */}
      <div className="pb-grid" />

      {/* Ambient orbs */}
      {orbs.map((o, i) => (
        <div key={i} className="pb-orb" style={{
          width: o.width, height: o.height,
          top: o.top, left: o.left, right: o.right, bottom: o.bottom,
          background: o.color,
          animationDelay: o.delay, animationDuration: o.duration,
        }} />
      ))}

      {/* Scan line */}
      <div className="pb-scan" style={{ top: '30%', animationDelay: '2s' }} />
      <div className="pb-scan" style={{ top: '65%', animationDelay: '6s' }} />

      {/* Corner accents */}
      {[
        { top: 0,    left: 0,    borderTop: '2px solid rgba(139,92,246,0.3)', borderLeft:  '2px solid rgba(139,92,246,0.3)', borderRadius: '0 0 12px 0' },
        { top: 0,    right: 0,   borderTop: '2px solid rgba(236,72,153,0.25)', borderRight: '2px solid rgba(236,72,153,0.25)', borderRadius: '0 0 0 12px' },
        { bottom: 0, left: 0,    borderBottom: '2px solid rgba(99,102,241,0.25)', borderLeft: '2px solid rgba(99,102,241,0.25)', borderRadius: '0 12px 0 0' },
        { bottom: 0, right: 0,   borderBottom: '2px solid rgba(139,92,246,0.2)', borderRight: '2px solid rgba(139,92,246,0.2)', borderRadius: '12px 0 0 0' },
      ].map((s, i) => (
        <div key={i} className="pb-corner" style={{
          position: 'absolute', width: '40px', height: '40px', animationDelay: `${i * 0.7}s`, ...s,
        }} />
      ))}

      {/* Sparkle particles */}
      {sparkles.map((s) => (
        <div key={s.id} className="pb-sparkle" style={{
          left: s.left, top: s.top,
          animationDelay: s.delay, animationDuration: s.duration,
          width: s.size, height: s.size, background: s.color,
        }} />
      ))}

      {/* Floating decorative emojis */}
      {defaultEmojis.map((d, i) => (
        <div key={i} className="pb-float-emoji" style={{
          fontSize: d.size || '36px', opacity: d.opacity || 0.15,
          animationDelay: d.delay,
          top: d.top, left: d.left, right: d.right, bottom: d.bottom,
        }}>{d.e}</div>
      ))}
    </>
  );
}