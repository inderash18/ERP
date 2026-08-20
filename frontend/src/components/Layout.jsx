import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingCart, LogOut, LayoutDashboard, Settings, Factory } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/layout', icon: LayoutDashboard },
    { name: 'Inventory', path: '/layout/inventory', icon: Package },
    { name: 'Sales', path: '/layout/sales', icon: ShoppingCart },
    { name: 'Production', path: '/layout/production', icon: Factory },
    { name: 'Customers', path: '/layout/customers', icon: Users },
    { name: 'Settings', path: '/layout/settings', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/layout') return location.pathname === '/layout' || location.pathname === '/layout/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#e8eee9' }}>
      {/* Sidebar */}
      <aside
        className="w-60 flex flex-col"
        style={{
          background: '#fff',
          borderRight: '1px solid #d4ddd6',
          boxShadow: '2px 0 16px rgba(30,50,40,0.06)',
        }}
      >
        {/* Logo */}
        <div className="px-6 pt-7 pb-6" style={{ borderBottom: '1px solid #e8eee9' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: '#405b4d', letterSpacing: '-0.5px' }}
            >
              ERP
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#17241d' }}>
              Mini-ERP
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  color: active ? '#405b4d' : '#6b7c71',
                  background: active ? '#e8eee9' : 'transparent',
                  fontWeight: active ? 600 : 500,
                }}
              >
                <item.icon size={17} />
                <span>{item.name}</span>
                {active && (
                  <div
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: '#405b4d' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid #e8eee9' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium transition-all duration-150"
            style={{ color: '#8b948e' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#c0392b'; e.currentTarget.style.background = '#fdf0ee'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8b948e'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#e8eee9' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 1.015, y: 12 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.985, y: -12 }}
            transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
