/**
 * AnimatedText.jsx — Comprehensive text animation library
 *
 * Exports:
 *   CharMorph          — per-character blur + drop stagger
 *   WordMorph          — per-word horizontal blur slide
 *   TextShuffle        — hacker glyph scramble reveal
 *   TextDecrypt        — decrypt from "???" to real chars
 *   TextFlip           — 3D Y-axis flip per character
 *   RotatingText       — cycling phrases with blur transition
 *   WaveText           — sine-wave oscillation per character
 *   GlitchText         — CSS chromatic-aberration glitch
 *   ClipReveal         — clip-path bottom-up reveal per char
 *   ElasticText        — spring-physics bounce per character
 *   MagneticText       — mouse repulsion per character
 *   ChromaticText      — RGB channel offset that resolves
 *   InfiniteMarquee    — seamless horizontal scroll ticker
 *   PerspectiveText    — 3D perspective tilt-in per character
 *   PageHeading        — composite heading component
 */

import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';

/* ── Shared constants ──────────────────────────────────── */
const EASE       = [0.22, 1, 0.36, 1];
const EASE_BACK  = [0.34, 1.56, 0.64, 1];
const EASE_CIRC  = [0.85, 0, 0.15, 1];
const GLYPHS     = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?';
const rng        = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/* ════════════════════════════════════════════════════════
   1. CHAR MORPH — blur + drop, staggered per character
   ════════════════════════════════════════════════════════ */
