import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  PaperAirplaneIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon,
  CheckCircleIcon,
  XMarkIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

// Status translations
const statusMessages = {
  en: {
    pending: { icon: '⏳', title: 'Order Received!', message: 'Your order has been received and is awaiting confirmation.' },
    confirmed: { icon: '✅', title: 'Order Confirmed!', message: 'Great news! Your order has been confirmed and will be prepared shortly.' },
    preparing: { icon: '👨‍🍳', title: 'Cooking in Progress!', message: 'Our chef is preparing your delicious meal right now!' },
    ready: { icon: '🎉', title: 'Order Ready!', message: 'Your order is ready! A server will bring it to your table shortly.' },
    delivered: { icon: '🍽️', title: 'Enjoy Your Meal!', message: 'Your order has been delivered. Bon appétit!' },
    cancelled: { icon: '❌', title: 'Order Cancelled', message: 'Your order has been cancelled.' }
  },
  he: {
    pending: { icon: '⏳', title: 'ההזמנה התקבלה!', message: 'ההזמנה שלך התקבלה וממתינה לאישור.' },
    confirmed: { icon: '✅', title: 'ההזמנה אושרה!', message: 'חדשות טובות! ההזמנה שלך אושרה ותוכן בקרוב.' },
    preparing: { icon: '👨‍🍳', title: 'בהכנה!', message: 'השף שלנו מכין את הארוחה הטעימה שלך כרגע!' },
    ready: { icon: '🎉', title: 'ההזמנה מוכנה!', message: 'ההזמנה שלך מוכנה! מלצר יביא אותה בקרוב.' },
    delivered: { icon: '🍽️', title: 'בתאבון!', message: 'ההזמנה שלך הגיעה. בתאבון!' },
    cancelled: { icon: '❌', title: 'ההזמנה בוטלה', message: 'ההזמנה שלך בוטלה.' }
  },
  ar: {
    pending: { icon: '⏳', title: 'تم استلام الطلب!', message: 'تم استلام طلبك وهو في انتظار التأكيد.' },
    confirmed: { icon: '✅', title: 'تم تأكيد الطلب!', message: 'أخبار رائعة! تم تأكيد طلبك وسيتم تحضيره قريبًا.' },
    preparing: { icon: '👨‍🍳', title: 'جاري الطهي!', message: 'طاهينا يحضر وجبتك اللذيذة الآن!' },
    ready: { icon: '🎉', title: 'الطلب جاهز!', message: 'طلبك جاهز! سيحضره النادل قريبًا.' },
    delivered: { icon: '🍽️', title: 'بالهناء والشفاء!', message: 'تم تسليم طلبك. بالهناء والشفاء!' },
    cancelled: { icon: '❌', title: 'تم إلغاء الطلب', message: 'تم إلغاء طلبك.' }
  },
  ru: {
    pending: { icon: '⏳', title: 'Заказ получен!', message: 'Ваш заказ получен и ожидает подтверждения.' },
    confirmed: { icon: '✅', title: 'Заказ подтвержден!', message: 'Отличные новости! Ваш заказ подтвержден.' },
    preparing: { icon: '👨‍🍳', title: 'Готовится!', message: 'Наш шеф-повар готовит ваше блюдо!' },
    ready: { icon: '🎉', title: 'Заказ готов!', message: 'Ваш заказ готов! Официант скоро принесет его.' },
    delivered: { icon: '🍽️', title: 'Приятного аппетита!', message: 'Ваш заказ доставлен. Приятного аппетита!' },
    cancelled: { icon: '❌', title: 'Заказ отменен', message: 'Ваш заказ был отменен.' }
  },
  es: {
    pending: { icon: '⏳', title: '¡Pedido Recibido!', message: 'Tu pedido ha sido recibido y está esperando confirmación.' },
    confirmed: { icon: '✅', title: '¡Pedido Confirmado!', message: '¡Buenas noticias! Tu pedido ha sido confirmado.' },
    preparing: { icon: '👨‍🍳', title: '¡Cocinando!', message: '¡Nuestro chef está preparando tu comida!' },
    ready: { icon: '🎉', title: '¡Pedido Listo!', message: '¡Tu pedido está listo! Un mesero lo traerá pronto.' },
    delivered: { icon: '🍽️', title: '¡Buen Provecho!', message: 'Tu pedido ha sido entregado. ¡Buen provecho!' },
    cancelled: { icon: '❌', title: 'Pedido Cancelado', message: 'Tu pedido ha sido cancelado.' }
  }
};

