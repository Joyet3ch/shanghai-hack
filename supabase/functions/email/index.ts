import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestione CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      partnerName, partnerType, country, industry, 
      userPitch, companyName, decisionMakerTitle, 
      buyingTrigger, whyTheyMatch 
    } = await req.json()

    const orbitKey = Deno.env.get('ORBIT_API_KEY')

    // --- Cultural Calibration Logic ---
    const culturalContext: any = {
      Germany: {
        tone: "formal, direct, and data-driven. Lead with facts and technical superiority.",
        greeting: "Dear Mr./Ms. [Last Name]",
        keyValues: "Quality, reliability, long-term commitment",
        redFlags: "Avoid hyperbole and being too casual."
      },
      France: {
        tone: "intellectual and relationship-oriented. French buyers appreciate vision.",
        greeting: "Dear Mr./Ms. [Last Name]",
        keyValues: "innovation, elegance, mutual benefit",
        redFlags: "Avoid aggressive sales tactics."
      },
      USA: {
        tone: "confident, direct, and results-oriented. Lead with ROI.",
        greeting: "Hi [First Name]",
        keyValues: "Speed, ROI, competitive advantage",
        redFlags: "Avoid long introductions."
      },
      UK: {
        tone: "polished, understated, and professional.",
        greeting: "Dear [First Name]",
        keyValues: "track record, reliability",
        redFlags: "Avoid being too pushy or loud."
      }
    }

    const cultural = culturalContext[country] || {
      tone: "professional and respectful.",
      greeting: "Dear [Name]",
      keyValues: "value, reliability",
      redFlags: "Avoid vague claims."
    }

    const SYSTEM_PROMPT = `You are an elite B2B Sales Copywriter. 
    Write a cold email under 200 words. 
    Tone: ${cultural.tone}
    Greeting: ${cultural.greeting}
    Focus: ${cultural.keyValues}
    Avoid: ${cultural.redFlags}
    Output ONLY the email text.`

    const USER_PROMPT = `Write a cold outreach email from ${companyName} (${industry}) to ${partnerName} (${partnerType}) in ${country}.
    Context: ${userPitch}.
    Hook: They are a match because ${whyTheyMatch}. 
    Trigger: Their buying trigger is ${buyingTrigger}.
    Target: Book a 20-minute discovery call.`

    const response = await fetch("https://aiapi.orbitai.global/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${orbitKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5.4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: USER_PROMPT }
        ],
        temperature: 0.7
      })
    })

    const data = await response.json()
    const emailText = data.choices[0].message.content.trim()

    return new Response(JSON.stringify({ text: emailText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})