const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { sector, target_market, company_name, product_description, type } = req.body;

  try {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;
    const orbitKey = process.env.ORBIT_API_KEY;

    let vettedPartners = [];
    if (url && key) {
      const supabase = createClient(url, key);
      const { data } = await supabase.from('partners').select('*').limit(2);
      if (data) vettedPartners = data;
    }

    // DIVIDIAMO IL PROMPT IN BASE ALLA RICHIESTA
    let systemPrompt = "";
    if (type === 'core') {
      systemPrompt = `You are a GTM Strategist. INTERNAL PARTNERS: ${JSON.stringify(vettedPartners)}. 
      Return ONLY a JSON with "company_summary" and "icp_matches" (max 3 matches to be fast).`;
    } else {
      systemPrompt = `You are a GTM Strategist. 
      Return ONLY a JSON with "competitor_intelligence" (max 2) and "risk_assessment" (max 2).`;
    }

    const userPrompt = `Generate report for ${company_name}. Sector: ${sector}. Return ONLY valid JSON.`;

    const response = await fetch("https://aiapi.orbitai.global/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${orbitKey}` },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.2
      })
    });

    const aiData = await response.json();
    let content = aiData.choices[0].message.content;
    content = content.replace(/^```json/, '').replace(/```$/, '').trim();
    
    return res.status(200).json(JSON.parse(content));

  } catch (e) {
    console.error("Errore AI:", e.message);
    return res.status(500).json({ error: e.message });
  }
};