import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useErp } from '../../context/ErpContext';
import AccessDenied from './AccessDenied';

export default function RoleRoute({ permission, children }) {
  const { authUser, user, hasPermission, isAuthLoading } = useErp();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const authenticated = Boolean(authUser?.token || user?.token);
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    return <AccessDenied />;
  }

  return children ? children : <Outlet />;
}
