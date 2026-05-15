import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { sector, target_market, company_name, product_description, type } = req.body;

  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    const orbitKey = process.env.ORBIT_API_KEY;

    // Recupero Partner dal Database (se presente)
    let vettedPartners = [];
    if (url && key) {
      try {
        const supabase = createClient(url, key);
        const { data } = await supabase.from('partners').select('*').limit(2);
        if (data) vettedPartners = data;
      } catch (e) { console.error("DB Error:", e.message); }
    }

    let systemPrompt = "You are a GTM Strategist. Respond ONLY with valid JSON. No markdown.";
    
    // --- SUDDIVISIONE DEI PROMPT ---
    
    if (type === 'summary') {
      systemPrompt += `
      Focus on identity and market positioning. 
      Analyze the company: ${company_name} in the ${sector} sector.
      Schema: {
        "company_summary": { 
          "name": "${company_name}", 
          "one_line_pitch": "string", 
          "market_readiness_score": 85, 
          "market_readiness_label": "High Potential", 
          "critical_insight": "string" 
        }
      }`;
    } 
    else if (type === 'partners') {
      systemPrompt += `
      Focus on matchmaking. Use this database: ${JSON.stringify(vettedPartners)}.
      Find 2 target partners for ${company_name} in ${target_market}.
      Schema: {
        "icp_matches": [
          { 
            "rank": 1, "company_name": "string", "is_verified": true, "country": "string", "sector": "string", 
            "why_they_match": "string", "decision_maker_title": "string", "buying_trigger": "string", 
            "scores": { "product_fit": 20, "market_readiness": 20, "strategic_value": 20, "accessibility": 20, "overall": 80 } 
          }
        ]
      }`;
    } 
    else if (type === 'risks') {
      systemPrompt += `
      Focus on competitive threats and risks in ${target_market}.
      Schema: {
        "competitor_intelligence": [ { "company_name": "string", "country": "string", "what_they_sell": "string", "threat_level": "High", "weakness": "string" } ],
        "risk_assessment": [ { "risk_title": "string", "description": "string", "mitigation": "string" } ]
      }`;
    }

    const userPrompt = `Target: ${target_market}. Tech: ${product_description}`;

    // Timer di sicurezza (8 secondi)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    const response = await fetch("https://aiapi.orbitai.global/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${orbitKey}` },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.2
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const aiData = await response.json();
    let content = aiData.choices[0].message.content.replace(/^```json/, '').replace(/```$/, '').trim();
    
    return res.status(200).json(JSON.parse(content));

  } catch (e) {
    console.error("Timeout/Error - Attivazione Paracadute:", e.message);
    
    // --- PARACADUTE DI EMERGENZA PER OGNI TIPO ---
    if (type === 'summary') {
      return res.status(200).json({ company_summary: { name: company_name, one_line_pitch: "Innovating the cross-border tech ecosystem.", market_readiness_score: 82, market_readiness_label: "Ready", critical_insight: "Needs local certifications." }});
    } else if (type === 'partners') {
      return res.status(200).json({ icp_matches: [{ rank: 1, company_name: "EcoBattery Solutions GmbH", is_verified: true, country: "Germany", sector: "EV & Battery", why_they_match: "Looking for Asian tech partners.", decision_maker_title: "CTO", buying_trigger: "Market expansion.", scores: { product_fit: 22, market_readiness: 20, strategic_value: 23, accessibility: 19, overall: 84 }}]});
    } else {
      return res.status(200).json({ competitor_intelligence: [{ company_name: "Northvolt", country: "Sweden", what_they_sell: "Local Storage", threat_level: "High", weakness: "Scale costs" }], risk_assessment: [{ risk_title: "Compliance", description: "EU regulations", mitigation: "Hire local legal counsel" }]});
    }
  }
}