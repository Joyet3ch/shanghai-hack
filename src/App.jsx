import { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { supabase } from './lib/supabase';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Copy,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  RefreshCw,
  Rocket,
  ShieldAlert,
  Target,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';

const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'Marketplace'];
const MARKETS = ['Europe', 'North America', 'Both'];
const STAGES = ['Seed', 'Series A', 'Series B', 'Growth'];
const SECTORS = [
  'New Energy Vehicles & Battery Tech',
  'Robotics & Embodied AI',
  'Clean Energy & Renewables',
  'AI & Enterprise Software',
  'Autonomous Driving & Smart Mobility',
  'Consumer Tech & Cross-Border DTC',
];

const MATCH_API_URL =
  import.meta.env.VITE_MATCH_API_URL ||
  'https://trgrzufskkbkazprltub.supabase.co/functions/v1/match';
const EMAIL_API_URL =
  import.meta.env.VITE_EMAIL_API_URL ||
  'https://trgrzufskkbkazprltub.supabase.co/functions/v1/email';

const NAV_ITEMS = [
  { id: 'matches', label: 'Partners', icon: Target },
  { id: 'competitors', label: 'Competitors', icon: BarChart3 },
  { id: 'plan', label: 'Action Plan', icon: TrendingUp },
  { id: 'risks', label: 'Risks', icon: ShieldAlert },
];

const INITIAL_FORM = {
  company_name: '',
  product_description: '',
  business_model: '',
  target_market: 'Europe',
  sector: '',
  company_stage: '',
  biggest_concern: '',
};

const INITIAL_PARTNER_FORM = {
  company_name: '',
  sector: 'Clean Energy & Renewables',
  market: 'Europe',
  country: '',
  website: '',
  contact_email: '',
  description: '',
};

const useCounter = (target, duration = 900) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const numericTarget = Number(target) || 0;
    let timer;

    const starter = setTimeout(() => {
      if (!numericTarget) {
        setCount(0);
        return;
      }

      let start = 0;
      const step = numericTarget / (duration / 16);
      timer = setInterval(() => {
        start += step;
        if (start >= numericTarget) {
          setCount(numericTarget);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
    }, 0);

    return () => {
      clearTimeout(starter);
      if (timer) clearInterval(timer);
    };
  }, [target, duration]);

  return count;
};

const useTyping = (text, speed = 35) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let timer;

    const starter = setTimeout(() => {
      setDisplayed('');
      if (!text) return;

      let i = 0;
      timer = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i += 1;
        if (i >= text.length) clearInterval(timer);
      }, speed);
    }, 0);

    return () => {
      clearTimeout(starter);
      if (timer) clearInterval(timer);
    };
  }, [text, speed]);

  return displayed;
};

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(Number(value) || 0, min), max);

const withProtocol = (url) => {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
};

