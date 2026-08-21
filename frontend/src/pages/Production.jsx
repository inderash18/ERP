import { Factory, Play, CheckCircle2, Clock, Cpu, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e1ebe4',
  boxShadow: '0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
};

const batches = [
  { id: "BATCH-89", line: "Line Alpha (CNC Milling)", product: "Engine Flange Assembly", qty: "500 units", progress: 85, status: "In Progress" },
  { id: "BATCH-88", line: "Line Beta (Stamping)", product: "Reinforced Brackets", qty: "1,200 units", progress: 100, status: "Completed" },
  { id: "BATCH-87", line: "Line Gamma (Anodizing)", product: "Anodized Panels", qty: "350 units", progress: 40, status: "In Progress" },
];

export default function Production() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Production & Manufacturing
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Live shop-floor telemetry, machine capacity, batch runs, and scrap rates.
          </p>
        </div>

        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', background: '#2d5a45', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Play size={15} /> Launch Batch Run
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Production Lines</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>4 of 5 Running</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Overall Equipment Efficiency</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#059669', marginTop: 4 }}>92.4% OEE</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Scrap / Defect Rate</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#2d5a45', marginTop: 4 }}>0.8% (Optimal)</div>
        </div>
      </div>

      <div style={{ ...CARD_STYLE, padding: '22px 24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Active Manufacturing Batches</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {batches.map((b, idx) => (
            <div key={idx} style={{ padding: '14px 16px', borderRadius: '12px', background: '#f8faf9', border: '1px solid #eef3f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{b.id} — {b.product}</span>
                  <span style={{ color: '#64748b', fontSize: '12px', marginLeft: 10 }}>({b.line})</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: b.status === 'Completed' ? '#059669' : '#2563eb' }}>
                  {b.status} ({b.progress}%)
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ width: '100%', height: 7, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                <div style={{ width: `${b.progress}%`, height: '100%', background: b.status === 'Completed' ? '#10b981' : '#2d5a45', borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
