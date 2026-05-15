import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { toast } from 'sonner';
import { 
  Globe, 
  Factory, 
  Send, 
  LogOut, 
  Cpu, 
  Zap, 
  Car, 
  Briefcase, 
  Percent, 
  Mail, 
  ShieldCheck, 
  TrendingUp, 
  Search,
  MessageSquareQuote,
  LayoutDashboard,
  Calendar,
  BarChart3,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import Auth from './components/auth';
import Landing from './components/landing';
import RegisterPartner from './components/RegisterPartner'; // Assicurati di aver creato questo file!

function App() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    company_name: '',
    product_description: '',
    business_model: 'B2B',
    target_market: 'Europe',
    sector: 'Robotics',
    company_stage: 'Growth',
    biggest_concern: 'Compliance & Regulations'
  });

  const [matches, setMatches] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

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
    if (!formData.company_name || !formData.product_description) return toast.error('Complete the profile!');
    setLoading(true);
    setMatches(null);
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setMatches(data);
      toast.success('Hybrid Intelligence Report Ready');
    } catch (error) {
      toast.error('AI Intelligence Engine Timeout');
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
      setEmailContent(data.text);
    } catch (error) {
      toast.error("Generation failed");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  if (!session && !showAuth) return <Landing onNavigateToAuth={() => setShowAuth(true)} />;
  if (!session && showAuth) return (
    <div className="relative min-h-screen bg-white">
      <button onClick={() => setShowAuth(false)} className="absolute top-6 left-6 z-50 text-slate-400 font-black hover:text-slate-900 transition-colors">← BACK</button>
      <Auth />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {/* GLOBAL NAVIGATION CON TASTO REGISTER */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Briefcase size={22} /></div>
          <span className="text-2xl font-black tracking-tighter italic">BRIDGE<span className="text-blue-600">MATCH</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* IL TASTO WOW PER LE AZIENDE OCCIDENTALI */}
          <button 
            onClick={() => setIsRegisterOpen(true)}
            className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-5 py-2.5 rounded-2xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm"
          >
            <CheckCircle size={16} /> BECOME A PARTNER
          </button>
          
          <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-300 hover:text-red-500 transition-all">
            <LogOut size={22} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* SIDEBAR FORM */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-28">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-6 text-left">GTM Configurator</h2>
              <form onSubmit={handleGenerate} className="space-y-5 text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Company Identity</label>
                  <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none" placeholder="e.g. Shanghai AI" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Market</label>
                    <select value={formData.target_market} onChange={(e) => setFormData({...formData, target_market: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none">
                      <option>Europe</option><option>North America</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Stage</label>
                    <select value={formData.company_stage} onChange={(e) => setFormData({...formData, company_stage: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none">
                      <option>Growth</option><option>Early Seed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Strategic Sector</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Robotics', 'EV & Battery', 'Smart Mobility'].map(s => (
                      <button key={s} type="button" onClick={() => setFormData({...formData, sector: s})} className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-3 ${formData.sector === s ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}>
                        {s === 'Robotics' ? <Cpu size={14}/> : s === 'EV & Battery' ? <Zap size={14}/> : <Car size={14}/>} {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tech Description</label>
                  <textarea value={formData.product_description} onChange={(e) => setFormData({...formData, product_description: e.target.value})} className="w-full h-32 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none" placeholder="Describe your product..." />
                </div>
                <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95">
                  {loading ? 'ANALYSING MARKET...' : 'GENERATE HYBRID REPORT'}
                </button>
              </form>
            </div>
          </div>

          {/* DASHBOARD RISULTATI */}
          <div className="lg:col-span-8 space-y-10">
            {matches ? (
              <div className="animate-in fade-in zoom-in-95 duration-700 text-left">
                
                {/* SUMMARY CARD */}
                <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] mb-12 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <h3 className="text-5xl font-black tracking-tighter mb-4 leading-none">{matches.company_summary.name}</h3>
                      <p className="text-blue-400 font-bold text-xl italic italic">"{matches.company_summary.one_line_pitch}"</p>
                    </div>
                    <div className="text-center bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20">
                      <div className="text-5xl font-black text-blue-400 tracking-tighter">{matches.company_summary.market_readiness_score}%</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mt-1">{matches.company_summary.market_readiness_label}</div>
                    </div>
                  </div>
                </div>

                {/* ICP MATCHES CON BADGE VERIFIED */}
                <div className="mb-12">
                  <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3"><BarChart3 className="text-blue-600" /> Vetted Partner Matches</h3>
                  <div className="space-y-6">
                    {matches.icp_matches.map((match, idx) => (
                      <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-10 items-center hover:border-blue-400 transition-all relative overflow-hidden">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-4 mb-3">
                             <h4 className="font-black text-3xl text-slate-900 tracking-tight">{match.company_name}</h4>
                             
                             {/* IL BADGE DORATO PER I PARTNER REALI */}
                             {match.is_verified && (
                               <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-200 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                 <Zap size={12} fill="currentColor" /> VETTED PARTNER
                               </div>
                             )}

                             {match.website && (
                               <a href={match.website} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-full transition-all">
                                 <ExternalLink size={14} />
                               </a>
                             )}
                          </div>
                          <p className="text-sm font-bold text-blue-500 mb-5 tracking-wide uppercase">📍 {match.country} • {match.sector}</p>
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6 italic text-sm text-slate-600">
                             "{match.why_they_match}"
                          </div>
                          <div className="grid grid-cols-2 gap-6 text-[11px] font-bold text-slate-500">
                             <div><span className="text-[9px] font-black text-slate-300 uppercase block mb-1">Target Person</span>{match.decision_maker_title}</div>
                             <div><span className="text-[9px] font-black text-slate-300 uppercase block mb-1">Buying Trigger</span>{match.buying_trigger}</div>
                          </div>
                        </div>

                        {/* ANALYTICAL SCORES */}
                        <div className="w-full lg:w-48 flex flex-col gap-4 border-l border-slate-50 lg:pl-10">
                          <div className="bg-green-50 text-green-700 p-5 rounded-[2rem] border border-green-100 text-center">
                            <div className="text-3xl font-black flex items-center justify-center tracking-tighter"><Percent size={22} strokeWidth={4} />{match.scores.overall}</div>
                          </div>
                          
                          <div className="space-y-3 px-1">
                            {Object.entries(match.scores).map(([key, val]) => (
                              key !== 'overall' && (
                                <div key={key}>
                                  <div className="flex justify-between text-[8px] font-black uppercase text-slate-400 mb-1"><span>{key.replace('_', ' ')}</span><span>{val}/25</span></div>
                                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${(val/25)*100}%` }}></div></div>
                                </div>
                              )
                            ))}
                          </div>
                          <button onClick={() => generateEmail(match)} className="w-full bg-slate-900 text-white text-[10px] font-black py-4 rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest">CONNECT</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COMPETITORS & RISKS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="text-left">
                    <h3 className="text-2xl font-black text-slate-800 mb-6">Competitor Battlecards</h3>
                    <div className="space-y-4">
                      {matches.competitor_intelligence.map((comp, idx) => (
                        <div key={idx} className="bg-white p-7 rounded-[2.5rem] border-l-8 border-l-red-500 border border-slate-100 shadow-sm">
                           <div className="flex justify-between items-start mb-2"><h4 className="font-black text-lg">{comp.company_name}</h4><span className="text-[9px] font-black bg-red-50 text-red-600 px-2 py-1 rounded-md">{comp.threat_level}</span></div>
                           <p className="text-[11px] text-slate-400 font-bold mb-4 uppercase">{comp.country} • {comp.what_they_sell}</p>
                           <div className="bg-red-50/50 p-4 rounded-2xl text-xs font-bold text-red-900">Gap: {comp.weakness}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-black text-slate-800 mb-6">Risk Assessment Radar</h3>
                    <div className="space-y-4">
                      {matches.risk_assessment.map((risk, idx) => (
                        <div key={idx} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm">
                          <h4 className="text-sm font-black text-slate-800 uppercase mb-2">{risk.risk_title}</h4>
                          <p className="text-xs text-slate-500 leading-tight mb-4">{risk.description}</p>
                          <div className="bg-blue-50 p-3 rounded-xl text-[11px] font-bold text-blue-900 leading-tight">Fix: {risk.mitigation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200 text-center p-20 shadow-inner">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200 animate-bounce"><LayoutDashboard size={40} /></div>
                <h3 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Ready to Scale?</h3>
                <p className="text-slate-400 max-w-sm font-medium text-lg">Input your startup profile. Orbit AI GPT-5.4 will synthesize a complete GTM Hybrid Report.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODALE REGISTRAZIONE PARTNER (JOIN ECOSYSTEM) */}
      <RegisterPartner isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />

      {/* AI OUTREACH MODAL */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-10 border-b flex justify-between items-center bg-slate-50/50">
              <div className="text-left"><h3 className="text-2xl font-black text-slate-800 italic uppercase">Outreach Engine</h3><p className="text-[10px] font-black text-slate-400 uppercase">To: {selectedPartner.company_name}</p></div>
              <button onClick={() => setSelectedPartner(null)} className="text-slate-300 hover:text-slate-800 text-2xl font-bold">✕</button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 text-left">
              {isGeneratingEmail ? (
                <div className="space-y-4 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/4"></div><div className="h-24 bg-slate-50 rounded-3xl w-full"></div></div>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 leading-relaxed shadow-inner">{emailContent}</pre>
              )}
            </div>
            <div className="p-10 bg-slate-50 border-t flex gap-4">
              <button onClick={() => { navigator.clipboard.writeText(emailContent); toast.success("Draft copied!"); }} className="flex-1 bg-blue-600 text-white py-6 rounded-[1.5rem] font-black hover:bg-blue-700 shadow-xl active:scale-95 uppercase tracking-widest text-sm">COPY DRAFT</button>
              <button onClick={() => setSelectedPartner(null)} className="px-10 py-6 text-slate-400 font-black uppercase text-[10px]">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;