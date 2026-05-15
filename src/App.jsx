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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.product_description) return toast.error('Completa il profilo aziendale!');
    
    setLoading(true);
    setMatches(null);
    
    try {
      // 1️⃣ CHIAMATA 1: SUMMARY
      toast.info('Analisi Identità Aziendale...');
      const r1 = await fetch('/api/match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'summary' })
      });
      const d1 = await r1.json();
      setMatches({ 
        company_summary: d1.company_summary, 
        icp_matches: [], 
        competitor_intelligence: [], 
        risk_assessment: [] 
      });

      // 2️⃣ CHIAMATA 2: PARTNER
      toast.success('Analisi completata! Estrazione Partner...');
      const r2 = await fetch('/api/match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'partners' })
      });
      const d2 = await r2.json();
      setMatches(prev => ({ ...prev, icp_matches: d2.icp_matches || [] }));

      // 3️⃣ CHIAMATA 3: RISCHI E COMPETITOR
      toast.success('Partner Trovati! Scansione Minacce...');
      const r3 = await fetch('/api/match', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type: 'risks' })
      });
      const d3 = await r3.json();
      setMatches(prev => ({ 
        ...prev, 
        competitor_intelligence: d3.competitor_intelligence || [], 
        risk_assessment: d3.risk_assessment || [] 
      }));

      toast.success('Report Hybrid GTM Pronto!');
    } catch (error) {
      toast.error('Il motore AI ha riscontrato un problema. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async (partner) => {
    setSelectedPartner(partner);
    setIsGeneratingEmail(true);
    setEmailContent(''); 
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: partner.company_name,
          partnerType: partner.sector,
          country: partner.country,
          industry: formData.sector,
          userPitch: formData.product_description
        })
      });
      const data = await response.json();
      setEmailContent(data.text || data.email || "Errore nella generazione del testo.");
    } catch (error) {
      toast.error("Errore generazione email");
      setEmailContent("Connessione all'Outreach Engine fallita.");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  if (!session && !showAuth) return <Landing onNavigateToAuth={() => setShowAuth(true)} />;
  if (!session && showAuth) return <Auth />;

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans text-slate-200 pb-20">
      
      {/* NAVBAR */}
      <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Briefcase size={22} /></div>
          <span className="text-2xl font-black tracking-tighter italic text-white">BRIDGE<span className="text-blue-500">MATCH</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsRegisterOpen(true)} className="hidden md:flex items-center gap-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all">
            <CheckCircle size={16} /> BECOME A PARTNER
          </button>
          <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-500 hover:text-red-400 transition-all"><LogOut size={22} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* SIDEBAR CONFIGURATOR */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl sticky top-28">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-6 text-left">GTM Configurator</h2>
              <form onSubmit={handleGenerate} className="space-y-5 text-left">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Company Identity</label>
                  <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" placeholder="es. Voltiq Energy Co." />
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
                      <option>Early Seed</option><option>Growth</option>
                    </select>
                  </div>
                </div>

                {/* CATEGORIE RIPRISTINATE */}
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
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tech Description</label>
                  <textarea value={formData.product_description} onChange={(e) => setFormData({...formData, product_description: e.target.value})} className="w-full h-32 p-4 rounded-2xl bg-slate-800 border border-slate-700 text-sm font-medium text-white outline-none resize-none" placeholder="Describe your technology and use case..." />
                </div>

                <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black text-sm hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50">
                  {loading ? 'ANALYZING...' : 'GENERATE HYBRID REPORT'}
                </button>
              </form>
            </div>
          </div>

          {/* DASHBOARD AREA */}
          <div className="lg:col-span-8 space-y-10">
            {matches ? (
              <div className="animate-in fade-in duration-700 text-left">
                
                {/* EXECUTIVE SUMMARY */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 rounded-[3.5rem] mb-12 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="max-w-md">
                      <h3 className="text-5xl font-black tracking-tighter mb-4 leading-none">{matches.company_summary.name}</h3>
                      <p className="text-blue-100 font-bold text-xl italic opacity-90">"{matches.company_summary.one_line_pitch}"</p>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20">
                      <div className="text-5xl font-black text-white tracking-tighter">{matches.company_summary.market_readiness_score}%</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mt-1">Market Readiness</div>
                    </div>
                  </div>
                </div>

                {/* ICP MATCHES */}
                <div className="mb-12">
                  <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3"><BarChart3 className="text-blue-500" /> Vetted Partner Matches</h3>
                  {matches.icp_matches.length > 0 ? (
                    <div className="space-y-6">
                      {matches.icp_matches.map((match, idx) => (
                        <div key={idx} className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 shadow-sm flex flex-col lg:flex-row gap-10 items-center relative overflow-hidden group">
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-4 mb-3">
                               <h4 className="font-black text-3xl text-white tracking-tight">{match.company_name}</h4>
                               {match.is_verified && (
                                 <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                                   <Zap size={12} fill="currentColor" /> VETTED
                                 </div>
                               )}
                            </div>
                            <p className="text-sm font-bold text-blue-500 mb-5 tracking-wide uppercase">📍 {match.country} • {match.sector}</p>
                            <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-800 mb-6 italic text-sm text-slate-400">"{match.why_they_match}"</div>
                            <div className="grid grid-cols-2 gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                               <div><span className="text-slate-600 block mb-1">Target Person</span>{match.decision_maker_title}</div>
                               <div><span className="text-slate-600 block mb-1">Buying Trigger</span>{match.buying_trigger}</div>
                            </div>
                          </div>

                          {/* MATCH MATRIX BREAKDOWN */}
                          <div className="w-full lg:w-48 flex flex-col gap-4 border-l border-slate-800 lg:pl-10">
                            <div className="bg-green-500/10 text-green-500 p-5 rounded-[2rem] border border-green-500/20 text-center">
                              <div className="text-3xl font-black flex items-center justify-center tracking-tighter"><Percent size={22} strokeWidth={4} />{match.scores.overall}</div>
                            </div>
                            <div className="space-y-3">
                              {['product_fit', 'market_readiness', 'strategic_value', 'accessibility'].map((key) => (
                                <div key={key}>
                                  <div className="flex justify-between text-[8px] font-black uppercase text-slate-500 mb-1"><span>{key.replace('_', ' ')}</span><span>{match.scores[key]}/25</span></div>
                                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(match.scores[key]/25)*100}%` }}></div></div>
                                </div>
                              ))}
                            </div>
                            {/* CONNECT BUTTON RICOLLEGATO */}
                            <button onClick={() => generateEmail(match)} className="w-full bg-white text-slate-900 text-[10px] font-black py-4 rounded-2xl hover:bg-blue-500 hover:text-white transition-all uppercase tracking-widest">CONNECT</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="p-10 border border-dashed border-slate-800 rounded-[2.5rem] text-slate-600 text-center text-sm animate-pulse">Extraction in progress...</div>}
                </div>

                {/* COMPETITORS E RISKS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="text-left">
                    <h3 className="text-2xl font-black text-white mb-6">Competitor Intelligence</h3>
                    {matches.competitor_intelligence.length > 0 ? (
                      <div className="space-y-4">
                        {matches.competitor_intelligence.map((comp, idx) => (
                          <div key={idx} className="bg-slate-900 p-7 rounded-[2.5rem] border-l-4 border-l-red-500 border border-slate-800">
                             <div className="flex justify-between items-start mb-2"><h4 className="font-black text-lg text-white">{comp.company_name}</h4><span className="text-[9px] font-black bg-red-500/10 text-red-500 px-2 py-1 rounded-md">{comp.threat_level}</span></div>
                             <p className="text-[11px] text-slate-500 font-bold mb-4 uppercase">{comp.country} • {comp.what_they_sell}</p>
                             <div className="bg-red-500/5 p-4 rounded-2xl text-xs font-bold text-red-200/70 border border-red-500/10">Gap: {comp.weakness}</div>
                          </div>
                        ))}
                      </div>
                    ) : <div className="p-10 border border-dashed border-slate-800 rounded-[2.5rem] text-slate-600 text-center text-sm">Caricamento analisi competitiva...</div>}
                  </div>

                  <div className="text-left">
                    <h3 className="text-2xl font-black text-white mb-6">Risk Assessment Radar</h3>
                    {matches.risk_assessment.length > 0 ? (
                      <div className="space-y-4">
                        {matches.risk_assessment.map((risk, idx) => (
                          <div key={idx} className="bg-slate-900 p-7 rounded-[2.5rem] border border-slate-800">
                            <h4 className="text-sm font-black text-white uppercase mb-2 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500"/> {risk.risk_title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">{risk.description}</p>
                            <div className="bg-blue-500/5 p-3 rounded-xl text-[11px] font-bold text-blue-400 border border-blue-500/10">Fix: {risk.mitigation}</div>
                          </div>
                        ))}
                      </div>
                    ) : <div className="p-10 border border-dashed border-slate-800 rounded-[2.5rem] text-slate-600 text-center text-sm">Caricamento valutazione rischi...</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-slate-800 text-center p-20">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-700"><LayoutDashboard size={40} /></div>
                <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Ready to Scale?</h3>
                <p className="text-slate-500 max-w-sm font-medium text-lg">Inserisci il profilo della startup. Il sistema caricherà progressivamente il report ibrido.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <RegisterPartner isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />

      {/* MODALE EMAIL RIPRISTINATO */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-[3.5rem] border border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <div className="text-left"><h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Outreach Engine</h3><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">To: {selectedPartner.company_name}</p></div>
              <button onClick={() => setSelectedPartner(null)} className="text-slate-500 hover:text-white text-2xl font-bold">✕</button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 text-left">
              {isGeneratingEmail ? (
                <div className="space-y-4 animate-pulse"><div className="h-4 bg-slate-800 rounded w-1/4"></div><div className="h-40 bg-slate-800/50 rounded-3xl w-full"></div></div>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 leading-relaxed shadow-inner">{emailContent}</pre>
              )}
            </div>
            <div className="p-10 border-t border-slate-800 flex gap-4">
              <button onClick={() => { navigator.clipboard.writeText(emailContent); toast.success("Copiato!"); }} className="flex-1 bg-blue-600 text-white py-6 rounded-[1.5rem] font-black hover:bg-blue-500 transition-all uppercase tracking-widest text-sm">COPY DRAFT</button>
              <button onClick={() => setSelectedPartner(null)} className="px-10 py-6 text-slate-500 font-black uppercase text-[10px] hover:text-white">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;