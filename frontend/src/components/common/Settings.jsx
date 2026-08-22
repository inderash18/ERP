import { useState } from 'react';
import {
  Settings as SettingsIcon, Shield, Bell, Key, Database, Globe,
  Save, RotateCcw, Check, CheckCircle2, UserCheck
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
];

export default function Settings() {
  const {
    settings,
    authUser,
    user
  } = useErp();

  const [formSettings, setFormSettings] = useState({
    orgName: 'Shiv Furniture Works',
    orgEmail: 'admin@shivfurniture.in',
    currency: 'INR',
    taxRate: 18,
    lowStockThresholdPercent: 20
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 840 }}>
      
      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            System Settings & Enterprise Preferences
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
            Organization parameters, currency symbols, standard tax rates, and security preferences.
          </p>
        </div>
      </div>

      {/* ── Settings Form ────────────────────────────────────── */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Organization Information */}
        <div className="erp-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            Organization Profile
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
            Company name and primary domain registered in tenancy.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                Company Legal Name
              </label>
              <input
                type="text"
                value={formSettings.orgName}
                onChange={e => setFormSettings({ ...formSettings, orgName: e.target.value })}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                Primary Email
              </label>
              <input
                type="email"
                value={formSettings.orgEmail}
                onChange={e => setFormSettings({ ...formSettings, orgEmail: e.target.value })}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Standards */}
        <div className="erp-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
            Financial & Tax Localization
          </div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
            Ledger currency symbol and default GST tax calculation.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                Operating Currency
              </label>
              <select
                value={formSettings.currency}
                onChange={e => setFormSettings({ ...formSettings, currency: e.target.value })}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                Default GST Rate (%)
              </label>
              <input
                type="number"
                value={formSettings.taxRate}
                onChange={e => setFormSettings({ ...formSettings, taxRate: Number(e.target.value) })}
                style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
          {savedSuccess && (
            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={14} /> Preferences saved
            </span>
          )}
          <button
            type="submit"
            style={{
              padding: '7px 16px', borderRadius: 6, border: 'none',
              background: '#2563eb', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
            }}
          >
            Save Changes
          </button>
        </div>

      </form>

    </div>
  );
}
