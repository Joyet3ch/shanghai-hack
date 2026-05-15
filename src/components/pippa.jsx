import { Globe, ArrowRight } from 'lucide-react';

export default function Landing({ onNavigateToAuth }) {
  return (
    <div className="relative min-h-screen bg-slate-900 text-white overflow-hidden font-sans">
      
      {/* Sfondo semi-trasparente con gradiente */}
      <div className="absolute inset-0 z-0">
        <img 
          // Immagine segnaposto perfetta per il tema "Global/Tech"
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
          alt="Background" 
          className="w-full h-full object-cover opacity-30" 
        />
        {/* Questo gradiente rende il fondo più scuro per far leggere bene il testo */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/95"></div>
      </div>

      {/* Navbar superiore con il bottone Sign Up a destra */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Globe className="text-blue-500" size={28} />
          <span className="text-2xl font-bold tracking-tight">BridgeAI</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={onNavigateToAuth} 
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={onNavigateToAuth} 
            className="px-6 py-2.5 text-sm font-semibold bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Contenuto principale (Testo centrale) */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        
        {/* Badge Hackathon */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          Shanghai Hackathon 2026
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-tight">
          Scale to the West. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Powered by AI.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
          The ultimate Go-To-Market Co-Pilot for fast-growing Chinese startups. Navigate compliance, adapt to cultures, and dominate European and North American markets.
        </p>
        
        <button 
          onClick={onNavigateToAuth}
          className="group flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-100 transition-all hover:scale-105"
        >
          Start Your Journey
          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
        </button>
      </div>
    </div>
  );
}