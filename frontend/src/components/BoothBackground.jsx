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
  @keyframes pb-float-reverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(18px) rotate(-3deg); }
  }
  @keyframes pb-orbit {
    from { transform: rotate(0deg) translateX(180px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(180px) rotate(-360deg); }
  }
  @keyframes pb-orb-pulse {
    0%, 100% { opacity: 0.1; transform: scale(1); }
    50%       { opacity: 0.22; transform: scale(1.1); }
  }
  @keyframes pb-scan-line {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 0.06; }
    90%  { opacity: 0.06; }
    100% { transform: translateY(200%); opacity: 0; }
  }
  @keyframes pb-corner-glow {
    0%, 100% { opacity: 0.35; }
    50%       { opacity: 0.65; }
  }
  @keyframes pb-ray {
    0%   { opacity: 0; transform: scaleY(0.3); }
    40%  { opacity: 1; }
    100% { opacity: 0; transform: scaleY(1.2); }
  }
  @keyframes pb-polaroid-float {
    0%, 100% { transform: translateY(0px) rotate(var(--pr)) scale(1); }
    50%       { transform: translateY(-14px) rotate(calc(var(--pr) + 3deg)) scale(1.02); }
  }
  @keyframes pb-frame-drift {
    0%, 100% { transform: translateY(0px) rotate(var(--fr)); }
    50%       { transform: translateY(-18px) rotate(calc(var(--fr) - 4deg)); }
  }
  @keyframes pb-glow-blob {
    0%, 100% { opacity: 0.08; transform: scale(1) translate(0,0); }
    33%       { opacity: 0.16; transform: scale(1.12) translate(10px, -8px); }
    66%       { opacity: 0.1; transform: scale(0.95) translate(-6px, 10px); }
  }
  @keyframes pb-star-twinkle {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50%       { opacity: 0.9; transform: scale(1.2); }
  }
  .pb-sparkle      { position: absolute; border-radius: 50%; pointer-events: none; animation: pb-sparkle 5s ease-out infinite; }
  .pb-float-emoji  { position: absolute; pointer-events: none; user-select: none; animation: pb-float-slow 4s ease-in-out infinite; }
  .pb-float-rev    { position: absolute; pointer-events: none; user-select: none; animation: pb-float-reverse 5s ease-in-out infinite; }
  .pb-orb          { position: absolute; border-radius: 50%; pointer-events: none; animation: pb-orb-pulse 7s ease-in-out infinite; filter: blur(70px); }
  .pb-scan         { position: absolute; left: 0; right: 0; height: 2px; pointer-events: none; animation: pb-scan-line 10s linear infinite; background: linear-gradient(to right, transparent, rgba(139,92,246,0.35), transparent); }
  .pb-grid         { position: absolute; inset: 0; pointer-events: none; opacity: 0.022; background-image: linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px); background-size: 52px 52px; }
  .pb-corner       { position: absolute; pointer-events: none; animation: pb-corner-glow 3s ease-in-out infinite; }
  .pb-ray          { position: absolute; pointer-events: none; animation: pb-ray 6s ease-in-out infinite; transform-origin: top center; }
  .pb-star         { position: absolute; pointer-events: none; animation: pb-star-twinkle 2s ease-in-out infinite; border-radius: 50%; }
  .pb-polaroid     { position: absolute; pointer-events: none; animation: pb-polaroid-float 5s ease-in-out infinite; }
  .pb-frame        { position: absolute; pointer-events: none; animation: pb-frame-drift 6s ease-in-out infinite; }
  .pb-blob         { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(90px); animation: pb-glow-blob 9s ease-in-out infinite; }
