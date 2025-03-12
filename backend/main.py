import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
import httpx
from deepgram import DeepgramClient, SpeakOptions, PrerecordedOptions
import uuid
import io
import base64

# Load environment variables
load_dotenv('.env.dev')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the FastAPI app
app = FastAPI(title="Voice Chat API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize API clients
# Create a custom HTTP client without proxies
http_client = httpx.AsyncClient()
openai_client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    http_client=http_client
)
deepgram_api_key = os.getenv("DEEPGRAM_API_KEY")
deepgram = DeepgramClient(deepgram_api_key)

# Store active sessions
active_sessions: Dict[str, Dict[str, Any]] = {}

# Memory for conversation history
conversation_history: Dict[str, List[Dict[str, str]]] = {}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.get("/tts")
async def text_to_speech(text: str):
    """Convert text to speech using Deepgram."""
    try:
        # Generate audio from text using Deepgram client
        audio_data = await generate_audio_from_text(text)
        
        # Return the audio as a response
        return Response(
            content=audio_data, 
            media_type="audio/mp3",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
    except Exception as e:
        logger.error(f"Deepgram TTS error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")

async def generate_audio_from_text(text: str) -> bytes:
    """Generate audio from text using Deepgram."""
    try:
        # Create text payload
        text_payload = {
            "text": text
        }
        
        # Configure TTS options
        options = SpeakOptions(
            model="aura-asteria-en",
        )
        
        # Use the Deepgram API directly since the SDK's save method expects a file path
        url = "https://api.deepgram.com/v1/speak"
        headers = {
            "Authorization": f"Token {deepgram_api_key}",
            "Content-Type": "application/json"
        }
        
        # Parameters according to the Deepgram documentation
        params = {
            "model": "aura-asteria-en",  # High-quality voice
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=text_payload, headers=headers, params=params)
            
            if response.status_code != 200:
                logger.error(f"Deepgram TTS error: {response.text}")
                raise Exception(f"TTS API error: {response.text}")
            
            return response.content
    except Exception as e:
        logger.error(f"Deepgram audio generation error: {str(e)}")
        raise Exception(f"Failed to generate audio: {str(e)}")

async def transcribe_audio(audio_data: bytes, session_id: str) -> str:
    """Transcribe audio data using Deepgram."""
    try:
        # Use the correct Deepgram SDK v3 API for transcription with async support
        
        # Configure transcription options
        options = PrerecordedOptions(
            model="nova-2",
            language="en",
            punctuate=True,
        )
        
        # Call the transcribe_file method on the asyncrest API
        response = await deepgram.listen.asyncrest.v("1").transcribe_file(
            {"buffer": audio_data, "mimetype": "audio/webm"},
            options
        )
        
        # Get transcription result
        if not response or not response.results:
            return ""
            
        transcript = response.results.channels[0].alternatives[0].transcript
        
        if not transcript:
            return ""
            
        logger.info(f"Transcription: {transcript}")
        return transcript
    
    except Exception as e:
        logger.error(f"Deepgram error: {str(e)}")
        return ""

async def generate_response(message: str, session_id: str) -> str:
    """Generate a response using OpenAI."""
    try:
        # Get conversation history or create new
        history = conversation_history.get(session_id, [])
        
        # Add user message to history
        history.append({"role": "user", "content": message})
        
        # Create system message for context
        system_message = {
            "role": "system", 
            "content": "You are a helpful AI assistant in a voice conversation. Keep your responses conversational, helpful, and concise."
        }
        
        # Generate response from OpenAI
        response = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[system_message] + history,
            max_tokens=150,
            temperature=0.7,
        )
        
        # Extract the response text
        response_text = response.choices[0].message.content
        
        # Add assistant's response to history
        history.append({"role": "assistant", "content": response_text})
        
        # Update conversation history
        conversation_history[session_id] = history
        
        return response_text
    
    except Exception as e:
        logger.error(f"OpenAI error: {str(e)}")
        return "I'm sorry, I encountered an error while processing your request."

