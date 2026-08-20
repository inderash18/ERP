import { Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { TextShuffle, WordMorph } from '../components/AnimatedText';

const card = {
  background: '#fff',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(30,50,40,0.07)',
  border: '1px solid #d4ddd6',
};

export default function Inventory() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#17241d', fontSize: 30, fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>
          <TextShuffle text="Inventory" duration={900} />
        </h1>
        <p style={{ color: '#9da49f', marginTop: 6, fontSize: 13 }}>
          <WordMorph text="Manage your stock, raw materials, and finished goods." stagger={0.07} delay={0.15} />
        </p>
      </div>
      <div style={{ ...card, padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e8eee9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={28} color="#405b4d" />
        </div>
        <p style={{ color: '#6b7c71', fontSize: 14, fontWeight: 500 }}>Inventory module coming soon</p>
      </div>
    </motion.div>
  );
}

