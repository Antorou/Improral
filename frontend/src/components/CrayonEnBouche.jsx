import React, { useState, useMemo } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { diffWords } from 'diff';

export default function CrayonEnBouche() {
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording } = useAudioRecorder();
  const [uploadStatus, setUploadStatus] = useState(null);
  const [transcription, setTranscription] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testText = "Les chaussettes de l'archiduchesse sont-elles sèches, archi-sèches ?";

  const handleUpload = async () => {
    if (!audioBlob) return;

    setIsLoading(true);
    setUploadStatus('Analyse en cours par l\'IA...');
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
      setUploadStatus(null);
      if (data.transcription) {
        setTranscription(data.transcription.text);
      }
    } catch (error) {
      console.error(error);
      setUploadStatus(`Erreur: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcul du diff
  const diffResult = useMemo(() => {
    if (!transcription) return null;
    
    // On nettoie la ponctuation pour la comparaison (simpliste)
    const cleanStr = (s) => s.toLowerCase().replace(/[.,?!]/g, '').trim();
    
    const diff = diffWords(cleanStr(testText), cleanStr(transcription));
    return diff;
  }, [testText, transcription]);

  return (
    <div className="max-w-3xl mx-auto mt-12 p-8 bg-dark-card rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-sm">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Exercice: Crayon en bouche</h2>
        <p className="text-slate-400 font-medium">Lisez le texte suivant à voix haute, avec ou sans crayon, pour tester votre articulation.</p>
      </div>
      
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-dark-accent to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <blockquote className="relative text-2xl md:text-3xl font-semibold text-center leading-relaxed text-slate-100 bg-slate-900/80 p-8 rounded-xl border border-slate-700/50">
          "{testText}"
        </blockquote>
      </div>

      <div className="mt-12 flex flex-col items-center gap-6">
        {!isRecording ? (
          <button 
            onClick={startRecording} 
            className="group relative flex items-center gap-3 px-8 py-4 bg-dark-accent hover:bg-sky-500 text-slate-900 font-bold rounded-full transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_30px_rgba(56,189,248,0.5)] transform hover:-translate-y-1"
          >
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            Démarrer l'enregistrement
          </button>
        ) : (
          <button 
            onClick={stopRecording} 
            className="relative flex items-center gap-3 px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold rounded-full transition-all"
          >
            <div className="relative w-4 h-4 recording-pulse">
              <div className="absolute inset-0 rounded-full bg-red-500"></div>
            </div>
            Arrêter l'enregistrement
          </button>
        )}

        {audioBlob && !isRecording && (
          <div className="w-full mt-4 p-6 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col items-center gap-6 animate-fade-in">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-slate-400 font-medium">Audio capturé • {Math.round(audioBlob.size / 1024)} KB</span>
              <button 
                onClick={() => { clearRecording(); setTranscription(null); setUploadStatus(null); }}
                className="text-sm text-slate-500 hover:text-red-400 transition-colors"
              >
                Effacer
              </button>
            </div>
            
            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full h-10 outline-none" />
            
            <button 
              onClick={handleUpload} 
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Analyser la diction
                </>
              )}
            </button>
          </div>
        )}

        {uploadStatus && (
          <div className="text-dark-accent font-medium mt-2 animate-pulse">
            {uploadStatus}
          </div>
        )}
      </div>

      {transcription && diffResult && (
        <div className="mt-10 animate-fade-in">
          <h3 className="text-lg font-semibold text-slate-300 mb-4 border-b border-slate-700 pb-2">Résultat de l'analyse</h3>
          
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700/50 shadow-inner mb-6">
            <p className="text-sm text-slate-500 mb-2 uppercase tracking-wider font-bold">Transcription brute</p>
            <p className="text-lg text-slate-300 italic">"{transcription}"</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-700/50 shadow-inner">
            <p className="text-sm text-slate-500 mb-4 uppercase tracking-wider font-bold">Comparaison détaillée</p>
            <div className="text-xl leading-relaxed font-medium">
              {diffResult.map((part, index) => {
                let colorClass = "text-slate-300";
                let decoration = "";
                
                if (part.added) {
                  // Mots en trop dits par l'utilisateur
                  colorClass = "text-red-400";
                  decoration = "line-through decoration-red-500/50 decoration-2";
                } else if (part.removed) {
                  // Mots manqués (devraient être là mais ne le sont pas) ou mots corrects (si on fait le diff inverse)
                  // Wait, "diffWords(expected, actual)" means:
                  // added: text is in "actual" but not "expected" -> extra word spoken (Red)
                  // removed: text is in "expected" but not "actual" -> missed word (Orange/Red)
                  // normal: word is in both -> correct (Green)
                  colorClass = "text-orange-400";
                  decoration = "underline decoration-orange-400/50 decoration-dashed underline-offset-4";
                } else {
                  colorClass = "text-emerald-400";
                }

                return (
                  <span key={index} className={`${colorClass} ${decoration} transition-colors duration-300`}>
                    {part.value}
                  </span>
                );
              })}
            </div>
            
            <div className="flex gap-6 mt-6 pt-4 border-t border-slate-800 text-xs font-semibold uppercase tracking-wider">
              <div className="flex items-center gap-2 text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400"></div>Correct</div>
              <div className="flex items-center gap-2 text-orange-400"><div className="w-2 h-2 rounded-full bg-orange-400"></div>Manquant</div>
              <div className="flex items-center gap-2 text-red-400"><div className="w-2 h-2 rounded-full bg-red-400"></div>En trop</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
