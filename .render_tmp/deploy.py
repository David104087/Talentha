import json
import os
import sys
import urllib.error
import urllib.request

def load_dotenv(path):
    values = {}
    with open(path, "r", encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key] = value
    return values


dotenv = load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
API_KEY = dotenv["RENDER_API_KEY"]
WORKSPACE_ID = "tea-cst97f9u0jms73ei7i6g"
OPENAI_API_KEY = dotenv["OPENAI_API_KEY"]

payload = {
    "type": "web_service",
    "name": "talentha-backend",
    "ownerId": WORKSPACE_ID,
    "repo": "https://github.com/David104087/Talentha.git",
    "branch": "main",
    "rootDir": "backend",
    "autoDeploy": "yes",
    "serviceDetails": {
        "runtime": "docker",
        "dockerContext": "backend",
        "dockerfilePath": "backend/Dockerfile",
    },
    "envVars": [
        {"key": "DEBUG", "value": "False"},
        {"key": "ALLOWED_HOSTS", "value": "*"},
        {"key": "CORS_ALLOWED_ORIGINS", "value": "*"},
        {"key": "OPENAI_API_KEY", "value": OPENAI_API_KEY},
        {"key": "DJANGO_SECRET_KEY", "generateValue": True},
    ],
}

request = urllib.request.Request(
    "https://api.render.com/v1/services",
    data=json.dumps(payload).encode(),
    method="POST",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
)

try:
    with urllib.request.urlopen(request, timeout=120) as response:
        backend = json.loads(response.read().decode())
except urllib.error.HTTPError as error:
    print(f"HTTP {error.code}")
    print(error.read().decode())
    sys.exit(1)

print(json.dumps(backend, indent=2))

backend_service = backend.get("service", backend)
backend_slug = backend_service.get("slug") or backend_service.get("name")
backend_url = f"https://{backend_slug}.onrender.com"
print(f"BACKEND_URL {backend_url}")

frontend_payload = {
    "type": "static_site",
    "name": "talentha-frontend",
    "ownerId": WORKSPACE_ID,
    "repo": "https://github.com/David104087/Talentha.git",
    "branch": "main",
    "rootDir": "frontend",
    "autoDeploy": "yes",
    "serviceDetails": {
        "staticPublishPath": "dist",
    },
    "envVars": [
        {"key": "VITE_API_BASE_URL", "value": backend_url},
    ],
}

frontend_request = urllib.request.Request(
    "https://api.render.com/v1/services",
    data=json.dumps(frontend_payload).encode(),
    method="POST",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
)

try:
    with urllib.request.urlopen(frontend_request, timeout=120) as response:
        print(json.dumps(json.loads(response.read().decode()), indent=2))
except urllib.error.HTTPError as error:
    print(f"FRONTEND HTTP {error.code}")
    print(error.read().decode())
    sys.exit(1)
