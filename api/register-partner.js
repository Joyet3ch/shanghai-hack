const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("ERRORE: Variabili Supabase mancanti!");
    return res.status(500).json({ error: "Configuration Error" });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { company_name, sector, market, description, website, contact_email } = req.body;

    const { data, error } = await supabase
      .from('partners')
      .insert([
        { 
          company_name, 
          sector, 
          market, 
          description, 
          website, 
          contact_email,
          is_verified: true 
        }
      ])
      .select();

    if (error) throw error;

    return res.status(200).json({ message: 'Success', data });
  } catch (err) {
    console.error("Crash funzione:", err.message);
    return res.status(500).json({ error: err.message });
  }
};