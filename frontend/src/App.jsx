import { useState, useEffect } from 'react'
import CrayonEnBouche from './components/CrayonEnBouche'
import ShadowTalk from './components/ShadowTalk'

function App() {
  const [health, setHealth] = useState(null)
  const [currentTab, setCurrentTab] = useState('crayon') // 'crayon' or 'shadow'

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setHealth({ error: err.message }))
  }, [])

  return (
    <div className="min-h-screen bg-dark-bg text-slate-200 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-dark-accent to-purple-500 tracking-tight">
            Improral
          </h1>
          <p className="mt-2 text-sm text-slate-400 font-medium tracking-wide">AMÉLIOREZ VOTRE EXPRESSION ORALE</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">API Status</div>
          {health ? (
            health.error ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 text-sm font-bold shadow-sm">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                Offline
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 text-sm font-bold shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Online
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-sm font-bold">
              <svg className="animate-spin h-3 w-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="flex justify-center gap-4 mb-8">
          <button 
            onClick={() => setCurrentTab('crayon')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${currentTab === 'crayon' ? 'bg-dark-accent text-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            🖊️ Crayon en bouche
          </button>
          <button 
            onClick={() => setCurrentTab('shadow')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${currentTab === 'shadow' ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            🎤 Shadow Talk
          </button>
        </div>

        {currentTab === 'crayon' && <CrayonEnBouche />}
        {currentTab === 'shadow' && <ShadowTalk />}
      </main>
    </div>
  )
}

export default App
