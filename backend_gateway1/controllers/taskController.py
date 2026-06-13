from fastapi import APIRouter, Header, Request
from services.backend_api import backend_request
from services.mongo_event_sync import mark_event_deleted_in_mongo, sync_event_to_mongo

router = APIRouter(
    prefix="/events",
    tags=["Events"]
)


def get_token(authorization: str | None) -> str | None:
    return authorization.removeprefix("Bearer ").strip() if authorization else None


async def get_json_body(request: Request) -> dict:
    try:
        payload = await request.json()
    except ValueError:
        payload = {}
    return payload if isinstance(payload, dict) else {}


@router.get("/")
async def get_events(authorization: str | None = Header(default=None)):
    return await backend_request("GET", "/events", token=get_token(authorization))


@router.get("/upcoming")
async def get_upcoming_events(authorization: str | None = Header(default=None)):
    return await backend_request("GET", "/events/upcoming", token=get_token(authorization))


@router.get("/managed")
async def get_managed_events(authorization: str | None = Header(default=None)):
    return await backend_request("GET", "/events/managed", token=get_token(authorization))


@router.get("/search")
async def search_events(hashtag: str, authorization: str | None = Header(default=None)):
    return await backend_request("GET", "/events/search", token=get_token(authorization), params={"hashtag": hashtag})


@router.post("/")
async def create_event(request: Request, authorization: str | None = Header(default=None)):
    event = await backend_request(
        "POST",
        "/events",
        token=get_token(authorization),
        json=await get_json_body(request),
    )
    await sync_event_to_mongo(event)
    return event


@router.get("/registrations/me")
async def get_my_registrations(authorization: str | None = Header(default=None)):
    return await backend_request("GET", "/events/registrations/me", token=get_token(authorization))


@router.put("/registrations/{registration_id}/approve")
async def approve_registration(registration_id: int, authorization: str | None = Header(default=None)):
    return await backend_request(
        "PUT",
        f"/events/registrations/{registration_id}/approve",
        token=get_token(authorization),
    )


@router.put("/registrations/{registration_id}/reject")
async def reject_registration(registration_id: int, authorization: str | None = Header(default=None)):
    return await backend_request(
        "PUT",
        f"/events/registrations/{registration_id}/reject",
        token=get_token(authorization),
    )


@router.post("/register/{event_id}")
async def register_for_event(event_id: int, authorization: str | None = Header(default=None)):
    return await backend_request("POST", f"/events/register/{event_id}", token=get_token(authorization))


@router.get("/{event_id}")
async def get_event(event_id: int, authorization: str | None = Header(default=None)):
    return await backend_request("GET", f"/events/{event_id}", token=get_token(authorization))


@router.put("/{event_id}")
async def update_event(event_id: int, request: Request, authorization: str | None = Header(default=None)):
    event = await backend_request(
        "PUT",
        f"/events/{event_id}",
        token=get_token(authorization),
        json=await get_json_body(request),
    )
    await sync_event_to_mongo(event)
    return event


@router.delete("/{event_id}")
async def delete_event(event_id: int, authorization: str | None = Header(default=None)):
    result = await backend_request("DELETE", f"/events/{event_id}", token=get_token(authorization))
    await mark_event_deleted_in_mongo(event_id)
    return result


@router.put("/{event_id}/complete")
async def complete_event(event_id: int, authorization: str | None = Header(default=None)):
    event = await backend_request("PUT", f"/events/{event_id}/complete", token=get_token(authorization))
    await sync_event_to_mongo(event)
    return event


@router.put("/{event_id}/approve")
async def approve_event(event_id: int, authorization: str | None = Header(default=None)):
    event = await backend_request("PUT", f"/events/{event_id}/approve", token=get_token(authorization))
    await sync_event_to_mongo(event)
    return event


@router.put("/{event_id}/reject")
async def reject_event(event_id: int, authorization: str | None = Header(default=None)):
    event = await backend_request("PUT", f"/events/{event_id}/reject", token=get_token(authorization))
    await sync_event_to_mongo(event)
    return event


@router.post("/{event_id}/unregister")
async def unregister_for_event(event_id: int, authorization: str | None = Header(default=None)):
    return await backend_request("POST", f"/events/{event_id}/unregister", token=get_token(authorization))


@router.get("/{event_id}/registrations")
async def get_event_registrations(event_id: int, authorization: str | None = Header(default=None)):
    return await backend_request("GET", f"/events/{event_id}/registrations", token=get_token(authorization))
