import { Navigate, useLocation } from "react-router-dom";
import { useErp } from "../../context/ErpContext";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useErp();
  const location = useLocation();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#e8eee9]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#405b4d] border-t-transparent" />
          <span className="text-xs font-semibold text-[#405b4d]">Verifying authentication session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
