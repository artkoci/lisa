from deepgram import DeepgramClient, PrerecordedOptions, SpeakOptions
import logging
import httpx
import os

logger = logging.getLogger(__name__)

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
deepgram = DeepgramClient(api_key=DEEPGRAM_API_KEY)


async def generate_audio_from_text(text: str) -> bytes:
    """Generate audio from text using Deepgram."""
    try:
        text_payload = {"text": text}

        options = SpeakOptions(model="aura-asteria-en")

        url = "https://api.deepgram.com/v1/speak"
        headers = {
            "Authorization": f"Token {DEEPGRAM_API_KEY}",
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


async def transcribe_audio(audio_data: bytes, session_id: str) -> str:
    """Transcribe audio data using Deepgram."""
    try:
        options = PrerecordedOptions(
            model="nova-3",
            language="en",
            punctuate=True,
        )

        response = await deepgram.listen.asyncrest.v("1").transcribe_file(
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
