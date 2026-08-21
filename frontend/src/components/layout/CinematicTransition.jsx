/**
 * CinematicTransition.jsx
 *
 * A high-end page-change system that:
 * 1. Detects location change via useLocation
 * 2. Sweeps a full-screen overlay in (covering old content)
 * 3. Swaps the displayed location behind the overlay
 * 4. Sweeps the overlay out (revealing new content)
 * 5. Shows the destination page name as kinetic typography during the sweep
 *
 * Each navigation randomly picks one of 6 overlay effects:
 *   curtain · iris · wipe · diagonal · split · radial
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.77, 0, 0.18, 1];
const BACK = [0.34, 1.56, 0.64, 1];

/* ── Overlay definitions ── */
const OVERLAYS = [
  {
    name: "curtain",
    cover:  { initial: { scaleY: 0, originY: "0%" }, animate: { scaleY: 1 }, transition: { duration: 0.45, ease: EASE } },
    reveal: { initial: { scaleY: 1, originY: "100%" }, animate: { scaleY: 0 }, transition: { duration: 0.45, ease: EASE } },
    style: { background: "linear-gradient(160deg,#17241d 0%,#405b4d 100%)" },
  },
  {
    name: "iris",
    cover:  { initial: { clipPath: "circle(0% at 50% 50%)"   }, animate: { clipPath: "circle(150% at 50% 50%)" }, transition: { duration: 0.55, ease: EASE } },
    reveal: { initial: { clipPath: "circle(150% at 50% 50%)" }, animate: { clipPath: "circle(0%   at 50% 50%)" }, transition: { duration: 0.5,  ease: EASE } },
    style: { background: "#17241d" },
  },
  {
    name: "wipe",
    cover:  { initial: { scaleX: 0, originX: "0%"  }, animate: { scaleX: 1 }, transition: { duration: 0.4, ease: EASE } },
    reveal: { initial: { scaleX: 1, originX: "100%" }, animate: { scaleX: 0 }, transition: { duration: 0.4, ease: EASE } },
    style: { background: "#405b4d" },
  },
  {
    name: "diagonal",
    cover:  { initial: { clipPath: "polygon(0 0,0 0,0 100%,0 100%)"           }, animate: { clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)" }, transition: { duration: 0.5, ease: EASE } },
    reveal: { initial: { clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)" }, animate: { clipPath: "polygon(100% 0,100% 0,100% 100%,100% 100%)" }, transition: { duration: 0.5, ease: EASE } },
    style: { background: "linear-gradient(135deg,#405b4d,#789381)" },
  },
  {
    name: "radial",
    cover:  { initial: { clipPath: "circle(0% at 80% 20%)"    }, animate: { clipPath: "circle(200% at 80% 20%)" }, transition: { duration: 0.6, ease: EASE } },
    reveal: { initial: { clipPath: "circle(200% at 20% 80%)" }, animate: { clipPath: "circle(0%   at 20% 80%)" }, transition: { duration: 0.55, ease: EASE } },
    style: { background: "linear-gradient(225deg,#789381,#17241d)" },
  },
];

const PAGE_LABELS = {
  "/layout":            "Dashboard",
  "/layout/inventory":  "Inventory",
  "/layout/sales":      "Sales",
  "/layout/production": "Production",
  "/layout/customers":  "Customers",
  "/layout/settings":   "Settings",
};

function pickRandom(exclude) {
  const pool = OVERLAYS.filter(o => o.name !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ── Kinetic label shown during overlay ── */
function KineticLabel({ text }) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1, pointerEvents: "none",
    }}>
      <div style={{ overflow: "hidden" }}>
        <motion.div
          initial={{ y: "110%" }}
          animate={{ y: "0%"  }}
          exit={{ y: "-110%" }}
          transition={{ duration: 0.4, ease: BACK, delay: 0.08 }}
          style={{
            fontSize: "clamp(32px,6vw,72px)",
            fontWeight: 800,
            color: "rgba(255,255,255,0.15)",
            letterSpacing: "-0.03em",
            fontFamily: "Inter, sans-serif",
            userSelect: "none",
          }}
        >
          {text}
        </motion.div>
      </div>
    </div>
  );
}

/* ── Progress bar (thin line at top of overlay) ── */
function ProgressBar() {
  return (
    <motion.div
      initial={{ scaleX: 0, originX: "0%" }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.9, ease: "linear" }}
      style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 2, background: "rgba(255,255,255,0.45)",
        transformOrigin: "left",
      }}
    />
  );
}

const COVER_MS  = 480;
const REVEAL_MS = 80;

export default function CinematicTransition() {
  const location = useLocation();
  const [displayLoc,    setDisplayLoc]    = useState(location);
  const [overlayEffect, setOverlayEffect] = useState(null);
  const [phase,         setPhase]         = useState("idle");
  const prevPath  = useRef(location.pathname);
  const prevName  = useRef(null);
  const timers    = useRef([]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const startTransition = useCallback(() => {
    const fx = pickRandom(prevName.current);
    prevName.current = fx.name;
    setOverlayEffect(fx);
    setPhase("covering");

    const t1 = setTimeout(() => {
      setDisplayLoc(location);
      setPhase("revealing");
    }, COVER_MS);

    const t2 = setTimeout(() => setPhase("idle"), COVER_MS + REVEAL_MS + COVER_MS);

    timers.current = [t1, t2];
  }, [location]);

  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      prevPath.current = location.pathname;
      clearTimers();
      startTransition();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => () => clearTimers(), []);

  const covering  = phase === "covering";
  const revealing = phase === "revealing";
  const active    = covering || revealing;
  const fx        = overlayEffect;

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* Page content — simple clean fade */}
      <div className="scroll-container" style={{ flex: 1, overflowY: "auto", background: "#e8eee9" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={displayLoc.pathname}
            initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
            animate={{ opacity: 1,  y: 0,  filter: "blur(0px)", transition: { duration: 0.38, ease: [0.22,1,0.36,1], delay: 0.05 } }}
            exit={{    opacity: 0,  y: -12, filter: "blur(4px)", transition: { duration: 0.22, ease: [0.85,0,0.15,1] } }}
            style={{ padding: 32, maxWidth: 1280, margin: "0 auto", minHeight: "100%" }}
          >
            <Outlet context={{ location: displayLoc }} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cinematic overlay */}
      <AnimatePresence>
        {active && fx && (
          <motion.div
            key={`${fx.name}-${phase}`}
            {...(covering ? fx.cover : fx.reveal)}
            style={{
              position: "absolute", inset: 0,
              zIndex: 500,
              pointerEvents: "none",
              ...fx.style,
            }}
          >
            <ProgressBar />
            <AnimatePresence>
              {covering && (
                <KineticLabel
                  key={displayLoc.pathname}
                  text={PAGE_LABELS[location.pathname] ?? ""}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
