from fastapi import FastAPI
from controllers.authenticationController import router as auth_router
from controllers.taskController import router as task_router
from controllers.userController import router as user_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="BACKEND_GATEWAY1",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(task_router)
app.include_router(user_router)

@app.get("/")
def home():
    return {
        "message": "BACKEND_GATEWAY1 Running"
    }
