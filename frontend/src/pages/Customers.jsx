import { Users, UserPlus, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e1ebe4',
  boxShadow: '0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
};

const customers = [
  { name: "Apex Industrial Corp", contact: "Rajesh Sharma", email: "procurement@apexcorp.in", phone: "+91 98234 11200", city: "Mumbai, MH", tier: "Enterprise Tier", spend: "₹18,40,000" },
  { name: "Nexus Logistics Ltd", contact: "Anita Deshmukh", email: "contact@nexuslogistics.com", phone: "+91 97120 54321", city: "Pune, MH", tier: "Strategic Partner", spend: "₹12,85,000" },
  { name: "Zenith Automotive Systems", contact: "Karan Patel", email: "karan@zenithauto.io", phone: "+91 98980 99881", city: "Ahmedabad, GJ", tier: "Enterprise Tier", spend: "₹34,10,000" },
  { name: "Beacon Energy Solutions", contact: "Priya Nair", email: "priya@beaconenergy.org", phone: "+91 94470 33211", city: "Bengaluru, KA", tier: "Growth Account", spend: "₹6,90,000" },
];

export default function Customers() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            Customer Directory
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Manage client accounts, credit limits, contracts, and commercial terms.
          </p>
        </div>

        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', background: '#7c3aed', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(124,58,237,0.25)' }}>
          <UserPlus size={16} /> Add New Client
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {customers.map((c, i) => (
          <div key={i} style={{ ...CARD_STYLE, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: '#f5f3ff', color: '#7c3aed' }}>
                  {c.tier}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>{c.name}</h3>
                <span style={{ fontSize: '13px', color: '#64748b' }}>POC: {c.contact}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Lifetime Value</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#2d5a45' }}>{c.spend}</div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eef3f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={14} color="#94a3b8" /> {c.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} color="#94a3b8" /> {c.phone}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={14} color="#94a3b8" /> {c.city}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