`;

export const boothStyles = SHARED_STYLES;

export default function BoothBackground({ emojis = [], extraOrbs = [] }) {
  const sparkles = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${5 + Math.random() * 90}%`,
    top: `${5 + Math.random() * 90}%`,
    delay: `${Math.random() * 7}s`,
    duration: `${3 + Math.random() * 4}s`,
    size: `${1.5 + Math.random() * 3.5}px`,
    color: i % 4 === 0 ? '#6366f1' : i % 4 === 1 ? '#8b5cf6' : i % 4 === 2 ? '#ec4899' : '#f472b6',
  })), []);

  const stars = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 4}s`,
    duration: `${1.5 + Math.random() * 2.5}s`,
    size: `${2 + Math.random() * 4}px`,
    color: i % 3 === 0 ? '#a78bfa' : i % 3 === 1 ? '#f472b6' : '#fbbf24',
  })), []);

  const defaultEmojis = emojis.length ? emojis : [
    { e: '✨', top: '8%',  left: '6%',  delay: '0s',    size: '32px', opacity: 0.18 },
    { e: '🌟', top: '12%', right: '7%', delay: '1.4s',  size: '28px', opacity: 0.15 },
    { e: '✦',  bottom: '9%', left: '8%',  delay: '2.2s', size: '24px', opacity: 0.15 },
    { e: '✦',  bottom: '12%', right: '6%', delay: '0.8s', size: '28px', opacity: 0.18 },
  ];

  // Extra camera icons and decorative emojis scattered around
  const extraDecorations = [
    { e: '📸', top: '35%',  left: '3%',  delay: '0.5s',  size: '30px', opacity: 0.12, rev: true },
    { e: '📷', top: '55%',  right: '3%', delay: '1.8s',  size: '26px', opacity: 0.11, rev: false },
    { e: '✨', top: '25%',  left: '8%',  delay: '3s',    size: '20px', opacity: 0.14, rev: true },
    { e: '✨', top: '70%',  right: '8%', delay: '2.5s',  size: '18px', opacity: 0.13, rev: false },
    { e: '⭐', top: '45%',  left: '2%',  delay: '1s',    size: '22px', opacity: 0.1,  rev: true },
    { e: '💫', bottom: '25%', left: '4%', delay: '0.3s', size: '24px', opacity: 0.12, rev: false },
    { e: '💫', top: '18%',  right: '3%', delay: '2.8s',  size: '20px', opacity: 0.1,  rev: true },
  ];

  // Polaroid cards
  const polaroids = useMemo(() => [
    { top: '8%', left: '-2%', rotate: '-12deg', delay: '0s', duration: '7s', size: 52, color: '#6366f133' },
    { bottom: '5%', right: '-2%', rotate: '10deg', delay: '2s', duration: '6s', size: 48, color: '#ec489933' },
    { top: '50%', left: '-3%', rotate: '-6deg', delay: '1s', duration: '8s', size: 44, color: '#8b5cf633' },
    { top: '20%', right: '-2%', rotate: '8deg', delay: '3s', duration: '7s', size: 46, color: '#f472b633' },
  ], []);

  // Photo frames
  const frames = useMemo(() => [
    { top: '60%', left: '1%', rotate: '5deg', delay: '1.5s', duration: '9s', w: 36, h: 44 },
    { bottom: '15%', right: '1%', rotate: '-7deg', delay: '0.5s', duration: '7s', w: 32, h: 40 },
  ], []);

  // Light rays
  const rays = useMemo(() => [
    { left: '10%', top: '0', delay: '0s', duration: '8s', width: '1px', height: '30%', opacity: 0.04 },
    { left: '25%', top: '0', delay: '3s', duration: '6s', width: '1px', height: '22%', opacity: 0.03 },
    { right: '15%', top: '0', delay: '1.5s', duration: '9s', width: '1px', height: '28%', opacity: 0.04 },
    { right: '30%', top: '0', delay: '4s', duration: '7s', width: '1px', height: '20%', opacity: 0.03 },
  ], []);

  const orbs = [
    { width: 450, height: 450, top: '-12%', left: '-10%', color: 'rgba(99,102,241,0.13)',  delay: '0s',   duration: '9s' },
    { width: 380, height: 380, bottom: '-10%', right: '-8%', color: 'rgba(236,72,153,0.11)', delay: '3.5s', duration: '11s' },
    { width: 280, height: 280, top: '30%',  left: '38%',  color: 'rgba(139,92,246,0.09)',  delay: '1.5s', duration: '8s' },
    { width: 220, height: 220, top: '10%',  right: '15%', color: 'rgba(244,114,182,0.08)', delay: '2s',   duration: '10s' },
    ...extraOrbs,
  ];

  // Gradient blobs
  const blobs = [
    { width: 300, height: 200, top: '20%', left: '60%', color: 'rgba(168,85,247,0.12)', delay: '0s', duration: '12s' },
    { width: 250, height: 180, top: '65%', left: '5%',  color: 'rgba(236,72,153,0.1)', delay: '4s', duration: '10s' },
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

      {/* Gradient blobs */}
      {blobs.map((b, i) => (
        <div key={i} className="pb-blob" style={{
          width: b.width, height: b.height,
          top: b.top, left: b.left,
          background: `radial-gradient(ellipse, ${b.color}, transparent 70%)`,
          animationDelay: b.delay, animationDuration: b.duration,
        }} />
      ))}

      {/* Light rays */}
      {rays.map((r, i) => (
        <div key={i} className="pb-ray" style={{
          left: r.left, right: r.right, top: r.top,
          width: r.width, height: r.height,
          background: `linear-gradient(to bottom, rgba(168,85,247,${r.opacity * 8}), transparent)`,
          opacity: r.opacity * 8,
          animationDelay: `${i * 1.5}s`, animationDuration: r.duration,
        }} />
      ))}

      {/* Scan lines */}
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

      {/* Star twinkles */}
      {stars.map((s) => (
        <div key={s.id} className="pb-star" style={{
          left: s.left, top: s.top,
          animationDelay: s.delay, animationDuration: s.duration,
          width: s.size, height: s.size, background: s.color,
          boxShadow: `0 0 ${parseInt(s.size) * 2}px ${s.color}`,
        }} />
      ))}

      {/* Floating decorative emojis (passed in) */}
      {defaultEmojis.map((d, i) => (
        <div key={i} className="pb-float-emoji" style={{
          fontSize: d.size || '36px', opacity: d.opacity || 0.15,
          animationDelay: d.delay,
          top: d.top, left: d.left, right: d.right, bottom: d.bottom,
        }}>{d.e}</div>
      ))}

      {/* Extra scattered decorations */}
      {extraDecorations.map((d, i) => (
        <div key={`ex-${i}`} className={d.rev ? 'pb-float-rev' : 'pb-float-emoji'} style={{
          fontSize: d.size, opacity: d.opacity,
          animationDelay: d.delay,
          top: d.top, left: d.left, right: d.right, bottom: d.bottom,
        }}>{d.e}</div>
      ))}

      {/* Polaroid cards */}
      {polaroids.map((p, i) => (
        <div key={`pol-${i}`} className="pb-polaroid" style={{
          top: p.top, left: p.left, right: p.right, bottom: p.bottom,
          width: `${p.size}px`,
          '--pr': p.rotate,
          animationDelay: p.delay, animationDuration: p.duration,
          opacity: 0.15,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '4px',
            padding: '4px 4px 12px 4px',
            transform: `rotate(${p.rotate})`,
            backdropFilter: 'blur(4px)',
            boxShadow: `0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`,
          }}>
            <div style={{
              width: '100%', aspectRatio: '1',
              background: p.color,
              borderRadius: '2px',
            }} />
          </div>
        </div>
      ))}

      {/* Photo frames */}
      {frames.map((f, i) => (
        <div key={`frm-${i}`} className="pb-frame" style={{
          top: f.top, left: f.left, right: f.right, bottom: f.bottom,
          '--fr': f.rotate,
          animationDelay: f.delay, animationDuration: f.duration,
          opacity: 0.1,
        }}>
          <div style={{
            width: `${f.w}px`, height: `${f.h}px`,
            border: '2px solid rgba(167,139,250,0.4)',
            borderRadius: '3px',
            transform: `rotate(${f.rotate})`,
            boxShadow: '0 0 12px rgba(139,92,246,0.2)',
          }} />
        </div>
      ))}
    </>
  );
}