import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    restaurantName: 'SmartMenu Restaurant',
    currency: 'USD',
    currencySymbol: '$',
    taxRate: 10,
    openTime: '09:00',
    closeTime: '22:00',
  });

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    ILS: '₪',
  };

  const updateSettings = (newSettings) => {
    const updated = {
      ...settings,
      ...newSettings,
      currencySymbol: currencySymbols[newSettings.currency] || currencySymbols[settings.currency],
    };
    setSettings(updated);
    localStorage.setItem('restaurantSettings', JSON.stringify(updated));
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('restaurantSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings({
        ...parsed,
        currencySymbol: currencySymbols[parsed.currency] || '$',
      });
    }
  }, []);

  const formatCurrency = (amount) => {
    return `${settings.currencySymbol}${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, formatCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
};
