import React, { useState, useRef } from 'react';

export default function ShadowTalk() {
  const [mediaFile, setMediaFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setMediaFile(e.target.files[0]);
      setTranscription(null);
      setUploadStatus(null);
    }
  };

  const handleUpload = async () => {
    if (!mediaFile) return;

    setIsLoading(true);
    setUploadStatus('Extraction audio (FFmpeg) et analyse (Whisper)...');
    setTranscription(null);
    
    const formData = new FormData();
    formData.append('audio_file', mediaFile, mediaFile.name);

    try {
      const response = await fetch('http://localhost:8000/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse');
      }

      const data = await response.json();
      setUploadStatus('Analyse terminée avec succès !');
      if (data.transcription) {
        setTranscription(data.transcription);
      }
    } catch (error) {
      console.error(error);
      setUploadStatus(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    return new Date(seconds * 1000).toISOString().substring(14, 22);
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-dark-card rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Mode: Shadow Talk (Karaoké)</h2>
        <p className="text-slate-400 font-medium">Uploadez un fichier vidéo ou audio. L'IA va en extraire le texte et générer le minutage exact mot par mot.</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* Upload Box */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-40 border-2 border-dashed border-slate-600 hover:border-dark-accent rounded-xl bg-slate-900/50 flex flex-col items-center justify-center cursor-pointer transition-colors group"
        >
          <svg className="w-10 h-10 text-slate-500 group-hover:text-dark-accent mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          <p className="text-slate-300 font-semibold">Cliquez pour sélectionner un fichier média</p>
          <p className="text-slate-500 text-sm mt-1">MP4, MP3, WAV, WEBM...</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="video/*,audio/*" 
          />
        </div>

        {mediaFile && (
          <div className="w-full p-4 bg-slate-800 rounded-lg flex items-center justify-between border border-slate-700">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              <div>
                <p className="text-slate-200 font-medium">{mediaFile.name}</p>
                <p className="text-slate-500 text-sm">{(mediaFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            
            <button 
              onClick={handleUpload} 
              disabled={isLoading}
              className="px-6 py-2 bg-dark-accent hover:bg-sky-500 text-slate-900 font-bold rounded-lg shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Extraction...
                </>
              ) : "Lancer le STT"}
            </button>
          </div>
        )}

        {uploadStatus && (
          <div className="text-dark-accent font-medium mt-2 animate-pulse">
            {uploadStatus}
          </div>
        )}
      </div>

      {transcription && transcription.words && (
        <div className="mt-10 animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-300 mb-4 border-b border-slate-700 pb-2">Timestamps (Word-Level)</h3>
          
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700/50 shadow-inner max-h-96 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {transcription.words.map((w, index) => (
                <div key={index} className="group relative bg-slate-800 hover:bg-dark-accent hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg border border-slate-700 hover:border-dark-accent cursor-default">
                  <span className="font-medium">{w.word}</span>
                  {/* Tooltip with exact timing */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {formatTime(w.start)} - {formatTime(w.end)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500 text-center italic">
            Survolez un mot pour voir son timestamp exact.
          </div>
        </div>
      )}
    </div>
  );
}
