from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from hugging_face import *
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
async def read_root():
    return {'message': 'FastAPI server running'}


@app.post('/upload')
async def read_audio(audio_file: UploadFile = File(...)):
    if not audio_file.filename.endswith(('.mp3', '.wav', '.ogg')):
         raise HTTPException(status_code=406, detail='Only .mp3, .wav, and .ogg formats are allowed.')  
    
    contents = await audio_file.read()

    response = await send_audio_to_hugging_face(contents)


    return response