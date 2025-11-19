import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    welcome: "Welcome to",
    table: "Table",
    aiWaiter: "AI Waiter",
    greeting: "I'm your AI waiter for Table",
    menuIntro: "Here's our delicious menu! Tap any item to add it to your order:",
    addToOrder: "Add to Order",
    yourOrder: "Your Order",
    cartEmpty: "Your cart is empty",
    total: "Total",
    placeOrder: "Place Order",
    orderConfirmed: "Perfect! Your order is confirmed!",
    orderTotal: "Order Total",
    readyIn: "Your food will be ready in about 15-20 minutes.",
    enjoyMeal: "Enjoy your meal!",
    askAnything: "Ask me anything...",
    added: "added to your order!",
    currentTotal: "Current total:",
    all: "All",
    each: "each"
  },
  he: {
    welcome: "ברוכים הבאים ל",
    table: "שולחן",
    aiWaiter: "מלצר AI",
    greeting: "אני המלצר AI שלך לשולחן",
    menuIntro: "הנה התפריט הטעים שלנו! הקש על כל פריט כדי להוסיף אותו להזמנה:",
    addToOrder: "הוסף להזמנה",
    yourOrder: "ההזמנה שלך",
    cartEmpty: "העגלה שלך ריקה",
    total: "סה״כ",
    placeOrder: "בצע הזמנה",
    orderConfirmed: "מושלם! ההזמנה שלך אושרה!",
    orderTotal: "סך ההזמנה",
    readyIn: "האוכל שלך יהיה מוכן בעוד כ-15-20 דקות.",
    enjoyMeal: "בתאבון!",
    askAnything: "שאל אותי כל דבר...",
    added: "נוסף להזמנה!",
    currentTotal: "סה״כ נוכחי:",
    all: "הכל",
    each: "כל אחד"
  },
  ar: {
    welcome: "مرحبا بك في",
    table: "طاولة",
    aiWaiter: "نادل AI",
    greeting: "أنا النادل الذكي الخاص بك للطاولة",
    menuIntro: "هذه قائمتنا اللذيذة! انقر على أي عنصر لإضافته إلى طلبك:",
    addToOrder: "أضف إلى الطلب",
    yourOrder: "طلبك",
    cartEmpty: "عربتك فارغة",
    total: "المجموع",
    placeOrder: "تأكيد الطلب",
    orderConfirmed: "ممتاز! تم تأكيد طلبك!",
    orderTotal: "إجمالي الطلب",
    readyIn: "سيكون طعامك جاهزًا خلال 15-20 دقيقة تقريبًا.",
    enjoyMeal: "بالهناء والشفاء!",
    askAnything: "اسألني أي شيء...",
    added: "تمت الإضافة إلى طلبك!",
    currentTotal: "المجموع الحالي:",
    all: "الكل",
    each: "لكل واحد"
  },
  ru: {
    welcome: "Добро пожаловать в",
    table: "Стол",
    aiWaiter: "AI Официант",
    greeting: "Я ваш AI официант для стола",
    menuIntro: "Вот наше вкусное меню! Нажмите на любое блюдо, чтобы добавить его в заказ:",
    addToOrder: "Добавить в заказ",
    yourOrder: "Ваш заказ",
    cartEmpty: "Ваша корзина пуста",
    total: "Итого",
    placeOrder: "Оформить заказ",
    orderConfirmed: "Отлично! Ваш заказ подтвержден!",
    orderTotal: "Итого заказ",
    readyIn: "Ваша еда будет готова примерно через 15-20 минут.",
    enjoyMeal: "Приятного аппетита!",
    askAnything: "Спросите меня что угодно...",
    added: "добавлено в заказ!",
    currentTotal: "Текущая сумма:",
    all: "Все",
    each: "каждый"
  },
  es: {
    welcome: "Bienvenido a",
    table: "Mesa",
    aiWaiter: "Camarero AI",
    greeting: "Soy tu camarero AI para la Mesa",
    menuIntro: "¡Aquí está nuestro delicioso menú! Toca cualquier elemento para agregarlo a tu pedido:",
    addToOrder: "Agregar al pedido",
    yourOrder: "Tu pedido",
    cartEmpty: "Tu carrito está vacío",
    total: "Total",
    placeOrder: "Realizar pedido",
    orderConfirmed: "¡Perfecto! ¡Tu pedido está confirmado!",
    orderTotal: "Total del pedido",
    readyIn: "Tu comida estará lista en unos 15-20 minutos.",
    enjoyMeal: "¡Buen provecho!",
    askAnything: "Pregúntame lo que quieras...",
    added: "agregado a tu pedido!",
    currentTotal: "Total actual:",
    all: "Todo",
    each: "cada uno"
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    // Update HTML dir for RTL languages
    document.documentElement.dir = (lang === 'he' || lang === 'ar') ? 'rtl' : 'ltr';
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
