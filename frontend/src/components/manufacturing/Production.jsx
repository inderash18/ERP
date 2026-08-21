import { useState, useMemo } from 'react';
import {
  Factory, Play, CheckCircle2, Clock, Cpu, BarChart2,
  Plus, Trash2, Check, AlertCircle, X, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErp } from '../../context/ErpContext';
import { TextShuffle } from '../common/AnimatedText';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e1ebe4',
  boxShadow: '0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
};

const LINES = [
  "Line Alpha (CNC Milling)",
  "Line Beta (Stamping)",
  "Line Gamma (Anodizing)",
  "Line Delta (Assembly)",
  "Line Epsilon (SMT Electronics)"
];

export default function Production() {
  const {
    batches,
    inventory,
    launchBatch,
    updateBatchProgress,
    completeBatch,
    deleteBatch,
    metrics
  } = useErp();

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showLaunchModal, setShowLaunchModal] = useState(false);

  // Form State for Launch Batch
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedLine, setSelectedLine] = useState(LINES[0]);
  const [targetQty, setTargetQty] = useState('200');
  const [targetUnit, setTargetUnit] = useState('pcs');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]);

  const handleOpenLaunch = () => {
    const defaultProd = inventory[0]?.id || '';
    const defaultUnit = inventory[0]?.unit || 'pcs';
    setSelectedProduct(defaultProd);
    setTargetUnit(defaultUnit);
    setSelectedLine(LINES[0]);
    setTargetQty('250');
    setShowLaunchModal(true);
  };

  const handleProductChange = (prodId) => {
    setSelectedProduct(prodId);
    const p = inventory.find(i => i.id === prodId);
    if (p) setTargetUnit(p.unit);
  };

  const handleLaunchSubmit = (e) => {
    e.preventDefault();
    const prod = inventory.find(i => i.id === selectedProduct);
    if (!prod) {
      alert("Please select a product");
      return;
    }

    launchBatch({
      productId: prod.id,
      productName: prod.name,
      line: selectedLine,
      targetQty: Number(targetQty) || 100,
      unit: targetUnit,
      targetDate: targetDate
    });

    setShowLaunchModal(false);
  };

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    if (selectedStatus === 'All') return batches;
    return batches.filter(b => b.status === selectedStatus);
  }, [batches, selectedStatus]);

  // Production Metrics
  const activeBatchesCount = batches.filter(b => b.status !== 'Completed').length;
  const completedBatchesCount = batches.filter(b => b.status === 'Completed').length;

  // Compute unique active lines
  const activeLines = new Set(batches.filter(b => b.status !== 'Completed').map(b => b.line)).size;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            <TextShuffle text="Production & Manufacturing" duration={700} />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Live shop-floor telemetry, machine capacity, batch runs, automated inventory restock, and scrap rates.
          </p>
        </div>

        <button
          onClick={handleOpenLaunch}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 16px',
            borderRadius: '10px',
            background: '#7c3aed',
            border: 'none',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(124,58,237,0.25)',
            transition: 'transform 0.15s'
          }}
        >
          <Play size={15} /> Launch Batch Run
        </button>
      </div>

      {/* Production Telemetry KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Production Lines</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
            {activeLines} of 5 Active
          </div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Batches In-Flight</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>
            {activeBatchesCount} Running ({completedBatchesCount} Done)
          </div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Overall Equipment Efficiency</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: 4 }}>
            94.2% OEE
          </div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Scrap & Defect Rate</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2d5a45', marginTop: 4 }}>
            0.6% (Optimal)
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['All', 'In Progress', 'Queued', 'Completed'].map(st => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12.5px',
              fontWeight: 600,
              border: '1px solid',
              borderColor: selectedStatus === st ? '#7c3aed' : '#d4ddd6',
              background: selectedStatus === st ? '#7c3aed' : '#ffffff',
              color: selectedStatus === st ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Active Manufacturing Batches List */}
      <div style={{ ...CARD_STYLE, padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Manufacturing Batches Queue ({filteredBatches.length})
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Completing a batch auto-restocks inventory stock
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredBatches.map((b) => {
            const isDone = b.status === 'Completed';

            return (
              <div
                key={b.id}
                style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  background: isDone ? '#fafcfb' : '#ffffff',
                  border: `1px solid ${isDone ? '#e2e8f0' : '#d4ddd6'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed', fontSize: '14px' }}>
                        {b.id}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                        {b.productName}
                      </h4>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>
                      Assigned to: <strong style={{ color: '#334155' }}>{b.line}</strong> • Target: {b.targetQty} {b.unit} • Est. Completion: {b.targetDate}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 9px',
                      borderRadius: '6px',
                      background: isDone ? '#ecfdf5' : b.status === 'In Progress' ? '#eff6ff' : '#f8faf9',
                      color: isDone ? '#059669' : b.status === 'In Progress' ? '#2563eb' : '#64748b',
                    }}>
                      {b.status} ({b.progress}%)
                    </span>

                    {!isDone && (
                      <button
                        onClick={() => completeBatch(b.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#059669',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Complete and restock inventory"
                      >
                        <Check size={14} /> Finish & Restock
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm(`Archive batch ${b.id}?`)) {
                          deleteBatch(b.id);
                        }
                      }}
                      style={{ border: '1px solid #fecaca', background: '#fff', color: '#dc2626', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Delete batch"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Live Progress Bar + Stepper */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                    <span>Stage Completion Progress</span>
                    <span>{b.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#f1f5f3', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.progress}%` }}
                      transition={{ duration: 0.3 }}
                      style={{ height: '100%', background: isDone ? '#059669' : '#7c3aed' }}
                    />
                  </div>

                  {!isDone && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {[25, 50, 75, 100].map(step => (
                        <button
                          key={step}
                          onClick={() => {
                            if (step === 100) completeBatch(b.id);
                            else updateBatchProgress(b.id, step);
                          }}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid #d4ddd6',
                            background: b.progress >= step ? '#f5f3ff' : '#ffffff',
                            color: b.progress >= step ? '#7c3aed' : '#64748b',
                            fontSize: '10.5px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Set {step}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredBatches.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <Factory size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
              <div>No production batches in this category.</div>
            </div>
          )}
        </div>
      </div>

      {/* Launch Batch Modal */}
      <AnimatePresence>
        {showLaunchModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '500px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Launch Production Batch Run
                </h3>
                <button onClick={() => setShowLaunchModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleLaunchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Manufactured Product *
                  </label>
                  <select
                    required
                    value={selectedProduct}
                    onChange={(e) => handleProductChange(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none', background: '#fff' }}
                  >
                    {inventory.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category}) - Current Stock: {p.stock} {p.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Assigned Line / Work Center *
                  </label>
                  <select
                    value={selectedLine}
                    onChange={(e) => setSelectedLine(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none', background: '#fff' }}
                  >
                    {LINES.map(line => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Target Quantity
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={targetQty}
                      onChange={(e) => setTargetQty(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Unit
                    </label>
                    <input
                      type="text"
                      disabled
                      value={targetUnit}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', background: '#f8faf9', color: '#64748b' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Estimated Completion Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowLaunchModal(false)}
                    style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #d1ded5', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Launch Batch Run
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
