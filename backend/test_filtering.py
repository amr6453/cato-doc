import requests
import sys

BASE_URL = "http://localhost:8000/api"

def test_filtering():
    print("Fetching all doctors...")
    try:
        response = requests.get(f"{BASE_URL}/doctors/")
        if response.status_code != 200:
            print(f"Failed to fetch doctors: {response.status_code}")
            return
        
        doctors = response.json()
        if not doctors:
            print("No doctors found in the database. Cannot test filtering.")
            return
        
        # Pick the specialization of the first doctor
        first_doctor = doctors[0]
        spec = first_doctor.get('specialization')
        if not spec:
            print("First doctor has no specialization. Cannot test filtering.")
            return
        
        spec_id = spec.get('id')
        spec_name = spec.get('name')
        print(f"Filtering by specialization: {spec_name} (ID: {spec_id})")
        
        filter_url = f"{BASE_URL}/doctors/?specialization={spec_id}"
        print(f"Testing {filter_url}...")
        response = requests.get(filter_url)
        
        if response.status_code != 200:
            print(f"Filter request failed: {response.status_code}")
            return
        
        filtered_doctors = response.json()
        print(f"Found {len(filtered_doctors)} doctors.")
        
        for d in filtered_doctors:
            d_spec = d.get('specialization')
            if d_spec.get('id') != spec_id:
                print(f"FAILURE: Doctor {d.get('id')} has specialization {d_spec.get('id')}, expected {spec_id}")
                return
        
        print("SUCCESS: All filtered doctors have the correct specialization!")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_filtering()
