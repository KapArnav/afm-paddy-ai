import requests
import json
import os

key = "AIzaSyBfvAPNSW0wziYSHnLsyP2-zPErqUeEIVw"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        models = response.json()
        print(json.dumps(models, indent=2))
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"FAILED: {e}")
