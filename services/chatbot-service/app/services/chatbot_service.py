import json
import re
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import httpx
from sqlalchemy.orm import Session
from app.config.settings import settings
from app.models.conversation import Conversation
from app.schemas.chatbot import ChatRequest, ChatResponse, Message


class ChatbotService:
    """
    AI Chatbot Service with ORDER PLACEMENT
    """

    @staticmethod
    async def get_menu_items() -> List[dict]:
        """Fetch menu items from Menu Service"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{settings.MENU_SERVICE_URL}/api/v1/menu/")
                if response.status_code == 200:
                    return response.json()
                return []
        except Exception as e:
            print(f"Error fetching menu: {e}")
            return []

    @staticmethod
    async def create_order(table_number: int, customer_name: str, items: List[Dict]) -> Optional[Dict]:
        """Create order via Order Service API"""
        try:
            order_data = {
                "table_number": table_number,
                "customer_name": customer_name,
                "items": items,
                "special_instructions": "Order placed via AI chatbot"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.ORDER_SERVICE_URL}/api/v1/orders/",
                    json=order_data,
                    timeout=10.0
                )
                
                if response.status_code in [200, 201]:
                    return response.json()
                else:
                    print(f"Order creation failed: {response.status_code} - {response.text}")
                    return None
        except Exception as e:
            print(f"Error creating order: {e}")
            return None

    @staticmethod
    def parse_order_from_message(message: str, menu_items: List[dict]) -> Tuple[List[Dict], List[str]]:
        """
        Parse order items from natural language
        Returns: (items_list, item_names)
        """
        message_lower = message.lower()
        order_items = []
        found_items = []
        
        # Common quantity words
        quantity_map = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'a': 1, 'an': 1
        }
        
        for menu_item in menu_items:
            item_name_lower = menu_item['name'].lower()
            
            # Check if item mentioned
            if item_name_lower in message_lower:
                # Try to find quantity
                quantity = 1
                
                # Look for numbers before item name
                number_pattern = r'(\d+)\s*' + re.escape(item_name_lower)
                number_match = re.search(number_pattern, message_lower)
                
                if number_match:
                    quantity = int(number_match.group(1))
                else:
                    # Look for quantity words
                    for word, num in quantity_map.items():
                        if f"{word} {item_name_lower}" in message_lower:
                            quantity = num
                            break
                
                order_items.append({
                    "menu_item_id": menu_item['id'],
                    "quantity": quantity
                })
                found_items.append(f"{quantity}x {menu_item['name']}")
        
        return order_items, found_items

    @staticmethod
    def generate_session_id() -> str:
        """Generate unique session ID"""
        return str(uuid.uuid4())

    @staticmethod
    def get_or_create_conversation(
        db: Session, session_id: Optional[str], customer_id: Optional[int]
    ) -> Conversation:
        """Get existing conversation or create new one"""
        if session_id:
            conversation = (
                db.query(Conversation)
                .filter(Conversation.session_id == session_id)
                .first()
            )
            if conversation:
                conversation.last_activity = datetime.utcnow()
                db.commit()
                return conversation

        new_session_id = ChatbotService.generate_session_id()
        conversation = Conversation(
            session_id=new_session_id,
            customer_id=customer_id,
            messages=json.dumps([]),
            context=json.dumps({}),
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return conversation

    @staticmethod
    async def generate_response_with_ordering(
        user_message: str, 
        menu_items: List[dict], 
        conversation_history: List[Message],
        context: Dict
    ) -> Tuple[str, Dict]:
        """
        Enhanced response with ORDER PLACEMENT capability
        Returns: (response_text, updated_context)
        """
        message_lower = user_message.lower()
        
        # Initialize cart if not exists
        if 'cart' not in context:
            context['cart'] = []
        if 'table_number' not in context:
            context['table_number'] = context.get('table_number', 1)
        if 'customer_name' not in context:
            context['customer_name'] = 'Guest'

        # GREETING
        if any(word in message_lower for word in ["hello", "hi", "hey", "good"]):
            return ("Hello! 👋 Welcome to SmartMenu! I'm your AI waiter. I can help you explore our menu and place orders. What would you like to know?", context)

        # SHOW MENU
        if any(word in message_lower for word in ["menu", "what do you have", "show me", "options"]):
            if not menu_items:
                return ("I'm having trouble fetching our menu right now. Please try again!", context)

            menu_text = "Here are some items from our menu:\n\n"
            for item in menu_items[:10]:
                menu_text += f"• {item['name']} - ${item['price']}\n"
            
            menu_text += "\nWould you like details about any dish or ready to order?"
            return (menu_text, context)

        # ORDER INTENT - This is the KEY part!
        order_keywords = ["order", "want", "get me", "i'd like", "i would like", "place order", "buy"]
        if any(keyword in message_lower for keyword in order_keywords):
            
            # Parse items from message
            order_items, found_items_text = ChatbotService.parse_order_from_message(user_message, menu_items)
            
            if order_items:
                # Add to cart
                context['cart'].extend(order_items)
                
                # Calculate total
                total = 0
                for item in context['cart']:
                    menu_item = next((m for m in menu_items if m['id'] == item['menu_item_id']), None)
                    if menu_item:
                        total += menu_item['price'] * item['quantity']
                
                cart_summary = "\n".join(found_items_text)
                
                response = f"✅ Got it! I've added to your order:\n\n{cart_summary}\n\n"
                response += f"💰 Current total: ${total:.2f}\n\n"
                response += "Would you like to:\n• Add more items?\n• Confirm and place order?\n• Cancel order?"
                
                return (response, context)
            else:
                return ("I'd be happy to help you order! Could you tell me specifically which items you'd like? For example: 'I want 2 Margherita Pizzas'", context)

        # CONFIRM ORDER
        if (any(word in message_lower for word in ["confirm", "place order", "checkout", "finalize"]) or (message_lower.strip() in ["yes", "yes please", "ok", "okay", "sure"])) and context.get('cart'):
            # CREATE THE ACTUAL ORDER!
            order_result = await ChatbotService.create_order(
                table_number=context['table_number'],
                customer_name=context['customer_name'],
                items=context['cart']
            )
            
            if order_result:
                # Calculate total
                total = 0
                for item in context['cart']:
                    menu_item = next((m for m in menu_items if m['id'] == item['menu_item_id']), None)
                    if menu_item:
                        total += menu_item['price'] * item['quantity']
                
                # Clear cart
                context['cart'] = []
                context['last_order_id'] = order_result.get('id')
                
                response = f"🎉 Perfect! Your order has been placed!\n\n"
                response += f"📋 Order #{order_result.get('id')}\n"
                response += f"💰 Total: ${total:.2f}\n\n"
                response += "Your food will be prepared shortly! You can track your order status anytime.\n\n"
                response += "Anything else I can help you with?"
                
                return (response, context)
            else:
                return ("I'm sorry, there was an issue placing your order. Please try again or call a waiter for assistance.", context)

        # VIEW CART
        if any(word in message_lower for word in ["cart", "my order", "what did i order", "total"]):
            if not context.get('cart'):
                return ("Your cart is empty! Would you like to see the menu and order something?", context)
            
            cart_items = []
            total = 0
            for item in context['cart']:
                menu_item = next((m for m in menu_items if m['id'] == item['menu_item_id']), None)
                if menu_item:
                    subtotal = menu_item['price'] * item['quantity']
                    total += subtotal
                    cart_items.append(f"• {item['quantity']}x {menu_item['name']} - ${subtotal:.2f}")
            
            cart_summary = "\n".join(cart_items)
            response = f"🛒 Your current order:\n\n{cart_summary}\n\n💰 Total: ${total:.2f}\n\n"
            response += "Ready to confirm?"
            
            return (response, context)

        # CANCEL ORDER
        if any(word in message_lower for word in ["cancel", "clear cart", "start over", "remove all"]):
            context['cart'] = []
            return ("✅ Cart cleared! Would you like to start a new order?", context)

        # SPECIFIC ITEM INQUIRY
        for item in menu_items:
            if item["name"].lower() in message_lower:
                return (f"{item['name']}: {item.get('description', 'Delicious dish!')} - ${item['price']}. Would you like to order this?", context)

        # PRICE INQUIRY
        if "price" in message_lower or "cost" in message_lower:
            return ("Our items range from $8 to $15. Would you like to see the full menu?", context)

        # RECOMMENDATION
        if any(word in message_lower for word in ["recommend", "suggest", "popular", "best"]):
            if menu_items:
                popular = menu_items[0]
                return (f"Our most popular item is {popular['name']}! {popular.get('description', '')} Only ${popular['price']}! Want to order it?", context)
            return ("Let me show you our menu to help you choose!", context)

        # THANK YOU
        if "thank" in message_lower:
            return ("You're welcome! Is there anything else I can help you with? 😊", context)

        # GOODBYE
        if any(word in message_lower for word in ["bye", "goodbye", "see you"]):
            return ("Thank you for visiting SmartMenu! Have a great day! 🌟", context)

        # DEFAULT
        return ("I'm here to help! You can ask me about our menu, prices, or place an order. What would you like to know?", context)

    @staticmethod
    async def chat(db: Session, chat_request: ChatRequest) -> ChatResponse:
        """Main chat function with ORDER PLACEMENT"""
        
        # Get or create conversation
        conversation = ChatbotService.get_or_create_conversation(
            db, chat_request.session_id, chat_request.customer_id
        )

        # Update customer info
        if chat_request.customer_name and not conversation.customer_name:
            conversation.customer_name = chat_request.customer_name
            db.commit()

        # Load conversation history and context
        messages = json.loads(conversation.messages) if conversation.messages else []
        context = json.loads(conversation.context) if conversation.context else {}
        
        # Add table number and customer name to context
        if hasattr(chat_request, 'context') and chat_request.context:
            if 'table' in chat_request.context:
                context['table_number'] = int(chat_request.context['table'])
            if 'restaurant' in chat_request.context:
                context['restaurant'] = chat_request.context['restaurant']
        
        context['customer_name'] = conversation.customer_name or "Guest"

        # Add user message
        user_msg = {
            "role": "user",
            "content": chat_request.message,
            "timestamp": datetime.utcnow().isoformat(),
        }
        messages.append(user_msg)

        # Get menu items
        menu_items = await ChatbotService.get_menu_items()

        # Generate response WITH ORDER CAPABILITY
        bot_response, updated_context = await ChatbotService.generate_response_with_ordering(
            chat_request.message, menu_items, messages, context
        )

        # Add bot response
        bot_msg = {
            "role": "assistant",
            "content": bot_response,
            "timestamp": datetime.utcnow().isoformat(),
        }
        messages.append(bot_msg)

        # Keep only recent messages
        if len(messages) > settings.MAX_CONVERSATION_HISTORY * 2:
            messages = messages[-(settings.MAX_CONVERSATION_HISTORY * 2) :]

        # Save conversation
        conversation.messages = json.dumps(messages)
        conversation.context = json.dumps(updated_context)
        conversation.last_activity = datetime.utcnow()
        db.commit()

        # Prepare response
        return ChatResponse(
            message=bot_response,
            session_id=conversation.session_id,
            suggested_actions=["View Menu", "Place Order", "Check Cart"],
        )

    @staticmethod
    def get_conversation_history(db: Session, session_id: str) -> Optional[dict]:
        """Get conversation history by session ID"""
        conversation = (
            db.query(Conversation)
            .filter(Conversation.session_id == session_id)
            .first()
        )
        if not conversation:
            return None

        messages = json.loads(conversation.messages) if conversation.messages else []
        return {
            "session_id": conversation.session_id,
            "customer_name": conversation.customer_name,
            "messages": messages,
            "created_at": conversation.created_at,
            "last_activity": conversation.last_activity,
        }
