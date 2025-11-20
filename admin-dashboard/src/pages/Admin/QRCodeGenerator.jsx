import React, { useState } from 'react';
import { QrCodeIcon } from '@heroicons/react/24/outline';
import { QRCodeSVG as QRCode } from 'qrcode.react';

export default function QRCodeGenerator() {
  const [tableCount, setTableCount] = useState(10);
  const [restaurantName, setRestaurantName] = useState('My-Restaurant');
  const baseUrl = window.location.origin;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <QrCodeIcon className="w-8 h-8 text-purple-600" />
        <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value.replace(/\s+/g, '-'))}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Tables</label>
            <input
              type="number"
              value={tableCount}
              onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
              min="1"
              max="100"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(tableCount)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
              <QRCode 
                value={`${baseUrl}/menu?table=${i + 1}&restaurant=${restaurantName}`}
                size={120}
                className="mx-auto mb-2"
              />
              <p className="font-bold text-gray-800">Table {i + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
