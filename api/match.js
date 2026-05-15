const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { sector, target_market, company_name, product_description, type } = req.body;

  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    const orbitKey = process.env.ORBIT_API_KEY;

    // Controllo chiave AI
    if (!orbitKey) {
      console.error("ERRORE: Manca la ORBIT_API_KEY su Vercel");
      return res.status(500).json({ error: "Server misconfigured: missing AI key" });
    }

    let vettedPartners = [];
    if (url && key) {
      try {
        const supabase = createClient(url, key);
        const { data } = await supabase.from('partners').select('*').limit(2);
        if (data) vettedPartners = data;
      } catch (dbErr) {
        console.error("Errore DB (ignorato):", dbErr.message);
      }
    }

    let systemPrompt = "You are a GTM Strategist. Respond ONLY with valid JSON. No markdown, no intro.";
    
    // Chiediamo meno dati per non far scattare il timeout di Vercel
    if (type === 'core') {
      systemPrompt += `
      INTERNAL PARTNERS: ${JSON.stringify(vettedPartners)}.
      Schema:
      {
        "company_summary": { "name": "${company_name}", "one_line_pitch": "string", "market_readiness_score": 85, "market_readiness_label": "string", "critical_insight": "string" },
        "icp_matches": [
          { "rank": 1, "company_name": "string", "is_verified": true, "country": "string", "sector": "string", "why_they_match": "string", "decision_maker_title": "string", "buying_trigger": "string", "scores": { "product_fit": 20, "market_readiness": 20, "strategic_value": 20, "accessibility": 20, "overall": 80 } }
        ]
      }
      Generate ONLY 2 icp_matches to save time.`;
    } else {
      systemPrompt += `
      Schema:
      {
        "competitor_intelligence": [ { "company_name": "string", "country": "string", "what_they_sell": "string", "threat_level": "string", "weakness": "string" } ],
        "risk_assessment": [ { "risk_title": "string", "description": "string", "mitigation": "string" } ]
      }
      Generate ONLY 2 items per array.`;
    }

    const userPrompt = `Company: ${company_name}. Sector: ${sector}. Target: ${target_market}. Product: ${product_description}`;

    // Timer di 8 secondi: Vercel stacca a 10s, noi blocchiamo prima per evitare il crash totale
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8500); 

    const response = await fetch("https://aiapi.orbitai.global/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${orbitKey}` },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages: [
          { role: "system", content: systemPrompt }, 
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Orbit AI Error: ${errText}`);
    }

    const aiData = await response.json();
    let content = aiData.choices[0].message.content;
    
    // Pulizia JSON
    content = content.replace(/^```json/, '').replace(/```$/, '').trim();
    
    const parsedData = JSON.parse(content);
    return res.status(200).json(parsedData);

  } catch (e) {
    console.error("Errore API:", e.message);
    return res.status(500).json({ error: `Errore: ${e.message}` });
  }
};