import { Outlet } from 'react-router-dom';

export default function RouteTransition({ children }) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {children || <Outlet />}
    </div>
  );
}
