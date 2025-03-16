import os
import logging
from typing import Dict, List
from openai import AsyncOpenAI
import httpx


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

WELCOME_MESSAGE = "Hello! I'm Lisa, your personal assistant. How can I help you? You can ask me anything."


class OpenAIService:
    def __init__(self, api_key: str):
        """Initialize the OpenAI service with API key."""

        self.http_client = httpx.AsyncClient()
        self.client = AsyncOpenAI(
            api_key=api_key,
            http_client=self.http_client
        )
        self.conversation_history: Dict[str, List[Dict[str, str]]] = {}

    async def generate_response(self, message: str, session_id: str) -> str:
        """Generate a response using OpenAI."""
        try:
            history = self.conversation_history.get(session_id, [])
            
            history.append({"role": "user", "content": message})

            system_message = {
                "role": "system",
                "content": "Your name is Lisa. You are a helpful AI assistant in a voice conversation. Keep your responses conversational, helpful, and concise.",
            }

            welcome_message = {
                "role": "assistant",
                "content": WELCOME_MESSAGE,
            }
            
            
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[system_message, welcome_message] + history,
                max_tokens=150,
                temperature=0.7,
            )
            
            response_text = response.choices[0].message.content

            history.append({"role": "assistant", "content": response_text})

            self.conversation_history[session_id] = history

            return response_text
        
        except Exception as e:
            logger.error(f"OpenAI error: {str(e)}")
            return "I'm sorry, I encountered an error while processing your request."

    def initialize_conversation(self, session_id: str, welcome_message: str) -> None:
        """Initialize a new conversation with a welcome message."""
        self.conversation_history[session_id] = [
            {"role": "assistant", "content": welcome_message}
        ]

    def cleanup_conversation(self, session_id: str) -> None:
        """Clean up conversation history for a session."""
        if session_id in self.conversation_history:
            del self.conversation_history[session_id]
