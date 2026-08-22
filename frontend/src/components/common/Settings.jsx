import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Settings as SettingsIcon, Shield, Bell, Key, Database, Globe,
  Save, RotateCcw, Check, CheckCircle2, UserCheck, Activity,
  Search, Filter, Clock, FileText, User, ArrowUpRight
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹) - Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'USD ($) - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR (€) - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP (£) - British Pound' },
];

const MODULE_FILTERS = ['All Modules', 'Sales', 'Inventory', 'Purchase', 'Manufacturing', 'Auth'];

export default function Settings({ defaultTab }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = defaultTab || searchParams.get('tab') || 'audit'; // Default to audit if requested or easy view
  
  const [activeTab, setActiveTab] = useState(initialTab === 'audit' ? 'audit' : 'general');
  const [auditSearch, setAuditSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('All Modules');

  const {
    settings,
    authUser,
    user,
    auditLogs = []
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

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchModule = selectedModule === 'All Modules' || 
        (log.module && log.module.toLowerCase() === selectedModule.toLowerCase());
      
      const q = auditSearch.toLowerCase();
      const matchSearch = !auditSearch ||
        (log.description && log.description.toLowerCase().includes(q)) ||
        (log.action && log.action.toLowerCase().includes(q)) ||
        (log.user && String(log.user).toLowerCase().includes(q)) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
        (log.referenceId && String(log.referenceId).toLowerCase().includes(q));

      return matchModule && matchSearch;
    });
  }, [auditLogs, selectedModule, auditSearch]);

  const getModuleBadgeColor = (module) => {
    const m = (module || '').toLowerCase();
    if (m === 'sales') return { bg: '#eff6ff', color: '#2563eb' };
    if (m === 'inventory') return { bg: '#ecfdf5', color: '#059669' };
    if (m === 'purchase') return { bg: '#fef3c7', color: '#b45309' };
    if (m === 'manufacturing') return { bg: '#f3e8ff', color: '#7e22ce' };
    return { bg: '#f1f5f9', color: '#475569' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            System Settings & Audit Trail
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
            Immutable event logging telemetry, company profile, and financial preferences.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: 6, gap: 4 }}>
          <button
            onClick={() => setActiveTab('audit')}
            style={{
              padding: '6px 12px', borderRadius: 5, border: 'none',
              fontSize: 12, fontWeight: 600,
              background: activeTab === 'audit' ? '#ffffff' : 'transparent',
              color: activeTab === 'audit' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'audit' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Activity size={13} />
            <span>Audit Trail</span>
            <span style={{ fontSize: 11, padding: '1px 5px', borderRadius: 10, background: '#e2e8f0', color: '#475569' }}>
              {auditLogs.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('general')}
            style={{
              padding: '6px 12px', borderRadius: 5, border: 'none',
              fontSize: 12, fontWeight: 600,
              background: activeTab === 'general' ? '#ffffff' : 'transparent',
              color: activeTab === 'general' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'general' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <SettingsIcon size={13} />
            <span>General Preferences</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: AUDIT TRAIL ─────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ position: 'relative', width: 280 }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search audit actions, user, ID..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                style={{
                  width: '100%', padding: '6px 10px 6px 32px',
                  borderRadius: 6, border: '1px solid #cbd5e1',
                  fontSize: 12.5, background: '#ffffff'
                }}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {MODULE_FILTERS.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedModule(m)}
                  style={{
                    padding: '4px 10px', borderRadius: 5, fontSize: 11.5, fontWeight: 600,
                    border: selectedModule === m ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    background: selectedModule === m ? '#eff6ff' : '#ffffff',
                    color: selectedModule === m ? '#2563eb' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Audit Data Table */}
          <div className="erp-card" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', width: 140 }}>Timestamp</th>
                    <th style={{ textAlign: 'left', width: 110 }}>Module</th>
                    <th style={{ textAlign: 'left', width: 160 }}>Action</th>
                    <th style={{ textAlign: 'left', width: 130 }}>Reference</th>
                    <th style={{ textAlign: 'left' }}>Event Description</th>
                    <th style={{ textAlign: 'left', width: 160 }}>User / Actor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No audit events match current search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log, idx) => {
                      const badge = getModuleBadgeColor(log.module);
                      const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : (log.date || 'N/A');

                      return (
                        <tr key={log.id || log._id || idx}>
                          <td style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap' }}>
                            <span className="font-mono">{timeStr}</span>
                          </td>
                          <td>
                            <span style={{
                              display: 'inline-block', padding: '2px 7px', borderRadius: 4,
                              fontSize: 11, fontWeight: 600, background: badge.bg, color: badge.color
                            }}>
                              {log.module || 'System'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, fontSize: 12 }}>
                            <span className="font-mono" style={{ color: '#0f172a' }}>
                              {log.action}
                            </span>
                          </td>
                          <td>
                            <span className="font-mono" style={{ fontSize: 11.5, color: '#2563eb', fontWeight: 500 }}>
                              {log.referenceId || log.referenceType || '—'}
                            </span>
                          </td>
                          <td style={{ color: '#334155', fontSize: 12.5 }}>
                            {log.description}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#64748b' }}>
                              <User size={12} />
                              <span style={{ fontWeight: 500, color: '#0f172a' }}>
                                {log.userName || log.userEmail || log.user || 'Admin'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: GENERAL PREFERENCES ─────────────────────────── */}
      {activeTab === 'general' && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 840 }}>
          
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
      )}

    </div>
  );
}
