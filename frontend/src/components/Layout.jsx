import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Users, ShoppingCart, LogOut, LayoutDashboard, Settings, Factory } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="flex h-screen bg-white text-zinc-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white">
              ERP
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: '#17241d' }}>
              Mini-ERP
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path) ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'}`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-zinc-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-zinc-50">
        <div className="p-8 max-w-7xl mx-auto h-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
