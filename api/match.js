export const config = { runtime: 'edge' };

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const STARTER_PARTNERS = [
  {
    company_name: 'Sonnen GmbH',
    sector: 'Clean Energy',
    market: 'Europe',
    country: 'Germany',
    description: 'Leading residential battery storage manufacturer, diversifying supply chain',
    website: 'https://sonnen.de',
    is_verified: true,
  },
  {
    company_name: 'BayWa r.e.',
    sector: 'Clean Energy',
    market: 'Europe',
    country: 'Germany',
    description: 'Europe largest solar distributor, sourcing Asian storage hardware',
    website: 'https://baywa-re.com',
    is_verified: true,
  },
  {
    company_name: 'Eneco',
    sector: 'Clean Energy',
    market: 'Europe',
    country: 'Netherlands',
    description: 'Dutch utility expanding residential battery program',
    website: 'https://eneco.com',
    is_verified: true,
  },
  {
    company_name: 'Rhenus Logistics',
    sector: 'Robotics',
    market: 'Europe',
    country: 'Germany',
    description: 'Large logistics operator investing heavily in warehouse automation',
    website: 'https://rhenus.group',
    is_verified: true,
  },
  {
    company_name: 'Stellantis',
    sector: 'EV & Battery',
    market: 'Europe',
    country: 'Netherlands',
    description: 'Major automotive group accelerating EV transition globally',
    website: 'https://stellantis.com',
    is_verified: true,
  },
  {
    company_name: 'Nexamp',
    sector: 'Clean Energy',
    market: 'North America',
    country: 'USA',
    description: 'Community solar developer scaling across the US',
    website: 'https://nexamp.com',
    is_verified: true,
  },
  {
    company_name: 'Plug Power',
    sector: 'Clean Energy',
    market: 'North America',
    country: 'USA',
    description: 'Hydrogen fuel cell company expanding product portfolio',
    website: 'https://plugpower.com',
    is_verified: true,
  },
  {
    company_name: 'Comau',
    sector: 'Robotics',
    market: 'Europe',
    country: 'Italy',
    description: 'Industrial automation system integrator distributing across Europe',
    website: 'https://comau.com',
    is_verified: true,
  },
  {
    company_name: 'Tier Mobility',
    sector: 'Autonomous Driving',
    market: 'Europe',
    country: 'Germany',
    description: 'Europe largest shared e-scooter operator, sourcing mobility tech',
    website: 'https://tier.app',
    is_verified: true,
  },
  {
    company_name: 'MediaMarkt',
    sector: 'Consumer Tech',
    market: 'Europe',
    country: 'Germany',
    description: 'Europe largest consumer electronics retailer, sourcing new brands',
    website: 'https://mediamarkt.de',
    is_verified: true,
  },
];