const readJsonResponse = async (response) => {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Server returned non-JSON response (${response.status}). Please refresh and try again.`);
  }
};

const normalizeReportForUi = (report) => {
  if (!report) return report;

  const actionPlan = report.action_plan || {};
  const weeks = Array.isArray(actionPlan.weeks) && actionPlan.weeks.length
    ? actionPlan.weeks
    : [
        actionPlan.phase_1 && {
          period: 'Week 1-4',
          theme: 'Foundation & Market Proof',
          actions: [actionPlan.phase_1],
          milestone: 'Core market entry assumptions are validated.',
        },
        actionPlan.phase_2 && {
          period: 'Week 5-8',
          theme: 'Partner Outreach & Validation',
          actions: [actionPlan.phase_2],
          milestone: 'Qualified partner conversations and pilot path are active.',
        },
        actionPlan.phase_3 && {
          period: 'Week 9-12',
          theme: 'Commercial Pilot & Board Plan',
          actions: [actionPlan.phase_3],
          milestone: 'Pilot structure and next-step GTM plan are ready.',
        },
      ].filter(Boolean);

  return {
    ...report,
    action_plan: {
      ...actionPlan,
      market_entry_timeline: actionPlan.market_entry_timeline || '90 days',
      weeks,
      first_action_tomorrow:
        actionPlan.first_action_tomorrow ||
        weeks[0]?.actions?.[0] ||
        'Validate the first partner target and compliance blocker before broad outreach.',
    },
    icp_matches: (report.icp_matches || []).map((partner, index) => ({
      ...partner,
      rank: partner.rank || index + 1,
      buying_signal_status: partner.buying_signal_status || (index < 2 ? 'warm' : 'cool'),
      company_size: partner.company_size || 'Size not disclosed',
      first_move:
        partner.first_move ||
        `Send a concise outreach note to ${partner.company_name} with a technical dossier and pilot proposal.`,
      scores: {
        product_fit: Number(partner.scores?.product_fit) || 20,
        market_readiness: Number(partner.scores?.market_readiness) || 20,
        strategic_value: Number(partner.scores?.strategic_value) || 20,
        accessibility: Number(partner.scores?.accessibility) || 18,
        overall:
          Number(partner.scores?.overall) ||
          Number(partner.match_score) ||
          78,
      },
    })),
    competitor_intelligence: (report.competitor_intelligence || []).map((competitor, index) => ({
      ...competitor,
      rank: competitor.rank || index + 1,
      who_they_target: competitor.who_they_target || 'Western enterprise and channel buyers',
      positioning: competitor.positioning || 'Established Western-market competitor with stronger local trust.',
      pricing_signal: competitor.pricing_signal || null,
      threat_level: competitor.threat_level || 'Medium',
    })),
    risk_assessment: (report.risk_assessment || []).map((risk, index) => ({
      ...risk,
      rank: risk.rank || index + 1,
      risk_type: risk.risk_type || 'Operational',
      severity: risk.severity || 'Medium',
      probability: risk.probability || 'Medium',
      cost_of_ignoring: risk.cost_of_ignoring || 'Delayed market entry and weaker partner conversion.',
    })),
  };
};

const fetchReport = async (formData) => {
  let primaryError;

  try {
    const primary = await fetch(MATCH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const primaryData = await readJsonResponse(primary);

    if (primary.ok && primaryData.company_summary && primaryData.icp_matches) {
      return normalizeReportForUi({ ...primaryData, _meta: { source: 'ai', endpoint: 'legacy-supabase' } });
    }

    primaryError = primaryData.error || 'Primary AI endpoint returned an incomplete report';
  } catch {
    primaryError = 'Primary AI endpoint was unreachable';
  }

  const fallback = await fetch('/api/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const fallbackData = await readJsonResponse(fallback);

  if (!fallback.ok) {
    throw new Error(fallbackData.error || primaryError || 'Generation failed');
  }

  return normalizeReportForUi(fallbackData);
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [activeSection, setActiveSection] = useState('matches');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);
  const [emailModal, setEmailModal] = useState(null);
  const [partnerModal, setPartnerModal] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [registeredPartners, setRegisteredPartners] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setAuthModal(false);
        setView('app');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('landing');
    toast.success('Logged out');
  };

  const startApp = () => {
    if (user) {
      setView('app');
      return;
    }

    setAuthModal(true);
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (!formData.company_name || !formData.product_description || !formData.sector) {
      toast.error('Please fill in company name, product, and sector');
      return;
    }

    setLoading(true);
    setMatches(null);
    setEmailContent('');
    setEmailModal(null);

    try {
      const data = await fetchReport(formData);

      if (!data.company_summary || !data.icp_matches) {
        toast.error('Incomplete report received - try again');
        return;
      }

      setMatches(data);
      setActiveSection('matches');
      if (data._meta?.source === 'fallback') {
        toast.warning(`OrbitAI unavailable (${data._meta.reason}). Showing fallback report.`);
      } else {
        toast.success('AI Intelligence Report ready');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmail = async (partner) => {
    setEmailLoading(true);
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
          decisionMakerTitle: partner.decision_maker_title,
          buyingTrigger: partner.buying_trigger,
          whyTheyMatch: partner.why_they_match,
        }),
      });
      const data = await readJsonResponse(response);

      if (!response.ok) throw new Error(data.error || 'Email generation failed');
      setEmailContent(data.text);
    } catch {
      setEmailContent('Failed to generate email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  const openEmail = (partner) => {
    setEmailModal({ partner });
    handleGenerateEmail(partner);
  };

  const handleRegisterPartner = async (payload) => {
    if (!user) {
      toast.error('Please log in before registering a partner');
      setPartnerModal(false);
      setAuthModal(true);
      return;
    }

    setPartnerLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch('/api/register-partner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await readJsonResponse(response);

      if (!response.ok) throw new Error(data.error || 'Partner registration failed');

      const inserted = data.data?.[0] || payload;
      setRegisteredPartners((current) => [inserted, ...current]);
      setPartnerModal(false);
      toast.success('Partner registered successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPartnerLoading(false);
    }
  };

  const renderSection = () => {
    if (loading) return <LoadingSkeletons />;
    if (!matches) return <EmptyReport />;

    if (activeSection === 'competitors') {
      return <CompetitorSection competitors={matches.competitor_intelligence || []} />;
    }

    if (activeSection === 'plan') {
      return <ActionPlanSection actionPlan={matches.action_plan} />;
    }

    if (activeSection === 'risks') {
      return <RiskSection risks={matches.risk_assessment || []} />;
    }

    return <MatchesSection partners={matches.icp_matches || []} onEmail={openEmail} />;
  };

  return (
    <div className="bm-app">
      <Toaster position="top-center" richColors theme="dark" />
      <Header
        user={user}
        view={view}
        onHome={() => setView('landing')}
        onApp={startApp}
        onLogin={() => setAuthModal(true)}
        onLogout={handleLogout}
        onPartner={() => setPartnerModal(true)}
      />

      {view === 'landing' ? (
        <LandingPage onStart={startApp} onPartner={() => setPartnerModal(true)} />
      ) : (
        <main className="bm-dashboard">
          <aside className="bm-sidebar">
            <ProfileForm
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              matches={matches}
              onGenerate={handleGenerate}
            />
            <SectionNav activeSection={activeSection} setActiveSection={setActiveSection} />
            <RegisteredPartners partners={registeredPartners} />
          </aside>

          <section className="bm-main">
            {matches && !loading && <SummaryCard summary={matches.company_summary} />}
            {renderSection()}
          </section>
        </main>
      )}

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} />
      <PartnerModal
        key={partnerModal ? 'partner-open' : 'partner-closed'}
        isOpen={partnerModal}
        loading={partnerLoading}
        onClose={() => setPartnerModal(false)}
        onSubmit={handleRegisterPartner}
        isAuthenticated={Boolean(user)}
      />
      <EmailModal
        modal={emailModal}
        content={emailContent}
        loading={emailLoading}
        onClose={() => setEmailModal(null)}
        onRegenerate={() => emailModal?.partner && handleGenerateEmail(emailModal.partner)}
      />
    </div>
  );
}

function Header({ user, view, onHome, onApp, onLogin, onLogout, onPartner }) {
  return (
    <header className="bm-header">
      <button className="bm-logo" onClick={onHome} type="button">
        <LayoutDashboard size={22} />
        <span>
          Bridge<span>Match</span>
        </span>
      </button>

      <div className="bm-header-actions">
        <button className="bm-button bm-button-ghost" onClick={onPartner} type="button">
          <CheckCircle2 size={15} />
          Become a Partner
        </button>
        {user && view !== 'app' && (
          <button className="bm-button bm-button-ghost" onClick={onApp} type="button">
            <Rocket size={15} />
            Open App
          </button>
        )}
        {user ? (
          <button className="bm-button bm-button-ghost" onClick={onLogout} type="button">
            <LogOut size={15} />
            Log Out
          </button>
        ) : (
          <button className="bm-button bm-button-primary" onClick={onLogin} type="button">
            <LogIn size={15} />
            Log In
          </button>
        )}
      </div>
    </header>
  );
}

function LandingPage({ onStart, onPartner }) {
  return (
    <main className="bm-landing">
      <section className="bm-hero">
        <div className="bm-hero-copy">
          <span className="bm-eyebrow">
            <Zap size={14} />
            Shanghai International Hackathon 2026
          </span>
          <h1>Your Western Market Entry Intelligence Platform</h1>
          <p>
            Chinese startups fill one form. BridgeMatch generates a complete GTM strategy in
            60 seconds: partner matches, competitors, a 90-day plan, and market entry risks.
          </p>
          <div className="bm-hero-actions">
            <button className="bm-button bm-button-primary bm-button-large" onClick={onStart} type="button">
              Start Free
              <ArrowRight size={17} />
            </button>
            <a className="bm-button bm-button-ghost bm-button-large" href="#how-it-works">
              See How It Works
            </a>
          </div>
        </div>
        <div className="bm-hero-panel" aria-hidden="true">
          <div className="bm-hero-panel-header">
            <span />
            <span />
            <span />
          </div>
          <div className="bm-hero-match">
            <div>
              <span>Partner Match</span>
              <strong>Sonnen GmbH</strong>
            </div>
            <b>92</b>
          </div>
          <div className="bm-mini-bars">
            <i style={{ '--target-width': '92%' }} />
            <i style={{ '--target-width': '84%' }} />
            <i style={{ '--target-width': '76%' }} />
          </div>
          <div className="bm-hero-card-row">
            <span>Competitor risk</span>
            <b>High</b>
          </div>
          <div className="bm-hero-card-row">
            <span>First action</span>
            <b>EU Battery Regulation audit</b>
          </div>
        </div>
      </section>

      <section className="bm-stats" aria-label="Market stats">
        <Stat number="10,000+" label="Chinese companies targeting Western markets in 2026" />
        <Stat number="EUR174B" label="China outbound investment in 2025" />
        <Stat number="60 sec" label="To generate a complete market entry brief" />
      </section>

      <section className="bm-how" id="how-it-works">
        <div className="bm-section-heading">
          <span>Workflow</span>
          <h2>How It Works</h2>
        </div>
        <div className="bm-steps">
          <Step number="1" title="Fill your company profile" text="Seven fields capture market, sector, stage, product and concern." />
          <Step number="2" title="AI maps the market" text="BridgeMatch scores Western partner fit and reads competitive pressure." />
          <Step number="3" title="Get the GTM brief" text="Matches, competitor battlecards, a 90-day action plan and risks." />
        </div>
      </section>

      <section className="bm-partner-band">
        <div>
          <span className="bm-label">Partner Network</span>
          <h2>Are you a Western company looking for Chinese suppliers or partners?</h2>
          <p>
            Registering expands the vetted network, which makes every future match more
            precise for founders and Western buyers.
          </p>
        </div>
        <button className="bm-button bm-button-primary bm-button-large" onClick={onPartner} type="button">
          Register as a Partner
          <ArrowRight size={17} />
        </button>
      </section>
    </main>
  );
}

function Stat({ number, label }) {
  return (
    <article className="bm-stat">
      <strong>{number}</strong>
      <span>{label}</span>
    </article>
  );
}

function Step({ number, title, text }) {
  return (
    <article className="bm-step">
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function ProfileForm({ formData, setFormData, loading, matches, onGenerate }) {
  const score = clamp(matches?.company_summary?.market_readiness_score || 0);
  const animatedScore = useCounter(score);

  const setField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));

  return (
    <form className="bm-panel bm-profile-form" onSubmit={onGenerate}>
      <div className="bm-panel-title">
        <Target size={16} />
        <h2>Company Profile</h2>
      </div>

      <Field label="Company Name">
        <input
          value={formData.company_name}
          onChange={(event) => setField('company_name', event.target.value)}
          placeholder="Voltiq Energy Technology Co., Ltd."
        />
      </Field>

      <Field label="Product Description">
        <textarea
          rows="3"
          value={formData.product_description}
          onChange={(event) => setField('product_description', event.target.value)}
          placeholder="Modular LFP battery packs for residential and commercial storage"
        />
      </Field>

      <Field label="Business Model">
        <select value={formData.business_model} onChange={(event) => setField('business_model', event.target.value)}>
          <option value="">Select</option>
          {BUSINESS_MODELS.map((model) => (
            <option key={model}>{model}</option>
          ))}
        </select>
      </Field>

      <div className="bm-field-grid">
        <Field label="Target Market">
          <select value={formData.target_market} onChange={(event) => setField('target_market', event.target.value)}>
            {MARKETS.map((market) => (
              <option key={market}>{market}</option>
            ))}
          </select>
        </Field>
        <Field label="Stage">
          <select value={formData.company_stage} onChange={(event) => setField('company_stage', event.target.value)}>
            <option value="">Select</option>
            {STAGES.map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Sector">
        <select value={formData.sector} onChange={(event) => setField('sector', event.target.value)}>
          <option value="">Select</option>
          {SECTORS.map((sector) => (
            <option key={sector}>{sector}</option>
          ))}
        </select>
      </Field>

      <Field label="Biggest Concern">
        <textarea
          rows="2"
          value={formData.biggest_concern}
          onChange={(event) => setField('biggest_concern', event.target.value)}
          placeholder="EU battery regulation, certifications, partner access..."
        />
      </Field>

      <div className="bm-readiness">
        <div>
          <span className="bm-label">Readiness</span>
          <strong>{animatedScore}</strong>
        </div>
        <div className="bm-readiness-bar">
          <i style={{ '--target-width': `${score}%` }} />
        </div>
      </div>

      <button className="bm-button bm-button-primary bm-generate" disabled={loading} type="submit">
        {loading ? (
          <>
            <Loader2 className="bm-spin" size={16} />
            Generating
          </>
        ) : (
          <>
            Generate Report
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="bm-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function SectionNav({ activeSection, setActiveSection }) {
  return (
    <nav className="bm-panel bm-section-nav" aria-label="Report sections">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={activeSection === item.id ? 'is-active' : ''}
            onClick={() => setActiveSection(item.id)}
            type="button"
          >
            <Icon size={15} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function RegisteredPartners({ partners }) {
  if (!partners.length) return null;

  return (
    <div className="bm-panel bm-registered">
      <span className="bm-label">New Partners</span>
      {partners.slice(0, 3).map((partner) => (
        <div key={`${partner.company_name}-${partner.website || partner.contact_email}`}>
          <strong>{partner.company_name}</strong>
          <span>{partner.market || partner.country}</span>
        </div>
      ))}
    </div>
  );
}

function SummaryCard({ summary }) {
  const score = clamp(summary?.market_readiness_score || 0);
  const animatedScore = useCounter(score);
  const criticalInsight = useTyping(summary?.critical_insight || '', 18);

  return (
    <section className="bm-summary">
      <div>
        <span className="bm-label">Market Entry Intelligence Report</span>
        <h2>{summary?.name || 'Company Summary'}</h2>
        <p>{summary?.one_line_pitch}</p>
        <div className="bm-insight">
          <ShieldAlert size={14} />
          <span>{criticalInsight}</span>
        </div>
      </div>
      <div className="bm-score-tile">
        <strong>{animatedScore}</strong>
        <span>{summary?.market_readiness_label || 'Readiness'}</span>
      </div>
    </section>
  );
}

function MatchesSection({ partners, onEmail }) {
  return (
    <section className="bm-section">
      <div className="bm-section-heading compact">
        <span>Partner Matches</span>
        <h2>Vetted ICP Targets</h2>
      </div>
      <div className="bm-match-list">
        {partners.map((partner, index) => (
          <MatchCard key={`${partner.company_name}-${index}`} partner={partner} index={index} onEmail={onEmail} />
        ))}
      </div>
    </section>
  );
}

function MatchCard({ partner, index, onEmail }) {
  const scores = partner.scores || {};
  const overall = clamp(scores.overall || 0);
  const website = withProtocol(partner.website);

  return (
    <article
      className={`bm-match-card ${Number(partner.rank) === 1 ? 'is-featured' : ''}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="bm-card-top">
        <div>
          <div className="bm-title-row">
            <h3>{partner.company_name}</h3>
            {partner.is_verified && (
              <span className="bm-badge verified">
                <CheckCircle2 size={12} />
                Vetted Partner
              </span>
            )}
          </div>
          <p>
            {partner.country || 'Western market'} - {partner.sector || 'Sector'} - {partner.company_size || 'Company size n/a'}
          </p>
        </div>
        <div className="bm-match-score">
          <span>Score</span>
          <strong>{overall}</strong>
        </div>
      </div>

      <p className="bm-match-reason">{partner.why_they_match}</p>

      <div className="bm-score-grid">
        <ScoreBar label="Product fit" value={scores.product_fit} delay={0.05} />
        <ScoreBar label="Mkt readiness" value={scores.market_readiness} delay={0.1} />
        <ScoreBar label="Strategic val" value={scores.strategic_value} delay={0.15} />
        <ScoreBar label="Accessibility" value={scores.accessibility} delay={0.2} />
      </div>

      <div className="bm-match-footer">
        <div className="bm-trigger">
          <SignalBadge status={partner.buying_signal_status} />
          <span>{partner.buying_trigger}</span>
        </div>
        <div className="bm-card-actions">
          {website && (
            <a className="bm-icon-button" href={website} target="_blank" rel="noreferrer" aria-label="Open website">
              <ExternalLink size={14} />
            </a>
          )}
          <button className="bm-button bm-button-ghost small" onClick={() => onEmail(partner)} type="button">
            <Mail size={14} />
            Email
          </button>
        </div>
      </div>

      {partner.first_move && (
        <div className="bm-first-move">
          <span>First move</span>
          <p>{partner.first_move}</p>
        </div>
      )}
    </article>
  );
}

