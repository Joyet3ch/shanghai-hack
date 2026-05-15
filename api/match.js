export const config = { runtime: 'edge' };

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

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
  if (!orbitKey) {
    return json({ error: 'API key not configured' }, 500);
  }

  let vettedPartners = [];
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

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
    });

    if (!response.ok) {
      return json({ error: `AI API error: ${response.status}` }, 502);
    }

    const aiData = await response.json();
    if (!aiData.choices?.[0]?.message?.content) {
      return json({ error: 'Empty AI response' }, 502);
    }

    const content = aiData.choices[0].message.content
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    return json(JSON.parse(content));
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
