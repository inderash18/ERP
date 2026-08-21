/**
 * LiquidCursor.jsx
 * ─ A two-layer custom cursor:
 *     Dot   — snaps exactly to the pointer
 *     Blob  — follows with spring physics (laggy, organic)
 * ─ Magnetic mode: blob swells and fills on interactive elements
 * ─ Click ripple: a green ring pulses outward on mousedown
 * ─ Shader hint: on fast movement the blob elongates (simulating motion blur)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

const SPRING = { stiffness: 120, damping: 18, mass: 0.6 };
const SPRING_FAST = { stiffness: 800, damping: 40 };

const INTERACTIVE = ["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "LABEL"];

function isInteractive(el) {
  if (!el) return false;
  if (INTERACTIVE.includes(el.tagName)) return true;
  if (el.closest?.("a, button, [role=button], [data-cursor=pointer]")) return true;
  return false;
}

export default function LiquidCursor() {
  const dotX  = useMotionValue(-100);
  const dotY  = useMotionValue(-100);
  const blobX = useSpring(dotX, SPRING);
  const blobY = useSpring(dotY, SPRING);

  const [hover,    setHover]    = useState(false);
  const [clicking, setClicking] = useState(false);
  const [ripples,  setRipples]  = useState([]);
  const [trail,    setTrail]    = useState([]);

  const rippleId = useRef(0);
  const rafRef   = useRef(null);
  const velX     = useRef(0);
  const velY     = useRef(0);
  const prevX    = useRef(0);
  const prevY    = useRef(0);

  const addRipple = useCallback((x, y) => {
    const id = rippleId.current++;
    setRipples(r => [...r, { id, x, y }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
  }, []);

  useEffect(() => {
    // Hide system cursor globally
    document.documentElement.style.cursor = "none";

    const onMove = (e) => {
      const x = e.clientX, y = e.clientY;
      velX.current = x - prevX.current;
      velY.current = y - prevY.current;
      prevX.current = x;
      prevY.current = y;

      dotX.set(x);
      dotY.set(y);

      // Trail particles
      setTrail(t => {
        const next = [{ id: Date.now(), x, y }, ...t.slice(0, 5)];
        return next;
      });

      setHover(isInteractive(e.target));
    };

    const onDown = (e) => {
      setClicking(true);
      addRipple(e.clientX, e.clientY);
    };
    const onUp   = ()  => setClicking(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dotX, dotY, addRipple]);

  const speed = Math.sqrt(velX.current ** 2 + velY.current ** 2);
  const skew  = Math.min(speed * 0.15, 12);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none" }}>

      {/* Trail particles */}
      {trail.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0.35 - i * 0.05, scale: 1 - i * 0.12 }}
          animate={{ opacity: 0, scale: 0.2 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: p.x - 4, top: p.y - 4,
            width: 8, height: 8,
            borderRadius: "50%",
            background: "rgba(64,91,77,0.35)",
          }}
        />
      ))}

      {/* Blob (spring-lagged, swells on hover) */}
      <motion.div
        style={{
          position: "absolute",
          x: blobX, y: blobY,
          translateX: "-50%", translateY: "-50%",
          width:  hover ? 44 : 28,
          height: hover ? 44 : 28,
          borderRadius: "50%",
          border: `1.5px solid rgba(64,91,77,${hover ? 0.7 : 0.45})`,
          background: hover ? "rgba(64,91,77,0.1)" : "transparent",
          backdropFilter: hover ? "blur(2px)" : "none",
          mixBlendMode: "multiply",
          skewX: `${skew * (velX.current > 0 ? 1 : -1)}deg`,
        }}
        animate={{
          width:  hover ? 44 : 28,
          height: hover ? 44 : 28,
          scale: clicking ? 0.75 : 1,
        }}
        transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
      />

      {/* Dot (exact position) */}
      <motion.div
        style={{
          position: "absolute",
          x: dotX, y: dotY,
          translateX: "-50%", translateY: "-50%",
          width:  hover ? 5 : 7,
          height: hover ? 5 : 7,
          borderRadius: "50%",
          background: "#405b4d",
        }}
        animate={{
          width:  hover ? 5 : 7,
          height: hover ? 5 : 7,
          scale: clicking ? 0.4 : 1,
          opacity: hover ? 0.6 : 1,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map(rp => (
          <motion.div
            key={rp.id}
            initial={{ width: 0, height: 0, opacity: 0.7, x: rp.x, y: rp.y }}
            animate={{ width: 80, height: 80, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              translateX: "-50%", translateY: "-50%",
              borderRadius: "50%",
              border: "1.5px solid rgba(64,91,77,0.6)",
              pointerEvents: "none",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
