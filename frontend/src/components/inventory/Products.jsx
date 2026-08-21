import { useState, useMemo } from 'react';
import {
  Package, Plus, Search, CheckCircle, AlertTriangle, Trash2,
  Edit2, X, Tag, DollarSign
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

const CATEGORIES = ["All", "Raw Material", "Component", "Finished Good"];

export default function Products() {
  const {
    products,
    suppliers,
    addProduct,
    updateProduct,
    deleteProduct,
    formatCurrency
  } = useErp();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    type: 'Raw Material',
    unit: 'pcs',
    purchasePrice: '',
    sellingPrice: '',
    stock: '0',
    minStock: '10',
    targetStock: '50',
    supplierId: ''
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      sku: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      category: '',
      type: 'Raw Material',
      unit: 'pcs',
      purchasePrice: '',
      sellingPrice: '',
      stock: '0',
      minStock: '10',
      targetStock: '50',
      supplierId: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      sku: item.sku,
      category: item.category,
      type: item.type,
      unit: item.unit,
      purchasePrice: String(item.purchasePrice || 0),
      sellingPrice: String(item.sellingPrice || 0),
      stock: String(item.stock),
      minStock: String(item.minStock),
      targetStock: String(item.targetStock || item.minStock * 2),
      supplierId: item.supplierId || ''
    });
    setShowAddModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Product name required");
    if (!formData.sku.trim()) return alert("SKU required");

    const payload = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      type: formData.type,
      unit: formData.unit,
      purchasePrice: Number(formData.purchasePrice) || 0,
      sellingPrice: Number(formData.sellingPrice) || 0,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 0,
      targetStock: Number(formData.targetStock) || 0,
      supplierId: formData.supplierId || null
    };

    if (editingItem) {
      updateProduct(editingItem.id, payload);
    } else {
      addProduct(payload);
    }

    setShowAddModal(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(item => {
      const q = search.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(q) ||
                            item.sku.toLowerCase().includes(q) ||
                            (item.category || '').toLowerCase().includes(q);
      const matchesType = selectedType === 'All' || item.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [products, search, selectedType]);

  const rawMatCount = products.filter(p => p.type === 'Raw Material').length;
  const compCount = products.filter(p => p.type === 'Component').length;
  const fgCount = products.filter(p => p.type === 'Finished Good').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            <TextShuffle text="Product Master" duration={700} />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Manage your entire catalog: raw materials, components, and finished goods.
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
          <Plus size={16} /> New Product
        </button>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Catalog SKUs</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{products.length}</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Raw Materials</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: 4 }}>{rawMatCount}</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Components</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb', marginTop: 4 }}>{compCount}</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Finished Goods</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#7c3aed', marginTop: 4 }}>{fgCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedType(cat)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 600,
                border: '1px solid', borderColor: selectedType === cat ? '#2d5a45' : '#d4ddd6',
                background: selectedType === cat ? '#2d5a45' : '#ffffff',
                color: selectedType === cat ? '#ffffff' : '#475569', cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '7px 14px', borderRadius: '10px', border: '1px solid #d4ddd6', width: '280px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e1ebe4' }}>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>PRODUCT & SKU</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>TYPE & CATEGORY</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>PRICING</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>STOCK PARAMS</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <Package size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Tag size={12} /> {item.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '4px', background: item.type === 'Finished Good' ? '#ede9fe' : item.type === 'Component' ? '#dbeafe' : '#f1f5f9', color: item.type === 'Finished Good' ? '#6d28d9' : item.type === 'Component' ? '#1d4ed8' : '#475569', fontSize: '11.5px', fontWeight: 600 }}>
                      {item.type}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: 4 }}>{item.category}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '13px', color: '#0f172a' }}>
                      <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Cost</span>
                      {formatCurrency(item.purchasePrice)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#0f172a', marginTop: 4 }}>
                      <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Selling</span>
                      {formatCurrency(item.sellingPrice)}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                      Curr: {item.stock} {item.unit}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>
                      Min: {item.minStock} | Tgt: {item.targetStock}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button onClick={() => handleOpenEdit(item)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 6 }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => { if(window.confirm('Delete this product?')) deleteProduct(item.id); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6, marginLeft: 6 }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
                    No products found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }} onClick={() => setShowAddModal(false)} />
            
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{ position: 'relative', background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                  {editingItem ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Product Name *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} placeholder="e.g. Wooden Table" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>SKU Code *</label>
                    <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Type</label>
                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }}>
                      <option>Raw Material</option>
                      <option>Component</option>
                      <option>Finished Good</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Category</label>
                    <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} placeholder="e.g. Wood, Hardware" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Unit of Measure</label>
                    <input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} placeholder="e.g. pcs, kg, L" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Purchase Cost</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                      <input type="number" value={formData.purchasePrice} onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })} style={{ width: '100%', padding: '10px 12px 10px 32px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} placeholder="0.00" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Selling Price</label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={14} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 12 }} />
                      <input type="number" value={formData.sellingPrice} onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })} style={{ width: '100%', padding: '10px 12px 10px 32px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} placeholder="0.00" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Current Stock</label>
                    <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Min Stock Alert</label>
                    <input type="number" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Target Stock (MTS)</label>
                    <input type="number" value={formData.targetStock} onChange={e => setFormData({ ...formData, targetStock: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Default Supplier</label>
                  <select value={formData.supplierId} onChange={e => setFormData({ ...formData, supplierId: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }}>
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d4ddd6', background: '#ffffff', color: '#475569', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2d5a45', color: '#ffffff', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                    {editingItem ? 'Save Changes' : 'Create Product'}
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
