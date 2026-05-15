import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { toast } from 'sonner';
import { 
  Globe, LogOut, Cpu, Zap, Car, Briefcase, Percent, Mail, ShieldCheck, 
  BarChart3, CheckCircle, LayoutDashboard, AlertTriangle 
} from 'lucide-react';
import Auth from './components/auth';
import Landing from './components/landing';
import RegisterPartner from './components/RegisterPartner';

function App() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '', product_description: '', target_market: 'Europe', sector: 'Robotics'
  });

  const [matches, setMatches] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.product_description) return toast.error('Dati mancanti!');
    
    setLoading(true);
    setMatches(null);
    
    try {
      // 1. GENERAZIONE SUMMARY
      toast.info('Analisi Profilo...');
      const r1 = await fetch('/api/match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'summary' })
      });
      const d1 = await r1.json();
      setMatches({ company_summary: d1.company_summary, icp_matches: [], competitor_intelligence: [], risk_assessment: [] });

      // 2. GENERAZIONE PARTNER
      toast.info('Ricerca Partner...');
      const r2 = await fetch('/api/match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'partners' })
      });
      const d2 = await r2.json();
      setMatches(prev => ({ ...prev, icp_matches: d2.icp_matches }));

      // 3. GENERAZIONE RISCHI E COMPETITOR
      toast.info('Analisi Strategica...');
      const r3 = await fetch('/api/match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'risks' })
      });
      const d3 = await r3.json();
      setMatches(prev => ({ ...prev, competitor_intelligence: d3.competitor_intelligence, risk_assessment: d3.risk_assessment }));

      toast.success('Report Intelligence Pronto!');
    } catch (error) {
      toast.error('L\'AI ha riscontrato un rallentamento. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  if (!session && !showAuth) return <Landing onNavigateToAuth={() => setShowAuth(true)} />;
  if (!session && showAuth) return <Auth />;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200">
      {/* Navbar */}
      <nav className="bg-slate-900/50 border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white"><Briefcase size={22} /></div>
          <span className="text-2xl font-black italic">BRIDGE<span className="text-blue-500">MATCH</span></span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsRegisterOpen(true)} className="text-blue-400 font-black text-xs px-4 py-2 rounded-xl border border-blue-400/20 hover:bg-blue-600 hover:text-white transition-all">BECOME A PARTNER</button>
          <button onClick={() => supabase.auth.signOut()} className="text-slate-500 hover:text-red-400"><LogOut size={22} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 grid lg:grid-cols-12 gap-10">
        {/* Sidebar Configurator */}
        <aside className="lg:col-span-4">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-28">
            <h2 className="text-xl font-black uppercase mb-6 text-left">Configurator</h2>
            <form onSubmit={handleGenerate} className="space-y-5 text-left">
              <input type="text" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold outline-none" placeholder="Company Name" />
              <select value={formData.target_market} onChange={e => setFormData({...formData, target_market: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold outline-none">
                <option>Europe</option><option>North America</option>
              </select>
              <textarea value={formData.product_description} onChange={e => setFormData({...formData, product_description: e.target.value})} className="w-full h-32 p-4 rounded-2xl bg-slate-800 border border-slate-700 text-sm outline-none resize-none" placeholder="Tech description..." />
              <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-sm hover:bg-blue-500 transition-all shadow-xl disabled:opacity-50">
                {loading ? 'GENERATING...' : 'GENERATE HYBRID REPORT'}
              </button>
            </form>
          </div>
        </aside>

        {/* Dashboard Area */}
        <section className="lg:col-span-8">
          {matches ? (
            <div className="animate-in fade-in duration-700 text-left">
              {/* Summary */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-12 rounded-[3.5rem] mb-12 shadow-2xl flex justify-between items-center text-white">
                <div>
                  <h3 className="text-5xl font-black tracking-tighter mb-4 leading-none">{matches.company_summary.name}</h3>
                  <p className="font-bold text-xl italic opacity-90">"{matches.company_summary.one_line_pitch}"</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20 text-center">
                  <div className="text-5xl font-black">{matches.company_summary.market_readiness_score}%</div>
                  <div className="text-[10px] font-black uppercase mt-1">Readiness</div>
                </div>
              </div>

              {/* Partners List */}
              <div className="mb-12">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3"><BarChart3 className="text-blue-500" /> Vetted Partner Matches</h3>
                <div className="space-y-6">
                  {matches.icp_matches.map((match, idx) => (
                    <div key={idx} className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-sm flex flex-col lg:flex-row gap-10 items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h4 className="font-black text-3xl text-white">{match.company_name}</h4>
                          {match.is_verified && <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 text-[10px] font-black uppercase">VETTED</span>}
                        </div>
                        <p className="text-sm font-bold text-blue-500 mb-5 tracking-wide uppercase">📍 {match.country} • {match.sector}</p>
                        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 italic text-sm text-slate-400">"{match.why_they_match}"</div>
                      </div>
                      <div className="w-full lg:w-48 text-center border-l border-slate-800 pl-10 flex flex-col items-center">
                        <div className="bg-green-500/10 text-green-500 p-5 rounded-[2rem] border border-green-500/20 mb-4">
                          <div className="text-3xl font-black tracking-tighter">%{match.scores.overall}</div>
                        </div>
                        <button className="w-full bg-white text-slate-900 text-[10px] font-black py-4 rounded-2xl hover:bg-blue-500 hover:text-white transition-all uppercase">CONNECT</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competitors & Risks */}
              <div className="grid md:grid-cols-2 gap-10">
                <div className="bg-slate-900 p-7 rounded-[2.5rem] border border-slate-800">
                  <h4 className="font-black mb-4 uppercase">Competitive Intelligence</h4>
                  {matches.competitor_intelligence.map((c, i) => (
                    <div key={i} className="mb-4 p-4 bg-slate-800 rounded-2xl border-l-4 border-red-500">
                      <div className="font-black text-white">{c.company_name}</div>
                      <div className="text-xs text-slate-400">{c.what_they_sell}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900 p-7 rounded-[2.5rem] border border-slate-800">
                  <h4 className="font-black mb-4 uppercase">Risk Radar</h4>
                  {matches.risk_assessment.map((r, i) => (
                    <div key={i} className="mb-4 p-4 bg-slate-800 rounded-2xl">
                      <div className="font-black text-white text-sm uppercase flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500"/> {r.risk_title}</div>
                      <div className="text-xs text-slate-400 mt-1">{r.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-slate-800 text-center p-20">
              <h3 className="text-4xl font-black text-white mb-4">Ready to Scale?</h3>
              <p className="text-slate-500 max-w-sm">Inserisci il profilo. L'AI genererà il report a pezzi in tempo reale.</p>
            </div>
          )}
        </section>
      </main>

      <RegisterPartner isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  );
}

export default App;