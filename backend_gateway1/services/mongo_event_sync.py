import os

import httpx


MONGO_EVENT_SERVICE_URL = os.getenv("MONGO_EVENT_SERVICE_URL", "http://127.0.0.1:8091")


async def sync_event_to_mongo(event: dict | None) -> bool:
    if not isinstance(event, dict) or event.get("id") is None:
        return False

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(f"{MONGO_EVENT_SERVICE_URL}/events/sync", json=event)
            response.raise_for_status()
        return True
    except httpx.HTTPError:
        return False


async def mark_event_deleted_in_mongo(event_id: int) -> bool:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.delete(f"{MONGO_EVENT_SERVICE_URL}/events/{event_id}")
            response.raise_for_status()
        return True
    except httpx.HTTPError:
        return False
