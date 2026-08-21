/**
 * RouteTransition.jsx
 * Cinematic page-transition engine.
 *
 * On every route change a new effect is randomly picked from EFFECTS[].
 * The overlay system:
 *   1. Overlay COVERS the screen (500ms)
 *   2. Route content swaps behind it
 *   3. Overlay REVEALS the new content (500ms)
 *
 * Effects included (30+):
 *   Curtain · Iris/Circle · Diagonal Wipe · Horizontal Wipe · Vertical Wipe ·
 *   Glitch · Zoom-In · Zoom-Out · Motion Blur · Perspective Flip ·
 *   Split-Vertical · Split-Horizontal · Chromatic Aberration ·
 *   Pixel Dissolve · Radial Mask · Liquid Distort · Neumorphic ·
 *   Glassmorphism · Hero Scale · Spring Physics · Cinematic ·
 *   Crossfade · Scroll Snap · Diagonal Split · Corner Reveal · Stagger Tiles
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';

/* ──────────────────────────────────────────────────────────
   EFFECT DEFINITIONS
   Each effect has: name, cover(), reveal(), style?, overlay?
   cover  = motion props while overlay is covering the screen
   reveal = motion props while overlay is revealing new content
────────────────────────────────────────────────────────── */
const EASE_EXPO  = [0.77, 0, 0.18, 1];
const EASE_BACK  = [0.34, 1.56, 0.64, 1];
const EASE_CIRC  = [0.85, 0, 0.15, 1];

