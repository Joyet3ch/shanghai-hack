import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase is not configured' });
  }

  const authHeader = req.headers.authorization;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });

  try {
    const {
      company_name,
      sector,
      market,
      country,
      description,
      website,
      contact_email,
    } = req.body;

    if (!company_name || !sector || !market) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('partners')
      .insert([
        {
          company_name,
          sector,
          market,
          country,
          description,
          website,
          contact_email,
          is_verified: true,
        },
      ])
      .select();

    if (error) throw error;

    return res.status(200).json({
      message: 'Partner registered successfully',
      data,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
