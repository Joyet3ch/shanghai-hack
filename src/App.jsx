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

// Configurazione Endpoint Supabase Edge Function
const EDGE_FUNCTION_URL = 'https://trgrzufskkbkazprltub.supabase.co/functions/v1/match';

function App() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    product_description: '',
    target_market: 'Europe',
    sector: 'Robotics',
    company_stage: 'Early Seed'
  });

  const [matches, setMatches] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    supabase.auth.onAuthStateChange((_event, session) => setSession(session));
  }, []);

  // FUNZIONE CORE: Chiamata alla Edge Function di Supabase
  const callMatchEngine = async (type) => {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ ...formData, type })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Errore fase ${type}`);
    }
    return await response.json();
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.product_description) return toast.error('Dati mancanti!');
    
    setLoading(true);
    setMatches(null);
    
    try {
      // 1️⃣ STEP: SUMMARY (Identità)
      toast.info('Analisi AI: Generazione Profilo...');
      const data1 = await callMatchEngine('summary');
      setMatches({ 
        company_summary: data1.company_summary, 
        icp_matches: [], 
        competitor_intelligence: [], 
        risk_assessment: [] 
      });

      // 2️⃣ STEP: PARTNERS (Matchmaking)
      toast.success('Profilo creato! Ricerca Partner...');
      const data2 = await callMatchEngine('partners');
      setMatches(prev => ({ ...prev, icp_matches: data2.icp_matches || [] }));

      // 3️⃣ STEP: RISKS (Analisi Profonda)
      toast.info('Analisi Rischi e Competitor...');
      const data3 = await callMatchEngine('risks');
      setMatches(prev => ({ 
        ...prev, 
        competitor_intelligence: data3.competitor_intelligence || [], 
        risk_assessment: data3.risk_assessment || [] 
      }));

      toast.success('Report GTM Strategico Pronto!');
    } catch (error) {
      console.error(error);
      toast.error('Errore durante la generazione: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async (partner) => {
    setSelectedPartner(partner);
    setIsGeneratingEmail(true);
    setEmailContent(''); 
    try {
      // Nota: Questa può rimanere su Vercel (/api/email) o essere migrata come la precedente
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: partner.company_name,
          partnerType: partner.sector,
          industry: formData.sector,
          userPitch: formData.product_description
        })
      });
      const data = await response.json();
      setEmailContent(data.text || "Bozza generata con successo.");
    } catch (error) {
      toast.error("Errore Outreach Engine");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  if (!session && !showAuth) return <Landing onNavigateToAuth={() => setShowAuth(true)} />;
  if (!session && showAuth) return <Auth />;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 pb-20 font-sans">
      
      {/* NAVBAR */}
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Briefcase size={22} /></div>
          <span className="text-2xl font-black italic">BRIDGE<span className="text-blue-500">MATCH</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsRegisterOpen(true)} className="text-blue-400 font-black text-xs px-5 py-2.5 rounded-2xl border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all">
            BECOME A PARTNER
          </button>
          <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-500 hover:text-red-400 transition-all"><LogOut size={22} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* CONFIGURATOR SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-28">
              <h2 className="text-xl font-black uppercase tracking-tighter mb-6 text-left">GTM Configurator</h2>
              <form onSubmit={handleGenerate} className="space-y-5 text-left">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Company Identity</label>
                  <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" placeholder="es. Voltiq Energy" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Market</label>
                    <select value={formData.target_market} onChange={(e) => setFormData({...formData, target_market: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none">
                      <option>Europe</option><option>North America</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Stage</label>
                    <select value={formData.company_stage} onChange={(e) => setFormData({...formData, company_stage: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none">
                      <option>Early Seed</option><option>Growth</option><option>Series A+</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Strategic Sector</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Robotics', 'EV & Battery', 'Smart Mobility'].map(s => (
                      <button key={s} type="button" onClick={() => setFormData({...formData, sector: s})} className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-3 ${formData.sector === s ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                        {s === 'Robotics' ? <Cpu size={14}/> : s === 'EV & Battery' ? <Zap size={14}/> : <Car size={14}/>} {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Product Pitch</label>
                  <textarea value={formData.product_description} onChange={(e) => setFormData({...formData, product_description: e.target.value})} className="w-full h-32 p-4 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-medium text-white outline-none resize-none focus:border-blue-500" placeholder="Describe your technology..." />
                </div>

                <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-sm hover:bg-blue-500 transition-all shadow-xl disabled:opacity-50">
                  {loading ? 'ANALYZING...' : 'GENERATE HYBRID REPORT'}
                </button>
              </form>
            </div>
          </div>

          {/* DASHBOARD CONTENT */}
          <div className="lg:col-span-8 space-y-10">
            {matches ? (
              <div className="animate-in fade-in duration-1000 text-left">
                
                {/* HEADER SUMMARY */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 rounded-[3.5rem] mb-12 shadow-2xl flex justify-between items-center relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-5xl font-black tracking-tighter mb-4 leading-none">{matches.company_summary.name}</h3>
                    <p className="text-blue-100 font-bold text-xl italic opacity-90">"{matches.company_summary.one_line_pitch}"</p>
                    <div className="mt-6 inline-block bg-white/20 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">{matches.company_summary.market_readiness_label}</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20">
                    <div className="text-5xl font-black">{matches.company_summary.market_readiness_score}%</div>
                    <div className="text-[10px] font-black uppercase mt-1 opacity-60 tracking-widest">Match Score</div>
                  </div>
                </div>

                {/* PARTNERS */}
                <div className="mb-12">
                  <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><BarChart3 className="text-blue-500" /> Strategic Partners</h3>
                  {matches.icp_matches.length > 0 ? (
                    <div className="space-y-6">
                      {matches.icp_matches.map((match, idx) => (
                        <div key={idx} className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-sm flex flex-col lg:flex-row gap-10 items-center group hover:border-blue-500/50 transition-all">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                               <h4 className="font-black text-3xl text-white tracking-tight">{match.company_name}</h4>
                               {match.is_verified && <div className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">VETTED</div>}
                            </div>
                            <p className="text-sm font-bold text-blue-500 mb-5 tracking-wide uppercase">📍 {match.country} • {match.sector}</p>
                            <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 mb-6 italic text-sm text-slate-400">"{match.why_they_match}"</div>
                            <div className="grid grid-cols-2 gap-6 text-[10px] font-bold text-slate-500 uppercase">
                               <div><span className="text-slate-600 block mb-1">Decision Maker</span>{match.decision_maker_title}</div>
                               <div><span className="text-slate-600 block mb-1">Buying Trigger</span>{match.buying_trigger}</div>
                            </div>
                          </div>
                          <div className="w-full lg:w-48 flex flex-col gap-4 border-l border-slate-800 lg:pl-10 text-center">
                            <div className="bg-green-500/10 text-green-500 p-5 rounded-[2rem] border border-green-500/20">
                              <div className="text-3xl font-black tracking-tighter">%{match.scores.overall}</div>
                            </div>
                            <button onClick={() => generateEmail(match)} className="w-full bg-white text-slate-900 text-[10px] font-black py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all uppercase">CONNECT</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="p-12 border border-dashed border-slate-800 rounded-[3rem] text-slate-600 text-center">Identifying best matches via Supabase Edge...</div>}
                </div>

                {/* COMPETITORS & RISKS */}
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                    <h4 className="text-lg font-black text-white mb-6 uppercase tracking-tighter">Competitive Landscape</h4>
                    {matches.competitor_intelligence.length > 0 ? (
                      <div className="space-y-4">
                        {matches.competitor_intelligence.map((c, i) => (
                          <div key={i} className="p-5 bg-slate-800/50 rounded-2xl border border-slate-800">
                            <div className="flex justify-between items-center mb-2"><span className="font-black text-white">{c.company_name}</span><span className="text-[10px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded uppercase">{c.threat_level}</span></div>
                            <p className="text-xs text-slate-400 leading-relaxed"><span className="text-slate-500">Weakness:</span> {c.weakness}</p>
                          </div>
                        ))}
                      </div>
                    ) : <div className="text-slate-600 text-sm animate-pulse italic">Awaiting competitive analysis...</div>}
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
                    <h4 className="text-lg font-black text-white mb-6 uppercase tracking-tighter">Strategic Risk Radar</h4>
                    {matches.risk_assessment.length > 0 ? (
                      <div className="space-y-4">
                        {matches.risk_assessment.map((r, i) => (
                          <div key={i} className="p-5 bg-slate-800/50 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-2 mb-2 font-black text-amber-500 text-xs uppercase"><AlertTriangle size={14}/> {r.risk_title}</div>
                            <p className="text-xs text-slate-400 mb-3">{r.description}</p>
                            <div className="text-[10px] font-black text-blue-400 bg-blue-400/10 p-2 rounded-lg">Fix: {r.mitigation}</div>
                          </div>
                        ))}
                      </div>
                    ) : <div className="text-slate-600 text-sm animate-pulse italic">Awaiting risk assessment...</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-slate-800 text-center p-20">
                <LayoutDashboard size={60} className="text-slate-800 mb-8" />
                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Ready to Scale?</h3>
                <p className="text-slate-500 max-w-sm font-medium text-lg leading-relaxed">
                  Inserisci i dettagli della tua startup cinese. La nostra AI analizzerà il mercato occidentale tramite Edge Functions a bassa latenza.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <RegisterPartner isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />

      {/* OUTREACH ENGINE MODAL */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[3.5rem] border border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <div className="text-left"><h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Outreach Draft</h3><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">To: {selectedPartner.company_name}</p></div>
              <button onClick={() => setSelectedPartner(null)} className="text-slate-500 hover:text-white text-2xl">✕</button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 text-left">
              {isGeneratingEmail ? (
                <div className="space-y-4 animate-pulse"><div className="h-40 bg-slate-800/50 rounded-3xl w-full"></div></div>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 shadow-inner">{emailContent}</pre>
              )}
            </div>
            <div className="p-10 border-t border-slate-800 flex gap-4">
              <button onClick={() => { navigator.clipboard.writeText(emailContent); toast.success("Copied to clipboard!"); }} className="flex-1 bg-blue-600 text-white py-6 rounded-[1.5rem] font-black hover:bg-blue-500 transition-all uppercase tracking-widest text-sm">COPY DRAFT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;