export function CharMorph({ text, style = {}, className = '', stagger = 0.035, delay = 0 }) {
  const container = {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    exit:    { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
  };
  const item = {
    hidden:  { opacity: 0, y: 20, filter: 'blur(8px)', scale: 0.82 },
    visible: { opacity: 1, y: 0,  filter: 'blur(0px)', scale: 1,
               transition: { duration: 0.48, ease: EASE } },
    exit:    { opacity: 0, y: -14, filter: 'blur(8px)', scale: 0.88,
               transition: { duration: 0.22, ease: EASE_CIRC } },
  };
  return (
    <motion.span variants={container} initial="hidden" animate="visible" exit="exit"
      style={{ display: 'inline-flex', flexWrap: 'wrap', ...style }} className={className}>
      {text.split('').map((ch, i) => (
        <motion.span key={i} variants={item}
          style={{ display: 'inline-block', whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════
   2. WORD MORPH — per-word horizontal blur slide
   ════════════════════════════════════════════════════════ */
export function WordMorph({ text, style = {}, className = '', stagger = 0.1, delay = 0 }) {
  const container = {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    exit:    { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
  };
  const item = {
    hidden:  { opacity: 0, x: -18, filter: 'blur(10px)' },
    visible: { opacity: 1, x: 0,   filter: 'blur(0px)',
               transition: { duration: 0.52, ease: EASE } },
    exit:    { opacity: 0, x: 18,  filter: 'blur(10px)',
               transition: { duration: 0.22, ease: EASE_CIRC } },
  };
  return (
    <motion.span variants={container} initial="hidden" animate="visible" exit="exit"
      style={{ display: 'inline-flex', gap: '0.28em', flexWrap: 'wrap', ...style }} className={className}>
      {text.split(' ').map((w, i) => (
        <motion.span key={i} variants={item} style={{ display: 'inline-block' }}>{w}</motion.span>
      ))}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════
   3. TEXT SHUFFLE — hacker glyph scramble reveal
   ════════════════════════════════════════════════════════ */
export function TextShuffle({ text, style = {}, className = '', duration = 900, delay = 0 }) {
  const [displayed, setDisplayed] = useState(() => text.replace(/[^\s]/g, rng));
  const frameRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      const start = performance.now();
      const chars = text.split('');
      const tick = (now) => {
        if (!alive) return;
        const p = Math.min((now - start) / duration, 1);
        const rev = Math.floor(p * chars.length);
        setDisplayed(chars.map((c, i) => (c === ' ' ? ' ' : i < rev ? c : rng())).join(''));
        if (p < 1) frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    }, delay * 1000);
    return () => { alive = false; clearTimeout(t); cancelAnimationFrame(frameRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ fontFamily: 'monospace', letterSpacing: '0.04em', ...style }} className={className}>
      {displayed}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════
   4. TEXT DECRYPT — "???" → real characters left to right
   ════════════════════════════════════════════════════════ */
export function TextDecrypt({ text, style = {}, className = '', duration = 1200, delay = 0 }) {
  const [displayed, setDisplayed] = useState(() => text.replace(/[^\s]/g, '?'));
  const frameRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(() => {
      const start = performance.now();
      const chars = text.split('');
      const CYCLES = 8;
      let cycleCount = 0;
      const tick = (now) => {
        if (!alive) return;
        const elapsed = now - start;
        const p = Math.min(elapsed / duration, 1);
        const rev = Math.floor(p * chars.length);
        cycleCount++;
        setDisplayed(
          chars.map((c, i) => {
            if (c === ' ') return ' ';
            if (i < rev) return c;
            return cycleCount % 3 === 0 ? rng() : '?';
          }).join('')
        );
        if (p < 1) frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    }, delay * 1000);
    return () => { alive = false; clearTimeout(t); cancelAnimationFrame(frameRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ fontFamily: 'monospace', letterSpacing: '0.08em', ...style }} className={className}>
      {displayed}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════
   5. TEXT FLIP — 3D Y-axis flip per character
   ════════════════════════════════════════════════════════ */
export function TextFlip({ text, style = {}, className = '', stagger = 0.04, delay = 0 }) {
  const container = {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    exit:    { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
  };
  const item = {
    hidden:  { opacity: 0, rotateY: 90,  scale: 0.8 },
    visible: { opacity: 1, rotateY: 0,   scale: 1,
               transition: { duration: 0.42, ease: EASE_BACK } },
    exit:    { opacity: 0, rotateY: -90, scale: 0.8,
               transition: { duration: 0.2, ease: EASE_CIRC } },
  };
  return (
    <motion.span variants={container} initial="hidden" animate="visible" exit="exit"
      style={{ display: 'inline-flex', perspective: 600, ...style }} className={className}>
      {text.split('').map((ch, i) => (
        <motion.span key={i} variants={item}
          style={{ display: 'inline-block', transformStyle: 'preserve-3d',
                   whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════
   6. ROTATING TEXT — cycling phrases with blur transition
   ════════════════════════════════════════════════════════ */
export function RotatingText({ phrases, style = {}, className = '', interval = 3000 }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % phrases.length), interval);
    return () => clearInterval(id);
  }, [phrases.length, interval]);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }} className={className}>
      <AnimatePresence mode="wait">
        <motion.span key={index}
          initial={{ opacity: 0, y: 12, filter: 'blur(6px)', rotateX: -30 }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)', rotateX: 0,
                     transition: { duration: 0.42, ease: EASE } }}
          exit={{    opacity: 0, y: -12, filter: 'blur(6px)', rotateX: 30,
                     transition: { duration: 0.26, ease: EASE_CIRC } }}
          style={{ display: 'inline-block' }}>
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   7. WAVE TEXT — sine-wave oscillation, staggered per char
   ════════════════════════════════════════════════════════ */
export function WaveText({ text, style = {}, className = '', amplitude = 8, speed = 1.4 }) {
  const chars = text.split('');
  const [tick, setTick] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const animate = (now) => {
      if (!startRef.current) startRef.current = now;
      setTick(now - startRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <span style={{ display: 'inline-flex', ...style }} className={className}>
      {chars.map((ch, i) => {
        const y = amplitude * Math.sin((tick / 1000) * speed * Math.PI * 2 + (i * 0.5));
        return (
          <span key={i} style={{ display: 'inline-block', transform: `translateY(${y}px)`,
                                  whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        );
      })}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   8. GLITCH TEXT — CSS chromatic-aberration + jitter
   ════════════════════════════════════════════════════════ */
export function GlitchText({ text, style = {}, className = '', intensity = 1 }) {
  const [glitching, setGlitching] = useState(true);
  const timerRef = useRef(null);

  const scheduleNext = useCallback(() => {
    const wait = 2500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setGlitching(true);
      setTimeout(() => { setGlitching(false); scheduleNext(); }, 500);
    }, wait);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { setGlitching(false); scheduleNext(); }, 700);
    return () => { clearTimeout(t); clearTimeout(timerRef.current); };
  }, [scheduleNext]);

  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }} className={className}>
      <span>{text}</span>
      {glitching && (
        <>
          <motion.span
            initial={{ opacity: 0.8, x: -3 * intensity }}
            animate={{ opacity: [0.8, 0, 0.7, 0], x: [-3, 3, -2, 0] * intensity }}
            transition={{ duration: 0.4, times: [0, 0.3, 0.7, 1] }}
            style={{
              position: 'absolute', inset: 0,
              color: 'rgba(255,50,100,0.85)',
              clipPath: 'inset(30% 0 40% 0)',
              pointerEvents: 'none',
            }}>
            {text}
          </motion.span>
          <motion.span
            initial={{ opacity: 0.8, x: 3 * intensity }}
            animate={{ opacity: [0.8, 0, 0.7, 0], x: [3, -3, 2, 0] * intensity }}
            transition={{ duration: 0.4, times: [0, 0.3, 0.7, 1] }}
            style={{
              position: 'absolute', inset: 0,
              color: 'rgba(0,200,255,0.85)',
              clipPath: 'inset(60% 0 10% 0)',
              pointerEvents: 'none',
            }}>
            {text}
          </motion.span>
        </>
      )}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   9. CLIP REVEAL — bottom-up clip-path per character
   ════════════════════════════════════════════════════════ */
export function ClipReveal({ text, style = {}, className = '', stagger = 0.04, delay = 0 }) {
  const container = {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  const item = {
    hidden:  { clipPath: 'inset(100% 0 0 0)', y: 8 },
    visible: { clipPath: 'inset(0% 0 0 0)',   y: 0,
               transition: { duration: 0.5, ease: EASE } },
  };
  return (
    <motion.span variants={container} initial="hidden" animate="visible"
      style={{ display: 'inline-flex', flexWrap: 'wrap', overflow: 'hidden', ...style }} className={className}>
      {text.split('').map((ch, i) => (
        <motion.span key={i} variants={item}
          style={{ display: 'inline-block', whiteSpace: ch === ' ' ? 'pre' : 'normal',
                   overflow: 'hidden', paddingBottom: 2 }}>
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════
   10. ELASTIC TEXT — spring-physics bounce per character
   ════════════════════════════════════════════════════════ */
export function ElasticText({ text, style = {}, className = '', stagger = 0.04, delay = 0 }) {
  const container = {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    exit:    { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
  };
  const item = {
    hidden:  { opacity: 0, y: 30, scaleY: 0.6 },
    visible: { opacity: 1, y: 0,  scaleY: 1,
               transition: { type: 'spring', stiffness: 380, damping: 18 } },
    exit:    { opacity: 0, y: -20, scaleY: 0.7,
               transition: { duration: 0.2, ease: EASE_CIRC } },
  };
  return (
    <motion.span variants={container} initial="hidden" animate="visible" exit="exit"
      style={{ display: 'inline-flex', flexWrap: 'wrap', ...style }} className={className}>
      {text.split('').map((ch, i) => (
        <motion.span key={i} variants={item}
          style={{ display: 'inline-block', transformOrigin: 'bottom center',
                   whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════
   11. MAGNETIC TEXT — mouse repulsion on each character
   ════════════════════════════════════════════════════════ */
function MagneticChar({ ch, strength = 22 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = 60;
    if (dist < maxDist) {
      const force = (1 - dist / maxDist) * strength;
      x.set((dx / dist) * force);
      y.set((dy / dist) * force);
    } else {
      x.set(0); y.set(0);
    }
  };
  const handleLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.span ref={ref} style={{ display: 'inline-block', x: sx, y: sy,
                                    whiteSpace: ch === ' ' ? 'pre' : 'normal',
                                    cursor: 'default' }}
      onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {ch === ' ' ? '\u00A0' : ch}
    </motion.span>
  );
}

export function MagneticText({ text, style = {}, className = '', strength = 22 }) {
  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', ...style }} className={className}>
      {text.split('').map((ch, i) => (
        <MagneticChar key={i} ch={ch} strength={strength} />
      ))}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   12. CHROMATIC TEXT — RGB shadow offset resolving in
   ════════════════════════════════════════════════════════ */
export function ChromaticText({ text, style = {}, className = '', delay = 0 }) {
  return (
    <motion.span
      initial={{ textShadow: '6px 0 rgba(255,0,80,0.9), -6px 0 rgba(0,200,255,0.9)', opacity: 0.7 }}
      animate={{ textShadow: '0px 0 rgba(255,0,80,0)', opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      style={{ display: 'inline-block', ...style }} className={className}>
      {text}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════
   13. INFINITE MARQUEE — seamless scroll ticker
   ════════════════════════════════════════════════════════ */
export function InfiniteMarquee({ items, speed = 35, style = {}, className = '', gap = 48 }) {
  const content = [...items, ...items]; // duplicate for seamless loop
  const totalW  = useMotionValue(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (wrapRef.current) {
      totalW.set(wrapRef.current.scrollWidth / 2);
    }
  });

  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', ...style }} className={className}>
      <motion.div
        ref={wrapRef}
        animate={{ x: [`0%`, `-50%`] }}
        transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
        style={{ display: 'inline-flex', gap }}
      >
        {content.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {item}
            <span style={{ color: '#405b4d', opacity: 0.4 }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   14. PERSPECTIVE TEXT — 3D tilt-in per character
   ════════════════════════════════════════════════════════ */
export function PerspectiveText({ text, style = {}, className = '', stagger = 0.05, delay = 0 }) {
  const container = {
    hidden:  {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    exit:    { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
  };
  const item = {
    hidden:  { opacity: 0, rotateX: 60, y: 14, scale: 0.85 },
    visible: { opacity: 1, rotateX: 0,  y: 0,  scale: 1,
               transition: { duration: 0.5, ease: EASE_BACK } },
    exit:    { opacity: 0, rotateX: -60, y: -14, scale: 0.85,
               transition: { duration: 0.22, ease: EASE_CIRC } },
  };
  return (
    <motion.span variants={container} initial="hidden" animate="visible" exit="exit"
      style={{ display: 'inline-flex', perspective: 500, flexWrap: 'wrap', ...style }} className={className}>
      {text.split('').map((ch, i) => (
        <motion.span key={i} variants={item}
          style={{ display: 'inline-block', transformStyle: 'preserve-3d',
                   whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════
   15. COMPOSITE PAGE HEADING  — pick effect by prop
   ════════════════════════════════════════════════════════ */
const HEADING_EFFECTS = {
  charMorph:    (text, d) => <CharMorph text={text} stagger={0.03} delay={d} />,
  wordMorph:    (text, d) => <WordMorph text={text} stagger={0.12} delay={d} />,
  shuffle:      (text, d) => <TextShuffle text={text} duration={900} delay={d} />,
  decrypt:      (text, d) => <TextDecrypt text={text} duration={1100} delay={d} />,
  flip:         (text, d) => <TextFlip text={text} stagger={0.05} delay={d} />,
  wave:         (text)    => <WaveText text={text} amplitude={6} />,
  glitch:       (text)    => <GlitchText text={text} />,
  clipReveal:   (text, d) => <ClipReveal text={text} stagger={0.04} delay={d} />,
  elastic:      (text, d) => <ElasticText text={text} stagger={0.04} delay={d} />,
  magnetic:     (text)    => <MagneticText text={text} />,
  chromatic:    (text, d) => <ChromaticText text={text} delay={d} />,
  perspective:  (text, d) => <PerspectiveText text={text} stagger={0.045} delay={d} />,
};

export function PageHeading({
  title,
  subtitle,
  badge,
  badgePhrases,
  titleEffect = 'charMorph',
  subtitleEffect = 'wordMorph',
}) {
  const renderTitle    = HEADING_EFFECTS[titleEffect]   || HEADING_EFFECTS.charMorph;
  const renderSubtitle = HEADING_EFFECTS[subtitleEffect] || HEADING_EFFECTS.wordMorph;

  return (
    <div style={{ marginBottom: 28 }}>
      {(badge || badgePhrases) && (
        <div style={{ marginBottom: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#e8eee9', color: '#405b4d', borderRadius: 999,
            padding: '3px 14px', fontSize: 12, fontWeight: 600, letterSpacing: '0.03em',
          }}>
            {badgePhrases ? <RotatingText phrases={badgePhrases} /> : badge}
          </span>
        </div>
      )}
      <h1 style={{ color: '#17241d', fontSize: 30, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
        {renderTitle(title, 0)}
      </h1>
      {subtitle && (
        <p style={{ color: '#9da49f', marginTop: 6, fontSize: 13, margin: '6px 0 0' }}>
          {renderSubtitle(subtitle, 0.18)}
        </p>
      )}
    </div>
  );
}

