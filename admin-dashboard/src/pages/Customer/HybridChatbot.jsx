import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { 
  PaperAirplaneIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  XMarkIcon,
  Bars3Icon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost';

export default function HybridChatbot() {
  const { formatCurrency } = useSettings();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '1';
  const restaurantName = searchParams.get('restaurant') || 'SmartMenu Restaurant';
  
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Welcome to ${restaurantName.replace(/-/g, ' ')}! I'm your AI waiter for Table ${tableNumber}.\n\nI can help you:\n• Find the perfect dish\n• Answer questions about our menu\n• Take your order\n• Make recommendations\n\nWhat are you in the mood for today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMenu = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu/`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to load menu');
    }
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat/`, {
        message: textToSend,
        session_id: sessionId,
        table_number: tableNumber,
        context: {
          table: tableNumber,
          restaurant: restaurantName,
        }
      });

      // Detect if chatbot mentioned specific items - show them as cards
      const mentionedItems = menuItems.filter(item => 
        response.data.message.toLowerCase().includes(item.name.toLowerCase())
      );
      
      if (mentionedItems.length > 0 && mentionedItems.length <= 6) {
        setSuggestedItems(mentionedItems);
      } else {
        setSuggestedItems([]);
      }

      const botMessage = {
        role: 'assistant',
        content: response.data.message || 'I can help you with that!',
        timestamp: new Date(),
      };

      if (!sessionId && response.data.session_id) {
        setSessionId(response.data.session_id);
      }

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I had a connection issue. Please try again! 🔄',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

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
    
    // Send confirmation to chat
    const confirmMessage = {
      role: 'assistant',
      content: `✅ Added ${item.name} to your order! Current total: ${formatCurrency(calculateTotal() + item.price)}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, confirmMessage]);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter(item => item.id !== itemId));
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
        special_instructions: 'Order placed via AI chatbot'
      };

      await axios.post(`${API_URL}/api/orders/`, orderData);
      
      const successMessage = {
        role: 'assistant',
        content: `🎉 Perfect! Your order has been placed!\n\n📋 Total: ${formatCurrency(calculateTotal())}\n\nYour food will be prepared shortly. I'll keep you updated!\n\nIs there anything else I can help you with?`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, successMessage]);
      setCart([]);
      setShowCart(false);
      toast.success('Order placed successfully!');
      
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
      console.error('Order error:', error);
    }
  };

  const quickActions = [
    { emoji: '📋', text: 'Show Full Menu', message: 'Show me the full menu' },
    { emoji: '⭐', text: 'Popular Items', message: "What's popular?" },
    { emoji: '🍕', text: 'Pizza', message: 'Show me pizzas' },
    { emoji: '🍝', text: 'Pasta', message: 'Show me pasta' },
    { emoji: '🥗', text: 'Healthy Options', message: 'Show me healthy options' },
    { emoji: '💰', text: 'Budget Friendly', message: 'What are your cheapest items?' },
  ];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-xl">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{restaurantName.replace(/-/g, ' ')}</h1>
                <p className="text-sm text-primary-100">Table {tableNumber} • AI Waiter</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMenu(true)}
                className="flex items-center space-x-2 bg-white/20 px-3 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <Bars3Icon className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Menu</span>
              </button>
              
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <ShoppingCartIcon className="w-6 h-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-primary-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area - MAIN FOCUS */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col">
        <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                    : 'bg-gradient-to-r from-gray-50 to-white text-gray-800 border border-gray-200'
                }`}>
                  <p className="text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Suggested Item Cards */}
            {suggestedItems.length > 0 && (
              <div className="my-4">
                <p className="text-sm text-gray-600 mb-3 font-medium px-2">Tap to add to your order:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {suggestedItems.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all">
                      <img src={getItemImage(item.category)} alt={item.name} className="w-full h-24 object-cover" />
                      <div className="p-3">
                        <h4 className="font-bold text-sm text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary-600">{formatCurrency(item.price)}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-primary-600 text-white p-1.5 rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl px-6 py-4 shadow-lg border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(action.message)}
                  className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border-2 border-primary-200 hover:border-primary-600 hover:bg-primary-50 transition-all shadow-sm hover:shadow-md text-sm font-medium"
                >
                  <span className="text-lg">{action.emoji}</span>
                  <span className="text-gray-700">{action.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="border-t border-gray-200 p-4 bg-white">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border-2 border-gray-300 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-full hover:from-primary-700 hover:to-primary-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                <PaperAirplaneIcon className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Full Menu Modal */}
      {showMenu && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Full Menu</h2>
              <button onClick={() => setShowMenu(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border hover:shadow-xl transition-all">
                    <img src={getItemImage(item.category)} alt={item.name} className="w-full h-32 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">{formatCurrency(item.price)}</span>
                        <button
                          onClick={() => { addToCart(item); setShowMenu(false); }}
                          className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700"
                        >
                          <PlusIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XMarkIcon className="w-6 h-6" />
              </button>
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
                    <div key={item.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
                      <img src={getItemImage(item.category)} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
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
              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">Total</span>
                  <span className="text-3xl font-bold text-primary-600">{formatCurrency(calculateTotal())}</span>
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <CheckCircleIcon className="w-6 h-6" />
                  <span>Place Order</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
