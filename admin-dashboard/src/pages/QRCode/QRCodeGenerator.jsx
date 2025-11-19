import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useSettings } from '../../context/SettingsContext';
import { ArrowDownTrayIcon, PrinterIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function QRCodeGenerator() {
  const { settings } = useSettings();
  const [selectedTable, setSelectedTable] = useState(1);
  const [tableCount, setTableCount] = useState(20);
  const [showAll, setShowAll] = useState(false);

  // Generate URL for table ordering - CUSTOMER CHAT PAGE
  const getTableURL = (tableNumber) => {
    // Use current origin (localhost:3001 in dev, your domain in production)
    const baseURL = window.location.origin;
    return `${baseURL}/order?table=${tableNumber}&restaurant=${settings.restaurantName.replace(/\s/g, '-')}`;
  };

  const downloadQR = (tableNumber) => {
    const svg = document.getElementById(`qr-${tableNumber}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 512, 512);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `table-${tableNumber}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success(`QR code for Table ${tableNumber} downloaded!`);
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const printQR = (tableNumber) => {
    const printWindow = window.open('', '', 'width=600,height=600');
    const qrHTML = `
      <html>
        <head>
          <title>Table ${tableNumber} QR Code</title>
          <style>
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-print {
              text-align: center;
              padding: 40px;
              border: 3px solid #000;
            }
            h1 { margin-bottom: 10px; font-size: 32px; }
            h2 { color: #dc2626; margin-bottom: 20px; font-size: 28px; }
            p { margin-top: 20px; font-size: 16px; color: #666; }
          </style>
        </head>
        <body>
          <div class="qr-print">
            <h1>${settings.restaurantName}</h1>
            <h2>Table ${tableNumber}</h2>
            ${document.getElementById(`qr-${tableNumber}`).outerHTML}
            <p><strong>Scan to Order!</strong></p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(qrHTML);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
    
    toast.success(`Printing QR code for Table ${tableNumber}`);
  };

  const copyURL = (tableNumber) => {
    navigator.clipboard.writeText(getTableURL(tableNumber));
    toast.success(`URL for Table ${tableNumber} copied!`);
  };

  const downloadAllQR = () => {
    toast.success('Downloading all QR codes...');
    for (let i = 1; i <= tableCount; i++) {
      setTimeout(() => downloadQR(i), i * 500);
    }
  };

  const QRCard = ({ tableNumber }) => (
    <div id={`qr-card-${tableNumber}`} className="bg-white rounded-lg shadow-lg p-6 text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{settings.restaurantName}</h3>
      <h4 className="text-xl font-semibold text-primary-600 mb-4">Table {tableNumber}</h4>
      
      <div className="flex justify-center mb-4">
        <QRCodeSVG 
          id={`qr-${tableNumber}`}
          value={getTableURL(tableNumber)} 
          size={256}
          level="H"
          includeMargin={true}
        />
      </div>
      
      <p className="text-sm text-gray-600 mb-4">📱 Scan to order with AI waiter</p>
      
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => downloadQR(tableNumber)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
          Download
        </button>
        
        <button
          onClick={() => printQR(tableNumber)}
          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <PrinterIcon className="w-4 h-4 mr-1" />
          Print
        </button>
        
        <button
          onClick={() => copyURL(tableNumber)}
          className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
          Copy
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
          <p className="text-gray-600 mt-2">Generate QR codes for AI-powered table ordering</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Tables</label>
            <input
              type="number"
              min="1"
              max="100"
              value={tableCount}
              onChange={(e) => setTableCount(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-24"
            />
          </div>
          
          <button
            onClick={downloadAllQR}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            Download All
          </button>
        </div>
      </div>

      {!showAll && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Preview</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Select Table:</label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {Array.from({ length: tableCount }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>Table {num}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="w-96">
              <QRCard tableNumber={selectedTable} />
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll(true)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Show All Tables →
            </button>
          </div>
        </div>
      )}

      {showAll && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Tables ({tableCount})</h2>
            <button
              onClick={() => setShowAll(false)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Show Single Preview
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: tableCount }, (_, i) => i + 1).map(tableNumber => (
              <QRCard key={tableNumber} tableNumber={tableNumber} />
            ))}
          </div>
        </>
      )}

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <span className="text-2xl mr-2">🤖</span> AI-Powered Ordering
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Print and place QR codes on tables</li>
          <li>Customers scan with phone → Beautiful chat interface opens</li>
          <li>AI waiter takes orders, answers questions, suggests dishes</li>
          <li>Orders appear instantly in your admin dashboard</li>
          <li>Customers can track, modify, and pay through chat!</li>
        </ol>
      </div>
    </div>
  );
}
