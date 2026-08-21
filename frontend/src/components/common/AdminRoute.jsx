import { Navigate, useLocation } from "react-router-dom";
import { useErp } from "../../context/ErpContext";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isAuthLoading } = useErp();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#e8eee9]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#7c3aed] border-t-transparent" />
          <span className="text-xs font-semibold text-[#7c3aed]">Verifying administrator privileges...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xl">
          ⛔
        </div>
        <h3 className="text-lg font-bold text-red-900">Access Denied</h3>
        <p className="mt-1 max-w-md text-sm text-red-700">
          This section is restricted to System Administrators. Your current account does not have administrator privileges.
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
}
