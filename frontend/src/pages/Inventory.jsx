import { useState, useMemo } from 'react';
import {
  Package, Plus, Search, CheckCircle, AlertTriangle, Trash2,
  Edit2, PlusCircle, MinusCircle, DollarSign, Filter, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErp } from '../context/ErpContext';
import { TextShuffle } from '../components/AnimatedText';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e1ebe4',
  boxShadow: '0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
};

const CATEGORIES = ["All", "Raw Material", "Components", "Hardware", "Finished Goods"];

export default function Inventory() {
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    adjustStock,
    deleteInventoryItem,
    formatCurrency
  } = useErp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Raw Material',
    sku: '',
    stock: '',
    minStock: '',
    unit: 'pcs',
    unitPrice: '',
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Raw Material',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: '50',
      minStock: '20',
      unit: 'pcs',
      unitPrice: '500',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      sku: item.sku,
      stock: String(item.stock),
      minStock: String(item.minStock),
      unit: item.unit,
      unitPrice: String(item.unitPrice || 100),
    });
    setShowAddModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a product name");
      return;
    }

    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        name: formData.name,
        category: formData.category,
        sku: formData.sku,
        stock: Number(formData.stock) || 0,
        minStock: Number(formData.minStock) || 0,
        unit: formData.unit,
        unitPrice: Number(formData.unitPrice) || 0,
      });
    } else {
      addInventoryItem({
        name: formData.name,
        category: formData.category,
        sku: formData.sku,
        stock: Number(formData.stock) || 0,
        minStock: Number(formData.minStock) || 0,
        unit: formData.unit,
        unitPrice: Number(formData.unitPrice) || 0,
      });
    }

    setShowAddModal(false);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      const q = search.toLowerCase();
      const matchesSearch = item.name.toLowerCase().includes(q) ||
                            item.sku.toLowerCase().includes(q) ||
                            item.category.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesLowStock = !onlyLowStock || item.stock <= item.minStock;

      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [inventory, search, selectedCategory, onlyLowStock]);

  // Live KPI Badges
  const totalSkus = inventory.length;
  const healthyCount = inventory.filter(i => i.stock > i.minStock).length;
  const lowStockCount = inventory.filter(i => i.stock <= i.minStock).length;
  const totalStockValue = inventory.reduce((sum, i) => sum + (i.stock * (i.unitPrice || 0)), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            <TextShuffle text="Inventory Management" duration={700} />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Live stock tracking, reorder thresholds, inventory valuation, and bin management.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 14px',
              borderRadius: '10px',
              background: onlyLowStock ? '#fef3c7' : '#ffffff',
              border: `1px solid ${onlyLowStock ? '#f59e0b' : '#d1ded5'}`,
              color: onlyLowStock ? '#92400e' : '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <AlertTriangle size={15} />
            {onlyLowStock ? "Showing Low Stock" : "Filter Low Stock"}
          </button>

          <button
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
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
            <Plus size={16} /> Add Product SKU
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Catalog SKUs</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
            {totalSkus} Items
          </div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Healthy Stock Items</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: 4 }}>
            {healthyCount}
          </div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Under Reorder Limit</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginTop: 4 }}>
            {lowStockCount} Items
          </div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Asset Valuation</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
            {formatCurrency(totalStockValue)}
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedCategory === cat ? '#2d5a45' : '#d4ddd6',
                background: selectedCategory === cat ? '#2d5a45' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '7px 14px', borderRadius: '10px', border: '1px solid #d4ddd6', width: '280px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU or item name..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#1e293b', width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef3f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
            Products Inventory ({filteredItems.length} displayed)
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Click + / - to adjust real-time stock
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e1ebe4', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                <th style={{ padding: '12px 18px' }}>SKU Code</th>
                <th style={{ padding: '12px 18px' }}>Item Description</th>
                <th style={{ padding: '12px 18px' }}>Category</th>
                <th style={{ padding: '12px 18px' }}>Unit Price</th>
                <th style={{ padding: '12px 18px' }}>In-Hand Qty</th>
                <th style={{ padding: '12px 18px' }}>Quick Adjust</th>
                <th style={{ padding: '12px 18px' }}>Status</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((row) => {
                const isLow = row.stock <= row.minStock;
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f3', transition: 'background 0.12s' }}>
                    <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 600, color: '#2d5a45' }}>
                      {row.sku}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>
                      {row.name}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#f1f5f3', fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                        {row.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#1e293b' }}>
                      {formatCurrency(row.unitPrice || 0)}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: isLow ? '#b45309' : '#1e293b' }}>
                      {row.stock} <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 400 }}>{row.unit}</span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => adjustStock(row.id, -10)}
                          title="Reduce stock by 10"
                          style={{ border: 'none', background: '#fee2e2', color: '#991b1b', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          -10
                        </button>
                        <button
                          onClick={() => adjustStock(row.id, -1)}
                          title="Reduce stock by 1"
                          style={{ border: 'none', background: '#fef2f2', color: '#dc2626', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          -1
                        </button>
                        <button
                          onClick={() => adjustStock(row.id, 1)}
                          title="Add stock by 1"
                          style={{ border: 'none', background: '#f0fdf4', color: '#16a34a', width: 24, height: 24, borderRadius: 6, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          +1
                        </button>
                        <button
                          onClick={() => adjustStock(row.id, 10)}
                          title="Add stock by 10"
                          style={{ border: 'none', background: '#dcfce7', color: '#15803d', width: 26, height: 26, borderRadius: 6, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          +10
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: isLow ? '#fffbeb' : '#ecfdf5',
                        color: isLow ? '#b45309' : '#059669',
                      }}>
                        {isLow ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                        {isLow ? `Low Stock (<${row.minStock})` : "In Stock"}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => handleOpenEdit(row)}
                          title="Edit product"
                          style={{ border: '1px solid #d1ded5', background: '#ffffff', color: '#475569', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete product ${row.name}?`)) {
                              deleteInventoryItem(row.id);
                            }
                          }}
                          title="Delete product"
                          style={{ border: '1px solid #fecaca', background: '#ffffff', color: '#dc2626', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    <Package size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
                    <div>No inventory items match the current filters.</div>
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
                  {editingItem ? 'Edit Product Item' : 'Add New Inventory SKU'}
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aluminum Bar 6063"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      SKU Code
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none', fontFamily: 'monospace' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none', background: '#fff' }}
                    >
                      <option value="Raw Material">Raw Material</option>
                      <option value="Components">Components</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Finished Goods">Finished Goods</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Min Threshold
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.minStock}
                      onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Unit
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none', background: '#fff' }}
                    >
                      <option value="pcs">pcs</option>
                      <option value="kg">kg</option>
                      <option value="boxes">boxes</option>
                      <option value="drums">drums</option>
                      <option value="Sheets">Sheets</option>
                      <option value="Units">Units</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Unit Price (Estimated Cost/Valuation)
                  </label>
                  <input
                    type="number"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    placeholder="e.g. 280"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #d1ded5', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#2d5a45', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
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