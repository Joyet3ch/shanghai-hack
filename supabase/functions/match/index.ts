import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Partner = {
  company_name: string;
  sector?: string;
  market?: string;
  country?: string;
  description?: string;
  website?: string | null;
  is_verified?: boolean;
};

type Profile = {
  company_name: string;
  product_description: string;
  business_model?: string;
  target_market?: string;
  sector: string;
  company_stage?: string;
  biggest_concern?: string;
};

const STARTER_PARTNERS: Partner[] = [
  {
    company_name: "Sonnen GmbH",
    sector: "Clean Energy",
    market: "Europe",
    country: "Germany",
    description: "Leading residential battery storage manufacturer, diversifying supply chain",
    website: "https://sonnen.de",
    is_verified: true,
  },
  {
    company_name: "BayWa r.e.",
    sector: "Clean Energy",
    market: "Europe",
    country: "Germany",
    description: "Europe largest solar distributor, sourcing Asian storage hardware",
    website: "https://baywa-re.com",
    is_verified: true,
  },
  {
    company_name: "Eneco",
    sector: "Clean Energy",
    market: "Europe",
    country: "Netherlands",
    description: "Dutch utility expanding residential battery program",
    website: "https://eneco.com",
    is_verified: true,
  },
  {
    company_name: "Rhenus Logistics",
    sector: "Robotics",
    market: "Europe",
    country: "Germany",
    description: "Large logistics operator investing heavily in warehouse automation",
    website: "https://rhenus.group",
    is_verified: true,
  },
  {
    company_name: "Stellantis",
    sector: "EV & Battery",
    market: "Europe",
    country: "Netherlands",
    description: "Major automotive group accelerating EV transition globally",
    website: "https://stellantis.com",
    is_verified: true,
  },
  {
    company_name: "Nexamp",
    sector: "Clean Energy",
    market: "North America",
    country: "USA",
    description: "Community solar developer scaling across the US",
    website: "https://nexamp.com",
    is_verified: true,
  },
  {
    company_name: "Plug Power",
    sector: "Clean Energy",
    market: "North America",
    country: "USA",
    description: "Hydrogen fuel cell company expanding product portfolio",
    website: "https://plugpower.com",
    is_verified: true,
  },
  {
    company_name: "Comau",
    sector: "Robotics",
    market: "Europe",
    country: "Italy",
    description: "Industrial automation system integrator distributing across Europe",
    website: "https://comau.com",
    is_verified: true,
  },
  {
    company_name: "Tier Mobility",
    sector: "Autonomous Driving",
    market: "Europe",
    country: "Germany",
    description: "Europe largest shared e-scooter operator, sourcing mobility tech",
    website: "https://tier.app",
    is_verified: true,
  },
  {
    company_name: "MediaMarkt",
    sector: "Consumer Tech",
    market: "Europe",
    country: "Germany",
    description: "Europe largest consumer electronics retailer, sourcing new brands",
    website: "https://mediamarkt.de",
    is_verified: true,
  },
  {
    company_name: "Sunrun",
    sector: "Clean Energy",
    market: "North America",
    country: "USA",
    description: "Residential solar and storage provider with installer and hardware ecosystem",
    website: "https://sunrun.com",
    is_verified: false,
  },
  {
    company_name: "Sunnova",
    sector: "Clean Energy",
    market: "North America",
    country: "USA",
    description: "Residential solar, battery storage, and energy services provider",
    website: "https://sunnova.com",
    is_verified: false,
  },
  {
    company_name: "Rockwell Automation",
    sector: "Robotics",
    market: "North America",
    country: "USA",
    description: "Industrial automation company serving North American manufacturers",
    website: "https://rockwellautomation.com",
    is_verified: false,
  },
  {
    company_name: "Best Buy",
    sector: "Consumer Tech",
    market: "North America",
    country: "USA",
    description: "Major North American consumer electronics retailer and channel partner",
    website: "https://bestbuy.com",
    is_verified: false,
  },
  {
    company_name: "ChargePoint",
    sector: "Autonomous Driving",
    market: "North America",
    country: "USA",
    description: "EV charging network and fleet electrification platform",
    website: "https://chargepoint.com",
    is_verified: false,
  },
];

