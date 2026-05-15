import { createClient } from '@supabase/supabase-js';

// Inizializzazione client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Permetti solo richieste POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { company_name, sector, market, description, website, contact_email } = req.body;

  try {
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
          is_verified: true // Li marchiamo come verificati di default per la demo
        }
      ]);

    if (error) {
      console.error("Errore Supabase:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Success', data });
  } catch (err) {
    console.error("Errore Server:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}