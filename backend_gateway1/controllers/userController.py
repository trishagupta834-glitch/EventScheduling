from fastapi import APIRouter, Header, Query, Request
from services.backend_api import backend_request

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/me")
async def get_me(authorization: str | None = Header(default=None)):
    token = authorization.removeprefix("Bearer ").strip() if authorization else None
    return await backend_request("GET", "/profile/me", token=token)

@router.put("/me")
async def update_me(request: Request, authorization: str | None = Header(default=None)):
    token = authorization.removeprefix("Bearer ").strip() if authorization else None
    try:
        payload = await request.json()
    except ValueError:
        payload = {}

    if isinstance(payload, dict) and "user" in payload and isinstance(payload["user"], dict):
        payload = payload["user"]
    if not isinstance(payload, dict):
        payload = {}

    # Handle numeric role updates from frontend profile
    if "role" in payload:
        role_map = {"1": "ROLE_USER", "2": "ROLE_ADMIN", "3": "ROLE_MANAGER", 
                    1: "ROLE_USER", 2: "ROLE_ADMIN", 3: "ROLE_MANAGER"}
        if payload["role"] in role_map:
            payload["role"] = role_map[payload["role"]]

    editable_fields = {"name", "phoneNumber", "role"}
    update_payload = {}
    for key in editable_fields:
        value = payload.get(key)
        if value is not None:
            update_payload[key] = value

    return await backend_request("PUT", "/profile/me", token=token, json=update_payload)

@router.get("/analytics")
async def get_analytics(authorization: str | None = Header(default=None)):
    token = authorization.removeprefix("Bearer ").strip() if authorization else None
    return await backend_request("GET", "/profile/analytics", token=token)

@router.get("/admin-performance")
async def get_admin_performance(authorization: str | None = Header(default=None)):
    """Returns aggregate metrics (Approved, Rejected, Performance %) for all administrators."""
    token = authorization.removeprefix("Bearer ").strip() if authorization else None
    return await backend_request("GET", "/profile/admins/performance", token=token)

@router.get("/admin-reports/{admin_id}/pdf")
async def get_admin_report_pdf(admin_id: int, authorization: str | None = Header(default=None)):
    """Streams the detailed performance analysis PDF for a specific administrator."""
    token = authorization.removeprefix("Bearer ").strip() if authorization else None
    return await backend_request("GET", f"/profile/admins/{admin_id}/report/pdf", token=token)
