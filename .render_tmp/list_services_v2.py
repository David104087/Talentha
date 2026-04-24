import json, os, urllib.request, urllib.error

def get_services():
    # Load .env manually
    env_vars = {}
    if os.path.exists('.env'):
        with open('.env') as f:
            for line in f:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    env_vars[key] = value
    
    api_key = env_vars.get('RENDER_API_KEY')
    if not api_key:
        print("RENDER_API_KEY not found in .env")
        return

    req = urllib.request.Request(
        'https://api.render.com/v1/services?limit=20',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Accept': 'application/json',
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            services = json.loads(resp.read().decode())
            print(json.dumps(services, indent=2))
            
            # Also get the owner/workspace ID
            owner_req = urllib.request.Request(
                'https://api.render.com/v1/owners',
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Accept': 'application/json',
                }
            )
            with urllib.request.urlopen(owner_req) as owner_resp:
                owners = json.loads(owner_resp.read().decode())
                print("\nOWNERS:")
                print(json.dumps(owners, indent=2))
                
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code}")
        print(e.read().decode())

if __name__ == "__main__":
    get_services()
