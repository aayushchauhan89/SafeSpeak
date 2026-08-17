import os
from dotenv import load_dotenv
from google import genai

# Load the API key from .env
load_dotenv()

# Initialize the new SDK client
client = genai.Client()

print("\n--- Available Models for Your API Key ---")
try:
    # Print the name of every single model you are allowed to use
    for model in client.models.list():
        print(model.name)
except Exception as e:
    print(f"Error fetching models: {e}")