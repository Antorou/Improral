import os
import aiofiles
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from audio_service import audio_service

app = FastAPI(title="Improral API", description="API pour l'application Improral", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autoriser tout pour le dev local. A restreindre en prod.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Improral API is healthy"}

@app.post("/api/upload-audio")
async def upload_audio(audio_file: UploadFile = File(...)):
    # Simuler la sauvegarde sur le volume partagé (RWX)
    file_path = os.path.join(UPLOAD_DIR, audio_file.filename)
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await audio_file.read()
        await out_file.write(content)
        
    # Transcription avec faster-whisper
    transcription_result = audio_service.transcribe(file_path)
        
    return {
        "status": "success", 
        "message": f"Fichier {audio_file.filename} analysé avec succès.", 
        "file_path": file_path,
        "transcription": transcription_result
    }
