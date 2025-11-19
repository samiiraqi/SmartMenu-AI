import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { CheckIcon, XMarkIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Orders() {
  const { formatCurrency } = useSettings();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load orders');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order #${orderId} updated to ${newStatus}`);
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // Format time in Israel timezone - Add 2 hours manually for now
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    // Add 2 hours for Israel timezone
    date.setHours(date.getHours() + 2);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready: 'bg-green-100 text-green-800 border-green-300',
      delivered: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivered',
    };
    return flow[currentStatus];
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Confirm Order',
      confirmed: 'Start Preparing',
      preparing: 'Mark Ready',
      ready: 'Mark Delivered',
    };
    return labels[status] || 'Next';
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'all' || order.status === filter;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      searchTerm === '' ||
      order.customer_name.toLowerCase().includes(searchLower) ||
      `#${order.id}`.toLowerCase().includes(searchLower) ||
      order.id.toString().includes(searchLower) ||
      `order ${order.id}`.includes(searchLower) ||
      `table ${order.table_number}`.includes(searchLower) ||
      order.table_number.toString().includes(searchLower);
    
    return matchesFilter && matchesSearch;
  });

  const filterCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  if (loading) {
    return <div className="text-center py-12">Loading orders...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order #, customer, table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-80"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {status} ({filterCounts[status]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className={`bg-white rounded-lg shadow-md border-l-4 ${getStatusColor(order.status).split(' ')[2]} hover:shadow-lg transition-shadow`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Order #{order.id}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.customer_name} • Table {order.table_number}
                  </p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Items:</h4>
                <ul className="space-y-1">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.quantity}x {item.menu_item_name}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {order.special_instructions && (
                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Note:</span> {order.special_instructions}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">{formatCurrency(order.total_amount)}</span>
                </div>

                <div className="flex space-x-2">
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <>
                      {getNextStatus(order.status) && (
                        <button
                          onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckIcon className="w-4 h-4 mr-1" />
                          {getStatusLabel(order.status)}
                        </button>
                      )}
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                <ClockIcon className="w-4 h-4 mr-1" />
                {formatTime(order.created_at)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No orders found for "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