function ScoreBar({ label, value, maxValue = 25, delay = 0 }) {
  const score = clamp(value, 0, maxValue);

  return (
    <div>
      <div className="bm-scorebar-label">
        <span>{label}</span>
        <span>
          {score}/{maxValue}
        </span>
      </div>
      <div className="bm-scorebar-track">
        <div
          style={{
            '--target-width': `${(score / maxValue) * 100}%`,
            animation: `growBar 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s forwards`,
          }}
        />
      </div>
    </div>
  );
}

function SignalBadge({ status }) {
  if (!status || status === 'none') return null;

  return (
    <span className={`bm-signal signal-${status}`}>
      <Zap size={12} />
      {status}
    </span>
  );
}

function CompetitorSection({ competitors }) {
  return (
    <section className="bm-section">
      <div className="bm-section-heading compact">
        <span>Competitor Intelligence</span>
        <h2>Battlecards</h2>
      </div>
      <div className="bm-card-list">
        {competitors.map((competitor, index) => (
          <article className="bm-info-card" key={`${competitor.company_name}-${index}`}>
            <div className="bm-card-top">
              <div>
                <div className="bm-title-row">
                  <h3>{competitor.company_name}</h3>
                  <span className={`bm-badge severity-${String(competitor.threat_level || 'Medium').toLowerCase()}`}>
                    {competitor.threat_level || 'Medium'}
                  </span>
                </div>
                <p>{competitor.country}</p>
              </div>
              <span className="bm-rank">#{competitor.rank || index + 1}</span>
            </div>
            <dl className="bm-battlecard">
              <div>
                <dt>What they sell</dt>
                <dd>{competitor.what_they_sell}</dd>
              </div>
              <div>
                <dt>Who they target</dt>
                <dd>{competitor.who_they_target}</dd>
              </div>
              <div>
                <dt>Positioning</dt>
                <dd>{competitor.positioning}</dd>
              </div>
              <div>
                <dt>Pricing signal</dt>
                <dd>{competitor.pricing_signal || 'Not publicly disclosed'}</dd>
              </div>
            </dl>
            <div className="bm-weakness">
              <span>Exploit this gap</span>
              <p>{competitor.weakness}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActionPlanSection({ actionPlan }) {
  const weeks = actionPlan?.weeks || [];

  return (
    <section className="bm-section">
      <div className="bm-plan-card">
        <div className="bm-section-heading compact">
          <span>90-Day Market Entry Plan</span>
          <h2>Timeline: {actionPlan?.market_entry_timeline || 'Pending'}</h2>
        </div>

        <div className="bm-timeline">
          {weeks.map((week, index) => (
            <article className="bm-week" key={`${week.period}-${index}`}>
              <div className="bm-week-period">
                <span>{week.period}</span>
                <b>{index + 1}</b>
              </div>
              <div className="bm-week-body">
                <h3>{week.theme}</h3>
                <ul>
                  {(week.actions || []).map((action) => (
                    <li key={action}>
                      <CheckCircle2 size={14} />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>Milestone:</strong> {week.milestone}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="bm-tomorrow">
          <span>Do This Tomorrow</span>
          <p>{actionPlan?.first_action_tomorrow}</p>
        </div>
      </div>
    </section>
  );
}

function RiskSection({ risks }) {
  return (
    <section className="bm-section">
      <div className="bm-section-heading compact">
        <span>Risk Assessment</span>
        <h2>Entry Risks</h2>
      </div>
      <div className="bm-card-list">
        {risks.map((risk, index) => {
          const severity = String(risk.severity || 'Medium').toLowerCase();
          return (
            <article className={`bm-risk-card severity-${severity}`} key={`${risk.risk_title}-${index}`}>
              <div className="bm-card-top">
                <div>
                  <div className="bm-title-row">
                    <h3>{risk.risk_title}</h3>
                    <span className={`bm-badge severity-${severity}`}>{risk.severity || 'Medium'}</span>
                  </div>
                  <p>
                    {risk.risk_type} - Probability: {risk.probability}
                  </p>
                </div>
                <span className="bm-rank">#{risk.rank || index + 1}</span>
              </div>
              <p className="bm-risk-description">{risk.description}</p>
              <div className="bm-mitigation">
                <span>Mitigation</span>
                <p>{risk.mitigation}</p>
              </div>
              <div className="bm-cost">
                <ShieldAlert size={14} />
                <span>Cost of ignoring: {risk.cost_of_ignoring}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function LoadingSkeletons() {
  return (
    <div className="bm-skeletons">
      <Skeleton height={80} />
      <Skeleton height={140} />
      <Skeleton height={140} />
      <Skeleton height={120} />
    </div>
  );
}

function Skeleton({ height = 120 }) {
  return <div className="bm-skeleton" style={{ height }} />;
}

function EmptyReport() {
  return (
    <div className="bm-empty">
      <Rocket size={40} />
      <h2>Ready for your first intelligence report</h2>
      <p>Generate a market entry brief from the company profile.</p>
    </div>
  );
}

function EmailModal({ modal, content, loading, onClose, onRegenerate }) {
  if (!modal) return null;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Email copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="bm-modal-backdrop">
      <div className="bm-modal bm-email-modal">
        <div className="bm-modal-header">
          <div>
            <h2>Outreach Engine</h2>
            <p>Drafting email to: {modal.partner.company_name}</p>
          </div>
          <button className="bm-icon-button" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="bm-email-body">
          {loading ? (
            <div className="bm-email-loading">
              <Loader2 className="bm-spin" size={18} />
              Writing culturally calibrated outreach...
            </div>
          ) : (
            <p>{content}</p>
          )}
        </div>

        <div className="bm-modal-footer">
          <button className="bm-button bm-button-ghost" onClick={onRegenerate} disabled={loading} type="button">
            <RefreshCw size={15} />
            Regenerate
          </button>
          <button className="bm-button bm-button-primary" onClick={copyEmail} disabled={!content || loading} type="button">
            <Copy size={15} />
            Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnerModal({ isOpen, loading, onClose, onSubmit, isAuthenticated }) {
  const [form, setForm] = useState(INITIAL_PARTNER_FORM);

  if (!isOpen) return null;

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="bm-modal-backdrop">
      <div className="bm-modal bm-partner-modal">
        <div className="bm-modal-header">
          <div>
            <h2>Become a Partner</h2>
            <p>Register a Western company for the vetted partner network.</p>
          </div>
          <button className="bm-icon-button" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {!isAuthenticated && (
          <div className="bm-auth-note">
            Partner registration uses authenticated Supabase inserts. Log in before submitting.
          </div>
        )}

        <form className="bm-modal-form" onSubmit={submit}>
          <div className="bm-field-grid">
            <Field label="Company Name">
              <input required value={form.company_name} onChange={(event) => setField('company_name', event.target.value)} />
            </Field>
            <Field label="Contact Email">
              <input
                required
                type="email"
                value={form.contact_email}
                onChange={(event) => setField('contact_email', event.target.value)}
              />
            </Field>
          </div>

          <div className="bm-field-grid">
            <Field label="Sector">
              <select value={form.sector} onChange={(event) => setField('sector', event.target.value)}>
                {SECTORS.map((sector) => (
                  <option key={sector}>{sector}</option>
                ))}
              </select>
            </Field>
            <Field label="Market">
              <select value={form.market} onChange={(event) => setField('market', event.target.value)}>
                {MARKETS.map((market) => (
                  <option key={market}>{market}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="bm-field-grid">
            <Field label="Country">
              <input value={form.country} onChange={(event) => setField('country', event.target.value)} />
            </Field>
            <Field label="Website">
              <input value={form.website} onChange={(event) => setField('website', event.target.value)} />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              required
              rows="4"
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
            />
          </Field>

          <div className="bm-modal-footer">
            <button className="bm-button bm-button-ghost" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="bm-button bm-button-primary" disabled={loading} type="submit">
              {loading ? (
                <>
                  <Loader2 className="bm-spin" size={15} />
                  Registering
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AuthModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Account created. Check your email if confirmation is enabled.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back');
        onClose();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-modal-backdrop">
      <div className="bm-modal bm-auth-modal">
        <div className="bm-modal-header">
          <div>
            <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p>{isSignUp ? 'Start building Western entry briefs.' : 'Log in to open BridgeMatch.'}</p>
          </div>
          <button className="bm-icon-button" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form className="bm-modal-form" onSubmit={handleAuth}>
          <Field label="Email Address">
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              minLength="6"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
          </Field>
          <button className="bm-button bm-button-primary bm-full" disabled={loading} type="submit">
            {loading ? (
              <>
                <Loader2 className="bm-spin" size={15} />
                Processing
              </>
            ) : isSignUp ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <button className="bm-auth-switch" onClick={() => setIsSignUp((value) => !value)} type="button">
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
