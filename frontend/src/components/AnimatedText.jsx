import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/* ─── Shared easing ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];

/* ════════════════════════════════════════════════════════════
   1. CHAR MORPH  — each letter blurs + drops in, staggered
   ════════════════════════════════════════════════════════════ */
export function CharMorph({ text, style = {}, className = '', stagger = 0.035, delay = 0 }) {
  const chars = text.split('');
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    exit:   { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
  };
  const item = {
    hidden:  { opacity: 0, y: 18, filter: 'blur(8px)', scale: 0.85 },
    visible: { opacity: 1, y: 0,  filter: 'blur(0px)', scale: 1,
               transition: { duration: 0.45, ease: EASE } },
    exit:    { opacity: 0, y: -14, filter: 'blur(8px)', scale: 0.9,
               transition: { duration: 0.25, ease: EASE } },
  };
  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ display: 'inline-flex', flexWrap: 'wrap', ...style }}
      className={className}
    >
      {chars.map((ch, i) => (
        <motion.span key={i} variants={item} style={{ display: 'inline-block', whiteSpace: ch === ' ' ? 'pre' : 'normal' }}>
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════════
   2. WORD MORPH — each word blurs + slides, staggered
   ════════════════════════════════════════════════════════════ */
export function WordMorph({ text, style = {}, className = '', stagger = 0.1, delay = 0 }) {
  const words = text.split(' ');
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    exit:   { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
  };
  const item = {
    hidden:  { opacity: 0, x: -16, filter: 'blur(10px)' },
    visible: { opacity: 1, x: 0,   filter: 'blur(0px)',
               transition: { duration: 0.5, ease: EASE } },
    exit:    { opacity: 0, x: 16,  filter: 'blur(10px)',
               transition: { duration: 0.25, ease: EASE } },
  };
  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ display: 'inline-flex', gap: '0.28em', flexWrap: 'wrap', ...style }}
      className={className}
    >
      {words.map((w, i) => (
        <motion.span key={i} variants={item} style={{ display: 'inline-block' }}>
          {w}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════════
   3. TEXT SHUFFLE — chars scramble with random glyphs then settle
   ════════════════════════════════════════════════════════════ */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
function randomGlyph() { return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }

export function TextShuffle({ text, style = {}, className = '', duration = 1000, delay = 0 }) {
  const [displayed, setDisplayed] = useState(() => text.replace(/[^\s]/g, randomGlyph));
  const frameRef = useRef(null);

  useEffect(() => {
    let started = false;
    const timeout = setTimeout(() => {
      started = true;
      const total = duration;
      const start = performance.now();
      const chars = text.split('');

      function tick(now) {
        if (!started) return;
        const elapsed = now - start;
        const progress = Math.min(elapsed / total, 1);
        const revealed = Math.floor(progress * chars.length);
        setDisplayed(
          chars.map((ch, i) => {
            if (ch === ' ') return ' ';
            if (i < revealed) return ch;
            return randomGlyph();
          }).join('')
        );
        if (progress < 1) frameRef.current = requestAnimationFrame(tick);
      }
      frameRef.current = requestAnimationFrame(tick);
    }, delay * 1000);

    return () => {
      started = false;
      clearTimeout(timeout);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ fontFamily: 'monospace', ...style }}
      className={className}
    >
      {displayed}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════════
   4. TEXT FLIP — each char flips on the Y axis
   ════════════════════════════════════════════════════════════ */
export function TextFlip({ text, style = {}, className = '', stagger = 0.04, delay = 0 }) {
  const chars = text.split('');
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
    exit:   { transition: { staggerChildren: stagger / 2, staggerDirection: -1 } },
  };
  const item = {
    hidden:  { opacity: 0, rotateY: 90, scale: 0.8 },
    visible: { opacity: 1, rotateY: 0,  scale: 1,
               transition: { duration: 0.4, ease: EASE } },
    exit:    { opacity: 0, rotateY: -90, scale: 0.8,
               transition: { duration: 0.2, ease: EASE } },
  };
  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ display: 'inline-flex', perspective: 400, ...style }}
      className={className}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          variants={item}
          style={{ display: 'inline-block', transformStyle: 'preserve-3d',
                   whiteSpace: ch === ' ' ? 'pre' : 'normal' }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </motion.span>
  );
}

/* ════════════════════════════════════════════════════════════
   5. ROTATING TEXT — subtitle cycles through phrases
   ════════════════════════════════════════════════════════════ */
export function RotatingText({ phrases, style = {}, className = '', interval = 3000 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % phrases.length), interval);
    return () => clearInterval(id);
  }, [phrases.length, interval]);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }} className={className}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)', rotateX: -30 }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)', rotateX: 0,
                     transition: { duration: 0.45, ease: EASE } }}
          exit={{    opacity: 0, y: -14, filter: 'blur(6px)', rotateX: 30,
                     transition: { duration: 0.28, ease: EASE } }}
          style={{ display: 'inline-block' }}
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
   6. ANIMATED PAGE HEADING — combines CharMorph title +
      WordMorph subtitle + optional RotatingText badge
   Use this on every page for a unified morph-on-mount effect.
   ════════════════════════════════════════════════════════════ */
export function PageHeading({ title, subtitle, badge, badgePhrases }) {
  return (
    <div style={{ marginBottom: 28 }}>
      {/* Badge / rotating tag above title */}
      {(badge || badgePhrases) && (
        <div style={{ marginBottom: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#e8eee9', color: '#405b4d', borderRadius: 999,
            padding: '3px 12px', fontSize: 12, fontWeight: 600, letterSpacing: '0.03em',
          }}>
            {badgePhrases
              ? <RotatingText phrases={badgePhrases} />
              : badge}
          </span>
        </div>
      )}

      {/* Title — character-level morph */}
      <h1 style={{ color: '#17241d', fontSize: 30, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
        <CharMorph text={title} stagger={0.03} />
      </h1>

      {/* Subtitle — word-level morph, slight delay */}
      {subtitle && (
        <p style={{ color: '#9da49f', marginTop: 6, fontSize: 13 }}>
          <WordMorph text={subtitle} stagger={0.07} delay={0.18} />
        </p>
      )}
    </div>
  );
}
