import requests
from dotenv import load_dotenv
import os
# Get the path to the directory this file is in
BASEDIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASEDIR, '.env'))


async def send_audio_to_hugging_face(audio):
    api_token = os.getenv("API_TOKEN")
    headers = {"Authorization": f"Bearer {api_token}"}
    API_URL = "https://api-inference.huggingface.co/models/bangla-speech-processing/BanglaASR"
    response = requests.post(API_URL, headers = headers, data=audio)
    return response.json()