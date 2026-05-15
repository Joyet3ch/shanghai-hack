export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { market, industry, prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    // 1. L'Endpoint REALE di Orbit AI
    const orbitEndpoint = 'https://aiapi.orbitai.global/v1/chat/completions'; 
    
    // 2. Chiamata alla VERA Intelligenza Artificiale
    const response = await fetch(orbitEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ORBIT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5.4', // IL MODELLO REALE
        messages: [
          {
            role: 'system',
            content: `You are an expert B2B Matchmaker AI. A Chinese startup wants to expand to ${market} in the ${industry} sector. 
            Based on their prompt, find or simulate 3 perfect local partners (distributors, consultants, suppliers).
            You MUST return ONLY a raw JSON array of 3 objects, without any markdown formatting or extra text. 
            Each object must have these exact keys: "id" (number 1, 2, 3), "name" (string), "type" (string), "country" (string), "score" (number between 75 and 99), and "reason" (string, max 2 sentences explaining why they are a good match).`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      throw new Error(`API failed: ${response.status} - ${errData}`);
    }

    const data = await response.json();
    let rawContent = data.choices[0].message.content.trim();
    
    // 3. Trucco Hacker: Pulizia del Markdown per evitare crash del frontend
    if (rawContent.startsWith('```json')) {
      rawContent = rawContent.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/^```/, '').replace(/```$/, '').trim();
    }

    // 4. Inviamo i dati veri di gpt-5.4 al tuo frontend!
    const matchesArray = JSON.parse(rawContent);
    return res.status(200).json(matchesArray);

  } catch (error) {
    console.error("Orbit AI Error, fallback to paracadute:", error);
    
    // IL PARACADUTE (Ti salva la vita se durante la demo salta il Wi-Fi o l'API)
    const mockMatches = [
      {
        id: 1,
        name: "TechDistribute GmbH",
        type: "Local Distributor",
        country: market === 'Europe' ? "Germany" : "USA",
        score: 94,
        reason: `Perfect match for your ${industry} expansion. They have a strong local network.`
      },
      {
        id: 2,
        name: "Global Compliance Partners",
        type: "Regulatory Consultant",
        country: market === 'Europe' ? "France" : "Canada",
        score: 88,
        reason: "They specialize in getting Chinese products certified for Western markets."
      },
      {
        id: 3,
        name: "SupplyChain Leaders",
        type: "Logistics Partner",
        country: market === 'Europe' ? "Netherlands" : "USA",
        score: 82,
        reason: "Offers localized warehousing, saving you 15% on import tariffs."
      }
    ];

    return res.status(200).json(mockMatches);
  }
}