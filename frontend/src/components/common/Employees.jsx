import React, { useState } from "react";
import { useErp } from "../../context/ErpContext";
import { usersApi } from "../../lib/api";
import { User, Shield, Briefcase, Mail, Phone, Search, Power } from "lucide-react";

export default function Employees() {
  const { employees = [], refreshData } = useErp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = (employees || []).filter((emp) => {
    const q = searchTerm.toLowerCase();
    const name = (emp.employeeName || emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`).toLowerCase();
    const id = (emp.employeeId || "").toLowerCase();
    const dept = (emp.department || "").toLowerCase();
    const roleName = (typeof emp.role === 'object' && emp.role ? emp.role.name : (emp.role || "")).toLowerCase();
    return name.includes(q) || id.includes(q) || dept.includes(q) || roleName.includes(q);
  });

  const toggleStatus = async (emp) => {
    try {
      const isCurrentlyActive = emp.status === "Active" || emp.status === "ACTIVE";
      const nextStatus = isCurrentlyActive ? "INACTIVE" : "ACTIVE";
      await usersApi.update(emp.id || emp._id, { status: nextStatus });
      if (refreshData) await refreshData(true);
    } catch (err) {
      alert(`Error updating employee status: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      
      {/* ── Page Header ──────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Team Directory & Access Roles
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '3px 0 0' }}>
            Enterprise staff accounts, role designations, assigned departments, and system privileges.
          </p>
        </div>
      </div>

      {/* ── Search Toolbar ───────────────────────────────────── */}
      <div className="erp-card" style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
          {filteredEmployees.length} Team Members Configured
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#ffffff', padding: '5px 10px',
          borderRadius: 6, border: '1px solid #cbd5e1', width: 280
        }}>
          <Search size={14} color="#64748b" />
          <input
            type="text"
            placeholder="Search by name, employee ID, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 12.5, color: '#0f172a', width: '100%'
            }}
          />
        </div>
      </div>

      {/* ── Employee Table ───────────────────────────────────── */}
      <div className="erp-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="erp-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '110px' }}>Staff ID</th>
                <th style={{ textAlign: 'left' }}>Full Name</th>
                <th style={{ textAlign: 'left' }}>Department</th>
                <th style={{ textAlign: 'left' }}>Assigned Role</th>
                <th style={{ textAlign: 'left' }}>Status</th>
                <th style={{ textAlign: 'right', width: '110px' }}>Account Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No team members found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const roleTitle = typeof emp.role === 'object' && emp.role ? emp.role.name : (emp.role || 'Staff');
                  const isActive = emp.status === 'Active' || emp.status === 'ACTIVE';

                  return (
                    <tr key={emp.id || emp._id}>
                      <td>
                        <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>
                          {emp.employeeId || 'EMP-01'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {emp.employeeName || emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748b' }}>{emp.email || 'staff@shivfurniture.in'}</div>
                      </td>
                      <td style={{ color: '#475569', fontSize: 12.5 }}>
                        {emp.department || 'Operations'}
                      </td>
                      <td>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                          background: '#eff6ff', color: '#2563eb'
                        }}>
                          {roleTitle}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                          background: isActive ? '#ecfdf5' : '#fef2f2',
                          color: isActive ? '#059669' : '#dc2626'
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => toggleStatus(emp)}
                          style={{
                            border: '1px solid #cbd5e1', background: '#ffffff',
                            borderRadius: 4, padding: '4px 8px', fontSize: 11.5,
                            fontWeight: 600, cursor: 'pointer',
                            color: isActive ? '#dc2626' : '#16a34a'
                          }}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
