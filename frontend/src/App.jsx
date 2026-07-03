import { useState, useEffect } from 'react'
import CrayonEnBouche from './components/CrayonEnBouche'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => setHealth({ error: err.message }))
  }, [])

  return (
    <>
      <h1>Improral</h1>
      <div className="card">
        <h2>Backend Status:</h2>
        {health ? (
          health.error ? (
            <p style={{ color: 'red' }}>Error: {health.error}</p>
          ) : (
            <pre style={{ textAlign: 'left', background: '#333', padding: '1rem', borderRadius: '8px' }}>
              {JSON.stringify(health, null, 2)}
            </pre>
          )
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <CrayonEnBouche />
    </>
  )
}

export default App
