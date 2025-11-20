import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  ChartBarIcon,
  QrCodeIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  PaintBrushIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
  { name: 'Menu', href: '/admin/menu', icon: ClipboardDocumentListIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
  { name: 'QR Codes', href: '/admin/qr-codes', icon: QrCodeIcon },
  { name: 'Themes', href: '/admin/themes', icon: PaintBrushIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-purple-600 to-indigo-600">
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>🍽️</span>
            <span>SmartMenu AI</span>
          </h1>
          <button className="lg:hidden text-white" onClick={() => setSidebarOpen(false)}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 mb-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-3 right-3">
          <button
            onClick={() => navigate('/menu?table=1')}
            className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
            Customer View
          </button>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <Bars3Icon className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Admin Panel</span>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
