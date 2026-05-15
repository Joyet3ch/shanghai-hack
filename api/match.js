const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    company_name,
    product_description,
    business_model,
    target_market,
    sector,
    company_stage,
    biggest_concern
  } = req.body;

  // ── Validate required fields ──────────────────────────────
  if (!company_name || !product_description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // ── Fetch vetted partners from Supabase ───────────────────
    let vettedPartners = [];
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    if (url && key) {
      const supabase = createClient(url, key);
      const { data } = await supabase
        .from('partners')
        .select('*')
        .limit(20); // ← was 2, needs to be higher
      if (data) vettedPartners = data;
    }

    // ── System Prompt ─────────────────────────────────────────
    const systemPrompt = `You are WestReady, an elite GTM strategist 
specialized in helping Chinese startups enter Western markets.

VETTED PARTNERS DATABASE (prioritize these as ICP matches, 
set is_verified: true for them):
${JSON.stringify(vettedPartners)}

RULES:
- Return ONLY valid JSON. No markdown, no backticks, no explanation.
- Be specific. Every insight must be tailored to this exact company.
- For icp_matches: use vetted partners first if they match the sector,
  then add AI-generated matches to reach 5 total.
- All scores are numbers, not strings.

REQUIRED JSON SCHEMA — follow exactly:
{
  "company_summary": {
    "name": "string",
    "one_line_pitch": "string",
    "market_readiness_score": number (0-100),
    "market_readiness_label": "string",
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
      "scores": {
        "product_fit": number (0-25),
        "market_readiness": number (0-25),
        "strategic_value": number (0-25),
        "accessibility": number (0-25),
        "overall": number (0-100)
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
      "threat_level": "Low or Medium or High or Critical"
    }
  ],
  "action_plan": {
    "market_entry_timeline": "string",
    "weeks": [
      {
        "period": "string (e.g. Week 1-2)",
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
      "risk_type": "Regulatory or Cultural or Competitive or Operational",
      "severity": "Low or Medium or High or Critical",
      "description": "string",
      "probability": "Low or Medium or High",
      "mitigation": "string",
      "cost_of_ignoring": "string"
    }
  ]
}`;

    // ── User Prompt — full company context ───────────────────
    const userPrompt = `Analyze this Chinese startup and generate 
the complete Market Entry Intelligence Report.

COMPANY PROFILE:
- Name: ${company_name}
- Product: ${product_description}
- Business Model: ${business_model}
- Target Market: ${target_market}
- Sector: ${sector}
- Stage: ${company_stage}
- Biggest Concern: ${biggest_concern}

Generate exactly 5 icp_matches, 3 competitor_intelligence entries,
6 weeks in action_plan, and 3 risk_assessment entries.
Return ONLY the JSON object. Nothing else.`;

    // ── Call OrbitAI API ──────────────────────────────────────
    const orbitKey = process.env.ORBIT_API_KEY;
    if (!orbitKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await fetch(
      "https://aiapi.orbitai.global/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${orbitKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2
        })
      }
    );

    // ── Validate API response ─────────────────────────────────
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OrbitAI error:", response.status, errorText);
      return res.status(502).json({
        error: `AI API returned ${response.status}`
      });
    }

    const aiData = await response.json();

    // ── Check choices exists ──────────────────────────────────
    if (!aiData.choices || !aiData.choices[0]) {
      console.error("No choices in response:", JSON.stringify(aiData));
      return res.status(502).json({ error: 'Invalid AI response structure' });
    }

    // ── Clean and parse JSON ──────────────────────────────────
    let content = aiData.choices[0].message.content.trim();
    content = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let report;
    try {
      report = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON parse failed. Raw content:", content.slice(0, 500));
      return res.status(500).json({
        error: 'AI returned invalid JSON. Try again.'
      });
    }

    return res.status(200).json(report);

  } catch (e) {
    console.error("Match API error:", e.message);
    return res.status(500).json({ error: e.message });
  }
};