const normalizeName = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const extractJsonObject = (value) => {
  const trimmed = String(value || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');

  if (first === -1 || last === -1 || last <= first) return trimmed;
  return trimmed.slice(first, last + 1);
};

const normalizeReport = (report, vettedPartners) => {
  const verifiedByName = new Map(
    vettedPartners.map((partner) => [normalizeName(partner.company_name), partner]),
  );

  return {
    ...report,
    icp_matches: (report.icp_matches || []).map((match, index) => {
      const verified = verifiedByName.get(normalizeName(match.company_name));
      const scores = match.scores || {};
      const overall =
        Number(scores.overall) ||
        Number(scores.product_fit || 0) +
          Number(scores.market_readiness || 0) +
          Number(scores.strategic_value || 0) +
          Number(scores.accessibility || 0);

      return {
        ...match,
        rank: Number(match.rank) || index + 1,
        is_verified: Boolean(match.is_verified || verified),
        website: match.website || verified?.website || null,
        country: match.country || verified?.country || '',
        sector: match.sector || verified?.sector || '',
        scores: {
          ...scores,
          product_fit: Number(scores.product_fit) || 0,
          market_readiness: Number(scores.market_readiness) || 0,
          strategic_value: Number(scores.strategic_value) || 0,
          accessibility: Number(scores.accessibility) || 0,
          overall,
        },
      };
    }),
  };
};

const getRelevantPartners = (sector, targetMarket, vettedPartners) => {
  const sectorKey = String(sector || '').toLowerCase();
  const marketKey = String(targetMarket || '').toLowerCase();
  const scored = vettedPartners.map((partner) => {
    const partnerSector = String(partner.sector || '').toLowerCase();
    const partnerMarket = String(partner.market || '').toLowerCase();
    let score = 0;

    if (marketKey === 'both' || partnerMarket.includes(marketKey) || marketKey.includes(partnerMarket)) score += 2;
    if (
      sectorKey.includes('clean') && partnerSector.includes('clean') ||
      sectorKey.includes('battery') && partnerSector.includes('battery') ||
      sectorKey.includes('robot') && partnerSector.includes('robot') ||
      sectorKey.includes('mobility') && (partnerSector.includes('mobility') || partnerSector.includes('autonomous')) ||
      sectorKey.includes('consumer') && partnerSector.includes('consumer') ||
      sectorKey.includes('software') && partnerSector.includes('software')
    ) {
      score += 4;
    }

    return { partner, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ partner }) => partner)
    .slice(0, 5);
};

const mergeStarterPartners = (partners) => {
  const seen = new Set();
  return [...STARTER_PARTNERS, ...partners].filter((partner) => {
    const key = normalizeName(partner.company_name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const createFallbackReport = (profile, vettedPartners, reason = 'orbit_unavailable') => {
  const {
    company_name,
    product_description,
    business_model,
    target_market,
    sector,
    company_stage,
    biggest_concern,
  } = profile;
  const partners = getRelevantPartners(sector, target_market, vettedPartners);
  const partnerMatches = [
    ...partners,
    {
      company_name: 'Krannich Solar',
      sector: 'Clean Energy',
      market: 'Europe',
      country: 'Germany',
      website: 'https://www.krannich-solar.com',
      is_verified: false,
    },
    {
      company_name: 'Octopus Energy Services',
      sector: 'Clean Energy',
      market: 'Europe',
      country: 'UK',
      website: 'https://octopus.energy',
      is_verified: false,
    },
  ].slice(0, 5);

  const report = normalizeReport(
    {
      company_summary: {
        name: company_name,
        one_line_pitch: `${company_name} helps Western ${sector || 'technology'} buyers adopt ${product_description} through a ${business_model || 'B2B'} partnership model.`,
        market_readiness_score: 76,
        market_readiness_label: company_stage === 'Seed' ? 'Early Stage' : 'Ready',
        critical_insight: `The fastest path into ${target_market || 'Western markets'} is not broad expansion; it is proving compliance, local support, and one credible reference partner before scaling outreach.`,
      },
      icp_matches: partnerMatches.map((partner, index) => {
        const base = [88, 84, 81, 78, 75][index] || 74;
        return {
          rank: index + 1,
          company_name: partner.company_name,
          is_verified: Boolean(partner.is_verified),
          website: partner.website || null,
          country: partner.country || (partner.market === 'North America' ? 'USA' : 'Germany'),
          sector: partner.sector || sector,
          company_size: index < 2 ? '1,000-5,000 employees' : '200-1,000 employees',
          why_they_match: `${partner.company_name} is relevant because it already operates in the channel where ${company_name} needs early validation. The fit is strongest if ${company_name} leads with compliance evidence, delivery reliability, and a low-friction pilot rather than a generic supplier pitch.`,
          decision_maker_title: index < 2 ? 'Strategic Procurement Manager' : 'Head of Partnerships',
          buying_trigger: biggest_concern
            ? `Their likely objection mirrors your stated concern: ${biggest_concern}. A clear certification and pilot plan can turn that risk into the opening conversation.`
            : 'Western buyers are diversifying suppliers while protecting quality, certification, and after-sales reliability.',
          buying_signal_status: index < 2 ? 'warm' : 'cool',
          scores: {
            product_fit: Math.min(25, 22 - Math.floor(index / 2)),
            market_readiness: Math.min(25, 21 - Math.floor(index / 2)),
            strategic_value: Math.min(25, 23 - index),
            accessibility: Math.min(25, 22 - index * 2),
            overall: base,
          },
          first_move: `Send a concise partner email to ${partner.company_name} with a one-page technical dossier, certification roadmap, and a proposed 20-minute pilot-fit call this week.`,
        };
      }),
      competitor_intelligence: [
        {
          rank: 1,
          company_name: sector?.includes('Battery') || sector?.includes('Clean') ? 'Pylontech' : 'Bosch Rexroth',
          country: sector?.includes('Battery') || sector?.includes('Clean') ? 'China/Europe' : 'Germany',
          what_they_sell: sector?.includes('Battery') || sector?.includes('Clean')
            ? 'Residential and commercial LFP battery storage systems sold through European distributors'
            : 'Industrial automation, robotics and motion-control systems for European manufacturers',
          who_they_target: 'Distributors, system integrators, installers, and enterprise procurement teams',
          positioning: 'Bankable, proven supplier with existing Western channel trust.',
          pricing_signal: 'Mid-market to premium depending on configuration and channel',
          weakness: 'Large incumbents are slower to customize and less flexible for niche pilots; a Chinese startup can win with responsiveness, economics, and partner-specific engineering.',
          threat_level: 'High',
        },
        {
          rank: 2,
          company_name: sector?.includes('Battery') || sector?.includes('Clean') ? 'BYD Energy Storage' : 'ABB Robotics',
          country: sector?.includes('Battery') || sector?.includes('Clean') ? 'China/Germany' : 'Switzerland',
          what_they_sell: 'Integrated energy or automation systems with strong certification and enterprise credibility',
          who_they_target: 'Premium installers, OEMs, utilities, and enterprise operators',
          positioning: 'Trusted global brand with strong service coverage and technical documentation.',
          pricing_signal: 'Premium',
          weakness: 'Premium brands leave room for cost-effective, modular, and faster-customized alternatives if compliance is credible.',
          threat_level: 'High',
        },
        {
          rank: 3,
          company_name: sector?.includes('Clean') ? 'VARTA' : 'Siemens',
          country: 'Germany',
          what_they_sell: 'Western-market hardware and software systems with localized support',
          who_they_target: 'Enterprise buyers and channel partners that prefer local vendors',
          positioning: 'Local trust, documentation, and perceived lower execution risk.',
          pricing_signal: 'Premium or upper-mid market',
          weakness: 'Higher cost and slower iteration can be challenged with a tightly scoped pilot and strong after-sales plan.',
          threat_level: 'Medium',
        },
      ],
      action_plan: {
        market_entry_timeline: '6-9 months',
        weeks: [
          {
            period: 'Week 1-2',
            theme: 'Compliance & Beachhead Definition',
            actions: [
              `Create a compliance gap matrix for ${target_market || 'the target market'} covering certifications, documentation, labels, warranties, and import requirements.`,
              'Pick one beachhead segment and one country instead of selling to all Western buyers at once.',
              'Prepare a buyer-ready technical dossier with product specs, safety evidence, QA process, and pilot assumptions.',
            ],
            milestone: 'A clear compliance roadmap and first target segment are documented.',
          },
          {
            period: 'Week 3-4',
            theme: 'Partner Targeting',
            actions: [
              'Build a shortlist of 30 partner accounts by channel type: distributors, integrators, OEMs, and strategic reference customers.',
              'Map procurement, technical, and partnership decision makers for the top 10 accounts.',
              'Create three outreach variants: procurement-led, technical-led, and partnership-led.',
            ],
            milestone: 'Top accounts and decision makers are ready for outbound.',
          },
          {
            period: 'Week 5-6',
            theme: 'Pilot Offer',
            actions: [
              'Define a low-risk pilot package with sample terms, support SLA, test criteria, and success metrics.',
              'Prepare localized English materials and one market-specific version for the first country.',
              'Start outreach to the first 10 accounts and track objections by category.',
            ],
            milestone: 'At least five qualified partner conversations are active.',
          },
          {
            period: 'Week 7-8',
            theme: 'Technical Validation',
            actions: [
              'Send samples or technical files under NDA to the most qualified prospects.',
              'Run joint review calls with procurement and engineering stakeholders.',
              'Turn repeated objections into FAQ content and updated sales materials.',
            ],
            milestone: 'Two prospects enter technical evaluation or pilot negotiation.',
          },
          {
            period: 'Week 9-10',
            theme: 'Commercial Setup',
            actions: [
              'Finalize landed cost, warranty terms, payment structure, and pilot volume assumptions.',
              'Identify local service, logistics, or installation partners needed to reduce buyer risk.',
              'Negotiate one pilot agreement with a clear next-step conversion path.',
            ],
            milestone: 'A pilot agreement is drafted or in final review.',
          },
          {
            period: 'Week 11-12',
            theme: 'Board-Ready Market Entry Decision',
            actions: [
              'Summarize traction, objections, conversion probability, and market entry budget.',
              'Decide whether to double down on the beachhead, adjust the segment, or pause for certification work.',
              'Create the next 6-month operating plan for sales, compliance, support, and partner management.',
            ],
            milestone: 'Leadership has a clear go/no-go decision and execution plan.',
          },
        ],
        first_action_tomorrow: `Book a compliance or channel expert call for ${target_market || 'the target market'} and validate the top three blockers before sending broad partner outreach.`,
      },
      risk_assessment: [
        {
          rank: 1,
          risk_title: 'Certification and compliance delay',
          risk_type: 'Regulatory',
          severity: 'Critical',
          description: `For ${company_name}, Western buyers will treat certification and documentation as a gating item, not a detail. If the company cannot show a credible pathway, procurement conversations will stall even when product interest is real.`,
          probability: 'High',
          mitigation: 'Use a local certification advisor, make a document checklist, and only promise pilots where the compliance path is explicit.',
          cost_of_ignoring: 'Lost pilot deals, 6-12 months of wasted outreach, and reputational damage with early reference accounts.',
        },
        {
          rank: 2,
          risk_title: 'Undifferentiated Chinese supplier positioning',
          risk_type: 'Competitive',
          severity: 'High',
          description: 'Western buyers already compare Asian suppliers on price, reliability, and certifications. A generic pitch makes the company easy to dismiss against larger incumbents.',
          probability: 'High',
          mitigation: 'Lead with a specific wedge: customization speed, modularity, certified quality process, or better economics for one channel.',
          cost_of_ignoring: 'Long sales cycles, price pressure, and low reply rates from serious partners.',
        },
        {
          rank: 3,
          risk_title: 'No local support model',
          risk_type: 'Operational',
          severity: 'High',
          description: 'Partner buyers need confidence that warranty, spare parts, escalation, and technical questions can be handled locally or quickly. Without this, late-stage deals can collapse after technical interest.',
          probability: 'Medium',
          mitigation: 'Define support SLA, documentation, spare-parts process, and a local service/logistics partner before pilot launch.',
          cost_of_ignoring: 'Higher buyer risk perception, delayed purchase orders, and lower-quality channel partners.',
        },
      ],
    },
    vettedPartners,
  );

  return {
    ...report,
    _meta: {
      source: 'fallback',
      reason,
      model: 'gpt-5.4',
    },
  };
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405);
  }

  const body = await req.json();
  const {
    company_name,
    product_description,
    business_model,
    target_market,
    sector,
    company_stage,
    biggest_concern,
  } = body;

  if (!company_name || !product_description || !sector) {
    return json({ error: 'Missing required fields' }, 400);
  }

  const orbitKey = process.env.ORBIT_API_KEY;

  let vettedPartners = [];
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/partners?select=*&limit=20`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      const data = await res.json();
      if (Array.isArray(data)) vettedPartners = data;
    }
  } catch {
    vettedPartners = [];
  }

  vettedPartners = mergeStarterPartners(vettedPartners);

  if (!orbitKey) {
    return json(createFallbackReport(body, vettedPartners, 'missing_orbit_api_key'));
  }

  const SYSTEM_PROMPT = `You are WestReady, an elite GTM strategist specialized
in helping Chinese startups enter Western markets. You think like a McKinsey
partner who has spent 10 years advising Chinese companies on Western market entry.

VETTED PARTNERS DATABASE (verified real companies - prioritize these as ICP matches,
set "is_verified": true for any that match the sector and market):
${JSON.stringify(vettedPartners)}

BEHAVIOR RULES:
- Return ONLY valid JSON. No markdown fences, no preamble, no explanation.
- Every insight must be specific to this exact company. No generic advice.
- Use web knowledge about real Western companies - specific names, not placeholders.
- All score fields must be numbers, not strings.
- For icp_matches: list vetted partners first if sector matches, then add
  AI-generated matches to reach 5 total. Set is_verified: false for AI-generated.

TINDER SCORING SYSTEM:
Score each ICP match across 4 dimensions, 0-25 each:
- product_fit: How precisely does their procurement need match this product?
- market_readiness: Are they actively buying this category right now?
- strategic_value: Is winning them a reference that opens 10 more doors?
- accessibility: Can a Chinese startup realistically reach and close them?
overall = sum of all 4, 0-100.

BUYING SIGNAL CLASSIFICATION:
"hot" = Active tender, job posting for procurement role, or public sourcing statement
"warm" = Recent funding, expansion announcement, or competitor made similar purchase
"cool" = General market growth signal only
"none" = No active signal detected

REQUIRED JSON SCHEMA - follow exactly, no deviations:
{
  "company_summary": {
    "name": "string",
    "one_line_pitch": "string - how this company should introduce itself in Western markets",
    "market_readiness_score": number,
    "market_readiness_label": "Not Ready | Early Stage | Ready | Well Positioned",
    "critical_insight": "string - the single most important thing they must understand"
  },
  "icp_matches": [
    {
      "rank": number,
      "company_name": "string - real company name",
      "is_verified": boolean,
      "website": "string - real URL or null",
      "country": "string",
      "sector": "string",
      "company_size": "string e.g. 200-500 employees",
      "why_they_match": "string - 2 sentences, specific and evidence-based",
      "decision_maker_title": "string - exact job title of purchase decision maker",
      "buying_trigger": "string - specific event or pain creating urgency now",
      "buying_signal_status": "hot | warm | cool | none",
      "scores": {
        "product_fit": number,
        "market_readiness": number,
        "strategic_value": number,
        "accessibility": number,
        "overall": number
      },
      "first_move": "string - exact action to take to reach this company this week"
    }
  ],
  "competitor_intelligence": [
    {
      "rank": number,
      "company_name": "string - real Western competitor",
      "country": "string",
      "what_they_sell": "string",
      "who_they_target": "string",
      "positioning": "string - their value proposition",
      "pricing_signal": "string or null",
      "weakness": "string - specific gap the Chinese company can exploit",
      "threat_level": "Low | Medium | High | Critical"
    }
  ],
  "action_plan": {
    "market_entry_timeline": "string e.g. 6-9 months",
    "weeks": [
      {
        "period": "string e.g. Week 1-2",
        "theme": "string e.g. Foundation & Intelligence",
        "actions": ["string", "string", "string"],
        "milestone": "string - what must be true by end of this period"
      }
    ],
    "first_action_tomorrow": "string - single most important action in next 24 hours"
  },
  "risk_assessment": [
    {
      "rank": number,
      "risk_title": "string",
      "risk_type": "Regulatory | Cultural | Competitive | Operational",
      "severity": "Low | Medium | High | Critical",
      "description": "string - why this risk is real for this specific company",
      "probability": "Low | Medium | High",
      "mitigation": "string - specific steps to prevent or reduce this risk",
      "cost_of_ignoring": "string - financial and strategic consequences"
    }
  ]
}`;

  const USER_PROMPT = `Analyze this Chinese startup and generate the complete
Market Entry Intelligence Report.

COMPANY PROFILE:
Name: ${company_name}
Product: ${product_description}
Business Model: ${business_model}
Target Market: ${target_market}
Sector: ${sector}
Stage: ${company_stage}
Biggest Concern: ${biggest_concern}

Generate: 5 icp_matches (vetted partners first), 3 competitor_intelligence entries,
6 action_plan weeks (Week 1-2 through Week 11-12), 3 risk_assessment entries.
Return ONLY the JSON object. Nothing else.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 28000);
    const response = await fetch('https://aiapi.orbitai.global/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${orbitKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: USER_PROMPT },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return json(createFallbackReport(body, vettedPartners, `orbit_http_${response.status}`));
    }

    const aiData = await response.json();
    if (!aiData.choices?.[0]?.message?.content) {
      return json(createFallbackReport(body, vettedPartners, 'empty_orbit_response'));
    }

    const content = extractJsonObject(aiData.choices[0].message.content);
    const report = {
      ...normalizeReport(JSON.parse(content), vettedPartners),
      _meta: {
        source: 'ai',
        endpoint: 'chat/completions',
        model: 'gpt-5.4',
      },
    };

    return json(report);
  } catch (error) {
    return json(
      createFallbackReport(
        body,
        vettedPartners,
        error?.name === 'AbortError' ? 'orbit_timeout' : 'orbit_request_failed',
      ),
    );
  }
}