const COMPETITOR_BANK = {
  Europe: [
    {
      company_name: "VARTA",
      country: "Germany",
      what_they_sell: "Battery storage systems and energy storage hardware for European buyers",
      who_they_target: "Installers, OEMs, distributors, and premium residential/commercial buyers",
      positioning: "Local European trust, documentation, and certification familiarity.",
      pricing_signal: "Premium",
      weakness: "Higher cost and slower customization create room for modular Asian suppliers with credible compliance.",
      threat_level: "High",
    },
    {
      company_name: "sonnen",
      country: "Germany",
      what_they_sell: "Residential battery storage systems and energy management solutions",
      who_they_target: "Residential installers, energy retailers, and distributed energy programs",
      positioning: "Strong brand, local service, and established European energy community.",
      pricing_signal: "Premium",
      weakness: "A focused entrant can compete in B2B channels where price, modularity, and fast delivery matter more than brand.",
      threat_level: "High",
    },
    {
      company_name: "Solarwatt",
      country: "Germany",
      what_they_sell: "Solar modules, storage, and home energy systems",
      who_they_target: "European installers and residential energy customers",
      positioning: "Integrated European clean-energy system provider.",
      pricing_signal: "Upper-mid market",
      weakness: "Less flexible for private-label or channel-specific hardware bundles.",
      threat_level: "Medium",
    },
  ],
  "North America": [
    {
      company_name: "Tesla Energy",
      country: "USA",
      what_they_sell: "Powerwall and commercial energy storage products for homes and businesses",
      who_they_target: "Residential installers, homeowners, utilities, and commercial energy buyers",
      positioning: "Category-defining brand with integrated software and installer demand.",
      pricing_signal: "Premium",
      weakness: "Channel partners may seek alternatives with better availability, margin, and customization.",
      threat_level: "Critical",
    },
    {
      company_name: "Enphase Energy",
      country: "USA",
      what_they_sell: "Microinverters, batteries, and home energy management systems",
      who_they_target: "Solar installers and residential energy channels",
      positioning: "Installer-trusted ecosystem with strong software and service support.",
      pricing_signal: "Premium",
      weakness: "A modular battery specialist can win where pack economics and integration flexibility matter.",
      threat_level: "High",
    },
    {
      company_name: "Generac",
      country: "USA",
      what_they_sell: "Backup power, battery storage, and distributed energy products",
      who_they_target: "Home energy dealers, installers, and commercial backup-power buyers",
      positioning: "Trusted North American backup-power brand with extensive dealer reach.",
      pricing_signal: "Upper-mid market",
      weakness: "Dealer channels may consider lower-cost storage hardware if warranty and support are credible.",
      threat_level: "High",
    },
  ],
};

const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeName = (value: unknown) => normalize(value).replace(/[^a-z0-9]/g, "");

const canonicalMarket = (targetMarket?: string) => {
  const value = normalize(targetMarket);
  if (value.includes("north")) return "North America";
  if (value.includes("both")) return "Both";
  return "Europe";
};

const regionFromText = (value: unknown) => {
  const text = normalize(value);
  if (!text) return "";

  if (
    text.includes("north america") ||
    text.includes("usa") ||
    text.includes("u.s.") ||
    text.includes("united states") ||
    text.includes("america") ||
    text.includes("canada")
  ) {
    return "North America";
  }

  const europeanMarkers = [
    "europe",
    "germany",
    "france",
    "netherlands",
    "italy",
    "spain",
    "portugal",
    "uk",
    "united kingdom",
    "ireland",
    "switzerland",
    "austria",
    "belgium",
    "denmark",
    "sweden",
    "norway",
    "finland",
    "poland",
    "czech",
    "romania",
    "hungary",
    "greece",
    "luxembourg",
  ];

  return europeanMarkers.some((marker) => text.includes(marker)) ? "Europe" : "";
};

const itemRegion = (item: { market?: unknown; country?: unknown }) =>
  regionFromText(item.market) || regionFromText(item.country);

