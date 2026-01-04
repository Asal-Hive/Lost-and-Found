import os
import django
import json
from django.contrib.auth import get_user_model
import sys
from pathlib import Path

# Configure these values
EMAIL = 'alirezamirrokni28@gmail.com'
NEW_PASSWORD = 'DevPass123!'

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
# ensure project root is on sys.path so 'server' package can be imported when running script directly
PROJECT_ROOT = str(Path(__file__).resolve().parents[1])
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
django.setup()

User = get_user_model()
user = User.objects.filter(email__iexact=EMAIL).first()
if not user:
    print('User not found:', EMAIL)
    raise SystemExit(1)

user.set_password(NEW_PASSWORD)
user.save()
print(f'Password set for {EMAIL}')

# quick test: use Django test client to obtain token
from django.test import Client
c = Client()
resp = c.post('/api/token/', data=json.dumps({'email': EMAIL, 'password': NEW_PASSWORD}), content_type='application/json', **{'HTTP_HOST': '127.0.0.1'})
print('token endpoint status:', resp.status_code)
try:
    print('response:', resp.json())
except Exception:
    print('response body:', resp.content.decode())