const EFFECTS = [
  /* ── Curtain Drop ── */
  {
    name: 'Curtain',
    overlay: true,
    cover:  {
      initial: { scaleY: 0, originY: 0 },
      animate: { scaleY: 1 },
      transition: { duration: 0.45, ease: EASE_EXPO },
    },
    reveal: {
      initial: { scaleY: 1, originY: 1 },
      animate: { scaleY: 0 },
      transition: { duration: 0.45, ease: EASE_EXPO, delay: 0.05 },
    },
    overlayStyle: {
      background: 'linear-gradient(160deg, #405b4d 0%, #17241d 100%)',
    },
  },

  /* ── Iris / Circle ── */
  {
    name: 'Iris',
    overlay: true,
    cover: {
      initial: { clipPath: 'circle(0% at 50% 50%)' },
      animate: { clipPath: 'circle(150% at 50% 50%)' },
      transition: { duration: 0.55, ease: EASE_EXPO },
    },
    reveal: {
      initial: { clipPath: 'circle(150% at 50% 50%)' },
      animate: { clipPath: 'circle(0% at 50% 50%)' },
      transition: { duration: 0.5, ease: EASE_EXPO, delay: 0.05 },
    },
    overlayStyle: { background: '#17241d' },
  },

  /* ── Horizontal Wipe ── */
  {
    name: 'Wipe',
    overlay: true,
    cover: {
      initial: { scaleX: 0, originX: 0 },
      animate: { scaleX: 1 },
      transition: { duration: 0.42, ease: EASE_EXPO },
    },
    reveal: {
      initial: { scaleX: 1, originX: 1 },
      animate: { scaleX: 0 },
      transition: { duration: 0.42, ease: EASE_EXPO, delay: 0.05 },
    },
    overlayStyle: { background: '#405b4d' },
  },

  /* ── Diagonal Wipe ── */
  {
    name: 'Diagonal',
    overlay: true,
    cover: {
      initial: { clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' },
      animate: { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' },
      transition: { duration: 0.5, ease: EASE_CIRC },
    },
    reveal: {
      initial: { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' },
      animate: { clipPath: 'polygon(100% 0,100% 0,100% 100%,100% 100%)' },
      transition: { duration: 0.5, ease: EASE_CIRC, delay: 0.05 },
    },
    overlayStyle: {
      background: 'linear-gradient(135deg, #405b4d, #789381)',
    },
  },

  /* ── Split Vertical (two panels) ── */
  {
    name: 'Split',
    overlay: true,
    isSplit: true,
    cover: {
      initial: { scaleX: 0 },
      animate: { scaleX: 1 },
      transition: { duration: 0.4, ease: EASE_EXPO },
    },
    reveal: {
      initial: { scaleX: 1 },
      animate: { scaleX: 0 },
      transition: { duration: 0.4, ease: EASE_EXPO, delay: 0.05 },
    },
    overlayStyle: { background: '#405b4d' },
  },

  /* ── Glitch ── */
  {
    name: 'Glitch',
    overlay: false,
    contentVariants: {
      initial: {
        opacity: 0,
        filter: 'hue-rotate(90deg) saturate(5) blur(4px)',
        x: 8,
      },
      animate: {
        opacity: 1,
        filter: 'hue-rotate(0deg) saturate(1) blur(0px)',
        x: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
      },
      exit: {
        opacity: 0,
        filter: 'hue-rotate(-90deg) saturate(5) blur(4px)',
        x: -8,
        transition: { duration: 0.28, ease: 'easeIn' },
      },
    },
  },

  /* ── Zoom Morph In ── */
  {
    name: 'Zoom',
    overlay: false,
    contentVariants: {
      initial: { opacity: 0, scale: 0.88, filter: 'blur(8px)' },
      animate: {
        opacity: 1, scale: 1, filter: 'blur(0px)',
        transition: { duration: 0.5, ease: EASE_BACK },
      },
      exit: {
        opacity: 0, scale: 1.08, filter: 'blur(8px)',
        transition: { duration: 0.28, ease: EASE_CIRC },
      },
    },
  },

  /* ── Motion Blur ── */
  {
    name: 'MotionBlur',
    overlay: false,
    contentVariants: {
      initial: { opacity: 0, y: 40, filter: 'blur(20px)' },
      animate: {
        opacity: 1, y: 0, filter: 'blur(0px)',
        transition: { duration: 0.45, ease: EASE_EXPO },
      },
      exit: {
        opacity: 0, y: -40, filter: 'blur(20px)',
        transition: { duration: 0.28, ease: EASE_EXPO },
      },
    },
  },

  /* ── Perspective Flip ── */
  {
    name: 'Perspective',
    overlay: false,
    contentVariants: {
      initial: {
        opacity: 0, rotateX: 15, scale: 0.92,
        transformPerspective: 1200, filter: 'blur(4px)',
      },
      animate: {
        opacity: 1, rotateX: 0, scale: 1,
        transformPerspective: 1200, filter: 'blur(0px)',
        transition: { duration: 0.5, ease: EASE_BACK },
      },
      exit: {
        opacity: 0, rotateX: -15, scale: 0.92,
        transformPerspective: 1200, filter: 'blur(4px)',
        transition: { duration: 0.28, ease: EASE_CIRC },
      },
    },
  },

  /* ── Chromatic Aberration ── */
  {
    name: 'Chromatic',
    overlay: false,
    contentVariants: {
      initial: {
        opacity: 0,
        filter: 'blur(0px)',
        x: 0,
      },
      animate: {
        opacity: 1, x: 0, filter: 'blur(0px)',
        transition: { duration: 0.55, ease: EASE_EXPO },
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.3, ease: EASE_CIRC },
      },
    },
    chromatic: true,
  },

  /* ── Glassmorphism (blur + scale) ── */
  {
    name: 'Glass',
    overlay: false,
    contentVariants: {
      initial: {
        opacity: 0, scale: 1.04,
        filter: 'blur(24px) brightness(1.4)',
        backdropFilter: 'blur(16px)',
      },
      animate: {
        opacity: 1, scale: 1,
        filter: 'blur(0px) brightness(1)',
        transition: { duration: 0.55, ease: EASE_EXPO },
      },
      exit: {
        opacity: 0, scale: 0.96,
        filter: 'blur(24px) brightness(1.4)',
        transition: { duration: 0.3, ease: EASE_CIRC },
      },
    },
  },

  /* ── Cinematic (letterbox bars) ── */
  {
    name: 'Cinematic',
    overlay: true,
    isCinematic: true,
    cover: {
      initial: { scaleY: 0, originY: 0 },
      animate: { scaleY: 1 },
      transition: { duration: 0.3, ease: EASE_EXPO },
    },
    reveal: {
      initial: { scaleY: 1, originY: 1 },
      animate: { scaleY: 0 },
      transition: { duration: 0.3, ease: EASE_EXPO, delay: 0.1 },
    },
    overlayStyle: { background: '#0a0f0c' },
  },

  /* ── Scale Fade ── */
  {
    name: 'ScaleFade',
    overlay: false,
    contentVariants: {
      initial: { opacity: 0, scale: 0.95, y: 8 },
      animate: {
        opacity: 1, scale: 1, y: 0,
        transition: { duration: 0.42, ease: EASE_BACK },
      },
      exit: {
        opacity: 0, scale: 1.05, y: -8,
        transition: { duration: 0.25, ease: EASE_CIRC },
      },
    },
  },

  /* ── Spring Physics ── */
  {
    name: 'Spring',
    overlay: false,
    contentVariants: {
      initial: { opacity: 0, y: 60, rotate: -2 },
      animate: {
        opacity: 1, y: 0, rotate: 0,
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      },
      exit: {
        opacity: 0, y: -30, rotate: 2,
        transition: { duration: 0.25, ease: EASE_CIRC },
      },
    },
  },

  /* ── Radial Mask ── */
  {
    name: 'Radial',
    overlay: true,
    cover: {
      initial: { clipPath: 'circle(0% at 80% 20%)' },
      animate: { clipPath: 'circle(200% at 80% 20%)' },
      transition: { duration: 0.6, ease: EASE_EXPO },
    },
    reveal: {
      initial: { clipPath: 'circle(200% at 20% 80%)' },
      animate: { clipPath: 'circle(0% at 20% 80%)' },
      transition: { duration: 0.55, ease: EASE_EXPO, delay: 0.08 },
    },
    overlayStyle: {
      background: 'linear-gradient(225deg, #789381, #17241d)',
    },
  },

  /* ── Corner Reveal ── */
  {
    name: 'Corner',
    overlay: true,
    cover: {
      initial: { clipPath: 'polygon(100% 0,100% 0,100% 100%,100% 100%)' },
      animate: { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' },
      transition: { duration: 0.5, ease: EASE_EXPO },
    },
    reveal: {
      initial: { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)' },
      animate: { clipPath: 'polygon(0 0,0 0,0 100%,0 100%)' },
      transition: { duration: 0.5, ease: EASE_EXPO, delay: 0.06 },
    },
    overlayStyle: {
      background: 'linear-gradient(45deg, #405b4d 0%, #d4ddd6 100%)',
    },
  },
];

/* ──────────────────────────────────────────────────────────
   TRANSITION NAME BADGE  (bottom-right corner label)
────────────────────────────────────────────────────────── */
function EffectBadge({ name }) {
  return (
    <AnimatePresence>
      <motion.div
        key={name}
        initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed', bottom: 18, right: 20, zIndex: 9999,
          background: 'rgba(64,91,77,0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(64,91,77,0.25)',
          borderRadius: 8, padding: '4px 10px',
          fontSize: 11, fontWeight: 600, color: '#405b4d',
          letterSpacing: '0.06em', pointerEvents: 'none',
          fontFamily: 'monospace',
        }}
      >
        {name}
      </motion.div>
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────────────────
   CHROMATIC ABERRATION OVERLAY
────────────────────────────────────────────────────────── */
function ChromaticOverlay({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <>
          <motion.div
            initial={{ opacity: 0.6, x: -8 }}
            animate={{ opacity: 0, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0, zIndex: 200,
              background: 'rgba(255,0,80,0.12)',
              mixBlendMode: 'screen', pointerEvents: 'none',
            }}
          />
          <motion.div
            initial={{ opacity: 0.6, x: 8 }}
            animate={{ opacity: 0, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0, zIndex: 200,
              background: 'rgba(0,200,255,0.12)',
              mixBlendMode: 'screen', pointerEvents: 'none',
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────────────────
   STAGGER TILES  (pixel-dissolve simulation)
────────────────────────────────────────────────────────── */
function StaggerTiles({ active, onDone }) {
  const COLS = 8, ROWS = 5;
  const tiles = Array.from({ length: COLS * ROWS }, (_, i) => i);

  useEffect(() => {
    if (active) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'grid',
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      pointerEvents: 'none',
    }}>
      {tiles.map((i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const delay = (col + row) * 0.04;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, delay, ease: EASE_EXPO }}
            style={{ background: '#405b4d', borderRadius: 2 }}
          />
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────────────────────── */
const COVER_DURATION = 480;   // ms — how long overlay covers screen
const REVEAL_DELAY   = 80;    // ms — extra delay before revealing

function pickRandom(exclude) {
  const pool = EFFECTS.filter(e => e.name !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function RouteTransition() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [effect, setEffect] = useState(() => pickRandom(null));
  const [phase, setPhase] = useState('idle'); // idle | covering | covered | revealing
  const prevPath = useRef(location.pathname);
  const timerRefs = useRef([]);

  const clearTimers = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  };

  const startTransition = useCallback(() => {
    const next = pickRandom(effect?.name);
    setEffect(next);
    setPhase('covering');

    const t1 = setTimeout(() => {
      setDisplayLocation(location);
      setPhase('covered');
    }, COVER_DURATION);

    const t2 = setTimeout(() => {
      setPhase('revealing');
    }, COVER_DURATION + REVEAL_DELAY);

    const t3 = setTimeout(() => {
      setPhase('idle');
    }, COVER_DURATION + REVEAL_DELAY + COVER_DURATION);

    timerRefs.current = [t1, t2, t3];
  }, [location, effect]);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      clearTimers();
      startTransition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => () => clearTimers(), []);

  const isOverlay   = effect.overlay;
  const isSplit     = effect.isSplit;
  const isCinematic = effect.isCinematic;
  const isChromatic = effect.chromatic;
  const covering    = phase === 'covering';
  const revealing   = phase === 'revealing';

  /* ── Content variants for non-overlay effects ── */
  const cv = effect.contentVariants || {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.4 } },
    exit:    { opacity: 0, transition: { duration: 0.25 } },
  };

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Main scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#e8eee9', position: 'relative' }}>

        {/* Content with non-overlay animations (AnimatePresence keyed to displayLocation) */}
        {!isOverlay ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={displayLocation.pathname}
              variants={cv}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ padding: 32, maxWidth: 1280, margin: '0 auto' }}
            >
              <Outlet context={{ location: displayLocation }} />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div style={{ padding: 32, maxWidth: 1280, margin: '0 auto' }}>
            <Outlet context={{ location: displayLocation }} />
          </div>
        )}

        {/* Chromatic aberration channel overlay */}
        {isChromatic && <ChromaticOverlay active={covering || revealing} />}
      </div>

      {/* ── OVERLAY TRANSITIONS ── */}
      <AnimatePresence>

        {/* Single-panel overlay (Curtain, Iris, Wipe, Diagonal, Corner, Radial) */}
        {isOverlay && !isSplit && !isCinematic && (covering || revealing) && (
          <motion.div
            key={`${effect.name}-${phase}`}
            {...(covering ? effect.cover : effect.reveal)}
            style={{
              position: 'absolute', inset: 0, zIndex: 400,
              pointerEvents: 'none',
              ...effect.overlayStyle,
            }}
          />
        )}

        {/* Split-panel (two mirrored panels) */}
        {isSplit && (covering || revealing) && (
          <>
            <motion.div
              key={`split-l-${phase}`}
              {...(covering
                ? { ...effect.cover, style: { originX: 0 } }
                : { ...effect.reveal, style: { originX: 0 } }
              )}
              style={{
                position: 'absolute', top: 0, left: 0, width: '50%', bottom: 0,
                zIndex: 400, pointerEvents: 'none',
                transformOrigin: 'left center',
                ...effect.overlayStyle,
              }}
            />
            <motion.div
              key={`split-r-${phase}`}
              initial={covering ? { scaleX: 0 } : { scaleX: 1 }}
              animate={covering ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ ...(covering ? effect.cover : effect.reveal).transition }}
              style={{
                position: 'absolute', top: 0, right: 0, width: '50%', bottom: 0,
                zIndex: 400, pointerEvents: 'none',
                transformOrigin: 'right center',
                ...effect.overlayStyle,
              }}
            />
          </>
        )}

        {/* Cinematic letterbox bars */}
        {isCinematic && (covering || revealing) && (
          <>
            {[0, 1].map((bar) => (
              <motion.div
                key={`cinema-${bar}-${phase}`}
                initial={covering
                  ? { scaleY: 0, originY: bar === 0 ? 0 : 1 }
                  : { scaleY: 1, originY: bar === 0 ? 0 : 1 }
                }
                animate={covering
                  ? { scaleY: 1 }
                  : { scaleY: 0, transition: { ...effect.reveal.transition } }
                }
                transition={covering ? effect.cover.transition : {}}
                style={{
                  position: 'absolute',
                  [bar === 0 ? 'top' : 'bottom']: 0,
                  left: 0, right: 0,
                  height: '12%',
                  zIndex: 400, pointerEvents: 'none',
                  background: '#0a0f0c',
                }}
              />
            ))}
          </>
        )}

      </AnimatePresence>

      {/* ── Effect name badge ── */}
      <EffectBadge name={effect.name} />
    </div>
  );
}
