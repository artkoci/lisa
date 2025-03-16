from fastapi import APIRouter, HTTPException, Response
import logging
from ..services.deepgram_service import DeepgramService

router = APIRouter(
    prefix="/tts",
    tags=["text-to-speech"]
)

logger = logging.getLogger(__name__)

# The service will be initialized in main.py and passed to the router
deepgram_service = None

def init_router(service: DeepgramService):
    """Initialize the router with required services."""
    global deepgram_service
    deepgram_service = service

@router.get("")
async def text_to_speech(text: str):
    """Convert text to speech using Deepgram."""
    try:
        # Generate audio from text using Deepgram service
        audio_data = await deepgram_service.generate_audio_from_text(text)
        
        # Return the audio as a response
        return Response(
            content=audio_data, 
            media_type="audio/mp3",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
    except Exception as e:
        logger.error(f"Deepgram TTS error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS error: {str(e)}")
