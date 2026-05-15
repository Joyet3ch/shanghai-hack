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

    Using web search to find real, current companies and 
    market data, generate the following 4 sections. 
    Return your response as a single valid JSON object 
    with no additional text, no markdown code blocks, 
    and no preamble.

    {
      "company_summary": {
        "name": "string",
        "one_line_pitch": "string",
        "market_readiness_score": number,
        "market_readiness_label": "string",
        "critical_insight": "string"
      },
      "icp_matches": [
        {
          "rank": number,
          "company_name": "string",
          "country": "string",
          "sector": "string",
          "company_size": "string",
          "why_they_match": "string",
          "decision_maker_title": "string",
          "buying_trigger": "string",
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
          "pricing_signal": "string",
          "weakness": "string",
          "threat_level": "string"
        }
      ],
      "action_plan": {
        "market_entry_timeline": "string",
        "weeks": [
          {
            "period": "string",
            "theme": "string",
            "actions": ["string"],
            "milestone": "string"
          }
        ],
        "first_action_tomorrow": "string"
      },
      "risk_assessment": [
        {
          "rank": number,
          "risk_title": "string",
          "risk_type": "string",
          "severity": "string",
          "description": "string",
          "probability": "string",
          "mitigation": "string",
          "cost_of_ignoring": "string"
        }
      ]
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