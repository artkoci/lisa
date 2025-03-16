import os
import logging
from typing import Optional
import httpx
from deepgram import DeepgramClient, SpeakOptions, PrerecordedOptions

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DeepgramService:
    def __init__(self, api_key: str):
        """Initialize the Deepgram service with API key."""
        self.api_key = api_key
        self.client = DeepgramClient(api_key)

    async def generate_audio_from_text(self, text: str) -> bytes:
        """Generate audio from text using Deepgram."""
        try:
            text_payload = {"text": text}

            options = SpeakOptions(model="aura-asteria-en")

            url = "https://api.deepgram.com/v1/speak"
            headers = {
                "Authorization": f"Token {self.api_key}",
                "Content-Type": "application/json",
            }

            params = {"model": "aura-asteria-en"}

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url, json=text_payload, headers=headers, params=params
                )

                if response.status_code != 200:
                    logger.error(f"Deepgram TTS error: {response.text}")
                    raise Exception(f"TTS API error: {response.text}")

                return response.content
        except Exception as e:
            logger.error(f"Deepgram audio generation error: {str(e)}")
            raise Exception(f"Failed to generate audio: {str(e)}")

    async def transcribe_audio(self, audio_data: bytes, session_id: str) -> str:
        """Transcribe audio data using Deepgram."""
        try:
            options = PrerecordedOptions(
                model="nova-2",
                language="en",
                punctuate=True,
            )

            response = await self.client.listen.asyncrest.v("1").transcribe_file(
                {"buffer": audio_data, "mimetype": "audio/webm"}, options
            )

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
