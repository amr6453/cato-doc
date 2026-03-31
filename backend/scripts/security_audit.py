import requests
import json

BASE_URL = "http://localhost:8000/api"

def get_token(username, password):
    response = requests.post(f"{BASE_URL}/auth/login/", json={
        "username": username,
        "password": password
    })
    if response.status_code == 200:
        # dj-rest-auth with JWT usually returns access/refresh in the body or cookies
        # Based on settings.py, it's using JWTCookieAuthentication
        return response.cookies
    return None

def test_unauthorized_access():
    print("--- Starting Security Audit (Red Team Test) ---")
    
    # 1. Login as Patient 'amr66'
    print("\n[+] Testing Patient 'amr66' (ID: 15?)")
    cookies_amr66 = get_token("amr66", "Admin@123")
    if not cookies_amr66:
        print("[-] Failed to login as amr66")
        return

    # Attempt to cancel Patient 'test1''s appointment (ID: 21)
    print("[-] Attempting to cancel someone else's appointment (ID: 21)...")
    res = requests.patch(f"{BASE_URL}/appointments/21/cancel/", cookies=cookies_amr66)
    if res.status_code == 403:
        print("[OK] Access Denied (403 Forbidden) - Correct.")
    else:
        print(f"[FAIL] Unexpected status code: {res.status_code}. Expected 403.")
        if res.status_code == 200:
            print("[CRITICAL] Security vulnerability: Successfully modified someone else's data!")

    # 2. Login as Doctor 'Amr'
    print("\n[+] Testing Doctor 'Amr'")
    cookies_amr = get_token("Amr", "Admin@123")
    
    # Attempt to delete Doctor 'drsmith''s availability (ID: 14)
    print("[-] Attempting to delete another doctor's availability (ID: 14)...")
    res = requests.delete(f"{BASE_URL}/availabilities/14/", cookies=cookies_amr)
    if res.status_code == 403:
        print("[OK] Access Denied (403 Forbidden) - Correct.")
    else:
        print(f"[FAIL] Unexpected status code: {res.status_code}. Expected 403.")

    # 3. Profile Protection
    print("\n[+] Testing Profile Protection")
    # Attempt to modify another patient's profile (ID 1)
    print(f"[-] Attempting to modify another user's patient profile (ID: 1)...")
    res = requests.patch(f"{BASE_URL}/patients/1/", json={"phone_number": "999"}, cookies=cookies_amr66)
    if res.status_code == 403:
        print(f"[OK] Access Denied (403 Forbidden) - Correct.")
    else:
        print(f"[FAIL] Unexpected status code: {res.status_code}. Expected 403.")

    print("\n--- Security Audit Complete ---")

if __name__ == "__main__":
    test_unauthorized_access()
