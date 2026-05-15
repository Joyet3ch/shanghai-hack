import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { toast } from 'sonner';
import { LayoutDashboard, Globe, Factory, Send, LogOut, Cpu, Zap, Car, Briefcase, Percent } from 'lucide-react';
import Auth from './components/Auth';
import Landing from './components/Landing';

function App() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [market, setMarket] = useState('Europe');
  const [industry, setIndustry] = useState('Robotics');
  const [prompt, setPrompt] = useState('');
  const [matches, setMatches] = useState(null); // Da "result" a "matches"

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuth(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt) return toast.error('Please describe your company and what you are looking for!');
    
    setLoading(true);
    toast.info('Scanning database for best B2B matches...');

    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ market, industry, prompt })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      setMatches(data); // Inseriamo i dati reali di Orbit AI nelle nostre Card!
      toast.success('Matches found!');

    } catch (error) {
      console.error(error);
      toast.error('Failed to communicate with the AI engine.');
    } finally {
      setLoading(false);
    }
  };

  if (!session && !showAuth) {
    return <Landing onNavigateToAuth={() => setShowAuth(true)} />;
  }

  if (!session && showAuth) {
    return (
      <div className="relative">
        <button onClick={() => setShowAuth(false)} className="absolute top-4 left-4 z-50 text-slate-500 hover:text-slate-800 font-medium">
          ← Back to Home
        </button>
        <Auth />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Briefcase size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">Bridge<span className="text-blue-600">Match</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 hidden sm:block">{session.user.email}</span>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors text-sm font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 lg:p-10">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Matchmaker Input */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <Globe size={18} className="text-blue-600" /> Target Market
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['Europe', 'North America'].map((m) => (
                  <button key={m} onClick={() => setMarket(m)} className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${market === m ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {m}
                  </button>
                ))}
              </div>

              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <Factory size={18} className="text-blue-600" /> Industry Sector
              </h2>
              <div className="space-y-2 mb-6">
                {[
                  { id: 'Robotics', icon: <Cpu size={16}/> },
                  { id: 'EV & Battery', icon: <Zap size={16}/> },
                  { id: 'Smart Mobility', icon: <Car size={16}/> }
                ].map((i) => (
                  <button key={i.id} onClick={() => setIndustry(i.id)} className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium border transition-all ${industry === i.id ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {i.icon} {i.id}
                  </button>
                ))}
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Company Pitch & Needs</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., We are a drone startup looking for local distributors and regulatory consultants..."
                  className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 text-sm resize-none"
                />
                <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:bg-slate-400 shadow-lg shadow-slate-200">
                  {loading ? 'Finding Matches...' : <><Send size={18} /> Find Partners</>}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Match Output */}
          <div className="lg:col-span-2">
            {!matches && !loading ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-4">
                  <Briefcase size={48} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Find your perfect B2B match</h3>
                <p className="text-slate-500 max-w-xs">Describe your startup and let AI find the best local partners to accelerate your GTM.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-500">
                {loading ? (
                  // Loading Skeletons
                  [1, 2, 3].map((n) => (
                    <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-32 animate-pulse flex items-center">
                      <div className="w-16 h-16 bg-slate-200 rounded-full mr-4"></div>
                      <div className="space-y-3 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Partner Cards
                  matches.map((match) => (
                    <div key={match.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-slate-800">{match.name}</h3>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full border border-slate-200">{match.type}</span>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">📍 {match.country}</p>
                        <p className="text-sm text-slate-700">{match.reason}</p>
                      </div>
                      <div className="flex sm:flex-col items-center gap-3 sm:min-w-[100px]">
                        <div className="flex flex-col items-center justify-center bg-green-50 text-green-700 px-4 py-2 rounded-xl border border-green-100 w-full">
                          <span className="text-xs font-semibold uppercase tracking-wider">Match</span>
                          <span className="text-xl font-bold flex items-center"><Percent size={16} className="mr-0.5"/>{match.score}</span>
                        </div>
                        <button className="w-full bg-slate-900 text-white text-sm font-semibold py-2 rounded-lg hover:bg-slate-800">
                          Connect
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;