import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

// Preset themes for restaurants
const presetThemes = {
  default: {
    name: 'Cosmic Purple',
    primary: 'from-indigo-900 via-purple-900 to-pink-900',
    accent: 'from-cyan-500 to-blue-500',
    button: 'from-cyan-500 to-blue-500',
    card: 'bg-white/10',
    border: 'border-cyan-400',
    text: 'text-cyan-300',
    logo: '🤖',
  },
  elegant: {
    name: 'Elegant Gold',
    primary: 'from-gray-900 via-gray-800 to-black',
    accent: 'from-yellow-500 to-amber-500',
    button: 'from-yellow-500 to-amber-500',
    card: 'bg-white/5',
    border: 'border-yellow-400',
    text: 'text-yellow-300',
    logo: '👑',
  },
  nature: {
    name: 'Fresh Garden',
    primary: 'from-green-900 via-emerald-900 to-teal-900',
    accent: 'from-green-500 to-emerald-500',
    button: 'from-green-500 to-emerald-500',
    card: 'bg-white/10',
    border: 'border-green-400',
    text: 'text-green-300',
    logo: '🌿',
  },
  ocean: {
    name: 'Ocean Blue',
    primary: 'from-blue-900 via-cyan-900 to-teal-900',
    accent: 'from-blue-500 to-cyan-500',
    button: 'from-blue-500 to-cyan-500',
    card: 'bg-white/10',
    border: 'border-blue-400',
    text: 'text-blue-300',
    logo: '🌊',
  },
  fire: {
    name: 'Hot & Spicy',
    primary: 'from-red-900 via-orange-900 to-yellow-900',
    accent: 'from-red-500 to-orange-500',
    button: 'from-red-500 to-orange-500',
    card: 'bg-white/10',
    border: 'border-orange-400',
    text: 'text-orange-300',
    logo: '🔥',
  },
  midnight: {
    name: 'Midnight Luxe',
    primary: 'from-slate-900 via-zinc-900 to-neutral-900',
    accent: 'from-violet-500 to-purple-500',
    button: 'from-violet-500 to-purple-500',
    card: 'bg-white/5',
    border: 'border-violet-400',
    text: 'text-violet-300',
    logo: '✨',
  },
  sunset: {
    name: 'Sunset Vibes',
    primary: 'from-orange-900 via-pink-900 to-purple-900',
    accent: 'from-orange-500 to-pink-500',
    button: 'from-orange-500 to-pink-500',
    card: 'bg-white/10',
    border: 'border-pink-400',
    text: 'text-pink-300',
    logo: '🌅',
  },
  coffee: {
    name: 'Coffee House',
    primary: 'from-amber-900 via-yellow-900 to-orange-900',
    accent: 'from-amber-600 to-yellow-600',
    button: 'from-amber-600 to-yellow-600',
    card: 'bg-white/10',
    border: 'border-amber-400',
    text: 'text-amber-300',
    logo: '☕',
  },
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [customTheme, setCustomTheme] = useState(null);
  const [restaurantLogo, setRestaurantLogo] = useState(null);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('restaurantTheme');
    const savedLogo = localStorage.getItem('restaurantLogo');
    
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
    if (savedLogo) {
      setRestaurantLogo(savedLogo);
    }
  }, []);

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('restaurantTheme', themeName);
  };

  const setLogo = (logoUrl) => {
    setRestaurantLogo(logoUrl);
    localStorage.setItem('restaurantLogo', logoUrl);
  };

  const theme = customTheme || presetThemes[currentTheme] || presetThemes.default;

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      currentTheme, 
      changeTheme, 
      presetThemes,
      restaurantLogo,
      setLogo
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
