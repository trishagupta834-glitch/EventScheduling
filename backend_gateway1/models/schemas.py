from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    name: str | None = None
    phoneNumber: str | None = ""
    role: str | None = "ROLE_USER"

class EventCreateRequest(BaseModel):
    title: str
    description: str
    scheduledDate: str
    eventType: str | None = None
    guestCount: int | None = None
    venue: str | None = None
    speaker: str | None = None
    hashtags: list[str] | None = None

class EventRegisterRequest(BaseModel):
    eventId: int
