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
  AlertTriangle,
  Calendar,
  BarChart3
} from 'lucide-react';
import Auth from './components/Auth';
import Landing from './components/Landing';

function App() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // --- ENTERPRISE CONFIGURATION STATE ---
  const [formData, setFormData] = useState({
    company_name: '',
    product_description: '',
    business_model: 'B2B',
    target_market: 'Europe',
    sector: 'Robotics',
    company_stage: 'Growth',
    biggest_concern: 'Compliance & Regulations'
  });

  // --- INTELLIGENCE REPORT STATE ---
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
    if (!formData.company_name || !formData.product_description) {
      return toast.error('Complete the profile first!');
    }
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
      toast.success('Market Intelligence Synthesized');
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
      {/* GLOBAL NAVIGATION */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Briefcase size={22} /></div>
          <span className="text-2xl font-black tracking-tighter italic">BRIDGE<span className="text-blue-600">MATCH</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-[10px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest text-slate-500">Node: Orbit-GPT-5.4</span>
          <button onClick={() => supabase.auth.signOut()} className="text-slate-400 hover:text-red-500 transition-all"><LogOut size={22} /></button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* SIDEBAR: GTM CONFIGURATOR */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 sticky top-28">
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                 <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Market Config</h2>
              </div>
              
              <form onSubmit={handleGenerate} className="space-y-5 text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Company Identity</label>
                  <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Shanghai Robotics Ltd" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Target Market</label>
                    <select value={formData.target_market} onChange={(e) => setFormData({...formData, target_market: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none cursor-pointer">
                      <option>Europe</option><option>North America</option><option>Middle East</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Stage</label>
                    <select value={formData.company_stage} onChange={(e) => setFormData({...formData, company_stage: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none cursor-pointer">
                      <option>Growth</option><option>Early Seed</option><option>Series A/B</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Strategic Sector</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Robotics', 'EV & Battery', 'Smart Mobility'].map(s => (
                      <button key={s} type="button" onClick={() => setFormData({...formData, sector: s})} className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-3 ${formData.sector === s ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}>
                        {s === 'Robotics' ? <Cpu size={14}/> : s === 'EV & Battery' ? <Zap size={14}/> : <Car size={14}/>}
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Value Proposition</label>
                  <textarea value={formData.product_description} onChange={(e) => setFormData({...formData, product_description: e.target.value})} className="w-full h-32 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Describe your core technology..." />
                </div>

                <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:bg-slate-300 active:scale-95">
                  {loading ? 'SYNTHESIZING REPORT...' : 'GENERATE INTELLIGENCE'}
                </button>
              </form>
            </div>
          </div>

          {/* MAIN CONTENT: INTELLIGENCE DASHBOARD */}
          <div className="lg:col-span-8 space-y-10">
            {matches ? (
              <div className="animate-in fade-in zoom-in-95 duration-700 text-left">
                
                {/* 1. EXECUTIVE SUMMARY CARD */}
                <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] mb-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5"><TrendingUp size={200} /></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="max-w-md">
                        <h3 className="text-5xl font-black tracking-tighter mb-4 leading-none">{matches.company_summary.name}</h3>
                        <p className="text-blue-400 font-bold text-xl italic leading-tight">"{matches.company_summary.one_line_pitch}"</p>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/20 shadow-xl">
                        <div className="text-5xl font-black text-blue-400 tracking-tighter">{matches.company_summary.market_readiness_score}%</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mt-1">{matches.company_summary.market_readiness_label}</div>
                      </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-3xl">
                      <p className="text-sm leading-relaxed"><span className="font-black text-blue-300 uppercase mr-3 tracking-widest text-xs underline decoration-2">Critical Insight:</span> {matches.company_summary.critical_insight}</p>
                    </div>
                  </div>
                </div>

                {/* 2. STRATEGIC ROADMAP (THE BATTLE PLAN) */}
                <div className="mb-12">
                  <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3"><Calendar className="text-blue-600" /> Strategic Expansion Roadmap</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {matches.action_plan.weeks.map((week, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:translate-y-[-4px] transition-all">
                        <div className="text-blue-600 font-black text-[10px] mb-2 uppercase tracking-widest bg-blue-50 w-fit px-2 py-0.5 rounded-md">{week.period}</div>
                        <div className="font-bold text-slate-800 mb-3 text-sm leading-tight">{week.theme}</div>
                        <div className="h-px bg-slate-50 w-full mb-3"></div>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Milestone</p>
                        <p className="text-[11px] text-slate-600 italic leading-tight">{week.milestone}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. ICP MATCHES WITH ANALYTICAL BREAKDOWN (WOW FUNCTION) */}
                <div className="mb-12">
                  <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3"><BarChart3 className="text-blue-600" /> Explainable AI: Partner Breakdown</h3>
                  <div className="space-y-6">
                    {matches.icp_matches.map((match, idx) => (
                      <div key={idx} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-10 items-center hover:border-blue-400 transition-all group relative overflow-hidden">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-4 mb-3">
                             <h4 className="font-black text-3xl text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{match.company_name}</h4>
                             <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200">RANK #{match.rank}</span>
                          </div>
                          <p className="text-sm font-bold text-blue-500 mb-5 tracking-wide uppercase">📍 {match.country} • {match.sector} • {match.company_size}</p>
                          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-6 relative">
                            <MessageSquareQuote className="absolute -top-3 -left-3 text-blue-200" size={32} />
                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{match.why_they_match}"</p>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center gap-2">
                               <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Zap size={14}/></div>
                               <div><p className="text-[9px] font-black text-slate-400 uppercase">Trigger</p><p className="text-[11px] font-bold text-slate-700">{match.buying_trigger}</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Briefcase size={14}/></div>
                               <div><p className="text-[9px] font-black text-slate-400 uppercase">Target Person</p><p className="text-[11px] font-bold text-slate-700">{match.decision_maker_title}</p></div>
                            </div>
                          </div>
                        </div>

                        {/* ANALYTICAL SCORE BREAKDOWN (SIDE) */}
                        <div className="w-full lg:w-48 flex flex-col gap-4 border-l border-slate-50 pl-0 lg:pl-10">
                          <div className="bg-green-50 text-green-700 p-5 rounded-[2rem] border border-green-100 text-center shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-1 italic">Overall Fit</span>
                            <div className="text-4xl font-black flex items-center justify-center tracking-tighter">
                              <Percent size={22} strokeWidth={4} />{match.scores.overall}
                            </div>
                          </div>

                          {/* MATCH MATRIX BARS */}
                          <div className="space-y-3 px-1">
                            {[
                              { label: 'Product Fit', val: match.scores.product_fit, max: 25 },
                              { label: 'Market Readiness', val: match.scores.market_readiness, max: 25 },
                              { label: 'Strategic Value', val: match.scores.strategic_value, max: 25 },
                              { label: 'Accessibility', val: match.scores.accessibility, max: 25 },
                            ].map((stat, i) => (
                              <div key={i}>
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter text-slate-400 mb-1">
                                  <span>{stat.label}</span>
                                  <span>{stat.val}/{stat.max}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                  <div 
                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                                    style={{ width: `${(stat.val / stat.max) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={() => generateEmail(match)} 
                            className="w-full bg-slate-900 text-white text-[10px] font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl active:scale-95 mt-2 uppercase tracking-widest"
                          >
                            CONNECT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. COMPETITORS & RISKS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="text-left">
                    <h3 className="text-2xl font-black text-slate-800 mb-6">Competitor Battlecards</h3>
                    <div className="space-y-4">
                      {matches.competitor_intelligence.map((comp, idx) => (
                        <div key={idx} className="bg-white p-7 rounded-[2.5rem] border-l-8 border-l-red-500 border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-black text-lg text-slate-800">{comp.company_name}</h4>
                             <span className="text-[9px] font-black bg-red-50 text-red-600 px-2 py-1 rounded-md uppercase tracking-widest">{comp.threat_level}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-bold mb-4 uppercase">{comp.country} • {comp.what_they_sell}</p>
                          <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                             <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Gap to Exploit</p>
                             <p className="text-xs font-bold text-red-900 leading-tight">{comp.weakness}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-left">
                    <h3 className="text-2xl font-black text-slate-800 mb-6">Risk Assessment Radar</h3>
                    <div className="space-y-4">
                      {matches.risk_assessment.map((risk, idx) => (
                        <div key={idx} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-black text-slate-800 uppercase">{risk.risk_title}</h4>
                            <AlertTriangle size={18} className={risk.severity === 'Critical' ? 'text-red-500' : 'text-orange-500'} />
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed mb-4">{risk.description}</p>
                          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                             <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Mitigation Strategy</p>
                             <p className="text-[11px] font-bold text-blue-900 leading-tight">{risk.mitigation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[700px] flex flex-col items-center justify-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200 text-center p-20 shadow-inner">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8 text-slate-200 animate-bounce shadow-inner">
                  <LayoutDashboard size={48} />
                </div>
                <h3 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Ready to Expand?</h3>
                <p className="text-slate-400 max-w-sm font-medium text-lg leading-relaxed">
                  Configure your company profile. Orbit AI GPT-5.4 will synthesize a complete GTM Intelligence Report with web-verified data.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: AI OUTREACH ENGINE */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-12 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="text-left">
                <div className="flex items-center gap-3 mb-1">
                   <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200"><Mail size={18}/></div>
                   <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Outreach Engine</h3>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-11">Tailored for {selectedPartner.company_name}</p>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-900 transition-all text-2xl font-bold">✕</button>
            </div>
            <div className="p-12 overflow-y-auto flex-1 text-left">
              {isGeneratingEmail ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded-full w-1/4"></div>
                  <div className="h-32 bg-slate-50 rounded-[2rem] w-full shadow-inner"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-full"></div>
                  <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
                </div>
              ) : (
                <div className="relative group">
                  <div className="absolute -top-4 right-6 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-blue-200 tracking-widest uppercase italic">GPT-5.4 Generated</div>
                  <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 leading-relaxed shadow-inner">
                    {emailContent}
                  </pre>
                </div>
              )}
            </div>
            <div className="p-12 bg-slate-50 border-t flex flex-col sm:flex-row gap-4">
              <button 
                disabled={isGeneratingEmail}
                onClick={() => { navigator.clipboard.writeText(emailContent); toast.success("Draft copied to clipboard!"); }} 
                className="flex-1 bg-blue-600 text-white py-6 rounded-[1.5rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
              >
                COPY OUTREACH DRAFT
              </button>
              <button onClick={() => setSelectedPartner(null)} className="px-10 py-6 text-slate-400 font-black uppercase text-[10px] hover:text-slate-800 transition-colors">Discard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;