export function AnimatedCounter({ value, prefix = "", suffix = "", className = "", style = {} }) {
  return (
    <span className={className} style={style}>
      {prefix}{value}{suffix}
    </span>
  );
}

export function TextScramble({ text, className = "", style = {} }) {
  return <span className={className} style={style}>{text}</span>;
}

export function TextShuffle({ text, className = "", style = {} }) {
  return <span className={className} style={style}>{text}</span>;
}

export function GlitchText({ text, className = "", style = {} }) {
  return <span className={className} style={style}>{text}</span>;
}

export function Typewriter({ text, className = "", style = {} }) {
  return <span className={className} style={style}>{text}</span>;
}

export function WaveText({ text, className = "", style = {} }) {
  return <span className={className} style={style}>{text}</span>;
}

export function KineticText({ text, className = "", style = {} }) {
  return <span className={className} style={style}>{text}</span>;
}

export function DecryptText({ text, className = "", style = {} }) {
  return <span className={className} style={style}>{text}</span>;
}

export function AuroraText({ text, className = "", style = {} }) {
  return <span className={className} style={style}>{text}</span>;
}

export default {
  AnimatedCounter,
  TextScramble,
  TextShuffle,
  GlitchText,
  Typewriter,
  WaveText,
  KineticText,
  DecryptText,
  AuroraText
};
