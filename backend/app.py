
import os
import asyncio
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import health, websocket, tts
from .services.cleanup import cleanup_inactive_sessions
from .services.deepgram_service import DeepgramService
from .services.openai_service import OpenAIService


load_dotenv(".env.dev")


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    app = FastAPI(title="Voice Chat API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Initialize services
    deepgram_service = DeepgramService(os.getenv("DEEPGRAM_API_KEY"))
    openai_service = OpenAIService(os.getenv("OPENAI_API_KEY"))

    # Initialize routers with services
    tts.init_router(deepgram_service)
    websocket.init_router(deepgram_service, openai_service)

    # Include routers
    app.include_router(health.router)
    app.include_router(tts.router)
    app.include_router(websocket.router)

    return app


app = create_app()


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_inactive_sessions())


if __name__ == "__main__":
    import uvicorn
    import sys
    import pathlib

    root_dir = str(pathlib.Path(__file__).parent.parent.absolute())
    sys.path.append(root_dir)

    uvicorn.run("backend.app:app", host="0.0.0.0", port=8003, reload=True)
