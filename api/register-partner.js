const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  // USIAMO I NOMI ESATTI DALLA TUA SCREENSHOT
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return res.status(500).json({ 
      error: "Variabili mancanti!",
      detected_url: url ? "Presente" : "ASSENTE",
      detected_key: key ? "Presente" : "ASSENTE"
    });
  }

  const supabase = createClient(url, key);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { company_name, sector, market, description, website, contact_email } = req.body;

    const { data, error } = await supabase
      .from('partners')
      .insert([{ 
        company_name, 
        sector, 
        market, 
        description, 
        website, 
        contact_email, 
        is_verified: true 
      }])
      .select();

    if (error) throw error;
    return res.status(200).json({ message: 'Success', data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};