@app.websocket("/ws")
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
        
        # Send welcome message
        welcome_message = "Hello! I'm your AI assistant. How can I help you today?"
        await websocket.send_json({
            "type": "agent_message",
            "text": welcome_message,
        })
        
        # Initialize conversation history
        conversation_history[session_id] = [
            {"role": "assistant", "content": welcome_message}
        ]
        
        # Process messages
        while True:
            # Update last activity time
            active_sessions[session_id]["last_activity"] = asyncio.get_event_loop().time()
            
            # Receive message
            data = await websocket.receive()
            
            # Check if text or binary
            if "text" in data:
                # Process JSON message
                try:
                    message_data = json.loads(data["text"])
                    message_type = message_data.get("type")
                    
                    if message_type == "init":
                        # Initialize session with client-provided ID if available
                        client_session_id = message_data.get("session_id")
                        if client_session_id:
                            # Clean up old session if it exists
                            if session_id in active_sessions:
                                del active_sessions[session_id]
                            # Use client-provided session ID
                            session_id = client_session_id
                            active_sessions[session_id] = {
                                "websocket": websocket,
                                "last_activity": asyncio.get_event_loop().time(),
                            }
                    
                    elif message_type == "message":
                        # Process text message
                        text = message_data.get("text", "")
                        if text:
                            # Generate response
                            response_text = await generate_response(text, session_id)
                            
                            # Send response back
                            await websocket.send_json({
                                "type": "agent_message",
                                "text": response_text,
                            })
                            
                            # Generate audio for the response
                            try:
                                audio_data = await generate_audio_from_text(response_text)
                                # Convert audio data to base64 for sending over WebSocket
                                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                                
                                # Send audio response
                                await websocket.send_json({
                                    "type": "audio_response",
                                    "audio": audio_base64,
                                    "format": "mp3"
                                })
                            except Exception as e:
                                logger.error(f"Failed to generate audio: {str(e)}")
                
                except json.JSONDecodeError:
                    logger.error("Failed to parse JSON message")
                    await websocket.send_json({
                        "type": "error",
                        "message": "Invalid JSON format",
                    })
            
            elif "bytes" in data:
                # Process audio data
                audio_data = data["bytes"]
                
                # Transcribe audio
                transcript = await transcribe_audio(audio_data, session_id)
                
                if transcript:
                    # Send transcription back to client
                    await websocket.send_json({
                        "type": "transcription",
                        "text": transcript,
                    })
                    
                    # Generate response
                    response_text = await generate_response(transcript, session_id)
                    
                    # Send response back
                    await websocket.send_json({
                        "type": "agent_message",
                        "text": response_text,
                    })
                    
                    # Generate audio for the response
                    try:
                        audio_data = await generate_audio_from_text(response_text)
                        # Convert audio data to base64 for sending over WebSocket
                        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                        
                        # Send audio response
                        await websocket.send_json({
                            "type": "audio_response",
                            "audio": audio_base64,
                            "format": "mp3"
                        })
                    except Exception as e:
                        logger.error(f"Failed to generate audio: {str(e)}")
                else:
                    # No transcription available
                    await websocket.send_json({
                        "type": "error",
                        "message": "Could not transcribe audio",
                    })
    
    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        # Clean up session
        if session_id in active_sessions:
            del active_sessions[session_id]
        if session_id in conversation_history:
            del conversation_history[session_id]

# Session cleanup task
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_inactive_sessions())

async def cleanup_inactive_sessions():
    """Periodically clean up inactive sessions."""
    while True:
        await asyncio.sleep(60)  # Check every minute
        current_time = asyncio.get_event_loop().time()
        
        # Find sessions inactive for more than 10 minutes
        inactive_sessions = [
            session_id for session_id, session_data in active_sessions.items()
            if current_time - session_data["last_activity"] > 600  # 10 minutes
        ]
        
        # Clean up inactive sessions
        for session_id in inactive_sessions:
            if session_id in active_sessions:
                del active_sessions[session_id]
            if session_id in conversation_history:
                del conversation_history[session_id]
            
            logger.info(f"Cleaned up inactive session: {session_id}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8003, reload=True)
