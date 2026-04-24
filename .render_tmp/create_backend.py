import json
import os
import sys
import urllib.error
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


def request_json(api_key, method, url, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    request = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode()


def write(path, data):
    with open(path, 'w', encoding='utf-8') as handle:
        handle.write(data)


dotenv = load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
api_key = dotenv['RENDER_API_KEY']
workspace_id = 'tea-cst97f9u0jms73ei7i6g'
output_path = os.path.join(os.path.dirname(__file__), 'backend_result.json')

status, services = request_json(api_key, 'GET', 'https://api.render.com/v1/services')
if status != 200:
    write(output_path, json.dumps({'status': status, 'body': services}, indent=2))
    sys.exit(1)

existing = next((service for service in services if service.get('name') == 'talentha-backend'), None)
if existing:
    write(output_path, json.dumps({'status': 'exists', 'service': existing}, indent=2))
    sys.exit(0)

payload = {
    'type': 'web_service',
    'name': 'talentha-backend',
    'ownerId': workspace_id,
    'repo': 'https://github.com/David104087/Talentha.git',
    'branch': 'main',
    'rootDir': 'backend',
    'autoDeploy': 'yes',
    'serviceDetails': {
        'runtime': 'docker',
        'dockerContext': 'backend',
        'dockerfilePath': 'backend/Dockerfile',
    },
    'envVars': [
        {'key': 'DEBUG', 'value': 'False'},
        {'key': 'ALLOWED_HOSTS', 'value': '*'},
        {'key': 'CORS_ALLOWED_ORIGINS', 'value': '*'},
        {'key': 'OPENAI_API_KEY', 'value': dotenv['OPENAI_API_KEY']},
        {'key': 'DJANGO_SECRET_KEY', 'generateValue': True},
    ],
}
status, body = request_json(api_key, 'POST', 'https://api.render.com/v1/services', payload)
write(output_path, json.dumps({'status': status, 'body': body}, indent=2))
if status not in (200, 201):
    sys.exit(1)
