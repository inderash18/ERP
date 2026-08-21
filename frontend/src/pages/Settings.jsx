import { useState } from 'react';
import {
  Settings as SettingsIcon, Shield, Bell, Key, Database, Globe,
  Save, RotateCcw, Trash2, Download, Check, AlertTriangle, UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useErp } from '../context/ErpContext';
import { storage } from '../services/erpStorage';
import { TextShuffle } from '../components/AnimatedText';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e1ebe4',
  boxShadow: '0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
};

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
];

export default function Settings() {
  const {
    settings,
    updateSettings,
    user,
    setUser,
    resetToDefaultData,
    clearAllData,
    inventory,
    orders,
    customers,
    batches
  } = useErp();

  const [formSettings, setFormSettings] = useState({
    orgName: settings.orgName || '',
    orgEmail: settings.orgEmail || '',
    orgPhone: settings.orgPhone || '',
    currency: settings.currency || 'INR',
    currencySymbol: settings.currencySymbol || '₹',
    taxRate: settings.taxRate || 18,
    lowStockThresholdPercent: settings.lowStockThresholdPercent || 20,
    twoFactorAuth: settings.twoFactorAuth !== false,
    autoReorderAlerts: settings.autoReorderAlerts !== false,
    emailNotifications: settings.emailNotifications !== false,
  });

  const [formUser, setFormUser] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'Operations Director',
    avatar: user.avatar || 'AR',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCurrencyChange = (currCode) => {
    const found = CURRENCIES.find(c => c.code === currCode);
    if (found) {
      setFormSettings(prev => ({
        ...prev,
        currency: found.code,
        currencySymbol: found.symbol
      }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formSettings);
    setUser(formUser);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      version: '2.4.0',
      settings: formSettings,
      user: formUser,
      inventory,
      orders,
      customers,
      batches
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `mini_erp_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            <TextShuffle text="System Settings & Preferences" duration={700} />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Organization legal parameters, currency formats, multi-factor security, and system database backups.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {savedSuccess && (
            <span style={{ fontSize: '13px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={16} /> Preferences Saved
            </span>
          )}
          <button
            onClick={handleSave}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 18px',
              borderRadius: '10px',
              background: '#2d5a45',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(45,90,69,0.25)',
              transition: 'transform 0.15s'
            }}
          >
            <Save size={15} /> Save Changes
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        {/* Organization Config */}
        <div style={{ ...CARD_STYLE, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: '9px', background: '#e7f1eb', color: '#2d5a45', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Organization Profile</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Entity legal branding & currencies</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Legal Entity Name</label>
            <input
              type="text"
              value={formSettings.orgName}
              onChange={(e) => setFormSettings({ ...formSettings, orgName: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Corporate Email</label>
            <input
              type="email"
              value={formSettings.orgEmail}
              onChange={(e) => setFormSettings({ ...formSettings, orgEmail: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Operating Currency</label>
              <select
                value={formSettings.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none', background: '#fff' }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Default Tax %</label>
              <input
                type="number"
                value={formSettings.taxRate}
                onChange={(e) => setFormSettings({ ...formSettings, taxRate: Number(e.target.value) || 0 })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* User Profile Config */}
        <div style={{ ...CARD_STYLE, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: '9px', background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Active User Profile</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Current operator session credentials</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Display Name</label>
            <input
              type="text"
              value={formUser.name}
              onChange={(e) => {
                const name = e.target.value;
                const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                setFormUser({ ...formUser, name, avatar: initials || 'US' });
              }}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Operator Email</label>
            <input
              type="email"
              value={formUser.email}
              onChange={(e) => setFormUser({ ...formUser, email: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Assigned Role</label>
            <input
              type="text"
              value={formUser.role}
              onChange={(e) => setFormUser({ ...formUser, role: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
            />
          </div>
        </div>

        {/* Security & Access */}
        <div style={{ ...CARD_STYLE, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Security & Notifications</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Automated alerts & 2FA</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f3' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Two-Factor Authentication</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Enforce TOTP on login</div>
            </div>
            <input
              type="checkbox"
              checked={formSettings.twoFactorAuth}
              onChange={(e) => setFormSettings({ ...formSettings, twoFactorAuth: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f3' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Auto-Reorder Triggers</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Emit alert when stock hits threshold</div>
            </div>
            <input
              type="checkbox"
              checked={formSettings.autoReorderAlerts}
              onChange={(e) => setFormSettings({ ...formSettings, autoReorderAlerts: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Email Dispatch Webhooks</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Send email on dispatch readiness</div>
            </div>
            <input
              type="checkbox"
              checked={formSettings.emailNotifications}
              onChange={(e) => setFormSettings({ ...formSettings, emailNotifications: e.target.checked })}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Database & Data Management */}
        <div style={{ ...CARD_STYLE, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: '9px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Data & Backup Tools</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Export, reset, or wipe system state</span>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
            Mini-ERP stores all operational data locally in high-performance reactive persistent storage.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <button
              onClick={handleExportBackup}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #d1ded5',
                background: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={15} /> Export Complete JSON Backup
            </button>

            <button
              onClick={() => {
                if (window.confirm("Reset all inventory, orders, and clients back to default demo dataset?")) {
                  resetToDefaultData();
                  alert("ERP reset to demo dataset successfully!");
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #d1ded5',
                background: '#f8faf9',
                color: '#2d5a45',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={15} /> Reset to Demo Dataset
            </button>

            <button
              onClick={() => {
                if (window.confirm("CAUTION: Are you sure you want to wipe ALL products, orders, batches, and clients? This action cannot be undone.")) {
                  clearAllData();
                  alert("All ERP operational data has been wiped.");
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                background: '#fff5f5',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={15} /> Wipe All Datasets (Clean Slate)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
