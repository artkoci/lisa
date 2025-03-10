
# Voice Chat Backend

This is the FastAPI backend for the AI Voice Chat application. It uses OpenAI for language model capabilities and Deepgram for speech recognition.

## Setup

1. Install Python 3.8+ if not already installed
2. Install dependencies:

```bash
pip install fastapi uvicorn openai deepgram-sdk python-multipart websockets python-dotenv
```

3. Create a `.env` file in the backend directory with the following keys:

```
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
```

4. Run the server:

```bash
uvicorn main:app --reload
```

The server will be running at http://localhost:8000

## API Endpoints

- WebSocket: `/ws` - Main WebSocket endpoint for voice communication
- HTTP: `/health` - Health check endpoint
