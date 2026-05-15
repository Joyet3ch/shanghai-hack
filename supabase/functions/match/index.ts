import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      company_name, 
      product_description, 
      business_model, 
      target_market, 
      sector, 
      company_stage, 
      biggest_concern 
    } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ""
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ""
    const orbitKey = Deno.env.get('ORBIT_API_KEY')

    // 1. RECUPERO PARTNER DAL DATABASE (Internal Intelligence)
    const supabase = createClient(supabaseUrl, supabaseKey)
    let vettedPartners = []
    const { data } = await supabase
      .from('partners')
      .select('*')
      .or(`sector.eq."${sector}",sector.ilike."%${sector}%"`) // Ricerca flessibile
      .limit(10)
    if (data) vettedPartners = data

    // 2. COSTRUZIONE DEL MEGA PROMPT
    const userPrompt = `
      Analyze the following Chinese startup and generate a complete Western Market Entry Intelligence Report.
      
      You are a Senior GTM Strategist. 
      INTERNAL DATABASE PARTNERS (MANDATORY PRIORITY): ${JSON.stringify(vettedPartners)}.
      
      CRITICAL INSTRUCTIONS:
      1. PREFERENCE LOGIC: You MUST prioritize the INTERNAL DATABASE PARTNERS if they have even a partial match with the sector or product. 
      2. VERIFICATION: For any partner taken from the INTERNAL DATABASE, set "is_verified": true.
      3. SUPPLEMENT: Use your internal knowledge and web search to find additional REAL companies to reach exactly 5 total partners. For these external companies, set "is_verified": false.
      4. STRATEGY: At equal score, always prefer the internal database partner.

      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      COMPANY PROFILE
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      Company Name:      ${company_name}
      Product/Service:   ${product_description}
      Business Model:    ${business_model || 'N/A'}
      Target Market:     ${target_market}
      Sector:            ${sector}
      Company Stage:     ${company_stage}
      Biggest Concern:   ${biggest_concern || 'Market entry barriers'}
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

      Return a single valid JSON object. STRICT SCHEMA:
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
        "competitor_intelligence": [
          { "company_name": "string", "country": "string", "what_they_sell": "string", "threat_level": "string", "weakness": "string" }
        ],
        "action_plan": {
          "phase_1": "string",
          "phase_2": "string",
          "phase_3": "string"
        },
        "risk_assessment": [
          { "risk_title": "string", "description": "string", "mitigation": "string" }
        ]
      }
    `;

    // 3. CHIAMATA A ORBIT AI (GPT-5.4 / High Intelligence)
    const response = await fetch("https://aiapi.orbitai.global/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${orbitKey}` 
      },
      body: JSON.stringify({
        model: "gpt-5.4",
        messages: [
          { 
            role: "system", 
            content: "You are a Strategic Market Intelligence Bot. You provide data-driven reports in strict JSON format. Use web search to find REAL companies and competitors in the target market. Never hallucinate websites." 
          },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) throw new Error('Orbit API Error');

    const dataAI = await response.json();
    let rawContent = dataAI.choices[0].message.content.trim();
    
    // Pulizia JSON dai markdown backticks
    rawContent = rawContent.replace(/^```json/, '').replace(/```$/, '').trim();

    return new Response(rawContent, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})