import { useState, useMemo } from 'react';
import {
  ShoppingCart, ArrowUpRight, CheckCircle2, Clock, DollarSign, Download,
  Plus, Trash2, Search, X, AlertCircle, FileText, ChevronDown
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

const STATUS_OPTIONS = ['All', 'Processing', 'In Production', 'Ready for Dispatch', 'Delivered'];

export default function Sales() {
  const {
    orders,
    customers,
    inventory,
    createSalesOrder,
    updateOrderStatus,
    deleteSalesOrder,
    formatCurrency,
    metrics
  } = useErp();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showOrderModal, setShowOrderModal] = useState(false);

  // New Order Form State
  const [orderCustomer, setOrderCustomer] = useState('');
  const [orderPayment, setOrderPayment] = useState('Paid');
  const [orderFulfillment, setOrderFulfillment] = useState('Processing');
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1, unitPrice: 0 }
  ]);

  const handleOpenNewOrder = () => {
    const defaultCust = customers[0]?.id || '';
    const defaultProd = inventory[0]?.id || '';
    const defaultPrice = inventory[0]?.unitPrice || 100;

    setOrderCustomer(defaultCust);
    setOrderPayment('Paid');
    setOrderFulfillment('Processing');
    setOrderItems([{ productId: defaultProd, quantity: 1, unitPrice: defaultPrice }]);
    setShowOrderModal(true);
  };

  const handleItemProductChange = (index, prodId) => {
    const prod = inventory.find(i => i.id === prodId);
    const updated = [...orderItems];
    updated[index] = {
      ...updated[index],
      productId: prodId,
      unitPrice: prod ? prod.unitPrice : 0
    };
    setOrderItems(updated);
  };

  const handleItemQtyChange = (index, qty) => {
    const updated = [...orderItems];
    updated[index] = {
      ...updated[index],
      quantity: Math.max(1, Number(qty) || 1)
    };
    setOrderItems(updated);
  };

  const handleAddLineItem = () => {
    const defaultProd = inventory[0]?.id || '';
    const defaultPrice = inventory[0]?.unitPrice || 100;
    setOrderItems([...orderItems, { productId: defaultProd, quantity: 1, unitPrice: defaultPrice }]);
  };

  const handleRemoveLineItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  const calculatedTotal = useMemo(() => {
    return orderItems.reduce((sum, it) => sum + (Number(it.quantity) * Number(it.unitPrice)), 0);
  }, [orderItems]);

  const handleCreateOrder = (e) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === orderCustomer);
    if (!cust) {
      alert("Please select a customer");
      return;
    }

    const formattedItems = orderItems.map(it => {
      const prod = inventory.find(p => p.id === it.productId);
      return {
        productId: it.productId,
        productName: prod ? prod.name : "Product",
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        total: Number(it.quantity) * Number(it.unitPrice)
      };
    });

    createSalesOrder({
      customerId: cust.id,
      customerName: cust.name,
      paymentStatus: orderPayment,
      fulfillmentStatus: orderFulfillment,
      items: formattedItems
    });

    setShowOrderModal(false);
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      const q = search.toLowerCase();
      const matchesSearch = ord.id.toLowerCase().includes(q) ||
                            ord.customerName.toLowerCase().includes(q);
      const matchesStatus = selectedStatus === 'All' || ord.fulfillmentStatus === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, selectedStatus]);

  // Sales KPIs
  const totalSalesAmount = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const activeOrdersCount = orders.filter(o => o.fulfillmentStatus !== 'Delivered').length;
  const averageOrderValue = orders.length > 0 ? Math.round(totalSalesAmount / orders.length) : 0;

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer Name", "Date", "Amount", "Payment Status", "Fulfillment Status"];
    const rows = filteredOrders.map(o => [
      o.id,
      `"${o.customerName}"`,
      o.date,
      o.totalAmount,
      o.paymentStatus,
      o.fulfillmentStatus
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mini_erp_sales_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            <TextShuffle text="Sales & Order Management" duration={700} />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            Client purchase contracts, dynamic invoice billing, stock fulfillment, and payment tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 14px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #d1ded5',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={handleOpenNewOrder}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '9px 16px',
              borderRadius: '10px',
              background: '#2563eb',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
              transition: 'transform 0.15s'
            }}
          >
            <ShoppingCart size={16} /> New Sales Order
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Cumulative Sales</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
            {formatCurrency(totalSalesAmount)}
          </div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Active In-Flight Orders</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2563eb', marginTop: 4 }}>
            {activeOrdersCount} Orders
          </div>
        </div>
        <div style={{ ...CARD_STYLE, padding: '16px 18px' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Average Order Value</span>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginTop: 4 }}>
            {formatCurrency(averageOrderValue)}
          </div>
        </div>
      </div>

      {/* Status Filter & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {STATUS_OPTIONS.map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: '1px solid',
                borderColor: selectedStatus === st ? '#2563eb' : '#d4ddd6',
                background: selectedStatus === st ? '#2563eb' : '#ffffff',
                color: selectedStatus === st ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', padding: '7px 14px', borderRadius: '10px', border: '1px solid #d4ddd6', width: '280px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID or Customer..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', color: '#1e293b', width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ ...CARD_STYLE, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #eef3f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Sales Orders ({filteredOrders.length} records)
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Change status or payment directly in rows
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e1ebe4', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                <th style={{ padding: '12px 18px' }}>Order ID</th>
                <th style={{ padding: '12px 18px' }}>Customer Name</th>
                <th style={{ padding: '12px 18px' }}>Date</th>
                <th style={{ padding: '12px 18px' }}>Amount</th>
                <th style={{ padding: '12px 18px' }}>Payment Status</th>
                <th style={{ padding: '12px 18px' }}>Fulfillment Status</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f3', transition: 'background 0.12s' }}>
                  <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>
                    {row.id}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>
                    {row.customerName}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>
                    {row.date}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e293b' }}>
                    {formatCurrency(row.totalAmount)}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <button
                      onClick={() => updateOrderStatus(row.id, undefined, row.paymentStatus === 'Paid' ? 'Pending' : 'Paid')}
                      style={{
                        padding: '4px 9px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: row.paymentStatus === 'Paid' ? '#ecfdf5' : '#fffbeb',
                        color: row.paymentStatus === 'Paid' ? '#059669' : '#d97706',
                      }}
                      title="Click to toggle Paid/Pending"
                    >
                      {row.paymentStatus}
                    </button>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <select
                      value={row.fulfillmentStatus}
                      onChange={(e) => updateOrderStatus(row.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: '1px solid #d1ded5',
                        background: row.fulfillmentStatus === 'Delivered' ? '#ecfdf5' : row.fulfillmentStatus === 'Ready for Dispatch' ? '#eff6ff' : '#f8faf9',
                        color: row.fulfillmentStatus === 'Delivered' ? '#059669' : row.fulfillmentStatus === 'Ready for Dispatch' ? '#2563eb' : '#334155',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="In Production">In Production</option>
                      <option value="Ready for Dispatch">Ready for Dispatch</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        if (window.confirm(`Cancel order ${row.id}?`)) {
                          deleteSalesOrder(row.id);
                        }
                      }}
                      title="Cancel order"
                      style={{ border: '1px solid #fecaca', background: '#ffffff', color: '#dc2626', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                    <ShoppingCart size={32} color="#cbd5e1" style={{ marginBottom: 8 }} />
                    <div>No sales orders found matching current filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sales Order Modal */}
      <AnimatePresence>
        {showOrderModal && (
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
                maxWidth: '600px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Create New Sales Order
                </h3>
                <button onClick={() => setShowOrderModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                    Customer Account *
                  </label>
                  <select
                    required
                    value={orderCustomer}
                    onChange={(e) => setOrderCustomer(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none', background: '#fff' }}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.tier}) - {c.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ borderTop: '1px solid #eef3f0', paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: '#17241d' }}>
                      Order Line Items (from Real Inventory)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      style={{ border: 'none', background: '#eff6ff', color: '#2563eb', fontSize: '12px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      + Add Another Item
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {orderItems.map((line, index) => {
                      const selectedProd = inventory.find(i => i.id === line.productId);
                      const stockAvailable = selectedProd ? selectedProd.stock : 0;
                      const hasStockWarning = line.quantity > stockAvailable;

                      return (
                        <div key={index} style={{ padding: '10px 12px', borderRadius: '8px', background: '#fafcfb', border: '1px solid #e1ebe4' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                            <div>
                              <select
                                value={line.productId}
                                onChange={(e) => handleItemProductChange(index, e.target.value)}
                                style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #d1ded5', fontSize: '12px', outline: 'none', background: '#fff' }}
                              >
                                {inventory.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (In Stock: {p.stock} {p.unit})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <input
                                type="number"
                                min="1"
                                value={line.quantity}
                                onChange={(e) => handleItemQtyChange(index, e.target.value)}
                                placeholder="Qty"
                                style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #d1ded5', fontSize: '12px', outline: 'none' }}
                              />
                            </div>

                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                              {formatCurrency(line.quantity * line.unitPrice)}
                            </div>

                            <div>
                              <button
                                type="button"
                                disabled={orderItems.length === 1}
                                onClick={() => handleRemoveLineItem(index)}
                                style={{ border: 'none', background: 'transparent', color: orderItems.length === 1 ? '#cbd5e1' : '#dc2626', cursor: orderItems.length === 1 ? 'not-allowed' : 'pointer' }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>

                          {hasStockWarning && (
                            <div style={{ fontSize: '11px', color: '#b45309', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <AlertCircle size={12} /> Ordered qty ({line.quantity}) exceeds available stock ({stockAvailable}).
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Payment Status
                    </label>
                    <select
                      value={orderPayment}
                      onChange={(e) => setOrderPayment(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none', background: '#fff' }}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                      Initial Fulfillment
                    </label>
                    <select
                      value={orderFulfillment}
                      onChange={(e) => setOrderFulfillment(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1ded5', fontSize: '13px', outline: 'none', background: '#fff' }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="In Production">In Production</option>
                      <option value="Ready for Dispatch">Ready for Dispatch</option>
                    </select>
                  </div>
                </div>

                {/* Total Preview */}
                <div style={{ background: '#f8faf9', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Total Order Value:</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>{formatCurrency(calculatedTotal)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #d1ded5', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Confirm & Submit Order
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
