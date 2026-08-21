import { Settings as SettingsIcon, Shield, Bell, Key, Database, Globe, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e1ebe4',
  boxShadow: '0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
};

export default function Settings() {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            System Settings & Preferences
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Configure organization profiles, multi-factor authentication, database backups, and notification webhooks.
          </p>
        </div>

        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: '10px', background: '#2d5a45', border: 'none', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(45,90,69,0.25)' }}>
          <Save size={15} /> Save Changes
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {/* Organization Config */}
        <div style={{ ...CARD_STYLE, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#e7f1eb', color: '#2d5a45', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Organization Profile</h3>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Legal Entity Name</label>
            <input type="text" defaultValue="Mini-ERP Industrial Solutions Pvt Ltd" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', color: '#0f172a', outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Base Operating Currency</label>
            <input type="text" defaultValue="INR (₹) - Indian Rupee" style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', color: '#0f172a', outline: 'none' }} />
          </div>
        </div>

        {/* Security & Access */}
        <div style={{ ...CARD_STYLE, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Security & 2FA</h3>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f3' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Two-Factor Authentication</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Require OTP authentication on login</div>
            </div>
            <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: '#2d5a45' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Automated Daily Backups</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Export snapshot every midnight (UTC+5:30)</div>
            </div>
            <input type="checkbox" defaultChecked style={{ width: 18, height: 18, accentColor: '#2d5a45' }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
