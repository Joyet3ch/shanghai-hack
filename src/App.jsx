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
  Calendar
} from 'lucide-react';
import Auth from './components/Auth';
import Landing from './components/Landing';

function App() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // STATO FORM ENTERPRISE
  const [formData, setFormData] = useState({
    company_name: '',
    product_description: '',
    business_model: 'B2B',
    target_market: 'Europe',
    sector: 'Robotics',
    company_stage: 'Growth',
    biggest_concern: 'Compliance & Regulations'
  });

  // STATI PER IL REPORT INTELLIGENCE
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
      return toast.error('Fill in Company Name and Description!');
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
      toast.success('Market Intelligence Report Ready');
    } catch (error) {
      toast.error('AI Engine error');
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
      toast.error("Failed to generate outreach");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  if (!session && !showAuth) return <Landing onNavigateToAuth={() => setShowAuth(true)} />;
  if (!session && showAuth) return (
    <div className="relative min-h-screen bg-slate-50">
      <button onClick={() => setShowAuth(false)} className="absolute top-6 left-6 z-50 text-slate-400 font-black">← BACK</button>
      <Auth />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white"><Briefcase size={22} /></div>
          <span className="text-2xl font-black tracking-tighter italic">BRIDGE<span className="text-blue-600">MATCH</span></span>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="text-slate-400 hover:text-red-500 transition-colors"><LogOut size={22} /></button>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* LEFT: ENTERPRISE CONFIGURATION */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 sticky top-28">
              <h2 className="text-2xl font-black mb-6 text-left">Market Intel</h2>
              <form onSubmit={handleGenerate} className="space-y-5 text-left">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Company Name</label>
                  <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. NeoCharge Tech" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Market</label>
                    <select value={formData.target_market} onChange={(e) => setFormData({...formData, target_market: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none">
                      <option>Europe</option><option>North America</option><option>Middle East</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Stage</label>
                    <select value={formData.company_stage} onChange={(e) => setFormData({...formData, company_stage: e.target.value})} className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold outline-none">
                      <option>Growth</option><option>Early Seed</option><option>Series A/B</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Sector</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Robotics', 'EV & Battery', 'Smart Mobility'].map(s => (
                      <button key={s} type="button" onClick={() => setFormData({...formData, sector: s})} className={`p-3 rounded-xl text-xs font-bold border transition-all flex items-center gap-3 ${formData.sector === s ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Innovation Pitch</label>
                  <textarea value={formData.product_description} onChange={(e) => setFormData({...formData, product_description: e.target.value})} className="w-full h-32 p-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium outline-none resize-none" placeholder="Describe your product..." />
                </div>
                <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm hover:bg-blue-600 transition-all shadow-xl disabled:bg-slate-300">
                  {loading ? 'Synthesizing...' : 'GENERATE INTELLIGENCE'}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: INTELLIGENCE DASHBOARD */}
          <div className="lg:col-span-8 space-y-10">
            {matches ? (
              <div className="animate-in fade-in zoom-in-95 duration-700 text-left">
                
                {/* 1. EXECUTIVE SUMMARY */}
                <div className="bg-slate-900 text-white p-10 rounded-[3rem] mb-10 shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-4xl font-black tracking-tighter mb-2">{matches.company_summary.name}</h3>
                        <p className="text-blue-400 font-bold text-lg italic">"{matches.company_summary.one_line_pitch}"</p>
                      </div>
                      <div className="text-center bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20">
                        <div className="text-4xl font-black text-blue-400">{matches.company_summary.market_readiness_score}%</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/60">{matches.company_summary.market_readiness_label}</div>
                      </div>
                    </div>
                    <div className="bg-blue-600/30 border border-blue-400/30 p-5 rounded-2xl">
                      <p className="text-sm leading-relaxed"><span className="font-black text-blue-300 uppercase mr-2 underline">Strategic Insight:</span> {matches.company_summary.critical_insight}</p>
                    </div>
                  </div>
                </div>

                {/* 2. ROADMAP */}
                <div className="mb-12">
                  <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3"><Calendar className="text-blue-600" /> 12-Week Battle Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {matches.action_plan.weeks.map((week, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="text-blue-600 font-black text-[10px] mb-2 uppercase tracking-widest">{week.period}</div>
                        <div className="font-bold text-slate-800 mb-3 text-sm leading-tight">{week.theme}</div>
                        <p className="text-[11px] text-slate-500 italic">Target: {week.milestone}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. PARTNERS (ICP MATCHES) */}
                <div className="mb-12">
                  <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3"><Search className="text-blue-600" /> Web-Verified ICP Matches</h3>
                  <div className="space-y-4">
                    {matches.icp_matches.map((match, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center hover:border-blue-400 transition-all group">
                        <div className="flex-1">
                          <h4 className="font-black text-2xl text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{match.company_name}</h4>
                          <p className="text-xs font-bold text-blue-500 mb-4 uppercase tracking-widest">{match.country} • {match.sector}</p>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4 text-sm text-slate-600 italic">"{match.why_they_match}"</div>
                          <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase">
                            <span>Trigger: {match.buying_trigger}</span>
                            <span>Target: {match.decision_maker_title}</span>
                          </div>
                        </div>
                        <div className="w-full md:w-36 flex flex-col gap-3">
                          <div className="text-center bg-green-50 p-3 rounded-2xl border border-green-100">
                            <div className="text-[10px] font-black text-green-700">FIT SCORE</div>
                            <div className="text-2xl font-black text-green-700">%{match.scores.overall}</div>
                          </div>
                          <button onClick={() => generateEmail(match)} className="w-full bg-slate-900 text-white text-[10px] font-black py-4 rounded-2xl hover:bg-blue-600 transition-all">CONNECT</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. COMPETITORS & RISKS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-4">Competitor Battlecards</h3>
                    <div className="space-y-3">
                      {matches.competitor_intelligence.map((comp, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[2rem] border-l-4 border-l-red-500 border border-slate-100 shadow-sm">
                          <h4 className="font-black text-slate-800">{comp.company_name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase">{comp.threat_level} THREAT</p>
                          <div className="text-xs text-red-700 font-bold bg-red-50 p-2 rounded-lg">Gap: {comp.weakness}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 mb-4">Risk Radar</h3>
                    <div className="space-y-3">
                      {matches.risk_assessment.map((risk, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-sm font-black text-slate-800">{risk.risk_title}</h4>
                            <ShieldCheck size={16} className="text-orange-500" />
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight mb-2">{risk.description}</p>
                          <div className="text-[9px] font-black text-blue-600 bg-blue-50 p-1.5 rounded uppercase tracking-tighter">Fix: {risk.mitigation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 text-center p-20">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200 animate-pulse"><LayoutDashboard size={40} /></div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Ready to scale?</h3>
                <p className="text-slate-400 max-w-sm font-medium">Input your startup profile to generate a real-time Western Market Intelligence report powered by GPT-5.4.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* AI OUTREACH MODAL */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="text-left">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1 uppercase italic">AI Outreach</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest tracking-tighter">Target: {selectedPartner.company_name}</p>
              </div>
              <button onClick={() => setSelectedPartner(null)} className="text-slate-300 hover:text-slate-800 text-2xl font-bold">✕</button>
            </div>
            <div className="p-10 overflow-y-auto flex-1 text-left">
              {isGeneratingEmail ? (
                <div className="space-y-4 animate-pulse"><div className="h-4 bg-slate-100 rounded w-1/4"></div><div className="h-24 bg-slate-50 rounded-3xl w-full"></div></div>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs text-slate-700 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 leading-relaxed shadow-inner">{emailContent}</pre>
              )}
            </div>
            <div className="p-10 bg-slate-50 border-t flex gap-4">
              <button onClick={() => { navigator.clipboard.writeText(emailContent); toast.success("Copied to clipboard!"); }} className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-200">COPY CONTENT</button>
              <button onClick={() => setSelectedPartner(null)} className="px-10 py-5 text-slate-500 font-black uppercase text-[10px]">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;