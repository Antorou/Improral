import os
import aiofiles
import ffmpeg
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
    # 1. Sauvegarde du fichier brut (ex: webm, mp4, mp3)
    raw_file_path = os.path.join(UPLOAD_DIR, f"raw_{audio_file.filename}")
    
    async with aiofiles.open(raw_file_path, 'wb') as out_file:
        content = await audio_file.read()
        await out_file.write(content)
        
    # 2. Extraction et normalisation audio avec FFmpeg (16kHz, mono, wav)
    wav_file_path = os.path.join(UPLOAD_DIR, f"normalized_{audio_file.filename}.wav")
    try:
        (
            ffmpeg
            .input(raw_file_path)
            .output(wav_file_path, ac=1, ar='16000', format='wav', loglevel='error')
            .overwrite_output()
            .run()
        )
    except ffmpeg.Error as e:
        return {"status": "error", "message": "Erreur lors de l'extraction audio."}
        
    # 3. Transcription avec faster-whisper (qui retourne maintenant les timestamps)
    transcription_result = audio_service.transcribe(wav_file_path)
        
    return {
        "status": "success", 
        "message": f"Fichier analysé avec succès.", 
        "file_path": wav_file_path,
        "transcription": transcription_result
    }
