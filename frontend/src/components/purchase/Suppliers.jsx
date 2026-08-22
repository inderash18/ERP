import { useState, useMemo } from 'react';
import {
  Truck, Plus, Search, Edit2, Trash2, X, MapPin, Mail, Phone
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

export default function Suppliers() {
  const {
    suppliers = [],
    addSupplier,
    updateSupplier,
    deleteSupplier
  } = useErp();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: 'Mumbai, MH'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || ''
    });
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Vendor name required");

    if (editingItem) {
      await updateSupplier(editingItem.id || editingItem._id, formData);
    } else {
      await addSupplier(formData);
    }
    setShowAddModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this vendor record?")) {
      await deleteSupplier(id);
    }
  };

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const q = search.toLowerCase();
      const name = (s.name || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [suppliers, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Vendor & Supplier Directory
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
            Approved raw material timber merchants, hardware suppliers, and chemical finishes depots.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 6,
            background: '#2563eb', color: '#ffffff',
            fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
          }}
        >
          <Plus size={14} /> New Vendor
        </button>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="erp-card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
          {filteredSuppliers.length} Registered Suppliers
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#ffffff', padding: '5px 10px',
          borderRadius: 6, border: '1px solid #cbd5e1', width: 280
        }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search suppliers by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 12.5, color: '#0f172a', width: '100%'
            }}
          />
        </div>
      </div>

      {/* ── Suppliers Data Table ─────────────────────────────── */}
      <div className="erp-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Vendor Name</th>
                <th style={{ textAlign: 'left' }}>Email Address</th>
                <th style={{ textAlign: 'left' }}>Phone</th>
                <th style={{ textAlign: 'left' }}>Address</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ textAlign: 'right', width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No vendor records found.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(item => (
                  <tr key={item.id || item._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                    </td>
                    <td style={{ color: '#475569', fontSize: 12.5 }}>
                      {item.email || 'vendor@example.com'}
                    </td>
                    <td className="font-mono" style={{ color: '#475569', fontSize: 12 }}>
                      {item.phone || '+91 98000 00000'}
                    </td>
                    <td style={{ color: '#64748b', fontSize: 12.5 }}>
                      {item.address || 'Mumbai, MH'}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                        background: '#ecfdf5', color: '#059669'
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
                        Active
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Edit"
                          style={{
                            border: '1px solid #cbd5e1', background: '#ffffff',
                            borderRadius: 4, padding: '4px 6px', cursor: 'pointer', color: '#475569'
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id || item._id)}
                          title="Delete"
                          style={{
                            border: '1px solid #fecaca', background: '#fef2f2',
                            borderRadius: 4, padding: '4px 6px', cursor: 'pointer', color: '#dc2626'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ───────────────────────────────── */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div
            style={{
              width: '100%', maxWidth: 440, background: '#ffffff',
              borderRadius: 8, border: '1px solid #cbd5e1',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)', overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                {editingItem ? 'Edit Vendor' : 'New Vendor Account'}
              </span>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Vendor / Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. National Timber Suppliers"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. orders@nationaltimber.in"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98201 11223"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Timber Yard Plot 4, Mumbai"
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  {editingItem ? 'Save Changes' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
