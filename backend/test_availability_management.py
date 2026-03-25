import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"

def test_bulk_create():
    # Login as doctor
    login_data = {"username": "doctor1", "password": "password123"}
    session = requests.Session()
    response = session.post(f"{BASE_URL}/auth/login/", json=login_data)
    
    if response.status_code != 200:
        print("Login failed")
        return

    # Bulk create data
    today = datetime.now().date()
    dates = [(today + timedelta(days=i)).isoformat() for i in range(1, 4)]
    start_times = ["09:00:00", "10:00:00", "11:00:00"]
    
    payload = {
        "dates": dates,
        "start_times": start_times,
        "duration_minutes": 45
    }
    
    response = session.post(f"{BASE_URL}/appointments/availabilities/bulk-create/", json=payload)
    print(f"Bulk Create Status: {response.status_code}")
    print(f"Response: {response.json()}")

    # List availabilities
    response = session.get(f"{BASE_URL}/appointments/availabilities/")
    print(f"List Availabilities Status: {response.status_code}")
    print(f"Count: {len(response.json())}")

if __name__ == "__main__":
    test_bulk_create()
