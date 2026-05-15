export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { partnerName, partnerType, country, industry, userPitch } = req.body;

  try {
    const orbitEndpoint = 'https://aiapi.orbitai.global/v1/chat/completions'; 
    
    const response = await fetch(orbitEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ORBIT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5.4',
        messages: [
          {
            role: 'system',
            content: `You are a professional GTM Consultant. Write a high-conversion cold outreach email from a Chinese startup CEO to a potential Western partner.
            Partner Name: ${partnerName}
            Type: ${partnerType}
            Country: ${country}
            Startup Sector: ${industry}
            Context: ${userPitch}

            Rules:
            1. Language: English (as per hackathon requirements [cite: 59]).
            2. Tone: Professional, culturally adapted for ${country}.
            3. Subject Line: Must be catchy and professional.
            4. Content: Mention why they are a great match and propose a short discovery call.
            5. Formatting: Return the email with clear 'Subject:' and 'Body:' sections.`
          }
        ],
        temperature: 0.8,
      })
    });

    const data = await response.json();
    return res.status(200).json({ text: data.choices[0].message.content });

  } catch (error) {
    return res.status(500).json({ text: "Dear " + partnerName + ",\n\nWe are a startup in the " + industry + " sector interested in your services as a " + partnerType + " in " + country + ". Let's connect!" });
  }
}