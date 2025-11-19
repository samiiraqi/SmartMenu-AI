import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  PaperAirplaneIcon, 
  ShoppingCartIcon,
  SparklesIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost';

export default function CustomerChat() {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '1';
  const restaurantName = searchParams.get('restaurant') || 'SmartMenu Restaurant';
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Welcome to ${restaurantName.replace(/-/g, ' ')}! I'm your AI waiter for Table ${tableNumber}.\n\nHow can I help you today?\n\n• View our menu\n• Place an order\n• Ask about dishes\n• Track your order`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

      const botMessage = {
        role: 'assistant',
        content: response.data.message || response.data.response || 'I can help you with that!',
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

  const quickActions = [
    { icon: '📋', text: 'Show Menu', message: 'Show me the full menu' },
    { icon: '⭐', text: 'Popular Dishes', message: 'What are your most popular dishes?' },
    { icon: '🍕', text: 'Pizza', message: 'Show me pizza options' },
    { icon: '🍝', text: 'Pasta', message: 'Show me pasta dishes' },
    { icon: '🥗', text: 'Salads', message: 'Show me salads' },
    { icon: '🍰', text: 'Desserts', message: 'Show me desserts' },
    { icon: '🛒', text: 'Place Order', message: 'I want to place an order' },
    { icon: '💰', text: 'Check Total', message: 'What is my order total?' },
  ];

  const handleQuickAction = (message) => {
    sendMessage(message);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <SparklesIcon className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{restaurantName.replace(/-/g, ' ')}</h1>
                <p className="text-sm text-primary-100">Table {tableNumber} • AI Waiter</p>
              </div>
            </div>
            <ShoppingCartIcon className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
          <div className="h-full flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                        : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800'
                    }`}
                  >
                    <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl px-5 py-4 shadow-md">
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
              <p className="text-xs text-gray-500 mb-3 font-medium">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.message)}
                    className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border-2 border-primary-200 hover:border-primary-600 hover:bg-primary-50 transition-all shadow-sm hover:shadow-md"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{action.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border-2 border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputMessage.trim()}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-3 rounded-full hover:from-primary-700 hover:to-primary-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <PaperAirplaneIcon className="w-6 h-6" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-sm text-gray-500">
          <p className="flex items-center justify-center space-x-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500" />
            <span>Powered by SmartMenu AI</span>
          </p>
        </div>
      </div>
    </div>
  );
}
