export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { 
    company_name, 
    product_description, 
    business_model, 
    target_market, 
    sector, 
    company_stage, 
    biggest_concern 
  } = req.body;

  const userPrompt = `
    Analyze the following Chinese startup and generate a 
    complete Western Market Entry Intelligence Report.
    
    You are a GTM Strategist. 
    INTERNAL DATABASE PARTNERS (PRIORITIZE THESE): ${JSON.stringify(vettedPartners)}.
    
    If these internal partners match the industry, list them first and set "is_verified": true. 
    Then use web search to find more companies to complete a report of 5 total partners. For web-found partners, set "is_verified": false.

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    COMPANY PROFILE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Company Name:      ${company_name}
    Product/Service:   ${product_description}
    Business Model:    ${business_model}
    Target Market:     ${target_market}
    Sector:            ${sector}
    Company Stage:     ${company_stage}
    Biggest Concern:   ${biggest_concern}
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    Return a single valid JSON object. SCHEMA:
    {
      "company_summary": { "name": "string", "one_line_pitch": "string", "market_readiness_score": number, "market_readiness_label": "string", "critical_insight": "string" },
      "icp_matches": [
        {
          "rank": number,
          "company_name": "string",
          "is_verified": boolean,
          "website": "string",
          "country": "string",
          "sector": "string",
          "company_size": "string",
          "why_they_match": "string",
          "decision_maker_title": "string",
          "buying_trigger": "string",
          "scores": { "product_fit": number, "market_readiness": number, "strategic_value": number, "accessibility": number, "overall": number },
          "first_move": "string"
        }
      ],
      "competitor_intelligence": [...],
      "action_plan": {...},
      "risk_assessment": [...]
    }
  `;

  try {
    const response = await fetch("https://aiapi.orbitai.global/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ORBIT_API_KEY}` 
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages: [
          { 
            role: "system", 
            content: "You are a Strategic Market Intelligence Bot. You provide data-driven reports in strict JSON format. Use web search to find REAL companies and competitors in the target market." 
          },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2 // Bassa temperatura per maggiore precisione nel JSON
      })
    });

    if (!response.ok) throw new Error('Orbit API Error');

    const data = await response.json();
    let rawContent = data.choices[0].message.content.trim();
    
    // Pulizia da eventuali backticks markdown
    rawContent = rawContent.replace(/^```json/, '').replace(/```$/, '').trim();

    const report = JSON.parse(rawContent);
    return res.status(200).json(report);

  } catch (error) {
    console.error("Match API Error:", error);
    return res.status(500).json({ error: "Failed to generate Intelligence Report" });
  }
}