import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 1. Recupero variabili con i nomi che hai nella dashboard
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;

  // 2. Controllo di sicurezza immediato
  if (!url || !key) {
    console.error("ERRORE CRITICO: Variabili d'ambiente non trovate su Vercel!");
    return res.status(500).json({ 
      error: "Database configuration missing",
      debug: { url_exists: !!url, key_exists: !!key }
    });
  }

  // 3. Inizializzazione interna (previene il crash all'avvio)
  const supabase = createClient(url, key);

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

    if (error) {
      console.error("Errore query Supabase:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Success', data });
  } catch (err) {
    console.error("Crash totale funzione:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}