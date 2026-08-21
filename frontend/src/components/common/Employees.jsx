import React, { useState } from "react";
import { useErp } from "../../context/ErpContext";
import { User, Shield, Briefcase, Mail, Phone, Calendar, Power } from "lucide-react";
import { TextShuffle } from "../common/AnimatedText";

export default function Employees() {
  const { employees, setEmployees } = useErp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter((emp) =>
    emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (employeeId) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.employeeId === employeeId
          ? { ...emp, status: emp.status === "Active" ? "Inactive" : "Active" }
          : emp
      )
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            <TextShuffle text="Employee Master" duration={600} />
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage company employees, departments, and roles.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role & Dept</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{emp.employeeName}</p>
                        <p className="text-xs text-slate-500">{emp.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {emp.email}</span>
                      <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {emp.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                        <Shield size={12} /> {emp.role}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Briefcase size={12} /> {emp.department}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        emp.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}>
                        {emp.status}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Account: {emp.accountCreated ? (
                          <span className="font-semibold text-emerald-600">Created</span>
                        ) : (
                          <span className="text-slate-400">Pending Setup</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleStatus(emp.employeeId)}
                      className={`inline-flex items-center justify-center rounded-lg p-2 transition ${
                        emp.status === "Active"
                          ? "bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600"
                          : "bg-red-50 text-red-600 hover:bg-emerald-100 hover:text-emerald-600"
                      }`}
                      title={emp.status === "Active" ? "Deactivate Employee" : "Activate Employee"}
                    >
                      <Power size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No employees found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
