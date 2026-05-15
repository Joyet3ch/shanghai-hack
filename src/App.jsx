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
  MessageSquareQuote
} from 'lucide-react';
import Auth from './components/auth';
import Landing from './components/landing';

function App() {
  // --- STATI DI AUTENTICAZIONE ---
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // --- NUOVO STATO ENTERPRISE FORM DATA ---
  const [formData, setFormData] = useState({
    company_name: '',
    product_description: '',
    business_model: 'B2B',
    target_market: 'Europe',
    sector: 'Robotics',
    company_stage: 'Growth',
    biggest_concern: 'Compliance & Regulations'
  });

  // --- STATI PER RISULTATI E EMAIL ---
  const [matches, setMatches] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  // --- GESTIONE SESSIONE SUPABASE ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- LOGICA GENERAZIONE REPORT INTELLIGENCE ---
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.product_description) {
      return toast.error('Please fill in Company Name and Description!');
    }
    
    setLoading(true);
    setMatches(null);
    
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setMatches(data);
      toast.success('GTM Intelligence Report Generated');
    } catch (error) {
      console.error(error);
      toast.error('Intelligence Engine error. Check API Key.');
    } finally {
      setLoading(false);
    }
  };

  // --- LOGICA GENERAZIONE EMAIL DI OUTREACH ---
  const generateEmail = async (partner) => {
    setSelectedPartner(partner);
    setIsGeneratingEmail(true);
    setEmailContent(''); 

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: partner.name,
          partnerType: partner.type,
          country: partner.country,
          industry: formData.sector,
          userPitch: formData.product_description
        })
      });

      const data = await response.json();
      setEmailContent(data.text);
    } catch (error) {
      toast.error("Outreach generation failed");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // --- ROUTING LANDING / AUTH ---
  if (!session && !showAuth) return <Landing onNavigateToAuth={() => setShowAuth(true)} />;
  if (!session && showAuth) return (
    <div className="relative min-h-screen bg-slate-50">
      <button onClick={() => setShowAuth(false)} className="absolute top-6 left-6 z-50 text-slate-400 hover:text-slate-800 font-bold flex items-center gap-2">
        ← BACK
      </button>
      <Auth />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      {/* HEADER / NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <Briefcase size={22} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-800 italic">
            BRIDGE<span className="text-blue-600">MATCH</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right border-r border-slate-200 pr-6">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Operator</p>
            <p className="text-xs font-bold text-slate-600">{session.user.email}</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={22} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* COLONNA SINISTRA: ENTERPRISE FORM (4/12) */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-28">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Market Intel</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Orbit AI GPT-5.4 Live</p>
                </div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-6 text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Company Name</label>
                  <input 
                    type="text" 
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="e.g. Shanghai Tech"
                    className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Market</label>
                    <select 
                      value={formData.target_market}
                      onChange={(e) => setFormData({...formData, target_market: e.target.value})}
                      className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none cursor-pointer hover:bg-slate-100"
                    >
                      <option>Europe</option>
                      <option>North America</option>
                      <option>Middle East</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Stage</label>
                    <select 
                      value={formData.company_stage}
                      onChange={(e) => setFormData({...formData, company_stage: e.target.value})}
                      className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none cursor-pointer"
                    >
                      <option>Early Seed</option>
                      <option>Growth</option>
                      <option>Series A/B</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Strategic Sector</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Robotics', 'EV & Battery', 'Smart Mobility'].map((s) => (
                      <button 
                        key={s} type="button"
                        onClick={() => setFormData({...formData, sector: s})}
                        className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-3 ${formData.sector === s ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                      >
                        {s === 'Robotics' && <Cpu size={14}/>}
                        {s === 'EV & Battery' && <Zap size={14}/>}
                        {s === 'Smart Mobility' && <Car size={14}/>}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Main Challenge</label>
                  <select 
                    value={formData.biggest_concern}
                    onChange={(e) => setFormData({...formData, biggest_concern: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold outline-none"
                  >
                    <option>Compliance & Regulations</option>
                    <option>Local Distribution</option>
                    <option>IP Protection</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tech Description</label>
                  <textarea 
                    value={formData.product_description} 
                    onChange={(e) => setFormData({...formData, product_description: e.target.value})} 
                    placeholder="Describe your innovation..." 
                    className="w-full h-32 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                  />
                </div>

                <button 
                  disabled={loading} 
                  className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:bg-slate-300 active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? 'Synthesizing...' : <><Search size={18}/> Generate GTM Report</>}
                </button>
              </form>
            </div>
          </div>

          {/* COLONNA DESTRA: INTELLIGENCE OUTPUT (8/12) */}
          <div className="lg:col-span-8 space-y-6">
            {matches ? (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 text-left">
                <div className="flex items-center justify-between mb-8 px-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Strategic Partners</h3>
                    <p className="text-sm text-slate-400 font-medium italic">High-probability matches for {formData.target_market}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-4 py-2 rounded-full border border-blue-100">REPORT ID: #{Math.floor(Math.random() * 9000) + 1000}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div key={match.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center hover:border-blue-400 transition-all group">
                      <div className="flex-1 text-left w-full">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-black text-2xl text-slate-900 group-hover:text-blue-600 transition-colors">{match.name}</h4>
                          <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">{match.type}</span>
                        </div>
                        <p className="text-sm font-bold text-blue-500 mb-4 flex items-center gap-1">📍 {match.country}</p>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
                          <MessageSquareQuote className="text-slate-300 shrink-0" size={20} />
                          <p className="text-sm text-slate-600 font-medium leading-relaxed italic">{match.reason}</p>
                        </div>
                      </div>
                      
                      <div className="flex md:flex-col items-center gap-4 w-full md:w-36">
                        <div className="bg-green-50 text-green-700 p-4 rounded-3xl border border-green-100 w-full flex flex-col items-center justify-center">
                          <span className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-50">Match</span>
                          <div className="text-3xl font-black flex items-center tracking-tighter">
                            <Percent size={20} strokeWidth={4} />{match.score}
                          </div>
                        </div>
                        <button 
                          onClick={() => generateEmail(match)} 
                          className="w-full bg-slate-900 text-white text-xs font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                        >
                          CONNECT
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center p-20 shadow-inner">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 text-slate-200 animate-bounce">
                  <TrendingUp size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Intelligence Awaits</h3>
                <p className="text-slate-400 max-w-md font-medium text-lg leading-relaxed">
                  Configure your company profile on the left. Orbit AI will generate a real-time Western market entry strategy.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- MODALE AI OUTREACH ASSISTANT --- */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
                  <Mail size={24} />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">AI OUTREACH</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To: {selectedPartner.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-all text-2xl font-bold">✕</button>
            </div>

            <div className="p-10 overflow-y-auto bg-white flex-1 text-left">
              {isGeneratingEmail ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded-full w-1/4"></div>
                  <div className="h-20 bg-slate-50 rounded-3xl w-full"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute -top-4 right-0 bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full shadow-sm border border-blue-200 tracking-widest">GPT-5.4 DRAFT</div>
                  <pre className="whitespace-pre-wrap font-mono text-slate-700 text-sm bg-slate-50 p-8 rounded-[2rem] border border-slate-100 leading-relaxed shadow-inner">
                    {emailContent}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-10 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <button 
                disabled={isGeneratingEmail}
                onClick={() => { 
                  navigator.clipboard.writeText(emailContent); 
                  toast.success("Ready for export! Content copied."); 
                }} 
                className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
              >
                COPY DRAFT
              </button>
              <button onClick={() => setSelectedPartner(null)} className="px-10 py-5 text-slate-500 font-black hover:text-slate-800 transition-colors uppercase text-xs tracking-widest">Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;