const menuTranslations = {
  en: { categories: { 'Pizza': 'Pizza', 'Pasta': 'Pasta', 'Burgers': 'Burgers', 'Salads': 'Salads', 'Desserts': 'Desserts', 'Drinks': 'Drinks' }},
  he: { categories: { 'Pizza': 'פיצה', 'Pasta': 'פסטה', 'Burgers': 'המבורגרים', 'Salads': 'סלטים', 'Desserts': 'קינוחים', 'Drinks': 'משקאות' }},
  ar: { categories: { 'Pizza': 'بيتزا', 'Pasta': 'معكرونة', 'Burgers': 'برجر', 'Salads': 'سلطات', 'Desserts': 'حلويات', 'Drinks': 'مشروبات' }},
  ru: { categories: { 'Pizza': 'Пицца', 'Pasta': 'Паста', 'Burgers': 'Бургеры', 'Salads': 'Салаты', 'Desserts': 'Десерты', 'Drinks': 'Напитки' }},
  es: { categories: { 'Pizza': 'Pizza', 'Pasta': 'Pasta', 'Burgers': 'Hamburguesas', 'Salads': 'Ensaladas', 'Desserts': 'Postres', 'Drinks': 'Bebidas' }}
};

export default function AIMenuChatbot() {
  const { formatCurrency } = useSettings();
  const { language, changeLanguage, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '1';
  const restaurantName = searchParams.get('restaurant') || 'SmartMenu Restaurant';
  
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('All');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [lastOrderStatus, setLastOrderStatus] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMenuAndGreet();
  }, [language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for order status updates every 3 seconds
  useEffect(() => {
    if (!currentOrderId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/orders/${currentOrderId}`);
        const order = response.data;
        
        // Check if status changed
        if (order.status !== lastOrderStatus && lastOrderStatus !== null) {
          handleOrderStatusUpdate(order.id, order.table_number, order.status);
        }
        
        setLastOrderStatus(order.status);
      } catch (error) {
        console.error('Error polling order status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [currentOrderId, lastOrderStatus]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOrderStatusUpdate = (orderId, tableNum, status) => {
    // Only show updates for this table
    if (parseInt(tableNum) !== parseInt(tableNumber)) return;

    const statusInfo = statusMessages[language]?.[status] || statusMessages.en[status];
    
    if (statusInfo) {
      const updateMessage = {
        role: 'assistant',
        content: `${statusInfo.icon} **${statusInfo.title}**\n\n${statusInfo.message}\n\n📋 Order #${orderId}`,
        timestamp: new Date(),
        isStatusUpdate: true,
        status: status
      };
      
      setMessages(prev => [...prev, updateMessage]);
      toast.success(statusInfo.title, { icon: statusInfo.icon, duration: 5000 });
    }
  };

  const translateCategory = (category) => {
    if (language === 'en') return category;
    const translations = menuTranslations[language]?.categories || {};
    return translations[category] || category;
  };

  const loadMenuAndGreet = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu/`);
      setMenuItems(response.data);
      
      setTimeout(() => {
        const greetMessage = {
          role: 'assistant',
          content: `👋 ${t('welcome')} ${restaurantName.replace(/-/g, ' ')}!\n\n${t('greeting')} ${tableNumber}.`,
          timestamp: new Date(),
        };
        setMessages([greetMessage]);
        
        setTimeout(() => {
          const menuMessage = {
            role: 'assistant',
            content: t('menuIntro'),
            timestamp: new Date(),
            showMenu: true,
            menuItems: response.data
          };
          setMessages(prev => [...prev, menuMessage]);
        }, 2000);
      }, 500);
    } catch (error) {
      console.error('Failed to load menu');
    }
  };

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim()) return;

    const userMessage = { role: 'user', content: textToSend, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat/`, {
        message: textToSend,
        session_id: sessionId,
        table_number: tableNumber,
      });

      if (!sessionId && response.data.session_id) {
        setSessionId(response.data.session_id);
      }

      const botMessage = {
        role: 'assistant',
        content: response.data.message || 'I can help you with that!',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
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
    
    toast.success(`${item.name} ${t('added')}`, { icon: '✅' });
    
    const confirmMessage = {
      role: 'assistant',
      content: `✅ ${item.name} ${t('added')}\n\n💰 ${t('currentTotal')} ${formatCurrency(calculateTotal() + item.price)}`,
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
      toast.error(t('cartEmpty'));
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
        special_instructions: 'Order via AI chatbot'
      };

      const response = await axios.post(`${API_URL}/api/orders/`, orderData);
      const orderId = response.data.id;
      
      setCurrentOrderId(orderId);
      setLastOrderStatus('pending');
      
      const successMessage = {
        role: 'assistant',
        content: `🎉 ${t('orderConfirmed')}\n\n📋 Order #${orderId}\n💰 ${t('orderTotal')}: ${formatCurrency(calculateTotal())}\n\n⏱️ ${t('readyIn')}\n\n${t('enjoyMeal')} 😊\n\n💬 I'll keep you updated on your order status!`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, successMessage]);
      setCart([]);
      setShowCart(false);
      toast.success(t('orderConfirmed'), { icon: '🎉' });
      
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
  const translatedCategories = [t('all'), ...uniqueCategories.map(cat => translateCategory(cat))];
  
  const filteredMenuItems = currentCategory === t('all')
    ? menuItems 
    : menuItems.filter(item => translateCategory(item.category) === currentCategory);

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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'from-yellow-500 to-orange-500',
      confirmed: 'from-blue-500 to-cyan-500',
      preparing: 'from-purple-500 to-pink-500',
      ready: 'from-green-500 to-emerald-500',
      delivered: 'from-gray-500 to-gray-600',
      cancelled: 'from-red-500 to-orange-500'
    };
    return colors[status] || 'from-cyan-500 to-blue-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border-b-2 border-cyan-400/50 shadow-lg shadow-cyan-500/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-cyan-300 flex items-center space-x-2">
                <span>🤖</span>
                <span>{restaurantName.replace(/-/g, ' ')}</span>
              </h1>
              <p className="text-cyan-200 text-sm">{t('table')} {tableNumber} • {t('aiWaiter')}</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowLanguages(!showLanguages)}
                className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full hover:from-purple-400 hover:to-pink-400 transition-all shadow-lg shadow-purple-500/50"
              >
                <LanguageIcon className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={() => setShowCart(true)}
                className="relative bg-gradient-to-r from-cyan-500 to-blue-500 p-3 rounded-full hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/50"
              >
                <ShoppingCartIcon className="w-6 h-6 text-white" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-lg">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Language Modal */}
      {showLanguages && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 max-w-md w-full border-2 border-cyan-400 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-cyan-300">Choose Language</h2>
              <button onClick={() => setShowLanguages(false)} className="p-2 hover:bg-white/10 rounded-full">
                <XMarkIcon className="w-6 h-6 text-cyan-300" />
              </button>
            </div>
            
            <div className="space-y-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setCurrentCategory(t('all'));
                    setShowLanguages(false);
                    toast.success(`Language: ${lang.name}`, { icon: lang.flag });
                  }}
                  className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                    language === lang.code
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 border-2 border-cyan-300 shadow-lg'
                      : 'bg-white/10 border-2 border-cyan-400/50 hover:bg-white/20'
                  }`}
                >
                  <span className="text-4xl">{lang.flag}</span>
                  <span className={`text-xl font-bold ${language === lang.code ? 'text-white' : 'text-cyan-300'}`}>
                    {lang.name}
                  </span>
                  {language === lang.code && <CheckCircleIcon className="w-6 h-6 text-white ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div className="relative z-10 max-w-6xl mx-auto p-4 flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="flex-1 overflow-y-auto space-y-6 py-6">
          {messages.map((message, index) => (
            <div key={index}>
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-2xl backdrop-blur-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-2 border-cyan-300'
                    : message.isStatusUpdate
                    ? `bg-gradient-to-r ${getStatusColor(message.status)} text-white border-2 border-white/30 animate-pulse`
                    : 'bg-white/10 text-white border-2 border-cyan-400/50'
                }`}>
                  <p className="text-lg whitespace-pre-wrap leading-relaxed font-semibold">{message.content}</p>
                  <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-cyan-100' : 'text-white/70'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {message.showMenu && message.menuItems && (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {translatedCategories.map((category, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentCategory(category)}
                        className={`px-4 py-2 rounded-full font-semibold transition-all ${
                          currentCategory === category
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                            : 'bg-white/10 text-cyan-300 border-2 border-cyan-400/50 hover:bg-white/20'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenuItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border-2 border-cyan-400/50 hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all transform hover:scale-105"
                      >
                        <div className="relative h-40">
                          <img src={getItemImage(item.category)} alt={item.name} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                            {formatCurrency(item.price)}
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-bold text-lg text-white mb-1">{item.name}</h3>
                          <p className="text-sm text-cyan-200 mb-1">{translateCategory(item.category)}</p>
                          <p className="text-xs text-gray-300 mb-3 line-clamp-2">{item.description}</p>
                          
                          <button
                            onClick={() => addToCart(item)}
                            disabled={!item.is_available}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-xl font-bold hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                          >
                            <PlusIcon className="w-5 h-5" />
                            <span>{t('addToOrder')}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl px-6 py-4 border-2 border-cyan-400/50">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="relative">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-4 rounded-3xl border-2 border-cyan-400/50 shadow-2xl">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t('askAnything')}
              className="flex-1 bg-transparent text-white placeholder-cyan-300 text-lg px-4 py-3 focus:outline-none"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !inputMessage.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-full hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 transition-all shadow-lg"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>

      {/* Cart Modal (keeping short for space) */}
      {showCart && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border-2 border-cyan-400 shadow-2xl">
            <div className="p-6 border-b-2 border-cyan-400/50 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-cyan-300 flex items-center space-x-2">
                <ShoppingCartIcon className="w-8 h-8" />
                <span>{t('yourOrder')}</span>
              </h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-white/10 rounded-full">
                <XMarkIcon className="w-6 h-6 text-cyan-300" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 max-h-96">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCartIcon className="w-16 h-16 text-cyan-400/50 mx-auto mb-4" />
                  <p className="text-cyan-300">{t('cartEmpty')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border-2 border-cyan-400/50">
                      <img src={getItemImage(item.category)} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{item.name}</h4>
                        <p className="text-sm text-cyan-300">{formatCurrency(item.price)} {t('each')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 bg-cyan-500 rounded-lg hover:bg-cyan-400">
                          <MinusIcon className="w-4 h-4 text-white" />
                        </button>
                        <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 bg-cyan-500 rounded-lg hover:bg-cyan-400">
                          <PlusIcon className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <p className="font-bold text-cyan-300">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t-2 border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-white">{t('total')}</span>
                  <span className="text-4xl font-bold text-cyan-300">{formatCurrency(calculateTotal())}</span>
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <CheckCircleIcon className="w-6 h-6" />
                  <span>{t('placeOrder')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
