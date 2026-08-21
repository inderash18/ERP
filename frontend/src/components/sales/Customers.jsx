import { useState, useMemo } from 'react';
import {
  Users, UserPlus, Mail, Phone, MapPin, Building2,
  Trash2, Edit2, Search, X, ShoppingBag, DollarSign
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

const TIERS = ["All", "Enterprise Tier", "Strategic Partner", "Growth Account"];

export default function Customers() {
  const {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    metrics,
    formatCurrency
  } = useErp();

  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    city: '',
    tier: 'Enterprise Tier',
  });

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      contact: '',
      email: '',
      phone: '',
      city: '',
      tier: 'Enterprise Tier',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      contact: cust.contact,
      email: cust.email,
      phone: cust.phone,
      city: cust.city,
      tier: cust.tier,
    });
    setShowModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }

    setShowModal(false);
  };

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = search.toLowerCase();
      const matchesSearch = c.name.toLowerCase().includes(q) ||
                            c.contact.toLowerCase().includes(q) ||
                            c.email.toLowerCase().includes(q) ||
                            c.city.toLowerCase().includes(q);
      const matchesTier = selectedTier === 'All' || c.tier === selectedTier;
      return matchesSearch && matchesTier;
    });
  }, [customers, search, selectedTier]);

  // KPIs
  const totalCustomersCount = customers.length;
  const enterpriseCount = customers.filter(c => c.tier === 'Enterprise Tier').length;
  const totalClientSpend = Object.values(metrics.customerSpendMap).reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            <TextShuffle text="Customer Directory & CRM" duration={700} />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Client accounts, automated lifetime spend aggregation, tier terms, and contact profiles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
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
          <UserPlus size={16} /> Add New Client
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active Registered Clients</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
            {totalCustomersCount} Companies
          </div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Enterprise Strategic Accounts</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>
            {enterpriseCount} Accounts
          </div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Aggregated Client Spend</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: 4 }}>
            {formatCurrency(totalClientSpend)}
          </div>
        </div>
      </div>

      {/* Tier Filter & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {TIERS.map(tier => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedTier === tier ? '#7c3aed' : '#d4ddd6',
                background: selectedTier === tier ? '#7c3aed' : '#ffffff',
                color: selectedTier === tier ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tier}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '7px 14px', borderRadius: '10px', border: '1px solid #d4ddd6', width: '280px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, contact, or city..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#1e293b', width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Client Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {filteredCustomers.map((c) => {
          const spend = metrics.customerSpendMap[c.id] || 0;
          const orderCount = metrics.customerOrderCountMap[c.id] || 0;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ ...CARD_STYLE, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: c.tier === 'Enterprise Tier' ? '#f5f3ff' : c.tier === 'Strategic Partner' ? '#eff6ff' : '#ecfdf5',
                    color: c.tier === 'Enterprise Tier' ? '#7c3aed' : c.tier === 'Strategic Partner' ? '#2563eb' : '#059669'
                  }}>
                    {c.tier}
                  </span>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '8px 0 2px' }}>
                    {c.name}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>POC: {c.contact}</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Lifetime Spend</span>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#059669', marginTop: 2 }}>
                    {formatCurrency(spend)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eef3f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={14} color="#94a3b8" /> {c.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={14} color="#94a3b8" /> {c.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={14} color="#94a3b8" /> {c.city}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eef3f0', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                <button
                  onClick={() => handleOpenEdit(c)}
                  style={{ border: '1px solid #d1ded5', background: '#fff', color: '#475569', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  title="Edit client"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete client record for ${c.name}?`)) {
                      deleteCustomer(c.id);
                    }
                  }}
                  style={{ border: '1px solid #fecaca', background: '#fff', color: '#dc2626', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                  title="Delete client"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <Users size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <div>No clients found matching current filter.</div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
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
                maxWidth: '480px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {editingCustomer ? 'Edit Client Record' : 'Register New Client'}
                </h3>
                <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Industrial Corp"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Contact Person
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      placeholder="e.g. Rajesh Sharma"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Account Tier
                    </label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none', background: '#fff' }}
                    >
                      <option value="Enterprise Tier">Enterprise Tier</option>
                      <option value="Strategic Partner">Strategic Partner</option>
                      <option value="Growth Account">Growth Account</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="procurement@apexcorp.in"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98234 11200"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      City / State
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Mumbai, MH"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #d1ded5', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {editingCustomer ? 'Update Client' : 'Save Client'}
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
