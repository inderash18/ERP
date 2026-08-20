import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { WordMorph, RotatingText } from '../components/AnimatedText';

const card = {
  background: '#fff',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(30,50,40,0.07)',
  border: '1px solid #d4ddd6',
};

export default function Customers() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#e8eee9', color: '#405b4d', borderRadius: 999,
            padding: '3px 14px', fontSize: 12, fontWeight: 600, minWidth: 100,
          }}>
            <RotatingText phrases={['Clients', 'Partners', 'Accounts', 'Leads']} interval={2000} />
          </span>
        </div>
        <h1 style={{ color: '#17241d', fontSize: 30, fontWeight: 700, margin: 0 }}>
          <WordMorph text="Customers" stagger={0.15} />
        </h1>
        <p style={{ color: '#9da49f', marginTop: 6, fontSize: 13 }}>
          <WordMorph text="View and manage your customer accounts." stagger={0.07} delay={0.25} />
        </p>
      </div>
      <div style={{ ...card, padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#e8eee9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Users size={28} color="#405b4d" />
        </div>
        <p style={{ color: '#6b7c71', fontSize: 14, fontWeight: 500 }}>Customers module coming soon</p>
      </div>
    </motion.div>
  );
}

