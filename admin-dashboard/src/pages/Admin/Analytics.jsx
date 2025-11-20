import React, { useState, useEffect } from 'react';
import { orderAPI, menuAPI } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CurrencyDollarIcon, ShoppingBagIcon, ClockIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6'];

export default function Analytics() {
  const { formatCurrency, settings } = useSettings();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    avgPrepTime: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        orderAPI.getAll(),
        menuAPI.getAll()
      ]);

      const ordersData = ordersRes.data;
      const menuData = menuRes.data;

      setOrders(ordersData);
      setMenuItems(menuData);

      const totalRevenue = ordersData.reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = ordersData.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const avgPrepTime = menuData.length > 0 
        ? menuData.reduce((sum, item) => sum + item.prep_time, 0) / menuData.length 
        : 0;

      setStats({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        avgPrepTime: Math.round(avgPrepTime),
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load analytics data');
      setLoading(false);
    }
  };

  const getRevenueByDay = () => {
    const revenueMap = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      revenueMap[date] = (revenueMap[date] || 0) + order.total_amount;
    });

    return Object.entries(revenueMap).map(([date, revenue]) => ({
      date,
      revenue: parseFloat(revenue.toFixed(2))
    }));
  };

  const getOrdersByStatus = () => {
    const statusMap = {};
    orders.forEach(order => {
      statusMap[order.status] = (statusMap[order.status] || 0) + 1;
    });

    return Object.entries(statusMap).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };

  const getPopularItems = () => {
    const itemMap = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!itemMap[item.menu_item_name]) {
          itemMap[item.menu_item_name] = { name: item.menu_item_name, quantity: 0, revenue: 0 };
        }
        itemMap[item.menu_item_name].quantity += item.quantity;
        itemMap[item.menu_item_name].revenue += item.subtotal;
      });
    });

    return Object.values(itemMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map(item => ({
        ...item,
        revenue: parseFloat(item.revenue.toFixed(2))
      }));
  };

  const getCategoryDistribution = () => {
    const categoryMap = {};
    menuItems.forEach(item => {
      categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
    });

    return Object.entries(categoryMap).map(([category, count]) => ({
      name: category,
      value: count
    }));
  };

  // Custom tooltip for currency formatting
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  const revenueData = getRevenueByDay();
  const statusData = getOrdersByStatus();
  const popularItems = getPopularItems();
  const categoryData = getCategoryDistribution();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{formatCurrency(stats.avgOrderValue)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Prep Time</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.avgPrepTime} min</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ClockIcon className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue by Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} name={`Revenue (${settings.currencySymbol})`} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top 10 Popular Items</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularItems} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#3b82f6" name="Quantity Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Menu Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
