import json
import os
import urllib.request


def load_dotenv(path):
    values = {}
    with open(path, 'r', encoding='utf-8') as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            values[key] = value
    return values


dotenv = load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
api_key = dotenv['RENDER_API_KEY']

request = urllib.request.Request(
    'https://api.render.com/v1/services',
    headers={
        'Authorization': f'Bearer {api_key}',
        'Accept': 'application/json',
    },
)
with urllib.request.urlopen(request, timeout=120) as response:
    services = json.loads(response.read().decode())

backend = next((s for s in services if s.get('name') == 'talentha-backend'), None)
if backend:
    with open(os.path.join(os.path.dirname(__file__), 'backend.json'), 'w') as f:
        json.dump(backend, f, indent=2)
