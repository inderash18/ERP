import { useState, useMemo } from 'react';
import {
  Package, Plus, Search, CheckCircle2, AlertTriangle, Trash2,
  Edit2, X, Filter, ArrowUpDown, Layers, SlidersHorizontal
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

const TYPE_TABS = ["All Items", "Finished Good", "Raw Material", "Component"];

export default function Products() {
  const {
    products = [],
    suppliers = [],
    addProduct,
    updateProduct,
    deleteProduct,
    formatCurrency
  } = useErp();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All Items');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    type: 'Raw Material',
    unit: 'pcs',
    salesPrice: '',
    costPrice: '',
    procurementStrategy: 'MTS',
    procurementType: 'PURCHASE',
    reorderLevel: '10',
    targetStock: '50',
    defaultVendor: ''
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      sku: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      category: '',
      type: 'Raw Material',
      unit: 'pcs',
      salesPrice: '0',
      costPrice: '500',
      procurementStrategy: 'MTS',
      procurementType: 'PURCHASE',
      reorderLevel: '10',
      targetStock: '50',
      defaultVendor: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      sku: item.sku || '',
      category: typeof item.category === 'object' && item.category ? item.category._id : (item.category || ''),
      type: item.type || 'Finished Good',
      unit: item.unit || 'pcs',
      salesPrice: String(item.salesPrice || item.sellingPrice || 0),
      costPrice: String(item.costPrice || item.purchasePrice || 0),
      procurementStrategy: item.procurementStrategy || 'MTS',
      procurementType: item.procurementType || 'PURCHASE',
      reorderLevel: String(item.reorderLevel || item.minStock || 10),
      targetStock: String(item.targetStock || 50),
      defaultVendor: item.defaultVendor?._id || item.supplierId || ''
    });
    setShowAddModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Product name is required");
    if (!formData.sku.trim()) return alert("SKU is required");

    setIsSubmitting(true);
    const payload = {
      name: formData.name.trim(),
      sku: formData.sku.trim().toUpperCase(),
      category: formData.category && formData.category.match(/^[0-9a-fA-F]{24}$/) ? formData.category : undefined,
      type: formData.type,
      unit: formData.unit,
      salesPrice: Number(formData.salesPrice) || 0,
      costPrice: Number(formData.costPrice) || 0,
      procurementStrategy: formData.procurementStrategy,
      procurementType: formData.procurementType,
      reorderLevel: Number(formData.reorderLevel) || 0,
      targetStock: Number(formData.targetStock) || 0,
      defaultVendor: formData.defaultVendor || undefined
    };

    try {
      if (editingItem) {
        await updateProduct(editingItem.id || editingItem._id, payload);
      } else {
        await addProduct(payload);
      }
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to save product:", err);
      alert(`Failed to save product: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this catalog item?")) {
      await deleteProduct(id);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = search.toLowerCase();
      const catName = typeof p.category === 'object' && p.category ? p.category.name : (p.category || '');
      const matchesSearch = (p.name || '').toLowerCase().includes(q) ||
                            (p.sku || '').toLowerCase().includes(q) ||
                            catName.toLowerCase().includes(q);
      const matchesType = selectedType === 'All Items' || p.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [products, search, selectedType]);

  // Inventory Aggregations
  const totalItemsCount = products.length;
  const finishedGoodsCount = products.filter(p => p.type === 'Finished Good').length;
  const rawMaterialsCount = products.filter(p => p.type === 'Raw Material').length;
  const componentsCount = products.filter(p => p.type === 'Component').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ── Header & Action Bar ──────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Product Catalog Master
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
            Master inventory records, SKU specifications, BoM routings, and procurement strategies.
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
          <Plus size={14} /> Add Product
        </button>
      </div>

      {/* ── Filter & Search Toolbar ──────────────────────────── */}
      <div className="erp-card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        
        {/* Type Filter Segmented Control */}
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: '3px', borderRadius: 6 }}>
          {TYPE_TABS.map(tab => {
            const active = selectedType === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedType(tab)}
                style={{
                  border: 'none',
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#0f172a' : '#64748b',
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  padding: '4px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.1s ease'
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#ffffff', padding: '5px 10px',
          borderRadius: 6, border: '1px solid #cbd5e1', width: 280
        }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Filter by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 12.5, color: '#0f172a', width: '100%'
            }}
          />
        </div>
      </div>

      {/* ── Product Data Table ───────────────────────────────── */}
      <div className="erp-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '120px' }}>SKU</th>
                <th style={{ textAlign: 'left' }}>Product Name</th>
                <th style={{ textAlign: 'left' }}>Category / Type</th>
                <th style={{ textAlign: 'left' }}>Procurement</th>
                <th style={{ textAlign: 'right' }}>Cost</th>
                <th style={{ textAlign: 'right' }}>Selling Price</th>
                <th style={{ textAlign: 'right' }}>On Hand</th>
                <th style={{ textAlign: 'right', width: '90px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const onHand = Number(p.onHand ?? p.stock) || 0;
                  const reorder = Number(p.reorderLevel ?? p.minStock) || 0;
                  const isLow = onHand <= reorder;
                  const catName = typeof p.category === 'object' && p.category ? p.category.name : (p.category || 'General');

                  return (
                    <tr key={p.id || p._id}>
                      <td>
                        <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>
                          {p.sku}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Unit: {p.unit || 'pcs'}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5, color: '#334155', fontWeight: 500 }}>{catName}</div>
                        <span style={{
                          fontSize: 10.5, fontWeight: 600,
                          color: p.type === 'Finished Good' ? '#16a34a' : p.type === 'Component' ? '#2563eb' : '#64748b'
                        }}>
                          {p.type}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                          background: p.procurementStrategy === 'MTO' ? '#eff6ff' : '#f1f5f9',
                          color: p.procurementStrategy === 'MTO' ? '#2563eb' : '#475569'
                        }}>
                          {p.procurementStrategy || 'MTS'} • {p.procurementType || 'PURCHASE'}
                        </span>
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right', color: '#475569' }}>
                        {formatCurrency ? formatCurrency(p.costPrice || p.purchasePrice || 0) : `₹${(p.costPrice || 0).toLocaleString()}`}
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        {formatCurrency ? formatCurrency(p.salesPrice || p.sellingPrice || 0) : `₹${(p.salesPrice || 0).toLocaleString()}`}
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontWeight: 700, color: isLow ? '#b45309' : '#0f172a'
                        }}>
                          {isLow && <AlertTriangle size={12} color="#d97706" />}
                          {onHand}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 4 }}>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            title="Edit"
                            style={{
                              border: '1px solid #cbd5e1', background: '#ffffff',
                              borderRadius: 4, padding: '4px 6px', cursor: 'pointer', color: '#475569'
                            }}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id || p._id)}
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
                  );
                })
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
              width: '100%', maxWidth: 520, background: '#ffffff',
              borderRadius: 8, border: '1px solid #cbd5e1',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)', overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                {editingItem ? 'Edit Catalog Item' : 'New Catalog Item'}
              </span>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Solid Teak Dining Table"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Item Type</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                  >
                    <option value="Finished Good">Finished Good</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Component">Component</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Unit of Measure</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs, feet, grams, pins"
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Cost Price (₹)</label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Selling Price (₹)</label>
                  <input
                    type="number"
                    value={formData.salesPrice}
                    onChange={e => setFormData({ ...formData, salesPrice: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Procurement Strategy</label>
                  <select
                    value={formData.procurementStrategy}
                    onChange={e => setFormData({ ...formData, procurementStrategy: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                  >
                    <option value="MTS">MTS (Make To Stock)</option>
                    <option value="MTO">MTO (Make To Order)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Reorder Threshold</label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={e => setFormData({ ...formData, reorderLevel: e.target.value })}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '7px 16px', borderRadius: 6, border: 'none',
                    background: 'var(--accent)', color: 'var(--canvas)', fontSize: 12.5, fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Processing...' : (editingItem ? 'Save Changes' : 'Create Item')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