const isInTargetMarket = (item: { market?: unknown; country?: unknown }, targetMarket?: string) => {
  const target = canonicalMarket(targetMarket);
  const region = itemRegion(item);

  if (target === "Both") return region === "Europe" || region === "North America";
  return region === target;
};

const regionInstruction = (targetMarket?: string) => {
  const target = canonicalMarket(targetMarket);

  if (target === "North America") {
    return [
      'TARGET MARKET LOCK: "North America" means USA and Canada only.',
      "Do not include Germany, Netherlands, France, Italy, UK, Nordics, or any other European country in icp_matches or competitor_intelligence.",
      "Every country field must be USA, United States, or Canada.",
    ].join("\n");
  }

  if (target === "Both") {
    return [
      'TARGET MARKET LOCK: "Both" means Europe plus North America.',
      "icp_matches must contain at least 2 North American companies and at least 2 European companies.",
      "competitor_intelligence must include companies active in both regions, not only Europe.",
    ].join("\n");
  }

  return [
    'TARGET MARKET LOCK: "Europe" means EU countries, UK, Switzerland, Norway, and nearby European markets.',
    "Do not include USA or Canada in icp_matches or competitor_intelligence.",
    "Every country field must be a European country or Europe-specific market presence.",
  ].join("\n");
};

const sectorFitScore = (sector?: string, partnerSector?: string) => {
  const source = normalize(sector);
  const target = normalize(partnerSector);
  let score = 0;

  if (!source || !target) return score;
  if (source.includes(target) || target.includes(source)) score += 4;
  if (source.includes("clean") && target.includes("clean")) score += 4;
  if ((source.includes("battery") || source.includes("energy")) && (target.includes("battery") || target.includes("energy"))) score += 3;
  if (source.includes("robot") && target.includes("robot")) score += 4;
  if (source.includes("mobility") && (target.includes("mobility") || target.includes("autonomous"))) score += 4;
  if (source.includes("consumer") && target.includes("consumer")) score += 4;
  if ((source.includes("software") || source.includes("ai")) && (target.includes("software") || target.includes("ai"))) score += 4;

  return score;
};

