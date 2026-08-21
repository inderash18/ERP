import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useErp } from "../../context/ErpContext";

export default function AccessDenied() {
  const { authUser, user } = useErp();
  const currentRole = authUser?.role || user?.role || "Unknown Role";

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="flex w-full max-w-md flex-col items-center rounded-[24px] bg-white p-8 text-center shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <ShieldAlert size={40} />
        </div>
        
        <h1 className="mb-3 text-2xl font-bold text-gray-900">Access Restricted</h1>
        
        <p className="mb-6 text-sm text-gray-500">
          You don't have permission to access this module.
        </p>

        <div className="mb-8 w-full rounded-xl bg-gray-50 p-4 border border-gray-100">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Your Current Role</p>
          <p className="text-base font-semibold text-gray-800">{currentRole}</p>
        </div>

        <p className="mb-8 text-xs text-gray-400">
          Contact your administrator if you need access.
        </p>

        <Link
          to="/layout"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-700 font-medium text-white transition hover:bg-emerald-800 focus:ring-4 focus:ring-emerald-700/20"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
