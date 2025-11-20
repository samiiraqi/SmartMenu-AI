import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { PaintBrushIcon, CheckCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ThemeSettings() {
  const { theme, currentTheme, changeTheme, presetThemes } = useTheme();

  const handleThemeSelect = (themeName) => {
    changeTheme(themeName);
    toast.success(`Theme: ${presetThemes[themeName].name}!`, { icon: presetThemes[themeName].logo });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <PaintBrushIcon className="w-8 h-8 text-purple-600" />
          <span>Theme Customization</span>
        </h1>
        <p className="text-gray-600 mt-1">Customize your restaurant's look</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <EyeIcon className="w-6 h-6 text-purple-600" />
          <span>Preview</span>
        </h2>
        
        <div className={`bg-gradient-to-br ${theme.primary} rounded-2xl p-8 relative overflow-hidden`}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }} />
            ))}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-4xl">{theme.logo}</span>
              <div>
                <h3 className={`text-2xl font-bold ${theme.text}`}>Your Restaurant</h3>
                <p className="text-white/70">Table 1 • AI Waiter</p>
              </div>
            </div>
            
            <div className={`${theme.card} backdrop-blur-md rounded-xl p-4 border-2 ${theme.border}/50 mb-4`}>
              <p className="text-white">👋 Welcome! How can I help you?</p>
            </div>
            
            <button className={`bg-gradient-to-r ${theme.button} text-white px-6 py-3 rounded-xl font-bold shadow-lg`}>
              View Menu
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Choose Theme</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(presetThemes).map(([key, themeOption]) => (
            <button
              key={key}
              onClick={() => handleThemeSelect(key)}
              className={`relative rounded-2xl overflow-hidden transition-all transform hover:scale-105 ${
                currentTheme === key ? 'ring-4 ring-purple-500 ring-offset-2' : ''
              }`}
            >
              <div className={`bg-gradient-to-br ${themeOption.primary} p-6 h-32`}>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">{themeOption.logo}</span>
                  <span className={`font-bold ${themeOption.text} text-sm`}>{themeOption.name}</span>
                </div>
                <div className={`h-2 rounded-full bg-gradient-to-r ${themeOption.accent} w-3/4`}></div>
              </div>
              
              {currentTheme === key && (
                <div className="absolute top-2 right-2 bg-purple-500 rounded-full p-1">
                  <CheckCircleIcon className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
