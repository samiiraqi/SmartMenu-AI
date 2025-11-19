import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import httpx
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.models.conversation import Conversation
from app.schemas.chatbot import ChatRequest, ChatResponse, Message


class ChatbotService:
    """
    AI Chatbot Service
    Handles natural language interactions
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
                # Update last activity
                conversation.last_activity = datetime.utcnow()
                db.commit()
                return conversation

        # Create new conversation
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
    def build_system_prompt(menu_items: List[dict]) -> str:
        """Build system prompt with menu context"""
        menu_text = "\n".join(
            [
                f"- {item['name']}: ${item['price']} - {item.get('description', '')}"
                for item in menu_items
            ]
        )

        return f"""You are a friendly AI assistant for SmartMenu restaurant.

Available Menu:
{menu_text}

Your role:
1. Help customers browse the menu
2. Answer questions about dishes
3. Make recommendations based on preferences
4. Help with ordering process
5. Be friendly, helpful, and concise

Keep responses brief (2-3 sentences max) unless customer asks for details.
"""

    @staticmethod
    async def generate_response_simple(
        user_message: str, menu_items: List[dict], conversation_history: List[Message]
    ) -> str:
        """
        Simple rule-based responses (no API needed!)
        This works without OpenAI API key
        """
        message_lower = user_message.lower()

        # Greeting
        if any(word in message_lower for word in ["hello", "hi", "hey", "good"]):
            return "Hello! 👋 Welcome to SmartMenu! I can help you explore our menu and place orders. What would you like to know?"

        # Menu inquiry
        if any(word in message_lower for word in ["menu", "what do you have", "options"]):
            if not menu_items:
                return "I'm having trouble fetching our menu right now. Please try again!"

            menu_text = "\n".join(
                [f"• {item['name']} - ${item['price']}" for item in menu_items[:5]]
            )
            return f"Here are some items from our menu:\n\n{menu_text}\n\nWould you like details about any dish?"

        # Specific item inquiry
        for item in menu_items:
            if item["name"].lower() in message_lower:
                return f"{item['name']}: {item.get('description', 'Delicious dish!')} - ${item['price']}. Would you like to order this?"

        # Price inquiry
        if "price" in message_lower or "cost" in message_lower:
            return "Our items range from $8 to $15. Would you like to see the full menu?"

        # Order help
        if any(word in message_lower for word in ["order", "buy", "get"]):
            return "I'd be happy to help you order! What would you like to get?"

        # Recommendation
        if any(
            word in message_lower for word in ["recommend", "suggest", "popular"]
        ):
            if menu_items:
                popular = menu_items[0]
                return f"Our most popular item is {popular['name']}! {popular.get('description', '')} Only ${popular['price']}!"
            return "Let me show you our menu to help you choose!"

        # Thank you
        if "thank" in message_lower:
            return "You're welcome! Is there anything else I can help you with? 😊"

        # Goodbye
        if any(word in message_lower for word in ["bye", "goodbye", "see you"]):
            return "Thank you for visiting SmartMenu! Have a great day! 🌟"

        # Default response
        return "I'm here to help! You can ask me about our menu, prices, or place an order. What would you like to know?"

    @staticmethod
    async def chat(db: Session, chat_request: ChatRequest) -> ChatResponse:
        """
        Main chat function
        """
        # Get or create conversation
        conversation = ChatbotService.get_or_create_conversation(
            db, chat_request.session_id, chat_request.customer_id
        )

        # Update customer name if provided
        if chat_request.customer_name and not conversation.customer_name:
            conversation.customer_name = chat_request.customer_name
            db.commit()

        # Load conversation history
        messages = json.loads(conversation.messages) if conversation.messages else []

        # Add user message
        user_msg = {
            "role": "user",
            "content": chat_request.message,
            "timestamp": datetime.utcnow().isoformat(),
        }
        messages.append(user_msg)

        # Get menu items
        menu_items = await ChatbotService.get_menu_items()

        # Generate response (simple rule-based)
        bot_response = await ChatbotService.generate_response_simple(
            chat_request.message, menu_items, messages
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
        conversation.last_activity = datetime.utcnow()
        db.commit()

        # Prepare response
        return ChatResponse(
            message=bot_response,
            session_id=conversation.session_id,
            suggested_actions=["View Menu", "Place Order", "Ask Question"],
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
