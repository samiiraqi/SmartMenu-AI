import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import Dashboard from './pages/Admin/Dashboard';
import MenuManagement from './pages/Admin/MenuManagement';
import Orders from './pages/Admin/Orders';
import Analytics from './pages/Admin/Analytics';
import QRCodeGenerator from './pages/Admin/QRCodeGenerator';
import Settings from './pages/Admin/Settings';
import ThemeSettings from './pages/Admin/ThemeSettings';

// Customer Pages
import AIMenuChatbot from './pages/Customer/AIMenuChatbot';

function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <ThemeProvider>
          <Router>
            <div className="App">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: { background: '#333', color: '#fff' },
                }}
              />
              <Routes>
                <Route path="/menu" element={<AIMenuChatbot />} />
                
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="menu" element={<MenuManagement />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="qr-codes" element={<QRCodeGenerator />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="themes" element={<ThemeSettings />} />
                </Route>
                
                <Route path="/" element={<Navigate to="/menu?table=1" replace />} />
                <Route path="*" element={<Navigate to="/menu?table=1" replace />} />
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}

export default App;
