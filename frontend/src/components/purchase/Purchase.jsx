import { useState, useMemo } from 'react';
import {
  FileText, Plus, Search, CheckCircle2, Clock, Trash2,
  X, AlertCircle, ArrowRight, PackageCheck, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErp } from '../../context/ErpContext';

const STATUS_FILTERS = ['All POs', 'Draft', 'Confirmed', 'Received'];

export default function Purchase() {
  const {
    purchaseOrders = [],
    suppliers = [],
    products = [],
    createPurchaseOrder,
    receivePurchaseOrder,
    formatCurrency
  } = useErp();

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All POs');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [items, setItems] = useState([
    { productId: '', quantity: 10, unitPrice: 0 }
  ]);

  const handleOpenAdd = () => {
    const defaultVendor = suppliers[0]?.id || suppliers[0]?._id || '';
    const rawProds = products.filter(p => p.type !== 'Finished Good');
    const defaultProd = (rawProds[0] || products[0])?.id || (rawProds[0] || products[0])?._id || '';
    const defaultCost = (rawProds[0] || products[0])?.costPrice || 1200;

    setSelectedVendorId(defaultVendor);
    setItems([{ productId: defaultProd, quantity: 50, unitPrice: defaultCost }]);
    setShowAddModal(true);
  };

  const handleProductChange = (index, prodId) => {
    const prod = products.find(p => (p.id || p._id) === prodId);
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId: prodId,
      unitPrice: prod ? (prod.costPrice || prod.purchasePrice || 0) : 0
    };
    setItems(updated);
  };

  const handleQtyChange = (index, qty) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      quantity: Math.max(1, Number(qty) || 1)
    };
    setItems(updated);
  };

  const handleAddLine = () => {
    const rawProds = products.filter(p => p.type !== 'Finished Good');
    const defaultProd = (rawProds[0] || products[0])?.id || '';
    const defaultCost = (rawProds[0] || products[0])?.costPrice || 0;
    setItems([...items, { productId: defaultProd, quantity: 10, unitPrice: defaultCost }]);
  };

  const handleRemoveLine = (idx) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const calculateTotal = useMemo(() => {
    return items.reduce((acc, it) => acc + ((Number(it.quantity) || 0) * (Number(it.unitPrice) || 0)), 0);
  }, [items]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVendorId) return alert("Please select a vendor");

    const payload = {
      vendorId: selectedVendorId,
      items: items.map(it => ({
        productId: it.productId,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0
      }))
    };

    await createPurchaseOrder(payload);
    setShowAddModal(false);
  };

  const handleReceive = async (poId) => {
    if (window.confirm("Receive goods and increase on-hand inventory balances?")) {
      await receivePurchaseOrder(poId);
    }
  };

  // Filtered Orders
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const q = search.toLowerCase();
      const poNum = (po.poNumber || po.id || po._id || '').toLowerCase();
      const vendorName = (po.vendorName || po.vendor?.name || '').toLowerCase();
      const matchesSearch = poNum.includes(q) || vendorName.includes(q);

      const status = (po.status || 'DRAFT').toUpperCase();
      if (selectedFilter === 'Draft') return matchesSearch && status === 'DRAFT';
      if (selectedFilter === 'Confirmed') return matchesSearch && (status === 'CONFIRMED' || status === 'PENDING');
      if (selectedFilter === 'Received') return matchesSearch && (status === 'RECEIVED' || status === 'COMPLETED');

      return matchesSearch;
    });
  }, [purchaseOrders, search, selectedFilter]);

  const totalSpent = useMemo(() => purchaseOrders.filter(po => po.status !== 'CANCELLED').reduce((acc, po) => acc + (Number(po.totalAmount) || 0), 0), [purchaseOrders]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Procurement & Purchase Orders
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
            Vendor purchase requisitions, automated replenishment triggers, and idempotent goods receipt.
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
          <Plus size={14} /> New Purchase Order
        </button>
      </div>

      {/* ── Summary Tiles ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="erp-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Procurement Cost
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
            {formatCurrency ? formatCurrency(totalSpent) : `₹${totalSpent.toLocaleString()}`}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Across {purchaseOrders.length} purchase orders
          </div>
        </div>

        <div className="erp-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Vendors
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
            {suppliers.length} Registered Suppliers
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Timber, hardware, and chemical depots
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ───────────────────────────────────── */}
      <div className="erp-card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', padding: '3px', borderRadius: 6 }}>
          {STATUS_FILTERS.map(tab => {
            const active = selectedFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
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

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#ffffff', padding: '5px 10px',
          borderRadius: 6, border: '1px solid #cbd5e1', width: 280
        }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search by PO # or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 12.5, color: '#0f172a', width: '100%'
            }}
          />
        </div>
      </div>

      {/* ── Purchase Orders Table ────────────────────────────── */}
      <div className="erp-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '130px' }}>PO Number</th>
                <th style={{ textAlign: 'left' }}>Vendor / Supplier</th>
                <th style={{ textAlign: 'left' }}>Items Requisitioned</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Total Amount</th>
                <th style={{ textAlign: 'right', width: '130px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No purchase orders recorded yet.
                  </td>
                </tr>
              ) : (
                filteredPOs.map(po => {
                  const status = (po.status || 'DRAFT').toUpperCase();
                  const isReceived = status === 'RECEIVED' || status === 'COMPLETED';
                  const isConfirmed = status === 'CONFIRMED' || status === 'PENDING';

                  return (
                    <tr key={po.id || po._id}>
                      <td>
                        <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>
                          {po.poNumber || po.id || 'PO-001'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {po.vendorName || po.vendor?.name || 'Timber Vendor'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5, color: '#334155' }}>
                          {(po.items || []).map((it, idx) => (
                            <span key={idx}>
                              {it.quantity}x {it.productName || it.product?.name || 'Raw Material'}
                              {idx < (po.items || []).length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                          background: isReceived ? '#ecfdf5' : isConfirmed ? '#eff6ff' : '#fef3c7',
                          color: isReceived ? '#059669' : isConfirmed ? '#2563eb' : '#b45309'
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                          {status}
                        </span>
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        {formatCurrency ? formatCurrency(po.totalAmount || 0) : `₹${(po.totalAmount || 0).toLocaleString()}`}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isConfirmed && (
                          <button
                            onClick={() => handleReceive(po.id || po._id)}
                            style={{
                              border: 'none', background: '#16a34a', color: '#fff',
                              borderRadius: 4, padding: '4px 8px', fontSize: 11.5,
                              fontWeight: 600, cursor: 'pointer'
                            }}
                          >
                            Receive Goods
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create PO Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              style={{
                width: '100%', maxWidth: 560, background: '#ffffff',
                borderRadius: 8, border: '1px solid #cbd5e1',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)', overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                  Create Purchase Order
                </span>
                <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Select Vendor</label>
                  <select
                    required
                    value={selectedVendorId}
                    onChange={e => setSelectedVendorId(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                  >
                    <option value="" disabled>Choose vendor...</option>
                    {suppliers.map(s => (
                      <option key={s.id || s._id} value={s.id || s._id}>
                        {s.name} ({s.email || 'Supplier'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#475569' }}>Items to Order</span>
                    <button
                      type="button"
                      onClick={handleAddLine}
                      style={{ border: 'none', background: 'transparent', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Add Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {items.map((item, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                        <select
                          value={item.productId}
                          onChange={e => handleProductChange(idx, e.target.value)}
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5, background: '#fff' }}
                        >
                          {products.map(p => (
                            <option key={p.id || p._id} value={p.id || p._id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleQtyChange(idx, e.target.value)}
                          placeholder="Qty"
                          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 12.5 }}
                        />
                        <div className="tabular-nums" style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>
                          ₹{(item.quantity * item.unitPrice).toLocaleString()}
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Total Purchase Cost: </span>
                    <span className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                      ₹{calculateTotal.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
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
                      Issue Purchase Order
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
