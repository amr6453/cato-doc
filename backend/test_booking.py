import requests
import json
import socket
import time

BASE_URL = "http://localhost:8000/api"

def test_booking_flow():
    # 1. Login/Get Token
    unique_user = "booker_" + str(int(time.time()))
    reg_data = {
        "username": unique_user,
        "password": "testpassword123",
        "email": f"{unique_user}@example.com"
    }
    print(f"Registering user {unique_user}...")
    requests.post(f"{BASE_URL}/djoser/users/", json=reg_data)
    
    print("Logging in...")
    login_res = requests.post(f"{BASE_URL}/djoser/jwt/create/", json={
        "username": unique_user,
        "password": "testpassword123"
    })
    
    if login_res.status_code != 200:
        print("Login failed.")
        return
        
    token = login_res.json().get("access")
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get a Doctor ID
    print("Fetching doctors...")
    doctors = requests.get(f"{BASE_URL}/doctors/").json()
    if not doctors:
        print("No doctors found.")
        return
    doctor_id = doctors[0]['id']
    print(f"Using Doctor ID: {doctor_id}")

    # 3. Check current availability
    print(f"Fetching availability for doctor {doctor_id}...")
    avail_res = requests.get(f"{BASE_URL}/doctors/{doctor_id}/availability/")
    availabilities = avail_res.json()
    print(f"Found {len(availabilities)} available slots.")

    if not availabilities:
        print("No available slots for this doctor. Please add some via admin or management command.")
        # Attempt to create one manually if we have permissions? ViewSet is ReadOnly.
        # We might need to use a management command or a script to add availability.
        return

    slot = availabilities[0]
    date = slot['date']
    time_slot = slot['start_time']
    print(f"Attempting to book slot: {date} at {time_slot}")

    # 4. Book Appointment
    booking_data = {
        "doctor": doctor_id,
        "date": date,
        "time_slot": time_slot
    }
    
    print("Sending booking request...")
    book_res = requests.post(f"{BASE_URL}/appointments/", json=booking_data, headers=headers)
    
    if book_res.status_code == 201:
        print("SUCCESS: Appointment created!")
        
        # 5. Verify availability is gone
        print("Verifying slot is now unavailable...")
        avail_res_after = requests.get(f"{BASE_URL}/doctors/{doctor_id}/availability/").json()
        
        found = any(a['date'] == date and a['start_time'] == time_slot for a in avail_res_after)
        if not found:
            print("SUCCESS: Slot is no longer listed in availability.")
        else:
            print("FAILURE: Slot is still available after booking.")
    else:
        print(f"FAILURE: Booking failed with status {book_res.status_code}")
        print(book_res.text)

if __name__ == "__main__":
    test_booking_flow()
