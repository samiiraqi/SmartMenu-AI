import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';
import ChatWidget from './components/Chatbot/ChatWidget';
import Dashboard from './pages/Dashboard';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import QRCodeGenerator from './pages/QRCode/QRCodeGenerator';
import AIMenuChatbot from './pages/Customer/AIMenuChatbot';

function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Customer - AI Chatbot with Multi-language */}
            <Route path="/order" element={<AIMenuChatbot />} />
            
            {/* Admin routes */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/qr-codes" element={<QRCodeGenerator />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
                <ChatWidget />
              </Layout>
            } />
          </Routes>
          <Toaster position="top-right" />
        </Router>
      </LanguageProvider>
    </SettingsProvider>
  );
}

export default App;
