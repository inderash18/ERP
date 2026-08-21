import { useState, useMemo } from 'react';
import { Truck, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErp } from '../../context/ErpContext';
import { TextShuffle } from '../common/AnimatedText';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e1ebe4',
  boxShadow: '0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
};

export default function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useErp();
  
  const [search, setSearch] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    paymentTerms: 'Net 30',
    status: 'Active'
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '', code: `VEND-${Math.floor(1000 + Math.random() * 9000)}`,
      contactPerson: '', email: '', phone: '', address: '',
      paymentTerms: 'Net 30', status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowAddModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert("Name and Code are required");
      return;
    }

    if (editingItem) {
      updateSupplier(editingItem.id, formData);
    } else {
      addSupplier(formData);
    }
    setShowAddModal(false);
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(item => {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
    });
  }, [suppliers, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            <TextShuffle text="Supplier Directory" duration={700} />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Manage vendors, procurement contacts, and payment terms.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: '10px',
            background: '#2d5a45', border: 'none', color: '#ffffff',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(45,90,69,0.25)', transition: 'transform 0.15s'
          }}
        >
          <Plus size={16} /> New Supplier
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '7px 14px', borderRadius: '10px', border: '1px solid #d4ddd6', width: '280px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }}
          />
        </div>
      </div>

      <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e1ebe4' }}>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>SUPPLIER & CODE</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>CONTACT</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>PAYMENT TERMS</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>STATUS</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f8faf9', border: '1px solid #e1ebe4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <Truck size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>{item.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '13px', color: '#0f172a' }}>{item.contactPerson}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>{item.email}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#0f172a' }}>{item.paymentTerms}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: item.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: item.status === 'Active' ? '#166534' : '#475569' }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenEdit(item)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 6 }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => { if(window.confirm('Delete this supplier?')) deleteSupplier(item.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6, marginLeft: 6 }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }} onClick={() => setShowAddModal(false)} />
            
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{ position: 'relative', background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                  {editingItem ? 'Edit Supplier' : 'Add New Supplier'}
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Supplier Name *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Supplier Code *</label>
                    <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Contact Person</label>
                    <input type="text" value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d4ddd6', background: '#ffffff', color: '#475569', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2d5a45', color: '#ffffff', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
