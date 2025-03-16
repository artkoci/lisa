from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import base64
import uuid
import asyncio
import json
import logging
from typing import Dict, Any

from ..services.openai_service import OpenAIService, WELCOME_MESSAGE
from ..services.deepgram_service import DeepgramService

router = APIRouter(
    tags=["websocket"],
    prefix="/ws",
)

logger = logging.getLogger(__name__)

deepgram_service = None
openai_service = None
active_sessions: Dict[str, Dict[str, Any]] = {}


def init_router(deepgram: DeepgramService, openai: OpenAIService):
    """Initialize the router with required services."""
    global deepgram_service, openai_service
    deepgram_service = deepgram
    openai_service = openai


@router.websocket("")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for voice chat."""
    await websocket.accept()
    session_id = str(uuid.uuid4())

    try:
        # Initialize session
        active_sessions[session_id] = {
            "websocket": websocket,
            "last_activity": asyncio.get_event_loop().time(),
        }

        # welcome_message = WELCOME_MESSAGE
        await websocket.send_json(
            {
                "type": "agent_message",
                "text": WELCOME_MESSAGE,
            }
        )

        try:
            audio_data = await deepgram_service.generate_audio_from_text(
                WELCOME_MESSAGE
            )
            # Convert audio data to base64 for sending over WebSocket
            audio_base64 = base64.b64encode(audio_data).decode("utf-8")

            # Send audio response
            await websocket.send_json(
                {"type": "audio_response", "audio": audio_base64, "format": "mp3"}
            )
        except Exception as e:
            logger.error(f"Failed to generate welcome audio: {str(e)}")

        openai_service.initialize_conversation(session_id, WELCOME_MESSAGE)

        while True:
            active_sessions[session_id]["last_activity"] = (
                asyncio.get_event_loop().time()
            )

            data = await websocket.receive()

            if "text" in data:
                try:
                    message_data = json.loads(data["text"])
                    message_type = message_data.get("type")

                    if message_type == "init":
                        client_session_id = message_data.get("session_id")
                        if client_session_id:
                            if session_id in active_sessions:
                                del active_sessions[session_id]
                            session_id = client_session_id
                            active_sessions[session_id] = {
                                "websocket": websocket,
                                "last_activity": asyncio.get_event_loop().time(),
                            }

                    elif message_type == "message":
                        text = message_data.get("text", "")
                        if text:
                            response_text = await openai_service.generate_response(
                                text, session_id
                            )

                            await websocket.send_json(
                                {
                                    "type": "agent_message",
                                    "text": response_text,
                                }
                            )

                            try:
                                audio_data = (
                                    await deepgram_service.generate_audio_from_text(
                                        response_text
                                    )
                                )
                                audio_base64 = base64.b64encode(audio_data).decode(
                                    "utf-8"
                                )

                                await websocket.send_json(
                                    {
                                        "type": "audio_response",
                                        "audio": audio_base64,
                                        "format": "mp3",
                                    }
                                )
                            except Exception as e:
                                logger.error(f"Failed to generate audio: {str(e)}")

                except json.JSONDecodeError:
                    logger.error("Failed to parse JSON message")
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": "Invalid JSON format",
                        }
                    )

            elif "bytes" in data:
                audio_data = data["bytes"]

                transcript = await deepgram_service.transcribe_audio(
                    audio_data, session_id
                )

                if transcript:
                    await websocket.send_json(
                        {
                            "type": "transcription",
                            "text": transcript,
                        }
                    )

                    response_text = await openai_service.generate_response(
                        transcript, session_id
                    )

                    await websocket.send_json(
                        {
                            "type": "agent_message",
                            "text": response_text,
                        }
                    )

                    try:
                        audio_data = await deepgram_service.generate_audio_from_text(
                            response_text
                        )
                        audio_base64 = base64.b64encode(audio_data).decode("utf-8")

                        await websocket.send_json(
                            {
                                "type": "audio_response",
                                "audio": audio_base64,
                                "format": "mp3",
                            }
                        )
                    except Exception as e:
                        logger.error(f"Failed to generate audio: {str(e)}")
                else:
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": "Could not transcribe audio",
                        }
                    )

    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        if session_id in active_sessions:
            del active_sessions[session_id]
        openai_service.cleanup_conversation(session_id)
