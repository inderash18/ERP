import { useState, useMemo } from 'react';
import {
  Users, Key, List, LayoutGrid, Plus, Search, Check, X,
  Edit2, Trash2, Shield, ArrowLeft, Save, RotateCcw,
  Sparkles, CheckSquare, Square, UserCheck, Phone, Mail, MapPin, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useErp } from '../../context/ErpContext';
import { TextShuffle } from './AnimatedText';

const MODULE_TABS = ['Sales', 'Purchase', 'Manufacturing', 'Product'];

export default function UserManagement() {
  const {
    managedUsers,
    addManagedUser,
    updateManagedUser,
    deleteManagedUser,
    roleMatrix,
    updateRoleMatrixItem,
    updateUserPermissions,
    user: currentUser
  } = useErp();

  const [activeView, setActiveView] = useState('list'); // 'list' | 'form' | 'matrix'
  const [selectedUserId, setSelectedUserId] = useState(managedUsers[0]?.id || 'USR-001');
  const [activeModuleTab, setActiveModuleTab] = useState('Product');
  const [search, setSearch] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [themeMode, setThemeMode] = useState('dark'); // 'dark' (chalkboard matching wireframes) | 'light'

  // Selected User
  const selectedUser = useMemo(() => {
    return managedUsers.find(u => u.id === selectedUserId) || managedUsers[0];
  }, [managedUsers, selectedUserId]);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    address: 'Mumbai, Maharashtra',
    phone: '+91 98000 00000',
    email: '',
    position: 'Sales Representative',
    role: 'User'
  });

  // Filtered Users for List View
  const filteredUsers = useMemo(() => {
    return managedUsers.filter(u => {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) ||
             (u.position && u.position.toLowerCase().includes(q)) ||
             u.email.toLowerCase().includes(q);
    });
  }, [managedUsers, search]);

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id);
    setActiveView('form');
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUserForm.name.trim()) return;

    const created = addManagedUser(newUserForm);
    setShowAddUserModal(false);
    setSelectedUserId(created.id);
    setActiveView('form');
  };

  // Helper for permission lookup in user form
  const getPermissionValue = (moduleKey, fieldName, permType) => {
    const mKey = moduleKey.toLowerCase();
    const userPerms = selectedUser?.permissions?.[mKey]?.[fieldName];
    if (userPerms && userPerms[permType] !== undefined) {
      return userPerms[permType];
    }
    // Defaults matching wireframe specifications
    if (fieldName === 'On Hand Qty' && permType === 'delete') return false;
    if (fieldName === 'Free To Use Qty') {
      if (permType === 'view') return 'System Computed';
      if (permType === 'edit' || permType === 'delete') return false;
    }
    if ((fieldName === 'Procure On Demand' || fieldName === 'Procurement Method') && permType === 'create') return 'Not possible';
    if (fieldName === 'Creation Date') {
      if (permType === 'create') return 'Auto Compute';
      if (permType === 'edit' || permType === 'delete') return false;
    }
    if (fieldName === 'Total' && permType === 'edit') return 'Auto Recomputed';
    if (fieldName === 'Order Approval' && (permType === 'create' || permType === 'edit' || permType === 'delete')) return false;

    return true;
  };

  const handleTogglePermission = (moduleKey, fieldName, permType) => {
    const current = getPermissionValue(moduleKey, fieldName, permType);
    if (typeof current === 'boolean') {
      updateUserPermissions(selectedUser.id, moduleKey.toLowerCase(), fieldName, permType, !current);
    }
  };

  // Module Fields Definition
  const MODULE_FIELDS = {
    Product: [
      { name: "Product", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Sales Price", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Cost Price", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "On Hand Qty", allowCreate: true, allowView: true, allowEdit: true, allowDelete: false },
      { name: "Free To Use Qty", allowCreate: true, allowView: "System Computed", allowEdit: false, allowDelete: false },
      { name: "Procure On Demand", allowCreate: "Not possible", allowView: true, allowEdit: true, allowDelete: true },
      { name: "Procurement Method", allowCreate: "Not possible", allowView: true, allowEdit: true, allowDelete: true },
      { name: "Vendor", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Bill of Materials (BoM)", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
    ],
    Manufacturing: [
      { name: "Product to Manufacture", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Product Quantity", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "BoM", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Responsible Person", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Finished Quantity", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Creation Date", allowCreate: "Auto Compute", allowView: true, allowEdit: false, allowDelete: false },
    ],
    Purchase: [
      { name: "Vendor", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Vendor Address", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Responsible Person", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Product", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Ordered Quantity", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Received Quantity", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Cost Price", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Total", allowCreate: true, allowView: true, allowEdit: "Auto Recomputed", allowDelete: true },
      { name: "Creation Date", allowCreate: "Auto Compute", allowView: true, allowEdit: false, allowDelete: false },
    ],
    Sales: [
      { name: "Customer", allowCreate: true, allowView: true, allowEdit: true, allowDelete: false },
      { name: "Order Number", allowCreate: "Auto Compute", allowView: true, allowEdit: false, allowDelete: false },
      { name: "Delivery Address", allowCreate: true, allowView: true, allowEdit: true, allowDelete: false },
      { name: "Line Items & Quantities", allowCreate: true, allowView: true, allowEdit: true, allowDelete: true },
      { name: "Unit Price", allowCreate: true, allowView: true, allowEdit: true, allowDelete: false },
      { name: "Total Amount", allowCreate: true, allowView: true, allowEdit: "Auto Recomputed", allowDelete: false },
      { name: "Payment Status", allowCreate: true, allowView: true, allowEdit: true, allowDelete: false },
      { name: "Fulfillment Status", allowCreate: true, allowView: true, allowEdit: true, allowDelete: false },
      { name: "Order Approval", allowCreate: false, allowView: true, allowEdit: false, allowDelete: false },
    ]
  };

  const isDark = themeMode === 'dark';

  const containerStyle = isDark ? {
    background: '#0d1117',
    color: '#e6edf3',
    borderRadius: '20px',
    border: '1px solid #30363d',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    fontFamily: '"Architects Daughter", "Inter", monospace, sans-serif'
  } : {
    background: '#ffffff',
    color: '#0f172a',
    borderRadius: '18px',
    border: '1px solid #d4ddd6',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={26} color="#7c3aed" />
            <TextShuffle text="User Management & RBAC Dashboard" duration={700} />
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
            System administrator controls, field-level CRUD security matrix, and operator permissions.
          </p>
        </div>

        {/* View Switchers & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#ffffff', padding: '4px', borderRadius: '10px', border: '1px solid #d1ded5' }}>
            <button
              onClick={() => setActiveView('list')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                background: activeView === 'list' ? '#7c3aed' : 'transparent',
                color: activeView === 'list' ? '#ffffff' : '#64748b'
              }}
              title="System Administrator Dashboard User List"
            >
              <List size={15} /> Users List
            </button>

            <button
              onClick={() => setActiveView('form')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                background: activeView === 'form' ? '#7c3aed' : 'transparent',
                color: activeView === 'form' ? '#ffffff' : '#64748b'
              }}
              title="Field-Level Permissions Form View"
            >
              <Edit2 size={15} /> User Form View
            </button>

            <button
              onClick={() => setActiveView('matrix')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                background: activeView === 'matrix' ? '#7c3aed' : 'transparent',
                color: activeView === 'matrix' ? '#ffffff' : '#64748b'
              }}
              title="Global Role Permissions Matrix"
            >
              <Key size={15} /> Role Rules Matrix
            </button>
          </div>

          <button
            onClick={() => setThemeMode(isDark ? 'light' : 'dark')}
            style={{
              padding: '7px 12px', borderRadius: '10px', border: '1px solid #d1ded5',
              background: '#ffffff', color: '#475569', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            {isDark ? "☀️ Light UI" : "🌙 Blueprint/Dark UI"}
          </button>

          <button
            onClick={() => setShowAddUserModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: '10px', background: '#2d5a45', border: 'none', color: '#ffffff',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(45,90,69,0.25)'
            }}
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SYSTEM ADMINISTRATOR DASHBOARD (USER LIST - Image 2)              */}
      {/* ========================================================================= */}
      {activeView === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...containerStyle, padding: '24px' }}
        >
          {/* Header in Dashboard */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isDark ? '1px solid #30363d' : '1px solid #e1ebe4', paddingBottom: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                padding: '6px 14px', borderRadius: '10px',
                border: isDark ? '1px dashed #8b949e' : '1px solid #d1ded5',
                fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em'
              }}>
                App Logo and Name (Mini-ERP Industrial)
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 6, border: isDark ? '1px solid #30363d' : '1px solid #d1ded5', padding: 4, borderRadius: 8 }}>
                <button onClick={() => setActiveView('matrix')} style={{ border: 'none', background: 'transparent', color: isDark ? '#8b949e' : '#64748b', cursor: 'pointer', padding: 4 }} title="Role Matrix">
                  <Key size={18} />
                </button>
                <button onClick={() => setActiveView('list')} style={{ border: 'none', background: isDark ? '#21262d' : '#f1f5f3', color: '#7c3aed', cursor: 'pointer', padding: 4, borderRadius: 4 }} title="User List">
                  <List size={18} />
                </button>
                <button onClick={() => setActiveView('form')} style={{ border: 'none', background: 'transparent', color: isDark ? '#8b949e' : '#64748b', cursor: 'pointer', padding: 4 }} title="Form View">
                  <LayoutGrid size={18} />
                </button>
              </div>

              {/* User Login Avatar */}
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: '#7c3aed', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 800, border: '2px solid #fff'
              }} title="User Login Avatar">
                {currentUser?.avatar || "TK"}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
              Users Directory ({filteredUsers.length})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: isDark ? '#161b22' : '#f8faf9', padding: '6px 12px', borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d1ded5' }}>
              <Search size={14} color="#8b949e" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user name..."
                style={{ border: 'none', background: 'transparent', outline: 'none', color: isDark ? '#c9d1d9' : '#0f172a', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* User List Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, border: isDark ? '1px solid #30363d' : '1px solid #e1ebe4', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{
              padding: '12px 18px',
              background: isDark ? '#161b22' : '#f8faf9',
              fontWeight: 700, fontSize: '13px',
              borderBottom: isDark ? '1px solid #30363d' : '1px solid #e1ebe4',
              display: 'flex', justifyContent: 'space-between'
            }}>
              <span>User Name & Title</span>
              <span>Actions & Permissions</span>
            </div>

            {filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => handleSelectUser(u)}
                style={{
                  padding: '14px 18px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: isDark ? '#0d1117' : '#ffffff',
                  borderBottom: isDark ? '1px solid #21262d' : '1px solid #f1f5f3',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = isDark ? '#161b22' : '#f8faf9'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isDark ? '#0d1117' : '#ffffff'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: u.role === 'Admin' ? '#7c3aed' : '#2d5a45',
                    color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700
                  }}>
                    {u.avatar || u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: isDark ? '#ffffff' : '#0f172a' }}>
                      {u.name}
                    </div>
                    <div style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>
                      {u.position || "Operator"} • {u.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                    background: u.role === 'Admin' ? '#f5f3ff' : '#ecfdf5',
                    color: u.role === 'Admin' ? '#7c3aed' : '#059669',
                    border: `1px solid ${u.role === 'Admin' ? '#ddd6fe' : '#a7f3d0'}`
                  }}>
                    {u.role}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectUser(u);
                    }}
                    style={{
                      padding: '5px 12px', borderRadius: '6px',
                      background: '#7c3aed', color: '#fff', border: 'none',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    Manage Permissions →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: USER MANAGEMENT FORM VIEW (Images 3, 4, 5)                       */}
      {/* ========================================================================= */}
      {activeView === 'form' && selectedUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...containerStyle, padding: '24px' }}
        >
          {/* Top Form Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <button
              onClick={() => setActiveView('list')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d1ded5',
                background: isDark ? '#21262d' : '#ffffff', color: isDark ? '#c9d1d9' : '#334155',
                fontSize: '12.5px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} /> Back to Users List
            </button>

            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, textAlign: 'center', letterSpacing: '0.05em' }}>
              User Management Form View
            </h2>

            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={{
                  padding: '6px 12px', borderRadius: '8px',
                  border: isDark ? '1px solid #30363d' : '1px solid #d1ded5',
                  background: isDark ? '#161b22' : '#ffffff',
                  color: isDark ? '#c9d1d9' : '#0f172a',
                  fontSize: '12.5px', outline: 'none'
                }}
              >
                {managedUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.position})</option>
                ))}
              </select>
            </div>
          </div>

          {/* User Details Header Card (Exact Replica of Wireframe Header) */}
          <div style={{
            border: isDark ? '1px solid #30363d' : '1px solid #d1ded5',
            borderRadius: '16px',
            padding: '20px',
            background: isDark ? '#161b22' : '#fafcfb',
            marginBottom: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 20
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px 24px', flex: 1 }}>
              <div>
                <span style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>Name :</span>
                <div style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a', marginTop: 2 }}>
                  {selectedUser.name}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>Address :</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#c9d1d9' : '#334155', marginTop: 2 }}>
                  {selectedUser.address || "Colaba, Mumbai, 400001"}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>Mobile Number :</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#c9d1d9' : '#334155', marginTop: 2 }}>
                  {selectedUser.phone || "+91 80000 00000"}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>Email ID :</span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: isDark ? '#c9d1d9' : '#334155', marginTop: 2 }}>
                  {selectedUser.email || "xyz@xyx.com"}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>Position :</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#7c3aed', marginTop: 2 }}>
                  {selectedUser.position || "Sales Manager"} ({selectedUser.role})
                </div>
              </div>
            </div>

            {/* Profile Avatar with Edit Pencil */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 74, height: 74, borderRadius: '16px',
                border: isDark ? '2px solid #8b949e' : '2px solid #cbd5e1',
                background: isDark ? '#21262d' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: 800, color: '#7c3aed'
              }}>
                {selectedUser.avatar || "MG"}
              </div>
              <div style={{
                position: 'absolute', bottom: -6, right: -6,
                width: 26, height: 26, borderRadius: '50%',
                background: '#ffffff', color: '#0f172a',
                border: '1px solid #d1ded5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
                <Edit2 size={13} />
              </div>
            </div>
          </div>

          {/* Module Navigation Tabs (Sales | Purchase | Manufacturing | Product) */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: isDark ? '1px solid #30363d' : '1px solid #e1ebe4', paddingBottom: 10 }}>
            {MODULE_TABS.map((tab) => {
              const isActive = activeModuleTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveModuleTab(tab)}
                  style={{
                    padding: '8px 22px',
                    borderRadius: '8px',
                    border: isActive
                      ? '1px solid #1d4ed8'
                      : isDark ? '1px solid #30363d' : '1px solid #d1ded5',
                    background: isActive ? '#1e3a8a' : isDark ? '#161b22' : '#ffffff',
                    color: isActive ? '#93c5fd' : isDark ? '#8b949e' : '#475569',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Field Level Permissions Matrix Table */}
          <div style={{
            border: isDark ? '1px solid #30363d' : '1px solid #d4ddd6',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  background: isDark ? '#161b22' : '#f8faf9',
                  borderBottom: isDark ? '1px solid #30363d' : '1px solid #d4ddd6',
                  color: isDark ? '#e6edf3' : '#0f172a',
                  fontWeight: 700
                }}>
                  <th style={{ padding: '14px 20px', width: '36%' }}>| Field</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '16%' }}>| Create</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '16%' }}>| View</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '16%' }}>| Edit</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '16%' }}>| Delete |</th>
                </tr>
              </thead>
              <tbody>
                {(MODULE_FIELDS[activeModuleTab] || []).map((row, idx) => {
                  const createVal = getPermissionValue(activeModuleTab, row.name, 'create');
                  const viewVal = getPermissionValue(activeModuleTab, row.name, 'view');
                  const editVal = getPermissionValue(activeModuleTab, row.name, 'edit');
                  const deleteVal = getPermissionValue(activeModuleTab, row.name, 'delete');

                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: isDark ? '1px solid #21262d' : '1px solid #f1f5f3',
                        background: idx % 2 === 0 ? (isDark ? '#0d1117' : '#ffffff') : (isDark ? '#11161d' : '#fafcfb')
                      }}
                    >
                      <td style={{ padding: '12px 20px', fontWeight: 600, color: isDark ? '#ffffff' : '#0f172a' }}>
                        | {row.name}
                      </td>

                      {/* CREATE */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {typeof createVal === 'string' ? (
                          <span style={{ fontSize: '11.5px', color: '#d97706', fontStyle: 'italic', fontWeight: 600 }}>
                            {createVal}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTogglePermission(activeModuleTab, row.name, 'create')}
                            style={{
                              border: 'none', background: 'transparent', cursor: 'pointer',
                              color: createVal ? '#10b981' : '#ef4444', fontSize: '15px'
                            }}
                          >
                            {createVal ? "✓" : "✗"}
                          </button>
                        )}
                      </td>

                      {/* VIEW */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {typeof viewVal === 'string' ? (
                          <span style={{ fontSize: '11.5px', color: '#3b82f6', fontWeight: 600 }}>
                            ✓ ({viewVal})
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTogglePermission(activeModuleTab, row.name, 'view')}
                            style={{
                              border: 'none', background: 'transparent', cursor: 'pointer',
                              color: viewVal ? '#10b981' : '#ef4444', fontSize: '15px'
                            }}
                          >
                            {viewVal ? "✓" : "✗"}
                          </button>
                        )}
                      </td>

                      {/* EDIT */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {typeof editVal === 'string' ? (
                          <span style={{ fontSize: '11.5px', color: '#a855f7', fontWeight: 600 }}>
                            ✓ ({editVal})
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTogglePermission(activeModuleTab, row.name, 'edit')}
                            style={{
                              border: 'none', background: 'transparent', cursor: 'pointer',
                              color: editVal ? '#10b981' : '#ef4444', fontSize: '15px'
                            }}
                          >
                            {editVal ? "✓" : "✗"}
                          </button>
                        )}
                      </td>

                      {/* DELETE */}
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {typeof deleteVal === 'string' ? (
                          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                            {deleteVal}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleTogglePermission(activeModuleTab, row.name, 'delete')}
                            style={{
                              border: 'none', background: 'transparent', cursor: 'pointer',
                              color: deleteVal ? '#10b981' : '#ef4444', fontSize: '15px'
                            }}
                          >
                            {deleteVal ? "✓" : "✗"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <span style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>
              * Click any checkmark ✓ or ✗ to toggle individual field-level permissions. Changes save automatically.
            </span>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  alert(`Permissions for ${selectedUser.name} synchronized with system policies.`);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px',
                  borderRadius: '10px', background: '#7c3aed', color: '#fff', border: 'none',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                <Save size={15} /> Save User Permissions
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: GLOBAL ROLE MANAGEMENT MATRIX (Image 1)                           */}
      {/* ========================================================================= */}
      {activeView === 'matrix' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ ...containerStyle, padding: '24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isDark ? '1px solid #30363d' : '1px solid #e1ebe4', paddingBottom: 14, marginBottom: 18 }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '0.05em' }}>
                User Management Role Policy Matrix
              </h2>
              <span style={{ fontSize: '12px', color: isDark ? '#8b949e' : '#64748b' }}>
                System-wide default action permissions across Admin, User, and None tiers
              </span>
            </div>

            <button
              onClick={() => setActiveView('list')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d1ded5',
                background: isDark ? '#21262d' : '#ffffff', color: isDark ? '#c9d1d9' : '#334155',
                fontSize: '12.5px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              <ArrowLeft size={14} /> Back to Users
            </button>
          </div>

          <div style={{
            border: isDark ? '1px solid #30363d' : '1px solid #d4ddd6',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{
                  background: isDark ? '#161b22' : '#f8faf9',
                  borderBottom: isDark ? '1px solid #30363d' : '1px solid #d4ddd6',
                  color: isDark ? '#e6edf3' : '#0f172a',
                  fontWeight: 700
                }}>
                  <th style={{ padding: '14px 20px', width: '22%' }}>| Module</th>
                  <th style={{ padding: '14px 20px', width: '28%' }}>| Action</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '16%' }}>| Admin</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '16%' }}>| User</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center', width: '18%' }}>| None |</th>
                </tr>
              </thead>
              <tbody>
                {roleMatrix.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: isDark ? '1px solid #21262d' : '1px solid #f1f5f3',
                      background: idx % 2 === 0 ? (isDark ? '#0d1117' : '#ffffff') : (isDark ? '#11161d' : '#fafcfb')
                    }}
                  >
                    <td style={{ padding: '12px 20px', fontWeight: 700, color: isDark ? '#ffffff' : '#0f172a' }}>
                      | {item.module}
                    </td>

                    <td style={{ padding: '12px 20px', color: isDark ? '#c9d1d9' : '#334155' }}>
                      | {item.action}
                    </td>

                    {/* ADMIN */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, borderRadius: 4,
                        background: '#059669', color: '#fff', fontSize: '13px', fontWeight: 800
                      }}>
                        ✓
                      </span>
                    </td>

                    {/* USER */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {item.user === true ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 22, height: 22, borderRadius: 4,
                          background: '#059669', color: '#fff', fontSize: '13px', fontWeight: 800
                        }}>
                          ✓
                        </span>
                      ) : item.user === false ? (
                        <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 800 }}>
                          ✗
                        </span>
                      ) : (
                        <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 700 }}>
                          {item.user}
                        </span>
                      )}
                    </td>

                    {/* NONE */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {item.none === false ? (
                        <span style={{ color: '#ef4444', fontSize: '16px', fontWeight: 800 }}>
                          ✗
                        </span>
                      ) : (
                        <span style={{ color: isDark ? '#8b949e' : '#64748b', fontSize: '12px', fontStyle: 'italic' }}>
                          {item.none}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Add New User Modal */}
      <AnimatePresence>
        {showAddUserModal && (
          <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: 20
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              style={{
                background: isDark ? '#161b22' : '#ffffff',
                color: isDark ? '#c9d1d9' : '#0f172a',
                borderRadius: '16px',
                padding: '24px',
                width: '100%',
                maxWidth: '480px',
                border: isDark ? '1px solid #30363d' : '1px solid #d1ded5',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: isDark ? '#ffffff' : '#0f172a' }}>
                  Register New System User
                </h3>
                <button onClick={() => setShowAddUserModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#8b949e' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#8b949e' : '#475569', display: 'block', marginBottom: 4 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    placeholder="e.g. Mahesh Gupta"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d1ded5', background: isDark ? '#0d1117' : '#fff', color: isDark ? '#fff' : '#0f172a', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#8b949e' : '#475569', display: 'block', marginBottom: 4 }}>
                      Position / Title
                    </label>
                    <input
                      type="text"
                      value={newUserForm.position}
                      onChange={(e) => setNewUserForm({ ...newUserForm, position: e.target.value })}
                      placeholder="e.g. Sales Manager"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d1ded5', background: isDark ? '#0d1117' : '#fff', color: isDark ? '#fff' : '#0f172a', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#8b949e' : '#475569', display: 'block', marginBottom: 4 }}>
                      System Role
                    </label>
                    <select
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d1ded5', background: isDark ? '#0d1117' : '#fff', color: isDark ? '#fff' : '#0f172a', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#8b949e' : '#475569', display: 'block', marginBottom: 4 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="e.g. mahesh@minierp.io"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d1ded5', background: isDark ? '#0d1117' : '#fff', color: isDark ? '#fff' : '#0f172a', fontSize: '13px', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#8b949e' : '#475569', display: 'block', marginBottom: 4 }}>
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={newUserForm.phone}
                      onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                      placeholder="+91 80000 00000"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d1ded5', background: isDark ? '#0d1117' : '#fff', color: isDark ? '#fff' : '#0f172a', fontSize: '13px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: isDark ? '#8b949e' : '#475569', display: 'block', marginBottom: 4 }}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={newUserForm.address}
                      onChange={(e) => setNewUserForm({ ...newUserForm, address: e.target.value })}
                      placeholder="Colaba, Mumbai"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid #30363d' : '1px solid #d1ded5', background: isDark ? '#0d1117' : '#fff', color: isDark ? '#fff' : '#0f172a', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #d1ded5', background: 'transparent', color: isDark ? '#c9d1d9' : '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#7c3aed', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Create User & Setup Permissions
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
