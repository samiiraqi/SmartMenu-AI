import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { 
  ShoppingCartIcon, 
  PlusIcon, 
  MinusIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost';

export default function VisualMenu() {
  const { formatCurrency } = useSettings();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '1';
  const restaurantName = searchParams.get('restaurant') || 'SmartMenu Restaurant';
  
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [orderPlaced, setOrderPlaced] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hi! I'm your AI assistant. I can help answer questions about our menu! Just click on dishes to order.`,
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMenu();
  }, []);

  const scrollChatToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (showChat) {
      scrollChatToBottom();
    }
  }, [chatMessages, showChat]);

  const loadMenu = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu/`);
      setMenuItems(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load menu');
      setLoading(false);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatTyping(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat/`, {
        message: chatInput,
        session_id: sessionId,
        table_number: tableNumber,
      });

      const botMessage = {
        role: 'assistant',
        content: response.data.message || 'I can help you with that!',
        timestamp: new Date(),
      };

      if (!sessionId && response.data.session_id) {
        setSessionId(response.data.session_id);
      }

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsChatTyping(false);
    }
  };

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    
    toast.success(`${item.name} added to cart!`);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    try {
      const orderData = {
        table_number: parseInt(tableNumber),
        customer_name: `Table ${tableNumber} Guest`,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity
        })),
        special_instructions: 'Order placed via visual menu'
      };

      const response = await axios.post(`${API_URL}/api/orders/`, orderData);
      
      setOrderPlaced(true);
      setCart([]);
      setShowCart(false);
      
      toast.success('Order placed successfully!');
      
      setTimeout(() => {
        setOrderPlaced(false);
      }, 5000);
      
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error('Order error:', error);
    }
  };

  const getItemImage = (category) => {
    const images = {
      'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
      'Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
      'Burgers': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      'Salads': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      'Desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
      'Drinks': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    };
    return images[category] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{restaurantName.replace(/-/g, ' ')}</h1>
              <p className="text-sm text-primary-100">Table {tableNumber}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors relative"
              >
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-green-400 w-3 h-3 rounded-full"></span>
              </button>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-primary-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gray-200">
                <img
                  src={getItemImage(item.category)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {!item.is_available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
                      Unavailable
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <span className="text-xs text-primary-600 font-medium">{item.category}</span>
                  </div>
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(item.price)}</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">⏱️ {item.prep_time} min</span>
                  
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.is_available}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span className="font-medium">Add</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full sm:w-96 rounded-t-3xl sm:rounded-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-xs text-primary-100">Ask me anything!</p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="hover:bg-primary-700 p-1 rounded">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {chatMessages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-800 shadow'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isChatTyping && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendChatMessage} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 border-2 border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={isChatTyping}
                />
                <button
                  type="submit"
                  disabled={isChatTyping || !chatInput.trim()}
                  className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:bg-gray-300"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full sm:w-auto sm:min-w-[500px] sm:max-w-2xl rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
                      <img src={getItemImage(item.category)} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 bg-gray-200 rounded hover:bg-gray-300">
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 bg-primary-600 text-white rounded hover:bg-primary-700">
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">{formatCurrency(calculateTotal())}</span>
                </div>
                
                <button
                  onClick={placeOrder}
                  className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircleIcon className="w-6 h-6" />
                  <span>Place Order</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Success */}
      {orderPlaced && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
            <p className="text-gray-600 mb-4">Your food will be ready soon!</p>
            <p className="text-sm text-gray-500">Table {tableNumber}</p>
          </div>
        </div>
      )}

      {/* Help Hint */}
      {!showChat && !showCart && (
        <div className="fixed bottom-6 left-6 bg-primary-600 text-white rounded-full shadow-lg px-4 py-3 text-sm animate-pulse">
          💬 Need help? Click chat icon!
        </div>
      )}
    </div>
  );
}
