import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestione CORS (per permettere al browser di chiamare la funzione)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sector, target_market, company_name, product_description, type, company_stage } = await req.json()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? "" // Usiamo la service role per leggere tutto
    const orbitKey = Deno.env.get('ORBIT_API_KEY')

    // 1. RICERCA PARTNER REALI NEL TUO DB
    const supabase = createClient(supabaseUrl, supabaseKey)
    let vettedPartners = []
    const { data } = await supabase
      .from('partners')
      .select('*')
      .eq('sector', sector) // Filtriamo per il settore scelto dall'utente
      .limit(5)
    if (data) vettedPartners = data

    // 2. COSTRUZIONE DEL MEGA PROMPT (Senza limiti di tempo!)
    let systemPrompt = `You are a Senior GTM Strategist specializing in Chinese Tech expansion to Western Markets.
    Your goal is to provide a high-value, professional intelligence report.
    Respond ONLY with a valid JSON object. No prose, no markdown code blocks.`;

    let specificInstructions = "";

    if (type === 'summary') {
      specificInstructions = `Analyze the startup ${company_name} (${company_stage}).
      Provide a deep analysis of their market positioning in ${target_market}.
      Required JSON structure:
      {
        "company_summary": {
          "name": "${company_name}",
          "one_line_pitch": "A sophisticated one-line value proposition",
          "market_readiness_score": number (0-100),
          "market_readiness_label": "e.g. READY / CAUTIOUS / HIGH POTENTIAL",
          "critical_insight": "A non-obvious strategic insight about entering ${target_market} for this specific tech"
        }
      }`;
    } else if (type === 'partners') {
      specificInstructions = `Matchmaker role. Database of vetted partners: ${JSON.stringify(vettedPartners)}.
      Find the 3 best possible partners in ${target_market}. If any from the database match, prioritize them and set "is_verified": true.
      For each match, calculate a detailed score.
      Required JSON structure:
      {
        "icp_matches": [
          {
            "rank": number,
            "company_name": "string",
            "is_verified": boolean,
            "country": "string",
            "sector": "string",
            "why_they_match": "Detailed explanation of strategic synergy",
            "decision_maker_title": "Specific job title to target",
            "buying_trigger": "What event makes them need this tech right now?",
            "scores": { "product_fit": 0-25, "market_readiness": 0-25, "strategic_value": 0-25, "accessibility": 0-25, "overall": 0-100 }
          }
        ]
      }`;
    } else {
      specificInstructions = `Deep Risk and Competitor Analysis.
      Identify 2 direct competitors and 2 strategic risks (Regulatory, Cultural, or Technical).
      Provide a specific mitigation for each risk.
      Required JSON structure:
      {
        "competitor_intelligence": [
          { "company_name": "string", "country": "string", "what_they_sell": "string", "threat_level": "High/Med", "weakness": "Their main strategic gap" }
        ],
        "risk_assessment": [
          { "risk_title": "string", "description": "string", "mitigation": "Practical step to overcome this risk" }
        ]
      }`;
    }

    // 3. CHIAMATA A ORBIT AI (Senza AbortController corto!)
    const aiResponse = await fetch("https://aiapi.orbitai.global/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${orbitKey}` },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages: [
          { role: "system", content: systemPrompt + specificInstructions },
          { role: "user", content: `Company: ${company_name}. Tech: ${product_description}. Market: ${target_market}.` }
        ],
        temperature: 0.3 // Leggermente più alto per analisi più creative
      })
    })

    const aiData = await aiResponse.json()
    let content = aiData.choices[0].message.content
    
    // Pulizia rigorosa del JSON (l'IA a volte mette i ```json)
    content = content.replace(/^[^{]*|[^}]*$/g, "") 
    
    return new Response(content, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error("ERRORE EDGE FUNCTION:", error.message)
    // PARACADUTE DI EMERGENZA (Se l'IA fallisce, mandiamo comunque un JSON valido per non rompere il sito)
    return new Response(JSON.stringify({ error: error.message, is_fallback: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Mandiamo 200 per gestire il fallback nel frontend
    })
  }
})