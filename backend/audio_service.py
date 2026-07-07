import os
from faster_whisper import WhisperModel

# Réglages d'environnement pour limiter le multithreading CPU en amont
os.environ["OMP_NUM_THREADS"] = "4"
os.environ["MKL_NUM_THREADS"] = "4"
os.environ["NUMEXPR_NUM_THREADS"] = "4"

class AudioService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AudioService, cls).__new__(cls)
            cls._instance._init_model()
        return cls._instance

    def _init_model(self):
        # Utilisation du modèle 'base' pour la vitesse sur CPU (int8)
        model_size = "base"
        print(f"Loading faster-whisper model '{model_size}' on CPU (int8) with 4 threads...")
        self.model = WhisperModel(
            model_size_or_path=model_size,
            device="cpu",
            compute_type="int8",
            cpu_threads=4
        )
        print("Model loaded successfully.")

    def transcribe(self, audio_path: str) -> dict:
        """
        Transcrit un fichier audio et retourne le texte complet.
        Dans une V2, on pourra aussi récupérer les timestamps par mot (word_timestamps=True).
        """
        segments, info = self.model.transcribe(audio_path, beam_size=5)
        
        text = ""
        for segment in segments:
            text += segment.text + " "
            
        return {
            "text": text.strip(),
            "language": info.language,
            "language_probability": info.language_probability
        }

# Singleton instance
audio_service = AudioService()
