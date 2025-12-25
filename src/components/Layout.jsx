import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import logo1 from '../assets/logo1.jpeg';
import {
  LayoutDashboard,
  Users,
  Package,
  UserCircle,
  Building2,
  Truck,
  ShoppingCart,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/salesmen', icon: Users, label: 'Salesmen' },
    { path: '/items', icon: Package, label: 'Items' },
    { path: '/customers', icon: UserCircle, label: 'Customers' },
    { path: '/vendors', icon: Building2, label: 'Vendors' },
    { path: '/cargo', icon: Truck, label: 'Cargo' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur border-r border-slate-200/70 shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo header with mobile close button */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-slate-200/70">
          <div className="flex-1 flex justify-center">
            <img 
              src={logo1} 
              alt="SRF Logo" 
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-200/70 shadow-sm"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute right-4 srf-icon-btn text-slate-600 hover:text-slate-900"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 ease-in-out ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                    isActive ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info and logout at bottom */}
        <div className="border-t border-slate-200/70 bg-white/80 backdrop-blur">
          <div className="px-4 py-2.5 border-b border-slate-200/50">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
          <div className="p-3">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="group flex items-center gap-2.5 w-full px-3 py-2 rounded-xl transition-all duration-200 ease-in-out text-rose-700 hover:bg-rose-50/60"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700 group-hover:bg-rose-200/50 transition-colors">
                <LogOut className="w-4 h-4" />
              </span>
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile menu button - only visible on mobile */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 srf-icon-btn bg-white shadow-md text-slate-600 hover:text-slate-900"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-5 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Logout confirmation modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        type="warning"
      />
    </div>
  );
};

export default Layout;

