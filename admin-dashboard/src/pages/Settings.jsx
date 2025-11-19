import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { BuildingStorefrontIcon, ClockIcon, CurrencyDollarIcon, BellIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Settings() {
  const { settings: globalSettings, updateSettings } = useSettings();
  
  const [localSettings, setLocalSettings] = useState({
    restaurantName: 'SmartMenu Restaurant',
    address: '123 Main Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@smartmenu.com',
    currency: 'USD',
    taxRate: '10',
    openTime: '09:00',
    closeTime: '22:00',
    tablesCount: '20',
    enableNotifications: true,
    enableOnlineOrdering: true,
    autoConfirmOrders: false,
  });

  useEffect(() => {
    setLocalSettings(prev => ({
      ...prev,
      ...globalSettings,
      taxRate: globalSettings.taxRate?.toString() || '10',
    }));
  }, [globalSettings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    updateSettings({
      restaurantName: localSettings.restaurantName,
      currency: localSettings.currency,
      taxRate: parseFloat(localSettings.taxRate),
      openTime: localSettings.openTime,
      closeTime: localSettings.closeTime,
    });
    
    toast.success('Settings saved successfully! Currency updated throughout the app.');
  };

  const handleChange = (field, value) => {
    setLocalSettings({ ...localSettings, [field]: value });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Restaurant Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Restaurant Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BuildingStorefrontIcon className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Restaurant Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
              <input
                type="text"
                value={localSettings.restaurantName}
                onChange={(e) => handleChange('restaurantName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={localSettings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={localSettings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={localSettings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tables</label>
              <input
                type="number"
                value={localSettings.tablesCount}
                onChange={(e) => handleChange('tablesCount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ClockIcon className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Operating Hours</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
              <input
                type="time"
                value={localSettings.openTime}
                onChange={(e) => handleChange('openTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
              <input
                type="time"
                value={localSettings.closeTime}
                onChange={(e) => handleChange('closeTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Payment & Pricing */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <CurrencyDollarIcon className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Payment & Pricing</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={localSettings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="USD">USD - US Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="ILS">ILS - Israeli Shekel (₪)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={localSettings.taxRate}
                onChange={(e) => handleChange('taxRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Features & Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BellIcon className="w-6 h-6 text-primary-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Features & Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Enable Notifications</h3>
                <p className="text-sm text-gray-500">Receive alerts for new orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.enableNotifications}
                  onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Enable Online Ordering</h3>
                <p className="text-sm text-gray-500">Allow customers to order via chatbot</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.enableOnlineOrdering}
                  onChange={(e) => handleChange('enableOnlineOrdering', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Auto-Confirm Orders</h3>
                <p className="text-sm text-gray-500">Automatically confirm new orders</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoConfirmOrders}
                  onChange={(e) => handleChange('autoConfirmOrders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
