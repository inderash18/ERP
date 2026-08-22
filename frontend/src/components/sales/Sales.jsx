import { useState, useMemo } from 'react';
import {
  ShoppingCart, Plus, Search, CheckCircle2, Clock, Trash2,
  X, AlertCircle, FileText, ArrowRight, PackageCheck, Send
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';

const STATUS_FILTERS = ['All Orders', 'Draft', 'Confirmed', 'Delivered', 'Cancelled'];

export default function Sales() {
  const {
    orders = [],
    customers = [],
    products = [],
    createSalesOrder,
    confirmSalesOrder,
    fulfillSalesOrder,
    deleteSalesOrder,
    formatCurrency
  } = useErp();

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Orders');
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [lineItems, setLineItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0 }
  ]);

  const handleOpenNewOrder = () => {
    const defaultCust = customers[0]?.id || customers[0]?._id || '';
    const defaultProd = products[0]?.id || products[0]?._id || '';
    const defaultPrice = products[0]?.salesPrice || 45000;

    setSelectedCustomerId(defaultCust);
    setLineItems([{ productId: defaultProd, quantity: 1, unitPrice: defaultPrice }]);
    setShowOrderModal(true);
  };

  const handleProductChange = (index, prodId) => {
    const prod = products.find(p => (p.id || p._id) === prodId);
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      productId: prodId,
      unitPrice: prod ? (prod.salesPrice || prod.sellingPrice || 0) : 0
    };
    setLineItems(updated);
  };

  const handleQtyChange = (index, qty) => {
    const updated = [...lineItems];
    updated[index] = {
      ...updated[index],
      quantity: Math.max(1, Number(qty) || 1)
    };
    setLineItems(updated);
  };

  const handleAddLine = () => {
    const defaultProd = products[0]?.id || products[0]?._id || '';
    const defaultPrice = products[0]?.salesPrice || 0;
    setLineItems([...lineItems, { productId: defaultProd, quantity: 1, unitPrice: defaultPrice }]);
  };

  const handleRemoveLine = (idx) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== idx));
    }
  };

  const calculateTotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)), 0);
  }, [lineItems]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) return alert("Please select a customer");

    const payload = {
      customerId: selectedCustomerId,
      items: lineItems.map(item => ({
        productId: item.productId,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0
      }))
    };

    await createSalesOrder(payload);
    setShowOrderModal(false);
  };

  const handleDeliver = async (orderId) => {
    if (window.confirm("Confirm dispatch & delivery of this order? Physical stock will be deducted.")) {
      await fulfillSalesOrder(orderId);
    }
  };

  const handleCancel = async (orderId) => {
    if (window.confirm("Cancel this sales order and release stock reservations?")) {
      await deleteSalesOrder(orderId);
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = search.toLowerCase();
      const orderNum = (o.orderNumber || o.id || o._id || '').toLowerCase();
      const custName = (o.customerName || o.customer?.name || '').toLowerCase();
      const matchesSearch = orderNum.includes(q) || custName.includes(q);

      const status = (o.status || 'DRAFT').toUpperCase();
      if (selectedFilter === 'Draft') return matchesSearch && status === 'DRAFT';
      if (selectedFilter === 'Confirmed') return matchesSearch && (status === 'CONFIRMED' || status === 'RESERVED');
      if (selectedFilter === 'Delivered') return matchesSearch && status === 'DELIVERED';
      if (selectedFilter === 'Cancelled') return matchesSearch && status === 'CANCELLED';

      return matchesSearch;
    });
  }, [orders, search, selectedFilter]);

  // Aggregations
  const totalRevenue = useMemo(() => orders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0), [orders]);
  const activeOrdersCount = useMemo(() => orders.filter(o => o.status === 'CONFIRMED' || o.status === 'RESERVED').length, [orders]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Sales Orders & Commercial Fulfillment
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
            Customer orders, automated stock reservation, Make-to-Order procurement triggers, and dispatch delivery.
          </p>
        </div>

        <button
          onClick={handleOpenNewOrder}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 6,
            background: '#2563eb', color: '#ffffff',
            fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
          }}
        >
          <Plus size={14} /> Create Sales Order
        </button>
      </div>

      {/* ── Summary Tiles ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        <div className="erp-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Sales Revenue
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
            {formatCurrency ? formatCurrency(totalRevenue) : `₹${totalRevenue.toLocaleString()}`}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Across {orders.length} total commercial orders
          </div>
        </div>

        <div className="erp-card" style={{ padding: '14px 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Orders in Pipeline
          </div>
          <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
            {activeOrdersCount} Pending Fulfillment
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            Stock reserved and ready for delivery
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
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 12.5, color: '#0f172a', width: '100%'
            }}
          />
        </div>
      </div>

      {/* ── Orders Data Table ────────────────────────────────── */}
      <div className="erp-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '130px' }}>Order ID</th>
                <th style={{ textAlign: 'left' }}>Customer</th>
                <th style={{ textAlign: 'left' }}>Items Ordered</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Total Value</th>
                <th style={{ textAlign: 'right', width: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No sales orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const status = (order.status || 'DRAFT').toUpperCase();
                  const isDelivered = status === 'DELIVERED';
                  const isConfirmed = status === 'CONFIRMED' || status === 'RESERVED';
                  const isCancelled = status === 'CANCELLED';

                  return (
                    <tr key={order.id || order._id}>
                      <td>
                        <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>
                          {order.orderNumber || order.id || 'SO-001'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {order.customerName || order.customer?.name || 'Commercial Client'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 12.5, color: '#334155' }}>
                          {(order.items || []).map((it, idx) => (
                            <span key={idx}>
                              {it.quantity}x {it.productName || it.product?.name || 'Item'}
                              {idx < (order.items || []).length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                          background: isDelivered ? '#ecfdf5' : isConfirmed ? '#eff6ff' : isCancelled ? '#fef2f2' : '#fef3c7',
                          color: isDelivered ? '#059669' : isConfirmed ? '#2563eb' : isCancelled ? '#dc2626' : '#b45309'
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                          {status}
                        </span>
                      </td>
                      <td className="tabular-nums" style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                        {formatCurrency ? formatCurrency(order.totalAmount || 0) : `₹${(order.totalAmount || 0).toLocaleString()}`}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {isConfirmed && (
                            <button
                              onClick={() => handleDeliver(order.id || order._id)}
                              style={{
                                border: 'none', background: '#16a34a', color: '#fff',
                                borderRadius: 4, padding: '4px 8px', fontSize: 11.5,
                                fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              Deliver
                            </button>
                          )}
                          {!isDelivered && !isCancelled && (
                            <button
                              onClick={() => handleCancel(order.id || order._id)}
                              style={{
                                border: '1px solid #cbd5e1', background: '#fff', color: '#64748b',
                                borderRadius: 4, padding: '4px 8px', fontSize: 11.5,
                                fontWeight: 600, cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          )}
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

      {/* ── Create Order Modal ───────────────────────────────── */}
      {showOrderModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div
            style={{
              width: '100%', maxWidth: 560, background: '#ffffff',
              borderRadius: 8, border: '1px solid #cbd5e1',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)', overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                Create Sales Order
              </span>
              <button onClick={() => setShowOrderModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Select Customer Account</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                >
                  <option value="" disabled>Choose customer...</option>
                  {customers.map(c => (
                    <option key={c.id || c._id} value={c.id || c._id}>
                      {c.name} ({c.email || 'Client'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#475569' }}>Order Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    style={{ border: 'none', background: 'transparent', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {lineItems.map((item, idx) => (
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
                      {lineItems.length > 1 && (
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
                  <span style={{ fontSize: 12, color: '#64748b' }}>Total Order Value: </span>
                  <span className="tabular-nums" style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                    ₹{calculateTotal.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