const uniquePartners = (partners: Partner[]) => {
  const seen = new Set<string>();
  return partners.filter((partner) => {
    const key = normalizeName(partner.company_name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const mergePartners = (partners: Partner[]) => uniquePartners([...STARTER_PARTNERS, ...partners]);

const getRelevantPartners = (sector: string, targetMarket: string | undefined, partners: Partner[]) =>
  mergePartners(partners)
    .filter((partner) => isInTargetMarket(partner, targetMarket))
    .map((partner) => ({
      partner,
      score: sectorFitScore(sector, partner.sector),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ partner }) => partner)
    .slice(0, 8);

const extractJsonObject = (value: unknown) => {
  const trimmed = String(value ?? "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) return trimmed;
  return trimmed.slice(first, last + 1);
};

const fallbackPartnersForTarget = (profile: Profile, partners: Partner[]) => {
  const relevant = getRelevantPartners(profile.sector, profile.target_market, partners);
  const target = canonicalMarket(profile.target_market);
  const defaults = target === "North America"
    ? STARTER_PARTNERS.filter((partner) => partner.market === "North America")
    : target === "Both"
    ? STARTER_PARTNERS.filter((partner) => partner.market === "North America" || partner.market === "Europe")
    : STARTER_PARTNERS.filter((partner) => partner.market === "Europe");

  const eligible = uniquePartners([...relevant, ...defaults, ...STARTER_PARTNERS]).filter((partner) =>
    isInTargetMarket(partner, profile.target_market)
  );

  if (target !== "Both") return eligible.slice(0, 5);

  const europe = eligible.filter((partner) => itemRegion(partner) === "Europe");
  const northAmerica = eligible.filter((partner) => itemRegion(partner) === "North America");

  return uniquePartners([
    europe[0],
    northAmerica[0],
    europe[1],
    northAmerica[1],
    europe[2],
    northAmerica[2],
  ].filter(Boolean) as Partner[]).slice(0, 5);
};

const createMatchFromPartner = (profile: Profile, partner: Partner, index: number) => {
  const base = [88, 84, 81, 78, 75][index] || 74;
  const scores = {
    product_fit: Math.max(16, 23 - Math.floor(index / 2)),
    market_readiness: Math.max(16, 22 - Math.floor(index / 2)),
    strategic_value: Math.max(16, 23 - index),
    accessibility: Math.max(15, 21 - index),
    overall: base,
  };

  return {
    rank: index + 1,
    company_name: partner.company_name,
    is_verified: Boolean(partner.is_verified),
    website: partner.website || null,
    country: partner.country || (partner.market === "North America" ? "USA" : "Germany"),
    sector: partner.sector || profile.sector,
    company_size: index < 2 ? "1,000-5,000 employees" : "200-1,000 employees",
    why_they_match: `${partner.company_name} fits ${profile.company_name} because it operates in the exact ${canonicalMarket(profile.target_market)} channel where the product needs early proof. The strongest entry angle is a low-risk pilot backed by certification evidence, delivery reliability, and clear local support.`,
    decision_maker_title: index < 2 ? "Strategic Procurement Manager" : "Head of Partnerships",
    buying_trigger: profile.biggest_concern
      ? `The likely buying objection is ${profile.biggest_concern}; a concrete certification and pilot plan turns that risk into a credible first conversation.`
      : "The company is exposed to supplier diversification, energy transition, or automation pressure in its local market.",
    buying_signal_status: index < 2 ? "warm" : "cool",
    scores,
    first_move: `Send ${partner.company_name} a one-page technical dossier, certification roadmap, and a proposed 20-minute pilot-fit call this week.`,
  };
};

const normalizeReport = (report: any, profile: Profile, partners: Partner[]) => {
  const target = canonicalMarket(profile.target_market);
  const partnerByName = new Map(
    mergePartners(partners).map((partner) => [normalizeName(partner.company_name), partner]),
  );

  const cleanMatches = Array.isArray(report?.icp_matches)
    ? report.icp_matches.filter((match: any) => isInTargetMarket(match, profile.target_market))
    : [];

  const fallbackMatches = fallbackPartnersForTarget(profile, partners).map((partner, index) =>
    createMatchFromPartner(profile, partner, cleanMatches.length + index)
  );

  const seenMatches = new Set<string>();
  const allMatches = [...cleanMatches, ...fallbackMatches]
    .filter((match: any) => {
      const key = normalizeName(match.company_name);
      if (!key || seenMatches.has(key)) return false;
      seenMatches.add(key);
      return isInTargetMarket(match, profile.target_market);
    });

  const balancedMatches = [
      allMatches.find((match: any) => itemRegion(match) === "Europe"),
      allMatches.find((match: any) => itemRegion(match) === "North America"),
      ...allMatches.filter((match: any) => itemRegion(match) === "Europe").slice(1, 3),
      ...allMatches.filter((match: any) => itemRegion(match) === "North America").slice(1, 3),
    ].filter(Boolean) as Partner[];

  const selectedMatches = target === "Both"
    ? uniquePartners(balancedMatches).slice(0, 5)
    : allMatches.slice(0, 5);

  const icp_matches = selectedMatches
    .map((match: any, index: number) => {
      const verified = partnerByName.get(normalizeName(match.company_name));
      const scores = match.scores || {};
      const overall =
        Number(scores.overall) ||
        Number(scores.product_fit || 0) +
          Number(scores.market_readiness || 0) +
          Number(scores.strategic_value || 0) +
          Number(scores.accessibility || 0);

      return {
        ...match,
        rank: index + 1,
        is_verified: Boolean(match.is_verified || verified?.is_verified),
        website: match.website || verified?.website || null,
        country: match.country || verified?.country || (target === "North America" ? "USA" : "Germany"),
        sector: match.sector || verified?.sector || profile.sector,
        buying_signal_status: match.buying_signal_status || (index < 2 ? "warm" : "cool"),
        scores: {
          product_fit: Number(scores.product_fit) || 20,
          market_readiness: Number(scores.market_readiness) || 20,
          strategic_value: Number(scores.strategic_value) || 20,
          accessibility: Number(scores.accessibility) || 18,
          overall: overall || 78,
        },
      };
    });

  const competitorSource = target === "Both"
    ? [...COMPETITOR_BANK["North America"].slice(0, 2), ...COMPETITOR_BANK.Europe.slice(0, 2)]
    : COMPETITOR_BANK[target as "Europe" | "North America"];

  const cleanCompetitors = Array.isArray(report?.competitor_intelligence)
    ? report.competitor_intelligence.filter((competitor: any) =>
      target === "Both"
        ? isInTargetMarket(competitor, "Europe") || isInTargetMarket(competitor, "North America")
        : isInTargetMarket(competitor, profile.target_market)
    )
    : [];

  const seenCompetitors = new Set<string>();
  const allCompetitors = [...cleanCompetitors, ...competitorSource]
    .filter((competitor: any) => {
      const key = normalizeName(competitor.company_name);
      if (!key || seenCompetitors.has(key)) return false;
      seenCompetitors.add(key);
      return target === "Both"
        ? isInTargetMarket(competitor, "Europe") || isInTargetMarket(competitor, "North America")
        : isInTargetMarket(competitor, profile.target_market);
    });

  const selectedCompetitors = target === "Both"
    ? [
      allCompetitors.find((competitor: any) => itemRegion(competitor) === "Europe"),
      allCompetitors.find((competitor: any) => itemRegion(competitor) === "North America"),
      ...allCompetitors.filter((competitor: any) => itemRegion(competitor) === "Europe").slice(1, 2),
      ...allCompetitors.filter((competitor: any) => itemRegion(competitor) === "North America").slice(1, 2),
    ].filter(Boolean).slice(0, 3)
    : allCompetitors.slice(0, 3);

  const competitor_intelligence = selectedCompetitors
    .map((competitor: any, index: number) => ({
      rank: index + 1,
      company_name: competitor.company_name,
      country: competitor.country || (target === "North America" ? "USA" : "Germany"),
      what_they_sell: competitor.what_they_sell || "Competing products and services in the target market",
      who_they_target: competitor.who_they_target || "Enterprise buyers, channel partners, and procurement teams",
      positioning: competitor.positioning || "Established local trust and lower perceived market-entry risk.",
      pricing_signal: competitor.pricing_signal || null,
      weakness: competitor.weakness || "Less flexibility on customization, economics, or channel-specific pilot structure.",
      threat_level: competitor.threat_level || "Medium",
    }));

  const weeks = Array.isArray(report?.action_plan?.weeks) && report.action_plan.weeks.length
    ? report.action_plan.weeks
    : [
      {
        period: "Week 1-2",
        theme: "Compliance & Market Lock",
        actions: [
          `Validate requirements for ${target} before broad outreach.`,
          "Define the first buyer segment and country/state beachhead.",
          "Prepare a buyer-ready technical and commercial dossier.",
        ],
        milestone: "The first target segment and compliance blockers are clear.",
      },
      {
        period: "Week 3-4",
        theme: "Partner Targeting",
        actions: [
          "Build a 30-account partner list in the selected market.",
          "Map procurement, technical, and partnership decision makers.",
          "Create three localized outreach angles.",
        ],
        milestone: "Top accounts and decision makers are ready for outbound.",
      },
      {
        period: "Week 5-6",
        theme: "Pilot Offer",
        actions: [
          "Define sample terms, support SLA, testing criteria, and success metrics.",
          "Start outreach to the first 10 accounts.",
          "Track objections and update sales materials.",
        ],
        milestone: "At least five qualified partner conversations are active.",
      },
      {
        period: "Week 7-8",
        theme: "Technical Validation",
        actions: [
          "Share technical files under NDA with qualified prospects.",
          "Run engineering and procurement review calls.",
          "Convert repeated objections into FAQ and evidence materials.",
        ],
        milestone: "Two prospects enter technical evaluation.",
      },
      {
        period: "Week 9-10",
        theme: "Commercial Setup",
        actions: [
          "Finalize landed cost, warranty, payment, and pilot volume assumptions.",
          "Identify local support, logistics, or service partners.",
          "Negotiate one pilot agreement with clear conversion criteria.",
        ],
        milestone: "A pilot agreement is drafted or in final review.",
      },
      {
        period: "Week 11-12",
        theme: "Board-Ready Decision",
        actions: [
          "Summarize traction, objections, conversion probability, and budget.",
          "Decide whether to double down, adjust the segment, or pause for compliance.",
          "Create the next 6-month operating plan.",
        ],
        milestone: "Leadership has a go/no-go decision and execution plan.",
      },
    ];

  return {
    company_summary: {
      name: report?.company_summary?.name || profile.company_name,
      one_line_pitch:
        report?.company_summary?.one_line_pitch ||
        `${profile.company_name} helps ${target} buyers adopt ${profile.product_description} through a ${profile.business_model || "B2B"} partnership model.`,
      market_readiness_score: Number(report?.company_summary?.market_readiness_score) || 76,
      market_readiness_label: report?.company_summary?.market_readiness_label || "Ready",
      critical_insight:
        report?.company_summary?.critical_insight ||
        `The market-entry plan must be built around ${target}, not generic Western expansion.`,
    },
    icp_matches,
    competitor_intelligence,
    action_plan: {
      market_entry_timeline: report?.action_plan?.market_entry_timeline || "6-9 months",
      weeks,
      first_action_tomorrow:
        report?.action_plan?.first_action_tomorrow ||
        `Validate the top compliance and channel blocker for ${target} before sending broad partner outreach.`,
    },
    risk_assessment: Array.isArray(report?.risk_assessment) && report.risk_assessment.length
      ? report.risk_assessment.slice(0, 3).map((risk: any, index: number) => ({
        rank: index + 1,
        risk_title: risk.risk_title || "Market-entry execution risk",
        risk_type: risk.risk_type || "Operational",
        severity: risk.severity || "High",
        description: risk.description || `This risk is specific to entering ${target} with limited local proof.`,
        probability: risk.probability || "Medium",
        mitigation: risk.mitigation || "Validate requirements with local experts and qualified partners before scaling outreach.",
        cost_of_ignoring: risk.cost_of_ignoring || "Delayed market entry, weak conversion, and wasted outreach cycles.",
      }))
      : [
        {
          rank: 1,
          risk_title: "Wrong-region market assumptions",
          risk_type: "Operational",
          severity: "High",
          description: `Using European assumptions for ${target} can distort partner targeting, compliance planning, and competitive positioning.`,
          probability: "High",
          mitigation: `Build the first account list, certification checklist, and competitor map specifically for ${target}.`,
          cost_of_ignoring: "Low reply rates, delayed pilots, and a board plan that does not match the actual target market.",
        },
      ],
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const profile = await req.json() as Profile;
    const {
      company_name,
      product_description,
      business_model,
      target_market,
      sector,
      company_stage,
      biggest_concern,
    } = profile;

    if (!company_name || !product_description || !sector) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const orbitKey = Deno.env.get("ORBIT_API_KEY");

    let dbPartners: Partner[] = [];
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("partners").select("*").limit(50);
      if (Array.isArray(data)) dbPartners = data;
    }

    const vettedPartners = getRelevantPartners(sector, target_market, dbPartners);
    const target = canonicalMarket(target_market);

    if (!orbitKey) {
      const report = normalizeReport({}, profile, dbPartners);
      return new Response(JSON.stringify({ ...report, _meta: { source: "fallback", reason: "missing_orbit_api_key" } }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are WestReady, an elite GTM strategist specialized in helping Chinese startups enter Western markets.

${regionInstruction(target)}

VETTED PARTNERS DATABASE:
This database has already been filtered for target market "${target}". Prioritize these partners only when sector and product fit are credible:
${JSON.stringify(vettedPartners)}

BEHAVIOR RULES:
- Return ONLY valid JSON. No markdown fences, no preamble, no explanation.
- Every insight must be specific to this exact company. No generic advice.
- The target market is "${target}". This overrides all other instructions and all prior examples.
- Do not include companies outside "${target}" in icp_matches or competitor_intelligence.
- For North America, use USA/Canada partners and competitors only.
- For Europe, use European partners and competitors only.
- For Both, mix Europe and North America; do not return a Europe-only list.
- All score fields must be numbers, not strings.
- For icp_matches: list filtered vetted partners first if they fit sector and market, then add AI-generated matches to reach 5 total. Set is_verified false for AI-generated.

TINDER SCORING SYSTEM:
Score each ICP match across 4 dimensions, 0-25 each:
- product_fit: How precisely does their procurement need match this product?
- market_readiness: Are they actively buying this category right now?
- strategic_value: Is winning them a reference that opens more doors?
- accessibility: Can a Chinese startup realistically reach and close them?
overall = sum of all 4, 0-100.

BUYING SIGNAL CLASSIFICATION:
"hot" = Active tender, job posting for procurement role, or public sourcing statement
"warm" = Recent funding, expansion announcement, or competitor made similar purchase
"cool" = General market growth signal only
"none" = No active signal detected

REQUIRED JSON SCHEMA:
{
  "company_summary": {
    "name": "string",
    "one_line_pitch": "string",
    "market_readiness_score": number,
    "market_readiness_label": "Not Ready | Early Stage | Ready | Well Positioned",
    "critical_insight": "string"
  },
  "icp_matches": [
    {
      "rank": number,
      "company_name": "string",
      "is_verified": boolean,
      "website": "string or null",
      "country": "string",
      "sector": "string",
      "company_size": "string",
      "why_they_match": "string",
      "decision_maker_title": "string",
      "buying_trigger": "string",
      "buying_signal_status": "hot | warm | cool | none",
      "scores": {
        "product_fit": number,
        "market_readiness": number,
        "strategic_value": number,
        "accessibility": number,
        "overall": number
      },
      "first_move": "string"
    }
  ],
  "competitor_intelligence": [
    {
      "rank": number,
      "company_name": "string",
      "country": "string",
      "what_they_sell": "string",
      "who_they_target": "string",
      "positioning": "string",
      "pricing_signal": "string or null",
      "weakness": "string",
      "threat_level": "Low | Medium | High | Critical"
    }
  ],
  "action_plan": {
    "market_entry_timeline": "string",
    "weeks": [
      {
        "period": "string",
        "theme": "string",
        "actions": ["string", "string", "string"],
        "milestone": "string"
      }
    ],
    "first_action_tomorrow": "string"
  },
  "risk_assessment": [
    {
      "rank": number,
      "risk_title": "string",
      "risk_type": "Regulatory | Cultural | Competitive | Operational",
      "severity": "Low | Medium | High | Critical",
      "description": "string",
      "probability": "Low | Medium | High",
      "mitigation": "string",
      "cost_of_ignoring": "string"
    }
  ]
}`;

    const userPrompt = `Analyze this Chinese startup and generate the complete Market Entry Intelligence Report.

TARGET MARKET: ${target}
${regionInstruction(target)}

COMPANY PROFILE:
Name: ${company_name}
Product: ${product_description}
Business Model: ${business_model || "N/A"}
Target Market: ${target}
Sector: ${sector}
Stage: ${company_stage || "N/A"}
Biggest Concern: ${biggest_concern || "Market entry barriers"}

Generate exactly 5 icp_matches, 3 competitor_intelligence entries, 6 action_plan weeks from Week 1-2 through Week 11-12, and 3 risk_assessment entries.
Return ONLY the JSON object. Nothing else.`;

    const response = await fetch("https://aiapi.orbitai.global/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${orbitKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 3200,
      }),
    });

    if (!response.ok) {
      const report = normalizeReport({}, profile, dbPartners);
      return new Response(JSON.stringify({ ...report, _meta: { source: "fallback", reason: `orbit_http_${response.status}` } }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    const rawContent = aiData?.choices?.[0]?.message?.content;
    const parsed = rawContent ? JSON.parse(extractJsonObject(rawContent)) : {};
    const report = normalizeReport(parsed, profile, dbPartners);

    return new Response(JSON.stringify({ ...report, _meta: { source: "ai", target_market: target } }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
