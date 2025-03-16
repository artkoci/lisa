import asyncio
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

FIVE_MINUTES = 300
active_sessions: Dict[str, Dict[str, Any]] = {}


async def cleanup_inactive_sessions():
    """Periodically clean up inactive sessions."""
    while True:
        try:
            await asyncio.sleep(60)  # Check every minute
            current_time = asyncio.get_event_loop().time()

            inactive_sessions = [
                session_id
                for session_id, session_data in active_sessions.items()
                if current_time - session_data["last_activity"] > FIVE_MINUTES
            ]

            for session_id in inactive_sessions:
                if session_id in active_sessions:
                    del active_sessions[session_id]
                logger.info(f"Cleaned up inactive session: {session_id}")

        except Exception as e:
            logger.error(f"Error in cleanup task: {str(e)}")
            await asyncio.sleep(10)  # Wait before retrying
