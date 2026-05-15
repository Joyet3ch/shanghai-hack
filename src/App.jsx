import { useState } from 'react';
import { toast } from 'sonner';

function App() {
  const [inputDato, setInputDato] = useState('');
  const [rispostaIA, setRispostaIA] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const gestisciInvio = async (e) => {
    e.preventDefault();
    
    // Gestione errore: campo vuoto
    if (!inputDato) {
      toast.error('Per favore, scrivi qualcosa nel prompt!');
      return;
    }

    setIsLoading(true);
    
    // Notifica opzionale di caricamento
    toast.info('Sto analizzando la richiesta...');

    // MOCK DELLA CHIAMATA API
    setTimeout(() => {
      setRispostaIA(`Questa è una risposta simulata per: "${inputDato}". Quando avrai il tema dell'hackathon e la chiave API, sostituiremo questo timeout con la chiamata reale!`);
      setIsLoading(false);
      setInputDato('');
      
      // Notifica di successo
      toast.success('Risposta generata con successo!');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center font-sans">
      
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Hackathon Project</h1>
        <p className="text-gray-500">In attesa del tema ufficiale...</p>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
        
        {/* Output Area (Dove finirà la risposta di Orbit AI) */}
        <div className="min-h-[200px] bg-gray-100 rounded-lg p-4 mb-6 border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500 animate-pulse">
              L'IA sta elaborando...
            </div>
          ) : rispostaIA ? (
            <p className="text-gray-700 whitespace-pre-wrap">{rispostaIA}</p>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 italic">
              Il risultato apparirà qui
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={gestisciInvio} className="flex gap-4">
          <input
            type="text"
            value={inputDato}
            onChange={(e) => setInputDato(e.target.value)}
            placeholder="Scrivi qui il tuo prompt..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            Invia
          </button>
        </form>

      </main>
    </div>
  );
}

export default App;