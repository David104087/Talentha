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
API_KEY = dotenv['RENDER_API_KEY']
request = urllib.request.Request(
    'https://api.render.com/v1/services',
    headers={
        'Authorization': f'Bearer {API_KEY}',
        'Accept': 'application/json',
    },
)
with urllib.request.urlopen(request, timeout=120) as response:
    body = json.loads(response.read().decode())
for service in body:
    if service.get('name') == 'talentha-backend':
        print(json.dumps(service, indent=2))
