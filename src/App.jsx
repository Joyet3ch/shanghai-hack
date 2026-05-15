import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { toast, Toaster } from 'sonner';
import { 
  Building2, Globe2, Briefcase, Cpu, CheckCircle2, 
  ArrowRight, Loader2, Mail, LayoutDashboard, ChevronRight,
  TrendingUp, Target, ShieldAlert, LogIn, LogOut, Rocket, BarChart3, Zap
} from 'lucide-react';
import RegisterPartner from './components/RegisterPartner'; 

const MATCH_API_URL = 'https://trgrzufskkbkazprltub.supabase.co/functions/v1/match';
const EMAIL_API_URL = 'https://trgrzufskkbkazprltub.supabase.co/functions/v1/email';

export default function App() {
  // Stati di Navigazione & Utente
  const [showDashboard, setShowDashboard] = useState(false);
  const [user, setUser] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // Stati dell'App (Configurator & AI)
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const [formData, setFormData] = useState({
    company_name: 'Voltiq Energy Technology',
    target_market: 'Europe',
    company_stage: 'Growth',
    sector: 'New Energy Vehicles & Battery Tech',
    business_model: 'B2B',
    biggest_concern: 'Finding trusted local distributors',
    product_description: 'Modular LFP battery packs with AI-optimized BMS for residential and commercial solar+storage partners, enabling installers to deploy safer, scalable energy storage solutions.'
  });

  // GESTIONE AUTENTICAZIONE
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully!");
  };

  const handleLogin = () => {
    // Sostituisci con la tua logica o modale di login, per ora apre il configuratore se non hai una pagina auth
    toast.info("Login modal/page should open here!");
  };

  // CHIAMATE AI (Supabase Edge Functions)
  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setReport(null);
    setEmailContent('');
    setSelectedPartner(null);

    try {
      const response = await fetch(MATCH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Timeout o Errore dal Server. Riprova.');
      const data = await response.json();
      setReport(data);
      toast.success('GTM Report generated!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = async (partner) => {
    setSelectedPartner(partner);
    setIsGeneratingEmail(true);
    setEmailContent('');
    try {
      const response = await fetch(EMAIL_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: partner.company_name,
          partnerType: partner.sector,
          country: partner.country,
          industry: formData.sector,
          userPitch: formData.product_description,
          companyName: formData.company_name,
          whyTheyMatch: partner.why_they_match,
          buyingTrigger: partner.buying_trigger
        })
      });
      if (!response.ok) throw new Error('Errore nella generazione email');
      const data = await response.json();
      setEmailContent(data.text);
      toast.success('Culturally calibrated email ready!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans selection:bg-blue-500/30">
      <Toaster position="top-center" richColors theme="dark" />
      
      {/* NAVBAR UNIVERSALE */}
      <nav className="border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowDashboard(false)}
          >
            <LayoutDashboard className="text-blue-500" size={28} />
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Bridge<span className="text-blue-500">Match</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 border-r border-slate-800 pr-4 mr-2">
              {user ? (
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-400 transition-colors">
                  <LogOut size={16} /> LOG OUT
                </button>
              ) : (
                <button onClick={handleLogin} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                  <LogIn size={16} /> LOG IN
                </button>
              )}
            </div>
            <button onClick={() => setIsRegisterOpen(true)} className="hidden md:flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all border border-slate-700">
              <CheckCircle2 size={16} className="text-blue-400" /> BECOME A PARTNER
            </button>
          </div>
        </div>
      </nav>

      {/* RENDER CONDIZIONALE: HOME PAGE vs DASHBOARD */}
      {!showDashboard ? (
        
        /* =========================================
           HOME PAGE / LANDING PAGE
           ========================================= */
        <div className="flex-1 flex flex-col">
          {/* Hero Section */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest border border-blue-500/20 mb-8">
              <Zap size={16} /> The Implementation Gap Solved
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[1.1]">
              Scale Chinese Tech into <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Western Markets.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl font-medium leading-relaxed">
              Stop guessing. Use Hybrid AI to find vetted Western partners, generate localized Go-To-Market strategies, and write culturally calibrated outreach in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  if (user) {
                    setShowDashboard(true);
                  } else {
                    toast.error("Access Denied: Devi fare il Log In per accedere alla piattaforma 🔒");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-black text-lg flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all hover:scale-105"
              >
                LAUNCH PLATFORM <ArrowRight size={20} />
              </button>
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-[#111827] border-t border-slate-800 py-24">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#0B0F19] p-8 rounded-3xl border border-slate-800">
                <Target className="text-blue-500 mb-6" size={40} />
                <h3 className="text-xl font-black mb-3">Vetted Partner Network</h3>
                <p className="text-slate-400 text-sm leading-relaxed">We combine our proprietary database of verified Western integrators with live web-search intelligence to find your exact ICP.</p>
              </div>
              <div className="bg-[#0B0F19] p-8 rounded-3xl border border-slate-800">
                <BarChart3 className="text-blue-500 mb-6" size={40} />
                <h3 className="text-xl font-black mb-3">Instant GTM Strategy</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Orbit AI analyzes your startup and generates a 3-phase market entry plan, competitor risk assessment, and readiness score.</p>
              </div>
              <div className="bg-[#0B0F19] p-8 rounded-3xl border border-slate-800">
                <Globe2 className="text-blue-500 mb-6" size={40} />
                <h3 className="text-xl font-black mb-3">Cultural Calibration</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Our engine writes outreach emails automatically adjusted for the specific business culture of Germany, US, France, and more.</p>
              </div>
            </div>
          </div>
        </div>

      ) : (

        /* =========================================
           DASHBOARD / GTM CONFIGURATOR
           ========================================= */
        <main className="flex-1 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8 p-6 animate-in fade-in duration-500">
          
          {/* LEFT COLUMN: GTM CONFIGURATOR */}
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl sticky top-28">
              <h2 className="text-lg font-black tracking-tight uppercase mb-6 flex items-center gap-2">
                <Target className="text-blue-500" size={20} /> GTM Configurator
              </h2>
              <form onSubmit={handleGenerate} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Identity</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})}
                      className="w-full bg-[#1F2937] border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Market</label>
                    <div className="relative">
                      <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <select value={formData.target_market} onChange={e => setFormData({...formData, target_market: e.target.value})}
                        className="w-full bg-[#1F2937] border border-slate-700 rounded-2xl py-3 pl-9 pr-3 text-sm font-bold outline-none focus:border-blue-500 appearance-none">
                        <option>Europe</option>
                        <option>North America</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stage</label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <select value={formData.company_stage} onChange={e => setFormData({...formData, company_stage: e.target.value})}
                        className="w-full bg-[#1F2937] border border-slate-700 rounded-2xl py-3 pl-9 pr-3 text-sm font-bold outline-none focus:border-blue-500 appearance-none">
                        <option>Seed</option>
                        <option>Growth</option>
                        <option>Enterprise</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Strategic Sector</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                    <select value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}
                      className="w-full bg-[#1F2937] border border-blue-500/30 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:border-blue-500 appearance-none">
                      <option>New Energy Vehicles & Battery Tech</option>
                      <option>Robotics & Embodied AI</option>
                      <option>Clean Energy & Renewables</option>
                      <option>AI & Enterprise Software</option>
                      <option>Autonomous Driving & Smart Mobility</option>
                      <option>Consumer Tech & Cross-Border DTC</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tech Description</label>
                  <div className="relative">
                    <Cpu className="absolute left-4 top-4 text-slate-500" size={16} />
                    <textarea required value={formData.product_description} onChange={e => setFormData({...formData, product_description: e.target.value})}
                      className="w-full h-32 bg-[#1F2937] border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium outline-none resize-none focus:border-blue-500" />
                  </div>
                </div>
                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> ANALYZING GTM...</> : <>GENERATE REPORT <ArrowRight size={18} /></>}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: RESULTS */}
          <div className="w-full lg:w-2/3">
            {!report && !loading && (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center bg-[#111827]/50">
                <Rocket size={48} className="mb-4 opacity-50 text-blue-500" />
                <h3 className="text-xl font-bold text-white mb-2">Ready for Lift-off</h3>
                <p className="max-w-md text-sm">Configure your Chinese startup profile on the left and click Generate to see the magic happen.</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full animate-pulse"></div>
                  <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-black tracking-tight animate-pulse text-white">Orbit AI is connecting dots...</p>
                  <p className="text-sm font-bold text-slate-500">Scanning Vetted Database & Live Market Signals</p>
                </div>
              </div>
            )}

            {report && !loading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
                {/* SUMMARY HEADER */}
                <div className="bg-gradient-to-br from-blue-900/40 to-[#111827] border border-blue-500/20 rounded-3xl p-8">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h2 className="text-4xl font-black tracking-tighter mb-2 text-white">{report.company_summary?.name}</h2>
                      <p className="text-lg text-blue-100/80 font-medium italic mb-4">{report.company_summary?.one_line_pitch}</p>
                      <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-500/20">
                        <ShieldAlert size={16} /> {report.company_summary?.critical_insight}
                      </div>
                    </div>
                    <div className="text-center shrink-0">
                      <div className="w-24 h-24 bg-[#0B0F19] rounded-2xl flex items-center justify-center border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-2">
                        <span className="text-4xl font-black text-white">{report.company_summary?.market_readiness_score}<span className="text-xl">%</span></span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{report.company_summary?.market_readiness_label}</span>
                    </div>
                  </div>
                </div>

                {/* PARTNER LIST */}
                <div>
                  <h3 className="text-lg font-black tracking-tight uppercase mb-4 flex items-center gap-2 text-white">
                    <Building2 className="text-blue-500" size={20} /> Vetted Partner Matches
                  </h3>
                  <div className="space-y-4">
                    {report.icp_matches?.map((partner, index) => (
                      <div key={index} className="bg-[#111827] border border-slate-800 rounded-3xl p-6 hover:border-blue-500/50 transition-all group">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-xl font-bold text-white">{partner.company_name}</h4>
                              {partner.is_verified && (
                                <span className="flex items-center gap-1 bg-green-500/10 text-green-400 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-green-500/20">
                                  <CheckCircle2 size={12} /> DB Vetted
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                              <Globe2 size={14} /> {partner.country} • {partner.sector}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-blue-500">{partner.scores?.overall}%</span>
                            <p className="text-[10px] font-black text-slate-500 uppercase">Match Score</p>
                          </div>
                        </div>

                        <p className="text-sm text-slate-300 mt-4 bg-[#0B0F19] p-4 rounded-xl border border-slate-800/50 leading-relaxed">
                          <span className="font-bold text-white">Why they match:</span> {partner.why_they_match}
                        </p>

                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-800">
                          <div className="text-xs font-medium text-slate-400">
                            <span className="text-white font-bold">Target:</span> {partner.decision_maker_title}
                          </div>
                          <button 
                            onClick={() => generateEmail(partner)}
                            disabled={isGeneratingEmail && selectedPartner?.company_name === partner.company_name}
                            className="flex items-center gap-2 bg-slate-800 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            {isGeneratingEmail && selectedPartner?.company_name === partner.company_name 
                              ? <><Loader2 size={14} className="animate-spin"/> WRITING...</> 
                              : <><Mail size={14}/> GENERATE OUTREACH</>}
                          </button>
                        </div>

                        {/* EMAIL RENDERER */}
                        {emailContent && selectedPartner?.company_name === partner.company_name && (
                          <div className="mt-4 p-5 bg-blue-950/20 border border-blue-500/30 rounded-2xl animate-in fade-in duration-500">
                            <div className="flex items-center gap-2 mb-3 text-blue-400 border-b border-blue-500/20 pb-2">
                              <Mail size={16} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Culturally Calibrated Draft</span>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap font-medium">{emailContent}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTION PLAN E COMPETITOR (BENTORNATI!) */}
                <div className="mt-8">
                  <h3 className="text-lg font-black tracking-tight uppercase mb-4 flex items-center gap-2 text-white">
                    <Target className="text-blue-500" size={20} /> GTM Strategy & Action Plan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 hover:border-blue-500/30 transition-all">
                      <span className="text-blue-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-2">Phase 1</span>
                      <p className="text-sm font-medium text-slate-300">{report.action_plan?.phase_1}</p>
                    </div>
                    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 hover:border-blue-500/30 transition-all">
                      <span className="text-blue-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-2">Phase 2</span>
                      <p className="text-sm font-medium text-slate-300">{report.action_plan?.phase_2}</p>
                    </div>
                    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 hover:border-blue-500/30 transition-all">
                      <span className="text-blue-500 font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-2">Phase 3</span>
                      <p className="text-sm font-medium text-slate-300">{report.action_plan?.phase_3}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-black tracking-tight uppercase mb-4 flex items-center gap-2 text-white">
                    <ShieldAlert className="text-red-500" size={20} /> Competitor Intelligence
                  </h3>
                  <div className="space-y-4">
                    {report.competitor_intelligence?.map((comp, idx) => (
                      <div key={idx} className="bg-[#111827] border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-red-500/30 transition-all">
                        <div>
                          <h4 className="font-bold text-white text-lg flex items-center gap-2">
                            {comp.company_name} 
                            <span className="text-[10px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded-md uppercase">{comp.country}</span>
                          </h4>
                          <p className="text-sm text-slate-400 mt-2">{comp.what_they_sell}</p>
                        </div>
                        <div className="text-left md:text-right shrink-0">
                          <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg mb-2 ${
                            comp.threat_level?.toLowerCase().includes('high') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          }`}>
                            {comp.threat_level} Threat
                          </span>
                          <p className="text-xs text-slate-500"><strong className="text-slate-300">Weakness:</strong> {comp.weakness}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      )}

      {/* MODAL REGISTRAZIONE */}
      <RegisterPartner isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  );
}