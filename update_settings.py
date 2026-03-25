import os

path = 'backend/core/settings.py'
with open(path, 'r') as f:
    content = f.read()

target = "'REGISTER_SERIALIZER': 'apps.accounts.serializers.CustomRegisterSerializer',\n}"
replacement = "'REGISTER_SERIALIZER': 'apps.accounts.serializers.CustomRegisterSerializer',\n    'USER_DETAILS_SERIALIZER': 'apps.accounts.serializers.UserSerializer',\n}"

if target in content:
    new_content = content.replace(target, replacement)
    with open(path, 'w') as f:
        f.write(new_content)
    print("Settings updated successfully.")
else:
    # Try with CRLF
    target_crlf = target.replace('\n', '\r\n')
    replacement_crlf = replacement.replace('\n', '\r\n')
    if target_crlf in content:
        new_content = content.replace(target_crlf, replacement_crlf)
        with open(path, 'w') as f:
            f.write(new_content)
        print("Settings updated successfully (CRLF).")
    else:
        print("Target not found in settings.py.")
