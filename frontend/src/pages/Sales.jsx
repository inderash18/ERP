import { ShoppingCart, ArrowUpRight, CheckCircle2, Clock, DollarSign, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e1ebe4',
  boxShadow: '0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
};

const orders = [
  { id: "SO-2026-0941", customer: "Apex Industrial Corp", date: "20 Aug 2026", amount: "₹1,42,000", payment: "Paid", fulfillment: "Ready for Dispatch" },
  { id: "SO-2026-0940", customer: "Nexus Logistics Ltd", date: "20 Aug 2026", amount: "₹88,500", payment: "Pending", fulfillment: "Processing" },
  { id: "SO-2026-0939", customer: "Zenith Automotive Systems", date: "19 Aug 2026", amount: "₹3,15,200", payment: "Paid", fulfillment: "In Production" },
  { id: "SO-2026-0938", customer: "Beacon Energy Solutions", date: "19 Aug 2026", amount: "₹64,000", payment: "Paid", fulfillment: "Delivered" },
];

export default function Sales() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Sales & Orders
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Manage client quotations, active purchase contracts, and invoice billing.
          </p>
        </div>

        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', background: '#2563eb', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}>
          <ShoppingCart size={16} /> New Sales Order
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Closed Sales</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>₹8,42,500</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Orders</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#2563eb', marginTop: 4 }}>148 Orders</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Average Order Value</span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#2d5a45', marginTop: 4 }}>₹56,920</div>
        </div>
      </div>

      <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef3f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Sales Orders</h3>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px', color: '#2d5a45', fontWeight: 600, background: '#e7f1eb', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
            <Download size={13} /> Export Report
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e1ebe4', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
              <th style={{ padding: '12px 20px' }}>Order ID</th>
              <th style={{ padding: '12px 20px' }}>Customer Name</th>
              <th style={{ padding: '12px 20px' }}>Date</th>
              <th style={{ padding: '12px 20px' }}>Amount</th>
              <th style={{ padding: '12px 20px' }}>Fulfillment Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((row, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f3' }}>
                <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>{row.id}</td>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a' }}>{row.customer}</td>
                <td style={{ padding: '14px 20px', color: '#64748b' }}>{row.date}</td>
                <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1e293b' }}>{row.amount}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: row.fulfillment === 'Delivered' ? '#ecfdf5' : '#eff6ff',
                    color: row.fulfillment === 'Delivered' ? '#059669' : '#2563eb',
                  }}>
                    {row.fulfillment}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
