import requests
import json
import socket

# Try to connect to the local server to see if it's up
BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(name, method, url, data=None, headers=None):
    print(f"\nTesting {name}...")
    try:
        if method == "POST":
            response = requests.post(url, json=data, headers=headers)
        else:
            response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response Body: {response.text}")
        return response
    except Exception as e:
        print(f"Error testing {name}: {e}")
        return None

# 1. Test Registration
print("\n--- 1. Registration ---")
# Using a likely unique username
unique_user = "testuser_" + str(socket.gethostname())
reg_data = {
    "username": unique_user,
    "password": "testpassword123",
    "email": f"{unique_user}@example.com"
}
test_endpoint("Registration", "POST", f"{BASE_URL}/api/djoser/users/", data=reg_data)

# 2. Test Login
print("\n--- 2. Login ---")
login_data = {
    "username": unique_user,
    "password": "testpassword123"
}
login_res = test_endpoint("Login", "POST", f"{BASE_URL}/api/djoser/jwt/create/", data=login_data)

if login_res and login_res.status_code == 200:
    token = login_res.json().get("access")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Test Profile
    test_endpoint("Profile", "GET", f"{BASE_URL}/api/djoser/users/me/", headers=headers)
else:
    print("\nSkipping Profile test due to Login failure.")

# 4. Test Schema
test_endpoint("Schema", "GET", f"{BASE_URL}/api/schema/")
