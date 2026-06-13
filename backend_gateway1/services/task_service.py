import requests
from config.task_service import SPRING_BOOT_URL
SPRING_BOOT_URL = "http://localhost:8080/api/events"

def get_all_tasks(event_type=None):
    params = {"type": event_type} if event_type else {}
    response = requests.get(SPRING_BOOT_URL, params=params)

    return response.json()

def create_task(task):

    response = requests.post(
        SPRING_BOOT_URL,
        json=task
    )

    return response.json()