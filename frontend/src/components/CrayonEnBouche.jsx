import React, { useState } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

export default function CrayonEnBouche() {
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder();
  const [uploadStatus, setUploadStatus] = useState(null);
  const [transcription, setTranscription] = useState(null);

  const testText = "Les chaussettes de l'archiduchesse sont-elles sèches, archi-sèches ?";

  const handleUpload = async () => {
    if (!audioBlob) return;

    setUploadStatus('Analyse en cours (STT)...');
    setTranscription(null);
    const formData = new FormData();
    formData.append('audio_file', audioBlob, 'enregistrement.webm');

    try {
      const response = await fetch('http://localhost:8000/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse');
      }

      const data = await response.json();
      setUploadStatus(`Succès: ${data.message}`);
      if (data.transcription) {
        setTranscription(data.transcription.text);
      }
    } catch (error) {
      console.error(error);
      setUploadStatus(`Erreur: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', marginTop: '2rem' }}>
      <h2>Exercice: Crayon en bouche</h2>
      <p style={{ fontStyle: 'italic', color: '#666' }}>Lisez le texte suivant à voix haute (avec ou sans crayon) :</p>
      
      <blockquote style={{ fontSize: '1.5rem', margin: '2rem 0', background: '#f9f9f9', padding: '1rem', color: '#333' }}>
        "{testText}"
      </blockquote>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
        {!isRecording ? (
          <button onClick={startRecording} style={{ background: '#4caf50', color: 'white' }}>
            🔴 Démarrer l'enregistrement
          </button>
        ) : (
          <button onClick={stopRecording} style={{ background: '#f44336', color: 'white' }}>
            ⬛ Arrêter l'enregistrement
          </button>
        )}
      </div>

      {audioBlob && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#e0f7fa', borderRadius: '4px', color: '#006064' }}>
          <p>Audio capturé ({Math.round(audioBlob.size / 1024)} KB)</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <audio src={URL.createObjectURL(audioBlob)} controls />
            <button onClick={handleUpload} style={{ background: '#2196f3', color: 'white' }}>
              📤 Analyser la diction (IA)
            </button>
            <button onClick={() => { clearRecording(); setTranscription(null); setUploadStatus(null); }}>Effacer</button>
          </div>
        </div>
      )}

      {uploadStatus && (
        <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{uploadStatus}</p>
      )}

      {transcription && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff9c4', borderRadius: '8px', color: '#333', textAlign: 'left' }}>
          <h3>Transcription (Ce que l'IA a compris) :</h3>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>"{transcription}"</p>
        </div>
      )}
    </div>
  );
}
