import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner' // <-- 1. Importa il Toaster

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* 2. Aggiungi il Toaster qui sotto, con i colori attivati */}
    <Toaster position="bottom-right" richColors /> 
  </StrictMode>,
)
