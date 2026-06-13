import os

import httpx
from fastapi import HTTPException


BACKEND_BASE_URL = os.getenv("SPRING_BACKEND_URL", "http://127.0.0.1:8080/api")


async def backend_request(method: str, path: str, *, token: str | None = None, json: dict | None = None, params: dict | None = None):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.request(
            method,
            f"{BACKEND_BASE_URL}{path}",
            headers=headers,
            json=json,
            params=params,
        )

    if response.is_success:
        if not response.content:
            return None
        return response.json()

    detail = response.text
    try:
        payload = response.json()
        if isinstance(payload, dict):
            detail = payload.get("message") or payload.get("error") or payload.get("detail") or detail
    except ValueError:
        pass

    raise HTTPException(status_code=response.status_code, detail=detail)
