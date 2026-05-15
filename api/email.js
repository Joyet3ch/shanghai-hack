export const config = { runtime: 'edge' };

const CULTURAL_CONTEXT = {
  Germany: {
    tone: 'formal, direct, and data-driven. Lead with facts, certifications, and proven results. Avoid hyperbole.',
    greeting: 'Dear Mr./Ms. [Last Name]',
    values: 'Qualitat, Zuverlassigkeit, long-term partnership',
    avoid: 'being too casual, vague claims, rushing to a close',
  },
  France: {
    tone: 'intellectual, slightly formal, relationship-oriented. Build rapport before pitching.',
    greeting: 'Dear Mr./Ms. [Last Name]',
    values: 'innovation, vision, mutual benefit',
    avoid: 'aggressive sales tactics, being too transactional',
  },
  Netherlands: {
    tone: 'direct, pragmatic, efficiency-focused. Get to the point immediately.',
    greeting: 'Dear [First Name]',
    values: 'efficiency, transparency, clear ROI, sustainability',
    avoid: 'vagueness, overpromising, being too formal',
  },
  Italy: {
    tone: 'warm, relationship-first, visionary. Personal connection matters before business.',
    greeting: 'Dear Mr./Ms. [Last Name]',
    values: 'partnership, quality, long-term relationship',
    avoid: 'being cold or purely transactional',
  },
  UK: {
    tone: 'polished, understated, well-reasoned. British business values discretion.',
    greeting: 'Dear [First Name]',
    values: 'reliability, track record, mutual benefit',
    avoid: 'hyperbole, being pushy, overclaiming',
  },
  USA: {
    tone: 'confident, direct, results-oriented. Lead with the outcome and ROI.',
    greeting: 'Hi [First Name]',
    values: 'ROI, speed, competitive advantage, scalability',
    avoid: 'long introductions, burying the value proposition',
  },
};

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ error: 'Method Not Allowed' }, 405);
  }

  const {
    partnerName,
    partnerType,
    country,
    industry,
    userPitch,
    companyName,
    decisionMakerTitle,
    buyingTrigger,
    whyTheyMatch,
  } = await req.json();

  const cultural = CULTURAL_CONTEXT[country] || {
    tone: 'professional and direct',
    greeting: 'Dear [Name]',
    values: 'value and reliability',
    avoid: 'vague claims',
  };

  const SYSTEM_PROMPT = `You are an elite B2B Sales Copywriter with 15 years
experience writing cold outreach emails between Asian companies and Western enterprises.

Your emails succeed because they:
- Open with a specific hook proving you researched this company
- Lead with THEIR interest, not your product features
- Reference their known buying trigger to create urgency
- Never exceed 180 words in the body
- End with ONE ask: a 20-minute discovery call

CULTURAL CALIBRATION FOR ${(country || 'the target market').toUpperCase()}:
Tone: ${cultural.tone}
Greeting style: ${cultural.greeting}
What this market values: ${cultural.values}
Avoid: ${cultural.avoid}

OUTPUT FORMAT - return exactly this structure, nothing else:
Subject: [subject line]

[greeting],

[Opening hook - 1-2 sentences referencing something specific about their company
or their known buying trigger. Must feel researched, not generic.]

[Value paragraph - 2-3 sentences. Who you are, what you do, and ONE specific
reason it is directly relevant to them. Lead with their benefit.]

[Credibility - 1-2 sentences. A specific number, certification, or customer
type that builds trust without bragging.]

[CTA - 1 sentence. Specific, low-friction, time-bounded.]

Best regards,
[Name]
${companyName || '[Company]'}`;

  const USER_PROMPT = `Write a cold outreach email with this context:

FROM: ${companyName || 'our company'} - ${userPitch} - ${industry} sector
TO: ${partnerName} (${partnerType}) in ${country}
DECISION MAKER: ${decisionMakerTitle || 'relevant decision maker'}
WHY THEY MATCH: ${whyTheyMatch || 'they operate in the same sector'}
THEIR BUYING TRIGGER: ${buyingTrigger || 'expanding their product portfolio'}
GOAL: Book a 20-minute discovery call

Make the opening hook reference ${partnerName} specifically.
Keep body under 180 words. One call to action only.`;

  try {
    const response = await fetch('https://aiapi.orbitai.global/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ORBIT_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: USER_PROMPT },
        ],
        temperature: 0.75,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const emailText = data.choices?.[0]?.message?.content?.trim();
    if (!emailText) throw new Error('Empty AI response');

    return json({ text: emailText });
  } catch {
    const fallback = `Subject: Strategic Partnership Opportunity - ${partnerName}

Dear ${partnerName} Team,

I came across ${partnerName}'s work in the ${industry} space and wanted to reach out directly.

We are ${companyName || 'a Chinese startup'} specializing in ${userPitch}. Given your position as a ${partnerType} in ${country}, we believe there is a compelling opportunity to work together.

We have demonstrated strong results in our home market and are now selectively partnering with leading Western companies.

Would you be open to a 20-minute call this week?

Best regards,
[Your Name]
${companyName || ''}`;

    return json({ text: fallback });
  }
}
