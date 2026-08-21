import { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Search, CheckCircle, Clock, Trash2, Eye, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErp } from '../../context/ErpContext';
import { TextShuffle } from '../common/AnimatedText';

const CARD_STYLE = {
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #e1ebe4',
  boxShadow: '0 4px 18px -2px rgba(28, 48, 38, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02)',
};

export default function Purchase() {
  const { purchaseOrders, suppliers, products, createPurchaseOrder, receivePurchaseOrder, updatePurchaseOrderStatus, formatCurrency } = useErp();
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(null); // holds PO object

  const [formData, setFormData] = useState({
    supplierId: '',
    expectedDate: '',
    items: [] // { productId, quantity, unitPrice }
  });

  const handleOpenAdd = () => {
    setFormData({
      supplierId: '',
      expectedDate: '',
      items: []
    });
    setShowAddModal(true);
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const updateItemRow = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    // Auto fill price
    if (field === 'productId') {
      const p = products.find(x => x.id === value);
      if (p) newItems[index].unitPrice = p.purchasePrice || 0;
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const removeItemRow = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.supplierId) return alert("Select a supplier");
    if (formData.items.length === 0) return alert("Add at least one item");
    if (formData.items.some(i => !i.productId || i.quantity <= 0)) return alert("Invalid items in the order");

    const sup = suppliers.find(s => s.id === formData.supplierId);
    
    const mappedItems = formData.items.map(i => {
      const p = products.find(x => x.id === i.productId);
      return {
        productId: i.productId,
        productName: p ? p.name : 'Unknown',
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      };
    });

    createPurchaseOrder({
      supplierId: sup.id,
      supplierName: sup.name,
      expectedDate: formData.expectedDate,
      items: mappedItems
    });

    setShowAddModal(false);
  };

  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const q = search.toLowerCase();
      const matchesSearch = po.id.toLowerCase().includes(q) || po.supplierName.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'All' || po.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, search, filterStatus]);

  const totalPoCount = purchaseOrders.length;
  const pendingCount = purchaseOrders.filter(p => p.status === 'Ordered' || p.status === 'Draft').length;
  const receivedCount = purchaseOrders.filter(p => p.status === 'Received').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            <TextShuffle text="Purchase Orders" duration={700} />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Manage POs, receive raw materials, and track supplier deliveries.
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
          <Plus size={16} /> Create PO
        </button>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Purchase Orders</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{totalPoCount}</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Pending Receipt</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginTop: 4 }}>{pendingCount}</div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Fully Received</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: 4 }}>{receivedCount}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'Draft', 'Ordered', 'Received', 'Cancelled'].map(s => (
            <button
              key={s} onClick={() => setFilterStatus(s)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '12.5px', fontWeight: 600,
                border: '1px solid', borderColor: filterStatus === s ? '#2d5a45' : '#d4ddd6',
                background: filterStatus === s ? '#2d5a45' : '#ffffff',
                color: filterStatus === s ? '#ffffff' : '#475569', cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '7px 14px', borderRadius: '10px', border: '1px solid #d4ddd6', width: '280px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search POs..."
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
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>PO NUMBER & DATE</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>SUPPLIER</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>TOTAL AMOUNT</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>STATUS</th>
                <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.map(po => (
                <tr key={po.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <ShoppingCart size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>{po.id}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: 2 }}>{po.date}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#0f172a' }}>{po.supplierName}</td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>{formatCurrency(po.totalAmount)}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      background: po.status === 'Received' ? '#dcfce7' : po.status === 'Draft' ? '#f1f5f9' : '#fef3c7',
                      color: po.status === 'Received' ? '#166534' : po.status === 'Draft' ? '#475569' : '#92400e' }}>
                      {po.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button onClick={() => setShowViewModal(po)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 6 }}>
                      <Eye size={16} />
                    </button>
                    {po.status !== 'Received' && (
                      <button onClick={() => { if(window.confirm('Receive goods and increase stock?')) receivePurchaseOrder(po.id); }} style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', padding: 6, marginLeft: 6 }} title="Receive Goods">
                        <Box size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPOs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View PO Modal */}
      <AnimatePresence>
        {showViewModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }} onClick={() => setShowViewModal(null)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ position: 'relative', background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            >
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>PO Details: {showViewModal.id}</h3>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}><strong>Supplier:</strong> {showViewModal.supplierName}</p>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}><strong>Status:</strong> {showViewModal.status}</p>
              
              <table style={{ width: '100%', marginTop: 20, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e1ebe4' }}>
                    <th style={{ padding: '10px', fontSize: '12px', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '10px', fontSize: '12px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '10px', fontSize: '12px', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '10px', fontSize: '12px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {showViewModal.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px', fontSize: '13px' }}>{it.productName}</td>
                      <td style={{ padding: '10px', fontSize: '13px', textAlign: 'right' }}>{it.quantity}</td>
                      <td style={{ padding: '10px', fontSize: '13px', textAlign: 'right' }}>{formatCurrency(it.unitPrice)}</td>
                      <td style={{ padding: '10px', fontSize: '13px', textAlign: 'right' }}>{formatCurrency(it.quantity * it.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 20, textAlign: 'right', fontWeight: 700 }}>
                Total: {formatCurrency(showViewModal.totalAmount)}
              </div>
              <div style={{ marginTop: 20, textAlign: 'right' }}>
                <button onClick={() => setShowViewModal(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d4ddd6', background: '#fff', cursor: 'pointer' }}>Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create PO Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)' }} onClick={() => setShowAddModal(false)} />
            
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{ position: 'relative', background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '700px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Create Purchase Order</h3>
              </div>

              <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Supplier *</label>
                    <select value={formData.supplierId} onChange={e => setFormData({ ...formData, supplierId: e.target.value })} required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }}>
                      <option value="">-- Select Supplier --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Expected Date</label>
                    <input type="date" value={formData.expectedDate} onChange={e => setFormData({ ...formData, expectedDate: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d4ddd6', fontSize: '13.5px', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: 6 }}>Order Items *</label>
                  {formData.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                      <select value={item.productId} onChange={e => updateItemRow(idx, 'productId', e.target.value)} required style={{ flex: 2, padding: '8px', borderRadius: '6px', border: '1px solid #d4ddd6' }}>
                        <option value="">-- Select Product/Material --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                      </select>
                      <input type="number" value={item.quantity} onChange={e => updateItemRow(idx, 'quantity', e.target.value)} required min="1" placeholder="Qty" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d4ddd6' }} />
                      <input type="number" value={item.unitPrice} onChange={e => updateItemRow(idx, 'unitPrice', e.target.value)} required min="0" placeholder="Price" style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d4ddd6' }} />
                      <button type="button" onClick={() => removeItemRow(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={addItemRow} style={{ marginTop: 8, padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>+ Add Row</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d4ddd6', background: '#ffffff', color: '#475569', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#2d5a45', color: '#ffffff', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>Create Order</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
