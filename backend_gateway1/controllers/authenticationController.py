from fastapi import APIRouter
from models.schemas import LoginRequest, RegisterRequest
from services.backend_api import backend_request

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/login")
async def login(data: LoginRequest):
    auth_data = await backend_request(
        "POST",
        "/auth/signin",
        json={"username": data.email, "password": data.password},
    )
    profile = await backend_request("GET", "/profile/me", token=auth_data["token"])

    return {
        "message": "Login Successful",
        "token": auth_data["token"],
        "user": profile,
    }

@router.post("/register")
async def register(data: RegisterRequest):
    # Map numeric roles to backend Enum strings
    role_map = {
        "1": "ROLE_USER", 1: "ROLE_USER",
        "2": "ROLE_ADMIN", 2: "ROLE_ADMIN",
        "3": "ROLE_MANAGER", 3: "ROLE_MANAGER"
    }
    # Use numeric mapping if provided, otherwise default to ROLE_USER
    target_role = role_map.get(int(data.role) if str(data.role).isdigit() else 0, data.role or "ROLE_USER")

    viewer_payload = {
        "username": data.email,  # Aligning username with email as used in the login process
        "email": data.email,
        "password": data.password,
        "name": data.name or data.username,
        "phoneNumber": getattr(data, 'phoneNumber', ""),
        "role": target_role,
    }
    created_viewer = await backend_request("POST", "/auth/signup", json=viewer_payload)
    auth_data = await backend_request(
        "POST",
        "/auth/signin",
        json={"username": data.email, "password": data.password},
    )
    profile = await backend_request("GET", "/profile/me", token=auth_data["token"])

    return {
        "message": "Viewer Registered",
        "token": auth_data["token"],
        "user": profile,
        "createdViewerId": created_viewer.get("id") if created_viewer else None,
    }
